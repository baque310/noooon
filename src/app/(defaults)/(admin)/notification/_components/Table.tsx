"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import { withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { useNotificationGetDataForAdminQuery } from "@/services/Notification";
import FormattedDate from "@/components/common/FormattedDate";
import { PAGE_CODE } from "@/services/types/BaseType";
import { toast } from "react-toastify";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();

  const [pageNumber, setPageNumber] = useState(Number(1));

  const [param, setParam] = useState<
    | {
        approval_status?: string;
        search?: string;
        range?: string;
      }
    | undefined
  >();
  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    isAlert: "FALSE",
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching, currentData: data } = useNotificationGetDataForAdminQuery({
    ...params,
  });

  const [Search, setSearch] = useState(search);
  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value == "") {
      handleSearch(value);
    }
  };
  const allParams = new URLSearchParams(searchParams);
  const handleSearch = (value?: string) => {
    if (search != Search) {
      allParams.set("search", value ?? Search);

      router.push(`/notification?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("NotificationPage.Notifications")}</div>
        <div className={"flex gap-3 max-md:flex-col max-md:items-end"}>
          <input
            value={Search ?? ""}
            placeholder={`${t("common.search")} ...`}
            onKeyDown={handleKeyPress}
            onChange={handleChange}
            id="search"
            className="form-input text-white-dark"
            name="search"
          />
          {/* {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <button
                    className={` ${
                      props.disabled && "hidden"
                    } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      router.push("/notification/createOrUpdate");
                    }}>
                    <AddIcons className="h-4 w-4" />
                    {t("common.add")}
                  </button>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          } */}
        </div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              // console.log(item.record.data.type);
              const record = item.record as any;

              // Define all valid PAGE_CODE values to compare with
              const validPageCodes: PAGE_CODE[] = [
                "admin",
                "school",
                "stage",
                "class",
                "section",
                "student",
                "student_enrollment",
                "otherPayment",
                "teacher",
                "bus",
                "banner",
                "guidance",
                "gallery",
                "subject",
                "sub_subject",
                "stage_subject",
                "teacher_subject",
                "schedule",
                "section_schedule",
                "exam",
                "exam_type",
                "exam_result",
                "attendance",
                "lesson",
                "homework",
                "library",
                "setting",
                "notification",
                "user",
                "dashboard",
                "parent",
                "video",
                "complaint",
                "chat",
                "discount",
                "installment",
                "student_installment",
              ];

              // Loop to compare record.data.type with all PAGE_CODE items
              const isValidPageCode = validPageCodes.some((code) => record.data?.type === code);
              const targetType = isValidPageCode
                ? record.data.type === "student_enrollment"
                  ? "studentEnrollment"
                  : record.data.type === "student_installment"
                    ? "installment"
                    : record.data.type === "library"
                      ? "superTeacherLibrary"
                      : record.data.type === "lesson"
                        ? "teacherLessons"
                        : record.data.type === "homework"
                          ? "teacherHomeworks"
                          : record.data.type === "exam"
                            ? "exams"
                            : record.data.type === "exam_result"
                              ? "examResult"
                              : record.data.type === "attendance"
                                ? "superTeacherAttendances"
                                : record.data.type === "attendance"
                                  ? "superTeacherAttendances"
                                  : record.data.type
                : "none";
              // console.log(record.data.type);
              if (targetType !== "none") {
                router.push(`/${targetType}/${`createOrUpdate?title=${item.record.title}&body=${item.record.body}`}`);
              } else {
                toast.warning(t("NotificationPage.no page to redirect"));
              }
              // router.push(`/notification/createOrUpdate?title=${item.record.title}&body=${item.record.body}`);
              // router.push(`/${item?.record?.data?.type ? item?.record?.data?.type : "notification"}/${item?.record?.data?.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[
              {
                title: t("NotificationPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("NotificationPage.body"),
                accessor: "body",
                sortable: true,
              },
              {
                title: t("NotificationPage.isSeen"),
                accessor: "isSeen",
                sortable: true,
                render: ({ isSeen }) => (
                  <div className="flex gap-2 px-[2px]">
                    {isSeen == "TRUE" ? (
                      <div className={` rounded-md p-1 text-center bg-success/20 text-success `}>{t("NotificationPage.seen")}</div>
                    ) : (
                      <div className={` rounded-md p-1 text-center bg-warning/50 text-warning`}>{t("NotificationPage.notSeen")}</div>
                    )}
                  </div>
                ),
              },

              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                render: (row: any) => (
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-500">{t("common.updatedAt")}</div>
                    <FormattedDate date={row.updatedAt} />
                  </div>
                ),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                render: (row: any) => (
                  <div className="text-center">
                    <div className="mb-1 text-xs text-gray-500">{t("common.createdAt")}</div>
                    <FormattedDate date={row.createdAt} />
                  </div>
                ),
              },
            ]}
            customLoader={<div className="loader !bg-primary"></div>}
            noRecordsText={t("common.no-data")}
            noRecordsIcon={<></>}
            {...(isFetching && { minHeight: 130 })}
            sortStatus={sortStatus}
            onSortStatusChange={(sort) => {
              setSortStatus(sort);
            }}
            totalRecords={data?.totalCount}
            recordsPerPage={30}
            page={pageNumber}
            onPageChange={(p) => {
              setPageNumber(p);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default withRole(TableComponent, "notification", ["read-any", "read-own"]);
