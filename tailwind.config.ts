
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: '#246BC2',
					50: '#E8F2FF',
					100: '#D0E4FF',
					200: '#A1C9FF',
					300: '#72AEFF',
					400: '#4388E8',
					500: '#246BC2',
					600: '#1D5BA3',
					700: '#164A84',
					800: '#0F3A65',
					900: '#002147',
					foreground: '#FFFFFF'
				},
				secondary: {
					DEFAULT: '#FA905',
					50: '#FFF4E6',
					100: '#FFE8CC',
					200: '#FFD199',
					300: '#FFBA66',
					400: '#FFA333',
					500: '#FA905',
					600: '#E6950A',
					700: '#B3740B',
					800: '#80540C',
					900: '#4D330D',
					foreground: '#FFFFFF'
				},
				accent: {
					DEFAULT: '#DDE788',
					50: '#F8FBE6',
					100: '#F1F7CC',
					200: '#E8F399',
					300: '#DFE966',
					400: '#E3ED77',
					500: '#DDE788',
					600: '#C5CF6F',
					700: '#AAB85C',
					800: '#8E9F49',
					900: '#728636',
					foreground: '#1F2937'
				},
				neutral: {
					DEFAULT: '#10F13',
					50: '#F8F9FA',
					100: '#F1F3F4',
					200: '#E8EAED',
					300: '#DADCE0',
					400: '#BDC1C6',
					500: '#9AA0A6',
					600: '#80868B',
					700: '#5F6368',
					800: '#3C4043',
					900: '#10F13',
					950: '#01123'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'fade-in': {
					'0%': {
						opacity: '0',
						transform: 'translateY(10px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'scale-in': {
					'0%': {
						transform: 'scale(0.95)',
						opacity: '0'
					},
					'100%': {
						transform: 'scale(1)',
						opacity: '1'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 0.3s ease-out',
				'scale-in': 'scale-in 0.2s ease-out'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
