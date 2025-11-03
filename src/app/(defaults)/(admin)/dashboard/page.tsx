import { Metadata } from "next";
import React from "react";
import RowComponent from "./_components/RowComponent";
// import AdminCountRowComponent from "./_components/AdminCountRowComponent";

export const metadata: Metadata = {
  title: "dashboard",
};
const Page = () => {
  return (
    <div className="">
      <RowComponent />
      {/* <AdminCountRowComponent /> */}
    </div>
  );
};

export default Page;
