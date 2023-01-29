/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
  plugins: [require("daisyui")],

  // daisyUI config (optional)
  daisyui: {
    styled: true,
    themes: ["coffee"],
    base: true,
    utils: true,
    logs: true,
    rtl: false,
    prefix: "",
    darkTheme: "coffee",
  },
};
