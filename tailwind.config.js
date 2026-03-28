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
    "grid-cols-11",
    "col-span-1",
    "col-span-2",
    "col-span-3",
    "col-span-5",
    "gap-4",
    "grid",
    "items-center",
    "grid-cols-1",
  ],
};
