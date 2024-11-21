"use client"
import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';


import _logic from './_logic';
import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import CreateComponent from '../../_components/create/_components/CreateComponent';
import DeleteModel from '@/components/Model/DeleteModel';

const PageComponent = () => {
    const { t, data, isFetching, handleRemove, isLoadingSectionRemove } = _logic();
    const [open, setOpen] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('SectionPage.SectionInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('SectionPage.name')} value={String(data?.name)} />
                        <ItemList title={t('SectionPage.ClassName')} value={t(data?.Class.name as any)} />
                        <ItemList title={t('common.status')} value={
                            <div className='flex gap-2 px-[2px]'>
                                {data?.isActive == "true" ?
                                    <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-success/20 text-success `}>{t("common.isActive")}</div>
                                    : <div className={` rounded-md p-1 ltr:ml-2 rtl:ml-2  bg-danger/50 text-danger`}>{t("common.isNotActive")}</div>
                                }
                            </div>
                        } />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format('YYYY-MM-DD hh:mm:ss A')} />

                    </div>

                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
                        <ItemList
                            props={{
                                onClick: () => {
                                    setOpen(true)
                                }
                            }}
                            title={t('SectionPage.update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />
                        <ItemList
                            props={{
                                onClick: () => {
                                    setOpenDelete(true)
                                }
                            }}
                            title={<div className='text-danger'>
                                {t('common.delete')}
                            </div>}
                            value={<ArrowIcons className='rtl:rotate-180 text-danger/50' />}
                        />

                    </div>
                </>
            }
            <CreateComponent open={open} setOpen={setOpen} />
            <DeleteModel
                description={t('SectionPage.Are-you-sure-you-want-to-delete-this-Section')}
                title={t('SectionPage.DeleteSection')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingSectionRemove}
                name={data?.name ?? ""}
            />
        </div>
    );
};

export default PageComponent

