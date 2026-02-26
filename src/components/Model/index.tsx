import { ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

export interface openProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ModelProps extends openProps {
  children: ReactNode;
  title?: any;
  headerModel?: ReactNode;
  isNot512?: boolean;
  className?: string; // Z-index or wrapper classes
  panelClassName?: string; // Panel-specific classes
  bodyClassName?: string; // Content-specific classes
  variant?: "default" | "premium";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
  icon?: ReactNode;
  noPadding?: boolean;
}

const Model = ({
  open,
  setOpen,
  children,
  title,
  headerModel,
  isNot512,
  className,
  panelClassName = "",
  bodyClassName = "",
  variant = "default",
  size,
  icon,
  noPadding = false,
}: ModelProps) => {
  const sizeClasses: Record<string, string> = {
    xs: "max-w-xs",
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl",
    "5xl": "max-w-5xl",
    "6xl": "max-w-6xl",
    "7xl": "max-w-7xl",
    full: "max-w-full m-4",
  };

  const selectedSize = size ? sizeClasses[size] : isNot512 ? "w-3/4" : "max-w-lg";

  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" open={open} onClose={() => setOpen(false)} className={`relative ${className || "z-50"}`}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className={`fixed inset-0 ${variant === "premium" ? "bg-slate-900/40 backdrop-blur-sm" : "bg-[black]/60"}`} />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel
                className={`w-full ${selectedSize} transform transition-all overflow-hidden 
                ${
                  variant === "premium"
                    ? "bg-slate-50 dark:bg-slate-900 rounded-xl shadow-2xl flex flex-col max-h-[90vh]"
                    : "Card rounded-lg border-0 p-0 text-black dark:text-white-dark"
                } ${panelClassName}`}>
                {title ? (
                  <div
                    className={`${
                      variant === "premium"
                        ? "flex items-center justify-between px-8 py-6 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
                        : "rounded-t-lg print:hidden"
                    }`}>
                    {variant === "premium" ? (
                      <>
                        <h3 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3">
                          {icon && (
                            <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center">
                              {icon}
                            </div>
                          )}
                          <span>{title}</span>
                        </h3>
                        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setOpen(false)}
                          className="!font-[Almarai] absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                        <div className="bg-[#fbfbfb] py-3 rounded-t-lg text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">{title}</div>
                      </>
                    )}
                  </div>
                ) : (
                  headerModel
                )}
                <div
                  className={`${variant === "premium" ? "flex-1 bg-primary-light overflow-y-auto overlay-scrollbar p-6" : "pb-5 px-5"} ${
                    noPadding ? "!p-0 !px-0 !pb-0" : ""
                  } ${bodyClassName}`}>
                  {children}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Model;
