"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";
import { getTranslation } from "@/ni18n/i18n";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { RestoreIcons } from "@/components/common/icons/Actions";
import { IInstallmentPayments, PaymentMethod, Status, useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery } from "@/services/admin/installmentPayment";
import ChangeStatusInstallmentComponent from "./changeStatusInstallmentComponent";
import { IOtherPayment, useOtherPaymentGetDataByIdQuery } from "@/services/admin/other-payment";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const { currentData: data, isFetching } = useOtherPaymentGetDataByIdQuery(
    { id: String(id) },
    {
      skip: !id,
    }
  );
  console.log(data);

  // const [InstallmentPaymentGetDataByStudentEnrollmentId, { currentData: installmentData, isFetching: isFetchingInstallment }] =
  //   useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery();

  // useEffect(() => {
  //   if (data) {
  //     if (!data) {
  //       router.back();
  //     }
  //     InstallmentPaymentGetDataByStudentEnrollmentId({ studentEnrollmentId: data?.studentEnrollmentId as string });
  //   }
  // }, [data]);

  const [selectedOtherPayment, setSelectedOtherPayment] = useState<IOtherPayment | null>(null);
  const [installmentModalOpen, setOtherPaymentModalOpen] = useState(false);
  const [changeOtherPaymentModalOpen, setChangeOtherPaymentModalOpen] = useState(false);
  // console.log(selectedOtherPayment);

  // Handler for update button
  const handleUpdateOtherPayment = (installment: IOtherPayment) => {
    setSelectedOtherPayment(installment);
    setOtherPaymentModalOpen(true);
  };
  const handleChangeOtherPayment = (installment: IOtherPayment) => {
    setSelectedOtherPayment(installment);
    setChangeOtherPaymentModalOpen(true);
  };
  // console.log(installmentData?.installment?.studentEnrollmentId);
  // console.log(installmentData?.installment);

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
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">{t("OtherPaymentPage.detailOtherPayments")}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <ItemList title={t("OtherPaymentPage.fullName")} value={String(data?.StudentEnrollment?.Student?.fullName)} />
              <ItemList title={t("OtherPaymentPage.title")} value={String(data?.title)} />
              <ItemList title={t("OtherPaymentPage.amount")} value={String(data?.amount)} />
              <ItemList title={t("OtherPaymentPage.paymentMethod")} value={t((data?.paymentMethod ?? "") as any)} />
              <ItemList title={t("OtherPaymentPage.paymentStatus")} value={t((data?.paymentStatus ?? "") as any)} />
              <ItemList title={t("OtherPaymentPage.notes")} value={String(data?.notes)} />
              <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
              <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />

              {/* <ItemList
                title={t("common.status")}
                value={
                  installmentData?.installment?.isActive ? (
                    <div className="text-green-500 font-semibold">{t("common.isActive")}</div>
                  ) : (
                    <div className="text-red-500 font-semibold">{t("common.isNotActive")}</div>
                  )
                }
              />
              <ItemList title={t("InstallmentPage.notes")} value={String(installmentData?.installment?.notes)} />
              <ItemList title={t("InstallmentPage.numberOfInstallments")} value={String(installmentData?.installment?.numberOfInstallments)} />
              <ItemList title={t("InstallmentPage.daysBetweenInstallments")} value={String(installmentData?.installment?.daysBetweenInstallments)} />
              <ItemList
                title={t("InstallmentPage.installmentAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">{installmentData?.installment?.installmentAmount?.toLocaleString()}</span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">{t("IQD")}</span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.totalAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">{installmentData?.installment?.totalAmount?.toLocaleString()}</span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">{t("IQD")}</span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.discountAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">{installmentData?.installment?.discountAmount?.toLocaleString()}</span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">{t("IQD")}</span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.finalTotalAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">{installmentData?.installment?.finalTotalAmount?.toLocaleString()}</span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">{t("IQD")}</span>
                  </div>
                }
              />
              <ItemList title={t("InstallmentPage.startDate")} value={moment(installmentData?.installment?.startDate).format("YYYY-MM-DD")} />
              <ItemList title={t("InstallmentPage.discount")} value={String(installmentData?.installment?.Discount.percentage ?? "") + " %"} />
              <ItemList title={t("InstallmentPage.discountTitle")} value={String(installmentData?.installment?.Discount.title ?? "") + " %"} />
              <ItemList title={t("common.updatedAt")} value={moment(installmentData?.installment?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
              <ItemList title={t("common.createdAt")} value={moment(installmentData?.installment?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} /> 
              */}
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
    </div>
  );
};

export default PageComponent;
