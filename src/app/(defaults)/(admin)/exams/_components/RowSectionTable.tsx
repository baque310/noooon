"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useState } from "react";

import moment from "moment";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";

import { useSelector } from "react-redux";
import { useExamSectionsRemoveMutation, useExamsRemoveMutation } from "@/services/admin/Exams";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { useRouter } from "next/navigation";

const RowSectionTable = ({ data, id }: { data: any[]; id: string }) => {
  const { t } = getTranslation();
  const { isMounted } = useMounted();
  const [selectedRecords, setSelectedRecords] = useState([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const [ExamsRemove, { isLoading: isLoadingExamsRemove }] = useExamSectionsRemoveMutation();
  const router = useRouter();
  const handleRemove = async () => {
    try {
      await ExamsRemove({
        examSectionIds: selectedRecords.map((record: any) => record.id),
      }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      setOpenDelete(false);
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
    <>
      <div className="flex gap-2">
        <button
          className={` flex justify-center gap-1  items-center bg-secondary border-secondary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            router.push(`/exams/${id}`);
          }}>
          {t("common.view")}
        </button>
        <button
          className={` flex justify-center gap-1  items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            router.push(`/exams/addSection?id=${id}`);
          }}>
          {t("ExamsPage.addSection")}
        </button>
        <button
          className={` flex justify-center gap-1  items-center bg-info border-info/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            router.push(`/exams/createOrUpdate?id=${id}`);
          }}>
          {t("ExamsPage.update")}
        </button>
        <button
          disabled={!(selectedRecords.length > 0)}
          className={` ${
            !(selectedRecords.length > 0) && "!bg-danger/50 !border-danger/50 cursor-not-allowed"
          } flex justify-center gap-1  items-center bg-danger border-danger/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            if (selectedRecords.length > 0) {
              setOpenDelete(true);
            }
          }}>
          {t("common.delete")}
        </button>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            className={`${isDark} table-hover whitespace-nowrap rounded-lg  `}
            records={data}
            columns={[
              {
                title: t("ExamsPage.examDate"),
                accessor: "examDate",
                render: ({ examDate }: any) => (examDate ? <div>{moment(examDate).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("StagePage.name"),
                accessor: "Section.name",
                render: ({ Section }: any) => Section?.name && t(Section?.name ?? ""),
              },
              {
                title: t("common.actions"),
                accessor: "actions",
                render: (record: any) => (
                  <div className="flex gap-2">
                    <button
                      className={` flex justify-center gap-1  items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
                      onClick={() => {
                        router.push(`/exams/addSection?id=${id}&examSectionId=${record.id}`);
                      }}>
                      {t("common.edit")}
                    </button>
                  </div>
                ),
              },
            ]}
            customLoader={<div className="loader !bg-primary"></div>}
            noRecordsText={t("common.no-data")}
            noRecordsIcon={<></>}
            {...({
              selectedRecords: selectedRecords,
              onSelectedRecordsChange: (records: any) => {
                setSelectedRecords(records);
              },
              // isRecordSelectable: (record: any) => record.isPaid == false
            } as any)}
          />
        )}
        <DeleteModel
          description={t("ExamsPage.Are-you-sure-you-want-to-delete-this-ExamSection")}
          title={t("ExamsPage.DeleteExamSection")}
          open={openDelete}
          setOpen={setOpenDelete}
          handleRemove={handleRemove}
          isLoading={isLoadingExamsRemove}
          name={`${selectedRecords.length}`}
        />
      </div>{" "}
    </>
  );
};

export default RowSectionTable;
