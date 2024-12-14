"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useState } from "react";

import moment from "moment";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";

import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { useRouter } from "next/navigation";
import { useBusDisconnectStudentBusMutation } from "@/services/admin/bus";
import Avatar from "@/components/common/Avatar";



const RowStudentTable = ({ data, id }: { data: any[], id: string }) => {
  const { t } = getTranslation();
  const { isMounted } = useMounted();
  const [selectedRecords, setSelectedRecords] = useState([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const [BusDisconnectStudentBus, { isLoading: isLoadingBusDisconnectStudentBus }] = useBusDisconnectStudentBusMutation()
  const router = useRouter();
  const handleRemove = async () => {
    try {
      await BusDisconnectStudentBus({
        busId: id,
        studentIds: selectedRecords.map((record: any) => record.id)
      }).unwrap();
      toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
      setOpenDelete(false);
      setSelectedRecords([])
    } catch (error: any) {
      console.error('Failed to operation :', error);
      if (error && error.message) {
        return toast.error(error.message, { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };
  const [openDelete, setOpenDelete] = useState(false)
  return (
    <>
      <div className="flex gap-2">
        <button
          className={` flex justify-center gap-1  items-center bg-secondary border-secondary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            router.push(`/bus/${id}`);
          }}>
          {t("common.view")}
        </button>
        <button
          className={` flex justify-center gap-1  items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
          onClick={() => {
            router.push(`/bus/addStudent?id=${id}`);
          }}>
          {t("BusPage.addStudents")}
        </button>
        <button
          disabled={!(selectedRecords.length > 0)}
          className={` ${!(selectedRecords.length > 0) && "!bg-danger/50 !border-danger/50 cursor-not-allowed"} flex justify-center gap-1  items-center bg-danger border-danger/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border `}
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
                title: t("StudentPage.photo"),
                accessor: "photo",
                sortable: true,
                render: ({ photo, fullName }: any) => <>
                  <Avatar
                    photo={photo}
                    username={fullName}
                  />
                </>
              },
              {
                title: t("StudentPage.fullName"),
                accessor: "fullName",
                sortable: true,
              },
              {
                title: t("StudentPage.Username"),
                accessor: "User.username",
                // sortable: true,
              },
              {
                title: t("StudentPage.birth"),
                accessor: "birth",
                sortable: true,
                render: ({ birth }: any) => (birth ? <div>{moment(birth).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("StudentPage.enrollmentDate"),
                accessor: "enrollmentDate",
                sortable: true,
                render: ({ enrollmentDate }: any) => (enrollmentDate ? <div>{moment(enrollmentDate).format("YYYY-MM-DD")}</div> : null),
              },
              {
                title: t("StudentPage.address"),
                accessor: "address",
                sortable: true,
              },
              {
                title: t("StudentPage.email"),
                accessor: "email",
                sortable: true,
              },
              {
                title: t("StudentPage.phone1"),
                accessor: "phone1",
                sortable: true,
              },
              {
                title: t("StudentPage.phone2"),
                accessor: "phone2",
                sortable: true,
              },

              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) => (updatedAt ? <div>{moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) => (createdAt ? <div>{moment(createdAt).format("YYYY-MM-DD hh:mm:ss A")}</div> : null),
              },
            ]}
            customLoader={<div className="loader !bg-primary"></div>}
            noRecordsText={t("common.no-data")}
            noRecordsIcon={<></>}
            {...  {
              selectedRecords: selectedRecords,
              onSelectedRecordsChange: (records: any) => {
                setSelectedRecords(records);
              },
              // isRecordSelectable: (record: any) => record.isPaid == false

            } as any}
          />
        )}
        <DeleteModel
          description={t('BusPage.Are-you-sure-you-want-to-delete-this-BusStudent')}
          title={t('BusPage.DeleteBusStudent')}
          open={openDelete}
          setOpen={setOpenDelete}
          handleRemove={handleRemove}
          isLoading={isLoadingBusDisconnectStudentBus}
          name={`${selectedRecords.length}`}
        />
      </div>  </>

  );
};

export default RowStudentTable



