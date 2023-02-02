/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [require("daisyui")],

  // daisyUI config (optional)
  daisyui: {
    styled: true,
    themes: [
      {
        mytheme: {
          primary: "#fde047",
          // "primary-focus": "#00FF00", //cambiar
          // "primary-content": "#00FF00", //cambiar
          secondary: "#f3f4f6",
          // "secondary-focus": "#00FF00", //cambiar
          // "secondary-content": "#00FF00", //cambiar
          accent: "#f97316",
          // "accent-focus": "#00FF00", //cambiar
          // "accent-content": "#f8f3ed",
          neutral: "#374151",
          // "neutral-focus": "#212529", //button hover
          // "neutral-content": "#212529", //button content
          "base-100": "#202020",
          // "base-200": "#a6806d",
          // "base-300": "#4b4949",
          // "base-content": "#212529", //text
          info: "#06b6d4",
          success: "#10b981",
          warning: "#eab308",
          error: "#dc2626",
        },
      },
    ],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "mytheme",
  },
};
