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