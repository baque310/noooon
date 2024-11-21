"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { AttachmentsImage } from '@/components/common/LightboxImagePreview';
import { ItemList } from '@/components/common/ItemList';
 

import _logic from './_logic';
import { ArrowIcons } from '@/components/common/icons/Actions';

const PageComponent = () => {
    const { t, data, isFetching, id,router } = _logic();

    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('ManagerAdminPage.School.managerAdminInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />

                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('ManagerAdminPage.username')} value={String(data?.username)} />
                        <ItemList title={t('ManagerAdminPage.School.name')} value={String(data?.School.name)} />
                        <ItemList title={t('ManagerAdminPage.School.address')} value={String(data?.School.address)} />
                        <ItemList title={t('ManagerAdminPage.School.phone1')} value={String(data?.School.phone1)} />
                        <ItemList title={t('ManagerAdminPage.School.phone2')} value={String(data?.School.phone2)} />
                        <ItemList title={t('ManagerAdminPage.School.email')} value={String(data?.School.email)} />
                        <ItemList title={t('ManagerAdminPage.School.hasBanner')} value={String(data?.School.hasBanner)} />
                        <ItemList title={t('common.status')} value={
                            <div className='flex gap-2 px-[2px]'>
                                {data?.isActive == "true" ?
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
                                    router.push(`/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />
                        <ItemList
                            props={{
                                onClick: () => {
                                    router.push(`/changeRole?id=${id}`)
                                }
                            }}
                            title={t('update-role')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        /> 
                    </div> 
                </>
            }

        </div>
    );
};

export default PageComponent

