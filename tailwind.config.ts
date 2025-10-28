import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        // Professional Education Theme Colors
        education: {
          navy: "hsl(210 100% 20%)",        // Deep navy for authority
          burgundy: "hsl(0 50% 30%)",       // Rich burgundy for tradition
          forest: "hsl(120 40% 25%)",       // Forest green for growth
          gold: "hsl(45 85% 50%)",          // Gold for excellence
          slate: "hsl(215 20% 40%)",        // Professional slate
          teal: "hsl(180 60% 35%)",         // Academic teal
        },
        gradient: {
          start: "hsl(var(--gradient-start))",
          middle: "hsl(var(--gradient-middle))",
          end: "hsl(var(--gradient-end))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: {
            height: "0",
          },
          to: {
            height: "var(--radix-accordion-content-height)",
          },
        },
        "accordion-up": {
          from: {
            height: "var(--radix-accordion-content-height)",
          },
          to: {
            height: "0",
          },
        },
        "gradient-shift": {
          "0%": {
            "background-position": "0% 50%",
          },
          "50%": {
            "background-position": "100% 50%",
          },
          "100%": {
            "background-position": "0% 50%",
          },
        },
        "pulse-blue": {
          "0%, 100%": {
            "box-shadow": "0 0 0 0 hsl(var(--dynamic-blue) / 0.4)",
          },
          "50%": {
            "box-shadow": "0 0 0 10px hsl(var(--dynamic-blue) / 0)",
          },
        },
        "color-shift": {
          "0%, 100%": {
            color: "hsl(var(--dynamic-black))",
          },
          "50%": {
            color: "hsl(var(--dynamic-blue))",
          },
        },
        "rainbow-shift": {
          "0%": {
            "background-position": "0% 50%",
          },
          "25%": {
            "background-position": "100% 50%",
          },
          "50%": {
            "background-position": "100% 100%",
          },
          "75%": {
            "background-position": "0% 100%",
          },
          "100%": {
            "background-position": "0% 50%",
          },
        },
        "bounce-gentle": {
          "0%, 100%": {
            transform: "translateY(0)",
          },
          "50%": {
            transform: "translateY(-5px)",
          },
        },
        "scale-in": {
          "0%": {
            transform: "scale(0.9)",
            opacity: "0",
          },
          "100%": {
            transform: "scale(1)",
            opacity: "1",
          },
        },
        "slide-in-left": {
          "0%": {
            transform: "translateX(-100%)",
            opacity: "0",
          },
          "100%": {
            transform: "translateX(0)",
            opacity: "1",
          },
        },
        "glow-purple": {
          "0%, 100%": {
            "box-shadow": "0 0 5px hsl(270 100% 65% / 0.5)",
          },
          "50%": {
            "box-shadow": "0 0 20px hsl(270 100% 65% / 0.8)",
          },
        },
        "glow-teal": {
          "0%, 100%": {
            "box-shadow": "0 0 5px hsl(180 100% 50% / 0.5)",
          },
          "50%": {
            "box-shadow": "0 0 20px hsl(180 100% 50% / 0.8)",
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "gradient-shift": "gradient-shift 8s ease infinite",
        "pulse-blue": "pulse-blue 2s ease-in-out infinite",
        "color-shift": "color-shift 4s ease-in-out infinite",
        "rainbow-shift": "rainbow-shift 6s ease infinite",
        "bounce-gentle": "bounce-gentle 2s ease-in-out infinite",
        "scale-in": "scale-in 0.5s ease-out",
        "slide-in-left": "slide-in-left 0.6s ease-out",
        "glow-purple": "glow-purple 2s ease-in-out infinite",
        "glow-teal": "glow-teal 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
