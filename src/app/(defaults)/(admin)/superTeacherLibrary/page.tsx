import { Metadata } from "next";
import React from "react";
import Table from "./_components/Table";

export const metadata: Metadata = {
  title: "Super Teacher Library",
};
const Page = () => {
  return (
    <div className="">
      <Table />
    </div>
  );
};

export default Page;
