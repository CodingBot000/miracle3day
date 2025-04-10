/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,scss}"
  ],
  theme: {
    extend: {
      colors: {
        red: {
          DEFAULT: '#e74c3c',
          100: '#ff7272',
          200: '#8a0b0b',
          300: '#e91600',
        },
        green: {
          DEFAULT: '#2ecc71',
          100: '#059a44',
          light: '#b0d840',
        },
        'sky-blue': '#69c8f2',
        blue: {
          DEFAULT: '#3498db',
          100: '#3c83eb',
        },
        yellow: '#fbc400',
        purple: '#8f8ffe',
        turquoise: '#1abc9c',
        kakao: '#fedd35',
        naver: '#1ec800',
        apple: '#111',
        white: {
          DEFAULT: '#fff',
          100: '#fbfbfb',
          200: '#eee',
          300: '#ddd',
          400: '#999',
        },
        black: {
          DEFAULT: '#000',
          100: '#767676',
          200: '#2d3748',
          300: '#525f78',
        },
        gray: {
          DEFAULT: '#aaa',
          100: '#eff3fa',
          200: '#e3edfe',
          300: '#e8e8e8',
          400: '#8e8e8e',
          500: '#42444e',
        },
      },
      maxWidth: {
        'container': '1280px',
      },
      screens: {
        'laptop': '1024px',
        'tablet': '768px',
        'mobile': '360px',
      },
      keyframes: {
        'slide-in-left-right': {
          'from': { transform: 'translateX(-100%)' },
          'to': { transform: 'translateX(0%)' },
        },
      },
      animation: {
        'slide-in-left-right': 'slide-in-left-right 0.3s ease-out',
      },
    },
  },
  plugins: [],
  important: true,
}; 