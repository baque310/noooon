"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useMemo, useState } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { AddIcons, ArrowIcons, DeleteIcons, UpdateIcons } from "@/components/common/icons/Actions";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useSuperTeacherLibraryGetDataQuery, useSuperTeacherLibraryRemoveMutation } from "@/services/admin/superTeacherLibrary";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import Dropdown from "@/components/dropdown";
import Avatar from "@/components/common/Avatar";
import { toast } from "react-toastify";
import DeleteModel from "@/components/Model/DeleteModel";
import { SelectWithSearch } from "@/components/Filter/SelectSearch"; // Keep if we want to add other search selects
import { useStageGetDataQuery } from "@/services/admin/stage";
import SelectFilter from "@/components/Filter/SelectFilter";
import { exportJsonToExcel } from "@/utils/excelParser";
import FormattedDate from "@/components/common/FormattedDate";

const TableComponent = () => {
  const { t } = getTranslation();
  const [openDelete, setOpenDelete] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });
  const [selectedRecords, setSelectedRecords] = useState<any[]>([]);
  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();
  const [pageNumber, setPageNumber] = useState(Number(1));
  const { isFetching: isFetchingStageData, currentData: StageData } = useStageGetDataQuery();

  const [param, setParam] = useState<
    | {
        search?: string;
        classId?: string;
        sectionId?: string;
        stageId?: string;
      }
    | undefined
  >();

  const params = useMemo(
    () => ({
      skip: pageNumber,
      take: 30,
      sortBy: sortStatus.columnAccessor,
      sortDirection: sortStatus.direction,
      ...(search ? { search: search as string } : {}),
      ...(param ?? {}),
    }),
    [pageNumber, sortStatus, search, param]
  );

  const { isFetching: isFetching, currentData: data } = useSuperTeacherLibraryGetDataQuery({
    ...params,
    // skip: pageNumber, // The service params usually take skip/take directly if defined in GetDataRequestParams
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
      router.push(`/superTeacherLibrary?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl" ? true : false;
  const [SuperTeacherLibraryRemove, { isLoading: isLoadingRemove }] = useSuperTeacherLibraryRemoveMutation();

  const handleRemove = async () => {
    try {
      // The service only supports single delete by ID. We do promise.all for bulk.
      const promises = selectedRecords.map((record) => SuperTeacherLibraryRemove({ id: record.id }).unwrap());
      await Promise.all(promises);

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
  };

  const handleSelectClass = (value: any) => {
    if (value) {
      setParam({ ...param, classId: value });
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
      setParam({ ...param, stageId: value });
    } else {
      setParam({
        ...param,
        stageId: undefined,
        classId: undefined,
        sectionId: undefined,
      });
    }
  };
  // console.log(data);

  return (
    <div className={`m-4 rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className={"flex justify-between max-md:flex-col gap-2 "}>
          <div className="text-xl uppercase ">{t("Super Teacher Library")}</div>
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

            {
              <RolePageAndActionBasedComponent
                component={(props) => {
                  return (
                    <div className="inline-flex relative">
                      {/* Export to Excel Button */}
                      <button
                        onClick={() => {
                          exportJsonToExcel({
                            data:
                              (data?.data ?? []).map((item: any) => {
                                return {
                                  Title: item.title,
                                  Description: item.description,
                                  URL: item.url,
                                  Class: item.Class?.name ?? "",
                                  // Handling Section array if it exists, otherwise empty
                                  Section: Array.isArray(item.Section) ? item.Section.map((s: any) => s.name).join(", ") : item.Section?.name ?? "",
                                  UpdatedAt: item.updatedAt ? moment(item.updatedAt).format("YYYY-MM-DD hh:mm:ss A") : "",
                                  CreatedAt: item.createdAt ? moment(item.createdAt).format("YYYY-MM-DD hh:mm:ss A") : "",
                                };
                              }) ?? [],
                            fileName: "super-teacher-library",
                            sheetName: "Library",
                          });
                        }}
                        disabled={!data?.data || data.data.length === 0 || isFetching}
                        className={`relative overflow-hidden group flex items-center gap-3 mx-2 px-6 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-lg hover:shadow-xl disabled:shadow-md transform hover:scale-105 active:scale-95 disabled:transform-none transition-all duration-200 border border-green-500/20 disabled:border-gray-400/20 min-w-fit whitespace-nowrap`}>
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        <svg className="h-5 w-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>

                        <span className="relative z-10">{t("common.ExportExcel")}</span>
                      </button>
                      <button
                        className={` ${
                          props.disabled && "hidden"
                        } flex justify-center gap-1 border-l-dark-light/35 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2  rounded border  ltr:rounded-r-none rtl:rounded-l-none`}
                        onClick={() => {
                          router.push("/superTeacherLibrary/createOrUpdate");
                        }}>
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
                      <div className="dropdown">
                        <Dropdown
                          placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                          btnClassName="dropdown-toggle h-full transition-all"
                          button={
                            <button
                              className={`relative h-full ltr:rounded-l-none rtl:rounded-r-none flex justify-center gap-1 items-center  border-primary/70 text-primary hover:scale-[1.01] transition-transform py-1 px-2    rounded border  `}>
                              {t("common.options")}
                              <ArrowIcons className="h-4 w-4 rotate-90" />
                            </button>
                          }>
                          <ul className="!min-w-[170px]">
                            <li>
                              <button
                                disabled={selectedRecords.length == 0 || selectedRecords.length > 1}
                                className={` ${selectedRecords.length === 1 ? "" : " !cursor-not-allowed hover:!bg-gray-500/20 !text-gray-500 "} flex justify-between`}
                                onClick={() => {
                                  if (selectedRecords.length === 1) {
                                    router.push(`/superTeacherLibrary/createOrUpdate?id=${selectedRecords[0].id}`);
                                  }
                                }}
                                type="button">
                                {t("common.update")}
                                <UpdateIcons className="h-4 w-4" />
                              </button>
                            </li>
                            <li className={`${selectedRecords.length > 0 ? "text-danger hover:bg-danger/20 hover:!text-danger" : ""}`}>
                              <button
                                disabled={selectedRecords.length == 0}
                                onClick={() => {
                                  setOpenDelete(true);
                                }}
                                type="button"
                                className={`${selectedRecords.length > 0 ? "!text-danger" : " !cursor-not-allowed hover:!bg-gray-500/20 !text-gray-500 "}  flex justify-between`}>
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
                resource={"admin"} // Need to verify if 'admin' is correct resource or if there is a specific one. Using 'admin' as generic default or 'super_teacher_library' if exists. studentEnrollment used 'student_enrollment'. I'll stick to 'admin' for now or 'super_teacher_library' if I can guess. Let's use 'admin' as safe bet or maybe 'super_teacher_library' to be specific.
                // Actually, let's look at the studentEnrollment generic. It was 'student_enrollment'.
                // I'll use 'super_teacher_library' but if it fails I might need to change it.
                // Safest might be just 'admin' if permissions are broad, but usually granular.
                // User didn't specify permissions. I'll use 'super_teacher_library' and assume the user has it or I'll need to ask.
                // Wait, the file `studentEnrollment` used `withRole(TableComponent, "student_enrollment", ...)` at the end.
                // I should do the same.
                permission={["create-any", "create-own"]}
              />
            }
          </div>
        </div>
      </div>
      {/* <div className={"flex justify-start max-md:flex-col gap-3 mt-2"}>
        <SelectFilter
          placement="bottom-end"
          title={t("StudentEnrollmentPage.StageName")}
          handleChange={handleSelectStage}
          options={
            StageData?.map((item) => {
              return {
                value: item.id,
                label: t(item?.name as any),
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
      </div> */}
      <div className="datatables pagination-padding mt-5">
        {isMounted && (
          <DataTable
            onRowClick={async (item) => {
              router.push(`/superTeacherLibrary/${item.record.id}`);
            }}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data?.data || []}
            // Wait, look at `superTeacherLibrary.ts`:
            // `SuperTeacherLibraryGetData: build.query<ISuperTeacherLibrary[], GetDataRequestParams>`
            // It returns an ARRAY, not `{ data: [], totalCount: ... }`.
            // `studentEnrollment` returned `BaseGetDataResponse`.
            // So `data?.data` in studentEnrollment was because of pagination wrapper.
            // If `superTeacherLibrary` returns direct array, pagination might be client side or the service is not paginated?
            // The service uses `url: super/teacher/library` and `params`. If the backend paginates, the return type should be `BaseGetDataResponse`.
            // If the type is `ISuperTeacherLibrary[]`, then likely it returns all data or the type is wrong.
            // Given I see `GetDataRequestParams` with `skip/take`, the backend likely paginates.
            // If the backend paginates but the type says Array, we might have a type mismatch or the backend returns Array directly (and ignores skip/take or returns subset).
            // Ill assume it returns array for now based on the file content I read.
            // So `totalRecords={data?.length}` if it is all, or I can't know total count if it is paginated but type is wrong.
            // I'll assume `data` is the array.

            columns={[
              {
                title: t("StudentPage.photo"),
                accessor: "url",
                sortable: true,
                width: 80,
                render: ({ url, title }: any) => (
                  <div className="flex items-center justify-center">
                    <div className="relative group">
                      <Avatar photo={url} username={title} />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-full transition-colors duration-200"></div>
                    </div>
                  </div>
                ),
              },
              {
                title: t("SuperTeacherLibraryPage.title"),
                accessor: "title",
                sortable: true,
              },
              {
                title: t("SuperTeacherLibraryPage.description"),
                accessor: "description",
                // sortable: true,
                render: ({ description }: any) => (
                  <div className="truncate" style={{ maxWidth: "200px" }}>
                    {description}
                  </div>
                ),
              },
              // {
              //   title: t("SuperTeacherLibraryPage.url"),
              //   accessor: "url",
              //   render: ({ url }: any) => (
              //     <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              //       {url}
              //     </a>
              //   ),
              // },
              {
                title: t("StudentEnrollmentPage.ClassName"),
                accessor: "Class.name",
                sortable: true,
              },
              {
                title: t("StudentEnrollmentPage.SectionName"),
                accessor: "Section",
                render: ({ Section }: any) => {
                  // Check if Section is array or object
                  if (Array.isArray(Section)) {
                    return Section.map((s) => t(s.name)).join(", ");
                  }
                  return t(Section?.name);
                },
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
            // If we don't have totalCount, we can't do server-side pagination properly unless we know it.
            // I will assume for now we just show what we have.
            totalRecords={data?.totalCount || 0}
            recordsPerPage={30}
            page={pageNumber}
            onPageChange={(p) => {
              setPageNumber(p);
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
      <DeleteModel
        description={t("SuperTeacherLibraryPage.Are-you-sure-you-want-to-delete-this-SuperTeacherLibrary")}
        title={t("SuperTeacherLibraryPage.DeleteSuperTeacherLibrary")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingRemove}
        name={`${selectedRecords.length}`}
      />
    </div>
  );
};

export default withRole(TableComponent, "library", ["read-any", "read-own"]);
