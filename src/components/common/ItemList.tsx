"use client"
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { toast } from 'react-toastify';
import { getTranslation } from '../../ni18n/i18n';
import IconCopy from './icons/icon-copy';
export const ItemList = ({ title, value, props, children, isCopyToClipboard }:
    {
        children?: React.ReactNode,
        title: React.ReactNode,
        isCopyToClipboard?: boolean,
        value: string | React.ReactNode, props?: React.DetailedHTMLProps<React.HTMLAttributes<HTMLDivElement>, HTMLDivElement>
    }) => {
    const { t } = getTranslation();
    return <div
        {...props}
        className={`available-item cursor-pointer ${props?.className || ''}`}>
        <div className="flex justify-between items-center py-3 px-4">
            <div className='font-medium text-gray-700 dark:text-gray-300 min-w-fit'>
                {title}
            </div>
            <div className='font-normal text-gray-600 dark:text-gray-400 text-right' >
                {
                    isCopyToClipboard ?
                        <CopyToClipboard text={value as string} onCopy={(text, result) => {
                            if (result) {
                                toast.success(t('common.Copied-to-clipboard'))
                            } else {
                                toast.error('Failed to copy to clipboard')
                            }
                        }}>
                            <button className='flex items-center gap-2 hover:text-primary transition-colors duration-200 p-1 rounded hover:bg-gray-50 dark:hover:bg-gray-700'>
                                <div>
                                    {value}
                                </div>
                                {<IconCopy />}
                            </button>
                        </CopyToClipboard>
                        : <div className="flex items-center">
                            {value}
                        </div>

                }

            </div>
        </div>
        {children}

    </div>
}
