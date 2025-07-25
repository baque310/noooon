import React from 'react'
import { getTranslation } from '@/ni18n/i18n'

export const Tab = ({
    selected,
    setSelected
}: {
    selected: string,
    setSelected: (value: string) => void
}) => {

    const { t } = getTranslation()
    return (
        <div className='flex justify-center mb-8 w-full'>
            <div className="relative w-full max-w-md bg-gradient-to-r from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-1.5 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-600">
                {/* Enhanced Background Indicator with better positioning */}
                <div 
                    className={`absolute top-1.5 bottom-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-600 rounded-xl shadow-lg transition-all duration-500 ease-out ${
                        selected !== "add" 
                            ? "left-1.5 w-[calc(50%-0.375rem)]" 
                            : "right-1.5 w-[calc(50%-0.375rem)]"
                    }`}
                ></div>
                
                <div className="relative flex w-full">
                    <button
                        onClick={() => setSelected("add")}
                        className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex-1 w-full ${
                            selected === "add" 
                                ? "text-gray-800 dark:text-gray-100 transform scale-[1.02] shadow-lg" 
                                : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2 w-full">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                selected === "add" 
                                    ? "bg-white/40 text-gray-800 dark:text-gray-100" 
                                    : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                            }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">{t("StudentPage.singleAdd")}</span>
                        </span>
                    </button>
                    <button
                        onClick={() => setSelected("muilt")}
                        className={`relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex-1 w-full ${
                            selected === "muilt" 
                                ? "text-gray-800 dark:text-gray-100 transform scale-[1.02] shadow-lg" 
                                : "text-gray-700 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                        }`}
                    >
                        <span className="flex items-center justify-center gap-2 w-full">
                            <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-300 ${
                                selected === "muilt" 
                                    ? "bg-white/40 text-gray-800 dark:text-gray-100" 
                                    : "bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400"
                            }`}>
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <span className="text-sm font-medium">{t("StudentPage.muiltAdd")}</span>
                        </span>
                    </button>
                </div>
            </div>
        </div>
    )
}
