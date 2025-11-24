// app/docs/[slug]/MdxRenderer.tsx
'use client'; 

import * as React from 'react';
import { getMDXComponent } from 'mdx-bundler/client'; 
import { Alert } from '@/components/Alert'; 

// 🎯 NEW: นำเข้า TocItem Interface
import type { TocItem } from './page'; 

// Component Map (Static)
const components = { Alert };

// Props Interface (รวม code และ toc)
interface MdxRendererProps {
    code: string; 
    toc: TocItem[];
}

/**
 * Client Component สำหรับเรนเดอร์ MDX Content และ TOC Sidebar
 */
const MdxRenderer: React.FC<MdxRendererProps> = ({ code, toc }) => { 
    
    // ใช้ useMemo เพื่อสร้าง Component จากโค้ด MDX ที่ Bundle แล้ว
    const MDXComponent = React.useMemo(() => {
        // getMDXComponent(code) คืนค่าเป็น Component
        return getMDXComponent(code);
    }, [code]);
    
    // ตรวจสอบว่ามี TOC หรือไม่
    const showToc = toc && toc.length > 0;

    return (
        <div className="flex">
            
            {/* 1. ส่วนเนื้อหาหลัก */}
            <div className="flex-1">
                <MDXComponent components={components} />
            </div>

            {/* 2. TOC Sidebar (แสดงผลเมื่อมีข้อมูลเท่านั้น) */}
            {showToc && (
                <aside className="w-64 ml-12 hidden lg:block sticky top-20 h-fit">
                    <h3 className="text-lg font-bold mb-3 dark:text-gray-100">On This Page</h3>
                    <nav>
                        <ul className="space-y-2 text-sm">
                            {toc.map((item) => (
                                <li 
                                    key={item.id} 
                                    // ปรับ indent ตามระดับ Heading (h3 จะเยื้องเข้า)
                                    className={item.level === 3 ? 'ml-4' : ''} 
                                >
                                    <a 
                                        href={`#${item.id}`} 
                                        // ปรับ Tailwind CSS ให้คลิกง่ายขึ้นและมี hover effect สวยงาม
                                        className="text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-900 transition-colors block py-0.5 px-1"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </aside>
            )}
        </div>
    );
};

export default MdxRenderer;