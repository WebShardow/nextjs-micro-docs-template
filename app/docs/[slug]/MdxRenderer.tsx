// app/docs/[slug]/MdxRenderer.tsx
'use client'; 

import * as React from 'react';
import { getMDXComponent } from 'mdx-bundler/client'; 
import { Alert } from '@/components/Alert'; 
import type { TocItem } from './page'; 

// -----------------------------------------------------------
// 1. INTERFACES (ใช้ Props ของแท็ก HTML)
// -----------------------------------------------------------

// สำหรับ Heading Components (h1, h2, h3)
interface HeadingProps extends React.ComponentProps<"h1"> {
    children: React.ReactNode; 
}

// สำหรับ Code Block Component (pre)
interface PreProps extends React.ComponentProps<"pre"> {
    children: React.ReactNode; 
}


// -----------------------------------------------------------
// 2. HEADING COMPONENTS (บังคับ Font Size และ Spacing)
// -----------------------------------------------------------

// 💡 FIX: ใช้ Tailwind JIT Syntax text-Nxl! เพื่อบังคับขนาด Font
const H1: React.FC<HeadingProps> = ({ children, className, ...props }) => (
    <h1 
        {...props} 
        // 🎯 บังคับขนาด: text-3xl! สำหรับมือถือ, sm:text-4xl! สำหรับหน้าจอใหญ่
        className={`text-3xl! sm:text-4xl! font-extrabold my-8! ${className || ''}`}
    >
        {children}
    </h1>
);

const H2: React.FC<HeadingProps> = ({ children, className, ...props }) => (
    <h2 
        {...props} 
        // 🎯 บังคับขนาด: text-2xl! สำหรับมือถือ, sm:text-3xl! สำหรับหน้าจอใหญ่
        // เพิ่ม border-t เพื่อแยกหัวข้อหลัก (คล้ายการทำเส้นคั่นในเอกสาร)
        className={`text-2xl! sm:text-3xl! font-bold mt-10! mb-6! pt-4 border-t border-gray-700/50 ${className || ''}`}
    >
        {children}
    </h2>
);

const H3: React.FC<HeadingProps> = ({ children, className, ...props }) => (
    <h3 
        {...props} 
        // 🎯 บังคับขนาด: text-xl! สำหรับมือถือ, sm:text-2xl! สำหรับหน้าจอใหญ่
        className={`text-xl! sm:text-2xl! font-semibold mt-8! mb-4! ${className || ''}`}
    >
        {children}
    </h3>
);


// -----------------------------------------------------------
// 3. CODE BLOCK COMPONENT (บังคับ Padding และ Font)
// -----------------------------------------------------------
const CodeBlockWrapper: React.FC<PreProps> = ({ children, className, ...props }) => {
    
    // 💡 FIX: บังคับ Padding, Font, และ Color ด้วย JIT Syntax
    const finalClassName = `
        // Padding, Rounded, Margin, Overflow
        p-4 rounded-lg my-6 overflow-x-auto 
        
        // Font Style
        text-sm leading-relaxed font-mono 
        
        // 🎯 บังคับ Background/Text Color จาก CSS Variables ด้วย !important JIT Syntax
        bg-[var(--shiki-color-background)]! text-[var(--shiki-color-text)]!
        
        // รวม className เดิมที่อาจมี (เช่น 'highlighted')
        ${className || ''} 
    `;

    return (
        <pre 
            {...props} 
            className={finalClassName}
        >
            {children}
        </pre>
    );
};


// -----------------------------------------------------------
// 4. COMPONENT MAP (Static)
// -----------------------------------------------------------
const components = { 
    Alert,
    h1: H1,         // <-- แทนที่ h1 ด้วย Component ใหม่
    h2: H2,         // <-- แทนที่ h2 ด้วย Component ใหม่
    h3: H3,         // <-- แทนที่ h3 ด้วย Component ใหม่
    pre: CodeBlockWrapper, // <-- แทนที่ pre ด้วย Component ใหม่
};


// -----------------------------------------------------------
// 5. MAIN RENDERER
// -----------------------------------------------------------
interface MdxRendererProps {
    code: string; 
    toc: TocItem[];
}

/**
 * Client Component สำหรับเรนเดอร์ MDX Content และ TOC Sidebar
 */
const MdxRenderer: React.FC<MdxRendererProps> = ({ code, toc }) => { 
    
    const MDXComponent = React.useMemo(() => {
        return getMDXComponent(code);
    }, [code]);
    
    const showToc = toc && toc.length > 0;

    return (
        <div className="flex">
            
            {/* 1. ส่วนเนื้อหาหลัก */}
            <div className="flex-1">
                {/* 🎯 สำคัญ: MDXComponent ต้องถูกส่ง components map เข้าไป */}
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
                                    className={item.level === 3 ? 'ml-4' : ''} 
                                >
                                    <a 
                                        href={`#${item.id}`} 
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