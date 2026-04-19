#!/usr/bin/env bash
# Serve USB camera (e.g. /dev/video0) as MJPEG over HTTP for the Acorn UI.
# Requires: ffmpeg with v4l2. Install on Raspberry Pi OS: sudo apt install ffmpeg v4l-utils
# Usage: chmod +x pi-usb-camera-mjpeg.sh && ./pi-usb-camera-mjpeg.sh
# Then set VITE_CAMERA_STREAM_URL=http://<PI_IP>:8080/ (path must match ffmpeg listen URL)
set -euo pipefail
HOST="${HOST:-0.0.0.0}"
PORT="${PORT:-8080}"
DEVICE="${DEVICE:-/dev/video0}"

# If -input_format mjpeg fails, try -input_format yuyv422 and replace -c copy with -c:v mjpeg -q:v 5
exec ffmpeg -hide_banner -loglevel warning \
  -f v4l2 -input_format mjpeg -framerate 30 -video_size 1280x720 -i "$DEVICE" \
  -c copy \
  -listen 1 -f mpjpeg "http://${HOST}:${PORT}/"
