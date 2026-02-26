 
import React from 'react';
import { Metadata } from 'next';
import FormSignIn from './_components/_FormSignIn';
 
export const metadata: Metadata = {
    title: 'SignIn',
};
const SignIn = () => { 
    return (
        <FormSignIn/>
    );
};

export default SignIn;
