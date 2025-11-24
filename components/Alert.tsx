// components/Alert.tsx
import React from 'react';

interface AlertProps {
    title: string;
    type: 'info' | 'warning' | 'error';
    children: React.ReactNode;
}

const typeStyles: Record<AlertProps['type'], string> = {
    info: 'bg-blue-100 border-blue-500 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200',
    warning: 'bg-yellow-100 border-yellow-500 text-yellow-700 dark:bg-yellow-900 dark:border-yellow-700 dark:text-yellow-200',
    error: 'bg-red-100 border-red-500 text-red-700 dark:bg-red-900 dark:border-red-700 dark:text-red-200',
};

export const Alert: React.FC<AlertProps> = ({ title, type, children }) => {
    const styles = typeStyles[type];

    return (
        <div className={`p-4 my-4 border-l-4 rounded-md ${styles}`} role="alert">
            <p className="font-bold">{title}</p>
            <div className="text-sm">{children}</div>
        </div>
    );
};