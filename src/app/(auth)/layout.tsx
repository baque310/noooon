import React from "react";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div dir="rtl" className="min-h-screen text-black dark:text-white-dark">
      {children}
    </div>
  );
};

export default AuthLayout;
