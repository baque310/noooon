"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";
import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { ArrowIcons, DeleteIcons, RestoreIcons, UpdateIcons } from "@/components/common/icons/Actions";
import { IInstallmentPayments, PaymentMethod, Status, useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery } from "@/services/admin/installmentPayment";
import ChangeStatusInstallmentComponent from "./changeStatusInstallmentComponent";
import { IOtherPayment, useOtherPaymentGetDataByIdQuery, useOtherPaymentRemoveMutation } from "@/services/admin/other-payment";
import DeleteModel from "@/components/Model/DeleteModel";
import { toast } from "react-toastify";
import { ChangeStatusOtherPaymentsComponent } from "../../_components/ChangeStatusOtherPaymentsComponent";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [openDelete, setOpenDelete] = useState(false);
  const { currentData: data, isFetching } = useOtherPaymentGetDataByIdQuery(
    { id: String(id) },
    {
      skip: !id,
    }
  );

  const [selectedOtherPayment, setSelectedOtherPayment] = useState<IOtherPayment | null>(null);
  const [installmentModalOpen, setOtherPaymentModalOpen] = useState(false);
  const [changeOtherPaymentModalOpen, setChangeOtherPaymentModalOpen] = useState(false);

  // Handler for update button
  const handleUpdateOtherPayment = (installment: IOtherPayment) => {
    setSelectedOtherPayment(installment);
    setOtherPaymentModalOpen(true);
  };
  const handleChangeOtherPayment = (installment: IOtherPayment) => {
    setSelectedOtherPayment(installment);
    setChangeOtherPaymentModalOpen(true);
  };
  const [OtherPaymentRemove, { isLoading: isLoadingOtherPaymentRemove }] = useOtherPaymentRemoveMutation();
  const handleRemove = async () => {
    try {
      await OtherPaymentRemove({ id: String(id) }).unwrap();
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

  return (
    <div className="mx-auto my-0 mb-20 px-2 ">
      <BackButton title={t("OtherPaymentPage.detailOtherPayments")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          {/* Installment Info Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-[#222] dark:to-[#333] rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-indigo-500/30 text-indigo-700 rounded-full p-3 shadow">
                <svg width="28" height="28" fill="none">
                  <rect x="6" y="6" width="16" height="16" rx="4" fill="#6366f1" />
                </svg>
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight flex items-center gap-3 w-full justify-between">
                <span>{t("OtherPaymentPage.detailOtherPayments")}</span>
                <div className="flex gap-4">
                  {/* <button
                    onClick={() => router.push(`/otherPayment/createOrUpdate?id=${data?.id}`)}
                    className="flex items-center gap-2 rounded-lg border border-blue-500 px-4 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300">
                    <UpdateIcons className="w-4 h-4" />
                    {t("common.update")}
                  </button> */}
                  {data?.paymentStatus === "unpaid" && (
                    <button
                      onClick={() => setOpenDelete(true)}
                      className="flex items-center gap-2 rounded-lg border border-red-500 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300">
                      <DeleteIcons className="w-4 h-4" />
                      {t("common.delete")}
                    </button>
                  )}
                </div>
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <ItemList title={t("OtherPaymentPage.fullName")} value={String(data?.StudentEnrollment?.Student?.fullName)} />
              <ItemList title={t("OtherPaymentPage.title")} value={String(data?.title)} />
              <ItemList title={t("OtherPaymentPage.amount")} value={String(data?.amount)} />
              <ItemList
                title={t("OtherPaymentPage.paymentMethod")}
                value={<div className="rounded-md p-1 text-center bg-success/20 text-success">{t(data?.paymentMethod as any)}</div>}
              />
              <ItemList title={t("OtherPaymentPage.paymentStatus")} value={<ChangeStatusOtherPaymentsComponent data={data} />} />
              <ItemList title={t("OtherPaymentPage.notes")} value={String(data?.notes)} />
              <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
              <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
            </div>
          </div>
        </>
      )}
      <ChangeStatusInstallmentComponent
        data={selectedOtherPayment as any}
        outstandingAmount={data?.amount}
        open={changeOtherPaymentModalOpen}
        setOpen={setChangeOtherPaymentModalOpen}
      />
      <DeleteModel
        description={t("BannerPage.Are-you-sure-you-want-to-delete-this-Banner")}
        title={t("BannerPage.DeleteBanner")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingOtherPaymentRemove}
        name={data?.title ?? ""}
      />
    </div>
  );
};

export default PageComponent;
