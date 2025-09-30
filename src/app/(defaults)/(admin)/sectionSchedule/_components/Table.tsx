"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useLazySectionScheduleGetDataQuery, useSectionScheduleGetDataQuery, useSectionScheduleRemoveMutation } from "@/services/admin/SectionSchedule";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons, DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import IconCaretsDown from "@/components/common/icons/sidebar/icon-carets-down";
import AnimateHeight from "react-animate-height";
import { daysArray } from "@/services/admin/Schedule";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useSettingGetDataQuery } from "@/services/Setting";
import SelectFilter from "@/components/Filter/SelectFilter";
import { useTeacherSubjectGetDataQuery } from "@/services/admin/TeacherSubject";
import EditModel from "./openEditModel";
import DeleteModel from "@/components/Model/DeleteModel";
import { toast } from "react-toastify";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [param, setParam] = useState<
    | {
        classId?: string;
        stageId?: string;
        search?: string;
        range?: string;
        teacherSubjectId?: string;
        sectionId?: string;
        schoolYearId?: string;
      }
    | undefined
  >();

  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const { isFetching: isFetchingTeacherSubjectData, currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    // sectionId  :param.sectionId,
    schoolYearId: param?.schoolYearId,
  });
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();

  useEffect(() => {
    if (SchoolYearData) {
      setParam({
        ...param,
        schoolYearId: Setting?.CurrentSchoolYear.id,
      });
    }
  }, [SchoolYearData, Setting]);

  const [getData, { isFetching, currentData: data }] = useLazySectionScheduleGetDataQuery();

  useEffect(() => {
    // if (param?.sectionId) {
    getData({
      ...(search && { search: search as string }),
      ...(param?.sectionId && {
        sectionId: param.sectionId,
      }),
      ...(param?.schoolYearId && {
        schoolYearId: param.schoolYearId,
      }),
      ...(param?.teacherSubjectId && {
        teacherSubjectId: param.teacherSubjectId,
      }),
    });
    // }
  }, [param]);

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
      router.push(`/sectionSchedule?${allParams.toString()}`);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // const [active, setActive] = useState<number>(-1);
  // const togglePara = (value: number) => {
  //   setActive((oldValue) => {
  //     return oldValue === value ? -1 : value;
  //   });
  // };

  // persist active accordion index in URL param `active` so it survives reloads
  const activeParam = searchParams.get("active");
  const [active, setActive] = useState<number>(activeParam ? Number(activeParam) : -1);

  useEffect(() => {
    const v = searchParams.get("active");
    setActive(v ? Number(v) : -1);
  }, [searchParams]);

  const togglePara = (value: number) => {
    const allParams = new URLSearchParams(searchParams);
    const newValue = active === value ? -1 : value;
    if (newValue === -1) {
      allParams.delete("active");
    } else {
      allParams.set("active", String(newValue));
    }
    // update URL (keeps other query params intact)
    router.push(`/sectionSchedule?${allParams.toString()}`);
    setActive(newValue);
  };

  // helper: push while preserving existing query params (including `active`)
  const pushWithCurrentParams = (path = "/sectionSchedule", extra: Record<string, any> = {}) => {
    const allParams = new URLSearchParams(searchParams);
    Object.entries(extra).forEach(([k, v]) => {
      if (v === undefined || v === null) allParams.delete(k);
      else allParams.set(k, String(v));
    });
    const query = allParams.toString();
    router.push(`${path}${query ? `?${query}` : ""}`);
  };

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value, sectionId: undefined });
    } else {
      setParam({ ...param, classId: undefined, sectionId: undefined });
    }
  };
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value });
    } else {
      setParam({ ...param, sectionId: undefined });
    }
  };
  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({
        ...param,
        stageId: value,
        classId: undefined,
        sectionId: undefined,
      });
    } else {
      setParam({
        ...param,
        stageId: undefined,
        classId: undefined,
        sectionId: undefined,
      });
    }
  };
  const handleSelectTeacherSubject = (value: any) => {
    if (value) {
      setParam({ ...param, teacherSubjectId: value.value });
    } else {
      setParam({ ...param, teacherSubjectId: undefined });
    }
  };
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value.value });
    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  };

  const selectedClassName = searchParams.get("selectedClassName");
  const id = searchParams.get("id");
  const [ScheduleRemove, { isLoading: isLoadingScheduleRemove }] = useSectionScheduleRemoveMutation();
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

  const [openEdit, setOpenEdit] = useState(false);
  const [openDelete, setOpenDelete] = useState(false);
  // const [selectedItem, setSelectedItem] = useState<{ event: React.MouseEvent<Element, globalThis.MouseEvent>; record: any; index: number } | null>(null);
  const [selectedItem, setSelectedItem] = useState<string>("");

  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("SectionSchedulePage.SectionSchedule")}</div>
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
                  <button
                    className={` ${
                      props.disabled && "hidden"
                    } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      router.push("/sectionSchedule/createOrUpdate");
                    }}>
                    <AddIcons className="h-4 w-4" />
                    {t("common.add")}
                  </button>
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
          value={param?.stageId}
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
            value={param?.classId}
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
            placeholder={t("HomeworksPage.teacherFullName")}
            props={{
              onChange: handleSelectTeacherSubject,
            }}
            options={
              TeacherSubjectData?.map((item) => {
                return {
                  label: item.Teacher.fullName,
                  //  + item.StageSubject.Subject.name,
                  value: item.id,
                };
              }) ?? []
            }
          />
        </div>
      </div>
      <div className={"flex flex-col gap-4 mt-4"}>
        {isFetching ? (
          <div className="flex w-full justify-center items-center min-h-64 Card ">
            <div className="loader !bg-primary"></div>
          </div>
        ) : (
          <>
            {daysArray.filter((item) => data && data.data && (data.data[item.value as keyof typeof data.data] as any[])?.length > 0).length == 0 ? (
              <div className="flex justify-center items-center min-h-64 Card">{t("common.no-data")}</div>
            ) : (
              daysArray
                .filter((item) => data && data.data && (data.data[item.value as keyof typeof data.data] as any[])?.length > 0)
                .map((item, index: number) => {
                  return (
                    <div key={index} className="">
                      <button
                        type="button"
                        className={` Card w-full  flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === index ? "!text-primary" : ""}`}
                        onClick={() => togglePara(index)}>
                        <bdi className=" flex gap-1 font-bold text-lg">
                          <p>
                            {index + 1} {")"}
                          </p>

                          <p>{t(item.label)}</p>
                        </bdi>
                        <div className={`ltr:ml-auto rtl:mr-auto ${active === index ? "rotate-180" : ""}`}>
                          <IconCaretsDown />
                        </div>
                      </button>

                      <AnimateHeight duration={300} height={active === index ? "auto" : 0}>
                        <div className={"flex flex-col gap-4  mt-3 p-2 "}>
                          <div className="datatables pagination-padding mt-2">
                            {isMounted && (
                              <DataTable
                                onRowClick={async (item) => {
                                  console.log(item);

                                  setSelectedItem(item.record.id);
                                  router.push(`/sectionSchedule/${item.record.id}`);
                                }}
                                fetching={isFetching}
                                className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
                                records={data && data.data ? data.data[item.value as keyof typeof data.data] : ([] as any)}
                                columns={[
                                  {
                                    title: t("SectionSchedulePage.StageName"),
                                    accessor: "teacherSubject.StageSubject.Stage.name",
                                    render: ({ teacherSubject }) => t(teacherSubject.StageSubject.Stage.name),
                                  },
                                  {
                                    title: t("SectionSchedulePage.ClassName"),
                                    accessor: "section.Class.name",
                                    // render: ({ section }) => t(section.name),
                                  },
                                  {
                                    title: t("SectionSchedulePage.SectionName"),
                                    accessor: "section.name",
                                    render: ({ section }) => t(section.name),
                                  },

                                  {
                                    title: t("SectionSchedulePage.TeacherName"),
                                    accessor: "teacherSubject.Teacher.fullName",
                                  },
                                  {
                                    title: t("SectionSchedulePage.SubjectName"),
                                    accessor: "teacherSubject.StageSubject.Subject.name",
                                  },
                                  {
                                    title: t("SectionSchedulePage.timeFrom"),
                                    accessor: "Schedule.timeFrom",
                                    render: ({ Schedule }: any) => (Schedule.timeFrom ? <div>{moment.utc(Schedule.timeFrom).format("hh:mm:ss A")}</div> : null),
                                  },

                                  {
                                    title: t("SectionSchedulePage.timeTo"),
                                    accessor: "Schedule.timeTo",
                                    render: ({ Schedule }: any) => (Schedule.timeTo ? <div>{moment.utc(Schedule.timeTo).format("hh:mm:ss A")}</div> : null),
                                  },
                                  {
                                    title: t("SectionSchedulePage.SchoolYear"),
                                    accessor: "SchoolYear.from",
                                    render: (record: any) => (
                                      <>
                                        <div className="items-right flex gap-6">
                                          <p dir="ltr">{record.SchoolYear.from ? <div>{moment.utc(record.SchoolYear.from).format("hh:mm:ss A")}</div> : null}</p>
                                          <div className="row-actions items-right m-0 flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(record.id);
                                                pushWithCurrentParams("/sectionSchedule/createOrUpdate", { id: record.id });
                                              }}
                                              title={t("common.update")}>
                                              <UpdateIcons className="h-5 w-5" />
                                            </button>
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                pushWithCurrentParams("/sectionSchedule", {
                                                  id: record.id,
                                                  selectedClassName: record.teacherSubject.StageSubject.Stage.name,
                                                });
                                                setOpenDelete(true);
                                              }}
                                              title={t("common.delete")}>
                                              <DeleteIcons className="h-6 w-6 text-danger" />
                                            </button>
                                          </div>
                                        </div>
                                      </>
                                    ),
                                  },
                                ]}
                                customLoader={<div className="loader !bg-primary"></div>}
                                noRecordsText={t("common.no-data")}
                                noRecordsIcon={<></>}
                              />
                            )}
                          </div>
                        </div>
                      </AnimateHeight>
                    </div>
                  );
                })
            )}
          </>
        )}
      </div>
      <EditModel
        // selectedItemId={selectedItem}
        description={t("SchedulePage.Are-you-sure-you-want-to-delete-this-Schedule")}
        title={t("SchedulePage.UpdateSchedule")}
        open={openEdit}
        setOpen={setOpenEdit}
      />
      <DeleteModel
        description={t("SectionSchedulePage.Are-you-sure-you-want-to-delete-this-SectionSchedule")}
        title={t("SchedulePage.DeleteSchedule")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingScheduleRemove}
        name={selectedClassName ? t(selectedClassName as any) : ""}
      />
    </div>
  );
};

export default withRole(TableComponent, "schedule", ["read-any", "read-own"]);
