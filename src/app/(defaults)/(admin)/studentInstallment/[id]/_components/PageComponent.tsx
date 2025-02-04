"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";

import { getTranslation } from "@/ni18n/i18n";
import {
  useLazyStudentInstallmentGetDataByIdQuery,
  useStudentInstallmentRemoveMutation,
} from "@/services/admin/studentInstallment";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { toast } from "react-toastify";
import { ArrowIcons } from "@/components/common/icons/Actions";
import DeleteModel from "@/components/Model/DeleteModel";
import CreateOrUpdateComponent from "../../_components/CreateOrUpdateComponent";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [StudentInstallmentGetDataById, { currentData: data, isFetching }] =
    useLazyStudentInstallmentGetDataByIdQuery();

  useEffect(() => {
    if (id) {
      StudentInstallmentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [
    StudentInstallmentRemove,
    { isLoading: isLoadingStudentInstallmentRemove },
  ] = useStudentInstallmentRemoveMutation();
  const handleRemove = async () => {
    try {
      await StudentInstallmentRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(error.message, { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const [openDelete, setOpenDelete] = useState(false);
  const [open, setOpen] = useState(false);

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton
        title={t("StudentInstallmentPage.StudentInstallmentInformation")}
      />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList
              title={t("StudentInstallmentPage.StudentFullName")}
              value={String(data?.StudentEnrollment?.Student?.fullName ?? "")}
            />
            <ItemList
              title={t("StudentInstallmentPage.date")}
              value={data?.date ? moment(data?.date).format("YYYY-MM-DD") : ""}
            />
            <ItemList
              title={t("StudentInstallmentPage.SchoolYear")}
              value={
                String(data?.SchoolYear.from) +
                " - " +
                String(data?.SchoolYear.to)
              }
            />
            <ItemList
              title={t("StudentInstallmentPage.amount")}
              value={
                <div className="flex gap-1">
                  {data?.amount?.toLocaleString()}
                  <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                </div>
              }
            />

            <ItemList
              title={t("common.updatedAt")}
              value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")}
            />
            <ItemList
              title={t("common.createdAt")}
              value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")}
            />
          </div>
          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">
            {t("common.settings")}
          </div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  setOpen(true);
                },
              }}
              title={t("StudentInstallmentPage.update-info")}
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
        description={t(
          "StudentPage.Are-you-sure-you-want-to-delete-this-Student"
        )}
        title={t("StudentPage.DeleteStudent")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingStudentInstallmentRemove}
        name={data?.StudentEnrollment?.Student?.fullName ?? ""}
      />
      <CreateOrUpdateComponent
        data={data as any}
        open={open}
        setOpen={setOpen}
      />
    </div>
  );
};

export default PageComponent;
