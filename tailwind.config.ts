// tailwind.config.ts

import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';

const config: Config = {
    content: [
        // ... (paths เดิม)
    ],
    darkMode: 'class',
    theme: {
        extend: {
            // 🎯 NEW: Override Typography Styling สำหรับ Code Block
            typography: {
                // กำหนดให้ 'DEFAULT' theme (หรือ 'lg', 'xl' ตามที่คุณใช้)
                DEFAULT: {
                    css: {
                        // บังคับให้พื้นหลังของ <pre> ใช้ตัวแปร CSS ของ Shiki
                        'pre': {
                            // ใช้ตัวแปรสีพื้นหลังและสีข้อความที่เรากำหนดใน globals.css
                            'backgroundColor': 'var(--shiki-color-background)', 
                            'color': 'var(--shiki-color-text)', 
                            
                            // ปิด border radius/padding ของ prose default
                            'borderRadius': '0.5rem', 
                            'padding': '1rem',
                        },
                        // อาจจำเป็นต้องปิดสี background ที่ prose กำหนดให้ code inline
                        // 'code': {
                        //     'backgroundColor': 'transparent',
                        //     'color': 'var(--shiki-color-text)',
                        // },
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