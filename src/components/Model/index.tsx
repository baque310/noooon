import { ReactNode, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';

export interface openProps {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

interface ModelProps extends openProps {
  children: ReactNode;
  title?: any;
  headerModel?: ReactNode;
  isNot512?: boolean
}

const Model = ({ open, setOpen, children, title, headerModel, isNot512 }: ModelProps) => {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" open={open} onClose={() => setOpen(false)} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[black]/60" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center px-4 py-8">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className={`Card w-full ${!isNot512 ? "max-w-lg" : "w-3/4"}  rounded-lg border-0 p-0 text-black dark:text-white-dark`}>
                {title ? (
                  <div className='rounded-t-lg print:hidden '>
                    <button
                      type="button"
                      onClick={() => setOpen(false)}
                      className="!font-[Almarai] absolute top-4 text-gray-400 outline-none hover:text-gray-800 ltr:right-4 rtl:left-4 dark:hover:text-gray-600"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                    <div className="!font-[Almarai]  bg-[#fbfbfb] py-3 rounded-t-lg text-lg font-medium ltr:pl-5 ltr:pr-[50px] rtl:pr-5 rtl:pl-[50px] dark:bg-[#121c2c]">
                      {title}
                    </div>
                  </div>
                ) : (
                  headerModel
                )}
                <div className="pb-5 px-5">{children}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default Model;