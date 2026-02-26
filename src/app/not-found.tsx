import { Metadata } from 'next';
import Link from 'next/link';
import React from 'react';

export const metadata: Metadata = {
    title: 'Error 404',
};

const NotFound = () => {
    return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden">
            Not Found
        </div>
    );
};

export default NotFound;
