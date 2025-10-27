/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}", "./includes/**/*.php"],
  theme: {
    extend: {},
  },
  plugins: [],
  // Prefix to avoid conflicts with WordPress/theme styles
  prefix: "tw-",
  // Prevent Tailwind from conflicting with WordPress styles
  corePlugins: {
    preflight: false,
  },
};
