"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';


import _logic from './_logic';
import { ArrowIcons } from '@/components/common/icons/Actions';

const PageComponent = () => {
    const { t, data, isFetching, id, router } = _logic();

    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('SchoolPage.SchoolInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('SchoolPage.name')} value={String(data?.name)} />
                        <ItemList title={t('SchoolPage.address')} value={String(data?.address)} />
                        <ItemList title={t('SchoolPage.phone1')} value={String(data?.phone1)} />
                        <ItemList title={t('SchoolPage.phone2')} value={String(data?.phone2)} />
                        <ItemList title={t('SchoolPage.email')} value={String(data?.email)} />
                        <ItemList title={t('SchoolPage.hasBanner')} value={
                            <div className='flex gap-2 px-[2px]'>
                                {data?.hasBanner == "TRUE" ?
                                    <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-success/20 text-success `}>{t("common.yes")}</div>
                                    : <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-danger/50 text-danger`}>{t("common.no")}</div>
                                }
                            </div>
                        } />
                        <ItemList title={t('common.status')} value={
                            <div className='flex gap-2 px-[2px]'>
                                {data?.isActive == "TRUE" ?
                                    <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-success/20 text-success `}>{t("common.isActive")}</div>
                                    : <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-danger/50 text-danger`}>{t("common.isNotActive")}</div>
                                }
                            </div>
                        } />
                    </div>

                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
                        <ItemList
                            props={{
                                onClick: () => {
                                    router.push(`/school/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('SchoolPage.update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />

                    </div>
                </>
            }

        </div>
    );
};

export default PageComponent

