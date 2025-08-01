
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
			fontFamily: {
				sans: ['Poppins', 'system-ui', 'sans-serif'],
				orbitron: ['Orbitron', 'system-ui', 'sans-serif'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
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
				},
				// Fresh Tennis Club Theme - Enhanced vibrant colors
				tennis: {
					green: {
						// Enhanced vibrant greens for Fresh Tennis Club theme
						dark: 'hsl(var(--tennis-green-dark))',        // Deeper, richer
						medium: 'hsl(var(--tennis-green-medium))',    // More vibrant
						light: 'hsl(var(--tennis-green-light))',      // Brighter
						primary: 'hsl(var(--tennis-green-primary))',  // Enhanced primary
						subtle: 'hsl(var(--tennis-green-subtle))',    // Light sage
						accent: 'hsl(var(--tennis-green-accent))',    // Vibrant accent
						bg: 'hsl(var(--tennis-green-bg))',           // Main sage background
						'bg-alt': 'hsl(var(--tennis-green-bg-alt))'  // Alternative background
					},
					yellow: {
						DEFAULT: 'hsl(var(--tennis-yellow))',         // Lime-yellow energy
						light: 'hsl(var(--tennis-yellow-light))',
						dark: 'hsl(var(--tennis-yellow-dark))'
					},
					neutral: {
						50: 'hsl(var(--tennis-neutral-50))',
						100: 'hsl(var(--tennis-neutral-100))',
						200: 'hsl(var(--tennis-neutral-200))',
						300: 'hsl(var(--tennis-neutral-300))',
						400: 'hsl(var(--tennis-neutral-400))',
						500: 'hsl(var(--tennis-neutral-500))',
						600: 'hsl(var(--tennis-neutral-600))',
						700: 'hsl(var(--tennis-neutral-700))',
						800: 'hsl(var(--tennis-neutral-800))',
						900: 'hsl(var(--tennis-neutral-900))'
					}
				},
				hp: {
					red: 'hsl(var(--hp-red))',
					green: 'hsl(var(--hp-green))'
				},
				xp: {
					blue: 'hsl(var(--xp-blue))'
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
				'fade-in-up': {
					'0%': {
						opacity: '0',
						transform: 'translateY(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateY(0)'
					}
				},
				'fade-in-scale': {
					'0%': {
						opacity: '0',
						transform: 'scale(0.95)'
					},
					'100%': {
						opacity: '1',
						transform: 'scale(1)'
					}
				},
				'slide-in-right': {
					'0%': {
						opacity: '0',
						transform: 'translateX(20px)'
					},
					'100%': {
						opacity: '1',
						transform: 'translateX(0)'
					}
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1',
						boxShadow: '0 0 0 0 hsla(var(--tennis-green-primary), 0.4)'
					},
					'50%': {
						opacity: '0.85',
						boxShadow: '0 0 0 8px hsla(var(--tennis-green-primary), 0)'
					}
				},
				'shimmer': {
					'0%': {
						backgroundPosition: '-200px 0'
					},
					'100%': {
						backgroundPosition: 'calc(200px + 100%) 0'
					}
				},
				'shrink': {
					'0%': {
						transform: 'scaleX(1)'
					},
					'100%': {
						transform: 'scaleX(0)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0px)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'glow-pulse': {
					'0%, 100%': {
						boxShadow: '0 0 20px rgba(155, 255, 155, 0.3)'
					},
					'50%': {
						boxShadow: '0 0 40px rgba(155, 255, 155, 0.6)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in-up': 'fade-in-up 0.6s ease-out',
				'fade-in-scale': 'fade-in-scale 0.4s ease-out',
				'slide-in-right': 'slide-in-right 0.5s ease-out',
				'pulse-glow': 'pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
				'shimmer': 'shimmer 2s infinite',
				'float': 'float 6s ease-in-out infinite',
				'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
				'shrink': 'shrink 4s linear forwards'
			},
			spacing: {
				'18': '4.5rem',
				'88': '22rem',
				'128': '32rem'
			},
			backdropBlur: {
				xs: '2px'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
