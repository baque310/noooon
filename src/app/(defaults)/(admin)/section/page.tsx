import { Metadata } from 'next';
import React from 'react';
import Table from './_components/Table';



export const metadata: Metadata = {
    title: 'section',
};
const Page = () => {

    return <div>
        <Table />
    </div>;
};

export default Page;


