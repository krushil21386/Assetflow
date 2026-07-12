/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      "colors": {
        "on-tertiary-fixed": "#002113",
        "on-error": "#ffffff",
        "on-secondary-fixed": "#001a42",
        "on-tertiary-fixed-variant": "#005236",
        "surface-dim": "#d8dadc",
        "primary": "#091426",
        "outline-variant": "#c5c6cd",
        "inverse-primary": "#bcc7de",
        "tertiary-fixed": "#6ffbbe",
        "tertiary-container": "#00301e",
        "on-secondary-container": "#fefcff",
        "surface-container-high": "#e6e8ea",
        "error": "#ba1a1a",
        "surface-container": "#eceef0",
        "primary-fixed-dim": "#bcc7de",
        "secondary": "#0058be",
        "on-background": "#191c1e",
        "surface-tint": "#545f73",
        "on-error-container": "#93000a",
        "outline": "#75777d",
        "tertiary-fixed-dim": "#4edea3",
        "primary-container": "#1e293b",
        "secondary-fixed": "#d8e2ff",
        "surface-container-low": "#f2f4f6",
        "on-tertiary": "#ffffff",
        "secondary-fixed-dim": "#adc6ff",
        "on-tertiary-container": "#00a472",
        "surface-container-lowest": "#ffffff",
        "on-primary-fixed": "#111c2d",
        "tertiary": "#00190e"
      },
      "borderRadius": {
        "DEFAULT": "0.125rem",
        "lg": "0.25rem",
        "xl": "0.5rem",
        "full": "0.75rem"
      },
      "spacing": {
        "sm": "8px",
        "base": "4px",
        "margin": "24px",
        "lg": "24px",
        "gutter": "16px",
        "xs": "4px",
        "md": "16px",
        "xl": "32px"
      },
      "fontFamily": {
        "headline-sm": ["Geist", "sans-serif"],
        "body-md": ["Geist", "sans-serif"],
        "headline-lg": ["Geist", "sans-serif"],
        "body-sm": ["Geist", "sans-serif"],
        "label-sm": ["JetBrains Mono", "monospace"],
        "label-md": ["JetBrains Mono", "monospace"],
        "body-lg": ["Geist", "sans-serif"],
        "headline-md": ["Geist", "sans-serif"]
      },
      "fontSize": {
        "headline-sm": ["20px", {"lineHeight": "28px", "fontWeight": "600"}],
        "body-md": ["14px", {"lineHeight": "20px", "fontWeight": "400"}],
        "headline-lg": ["32px", {"lineHeight": "40px", "letterSpacing": "-0.02em", "fontWeight": "600"}],
        "body-sm": ["12px", {"lineHeight": "16px", "fontWeight": "400"}],
        "label-sm": ["10px", {"lineHeight": "14px", "fontWeight": "500"}],
        "label-md": ["12px", {"lineHeight": "16px", "letterSpacing": "0.02em", "fontWeight": "500"}],
        "body-lg": ["16px", {"lineHeight": "24px", "fontWeight": "400"}],
        "headline-md": ["24px", {"lineHeight": "32px", "letterSpacing": "-0.01em", "fontWeight": "600"}]
      }
    },
  },
  plugins: [],
}
