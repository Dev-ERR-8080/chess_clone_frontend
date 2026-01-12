/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			}
  		},
  		backgroundImage: {
  			'skeleton-gradient': 'linear-gradient(270deg, var(--accents-1), var(--accents-2), var(--accents-2), var(--accents-1))'
  		},
  		animation: {
  			'skeleton-loading': 'skeletonLoading 8s infinite ease-in-out'
  		},
  		keyframes: {
  			skeletonLoading: {
  				'0%': {
  					backgroundPosition: '200% 0'
  				},
  				'100%': {
  					backgroundPosition: '-200% 0'
  				}
  			}
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}