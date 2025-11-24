// app/docs/[slug]/page.tsx

import 'server-only';
import { notFound } from 'next/navigation';
import { bundleMDX } from 'mdx-bundler';
import MdxRenderer from './MdxRenderer'; 
import { getMdxContent, getSlugs } from '@/lib/mdx'; 
import type { Metadata } from 'next'; 
import path from 'path'; // ต้อง import path เพื่อใช้ path.join ใน esbuildOptions

interface Params {
    slug: string;
}

// 1. generateStaticParams
// สร้างพารามิเตอร์สำหรับ Static Rendering ใน Build Time
export async function generateStaticParams() {
    const slugs = await getSlugs();
    return slugs.map((slug) => ({ slug }));
}

// 2. generateMetadata
// สร้าง Metadata (SEO Title, Description) จาก Frontmatter
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
    // FIX: บังคับ Unwrap params ก่อนนำไปใช้ (สำหรับ Next.js 16.0.3 + Turbopack)
    const finalParams = (await params) as Params; 
    
    const data = await getMdxContent(finalParams.slug); 
    if (!data) return {};
    
    return {
        title: data.frontmatter.title as string || `Docs: ${finalParams.slug}`,
        // สามารถดึง Description จาก Frontmatter ได้
        description: data.frontmatter.description as string,
    };
}

// 3. Server Component Page หลัก
export default async function DocsPage({ params }: { params: Params }) {
    
    // FIX: บังคับ Unwrap params ก่อนนำไปใช้
    const finalParams = (await params) as Params;
    
    const data = await getMdxContent(finalParams.slug); 

    if (!data) {
        notFound();
    }
    
    // Bundling Content
    const { code } = await bundleMDX({ 
        source: data.content,
        
        // 🎯 FIX: กำหนด esbuildOptions เพื่อ Resolve Alias Path (@/)
        esbuildOptions: (options) => {
            options.alias = {
                // แมป '@' ไปที่ Root Directory (process.cwd())
                '@': path.join(process.cwd()), 
                ...options.alias, // รวม alias เดิมที่มีอยู่
            };

            // กำหนดให้ esbuild รู้จักการโหลดไฟล์ .tsx และ .ts 
            options.loader = {
                ...options.loader,
                '.tsx': 'tsx',
                '.ts': 'ts',
            };

            // กำหนด extensions ที่ควร Resolve ให้ครบถ้วน
            options.resolveExtensions = [
                '.tsx', '.ts', '.jsx', '.js', '.json', '.mdx'
            ];
            
            return options;
        },
    });

    return (
        // ใช้ Tailwind CSS Typography Plugin (prose) เพื่อจัดรูปแบบ MDX Content
        <div className="prose dark:prose-invert max-w-none"> 
            <MdxRenderer code={code} />
        </div>
    );
}