// app/docs/page.tsx

import { redirect } from 'next/navigation';

export default function DocsIndexPage() {
    // Redirect ไปยังเอกสารหน้าแรก
    redirect('/docs/getting-started');
}