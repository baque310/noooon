"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";
import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useLazySectionScheduleGetDataQuery, useSectionScheduleRemoveMutation } from "@/services/admin/SectionSchedule";
import { IRootState } from "@/store";
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
import DeleteModel from "@/components/Model/DeleteModel";
import { toast } from "react-toastify";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  // TODO to any one else: you should use either state or params to store selected values, not both
  const [stageId, setStageId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(undefined);

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
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();

  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();
  const { isFetching: isFetchingTeacherSubjectData, currentData: TeacherSubjectData } = useTeacherSubjectGetDataQuery({
    stageId: stageId,
    classId: classId,
    schoolYearId: schoolYearId || Setting?.currentSchoolYearId || "",
    sectionId: sectionId,
  });

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
    getData({
      sectionId: param?.sectionId,
      ...(search && { search: search as string }),
      ...(param?.schoolYearId && {
        schoolYearId: param.schoolYearId,
      }),
      ...(param?.teacherSubjectId && {
        teacherSubjectId: param.teacherSubjectId,
      }),
    });
  }, [param]);

  const [Search, setSearch] = useState(search);
  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);
    if (value == "") {
      handleSearch(value);
    }
  };

  const handleSearch = (value?: string) => {
    const v = value ?? Search;
    setSearch(v);
    pushWithCurrentParams("/sectionSchedule", { search: v || undefined });
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const [active, setActive] = useState<number>(-1);

  useEffect(() => {
    const savedActive = sessionStorage.getItem("sectionScheduleActive");
    if (savedActive) {
      setActive(Number(JSON.parse(savedActive)));
    }
  }, []);
  const togglePara = (value: number) => {
    setActive((oldValue) => {
      return oldValue === value ? -1 : value;
    });
  };

  const pushWithCurrentParams = (path = "/sectionSchedule", extra: Record<string, any> = {}) => {
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

  useEffect(() => {
    const init: any = {};
    searchParams.forEach((value, key) => {
      if (key === "stageId") init.stageId = value;
      if (key === "classId") init.classId = value;
      if (key === "sectionId") init.sectionId = value;
      if (key === "teacherSubjectId") init.teacherSubjectId = value;
      if (key === "schoolYearId") init.schoolYearId = value;
      if (key === "search") setSearch(value);
      if (key === "active") {
      }
    });
    setParam((old) => ({ ...(old ?? {}), ...init }));
  }, [searchParams]);

  const handleSelectClass = (value: any) => {
    setClassId(value ? value : undefined);
    const classId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), classId, sectionId: undefined }));
    pushWithCurrentParams("/sectionSchedule", {
      classId,
      sectionId: undefined,
    });
  };
  const handleSelectSection = (value: any) => {
    setSectionId(value ? value : undefined);
    const sectionId = value ?? undefined;
    setParam((old) => ({ ...(old ?? {}), sectionId }));
    pushWithCurrentParams("/sectionSchedule", { sectionId });
  };
  const handleSelectStage = (value: any) => {
    setStageId(value ? value : undefined);
    const stageId = value ?? undefined;
    setParam((old) => ({
      ...(old ?? {}),
      stageId,
      classId: undefined,
      sectionId: undefined,
    }));
    pushWithCurrentParams("/sectionSchedule", {
      stageId,
      classId: undefined,
      sectionId: undefined,
    });
  };
  // const handleSelectTeacher = (value: any) => {
  //   setTeacherId(value ? value : undefined);
  //   const teacherSubjectId = value ? value : undefined;
  //   setParam((old) => ({ ...(old ?? {}), teacherSubjectId }));
  //   pushWithCurrentParams("/sectionSchedule", { teacherSubjectId });
  // };

  const handleSelectTeacher = (value: any) => {
    // setTeacherId(value ? value : undefined);

    if (value) {
      setParam({ ...param, teacherSubjectId: value.value });
    } else {
      setParam({ ...param, teacherSubjectId: undefined });
    }
  };

  const handleSelectSchoolYear = (value: any) => {
    setSchoolYearId(value ? value.value : undefined);
    const schoolYearId = value ? value.value : undefined;
    setParam((old) => ({ ...(old ?? {}), schoolYearId }));
    pushWithCurrentParams("/sectionSchedule", { schoolYearId });
  };

  const selectedClassName = searchParams.get("selectedClassName");
  const id = searchParams.get("id");
  const [ScheduleRemove, { isLoading: isLoadingScheduleRemove }] = useSectionScheduleRemoveMutation();
  const handleRemove = async () => {
    try {
      await ScheduleRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
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
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [selectedRecords, setSelectedRecords] = useState([]);

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
                  <div className="inline-flex items-center gap-2">
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
        {param?.sectionId && (
          <div className="max-w-36">
            <SelectWithSearch
              placeholder={t("HomeworksPage.teacherFullName")}
              props={{
                onChange: handleSelectTeacher,
              }}
              options={
                sectionId === undefined && schoolYearId === undefined
                  ? []
                  : TeacherSubjectData?.map((item) => {
                      console.log(item);

                      return {
                        label: item.StageSubject?.Subject?.name + " - " + item?.Teacher?.fullName,
                        value: item.id,
                      };
                    }) ?? []
              }
            />

            {/* <SelectFilter
              value={param?.sectionId}
              title={t("HomeworksPage.teacherFullName")}
              placement="bottom-end"
              handleChange={handleSelectTeacher}
              options={
                sectionId === undefined && schoolYearId === undefined
                  ? []
                  : TeacherSubjectData?.map((item) => {
                      // console.log(item);

                      return {
                        label: item.StageSubject?.Subject?.name + " - " + item?.Teacher?.fullName,
                        value: item.StageSubject.Subject.id,
                      };
                    }) ?? []
              }
            /> */}
          </div>
        )}
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
                                  sessionStorage.setItem("sectionScheduleActive", JSON.stringify(active)); // Save the current active index
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
                                          {/* <div className="row-actions items-right m-0 flex gap-4 opacity-0 transition-opacity group-hover:opacity-100">
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedItem(record.id);
                                                // pushWithCurrentParams("/sectionSchedule/createOrUpdate", { id: record.id });
                                                router.push(`/sectionSchedule/createOrUpdate?id=${record.id}`);
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
                                          </div> */}
                                        </div>
                                      </>
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
                                } as any)}
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

      <DeleteModel
        description={t("SectionSchedulePage.Are-you-sure-you-want-to-delete-this-SectionSchedule")}
        title={t("SchedulePage.DeleteSchedule")}
        open={selectedRecords.length === 0 ? openDelete && !openDelete : openDelete}
        setOpen={(open: any) => {
          setOpenDelete(open);
          if (!open) {
            setSelectedRecords([]);
          }
        }}
        handleRemove={async () => {
          try {
            if (selectedRecords.length > 0) {
              await Promise.all(
                selectedRecords.map((record: any) => {
                  return ScheduleRemove({ id: record.id }).unwrap();
                })
              );
              toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
              setOpenDelete(false);
              setSelectedRecords([]);
            } else if (id) {
              await handleRemove();
            }
          } catch (error: any) {
            console.error("Failed to operation :", error);
            if (error && error.message) {
              return toast.error(t(error.message), { autoClose: 15000 });
            }
            toast.error(error, { autoClose: 15000 });
          }
        }}
        isLoading={isLoadingScheduleRemove}
        name={selectedRecords.length > 0 ? `${selectedRecords.length}` : selectedClassName ? t(selectedClassName as any) : ""}
      />
    </div>
  );
};

export default withRole(TableComponent, "schedule", ["read-any", "read-own"]);
