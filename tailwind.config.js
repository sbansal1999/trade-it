/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/pages/*.{ts,js,jsx,tsx}"],
  daisyui: {
    themes: ["light"],
  },
  plugins: [require("daisyui")],
};
