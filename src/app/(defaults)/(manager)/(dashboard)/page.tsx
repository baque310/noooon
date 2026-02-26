import { Metadata } from 'next';
import React from 'react';
import RowComponent from './_components/RowComponent';
 


export const metadata: Metadata = {
    title: 'dashboard',
};
const Page = () => {

    return <div className=''>
        <RowComponent/>
    </div>;
};

export default Page;


