// eslint.config.mts

import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import { defineConfig } from "eslint/config";

export default defineConfig([
    // 1. Base config for JS files
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        plugins: { js },
        extends: [js.configs.recommended],
        languageOptions: { globals: globals.browser }
    },

    // 2. TypeScript recommended config
    tseslint.configs.recommended,
    
    // 2.1. FIX: เพิ่มการตั้งค่าเพื่ออนุญาตให้ตัวแปรที่ขึ้นต้นด้วย '_' ถูกละเว้น
    {
        files: ["**/*.{ts,mts,cts,tsx}"], // ใช้สำหรับไฟล์ TypeScript โดยเฉพาะ
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error", 
                { 
                    "argsIgnorePattern": "^_", 
                    "varsIgnorePattern": "^_",
                    // อนุญาตให้ตัวแปรใน catch block ถูกละเว้นได้ (สำคัญสำหรับ lib/mdx.ts)
                    "caughtErrorsIgnorePattern": "^_" 
                }
            ],
        }
    },


    // 3. React recommended config 
    // NOTE: ลบ @ts-expect-error ออกแล้ว เนื่องจาก TypeScript ไม่ตรวจพบข้อผิดพลาดอีกต่อไป
    pluginReact.configs.flat.recommended, 

    // 4. CONFIG OVERRIDES (ปิด Rules ที่ไม่จำเป็นใน Next.js/React 17+)
    {
        files: ["**/*.{jsx,tsx}"],

        settings: {
            react: { version: 'detect' },
        },

        rules: {
            // ปิด Rule react/react-in-jsx-scope (สำหรับ New JSX Transform)
            "react/react-in-jsx-scope": "off",

            // ปิด Rule react/require-default-props (สำหรับ TypeScript)
            "react/require-default-props": "off",
        }
    }
]);