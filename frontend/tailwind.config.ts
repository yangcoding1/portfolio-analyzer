import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // 숲 (Forest) → Emerald 계열로 업그레이드
        forest: {
          50:  "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          300: "#6ee7b7",  // emerald-300 — 보조 텍스트
          400: "#34d399",  // emerald-400 — 액센트
          500: "#10b981",  // emerald-500 — 주요 액션
          600: "#059669",  // emerald-600 — hover
          700: "#047857",  // emerald-700 — 보더
          800: "#065f46",  // emerald-800 — 진한 카드
          900: "#064e3b",  // emerald-900
          950: "#022c22",  // darkest
        },
        // 나무껍질 (Bark) → Amber 계열
        bark: {
          200: "#fde68a",
          300: "#fcd34d",
          400: "#fbbf24",  // amber-400 — 주 포인트
          500: "#f59e0b",  // amber-500
          600: "#d97706",
        },
        // 꽃 (Blossom) → Rose 계열 (부드럽게)
        blossom: {
          200: "#fecdd3",
          300: "#fda4af",  // rose-300 — 연한 포인트
          400: "#fb7185",  // rose-400 — 주 포인트 (부드러운 핑크)
          500: "#f43f5e",  // rose-500
          600: "#e11d48",
        },
      },
      boxShadow: {
        // 글래스모피즘 카드 전용 그림자
        "glass":         "0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)",
        "glass-hover":   "0 12px 40px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.07)",
        "glow-emerald":  "0 0 24px rgba(16,185,129,0.3)",
        "glow-sm":       "0 0 12px rgba(16,185,129,0.2)",
        "glow-rose":     "0 0 20px rgba(251,113,133,0.25)",
        "glow-amber":    "0 0 20px rgba(251,191,36,0.25)",
        "btn":           "0 4px 20px rgba(16,185,129,0.4)",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6" },
          "50%":      { opacity: "1" },
        },
        "fade-up": {
          "0%":   { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "fade-up":    "fade-up 0.4s ease-out",
      },
    },
  },
  plugins: [],
};

export default config;
