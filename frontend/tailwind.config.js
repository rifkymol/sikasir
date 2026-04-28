/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    theme: {
        extend: {
            extend: {
                colors: {
                    primary: {
                        50: '#eff6ff',
                        500: '#3b82f6',
                        600: '#2563eb',
                        700: '#1d4ed8',
                    },
                    success: '#22c55e',
                    danger: '#ef4444',
                },
                fontFamily: {
                    'sans': ['Inter', 'sans-serif'],
                    'serif': ['Merriweather', 'serif'],
                },
            },
        },
    },
    plugins: [],
}

