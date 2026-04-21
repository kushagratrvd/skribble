/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#b4baff',
          100: '#6b7aff',
          200: '#4571ff',
          300: '#2a51d1',
          400: '#1e44be',
          500: '#1640c9',
          600: '#0c2c96',
          700: '#072483',
          800: '#040a33',
          900: '#020619',
        },
        accent: {
          green: '#53e237',
          red: '#CE4F0A',
          yellow: '#ee9631',
          blue: '#2c8de7',
        },
        panel: {
          bg: 'rgba(12, 44, 150, 0.75)',
          lo: 'rgba(7, 36, 131, 0.75)',
          hi: '#1640c9',
          focus: '#ee9631',
          border: '#040a33',
          'border-focus': '#56b2fd',
          text: '#f0f0f0',
          button: '#2a51d1',
          'button-hover': '#1e44be',
        },
        chat: {
          guessed: '#56CE27',
          close: '#e2cb00',
          drawing: '#3975CE',
          join: '#56CE27',
          leave: '#CE4F0A',
        },
        player: {
          me: '#4998ff',
          guessed: '#5bdd4a',
          'guessed-alt': '#48c737',
        },
      },
      fontFamily: {
        sans: ['Nunito', 'system-ui', 'sans-serif'],
        mono: ['Inconsolata', 'monospace'],
      },
      animation: {
        'slide-in': 'slideIn 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'bounce-in': 'bounceIn 0.5s ease-out',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
        'avatar-bounce': 'avatarBounce 125ms ease-in-out 1',
        'avatar-clicked': 'avatarClicked 125ms ease-in-out 1',
        'hint-uncover': 'hintUncover 0.8s ease-in-out 1',
        'chat-msg': 'chatMsg 0.1s ease-in-out 1',
        'word-intro': 'wordIntro 0.25s ease-in-out 1 normal both',
      },
      keyframes: {
        slideIn: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.3)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '70%': { transform: 'scale(0.9)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 5px rgba(83, 226, 55, 0.3)' },
          '50%': { boxShadow: '0 0 20px rgba(83, 226, 55, 0.6)' },
        },
        avatarBounce: {
          '0%, 100%': { top: '0' },
          '15%': { top: '6%' },
        },
        avatarClicked: {
          '0%, 100%': { transform: 'scale(1)' },
          '15%': { transform: 'scale(1.2)' },
        },
        hintUncover: {
          '0%, 100%': { color: '#000', transform: 'translateY(0)' },
          '10%': { color: '#ffa844', transform: 'scale(1.35) translateY(-8px)' },
          '25%': { transform: 'translateY(3px)' },
          '37%': { transform: 'translateY(0)' },
        },
        chatMsg: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        wordIntro: {
          '0%': { opacity: '0', transform: 'translate(0, -40%)' },
          '100%': { opacity: '1', transform: 'translate(0, 0)' },
        },
      },
    },
  },
  plugins: [],
};