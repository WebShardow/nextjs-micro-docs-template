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