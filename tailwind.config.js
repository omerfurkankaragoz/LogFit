/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'Noto Sans', 'sans-serif'],
      },
      colors: {
        // iOS Dark Mode Renkleri (Düzeltilmiş Format)
        'system-background': '#000000',
        'system-background-secondary': '#1C1C1E',
        'system-background-tertiary': '#2C2C2E',

        // RGBA renkleri, Tailwind'in opaklık yönetimi için <alpha-value> ile tanımlandı
        'system-label': 'rgb(255 255 255 / 0.95)',
        'system-label-secondary': 'rgb(235 235 245 / 0.6)',
        'system-label-tertiary': 'rgb(235 235 245 / 0.3)',
        'system-label-quaternary': 'rgb(235 235 245 / 0.18)',

        'system-fill': 'rgb(120 120 128 / 0.36)',
        'system-fill-secondary': 'rgb(120 120 128 / 0.24)',
        'system-fill-tertiary': 'rgb(120 120 128 / 0.18)',

        'system-separator': 'rgb(84 84 88 / 0.6)',

        // Vurgu Renkleri
        'system-blue': '#0A84FF',
        'system-green': '#30D158',
        'system-red': '#FF453A',
        'system-yellow': '#FFD60A',
        'system-orange': '#FF9F0A',

        // Yeni Apple Style Renkler
        'apple-blue': '#007AFF', // Aktif ikon rengi
        // Arka plan ve kart renkleri
        'apple-light-bg': '#F2F2F7',
        'apple-dark-bg': '#000000',
        // Metin renkleri
        'apple-light-text-secondary': 'rgba(60, 60, 67, 0.6)', // Pasif ikon
        'apple-light-text-primary': '#000000', // Hover
        'apple-dark-text-secondary': 'rgba(235, 235, 245, 0.6)',
        'apple-dark-text-primary': '#FFFFFF',
      },
      boxShadow: {
        // Navbar'ın havada durma efekti için gölge
        'ios-float': '0 12px 32px rgba(0, 0, 0, 0.16)',
      }
    },
  },
  plugins: [],
}