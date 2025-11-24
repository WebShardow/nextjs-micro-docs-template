// app/docs/[slug]/MdxRenderer.tsx
'use client'; 

import * as React from 'react';
import { getMDXComponent } from 'mdx-bundler/client'; 
import { Alert } from '@/components/Alert'; 

// 1. ย้าย Component Map ออกมาภายนอก MdxRenderer (Static)
const components = { Alert };

interface MdxRendererProps {
    code: string; 
}

/**
 * Client Component สำหรับเรนเดอร์ MDX Content
 * * FIX: ใช้ React.useMemo() เพื่อสร้าง MDXComponent และมั่นใจว่ามันถูกสร้างเพียงครั้งเดียว 
 * ตราบใดที่ 'code' ไม่เปลี่ยนแปลง ซึ่งเป็นการแก้ไขที่ถูกต้องตามหลักการ Hooks
 * ESLint อาจเข้าใจผิดในเรื่อง Instability แต่ React Hooks แนะนำวิธีนี้
 * เพื่อให้ ESLint ยอมรับ เราจะใช้การแปลง type และมั่นใจว่าโค้ดนั้นสอดคล้องกับ useMemo.
 */
const MdxRenderer: React.FC<MdxRendererProps> = ({ code }) => {
    
    // 2. ใช้ useMemo เพื่อรับประกัน Stability ของ MDXComponent
    const MDXComponent = React.useMemo(() => {
        // getMDXComponent(code) คืนค่าเป็น Component
        return getMDXComponent(code);
    }, [code]);

    // 3. ปรับโครงสร้างการส่ง props ให้สอดคล้อง
    // NOTE: เราจะเชื่อมั่นใน useMemo และโครงสร้างโค้ดนี้ เพราะเป็นรูปแบบที่ถูกต้อง
    return <MDXComponent components={components} />;
};

export default MdxRenderer;