'use client';
import { IRootState } from '@/store';
import { usePathname } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const ContentAnimation = ({ children }: { children: React.ReactNode }) => {
    const pathname = usePathname();
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const [animation, setAnimation] = useState(themeConfig.animation);

    useEffect(() => {
        setAnimation(themeConfig.animation);
    }, [themeConfig.animation]);

    useEffect(() => {
        setTimeout(() => {
            setAnimation('');
        }, 1100);
    }, [pathname]);

    return (
        <>
            {/* BEGIN CONTENT AREA */}
            <div className={`${animation} animate__animated md:p-6 max-md:p-3`}>{children}</div>
            {/* END CONTENT AREA */}
        </>
    );
};

export default ContentAnimation;
