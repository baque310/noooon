"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import { ArrowIcons } from "@/components/common/icons/Actions";
import moment from "moment";
import DeleteModel from "@/components/Model/DeleteModel";
import { useLazySectionScheduleGetDataByIdQuery, useSectionScheduleRemoveMutation } from "@/services/admin/SectionSchedule";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [ScheduleGetDataById, { currentData: data, isFetching }] = useLazySectionScheduleGetDataByIdQuery();
  const [ScheduleRemove, { isLoading: isLoadingScheduleRemove }] = useSectionScheduleRemoveMutation();

  useEffect(() => {
    if (id) {
      ScheduleGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const handleRemove = async () => {
    try {
      await ScheduleRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("SectionSchedulePage.SectionScheduleInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList title={t("SectionSchedulePage.SchoolYear")} value={data?.SchoolYear.from + " - " + data?.SchoolYear.to} />
            <ItemList title={t("SectionSchedulePage.day")} value={data?.Schedule?.day && t(data.Schedule.day as any)} />
            <ItemList title={t("SectionSchedulePage.timeFrom")} value={moment.utc(data?.Schedule.timeFrom).format("hh:mm:ss A")} />
            <ItemList title={t("SectionSchedulePage.timeTo")} value={moment.utc(data?.Schedule.timeTo).format("hh:mm:ss A")} />
            <ItemList title={t("SectionSchedulePage.SubjectName")} value={data?.teacherSubject.StageSubject.Subject.name + "( " + data?.teacherSubject.Teacher.fullName + ")"} />
            <ItemList title={t("SectionSchedulePage.StageName")} value={data?.section.Class.Stage.name && t(data?.section.Class.Stage.name as any)} />
            <ItemList title={t("SectionSchedulePage.ClassName")} value={data?.section.Class.name} />
            <ItemList title={t("SectionSchedulePage.SectionName")} value={data?.section.name && t(data.section.name as any)} />
            {/* <ItemList title={t('common.updatedAt')} value={moment.utc(data.).format("YYYY-MM-DD hh:mm:ss A")} />
                        <ItemList title={t('common.createdAt')} value={moment.utc(data?.Schedule.createdAt).format("YYYY-MM-DD hh:mm:ss A")} /> */}
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">{t("common.settings")}</div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/sectionSchedule/createOrUpdate?id=${id}`);
                },
              }}
              title={t("SchedulePage.update-info")}
              value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
            />
            <ItemList
              props={{
                onClick: () => {
                  setOpenDelete(true);
                },
              }}
              title={<div className="text-danger">{t("common.delete")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
          </div>
        </>
      )}

      <DeleteModel
        description={t("SectionSchedulePage.Are-you-sure-you-want-to-delete-this-SectionSchedule")}
        title={t("SchedulePage.DeleteSchedule")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingScheduleRemove}
        name={data?.section?.name ? t(data?.section?.name as any) : ""}
      />
    </div>
  );
};

export default PageComponent;
