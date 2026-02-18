import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0A2342',
        teal: '#3257A8',
        'wa-header': '#f0f2f5',
        'wa-list-hover': '#f5f6f6',
        'wa-green': '#3257A8',
        'wa-incoming': '#ffffff',
        'wa-outgoing': '#eef5ff',
        'wa-chat-bg': '#efeae2',
      },
      boxShadow: {
        'msg': '0 1px 0.5px rgba(11,20,26,.13)',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
