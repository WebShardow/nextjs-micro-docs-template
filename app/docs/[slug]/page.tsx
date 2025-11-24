// app/docs/[slug]/page.tsx

import 'server-only';
import { notFound } from 'next/navigation';
import { bundleMDX } from 'mdx-bundler';
import MdxRenderer from './MdxRenderer'; 
import { getMdxContent, getSlugs } from '@/lib/mdx'; 
import type { Metadata } from 'next'; 
import path from 'path'; 

// 1. นำเข้า Rehype/Remark Plugins
import rehypePrettyCode from 'rehype-pretty-code';
import rehypeSlug from 'rehype-slug'; 
import rehypeAutolinkHeadings from 'rehype-autolink-headings'; 

// 2. นำเข้า Utility สำหรับการดึง TOC
import { visit } from 'unist-util-visit'; 
import { Root } from 'mdast'; 

/**
 * Interface สำหรับข้อมูล TOC แต่ละรายการ
 */
export interface TocItem {
    id: string;
    text: string;
    level: 1 | 2 | 3 | 4 | 5 | 6; 
}

interface Params {
    slug: string;
}

// Function หลักสำหรับดึง TOC
function extractToc(data: { toc: TocItem[] }) {
    // ปลั๊กอิน Rehype/Remark จะส่งฟังก์ชันมาให้
    return () => (tree: Root) => { 
        // วนลูปหา Heading nodes
        visit(tree, 'heading', (node) => {
            const level = node.depth as TocItem['level']; 
            
            // ดึง ID ที่ถูกสร้างโดย rehype-slug
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const id = (node.data as any)?.hProperties?.id || ''; 
            
            // ดึงข้อความจาก Heading
            const textNode = node.children.find(n => n.type === 'text');
            const text = textNode ? textNode.value : '';

            if (id && text) {
                data.toc.push({ id, text, level });
            }
        });
    };
}

// 1. generateStaticParams
export async function generateStaticParams() {
    const slugs = await getSlugs();
    return slugs.map((slug) => ({ slug }));
}

// 2. generateMetadata
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

    if (!data) notFound();
    
    // Object สำหรับเก็บข้อมูล TOC ที่ดึงได้ระหว่าง Bundling
    const tocData: { toc: TocItem[] } = { toc: [] }; 

    // Bundling Content ด้วย mdx-bundler
    const { code } = await bundleMDX({ 
        source: data.content,
        cwd: process.cwd(), 
        
        mdxOptions: (options) => {
            options.rehypePlugins = [
                ...(options.rehypePlugins ?? []), 
                
                // 1. สร้าง ID ให้ Heading
                rehypeSlug, 
                // 2. สร้าง Autolink ให้ Heading (ใช้ ID ที่สร้างจาก rehypeSlug)
                [
                    rehypeAutolinkHeadings, 
                    { properties: { className: ['heading-link'], ariaLabel: 'Permalink' } }
                ],
                
                // 3. Syntax Highlighting
                [
                    rehypePrettyCode, 
                    {
                        theme: 'github-dark', 
                        keepBackground: true, 
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onVisitLine(node: any) { 
                            if (node.children.length === 0) {
                                node.children = [{ type: 'text', value: ' ' }];
                            }
                            node.properties = node.properties || {}; 
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onVisitHighlightedLine(node: any) { 
                            node.properties = node.properties || {}; 
                            node.properties.className = node.properties.className || [];
                            node.properties.className.push('highlighted');
                        },
                    },
                ],
                
                // 4. ดึง TOC (ต้องทำหลัง Rehype Slug)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                extractToc(tocData) as any,
            ];
            
            return options;
        },
        
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
        // ส่ง Code และ TOC ไปยัง Client Component
        <MdxRenderer code={code} toc={tocData.toc} />
    );
}