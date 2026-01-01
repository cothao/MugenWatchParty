/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'hsl(225, 47%, 6%)',
        foreground: 'hsl(210, 38%, 95%)',
        muted: {
          DEFAULT: 'hsl(225, 47%, 15%)',
          foreground: 'hsl(215, 25%, 55%)',
        },
        border: 'hsl(225, 47%, 15%)',
        card: {
          DEFAULT: 'hsl(224, 30%, 9%)',
          foreground: 'hsl(210, 38%, 95%)',
        },
        primary: {
          DEFAULT: 'hsl(265, 89%, 78%)',
          foreground: 'hsl(225, 47%, 6%)',
        },
        electric: {
          DEFAULT: 'hsl(265, 89%, 78%)',
          foreground: 'hsl(225, 47%, 6%)',
        },
        team: {
          red: {
            DEFAULT: 'hsl(0, 84%, 60%)',
            foreground: 'hsl(0, 0%, 100%)',
            light: 'hsl(0, 84%, 96%)',
          },
          blue: {
            DEFAULT: 'hsl(221, 83%, 53%)',
            foreground: 'hsl(0, 0%, 100%)',
            light: 'hsl(221, 83%, 96%)',
          },
        },
      },
      borderRadius: {
        lg: '0.75rem',
        md: 'calc(0.75rem - 2px)',
        sm: 'calc(0.75rem - 4px)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'ping-slow': 'ping 2s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
    },
  },
  plugins: [],
}
