"use client"


import React from 'react';
import { LoadingForm } from '@/components/Form/loadingForm';
import { BackButton } from '@/components/common/BackButton';
import { ItemList } from '@/components/common/ItemList';

import { getTranslation } from "@/ni18n/i18n";
import { useLazyLessonsGetDataByIdQuery } from "@/services/admin/Lessons";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from 'moment';
const PageComponent = () => {
    const { t } = getTranslation();
    const router = useRouter()
    const params = useParams()
    const { id } = params
    const [LessonsGetDataById, { currentData: data, isFetching }] = useLazyLessonsGetDataByIdQuery()

    useEffect(() => {
        if (id) {
            LessonsGetDataById({ id: String(id) })
                .then((data) => {
                    if (!data.data) {
                        router.back();
                    }
                });
        }
    }, [id])
    // TODO: add Class Name and also Table

    return (
        <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
            <BackButton title={t('LessonsPage.LessonsInformation')} />

            {
                isFetching ? <LoadingForm /> : <>
                    <div className='CardDetails internalMenu '>
                        <ItemList title={t('LessonsPage.title')} value={String(data?.title)} />
                        <ItemList title={t('LessonsPage.content')} value={String(data?.content)} />
                        <ItemList title={t('LessonsPage.teacherFullName')} value={String(data?.teacherSubject.Teacher.fullName)} />
                        <ItemList title={t('LessonsPage.StageName')} value={data?.teacherSubject?.StageSubject?.Stage?.name && t(data?.teacherSubject?.StageSubject?.Stage?.name as any)} />
                        {/* <ItemList title={t('LessonsPage.ClassName')} value={String(data?.Class.name)} /> */}
                        <ItemList title={t('LessonsPage.SectionName')} value={data?.Section?.name && t(data?.Section.name as any)} />
                        <ItemList title={t('LessonsPage.SubjectName')} value={data?.teacherSubject?.StageSubject?.Subject?.name ?? ""} />
                        <ItemList title={t('LessonsPage.SchoolYear')} value={data?.SchoolYear?.from + " - " + data?.SchoolYear?.to} />

                        <ItemList title={t('common.updatedAt')} value={moment(data?.updatedAt).format('YYYY-MM-DD hh:mm:ss A')} />
                        <ItemList title={t('common.createdAt')} value={moment(data?.createdAt).format('YYYY-MM-DD hh:mm:ss A')} />
                    </div>


                </>
            }

        </div>
    );
};

export default PageComponent
