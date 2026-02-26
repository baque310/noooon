"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useLazyExamResultsGetDataByIdQuery } from "@/services/admin/ExamResults";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [ExamResultsGetDataById, { currentData: data, isFetching }] = useLazyExamResultsGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      ExamResultsGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  // TODO: add Class Name and also Table

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("ExamResultsPage.ExamResultsInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList title={t("ExamResultsPage.StudentFullName")} value={String(data?.Student.fullName)} />
            <ItemList title={t("ExamResultsPage.score")} value={String(data?.score)} />
            <ItemList title={t("ExamResultsPage.examDate")} value={data?.ExamSection?.examDate ? moment(data?.ExamSection.examDate).format("YYYY-MM-DD") : ""} />
            <ItemList
              title={t("ExamResultsPage.StageName")}
              value={data?.ExamSection?.Exam?.StageSubject?.Stage?.name && t(data?.ExamSection.Exam.StageSubject.Stage.name as any)}
            />
            {/* <ItemList title={t('ExamResultsPage.ClassName')} value={String(data?.Class.name)} /> */}
            <ItemList title={t("ExamResultsPage.SectionName")} value={data?.ExamSection?.Section?.name && t(data?.ExamSection.Section.name as any)} />
            <ItemList title={t("ExamResultsPage.ExamTypeName")} value={data?.ExamSection?.Exam.ExamType?.name ?? ""} />
            <ItemList title={t("ExamResultsPage.SubjectName")} value={data?.ExamSection.Exam.StageSubject?.Subject?.name ?? ""} />

            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>
        </>
      )}
    </div>
  );
};

export default PageComponent;
