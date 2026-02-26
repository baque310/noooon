"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";

import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import { useSettingGetDataQuery } from '@/services/Setting';
import CreateComponent from './CreateComponent';

const PageComponent = () => {
    const { t } = getTranslation();
    const params = useParams()
    const { currentData: data, isFetching } = useSettingGetDataQuery()
    const [open, setOpen] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] lg:max-w-[60%] xl:max-w-[50%] mb-20 space-y-6 px-4 md:px-0">

            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 border border-blue-100 dark:border-gray-600 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors duration-200">
                        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
                            {t('Setting.SettingInformation')}
                        </h1>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                            {t('Setting.manage-school-system')}
                        </p>
                    </div>
                </div>
            </div>

            {
                isFetching ? (
                    <div className="space-y-6">
                        {/* Header Skeleton */}
                        <div className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-xl p-6 animate-pulse">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-300 dark:bg-gray-600"></div>
                                <div className="space-y-2">
                                    <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
                                    <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-64"></div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Cards Skeleton */}
                        {[1, 2].map((i) => (
                            <div key={i} className="panel shadow-lg border-0 overflow-hidden animate-pulse">
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                                    <div className="w-8 h-8 rounded-lg bg-gray-300 dark:bg-gray-600"></div>
                                    <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                                </div>
                                <div className="space-y-4">
                                    {[1, 2, 3].map((j) => (
                                        <div key={j} className="flex justify-between items-center py-3 px-4">
                                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24"></div>
                                            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : <>
                    {/* School Year Information Card */}
                    <div className='panel shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900 flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors duration-200">
                                <svg className="w-4 h-4 text-green-600 dark:text-green-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {t('Setting.school-year-info')}
                            </h2>
                        </div>
                        <div className="space-y-1">
                            <ItemList 
                                title={
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                        {t('Setting.CurrentSchoolYear')}
                                    </span>
                                } 
                                value={
                                    <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm font-medium">
                                        {data?.CurrentSchoolYear.from + " - " + data?.CurrentSchoolYear.to}
                                    </span>
                                } 
                            />
                            <ItemList 
                                title={
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                                        {t('common.updatedAt')}
                                    </span>
                                } 
                                value={
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")}
                                    </span>
                                } 
                            />
                            <ItemList 
                                title={
                                    <span className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                                        <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                                        {t('common.createdAt')}
                                    </span>
                                } 
                                value={
                                    <span className="text-gray-600 dark:text-gray-400 text-sm">
                                        {moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}
                                    </span>
                                } 
                            />
                        </div>
                    </div>

                    {/* Settings Actions Card */}
                    <div className='panel shadow-lg border-0 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1'>
                        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900 flex items-center justify-center">
                                <svg className="w-4 h-4 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                            </div>
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
                                {t('common.settings')}
                            </h2>
                        </div>
                        <div className="group hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all duration-200">
                            <ItemList
                                props={{
                                    onClick: () => {
                                        setOpen(true)
                                    },
                                    className: "cursor-pointer hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 dark:hover:from-gray-700 dark:hover:to-gray-600 rounded-lg transition-all duration-300 border border-transparent hover:border-blue-200 dark:hover:border-gray-600"
                                }}
                                title={
                                    <span className="flex items-center gap-3 text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                                        <span className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors duration-200">
                                            <svg className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </span>
                                        <span className="font-medium">{t('Setting.update-info')}</span>
                                    </span>
                                }
                                value={
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200">
                                            {t('Setting.click-to-update')}
                                        </span>
                                        <ArrowIcons className='rtl:rotate-180 text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors duration-200 transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1' />
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </>
            }
            <CreateComponent open={open} setOpen={setOpen} />
        </div>
    );
};

export default PageComponent

