# การตั้งค่า Tailwind (postcss.config.*, globals.css)

## 🎨 การตั้งค่า Tailwind CSS v4

โปรเจกต์นี้ใช้ **Tailwind CSS v4** ซึ่งเป็นการเปลี่ยนแปลงครั้งสำคัญในการติดตั้งและการกำหนดค่า โดยใช้ PostCSS Plugin ใหม่

## 1. การกำหนดค่า PostCSS

Tailwind CSS v4 ใช้เพียง `@tailwindcss/postcss` เป็น Plugin ใน `postcss.config.cjs` หรือ `postcss.config.mjs`

### ไฟล์: `postcss.config.cjs`

ไฟล์นี้ถูกสร้างขึ้นเพื่อรองรับการตั้งค่า PostCSS ที่เรียบง่าย

```javascript
// postcss.config.cjs
const config = {
    // ใช้ @tailwindcss/postcss เป็น Plugin เดียว
    plugins: ["@tailwindcss/postcss"],
};

module.exports = config;
```

## 2. อัพเดท Tailwind CSS Configuration

เนื่องจากโปรเจกต์ของคุณใช้ Tailwind CSS v4 การกำหนดค่าจะอยู่ในไฟล์ `postcss.config.cjs` (หรือ `.mjs`) ร่วมกับ `@tailwindcss/postcss`

### ไฟล์ : `postcss.config.cjs`

เราจะเพิ่ม require('@tailwindcss/typography') ในรายการ `Plugins:`

```JavaScript
// postcss.config.cjs
const config = {
    // เพิ่ม @tailwindcss/typography ในรายการ plugins
    plugins: [
        "@tailwindcss/postcss",
        require('@tailwindcss/typography'), // 👈 เพิ่มบรรทัดนี้
    ],
};

module.exports = config;
```
