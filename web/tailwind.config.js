/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,jsx,ts,tsx,md,mdx}',
        './src/**/*.{js,jsx,ts,tsx,md,mdx}'
    ],
    theme: {
        extend: {
            colors: {
                'dw': '#FE330B',
                'on-dw': '#FFFFFF'
              },
        }
    },
    plugins: [
        require('@tailwindcss/container-queries'),
        require('tailwind-scrollbar-hide'),
    ]
}