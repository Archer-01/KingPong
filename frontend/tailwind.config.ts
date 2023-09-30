import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
        './src/components/**/*.{js,ts,jsx,tsx,mdx}',
        './src/app/**/*.{js,ts,jsx,tsx,mdx}',
        './src/stories/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            screens: {
                sm: '375px',
                md: '650px',
                lg: '1024px',
                xl: '1440px',
                xxl: '1920px',
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic':
                    'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                points: 'url("/images/background-point.png")',
                aboutBg: 'url("/images/bg-about.svg")',
            },
            colors: {
                primary: '#4F1754',
                secondary: {
                    '200': '#FFE72D',
                    '500': '#FFA82A',
                },
                background: '#250A3B',
                inactive: {
                    '200': '#6A6A6A',
                    '500': '#302F2F',
                },
                online: '#03CE18',
                offline: '#302F2F',
                ingame: '#FF650B',
                cube_palette: {
                    '200': '#E8D5B5',
                    '400': '#66ABFF',
                    '500': '#45144B',
                },
                silver: '#C6C6C6',
                pink: '#FF00FF',
            },
            fontFamily: {
                nicomoji: ['var(--font-nicomoji)', 'sans-serif'],
                jost: ['var(--font-jost)', 'sans-serif'],
                mulish: ['var(--font-mulish)', 'sans-serif'],
                jockey: ['var(--font-jockey-one)', 'sans-serif'],
            },
            dropShadow: {
                '3xl': '0 2px 2px rgba(255, 228, 134, 0.68)',
                'neon-white': '0 0 10px rgba(255, 255, 255, 0.5)',
                'neon-black': '0 0 20px rgba(0, 0, 0, 0.6)',
                'neon-orange': '-2px 0 8px rgba(255, 200, 45, 0.58)',
                'neon-bord': '0 0 30px rgba(255, 255, 255, 0.5)',
            },
            keyframes: {
                opacityUp:{
                    '0%': { opacity: '0' },
                    '100%': { opacity: '100' },
                },
                zoomin: {
                    '0%': { transform: 'scale(0)' },
                    '100%': { transform: 'scale(1)' },
                },
                zoomin2: {
                    '0%': { transform: 'scale(0.3)' },
                    '100%': { transform: 'scale(1)' },
                },
                waggle: {
                    '0%': { transform: 'opacity 0' },
                    '100%': { transform: 'opacity 1' },
                },
                blob: {
                    '0%': {
                        transform: 'translate(0px, 0px) scale(1)',
                    },
                    '33%': {
                        transform: 'translate(30px, -50px) scale(1.1)',
                    },
                    '66%': {
                        transform: 'translate(-20px, 20px) scale(0.9)',
                    },
                    '100%': {
                        transform: 'translate(0px, 0px) scale(1)',
                    },
                },
                rotation: {
                    '0%': {
                        transform: 'rotate(0deg)',
                    },
                    '100%': {
                        transform: 'rotate(360deg)',
                    },
                },
                dragR: {
                    '0%': {
                        justifySelf: 'start',
                    },
                    '100%': {
                        justifySelf: 'end',
                    },
                },
                dragL: {
                    '0%': {
                        justifySelf: 'end',
                    },
                    '100%': {
                        justifySelf: 'start',
                    },
                },
                wiggle: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '100' },
                },
                playball: {
                    '0%': {
                        top: '22px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    },
                    '10%': {
                        top: '50%',
                        left: '0',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '20%': {
                        top: '100%',
                        left: '25%',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '35%': {
                        top: '25%',
                        left: '100%',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '40%': {
                        top: '22px',
                        left: '75%',
                        transform: 'translateX(-50%)',
                    },
                    '50%': {
                        top: '50%',
                        left: '100%',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '60%': {
                        top: '100%',
                        left: '75%',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '75%': {
                        top: '25%',
                        left: '0',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '80%': {
                        top: '22px',
                        left: '25%',
                        transform: 'translateX(-50%)',
                    },
                    '90%': {
                        top: '50%',
                        left: '0',
                        transform: 'translateY(-58px) translateX(-50%)',
                    },
                    '100%': {
                        top: '100%',
                        left: '80%',
                        transform: 'translateX(-50%) translateY(-20px)',
                    },
                },
                moveTop: {
                    '0%': {
                        left: '50%',
                    },
                    '10%': {
                        left: '15%',
                    },
                    '20%': {
                        left: '25%',
                    },
                    '35%': {
                        left: '85%%',
                    },
                    '40%': {
                        left: '75%',
                    },
                    '50%': {
                        left: '85%',
                    },
                    '60%': {
                        left: '75%',
                    },
                    '75%': {
                        left: '15%',
                    },
                    '80%': {
                        left: '25%',
                    },
                    '90%': {
                        left: '15%',
                    },
                    '100%': {
                        left: '50%',
                    },
                },
                moveBottom: {
                    '0%': {
                        left: '50%',
                    },
                    '10%': {
                        left: '75%',
                    },
                    '20%': {
                        left: '25%',
                    },
                    '35%': {
                        left: '15%%',
                    },
                    '40%': {
                        left: '25%',
                    },
                    '50%': {
                        left: '15%',
                    },
                    '60%': {
                        left: '75%',
                    },
                    '75%': {
                        left: '85%',
                    },
                    '80%': {
                        left: '75%',
                    },
                    '90%': {
                        left: '85%',
                    },
                    '100%': {
                        left: '15%',
                    },
                },
                // Matchmaking page - Mobile animations
                'slide-down-gate': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(35%)' },
                },
                'slide-up-gate': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-35%)' },
                },
                'slide-down-opponent': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(60%)' },
                },
                'slide-up-player': {
                    '0%': { transform: 'translateY(0)' },
                    '100%': { transform: 'translateY(-60%)' },
                },
                // Matchmaking page - Desktop animations
                'slide-left-gate': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-35%)' },
                },
                'slide-right-gate': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(35%)' },
                },
                'slide-left-player': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(-90%)' },
                },
                'slide-right-opponent': {
                    '0%': { transform: 'translateX(0)' },
                    '100%': { transform: 'translateX(90%)' },
                },

                'matchmaking-loading-dot': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
            },
            animation: {
                wiggle: 'wiggle 6s ease-in-out',
                blob: 'blob 7s ease-in-out  infinite',
                blob1: 'blob 8s ease-in-out infinite',
                blob2: 'blob 10s ease-in-out infinite',
                playball: 'playball 5s linear infinite',
                moveTop: 'moveTop 5s linear infinite',
                moveBottom: 'moveBottom 5s linear infinite',
                'slide-down-gate': 'slide-down-gate 200ms ease-out forwards 1s',
                'slide-up-gate': 'slide-up-gate 200ms ease-out forwards 1s',
                'slide-down-opponent':
                    'slide-down-opponent 200ms ease-out forwards 1s',
                'slide-up-player': 'slide-up-player 200ms ease-out forwards 1s',
                'slide-left-gate': 'slide-left-gate 200ms ease-out forwards 1s',
                'slide-right-gate':
                    'slide-right-gate 200ms ease-out forwards 1s',
                'slide-left-player':
                    'slide-left-player 200ms ease-out forwards 1s',
                'slide-right-opponent':
                    'slide-right-opponent 200ms ease-out forwards 1s',

                'first-dot':
                    'matchmaking-loading-dot 1s ease-in-out 0ms infinite',
                'second-dot':
                    'matchmaking-loading-dot 1s ease-in-out 150ms infinite',
                'third-dot':
                    'matchmaking-loading-dot 1s ease-in-out 300ms infinite',
                opacityUp: 'opacityUp 1s ease-in-out 1000ms 1',
            },
        },
    },
    plugins: [],
};
export default config;
