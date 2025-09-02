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
import {
  useInstallmentRemoveMutation,
  useLazyInstallmentGetDataByIdQuery,
} from "@/services/admin/Installment";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [InstallmentGetDataById, { currentData: data, isFetching }] =
    useLazyInstallmentGetDataByIdQuery();
  const [InstallmentRemove, { isLoading: isLoadingInstallmentRemove }] =
    useInstallmentRemoveMutation();

  useEffect(() => {
    if (id) {
      InstallmentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const handleRemove = async () => {
    try {
      await InstallmentRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (
        error &&
        error.message ==
          `Foreign key constraint failed on the field. More details: {"modelName":"Installment","field_name":"installmentId"}`
      ) {
        return toast.error(
          t("InstallmentPage.Installment-related-don't-delete"),
          { autoClose: 15000 }
        );
      }
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const [openDelete, setOpenDelete] = useState(false);
  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("InstallmentPage.InstallmentInformation")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          <div className="CardDetails internalMenu ">
            <ItemList
              title={t("InstallmentPage.StudentFullName")}
              value={String(data?.StudentEnrollment?.Student?.fullName)}
            />
            <ItemList
              title={t("InstallmentPage.title")}
              value={String(data?.title)}
            />
            <ItemList
              title={t("common.status")}
              value={
                data?.isActive ? (
                  <div className="text-green-500">{t("common.isActive")}</div>
                ) : (
                  <div className="text-red-500">{t("common.isNotActive")}</div>
                )
              }
            />
            <ItemList
              title={t("InstallmentPage.notes")}
              value={String(data?.notes)}
            />
            <ItemList
              title={t("InstallmentPage.numberOfInstallments")}
              value={String(data?.numberOfInstallments)}
            />
            <ItemList
              title={t("InstallmentPage.daysBetweenInstallments")}
              value={String(data?.daysBetweenInstallments)}
            />
            <ItemList
              title={t("InstallmentPage.installmentAmount")}
              value={
                <div className="flex gap-1">
                  {data?.installmentAmount?.toLocaleString()}
                  <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                </div>
              }
            />

            <ItemList
              title={t("InstallmentPage.totalAmount")}
              value={
                <div className="flex gap-1">
                  {data?.totalAmount?.toLocaleString()}
                  <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                </div>
              }
            />
            <ItemList
              title={t("InstallmentPage.discountAmount")}
              value={
                <div className="flex gap-1">
                  {data?.discountAmount?.toLocaleString()}
                  <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                </div>
              }
            />
            <ItemList
              title={t("InstallmentPage.finalTotalAmount")}
              value={
                <div className="flex gap-1">
                  {data?.finalTotalAmount?.toLocaleString()}
                  <span className="font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                </div>
              }
            />

            <ItemList
              title={t("InstallmentPage.startDate")}
              value={moment(data?.startDate).format("YYYY-MM-DD")}
            />
            <ItemList
              title={t("InstallmentPage.discount")}
              value={String(data?.Discount.percentage ?? "") + " %"}
            />
            <ItemList
              title={t("InstallmentPage.discountTitle")}
              value={String(data?.Discount.title ?? "") + " %"}
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
                  router.push(`/installment/createOrUpdate?id=${id}`);
                },
              }}
              title={t("InstallmentPage.update-info")}
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
          "InstallmentPage.Are-you-sure-you-want-to-delete-this-Installment"
        )}
        title={t("InstallmentPage.DeleteInstallment")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingInstallmentRemove}
        name={data?.title ?? ""}
      />
    </div>
  );
};

export default PageComponent;
