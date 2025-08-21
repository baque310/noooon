"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useLazyScheduleGetDataByIdQuery, useScheduleRemoveMutation } from "@/services/admin/Schedule";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import { AttachmentsImage } from '@/components/common/LightboxImagePreview';
import DeleteModel from '@/components/Model/DeleteModel';

const PageComponent = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [ScheduleGetDataById, { currentData: data, isFetching }] = useLazyScheduleGetDataByIdQuery()
    const [ScheduleRemove, { isLoading: isLoadingScheduleRemove }] = useScheduleRemoveMutation()

    useEffect(() => {
        if (id) {
            ScheduleGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])
    const handleRemove = async () => {
        try {
            await ScheduleRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message) {
                if (error.message === `Foreign key constraint failed on the field. More details: {"modelName":"Schedule","field_name":"scheduleId"}`) {
                    return toast.error(t('SchedulePage.Schedule-is-related-with-other-models'), { autoClose: 15000 });
                    
                }
                return toast.error(t(error.message), { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };

    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('SchedulePage.ScheduleInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('SchedulePage.day')} value={data?.day && t(data.day as any)} />
                        <ItemList title={t('SchedulePage.timeFrom')} value={moment.utc(data?.timeFrom).format("hh:mm:ss A")} />
                        <ItemList title={t('SchedulePage.timeTo')} value={moment.utc(data?.timeTo).format("hh:mm:ss A")} />
                        <ItemList title={t('common.updatedAt')} value={moment.utc(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
                        <ItemList title={t('common.createdAt')} value={moment.utc(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
                    </div>

                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
                        <ItemList
                            props={{
                                onClick: () => {
                                    router.push(`/schedule/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('SchedulePage.update-info')}
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

            <DeleteModel
                description={t('SchedulePage.Are-you-sure-you-want-to-delete-this-Schedule')}
                title={t('SchedulePage.DeleteSchedule')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingScheduleRemove}
                name={data?.day ? t(data?.day as any) : ""}
            />

        </div>
    );
};

export default PageComponent

