import React, { ReactNode } from "react";

export const ButtonForm = ({
  props,
  isLoading,
  title,
  btnIcon,
}: {
  title: ReactNode;
  isLoading: boolean;
  btnIcon?: ReactNode;
  props?: React.DetailedHTMLProps<React.ButtonHTMLAttributes<HTMLButtonElement>, HTMLButtonElement>;
}) => {
  return (
    <button
      {...props}
      className={`  mt-1 flex justify-center items-center gap-1 w-fit   hover:scale-[1.01] transition-transform py-1 px-2   rounded border bg-primary text-white  border-primary/70  ${props?.className}`}>
      {title}
      {isLoading && <div className="loaderDotsWhite"></div>}
      {btnIcon}
    </button>
  );
};
