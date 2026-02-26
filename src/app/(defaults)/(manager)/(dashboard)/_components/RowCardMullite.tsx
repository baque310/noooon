import { TranslationKeys } from '@/ni18n/i18n'
import React from 'react'

const RowCardMullite = ({
    title,
    numberAbsent = 0,
    numberPresent = 0,
    numberVacation = 0,
    titleAbsent,
    titlePresent,
    titleVacation
}: {
    title: string,
    titleAbsent: string,
    titlePresent: string,
    titleVacation: string,
    numberAbsent?: number,
    numberPresent?: number,
    numberVacation?: number,
}) => {

    return (
        <div className="Card py-6 border border-black/10 dark:border-white-dark/10 w-full ">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="text-xl font-semibold text-black dark:text-white-dark  mt-2 mb-1">
                    {title}
                </div>
                {/* <svg
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
                </svg> */}
            </div>
            <div className="flex flex-row items-center justify-between space-y-0 border-b border-black/10 dark:border-white-dark/10 py-2">
                <div className="text-base font-semibold text-black dark:text-white-dark  mt-2 mb-1">
                    {titlePresent}
                </div>
                <div className="text-base font-bold">
                    {numberPresent.toLocaleString()}
                </div>
            </div>
            <div className="flex flex-row items-center justify-between space-y-0  border-b border-black/10 dark:border-white-dark/10 py-2">
                <div className="text-base font-semibold text-black dark:text-white-dark  mt-2 mb-1">
                    {titleVacation}
                </div>
                <div className="text-base font-bold">
                    {numberVacation.toLocaleString()}
                </div>
            </div>
            <div className="flex flex-row items-center justify-between space-y-0  py-2">
                <div className="text-base font-semibold text-black dark:text-white-dark  mt-2 mb-1">
                    {titleAbsent}
                </div>

                <div className="text-base font-bold">
                    {numberAbsent.toLocaleString()}
                </div>
            </div>
        </div>
    )
}

export default RowCardMullite