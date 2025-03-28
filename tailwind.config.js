/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-bg': '#F0F4F8', /* Light grey background */
        'primary-text': '#1F2937', /* Dark grey text */
        'secondary-text': '#4B5563', /* Medium grey text */
        'highlight-bg': '#2563EB', /* Blue for highlights and buttons */
        'highlight-text': '#FFFFFF', /* White text for contrast */
        'card-bg': '#FFFFFF', /* White background for cards */
        'border-color': '#D1D5DB', /* Light grey borders */
        'note-bg': '#E0F2FE', /* Light blue background for notes */
      }
    },
  },
  plugins: [],
}
