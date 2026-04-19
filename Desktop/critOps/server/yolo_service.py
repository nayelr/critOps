#!/usr/bin/env python3
"""
Reads an MJPEG URL (e.g. Pi ustreamer /stream), runs YOLOv8, broadcasts boxes on WebSocket.

  export YOLO_STREAM_URL=http://172.20.10.3:8080/stream
  python yolo_service.py

Or: python yolo_service.py --stream http://172.20.10.3:8080/stream --port 8765
"""
from __future__ import annotations

import argparse
import asyncio
import json
import os
import threading
import time
from contextlib import asynccontextmanager
from typing import Any

import cv2
import uvicorn
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from ultralytics import YOLO

latest: dict[str, Any] = {"boxes": [], "ts": 0.0, "frame_w": 0, "frame_h": 0}
latest_lock = threading.Lock()


def run_inference_loop(stream_url: str, model_name: str, conf: float, infer_interval: float) -> None:
    cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
    if not cap.isOpened():
        print(f"[yolo] Failed to open stream: {stream_url}")
    model = YOLO(model_name)
    print(f"[yolo] Model loaded: {model_name}, stream: {stream_url}")

    while True:
        ok, frame = cap.read()
        if not ok or frame is None:
            time.sleep(0.2)
            cap.release()
            cap = cv2.VideoCapture(stream_url, cv2.CAP_FFMPEG)
            continue

        h, w = frame.shape[:2]
        t0 = time.time()
        results = model(frame, verbose=False, conf=conf)[0]
        boxes: list[dict[str, Any]] = []
        for b in results.boxes:
            xyxy = b.xyxy[0].tolist()
            cls = int(b.cls[0])
            cf = float(b.conf[0])
            name = results.names[cls]
            boxes.append(
                {
                    "x1": xyxy[0] / w,
                    "y1": xyxy[1] / h,
                    "x2": xyxy[2] / w,
                    "y2": xyxy[3] / h,
                    "label": name,
                    "conf": round(cf, 3),
                }
            )

        with latest_lock:
            latest["boxes"] = boxes
            latest["ts"] = time.time()
            latest["frame_w"] = w
            latest["frame_h"] = h

        elapsed = time.time() - t0
        time.sleep(max(0.0, infer_interval - elapsed))


class Hub:
    def __init__(self) -> None:
        self.clients: set[WebSocket] = set()

    async def connect(self, ws: WebSocket) -> None:
        await ws.accept()
        self.clients.add(ws)

    def disconnect(self, ws: WebSocket) -> None:
        self.clients.discard(ws)

    async def broadcast(self, payload: dict) -> None:
        dead: list[WebSocket] = []
        text = json.dumps(payload)
        for ws in self.clients:
            try:
                await ws.send_text(text)
            except Exception:
                dead.append(ws)
        for ws in dead:
            self.clients.discard(ws)


def build_app(args: argparse.Namespace) -> FastAPI:
    @asynccontextmanager
    async def lifespan(app: FastAPI):
        app.state.hub = Hub()
        t = threading.Thread(
            target=run_inference_loop,
            args=(args.stream, args.model, args.conf, args.interval),
            daemon=True,
        )
        t.start()

        async def broadcast_loop() -> None:
            while True:
                await asyncio.sleep(0.1)
                hub = app.state.hub
                if not hub.clients:
                    continue
                with latest_lock:
                    payload = {
                        "boxes": list(latest["boxes"]),
                        "ts": latest["ts"],
                        "frame_w": latest["frame_w"],
                        "frame_h": latest["frame_h"],
                    }
                await hub.broadcast(payload)

        task = asyncio.create_task(broadcast_loop())
        yield
        task.cancel()

    app = FastAPI(lifespan=lifespan)

    @app.websocket("/ws")
    async def websocket_detect(websocket: WebSocket) -> None:
        hub = websocket.app.state.hub
        await hub.connect(websocket)
        try:
            while True:
                await websocket.receive_text()
        except WebSocketDisconnect:
            hub.disconnect(websocket)

    return app


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument(
        "--stream",
        default=os.environ.get("YOLO_STREAM_URL", ""),
        help="MJPEG stream URL (or set YOLO_STREAM_URL)",
    )
    p.add_argument("--host", default="127.0.0.1")
    p.add_argument("--port", type=int, default=8765)
    p.add_argument("--model", default="yolov8n.pt", help="Ultralytics model path or name")
    p.add_argument("--conf", type=float, default=0.35, help="Min confidence")
    p.add_argument("--interval", type=float, default=0.08, help="Min seconds between inferences")
    return p.parse_args()


def main() -> None:
    args = parse_args()
    if not args.stream:
        print("Set --stream or YOLO_STREAM_URL to your Pi MJPEG URL, e.g. http://172.20.10.3:8080/stream")
        raise SystemExit(1)

    app = build_app(args)
    uvicorn.run(app, host=args.host, port=args.port, log_level="info")


if __name__ == "__main__":
    main()
