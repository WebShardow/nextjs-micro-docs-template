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