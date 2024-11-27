"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';
import { getTranslation } from "@/ni18n/i18n";
import { useLazyStageGetDataByIdQuery, useStageRemoveMutation } from "@/services/admin/stage";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify"; 
import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import DeleteModel from '@/components/Model/DeleteModel';

const PageComponent = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [StageGetDataById, { currentData: data, isFetching }] = useLazyStageGetDataByIdQuery()
    const [StageRemove, { isLoading: isLoadingStageRemove }] = useStageRemoveMutation()

    useEffect(() => {
        if (id) {
            StageGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    const handleRemove = async () => {
        try {
            await StageRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message && error.message === 'Foreign key constraint failed on the field. More details: {"modelName":"Stage","field_name":"stageId"}') {
                return toast.error(t("StagePage.Stage-connected-with-class"), { autoClose: 15000 });
            }
            if (error && error.message) {
                return toast.error(error.message, { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };
    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('SchoolPage.SchoolInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('SchoolPage.name')} value={t(data?.name as any)} />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format('YYYY-MM-DD hh:mm:ss A')} />
                    </div>
                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
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
            <DeleteModel
                description={t('StagePage.Are-you-sure-you-want-to-delete-this-stage')}
                title={t('StagePage.DeleteStage')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingStageRemove}
                name={t(data?.name as any)}
            />
        </div>
    );
};

export default PageComponent

