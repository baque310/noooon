import { ReactNode, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ModelProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  children: ReactNode;
  title?: ReactNode;
  headerModel?: ReactNode;
  isNot512?: boolean;
  className?: string;
  classNameHeader?: any;
}

const SideModel = ({ open, setOpen, children, title, headerModel, isNot512, className, classNameHeader }: ModelProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={() => setOpen(false)}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        {/* Expanded Side Panel */}
        <div className="fixed inset-y-0 left-0 w-full max-w-[600px]">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="-translate-x-full"
            enterTo="translate-x-0"
            leave="ease-in duration-200"
            leaveFrom="translate-x-0"
            leaveTo="-translate-x-full">
            <Dialog.Panel className={`h-screen w-full bg-white text-black dark:bg-gray-900 dark:text-white-dark ${className}`}>
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="absolute top-4 z-10 rounded-sm border-[1.1px] px-2 py-[3px] text-gray-800 dark:border-white-dark dark:text-white-dark dark:hover:border-white dark:hover:text-gray-200 ltr:right-4 rtl:left-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>

              {/* Header */}
              {title ? (
                <div
                  className={`flex h-[65px] items-center border-b border-slate-300 bg-white px-4 text-xl font-semibold uppercase text-black dark:border-gray-700 dark:bg-[#121c2c] dark:text-white-dark`}>
                  {title}
                </div>
              ) : (
                headerModel
              )}

              {/* Content */}
              <div className="h-[calc(100%-60px)] w-full overflow-y-auto">{children}</div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};

export default SideModel;
