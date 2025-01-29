"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddIcons, ArrowIcons, DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStudentEnrollmentGetDataQuery, useStudentEnrollmentRemoveMutation } from "@/services/admin/studentEnrollment";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";
import UpdateComponent from "./UpdateComponent";
import Dropdown from "@/components/dropdown";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { SelectWithSearch } from "@/components/Filter/SelectSearch";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import SelectFilter from "@/components/Filter/SelectFilter";


const TableComponent = () => {
  const { t } = getTranslation();
  const [open, setOpen] = useState(false);
  const [openDelete, setOpenDelete] = useState(false)
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [selectedRecords, setSelectedRecords] = useState([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const [pageNumber, setPageNumber] = useState(Number(1));
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();
  const { isFetching: isFetchingSchoolYearData, currentData: SchoolYearData } = useSchoolYearGetDataQuery();

  const [param, setParam] = useState<
    | {
      approval_status?: string;
      search?: string;
      range?: string;
      classId?: string;
      sectionId?: string;
      stageId?: string;
      schoolYearId?: string;

    }
    | undefined
  >();
  useEffect(() => {
    if (SchoolYearData && Setting) {
      setParam(
        {
          ...params,
          schoolYearId: Setting?.currentSchoolYearId

        }
      )
    }
  }, [SchoolYearData, Setting])

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching: isFetching, currentData: data } = useStudentEnrollmentGetDataQuery({
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
      router.push(`/studentEnrollment?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
  const [StudentEnrollmentRemove, { isLoading: isLoadingStudentEnrollmentRemove }] = useStudentEnrollmentRemoveMutation()

  const handleRemove = async () => {
    try {
      await StudentEnrollmentRemove({
        studentEnrollmentIds: selectedRecords.map((record: any) => record.id)
      }).unwrap();
      toast.success(t('common.deleted-successfully'), { autoClose: 15000 });
      setOpenDelete(false)
    } catch (error: any) {
      console.error('Failed to operation :', error);
      if (error && error.message) {
        return toast.error(error.message, { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value });

    } else {
      setParam({ ...param, classId: undefined, sectionId: undefined });

    }
  }
  const handleSelectSection = (value: any) => {
    if (value) {
      setParam({ ...param, sectionId: value });

    } else {
      setParam({ ...param, sectionId: undefined });
    }
  }
  const handleSelectStage = (value: any) => {
    if (value) {
      setParam({ ...param, stageId: value });

    } else {
      setParam({ ...param, stageId: undefined, classId: undefined, sectionId: undefined });
    }
  }
  const handleSelectSchoolYear = (value: any) => {
    if (value) {
      setParam({ ...param, schoolYearId: value.value });

    } else {
      setParam({ ...param, schoolYearId: undefined });
    }
  }

  console.log(data);



  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("StudentEnrollmentPage.studentEnrollment")}</div>
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
              value: param?.schoolYearId
            }}
            options={SchoolYearData?.map((item) => {
              return {
                value: item.id,
                label: item.from + '-' + item.to
              };
            })}
          />
          {
            <RolePageAndActionBasedComponent
              component={(props) => {
                return (
                  <div className="inline-flex relative">
                    <button
                      className={` ${props.disabled && "hidden"
                        } flex justify-center gap-1 border-l-dark-light/35 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border  ltr:rounded-r-none rtl:rounded-l-none`}
                      onClick={() => {
                        router.push("/studentEnrollment/createOrUpdate");
                      }}>
                      {t("common.add")}
                    </button>
                    <div className="relative w-0 h-0">
                      <span className={`${selectedRecords.length > 0 ? "bg-danger" : "bg-transparent text-transparent"} badge absolute top-[-15px] z-10 left-[-70px]  p-0.5 px-1.5 rounded-full`}>
                        {selectedRecords.length > 0 ? selectedRecords.length : ''}
                      </span>
                    </div>
                    <div className="dropdown">
                      <Dropdown
                        placement={`${isRtl ? 'bottom-start' : 'bottom-end'}`}
                        btnClassName="dropdown-toggle h-full transition-all"
                        button={
                          <button
                            className={`relative h-full ltr:rounded-l-none rtl:rounded-r-none flex justify-center gap-1 items-center  border-primary/70 text-primary hover:scale-[1.01] transition-transform py-1 px-2    rounded border  `}
                          >
                            {t("common.options")}
                            <ArrowIcons className="h-4 w-4 rotate-90" />

                          </button>
                        }
                      >
                        <ul className="!min-w-[170px]">
                          <li  >
                            <button
                              disabled={selectedRecords.length == 0}
                              className={` ${selectedRecords.length > 0 ? "" : " !cursor-not-allowed hover:!bg-gray-500/20 !text-gray-500 "} flex justify-between`}
                              onClick={() => {
                                setOpen(true);
                              }}
                              type="button">
                              {t("common.update")}
                              <UpdateIcons className="h-4 w-4" />
                            </button>
                          </li>
                          <li
                            className={`${selectedRecords.length > 0 ? 'text-danger hover:bg-danger/20 hover:!text-danger' : ""}`}
                          >
                            <button
                              disabled={selectedRecords.length == 0}
                              onClick={() => {
                                setOpenDelete(true)
                              }}
                              type="button" className={`${selectedRecords.length > 0 ? "!text-danger" : " !cursor-not-allowed hover:!bg-gray-500/20 !text-gray-500 "}  flex justify-between`} >
                              {t("common.delete")}
                              <DeleteIcons className="h-4 w-4" />
                            </button>
                          </li>
                        </ul>
                      </Dropdown>
                    </div>
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
          options={StageData?.map((item) => {
            return {
              value: item.id,
              label: t(item.name as any),
            };
          }) ?? []
          }
        />
        {param?.stageId &&
          <SelectFilter
            title={t("SectionPage.ClassName")}
            placement="bottom-end"
            handleChange={handleSelectClass}
            options={StageData?.find(it => it.id == param?.stageId)?.Class?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            }) ?? []
            }
          />
        }
        {param?.classId &&
          <SelectFilter
            title={t("StudentEnrollmentPage.SectionName")}
            placement="bottom-end"
            handleChange={handleSelectSection}
            options={StageData?.find(it => it.id == param?.stageId)?.Class.find(it => it.id == param?.classId)?.Section?.map((item) => {
              return {
                value: item.id,
                label: t(item.name as any),
              };
            }) ?? []
            }
          />
        }
      </div>
      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/studentEnrollment/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data as any}
            columns={[

              {
                title: t("StudentEnrollmentPage.StudentFullName"),
                accessor: "Student.fullName",
                // sortable: true,
              },
              {
                title: t("StudentEnrollmentPage.SchoolYear"),
                accessor: "SchoolYear",
                // sortable: true,
                render: ({ SchoolYear }: any) => SchoolYear.from + " - " + SchoolYear.to,

              },
              {
                title: t("StudentEnrollmentPage.StageName"),
                accessor: "Stage.name",
                // sortable: true,
                render: ({ Stage }: any) => t(Stage.name)
              },
              {
                title: t("StudentEnrollmentPage.ClassName"),
                accessor: "Class.name",
                // sortable: true,
              },
              {
                title: t("StudentEnrollmentPage.amount"),
                accessor: "amount",
                sortable: true,
                render: ({ amount }: any) => amount && <div className="flex gap-1">
                  {amount?.toLocaleString()}
                  <span className='font-bold text-teal-500 bg-teal-500/20 w-fit justify-center items-center rounded-md flex text-xs px-1'>{t("IQD")}</span>

                </div>
              },
              {
                title: t("StudentEnrollmentPage.SectionName"),
                accessor: "Section.name",
                // sortable: true,
                render: ({ Section }: any) => t(Section.name)
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
            totalRecords={data?.totalCount}
            recordsPerPage={30}
            page={pageNumber}
            onPageChange={(p) => {
              setPageNumber(p);
            }}
            {...  {
              selectedRecords: selectedRecords,
              onSelectedRecordsChange: (records: any) => {
                setSelectedRecords(records);
              },
              // isRecordSelectable: (record: any) => record.isPaid == false

            } as any}
          />
        )}
      </div>
      <UpdateComponent
        open={open}
        setOpen={setOpen}
        data={selectedRecords.map((record: any) => record.id)}
      />
      <DeleteModel
        description={t('StudentEnrollmentPage.Are-you-sure-you-want-to-delete-this-StudentEnrollment')}
        title={t('StudentEnrollmentPage.DeleteStudentEnrollment')}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingStudentEnrollmentRemove}
        name={`${selectedRecords.length}`}
      />
    </div>
  );
};

export default withRole(TableComponent, "student_enrollment", ["read-any", "read-own"]);
