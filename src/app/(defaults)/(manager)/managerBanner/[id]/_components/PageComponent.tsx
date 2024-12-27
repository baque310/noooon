"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useLazyManagerBannerGetDataByIdQuery, useManagerBannerRemoveMutation } from "@/services/Manager/Banner";
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
    const [ManagerBannerGetDataById, { currentData: data, isFetching }] = useLazyManagerBannerGetDataByIdQuery()
    const [ManagerBannerRemove, { isLoading: isLoadingManagerBannerRemove }] = useManagerBannerRemoveMutation()

    useEffect(() => {
        if (id) {
            ManagerBannerGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])
    const handleRemove = async () => {
        try {
            await ManagerBannerRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message) {
                return toast.error(error.message, { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };

    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('ManagerBannerPage.ManagerBannerInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <AttachmentsImage className="my-2 h-44" src={String(data?.url)} />
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('ManagerBannerPage.title')} value={String(data?.title)} />
                        <ItemList title={t('ManagerBannerPage.description')} value={String(data?.description ?? "")} />
                        <ItemList title={t('ManagerBannerPage.priority')} value={String(data?.priority ?? "")} />
                        <ItemList title={t('common.updatedAt')} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
                    </div>

                    <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
                        {t('common.settings')}
                    </div>
                    <div className='CardDetails internalMenu '>
                        <ItemList
                            props={{
                                onClick: () => {
                                    router.push(`/managerBanner/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('ManagerBannerPage.update-info')}
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
                description={t('ManagerBannerPage.Are-you-sure-you-want-to-delete-this-ManagerBanner')}
                title={t('ManagerBannerPage.DeleteManagerBanner')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingManagerBannerRemove}
                name={data?.title ?? ""}
            />

        </div>
    );
};

export default PageComponent

