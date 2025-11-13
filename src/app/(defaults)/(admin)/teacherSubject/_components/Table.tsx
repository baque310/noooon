"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons, DeleteIcons } from "@/components/common/icons/Actions";
import DeleteModel from "@/components/Model/DeleteModel";
import { toast } from "react-toastify";
import { useTeacherSubjectRemoveMutation } from "@/services/admin/TeacherSubject";
import CreateComponent from "./CreateComponent";
import { useStageGetDataQuery } from "@/services/admin/stage";
import SelectFilter from "@/components/Filter/SelectFilter";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";

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
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();

  const [pageNumber, setPageNumber] = useState(Number(1));
  const [searchTeacher, setSearchTeacher] = useState("");
  const [selectedRecords, setSelectedRecords] = useState([]);
  const [openDelete, setOpenDelete] = useState(false);

  const [param, setParam] = useState<
    | {
        teacherId?: string;
        classId?: string;
        sectionId?: string;
        stageId?: string;
        sectionScheduleId?: string;
        search?: string;
        range?: string;
        schoolYearId?: string;
      }
    | undefined
  >();
  const params = {
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();
  const { isFetching: isFetchingTeacherData, currentData: TeacherData } = useTeacherGetDataQuery({
    search: searchTeacher,
    skip: 1,
    take: 100,
  });

  const { isFetching, currentData: data } = useTeacherSubjectGetDataQuery({
    ...params,
  });

  const [TeacherSubjectRemove, { isLoading: isLoadingTeacherSubjectRemove }] = useTeacherSubjectRemoveMutation();

  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam({
        ...params,
        schoolYearId: Setting?.currentSchoolYearId,
      });
    }
  }, [SchoolYearData, Setting]);

  const [Search, setSearch] = useState(search);

  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value == "") {
      handleSearch(value);
    }
  };
  // const allParams = new URLSearchParams(searchParams);

  const handleSearch = (value?: string) => {
    const v = value ?? Search;
    setSearch(v);
    pushWithCurrentParams("/teacherSubject", { search: v || undefined });
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const [open, setOpen] = useState(false);

  const pushWithCurrentParams = (path = "/teacherSubject", extra: Record<string, any> = {}) => {
    const allParams = new URLSearchParams();
    searchParams.forEach((value, key) => {
      allParams.set(key, value);
    });

    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null) {
        allParams.delete(k);
      } else {
        allParams.set(k, String(v));
      }
    });

    const query = allParams.toString();
    const newUrl = `${path}${query ? `?${query}` : ""}`;

    if (typeof window !== "undefined" && window.history && window.history.replaceState) {
      window.history.replaceState(null, "", newUrl);
    } else {
      router.push(newUrl);
    }
  };

  const handleSelectClass = (value: any) => {
    const classId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), classId, sectionId: undefined }));
    pushWithCurrentParams("/teacherSubject", {
      classId,
      sectionId: undefined,
    });
  };
  const handleSelectSection = (value: any) => {
    const sectionId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), sectionId }));
    pushWithCurrentParams("/teacherSubject", { sectionId });
  };
  const handleSelectStage = (value: any) => {
    const stageId = value ?? undefined;
    setParam((old) => ({
      ...(old ?? {}),
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
    pushWithCurrentParams("/teacherSubject", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };

  const handleSelectSchoolYear = (value: any) => {
    const schoolYearId = value ? value.value : undefined;
    setParam((old) => ({ ...(old ?? {}), schoolYearId }));
    pushWithCurrentParams("/teacherSubject", { schoolYearId });
  };

  const handleSelectTeacher = (value: any) => {
    const teacherId = value ? value.value : undefined;
    setParam((old) => ({ ...(old ?? {}), teacherId }));
    pushWithCurrentParams("/teacherSubject", { teacherId });
  };
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("TeacherSubjectPage.TeacherSubject")}</div>
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

          <SelectWithSearch
            placeholder={t("StudentEnrollmentPage.enter-SchoolYear")}
            isLoading={isFetchingSchoolYearData || isFetchingSetting}
            props={{
              onChange: handleSelectSchoolYear,
              value: param?.schoolYearId,
            }}
            options={SchoolYearData?.map((item) => {
              return {
                value: item.id,
                label: item.from + "-" + item.to,
              };
            })}
          />
          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <div className="inline-flex items-center gap-2">
                    <button
                      className={` ${
                        props.disabled && "hidden"
                      } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                      onClick={() => {
                        setOpen(true);
                      }}>
                      <AddIcons className="h-4 w-4" />
                      {t("common.add")}
                    </button>

                    <div className="relative w-0 h-0">
                      <span
                        className={`${
                          selectedRecords.length > 0 ? "bg-danger" : "bg-transparent text-transparent"
                        } badge absolute top-[-15px] z-10 left-[-70px]  p-0.5 px-1.5 rounded-full`}>
                        {selectedRecords.length > 0 ? selectedRecords.length : ""}
                      </span>
                    </div>

                    <RolePageAndActionBasedComponent
                      component={(p) => {
                        return (
                          <button
                            disabled={selectedRecords.length == 0}
                            className={`${p.disabled && "hidden"} flex items-center gap-2 py-1 px-2 rounded border text-danger hover:bg-danger/10 disabled:opacity-40`}
                            onClick={() => setOpenDelete(true)}>
                            <DeleteIcons className="h-4 w-4" />
                            {t("common.delete")}
                          </button>
                        );
                      }}
                      resource={"admin"}
                      permission={["delete-any", "delete-own"]}
                    />
                  </div>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>
      <div className={"flex justify-start max-md:flex-col gap-3 mt-2   "}>
        <SelectFilter
          placement="bottom-end"
          title={t("StudentEnrollmentPage.StageName")}
          handleChange={handleSelectStage}
          options={
            StageData?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            }) ?? []
          }
        />

        {param?.stageId && (
          <SelectFilter
            title={t("SectionPage.ClassName")}
            placement="bottom-end"
            handleChange={handleSelectClass}
            options={
              StageData?.find((it) => it.id == param?.stageId)?.Class?.map((item) => {
                return {
                  value: item.id,
                  label: t(item.name as any),
                };
              }) ?? []
            }
          />
        )}
        {param?.classId && (
          <SelectFilter
            value={param?.sectionId}
            title={t("StudentEnrollmentPage.SectionName")}
            placement="bottom-end"
            handleChange={handleSelectSection}
            options={
              StageData?.find((it) => it.id == param?.stageId)
                ?.Class.find((it) => it.id == param?.classId)
                ?.Section?.map((item) => {
                  return {
                    value: item.id,
                    label: t(item.name as any),
                  };
                }) ?? []
            }
          />
        )}

        <div className="max-w-36">
          <SelectWithSearch
            placeholder={t("TeacherSubjectPage.enter-TeacherName")}
            isLoading={isFetchingTeacherData}
            props={{
              onChange: handleSelectTeacher,
              value: param?.teacherId,
              onInputChange: (value: string) => {
                setSearchTeacher(value);
              },
            }}
            options={TeacherData?.data?.map((item) => {
              return {
                value: item.id,
                label: item.fullName,
              };
            })}
          />
        </div>
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/teacherSubject/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data as any}
            columns={[
              {
                title: t("TeacherSubjectPage.SubjectName"),
                accessor: "StageSubject.Subject.name",
                // sortable: true,
              },
              {
                title: t("TeacherSubjectPage.TeacherName"),
                accessor: "Teacher.fullName",
                // sortable: true,
              },
              {
                title: t("TeacherSubjectPage.StageName"),
                accessor: "StageSubject.Stage.name",
                // sortable: true,
                render: ({ StageSubject }: any) => (StageSubject ? <div>{t(StageSubject.Stage.name as any)}</div> : null),
              },
              {
                title: t("TeacherSubjectPage.ClassName"),
                accessor: "StageSubject.Class.name",
                // sortable: true,
              },
              {
                title: t("SectionPage.name"),
                accessor: "Section.name",
                // sortable: true,
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
            {...(isFetching && { minHeight: 130 })}
            sortStatus={sortStatus}
            onSortStatusChange={(sort) => {
              setSortStatus(sort);
            }}
            {...({
              selectedRecords: selectedRecords,
              onSelectedRecordsChange: (records: any) => {
                setSelectedRecords(records);
              },
            } as any)}
          />
        )}
      </div>
      <CreateComponent open={open} setOpen={setOpen} />

      <DeleteModel
        description={t("TeacherSubjectPage.Are-you-sure-you-want-to-delete-this-TeacherSubject")}
        title={t("TeacherSubjectPage.DeleteTeacherSubject")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={async () => {
          try {
            if (!selectedRecords || selectedRecords.length === 0) return;
            await Promise.all(
              selectedRecords.map((record: any) => {
                return TeacherSubjectRemove({ id: record.id }).unwrap();
              })
            );
            toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
            setOpenDelete(false);
            setSelectedRecords([]);
          } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error && error.message) {
              return toast.error(t(error.message), { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
          }
        }}
        isLoading={isLoadingTeacherSubjectRemove}
        name={`${selectedRecords.length}`}
      />
    </div>
  );
};

export default withRole(TableComponent, "teacher_subject", ["read-any", "read-own"]);
