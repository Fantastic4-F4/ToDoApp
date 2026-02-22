/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        coral: '#ff6f61',
        aqua: '#00c2ff',
        lemon: '#ffd166',
        mint: '#66d19e',
        lilac: '#b58cff',
      },
    },
  },
  plugins: [require('nativewind/tailwind/native')],
};
