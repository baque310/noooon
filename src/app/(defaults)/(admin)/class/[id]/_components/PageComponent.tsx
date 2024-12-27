"use client"
import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';


import { useClassRemoveMutation, useLazyClassGetDataByIdQuery } from "@/services/admin/class";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import CreateComponent from '../../_components/CreateComponent';
import DeleteModel from '@/components/Model/DeleteModel';
import { getTranslation } from '@/ni18n/i18n';

const PageComponent = () => {

    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [ClassGetDataById, { currentData: data, isFetching }] = useLazyClassGetDataByIdQuery()
    const [ClassRemove, { isLoading: isLoadingClassRemove }] = useClassRemoveMutation()
    useEffect(() => {
        if (id) {
            ClassGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    const handleRemove = async () => {
        try {
            await ClassRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message==`Foreign key constraint failed on the field. More details: {"modelName":"Class","field_name":"classId"}`) {
                return toast.error(t("ClassPage.this-class-connected-with-other-class"), { autoClose: 15000 });
            }
            if (error && error.message) {
                return toast.error(error.message, { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };
    const [open, setOpen] = useState(false)
    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('ClassPage.ClassInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('ClassPage.name')} value={String(data?.name)} />
                        <ItemList title={t('ClassPage.StageName')} value={data?.Stage.name && t(data?.Stage.name as any)} />
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

