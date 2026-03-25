/** @type {import('tailwindcss').Config} */

export default {
  theme: {
    extend: {},
  },
  plugins: [],
  content: ["./src/components/**/*.{html,js,ts,tsx}"],
  // Safelist ensures grid classes are always included even if scanner misses them
  safelist: [
    "grid-cols-5",
    "col-span-2",
    "gap-4",
    "grid",
    "items-center",
    "grid-cols-1",
  ],
};
