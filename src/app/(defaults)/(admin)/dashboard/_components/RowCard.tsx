import { TranslationKeys } from '@/ni18n/i18n'
import React from 'react'

const RowCard = ({ title, number = 0 }: { title: string, number?: number }) => {

    return (
        <div className="Card py-6 border border-black/10 dark:border-white-dark/10  ">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1">
                    {title}
                </div>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                >
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
            </div>
            <div>
                <div className="text-xl font-bold">
                    {number.toLocaleString()}
                </div>
            </div>
        </div>
    )
}

export default RowCard