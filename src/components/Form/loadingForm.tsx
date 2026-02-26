import React from 'react'
export const LoadingForm = ({ className }: { className?: string }) => {
    return (
        <div className={`flex justify-center items-center h-[calc(100vh-320px)] ${className}`}>
            <div className='loader !bg-primary' />
        </div>
    )
}
