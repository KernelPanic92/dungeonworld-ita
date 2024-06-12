/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './pages/**/*.{js,jsx,ts,tsx,md,mdx}',
        './components/**/*.{js,jsx,ts,tsx,md,mdx}',
        './src/**/*.{js,jsx,ts,tsx,md,mdx}'
    ],
    theme: {
        extend: {
            colors: {
                'dw': '#73C482',
                'on-dw': '#262626'
              },
        }
    },
    plugins: [
        require('@tailwindcss/container-queries'),
    ]
}