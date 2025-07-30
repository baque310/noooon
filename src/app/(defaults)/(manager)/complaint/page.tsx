import { Metadata } from 'next';
import React from 'react';
import TableComplaint from './Table';

export const metadata: Metadata = {
    title: 'Complaints',
};
const Page = async () => {
    return <div className=''>
        <TableComplaint />
    </div>;
};

export default Page;

