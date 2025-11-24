# 🚀 Next Step : สร้าง Sidebar Navigation และหน้าสารบัญ

เพื่อให้เว็บไซต์ดูเป็น **Documentation Site** อย่างแท้จริง เราขาดไม่ได้คือ **Sidebar** ด้านข้างเพื่อให้ผู้ใช้งานคลิกเปลี่ยนหน้าได้ง่ายๆ โดยไม่ต้องพิมพ์ URL เอง

เราจะมาทำ 2 สิ่งนี้กันครับ:

1. **อัปเกรด `lib/mdx.ts`** ให้ดึงข้อมูลรายการเอกสารทั้งหมด (Title + Slug) ได้
2. **อัปเกรด `app/docs/layout.tsx`** ให้มี Sidebar แสดงรายชื่อเอกสาร

-----

## 1\. 🛠️ อัปเกรด `lib/mdx.ts`: ดึงรายการเอกสารทั้งหมด

เราต้องการฟังก์ชันใหม่ชื่อ `getAllDocsMeta` เพื่อดึงชื่อเรื่อง (Title) และ Slug ของทุกไฟล์มาสร้างเมนู

โปรดอัปเดตไฟล์ **`lib/mdx.ts`** เพิ่มฟังก์ชันนี้เข้าไปครับ:

```typescript
// lib/mdx.ts

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; 
import 'server-only'; 

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

// ... (interface MdxData และ functions เดิม getSlugs, getMdxContent เก็บไว้เหมือนเดิม) ...

interface DocMeta {
    slug: string;
    title: string;
}

// 🎯 NEW: ฟังก์ชันสำหรับดึงรายการเอกสารทั้งหมดเพื่อทำเมนู
export async function getAllDocsMeta(): Promise<DocMeta[]> {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        
        // อ่านข้อมูลทีละไฟล์
        const docs = await Promise.all(
            files
                .filter(file => file.endsWith('.mdx'))
                .map(async (file) => {
                    const slug = file.replace(/\.mdx$/, '');
                    const filePath = path.join(CONTENT_DIR, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const { data: frontmatter } = matter(fileContent);
                    
                    return {
                        slug,
                        title: (frontmatter.title as string) || slug, // ถ้าไม่มี title ให้ใช้ slug แทน
                    };
                })
        );

        return docs;
    } catch (_) {
        return [];
    }
}
```

-----

## 2\. 🎨 อัปเกรด `app/docs/layout.tsx`: เพิ่ม Sidebar

เราจะเปลี่ยน Layout จากเดิมที่แค่จัดกึ่งกลาง ให้กลายเป็นโครงสร้าง **Sidebar (ซ้าย) + Content (ขวา)**

โปรดแก้ไขไฟล์ **`app/docs/layout.tsx`** ดังนี้:

```tsx
// app/docs/layout.tsx
import React from 'react';
import Link from 'next/link';
import { getAllDocsMeta } from '@/lib/mdx'; // นำเข้าฟังก์ชันใหม่

export default async function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // 1. ดึงข้อมูลเอกสารทั้งหมดมาสร้างเมนู
    const docs = await getAllDocsMeta();

    return (
        <div className="flex flex-col md:flex-row min-h-screen max-w-7xl mx-auto">
            
            {/* 2. Sidebar Section */}
            <aside className="w-full md:w-64 shrink-0 p-6 border-r border-gray-200 dark:border-gray-800">
                <nav className="sticky top-6">
                    <h3 className="font-bold text-lg mb-4 px-2">Documentation</h3>
                    <ul className="space-y-1">
                        {docs.map((doc) => (
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
                </nav>
            </aside>

            {/* 3. Main Content Section */}
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 min-w-0">
                {/* min-w-0 ช่วยป้องกัน content ล้นใน flex container */}
                <div className="prose dark:prose-invert max-w-none">
                    {children}
                </div>
            </main>
        </div>
    );
}
```

-----

### 🧪 ทดสอบผลลัพธ์

1. สร้างไฟล์ MDX เพิ่มอีกสัก 1 ไฟล์ เพื่อให้เห็นภาพเมนูชัดเจนขึ้น เช่น `content/docs/features.mdx`

    ```mdx
    ---
    title: ฟีเจอร์หลัก (Features)
    ---
    # ฟีเจอร์ของเรา
    นี่คือหน้าทดสอบหน้าที่สอง...
    ```

2. รัน `npm run dev`
3. เข้าไปที่ **[http://localhost:3002/docs/getting-started](http://localhost:3002/docs/getting-started)**

ตอนนี้คุณควรจะเห็น :

* **ด้านซ้าย:** มีเมนู Sidebar แสดงรายชื่อเอกสารทั้งหมด
* **ด้านขวา:** แสดงเนื้อหา MDX
* **การคลิก:** สามารถคลิกเปลี่ยนหน้าระหว่างเอกสารได้ทันที (SPA Feel)

-----

## END V.0.2.0

-----

เพิ่ม **หัวข้อ (Category/Section)** และการ **เรียงลำดับ (Sorting)** เป็นสิ่งที่สำคัญมากสำหรับการทำ Documentation Site

เราสามารถทำได้โดยการเพิ่มข้อมูลการจัดเรียงเข้าไปใน **Frontmatter** ของไฟล์ MDX และใช้ Logic ใน **`lib/mdx.ts`** ในการจัดการ

-----

## 1\. 📝 การเพิ่มข้อมูลจัดเรียง (Frontmatter)

เราจะใช้ Field ชื่อ `order` ใน Frontmatter เพื่อกำหนดลำดับความสำคัญของเอกสาร (ยิ่งตัวเลขน้อย ยิ่งอยู่บน)

### ตัวอย่าง: `content/docs/getting-started.mdx`

เพิ่ม Field `order` เข้าไปในส่วน Frontmatter:

```mdx
---
title: การเริ่มต้นใช้งาน (Getting Started)
description: คู่มือเริ่มต้นสำหรับ Next.js, Tailwind CSS และ MDX
author: DevG
date: 2025-11-24
order: 1  <-- 🎯 เอกสารนี้ควรอยู่ลำดับที่ 1 (บนสุด)
---

import { Alert } from '@/components/Alert';

# การเริ่มต้นใช้งาน (Getting Started)

...
```

### ตัวอย่าง: `content/docs/features.mdx` (เอกสารใหม่)

```mdx
---
title: ฟีเจอร์หลักของระบบ
description: คุณสมบัติหลักที่ควรรู้
author: DevG
date: 2025-11-25
order: 2  <-- 🎯 เอกสารนี้ควรอยู่ลำดับที่ 2
---

# ฟีเจอร์หลัก
...
```

-----

## 2\. ⚙️ การเรียงลำดับเอกสารใน `lib/mdx.ts`

เราต้องแก้ไขฟังก์ชัน **`getAllDocsMeta`** ในไฟล์ `lib/mdx.ts` เพื่อให้มันอ่านค่า `order` และทำการเรียงลำดับก่อนส่งข้อมูลกลับไป

โปรดแก้ไขไฟล์ **`lib/mdx.ts`** ในส่วนของฟังก์ชัน `getAllDocsMeta` ดังนี้:

```typescript
// lib/mdx.ts

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; 
import 'server-only'; 

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

interface MdxData {
    content: string; 
    frontmatter: Record<string, unknown>;
}

export interface DocMeta { 
    slug: string;
    title: string;
    order: number; 
    category: string; 
}

/**
 * ดึงชื่อ Slug ทั้งหมดเพื่อใช้ใน generateStaticParams
 * @exports
 */
export async function getSlugs(): Promise<string[]> {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        return files
            .filter(file => file.endsWith('.mdx'))
            .map(file => file.replace(/\.mdx$/, ''));
    } catch (_) { 
        console.error(`Error reading content directory: ${CONTENT_DIR}`);
        return [];
    }
}

/**
 * อ่านเนื้อหา MDX และแยก Frontmatter ออกมาตาม Slug ที่กำหนด
 * @exports
 */
export async function getMdxContent(slug: string): Promise<MdxData | null> {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);
        return { content, frontmatter };
    } catch (_) {
        return null; 
    }
}

/**
 * ดึงรายการเอกสารทั้งหมด (สำหรับ Sidebar Navigation)
 * พร้อมการเรียงลำดับ
 */
export async function getAllDocsMeta(): Promise<DocMeta[]> {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        
        const docs = await Promise.all(
            files
                .filter(file => file.endsWith('.mdx'))
                .map(async (file) => {
                    const slug = file.replace(/\.mdx$/, '');
                    const filePath = path.join(CONTENT_DIR, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const { data: frontmatter } = matter(fileContent);
                    
                    return {
                        slug,
                        title: (frontmatter.title as string) || slug,
                        order: (frontmatter.order as number) || 999, // 🎯 ถ้าไม่มี order ให้ค่าเป็น 999 (อยู่ท้ายสุด)
                        category: (frontmatter.category as string) || 'ทั่วไป', // 🎯 NEW: ถ้าไม่มี category ให้เป็น 'ทั่วไป'
                    };
                })
        );
        
        // 🎯 FIX: ทำการเรียงลำดับเอกสารตามค่า 'order'
        docs.sort((a, b) => a.order - b.order); 

        return docs; 
    } catch (_) {
        return [];
    }
}
```

-----

## 3\. 🧩 การจัดกลุ่มเอกสาร (Grouping/Sections)

หากคุณต้องการจัดกลุ่มเอกสารเป็น **"หัวข้อใหญ่"** (เช่น 'Basic', 'Advanced', 'API Reference') ใน Sidebar เราต้องเพิ่ม Field `category` เข้าไปใน Frontmatter และปรับ Logic ใน Layout.

### 3.1 เพิ่ม `category` ใน Frontmatter

เพิ่ม Field `category` ในไฟล์ MDX ทุกไฟล์:

```mdx
---
title: การเริ่มต้นใช้งาน (Getting Started)
...
order: 1
category: เริ่มต้นใช้งาน  <-- 🎯 NEW: กำหนดกลุ่ม
---
```

### 3.2 อัปเดต Interface ใน `lib/mdx.ts`

เพิ่ม `category` ใน `DocMeta`:

```typescript
// lib/mdx.ts

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; 
import 'server-only'; 

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

interface MdxData {
    content: string; 
    frontmatter: Record<string, unknown>;
}

export interface DocMeta { 
    slug: string;
    title: string;
    order: number; 
    category: string; 
}

/**
 * ดึงชื่อ Slug ทั้งหมดเพื่อใช้ใน generateStaticParams
 * @exports
 */
export async function getSlugs(): Promise<string[]> {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        return files
            .filter(file => file.endsWith('.mdx'))
            .map(file => file.replace(/\.mdx$/, ''));
    } catch (_) { 
        console.error(`Error reading content directory: ${CONTENT_DIR}`);
        return [];
    }
}

/**
 * อ่านเนื้อหา MDX และแยก Frontmatter ออกมาตาม Slug ที่กำหนด
 * @exports
 */
export async function getMdxContent(slug: string): Promise<MdxData | null> {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);
        return { content, frontmatter };
    } catch (_) {
        return null; 
    }
}

/**
 * ดึงรายการเอกสารทั้งหมด (สำหรับ Sidebar Navigation)
 * พร้อมการเรียงลำดับ
 */
export async function getAllDocsMeta(): Promise<DocMeta[]> {
    try {
        const files = await fs.readdir(CONTENT_DIR);
        
        const docs = await Promise.all(
            files
                .filter(file => file.endsWith('.mdx'))
                .map(async (file) => {
                    const slug = file.replace(/\.mdx$/, '');
                    const filePath = path.join(CONTENT_DIR, file);
                    const fileContent = await fs.readFile(filePath, 'utf-8');
                    const { data: frontmatter } = matter(fileContent);
                    
                    return {
                        slug,
                        title: (frontmatter.title as string) || slug,
                        order: (frontmatter.order as number) || 999, // 🎯 ถ้าไม่มี order ให้ค่าเป็น 999 (อยู่ท้ายสุด)
                        category: (frontmatter.category as string) || 'ทั่วไป', // 🎯 NEW: ถ้าไม่มี category ให้เป็น 'ทั่วไป'
                    };
                })
        );
        
        // 🎯 FIX: ทำการเรียงลำดับเอกสารตามค่า 'order'
        docs.sort((a, b) => a.order - b.order); 

        return docs; 
    } catch (_) {
        return [];
    }
}
```

### 3.3 จัดกลุ่มใน `app/docs/layout.tsx` (การแสดงผล)

Layout จะรับข้อมูลที่ถูกเรียงลำดับมาแล้ว จากนั้นทำการจัดกลุ่มก่อนแสดงผล

โปรดแก้ไขไฟล์ **`app/docs/layout.tsx`** ดังนี้:

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

-----

## END V.0.2.1

-----
