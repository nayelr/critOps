/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          deep: '#04091a',
          base: '#070f1f',
          surface: '#0a1628',
          card: '#0d1e35',
          elevated: '#102240',
        },
        border: {
          subtle: '#122040',
          DEFAULT: '#1a3354',
          bright: '#1e4070',
        },
        cyan: {
          glow: '#00f5ff',
          bright: '#22d3ee',
          mid: '#0891b2',
          dim: '#164e63',
        },
        teal: {
          glow: '#00ffcc',
          bright: '#2dd4bf',
        },
        threat: {
          critical: '#ff3b3b',
          high: '#ff6b35',
          medium: '#f59e0b',
          low: '#22c55e',
          none: '#10b981',
        },
        status: {
          online: '#10b981',
          warning: '#f59e0b',
          offline: '#ef4444',
          unknown: '#6b7280',
        },
        text: {
          primary: '#e2e8f0',
          secondary: '#94a3b8',
          dim: '#475569',
          accent: '#00f5ff',
        },
      },
      fontFamily: {
        mono: ['"Space Mono"', '"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'pulse-fast': 'pulse 0.8s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
        'scan': 'scan 3s linear infinite',
        'blink': 'blink 1.2s step-end infinite',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.5s ease-out',
        'shimmer': 'shimmer 2s linear infinite',
        'rotate-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        scan: {
          '0%': { transform: 'translateY(0)' },
          '100%': { transform: 'translateY(100%)' },
        },
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
        slideUp: {
          '0%': { transform: 'translateY(8px)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 },
        },
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'cyan-glow': '0 0 20px rgba(0, 245, 255, 0.15)',
        'cyan-glow-sm': '0 0 8px rgba(0, 245, 255, 0.2)',
        'red-glow': '0 0 20px rgba(239, 68, 68, 0.25)',
        'orange-glow': '0 0 15px rgba(245, 158, 11, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.5)',
      },
    },
  },
  plugins: [],
}
