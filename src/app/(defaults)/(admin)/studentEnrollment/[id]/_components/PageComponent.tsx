"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";
import { getTranslation } from "@/ni18n/i18n";
import { useLazyStudentEnrollmentGetDataByIdQuery } from "@/services/admin/studentEnrollment";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import moment from "moment";
import { RestoreIcons, UpdateIcons } from "@/components/common/icons/Actions";
import UpdateInstallmentComponent from "./UpdateInstallmentComponent";
import {
  IInstallmentPayments,
  useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery,
} from "@/services/admin/installmentPayment";
import ChangeStatusInstallmentComponent from "./changeStatusInstallmentComponent";
const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [StudentEnrollmentGetDataById, { currentData: data, isFetching }] =
    useLazyStudentEnrollmentGetDataByIdQuery();
  const [
    InstallmentPaymentGetDataByStudentEnrollmentId,
    { currentData: installmentData, isFetching: isFetchingInstallment },
  ] = useLazyInstallmentPaymentGetDataByStudentEnrollmentIdQuery();

  useEffect(() => {
    if (id) {
      StudentEnrollmentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
      InstallmentPaymentGetDataByStudentEnrollmentId({
        studentEnrollmentId: String(id),
      });
    }
  }, [id]);

  const [selectedInstallment, setSelectedInstallment] =
    useState<IInstallmentPayments | null>(null);
  const [installmentModalOpen, setInstallmentModalOpen] = useState(false);
  const [changeInstallmentModalOpen, setChangeInstallmentModalOpen] =
    useState(false);

  // Handler for update button
  const handleUpdateInstallment = (installment: IInstallmentPayments) => {
    setSelectedInstallment(installment);
    setInstallmentModalOpen(true);
  };
  const handleChangeInstallment = (installment: IInstallmentPayments) => {
    setSelectedInstallment(installment);
    setChangeInstallmentModalOpen(true);
  };

  return (
    <div className="mx-auto my-0 mb-20 px-2 ">
      <BackButton
        title={t("StudentEnrollmentPage.StudentEnrollmentInformation")}
      />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          {/* Student Info Card */}
          <div className="bg-gradient-to-br from-teal-50 to-white dark:from-[#222] dark:to-[#333] rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-teal-500/30 text-teal-700 rounded-full p-3 shadow">
                <svg width="28" height="28" fill="none">
                  <circle cx="14" cy="14" r="12" fill="#14b8a6" />
                </svg>
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t("StudentEnrollmentPage.StudentEnrollmentInformation")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <ItemList
                title={t("StudentEnrollmentPage.StudentFullName")}
                value={String(data?.Student.fullName)}
              />
              <ItemList
                title={t("StudentEnrollmentPage.enrollmentDate")}
                value={
                  data?.Student.enrollmentDate
                    ? moment(data?.Student.enrollmentDate).format("YYYY-MM-DD")
                    : ""
                }
              />
              <ItemList
                title={t("StudentEnrollmentPage.SchoolYear")}
                value={
                  String(data?.SchoolYear.from) +
                  " - " +
                  String(data?.SchoolYear.to)
                }
              />
              <ItemList
                title={t("StudentEnrollmentPage.StageName")}
                value={data?.Stage.name && t(data?.Stage.name as any)}
              />
              <ItemList
                title={t("StudentEnrollmentPage.ClassName")}
                value={String(data?.Class.name)}
              />
              <ItemList
                title={t("StudentEnrollmentPage.SectionName")}
                value={data?.Section.name && t(data?.Section.name as any)}
              />
              <ItemList
                title={t("StudentInstallmentPage.amount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-lg text-teal-600">
                      {data?.amount?.toLocaleString()}
                    </span>
                    <span className="font-bold text-teal-500 bg-teal-500/20 w-fit rounded-md flex text-xs px-2 py-1">
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
          </div>

          {/* Installment Info Card */}
          <div className="bg-gradient-to-br from-indigo-50 to-white dark:from-[#222] dark:to-[#333] rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-indigo-500/30 text-indigo-700 rounded-full p-3 shadow">
                <svg width="28" height="28" fill="none">
                  <rect
                    x="6"
                    y="6"
                    width="16"
                    height="16"
                    rx="4"
                    fill="#6366f1"
                  />
                </svg>
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t("InstallmentPage.detailInstallments")}
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-4">
              <ItemList
                title={t("InstallmentPage.title")}
                value={String(installmentData?.installment?.title)}
              />
              <ItemList
                title={t("common.status")}
                value={
                  installmentData?.installment?.isActive ? (
                    <div className="text-green-500 font-semibold">
                      {t("common.isActive")}
                    </div>
                  ) : (
                    <div className="text-red-500 font-semibold">
                      {t("common.isNotActive")}
                    </div>
                  )
                }
              />
              <ItemList
                title={t("InstallmentPage.notes")}
                value={String(installmentData?.installment?.notes)}
              />
              <ItemList
                title={t("InstallmentPage.numberOfInstallments")}
                value={String(
                  installmentData?.installment?.numberOfInstallments
                )}
              />
              <ItemList
                title={t("InstallmentPage.daysBetweenInstallments")}
                value={String(
                  installmentData?.installment?.daysBetweenInstallments
                )}
              />
              <ItemList
                title={t("InstallmentPage.installmentAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">
                      {installmentData?.installment?.installmentAmount?.toLocaleString()}
                    </span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">
                      {t("IQD")}
                    </span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.totalAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">
                      {installmentData?.installment?.totalAmount?.toLocaleString()}
                    </span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">
                      {t("IQD")}
                    </span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.discountAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">
                      {installmentData?.installment?.discountAmount?.toLocaleString()}
                    </span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">
                      {t("IQD")}
                    </span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.finalTotalAmount")}
                value={
                  <div className="flex gap-1 items-center">
                    <span className="font-bold text-indigo-600">
                      {installmentData?.installment?.finalTotalAmount?.toLocaleString()}
                    </span>
                    <span className="font-bold text-indigo-500 bg-indigo-500/20 w-fit rounded-md flex text-xs px-2 py-1">
                      {t("IQD")}
                    </span>
                  </div>
                }
              />
              <ItemList
                title={t("InstallmentPage.startDate")}
                value={moment(installmentData?.installment?.startDate).format(
                  "YYYY-MM-DD"
                )}
              />
              <ItemList
                title={t("InstallmentPage.discount")}
                value={
                  String(
                    installmentData?.installment?.Discount.percentage ?? ""
                  ) + " %"
                }
              />
              <ItemList
                title={t("InstallmentPage.discountTitle")}
                value={
                  String(installmentData?.installment?.Discount.title ?? "") +
                  " %"
                }
              />
              <ItemList
                title={t("common.updatedAt")}
                value={moment(installmentData?.installment?.updatedAt).format(
                  "YYYY-MM-DD hh:mm:ss A"
                )}
              />
              <ItemList
                title={t("common.createdAt")}
                value={moment(installmentData?.installment?.createdAt).format(
                  "YYYY-MM-DD hh:mm:ss A"
                )}
              />
            </div>
          </div>

          {/* Installment Payments Table */}
          <div className="bg-gradient-to-br from-amber-50 to-white dark:from-[#222] dark:to-[#333] rounded-2xl shadow-lg p-8 mb-8 border border-gray-100 dark:border-gray-700 transition-all duration-300">
            <div className="flex items-center gap-3 mb-6">
              <span className="inline-block bg-amber-500/30 text-amber-700 rounded-full p-3 shadow">
                <svg width="28" height="28" fill="none">
                  <rect
                    x="8"
                    y="8"
                    width="12"
                    height="12"
                    rx="3"
                    fill="#f59e42"
                  />
                </svg>
              </span>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                {t("InstallmentPage.installments")}
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                <thead className="bg-gray-100 dark:bg-[#333]">
                  <tr>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white text-center">
                      {t("InstallmentPage.action")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white text-center">
                      #
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("StudentInstallmentPage.amount")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("InstallmentPage.dueDate")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("InstallmentPage.paidDate")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("InstallmentPage.paid")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("InstallmentPage.paymentMethod")}
                    </th>
                    <th className="px-3 py-2 font-semibold text-gray-700 dark:text-white">
                      {t("InstallmentPage.notes")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {installmentData?.installment.InstallmentPayments?.map(
                    (item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-teal-50 dark:hover:bg-teal-900/20 transition"
                      >
                        <td className="px-3 py-2 text-center flex items-center justify-center gap-2">
                          {/* <button
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 text-xs font-semibold shadow transition flex items-center gap-1"
                            onClick={() => handleUpdateInstallment(item)}
                            title={t("common.update")}
                          >
                            <UpdateIcons className="size-4" />
                          </button> */}
                          <button
                            className="bg-indigo-500 hover:bg-indigo-600 text-white rounded px-3 py-1 text-xs font-semibold shadow transition flex items-center gap-1"
                            onClick={() => handleChangeInstallment(item)}
                            title={t("common.changeStatus")}
                          >
                            <RestoreIcons className="size-4" />
                          </button>
                        </td>
                        <td className="px-3 py-2 text-center">
                          {item.installmentNumber}
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-teal-600">
                          {item.amount?.toLocaleString()}
                        </td>
                        <td className="px-3 py-2">
                          {item.dueDate
                            ? moment(item.dueDate).format("YYYY-MM-DD")
                            : "-"}
                        </td>
                        <td className="px-3 py-2">
                          {item.paidDate
                            ? moment(item.paidDate).format("YYYY-MM-DD")
                            : "-"}
                        </td>
                        <td className="px-3 py-2">{t(item.isPaid)}</td>
                        <td className="px-3 py-2">
                          {item.paymentMethod ?? "-"}
                        </td>
                        <td className="px-3 py-2">{item.notes ?? "-"}</td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      <UpdateInstallmentComponent
        data={selectedInstallment as any}
        open={installmentModalOpen}
        setOpen={setInstallmentModalOpen}
      />
      <ChangeStatusInstallmentComponent
        data={selectedInstallment as any}
        open={changeInstallmentModalOpen}
        setOpen={setChangeInstallmentModalOpen}
      />
    </div>
  );
};

export default PageComponent;
