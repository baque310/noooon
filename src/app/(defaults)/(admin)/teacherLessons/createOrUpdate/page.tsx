import { Metadata } from 'next';
import React from 'react';
import PageComponent from './_components/PageComponent';



export const metadata: Metadata = {
  title: 'teacherLessons ',
};
const Page = () => {

  return <div className=''>
    <PageComponent />
  </div>;
};

export default Page;
