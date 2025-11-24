# การใช้งาน Route Handler (API)

## ความแตกต่างของ Next.js Routing Structure

ใน Next.js App Router การกำหนดชื่อโฟลเดอร์มีผลโดยตรงต่อการกำหนดเส้นทาง (URL) และการดึงข้อมูล

### 1. 📁 Static Route: `app/docs/getting-started/page.tsx`

| ลักษณะ | รายละเอียด | เหตุผลที่เราใช้ใน MDX ตอนนี้ |
| :--- | :--- | :--- |
| **URL ที่เข้าถึง** | `/docs/getting-started` เท่านั้น | เราทราบชื่อไฟล์เอกสารที่ต้องการแสดงผล **แน่นอน** |
| **ความยืดหยุ่น** | ต่ำ | ทุกครั้งที่เพิ่มหน้าใหม่ ต้องสร้างโฟลเดอร์ใหม่ทั้งหมด |
| **การทำงาน** | **Static Route** (เส้นทางคงที่) | ง่ายต่อการตั้งค่าและทดสอบในระยะเริ่มต้น |

### 2. 📁 Dynamic Route: `app/docs/[slug]/page.tsx`

| ลักษณะ | รายละเอียด | ข้อจำกัดที่เราหลีกเลี่ยงในตอนแรก |
| :--- | :--- | :--- |
| **URL ที่เข้าถึง** | สามารถเข้าถึงได้ทุก URL เช่น `/docs/features`, `/docs/installation`, `/docs/api` | ยืดหยุ่นสูง สามารถใช้เส้นทางเดียวสำหรับเอกสารทุกหน้า |
| **ความยืดหยุ่น** | สูง | เหมาะสำหรับเว็บไซต์บล็อก/เอกสารที่มีไฟล์จำนวนมาก |
| **การทำงาน** | **Dynamic Route** (เส้นทางแบบไดนามิก) | **ต้องมีการเขียนโค้ดเพิ่มเติม** เพื่ออ่านไฟล์ `.mdx` จากระบบไฟล์ (File System) และทำการแปลง (Bundle) โดยใช้ฟังก์ชัน `generateStaticParams()` และ `readFile()` |

---

## 🎯 เหตุผลที่เราใช้ Static Route ในการแก้ไขปัญหา MDX

ที่เราเลือกใช้ **`app/docs/getting-started/`** แทน **`app/docs/[slug]/`** ในการแก้ไขปัญหาเมื่อกี้ มีเหตุผลหลักด้านเทคนิคเพื่อหลีกเลี่ยงความซับซ้อนเพิ่มเติม :

1. **การแยกปัญหา (Isolation of Concerns):**
    * ปัญหาหลักของเราคือ **Client/Server Context Error** ที่เกิดจากการใช้ MDX
    * การใช้ Static Route ทำให้เราสามารถ **มุ่งเน้นการแก้ไขปัญหา Context** ภายในโค้ด `page.tsx` และ `content.mdx` โดย **ไม่ต้องเพิ่มความซับซ้อน** ของการจัดการ File System, การอ่านไฟล์ MDX, และการทำ Dynamic Rendering

2. **การตั้งค่าที่ง่ายกว่า (Simpler Setup):**
    * Next.js สามารถเรนเดอร์ไฟล์ที่อยู่ในโครงสร้าง Static Route ได้โดยตรงและง่ายกว่ามาก
    * ถ้าเราใช้ Dynamic Route **`[slug]`** เราจะต้อง:
        * ติดตั้งไลบรารีสำหรับ **อ่านไฟล์** (Node.js `fs`).
        * ติดตั้งไลบรารีสำหรับ **Bundle MDX** (`mdx-bundler` หรือ `contentlayer`).
        * เขียนฟังก์ชัน **`generateStaticParams`** (Server Component) เพื่อบอก Next.js ว่ามี Slug อะไรบ้าง.

ดังนั้น การใช้ Static Route จึงเป็น **ขั้นตอนแรกที่ดีที่สุด** เพื่อตรวจสอบให้แน่ใจว่าการเชื่อมต่อระหว่าง **Next.js** ➡️ **Tailwind Typography** ➡️ **MDX Context** นั้นทำงานอย่างถูกต้องก่อนที่จะก้าวไปสู่ความยืดหยุ่นแบบ Dynamic Route

---

## END V.0.1.0 🚀 ขั้นตอนต่อไป : การเปลี่ยนเป็น Dynamic Route (Start V.0.1.1)

เราต้องการให้เว็บไซต์เอกสารนี้สามารถรองรับเอกสารหลายร้อยหน้าได้อย่างยืดหยุ่น  ดังนั้น เราจะเปลี่ยนไปใช้ Dynamic Route

---

แน่นอนครับ\! เพื่อให้ภาพรวมชัดเจนและสามารถตรวจสอบโค้ดได้ง่าย ผมได้สรุปขั้นตอนการทำ **Dynamic Route** สำหรับระบบ MDX Documentation Site บน **Next.js 16 App Router** พร้อมโค้ดฉบับเต็มของแต่ละไฟล์ที่เราได้แก้ไขและปรับปรุงจนสำเร็จแล้วครับ

---

## 🛠️ โครงสร้างไฟล์หลัก (Core Dynamic Route)

| ไฟล์ | ตำแหน่ง | หน้าที่หลัก |
| :--- | :--- | :--- |
| **`mdx.ts`** | `lib/` | Server Logic: อ่านไฟล์, แยก Frontmatter, ดึง Slug |
| **`page.tsx`** | `app/docs/[slug]/` | Server Component: ดึงข้อมูล, **Bundling MDX**, ทำ SEO (`generateMetadata`) |
| **`MdxRenderer.tsx`** | `app/docs/[slug]/` | Client Component: เรนเดอร์ MDX ที่ถูก Compile แล้ว |
| **`Alert.tsx`** | `components/` | Custom Component ตัวอย่างที่ใช้ใน MDX |
| **`getting-started.mdx`** | `content/docs/` | ไฟล์เนื้อหา MDX |

---

## 1\. ⚙️ `lib/mdx.ts`: Logic การอ่านไฟล์ (Server Logic)

ไฟล์นี้ทำงานฝั่ง Server เท่านั้น (`'server-only'`) ทำหน้าที่ติดต่อกับ File System เพื่ออ่านไฟล์ MDX

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

// 1. ดึงชื่อ Slug ทั้งหมดเพื่อใช้ใน generateStaticParams
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

// 2. อ่านเนื้อหา MDX และแยก Frontmatter
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

// 3. ฟังก์ชันสำหรับ Sidebar (ที่เราเพิ่งเพิ่ม)
interface DocMeta {
    slug: string;
    title: string;
}

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
                    };
                })
        );
        return docs;
    } catch (_) {
        return [];
    }
}
```

---

## 2\. 🚀 `app/docs/[slug]/page.tsx`: Dynamic Route Handler (Server Component)

ไฟล์นี้จัดการการดึงข้อมูล, การทำ Bundling และการกำหนด Metadata

```tsx
// app/docs/[slug]/page.tsx

import 'server-only';
import { notFound } from 'next/navigation';
import { bundleMDX } from 'mdx-bundler';
import MdxRenderer from './MdxRenderer'; 
import { getMdxContent, getSlugs } from '@/lib/mdx'; 
import type { Metadata } from 'next'; 
import path from 'path'; // ต้องใช้ path สำหรับ esbuildOptions

interface Params {
    slug: string;
}

// 1. สร้างพารามิเตอร์สำหรับ Static Rendering (SSG)
export async function generateStaticParams() {
    const slugs = await getSlugs();
    return slugs.map((slug) => ({ slug }));
}

// 2. สร้าง Metadata (SEO) จาก Frontmatter
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    // FIX: Unwrap params สำหรับ Next.js 16+
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
    // FIX: Unwrap params ก่อนนำไปใช้
    const finalParams = (await params) as Params;
    const data = await getMdxContent(finalParams.slug); 

    if (!data) notFound();
    
    // Bundling Content ด้วย mdx-bundler
    const { code } = await bundleMDX({ 
        source: data.content,
        // FIX: เพิ่ม cwd เพื่อช่วย esbuild ในการหาไฟล์
        cwd: process.cwd(), 
        
        esbuildOptions: (options) => {
            // 🎯 FIX: กำหนด Alias Path (@/)
            options.alias = {
                '@': path.join(process.cwd()), 
                ...options.alias, 
            };
            // กำหนด Loader ให้ esbuild รู้จักไฟล์ .tsx
            options.loader = {
                ...options.loader,
                '.tsx': 'tsx',
                '.ts': 'ts',
            };
            // กำหนด Extensions ที่ควร Resolve
            options.resolveExtensions = [
                '.tsx', '.ts', '.jsx', '.js', '.json', '.mdx'
            ];
            
            return options;
        },
    });

    return (
        // MdxRenderer เป็น Client Component ที่แสดงผลโค้ดที่ Bundle แล้ว
        <MdxRenderer code={code} />
    );
}
```

---

## 3\. 🎨 `app/docs/[slug]/MdxRenderer.tsx`: Client-Side Renderer

ไฟล์นี้ทำหน้าที่รับโค้ดที่ถูกคอมไพล์แล้วมาแสดงผลใน Browser

```tsx
// app/docs/[slug]/MdxRenderer.tsx
'use client'; 

import * as React from 'react';
import { getMDXComponent } from 'mdx-bundler/client'; 
import { Alert } from '@/components/Alert'; 

// Component ที่จะถูกใช้งานใน MDX
const components = { Alert };

interface MdxRendererProps {
    code: string; 
}

const MdxRenderer: React.FC<MdxRendererProps> = ({ code }) => {
    
    // ใช้ useMemo เพื่อรับประกัน Stability ของ MDXComponent และเพิ่มประสิทธิภาพ
    const MDXComponent = React.useMemo(() => {
        return getMDXComponent(code);
    }, [code]);

    return <MDXComponent components={components} />;
};

export default MdxRenderer;
```

---

## 4\. 📝 `components/Alert.tsx`: ตัวอย่าง Component ที่ใช้ใน MDX

Component ที่เป็นตัวอย่างการเรียกใช้ในไฟล์ MDX

```tsx
// components/Alert.tsx
'use client';

import * as React from 'react';

// ... (Interface และ Style Definitions ตามโค้ดที่คุณมี) ...
interface AlertProps {
    children: React.ReactNode;
    title?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

const styles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    // ... (ส่วนที่เหลือ)
};


export const Alert: React.FC<AlertProps> = ({ children, title, type = 'info' }) => {
    const style = styles[type] || styles.info;

    return (
        <div className={`p-4 border-l-4 rounded-lg my-4 ${style}`} role="alert">
            {title && <p className="font-bold">{title}</p>}
            <div>{children}</div>
        </div>
    );
};
```

---

## 5\. 📄 `content/docs/getting-started.mdx`: ไฟล์เนื้อหาตัวอย่าง

แสดงการใช้งาน Frontmatter และ Custom Component

```mdx
---
title: การเริ่มต้นใช้งาน (Getting Started)
description: คู่มือเริ่มต้นสำหรับ Next.js, Tailwind CSS และ MDX
author: DevG
date: 2025-11-24
---

import { Alert } from '@/components/Alert';

# การเริ่มต้นใช้งาน (Getting Started)

นี่คือเนื้อหาเอกสารแรกของคุณที่ถูกจัดการด้วยระบบ **Dynamic MDX**

## 🎯 คุณสมบัติที่สำคัญ

* **Frontmatter:** ข้อมูล Metadata ด้านบนถูกอ่านและนำมาใช้ได้
* **Component Usage:** รองรับการใช้ React Components ภายใน MDX.

<Alert title="สำเร็จแล้ว!" type="success">
    ระบบ Dynamic MDX Content API ทำงานได้อย่างสมบูรณ์!
</Alert>
```

---

## END V.0.1.1

---
