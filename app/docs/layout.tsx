// app/docs/layout.tsx
import React from 'react';

// เราจะกำหนดสไตล์ prose ที่นี่ เพื่อ Wrap ทุกไฟล์ .mdx 
// ที่ถูกเรนเดอร์ใน children

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* ใช้คลาส prose เพื่อจัดสไตล์ Markdown Elements
                และ prose-invert สำหรับการรองรับ Dark Mode (จาก globals.css)
                max-w-none เพื่อให้กว้างเต็มที่ หรือ max-w-4xl เพื่อจำกัดความกว้าง
            */}
            <main className="max-w-4xl w-full prose dark:prose-invert">
                {children}
            </main>
        </div>
    );
}