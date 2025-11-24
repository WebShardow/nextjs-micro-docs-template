// components/Alert.tsx (Component ที่ถูก Import ใน MDX)
'use client';

import * as React from 'react';

interface AlertProps {
    children: React.ReactNode;
    title?: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

const styles = {
    info: 'bg-blue-100 border-blue-500 text-blue-700',
    success: 'bg-green-100 border-green-500 text-green-700',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    error: 'bg-red-100 border-red-500 text-red-700',
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