// app/docs/getting-started/page.tsx
'use client'; // 👈 สำคัญ: บังคับให้ไฟล์นี้เป็น Client Component

import * as React from 'react';
// 1. Import ไฟล์ MDX Content (เปลี่ยนชื่อแล้ว)
// Next.js จะคอมไพล์ content.mdx ให้เป็น React Component ชื่อ MdxContent
import MdxContent from './content.mdx';

// 2. Import Custom Component ที่ใช้ใน MDX
import { Alert } from '@/components/Alert';

// 3. กำหนด Component Map
const components = {
    Alert,
    // สามารถ Override แท็ก HTML พื้นฐานได้ที่นี่ เช่น:
    // h1: (props) => <h1 className="text-4xl font-bold mt-8" {...props} />,
};

/**
 * Page Component หลักที่ใช้ Client Component เพื่อเรนเดอร์ MDX Content
 */
export default function GettingStartedPage() {
    // MdxContent คือ Component ที่คอมไพล์จาก content.mdx
    // เราส่ง components prop เข้าไปเพื่อให้ MDX Runtime รู้จัก Alert Component
    return (
        <MdxContent components={components} />
    );
}