# next.config.ts และ TSConfig

## การกำหนดค่า Next.js

เราต้องอัพเดทไฟล์ `next.config.ts` เพื่อบอกให้ Next.js ทราบว่าต้องประมวลผลไฟล์ `.mdx` หรือ `.md`

ไฟล์ : `next.config.ts` เราจะใช้ฟังก์ชัน `withMDX` จาก `@next/mdx` ในการห่อหุ้ม `Configuration` เดิมครับ

```TypeScript
// next.config.ts
import type { NextConfig } from "next";
import withMDX from "@next/mdx";

// 1. กำหนด MDX Loader
const withMdx = withMDX({
    extension: /\.mdx?$/, // รองรับทั้ง .mdx และ .md
    options: {
        // ใช้ Remark และ Rehype Plugins ที่นี่
        remarkPlugins: [],
        rehypePlugins: [],
        // ถ้าต้องการใช้ JSX ในไฟล์ .mdx ต้องตั้งค่าเป็น true
        providerImportSource: "@mdx-js/react",
    },
});

// 2. กำหนด Next.js Config
const nextConfig: NextConfig = {
    // ทำให้ Next.js ทราบว่าไฟล์ .mdx และ .md เป็นไฟล์เพจ
    pageExtensions: ["ts", "tsx", "js", "jsx", "md", "mdx"],
    /* config options here */
};

// 3. Export Config ที่ห่อหุ้มด้วย MDX
export default withMdx(nextConfig);
```
