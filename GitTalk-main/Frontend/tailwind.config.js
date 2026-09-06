/** @type {import('tailwindcss').Config} */
export default {
    darkMode: "class",
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
      extend: {
        colors: {
            "primary": "#10b981", // Emerald 500
            "primary-dark": "#059669", // Emerald 600
            "primary-light": "#34d399", // Emerald 400
            "background-light": "#f6f6f8",
            "background-dark": "#09090b",
            "zinc-surface": "#18181b",
            "zinc-border": "#27272a"
        },
        fontFamily: {
            "display": ["Inter", "sans-serif"]
        },
        borderRadius: {
            "DEFAULT": "0.25rem",
            "lg": "0.5rem",
            "xl": "0.75rem",
            "full": "9999px"
        },
      },
    },
    plugins: [],
  }