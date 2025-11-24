// lib/mdx.ts

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter'; 
import 'server-only'; 

const CONTENT_DIR = path.join(process.cwd(), 'content', 'docs');

interface MdxData {
    content: string; 
    frontmatter: Record<string, unknown>; // Type Safety: ใช้ unknown แทน any
}

/**
 * ดึงชื่อไฟล์ .mdx ทั้งหมดจาก Content Directory
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
 */
export async function getMdxContent(slug: string): Promise<MdxData | null> {
    const filePath = path.join(CONTENT_DIR, `${slug}.mdx`);
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const { data: frontmatter, content } = matter(fileContent);
        return { content, frontmatter };
    } catch (_) { // ใช้ (_) เพื่อไม่ให้ ESLint แจ้งเตือน
        return null; 
    }
}