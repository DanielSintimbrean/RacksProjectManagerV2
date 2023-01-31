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
          secondary: "#f3f4f6",
          accent: "#f97316",
          neutral: "#374151",
          "base-100": "#202020",
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
