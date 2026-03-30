const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,ts,jsx,tsx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                sans: [
                    'Inter', 'ui-sans-serif', 'system-ui', '-apple-system',
                    'BlinkMacSystemFont', 'Segoe UI', 'Roboto',
                    'Helvetica Neue', 'Arial', 'sans-serif', ...fontFamily.sans
                ],
                mont: ['var(--font-mont)', 'Montserrat', 'sans-serif'],
            },
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
                apple: {
                    blue: '#007AFF',
                    indigo: '#5856D6',
                    purple: '#AF52DE',
                    pink: '#FF2D55',
                    red: '#FF3B30',
                    orange: '#FF9500',
                    yellow: '#FFCC00',
                    green: '#34C759',
                    mint: '#00C7BE',
                    teal: '#30B0C7',
                    cyan: '#32ADE6',
                    gray: {
                        50: '#FAFAFA',
                        100: '#F5F5F5',
                        200: '#E5E5E5',
                        300: '#D4D4D4',
                        400: '#A3A3A3',
                        500: '#737373',
                        600: '#525252',
                        700: '#404040',
                        800: '#262626',
                        900: '#171717',
                    }
                },
                dark: '#1b1b1b',
                light: '#f5f5f5',
                legacyPrimary: '#B63E96',
                primaryDark: '#58E6D9',
                sec: '#bae8e8',
                fir: '#c86b85',
            },
            boxShadow: {
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            },
            transitionProperty: {
                height: 'height',
                spacing: 'margin, padding',
            },
            transitionDuration: {
                400: '400ms',
                600: '600ms',
            },
            backdropBlur: {
                xs: '2px',
                sm: '4px',
                md: '8px',
                lg: '12px',
                xl: '16px',
                '2xl': '24px',
            },
            animation: {
                'spin-slow': 'spin 8s linear infinite',
            },
            backgroundImage: {
                customradial: 'linear-gradient(178.7deg, rgba(126,184,253,1) 5.6%, rgba(2,71,157,1) 95.3%)',
            },
        },
        screens: {
            '2xl': { max: '1535px' },
            xl: { max: '1279px' },
            lg: { max: '1023px' },
            md: { max: '767px' },
            sm: { max: '639px' },
            xs: { max: '479px' },
        },
    },
    plugins: [],
};
