// postcss.config.mjs

// 1. ใช้ import แทน require()
import typography from "@tailwindcss/typography";

const config = {
    plugins: [
        // ใช้ @tailwindcss/postcss (ซึ่งอาจจะยังต้องใช้ชื่อ string ถ้าไม่ได้ import)
        "@tailwindcss/postcss",
        // 2. ใช้ตัวแปรที่ import เข้ามา
        typography,
    ],
};

// 3. ใช้ export default แทน module.exports
export default config;
