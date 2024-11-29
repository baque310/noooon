"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useLazyStudentEnrollmentGetDataByIdQuery } from "@/services/admin/studentEnrollment";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { IRootState } from '@/store';
import { useSelector } from 'react-redux';
import { IStudent } from '@/services/admin/student';
import moment from 'moment';
const PageComponent = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [StudentEnrollmentGetDataById, { currentData: data, isFetching }] = useLazyStudentEnrollmentGetDataByIdQuery()

    useEffect(() => {
        if (id) {
            StudentEnrollmentGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])

    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('StudentEnrollmentPage.StudentEnrollmentInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('StudentEnrollmentPage.StudentFullName')} value={String(data?.Student.fullName)} />
                        <ItemList title={t('StudentEnrollmentPage.enrollmentDate')} value={data?.Student.enrollmentDate ? moment(data?.Student.enrollmentDate).format("YYYY-MM-DD") : ""} />
                        <ItemList title={t('StudentEnrollmentPage.SchoolYear')} value={String(data?.SchoolYear.from) + " - " + String(data?.SchoolYear.to)} />
                        <ItemList title={t('StudentEnrollmentPage.StageName')} value={data?.Stage.name && t(data?.Stage.name as any)} />
                        <ItemList title={t('StudentEnrollmentPage.ClassName')} value={String(data?.Class.name)} />
                        <ItemList title={t('StudentEnrollmentPage.SectionName')} value={data?.Section.name && t(data?.Section.name as any)} />

                        <ItemList title={t('common.updatedAt')} value={moment(data?.updatedAt).format('YYYY-MM-DD hh:mm:ss A')} />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format('YYYY-MM-DD hh:mm:ss A')} />
                    </div>


                </>
            }

        </div>
    );
};

export default PageComponent
