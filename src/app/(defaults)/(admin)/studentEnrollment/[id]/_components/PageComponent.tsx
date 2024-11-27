"use client"


import React, { useState } from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';


import useLogic from './_logic';
import { ArrowIcons } from '@/components/common/icons/Actions';
import moment from 'moment';
import { AttachmentsImage } from '@/components/common/LightboxImagePreview';
import DeleteModel from '@/components/Model/DeleteModel';

const PageComponent = () => {
    const { t, data, isFetching, id, router  , handleRemove, isLoadingStudentRemove } = useLogic();
    const [openDelete, setOpenDelete] = useState(false)
    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('StudentPage.StudentInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <AttachmentsImage className="my-2 h-44" src={String(data?.photo)} />
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('StudentPage.fullName')} value={String(data?.fullName)} />
                        <ItemList title={t('StudentPage.Username')}
                            value={String(data?.User?.username)}
                            isCopyToClipboard
                        />
                        <ItemList title={t('StudentPage.address')} value={String(data?.address)} />
                        <ItemList title={t('StudentPage.phone1')} value={String(data?.phone1)} />
                        <ItemList title={t('StudentPage.phone2')} value={String(data?.phone2)} />
                        <ItemList title={t('StudentPage.email')} value={String(data?.email)} />
                        <ItemList title={t('StudentPage.birth')} value={data?.birth && moment(data?.birth).format("YYYY-MM-DD")} />
                        <ItemList title={t('StudentPage.enrollmentDate')} value={data?.enrollmentDate && moment(data?.enrollmentDate).format("YYYY-MM-DD")} />
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
                                    router.push(`/student/createOrUpdate?id=${id}`)
                                }
                            }}
                            title={t('StudentPage.update-info')}
                            value={<ArrowIcons className='rtl:rotate-180 text-[#000]/50' />}
                        />
                        {/* <ItemList
                            props={{
                                onClick: () => {
                                    setOpenDelete(true)
                                }
                            }}
                            title={<div className='text-danger'>
                                {t('common.delete')}
                            </div>}
                            value={<ArrowIcons className='rtl:rotate-180 text-danger/50' />}
                        /> */}
                    </div>
                </>
            }

            <DeleteModel
                description={t('StudentPage.Are-you-sure-you-want-to-delete-this-Student')}
                title={t('StudentPage.DeleteStudent')}
                open={openDelete}
                setOpen={setOpenDelete}
                handleRemove={handleRemove}
                isLoading={isLoadingStudentRemove}
                name={data?.fullName ?? ""}
            />

        </div>
    );
};

export default PageComponent

