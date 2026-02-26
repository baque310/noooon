import React from 'react';

const Loading = () => {
    return (
        <div className="screen_loader animate__animated fixed inset-0 z-[60] grid place-content-center bg-[#fafafa]/70 dark:bg-[#060818]/70">
             
            <div className="loader !bg-primary"></div>
        </div>
    );
};

export default Loading;
