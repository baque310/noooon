"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useLazyHomeworksGetDataByIdQuery } from "@/services/admin/Homeworks";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [HomeworksGetDataById, { currentData: data, isFetching }] = useLazyHomeworksGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      HomeworksGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  // TODO: add Class Name and also Table

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("HomeworksPage.HomeworksInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList title={t("HomeworksPage.title")} value={String(data?.title)} />
            <ItemList title={t("HomeworksPage.content")} value={String(data?.content)} />
            <ItemList title={t("HomeworksPage.dueDate")} value={moment(data?.dueDate).format("YYYY-MM-DD")} />
            <ItemList title={t("HomeworksPage.teacherFullName")} value={String(data?.teacherSubject?.Teacher?.fullName ?? "")} />
            <ItemList title={t("HomeworksPage.StageName")} value={data?.teacherSubject?.StageSubject?.Stage?.name && t(data?.teacherSubject?.StageSubject?.Stage?.name as any)} />
            {/* <ItemList title={t('HomeworksPage.ClassName')} value={String(data?.Class.name)} /> */}
            <ItemList title={t("HomeworksPage.SectionName")} value={data?.Section?.name && t(data?.Section.name as any)} />
            <ItemList title={t("HomeworksPage.SubjectName")} value={data?.teacherSubject?.StageSubject?.Subject?.name ?? ""} />
            <ItemList title={t("HomeworksPage.SchoolYear")} value={(data?.SchoolYear?.from ?? "") + " - " + (data?.SchoolYear?.to ?? "")} />

            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>
        </>
      )}
    </div>
  );
};

export default PageComponent;
