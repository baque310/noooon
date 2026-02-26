"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { AttachmentsImage } from '@/components/common/LightboxImagePreview';
import { ItemList } from '@/components/common/ItemList';


import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useLazySupperAdminGetDataByIdQuery, useSupperAdminRemoveMutation } from '@/services/admin/SupperAdmin';
import { ArrowIcons } from '@/components/common/icons/Actions';
import { toast } from 'react-toastify';
import DeleteModel from '@/components/Model/DeleteModel';

const PageComponent = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [AdminGetDataById, { currentData: data, isFetching }] = useLazySupperAdminGetDataByIdQuery()
    const [SupperAdminRemove, { isLoading: isLoadingSupperAdminRemove }] = useSupperAdminRemoveMutation()

    useEffect(() => {
        if (id) {
            AdminGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    const handleRemove = async () => {
        try {
            await SupperAdminRemove({ id: String(id) }).unwrap();
            toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
            router.back();
        } catch (error: any) {
            console.error('Failed to operation :', error);
            if (error && error.message) { 
                return toast.error(t(error.message), { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
        }
    };

    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('SupperAdminPage.SupperAdmin-information')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />

                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('SupperAdminPage.username')} value={String(data?.username)} />
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
                                    router.push(`/supperAdmin/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('AdminPage.update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />
                        <ItemList
                            props={{
                                onClick: () => {
                                    router.push(`/supperAdmin/changeRole?id=${id}`)
                                }
                            }}
                            title={t('SupperAdminPage.update-role')}
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
                description={t('SupperAdminPage.Are-you-sure-you-want-to-delete-this-SupperAdmin')}
                title={t('SupperAdminPage.DeleteSupperAdmin')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingSupperAdminRemove}
                name={data?.username ?? ""}
            />
        </div>
    );
};

export default PageComponent

