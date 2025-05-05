/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/**/*.{js,ts,jsx,tsx,scss}"
  ],
  theme: {
  	extend: {
  		colors: {
  			red: {
  				'100': '#ff7272',
  				'200': '#8a0b0b',
  				'300': '#e91600',
  				DEFAULT: '#e74c3c'
  			},
  			green: {
  				'100': '#059a44',
  				DEFAULT: '#2ecc71',
  				light: '#b0d840'
  			},
  			'sky-blue': '#69c8f2',
  			blue: {
  				'100': '#3c83eb',
  				DEFAULT: '#3498db'
  			},
  			yellow: '#fbc400',
  			purple: '#8f8ffe',
  			turquoise: '#1abc9c',
  			kakao: '#fedd35',
  			naver: '#1ec800',
  			apple: '#111',
  			white: {
  				'100': '#fbfbfb',
  				'200': '#eee',
  				'300': '#ddd',
  				'400': '#999',
  				DEFAULT: '#fff'
  			},
  			black: {
  				'100': '#767676',
  				'200': '#2d3748',
  				'300': '#525f78',
  				DEFAULT: '#000'
  			},
  			gray: {
  				'100': '#eff3fa',
  				'200': '#e3edfe',
  				'300': '#e8e8e8',
  				'400': '#8e8e8e',
  				'500': '#42444e',
  				DEFAULT: '#aaa'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		maxWidth: {
  			container: '1280px'
  		},
  		screens: {
  			laptop: '1024px',
  			tablet: '768px',
  			mobile: '360px'
  		},
  		keyframes: {
  			'slide-in-left-right': {
  				from: {
  					transform: 'translateX(-100%)'
  				},
  				to: {
  					transform: 'translateX(0%)'
  				}
  			}
  		},
  		animation: {
  			'slide-in-left-right': 'slide-in-left-right 0.3s ease-out'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate"),
	require('@tailwindcss/line-clamp'),
  ],
  important: true,
}; 