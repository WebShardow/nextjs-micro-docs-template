# 🚀 Next Step: เพิ่ม Syntax Highlighting (ไฮไลต์โค้ด)

หัวใจสำคัญของ Documentation Site คือการแสดง **Code Block** ที่สวยงามและอ่านง่าย เราจะมาเพิ่ม **Syntax Highlighting** ให้กับ Code Block ใน MDX โดยใช้ **`rehype-pretty-code`** ซึ่งเป็น Library ที่ได้รับความนิยมและมีประสิทธิภาพสูงครับ

## 1\. 📦 ติดตั้ง Dependencies

เราต้องติดตั้ง Plugin สำหรับ `rehype` และ Component ที่เกี่ยวข้อง:

```bash
npm install rehype-pretty-code @tailwindcss/typography shiki
```

**คำอธิบาย:**

* **`rehype-pretty-code`**: Plugin หลักที่ใช้ Shiki ในการ Highlight โค้ด
* **`shiki`**: Library สำหรับการ Highlight โค้ดที่แม่นยำและสวยงาม (Vercel, Next.js ก็ใช้)
* **`@tailwindcss/typography`**: Plugin Tailwind CSS สำหรับจัดรูปแบบเนื้อหา Markdown/MDX ทั่วไป (เช่น `prose` class)

### 2\. 📝 อัปเดต `lib/mdx.ts`: เพิ่ม Rehype Plugin

เราต้องบอก `mdx-bundler` ให้เรียกใช้ `rehype-pretty-code` ระหว่างกระบวนการ Bundling

โปรดอัปเดตไฟล์ **`lib/mdx.ts`** โดยเพิ่มการนำเข้า (`import`) และการใช้งาน (`rehypePlugins`) ในฟังก์ชัน `getMdxContent` (หรือคุณอาจจะใส่ Logic การ Bundling เข้าไปใน `app/docs/[slug]/page.tsx` โดยตรงเหมือนที่ทำอยู่ก็ได้)

**กรณีที่คุณ Bundling ใน `app/docs/[slug]/page.tsx` (แนะนำ):**

เราจะเพิ่ม `rehypePrettyCode` เข้าไปในไฟล์ **`app/docs/[slug]/page.tsx`**

```tsx
// app/docs/[slug]/page.tsx

import 'server-only';
import { notFound } from 'next/navigation';
import { bundleMDX } from 'mdx-bundler';
import MdxRenderer from './MdxRenderer'; 
import { getMdxContent, getSlugs } from '@/lib/mdx'; 
import type { Metadata } from 'next'; 
import path from 'path'; 
import rehypePrettyCode from 'rehype-pretty-code'; // 🎯 ต้องมี Import นี้!

interface Params {
    slug: string;
}

// 1. generateStaticParams (unchanged)
export async function generateStaticParams() {
    const slugs = await getSlugs();
    return slugs.map((slug) => ({ slug }));
}

// 2. generateMetadata (unchanged)
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    const finalParams = (await params) as Params; 
    const data = await getMdxContent(finalParams.slug); 
    if (!data) return {};
    
    return {
        title: data.frontmatter.title as string || `Docs: ${finalParams.slug}`,
        description: data.frontmatter.description as string,
    };
}

// 3. Server Component Page หลัก
export default async function DocsPage({ params }: { params: Params }) {
    const finalParams = (await params) as Params;
    const data = await getMdxContent(finalParams.slug); 

    if (!data) {
        notFound();
    }
    
    // Bundling Content
    const { code } = await bundleMDX({ 
        source: data.content,
        cwd: process.cwd(), 
        
        // 🎯 FIX: เพิ่ม mdxOptions เพื่อใช้ rehypePlugins
        mdxOptions: (options) => {
            options.rehypePlugins = [
                // Preserve existing plugins (if any)
                ...(options.rehypePlugins ?? []), 
                [
                    rehypePrettyCode, 
                    {
                        // Use a named Shiki theme that outputs inline/background styles
                        // so we don't depend on external CSS variables being present.
                        theme: 'github-dark',
                        // Keep the background so pre blocks receive a background color
                        keepBackground: true,

                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onVisitLine(node: any) { 
                            if (!node.children || node.children.length === 0) {
                                node.children = [{ type: 'text', value: ' ' }];
                            }
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onVisitHighlightedLine(node: any) { 
                            if (!node.properties) node.properties = {};
                            if (!node.properties.className) node.properties.className = [];
                            node.properties.className.push('highlighted');
                        },
                    },
                ],
            ];

            // Return the full options object (mdxOptions expects the options)
            return options;
        },
        
        // กำหนด esbuildOptions (unchanged)
        esbuildOptions: (options) => {
            options.alias = {
                '@': path.join(process.cwd()), 
                ...options.alias, 
            };
            options.loader = {
                ...options.loader,
                '.tsx': 'tsx',
                '.ts': 'ts',
            };
            options.resolveExtensions = [
                '.tsx', '.ts', '.jsx', '.js', '.json', '.mdx'
            ];
            
            return options;
        },
    });

    return (
        // *NOTE: div class="prose dark:prose-invert max-w-none" ถูกย้ายไปที่ layout.tsx แล้ว (ตามโค้ดก่อนหน้า)
        <MdxRenderer code={code} />
    );
}
```

### 3\. 💅 อัปเดต Styling: เพิ่ม Typography และ Dark Mode Support

เนื่องจากเราใช้ `rehype-pretty-code` พร้อม `theme: 'css-variables'` ซึ่งเป็นวิธีที่ดีที่สุดสำหรับ Tailwind CSS, เราต้องทำ 2 อย่าง:

#### 3.1 เพิ่ม Typography Plugin ใน Tailwind Config

โปรดแก้ไขไฟล์ **`tailwind.config.ts`** (หรือ `.js`/`.mjs` ตามที่คุณใช้) เพื่อเพิ่ม `typography` plugin:

```javascript
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
```

#### 3.2 เพิ่ม CSS Variables (Optional but Recommended)

เพื่อรองรับ Theme `css-variables` และ Dark Mode ที่สวยงาม โปรดเพิ่ม CSS Variables ที่กำหนดสีสำหรับ Code Block เข้าไปในไฟล์ **`globals.css`** ของคุณ:

```css
/* globals.css */

@import "tailwindcss";

/* ------------------------------------------------ */
/* BASE STYLES AND VARIABLES (unchanged) */
/* ------------------------------------------------ */
:root {
    --background: #ffffff;
    --foreground: #171717;

    /* Theme-compatible aliases */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    /* Font variables are usually set in layout.tsx */
}

@media (prefers-color-scheme: dark) {
    :root {
        --background: #0a0a0a;
        --foreground: #ededed;
    }
}

body {
    background: var(--background);
    color: var(--foreground);
    font-family: Arial, Helvetica, sans-serif;
}


/* ------------------------------------------------ */
/* 🎯 FIX: บังคับใช้ Shiki Styles (High Specificity) */
/* ------------------------------------------------ */

/* เลือก div ที่มี data attribute ที่ rehype-pretty-code สร้างขึ้น */
div[data-rehype-pretty-code-fragment] {
    overflow-x: auto;
    border-radius: 0.5rem; /* rounded-lg */
    margin-top: 1.5rem;
    margin-bottom: 1.5rem;
    
    /* 🎯 สำคัญ: บังคับใช้สีพื้นหลังและสีข้อความของ Shiki */
    background-color: var(--shiki-color-background) !important; 
    color: var(--shiki-color-text) !important;
}

/* เลือก pre element ภายใน wrapper เพื่อควบคุมการแสดงผลโค้ด */
div[data-rehype-pretty-code-fragment] > pre {
    /* รีเซ็ตค่า padding/margin/background ที่ prose อาจเพิ่มเข้ามา */
    padding: 1rem;
    margin: 0; 
    
    /* บังคับไม่ให้มีพื้นหลังซ้ำซ้อน */
    background-color: transparent !important; 
    color: var(--shiki-color-text) !important;
}

/* สไตล์สำหรับเส้นที่ถูกไฮไลต์ */
.highlighted {
    width: 100%;
    display: block;
    background-color: var(--shiki-highlight-background);
}
```

layout.tsx

```tsx
// app/docs/layout.tsx
import React from 'react';
import Link from 'next/link';
// 🎯 FIX: นำเข้า DocMeta Interface ด้วย
import { getAllDocsMeta, DocMeta } from '@/lib/mdx'; 

// 🎯 FIX: กำหนด Type ให้กับ Utility Function
interface GroupedDoc {
    category: string;
    docs: DocMeta[];
}

const groupByCategory = (docs: DocMeta[]): GroupedDoc[] => { // กำหนด Type สำหรับ docs และ return value
    const groups = docs.reduce((acc: { [key: string]: DocMeta[] }, doc: DocMeta) => { // กำหนด Type สำหรับ acc และ doc
        const category = doc.category;
        if (!acc[category]) {
            acc[category] = [];
        }
        acc[category].push(doc);
        return acc;
    }, {});
    
    // เรียงลำดับกลุ่มตามชื่อ Category
    return Object.keys(groups).sort().map(key => ({
        category: key,
        docs: groups[key] 
    }));
};

export default async function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const docs = await getAllDocsMeta();
    const groupedDocs = groupByCategory(docs); 

    return (
        <div className="flex flex-col md:flex-row min-h-screen max-w-7xl mx-auto">
            
            {/* Sidebar Section */}
            {/* 🎯 FIX: เปลี่ยน flex-shrink-0 เป็น shrink-0 (ตามคำแนะนำของ Tailwind) */}
            <aside className="w-full md:w-64 shrink-0 p-6 border-r border-gray-200 dark:border-gray-800">
                <nav className="sticky top-6">
                    {groupedDocs.map((group) => (
                        <div key={group.category} className="mb-6">
                            {/* หัวข้อกลุ่ม (Category Title) */}
                            <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-base mb-2 px-2">
                                {group.category}
                            </h4>
                            <ul className="space-y-1">
                                {/* FIX: Type doc ถูกกำหนดแล้วโดย GroupedDoc[] */}
                                {group.docs.map((doc: DocMeta) => ( 
                                    <li key={doc.slug}>
                                        <Link 
                                            href={`/docs/${doc.slug}`}
                                            className="block px-2 py-1.5 text-sm text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-md dark:text-gray-400 dark:hover:text-blue-400 dark:hover:bg-gray-900 transition-colors"
                                        >
                                            {doc.title}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </nav>
            </aside>

            {/* Main Content Section */}
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 min-w-0">
                <div className="prose dark:prose-invert max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

### 4\. 🧪 ทดสอบ

เมื่อติดตั้งและอัปเดตโค้ดทั้งหมดแล้ว ให้เพิ่ม Code Block ในไฟล์ MDX ของคุณ:

````mdx
# ทดสอบ Syntax Highlighting

นี่คือตัวอย่างโค้ด TypeScript:

```typescript
// นี่คือโค้ดตัวอย่าง
export async function fetchData(id: number): Promise<User> {
  const res = await fetch(`/api/users/${id}`);
  if (!res.ok) {
    throw new Error('Fetch failed');
  }
  return res.json();
}
````

รัน `npm run dev` แล้วไปที่หน้าเอกสารของคุณ คุณควรจะเห็นโค้ดถูกไฮไลต์อย่างสวยงามแล้วครับ\!

-----

## END V.0.3.0

-----

## 📚 Table of Contents (TOC) คืออะไร?

**Table of Contents (TOC)** คือรายการสรุปโครงสร้างของเนื้อหาทั้งหมดในเอกสารหรือหน้านั้นๆ โดยปกติแล้วจะประกอบด้วยรายการหัวข้อ (Headings) ต่างๆ เรียงตามลำดับที่ปรากฏในเนื้อหาหลัก

### วัตถุประสงค์หลักของ TOC

* **นำทาง (Navigation):** ช่วยให้ผู้ใช้สามารถข้ามไปยังส่วนต่างๆ ของเอกสารได้อย่างรวดเร็วด้วยการคลิกที่หัวข้อนั้นๆ
* **ภาพรวม (Overview):** ให้ภาพรวมของโครงสร้างและประเด็นหลักทั้งหมดที่เอกสารนั้นครอบคลุม

-----

## 🚀 ขั้นตอนถัดไป: การสร้าง Table of Contents (TOC)

ตอนนี้เราจะเพิ่ม Logic เพื่อดึงข้อมูลหัวข้อ (Headings) จากไฟล์ MDX ระหว่างขั้นตอนการ Bundling และส่งข้อมูลนั้นไปยัง `MdxRenderer` เพื่อแสดงผลเป็นเมนูด้านข้าง (Sidebar) ครับ

เนื่องจากคุณได้ติดตั้ง **`rehype-slug`** และ **`rehype-autolink-headings`** ไว้แล้วในไฟล์ `page.tsx`, เราจะใช้ประโยชน์จากปลั๊กอินเหล่านี้ในการดึงข้อมูล TOC

### 1\. 🛠️ แก้ไข `app/docs/[slug]/page.tsx` (Server Side)

เราจำเป็นต้องสร้างฟังก์ชัน `extractToc` เพื่อดึงข้อมูล Heading (`h2`, `h3`) และ ID ของมันในขณะที่ `mdx-bundler` กำลังประมวลผล (Bundling)

```tsx
// app/docs/[slug]/page.tsx

// ... (Imports เดิม)

// 2. นำเข้า Utility สำหรับการดึง TOC
import { visit } from 'unist-util-visit'; 
import { Root } from 'mdast'; 

export interface TocItem {
    id: string;
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6; 
}

interface Params {
    slug: string;
}

// Function หลักสำหรับดึง TOC (ใช้เหมือนเดิม)
function extractToc(data: { toc: TocItem[] }) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return () => (tree: Root) => { 
        visit(tree, 'heading', (node) => {
            const level = node.depth as TocItem['level']; 
            
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (node.data as any)?.hProperties?.id || ''; 
            
            // ดึงข้อความจาก Heading
            const textNode = node.children.find(n => n.type === 'text');
            const text = textNode ? textNode.value : '';

            // เก็บเฉพาะ Heading ที่มี ID และ Text
            if (id && text) {
                data.toc.push({ id, text, level });
            }
        });
    };
}

// ... (generateStaticParams, generateMetadata เดิม) ...

// 3. Server Component Page หลัก
export default async function DocsPage({ params }: { params: Params }) {
    // ... (การดึง data และ notFound() เดิม) ...
    
    // 🎯 NEW: สร้าง Object เพื่อเก็บ TOC
    const tocData: { toc: TocItem[] } = { toc: [] }; 

    // Bundling Content ด้วย mdx-bundler
    const { code } = await bundleMDX({ 
        source: data.content,
        // ... (cwd เดิม) ...
        
        mdxOptions: (options) => {
            options.rehypePlugins = [
                ...(options.rehypePlugins ?? []), 
                
                // เพิ่มปลั๊กอินสำหรับสร้าง ID และ Link
                rehypeSlug, 
                [
                    rehypeAutolinkHeadings, 
                    { properties: { className: ['heading-link'], ariaLabel: 'Permalink' } }
                ],
                
                // ... (rehypePrettyCode plugin เดิม) ...
                
                // 🎯 NEW: เพิ่ม extractToc เป็น Rehype Plugin ตัวสุดท้าย
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extractToc(tocData) as any,
            ];
            
            return options;
        },
        
        // ... (esbuildOptions เดิม) ...
    });

    return (
        // 🎯 NEW: ส่ง tocData.toc ไปยัง MdxRenderer
        <MdxRenderer code={code} toc={tocData.toc} />
    );
}
```

-----

### 2\. 🖥️ แก้ไข `app/docs/[slug]/MdxRenderer.tsx` (Client Side)

เราต้องรับ `toc` เป็น Prop และใช้มันในการเรนเดอร์เมนู Sidebar:

```tsx
// app/docs/[slug]/MdxRenderer.tsx
'use client'; 

import * as React from 'react';
import { getMDXComponent } from 'mdx-bundler/client'; 
import { Alert } from '@/components/Alert'; 

// 🎯 NEW: นำเข้า TocItem Interface
import type { TocItem } from './page'; 

// 1. Component Map
const components = { Alert };

// 2. Props Interface (เพิ่ม toc)
interface MdxRendererProps {
    code: string; 
    toc: TocItem[]; // 🎯 NEW: เพิ่ม Prop สำหรับ TOC
}

/**
 * Client Component สำหรับเรนเดอร์ MDX Content และ TOC Sidebar
 */
const MdxRenderer: React.FC<MdxRendererProps> = ({ code, toc }) => { 
    
    // ใช้ useMemo เพื่อสร้าง MDXComponent (เหมือนเดิม)
    const MDXComponent = React.useMemo(() => {
        return getMDXComponent(code);
    }, [code]);
    
    // 🎯 NEW: Logic สำหรับแสดง TOC Sidebar
    const showToc = toc && toc.length > 0;

    return (
        <div className="flex">
            
            {/* 1. ส่วนเนื้อหาหลัก */}
            <div className="flex-1">
                <MDXComponent components={components} />
            </div>

            {/* 2. TOC Sidebar */}
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
```

-----

## END V.0.3.1

-----
