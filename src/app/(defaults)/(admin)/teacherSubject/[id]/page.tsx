import { Metadata } from 'next';
import React from 'react';
import PageComponent from './_components/PageComponent';



export const metadata: Metadata = {
    title: 'teacher Subject ',
};
const Page = () => {

    return <div className=''>
        <PageComponent />
    </div>;
};

export default Page;


