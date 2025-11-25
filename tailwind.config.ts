import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography'; // ต้อง import typography!

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './content/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // 🎯 NEW FIX: Override Typography Styling สำหรับ Code Block
            typography: {
                DEFAULT: {
                    css: {
                        // สำหรับ Inline Code (เพื่อให้มีพื้นหลังด้วย)
                        'code': {
                            // ต้องเป็น !important เช่นกัน
                            'backgroundColor': 'var(--shiki-color-background) !important',
                            'padding': '0.2rem 0.4rem !important',
                            'borderRadius': '0.3rem !important',
                            'color': 'var(--shiki-color-text) !important',
                            'fontFamily': `'Consolas', 'Monaco', 'Andale Mono', 'Ubuntu Mono', monospace !important`,
                        },
                    },
                },
            },
        },
    },
    plugins: [
        typography,
    ],
};

export default config;