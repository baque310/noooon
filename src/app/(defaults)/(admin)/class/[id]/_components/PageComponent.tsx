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
    const { t, data, isFetching, handleRemove, isLoadingClassRemove } = _logic();
    const [open, setOpen] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('ClassPage.ClassInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('ClassPage.name')} value={String(data?.name)} />
                        <ItemList title={t('ClassPage.StageName')} value={t(data?.Stage.name as any)} />
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
                            title={t('ClassPage.update-info')}
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
                description={t('ClassPage.Are-you-sure-you-want-to-delete-this-Class')}
                title={t('ClassPage.DeleteClass')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingClassRemove}
                name={data?.name ?? ""}
            />
        </div>
    );
};

export default PageComponent

