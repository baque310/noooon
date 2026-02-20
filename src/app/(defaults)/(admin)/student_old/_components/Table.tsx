"use client";
import React, { useState } from "react";
import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useStudentGetDataQuery } from "@/services/admin/student";
import { useRouter, useSearchParams } from "next/navigation";
import { AddIcons } from "@/components/common/icons/Actions";
import { exportJsonToExcel } from "@/utils/excelParser";
import StudentModal from "./StudentModal";
import { BASE_URL } from "@/services/api";
import { CalendarPlus, Search as SearchIcon, ChevronRight, ChevronLeft } from "lucide-react";
import { DataTableSortStatus } from "mantine-datatable";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const { isMounted } = useMounted();

  const [pageNumber, setPageNumber] = useState(Number(1));
  const [selectedStudentId, setSelectedStudentId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching, currentData: data } = useStudentGetDataQuery({
    ...params,
  });

  const [searchValue, setSearchValue] = useState(search);
  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value == "") {
      handleSearch(value);
    }
  };
  const allParams = new URLSearchParams(searchParams);
  const handleSearch = (value?: string) => {
    if (search != searchValue) {
      allParams.set("search", value ?? searchValue);
      router.push(`/student?${allParams.toString()}`);
      setPageNumber(1);
    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Helper to get enrollment info
  const getEnrollmentInfo = (student: any) => {
    const enrollment = student?.StudentEnrollment?.[0];
    return {
      stage: enrollment?.Stage?.name,
      class: enrollment?.Class?.name,
      section: enrollment?.Section?.name,
    };
  };

  return (
    <div className="p-4">
      {/* Header Section - Matching index.html style */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">قائمة الطلاب الكلية</h2>
        <RolePageAndActionBasedComponent
          component={(props) => (
            <button
              onClick={() => {
                setSelectedStudentId(undefined);
                setIsModalOpen(true);
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm">
              <AddIcons className="h-5 w-5" />
              إضافة طالب جديد
            </button>
          )}
          resource="admin"
          permission={["create-any", "create-own"]}
        />
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <SearchIcon className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={handleChange}
            onKeyDown={handleKeyPress}
            placeholder="بحث عن طالب..."
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 ps-10 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition shadow-sm"
          />
        </div>
      </div>

      {/* List Header - Matching index.html grid style */}
      <div className="hidden md:grid grid-cols-[70px_1.5fr_1fr_0.8fr_0.8fr_1.5fr_1.2fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm text-center">
        <div>الصورة</div>
        <div>اسم الطالب</div>
        <div>كود الطالب</div>
        <div>المرحلة</div>
        <div>الصف</div>
        <div>اسم ولي الأمر</div>
        <div>تاريخ الإنشاء</div>
      </div>

      {/* Student Cards List */}
      <div className="flex flex-col gap-3">
        {isFetching ? (
          <div className="flex justify-center items-center py-16">
            <div className="loader !bg-primary !w-8 !h-8" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
            </div>
            <p className="font-bold text-sm">{t("common.no-data")}</p>
          </div>
        ) : (
          data?.data?.map((student: any) => {
            const enrollment = getEnrollmentInfo(student);
            const hasGuardian = student?.Parent?.fullName;

            return (
              <div
                key={student.id}
                onClick={() => {
                  setSelectedStudentId(student.id);
                  setIsModalOpen(true);
                }}
                className="grid grid-cols-1 md:grid-cols-[70px_1.5fr_1fr_0.8fr_0.8fr_1.5fr_1.2fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl border-r-4 border-primary shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                {/* Photo */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-700">
                    <img
                      src={student.photo ? `${BASE_URL}uploads/${student.photo}` : `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.User?.username || student.id}`}
                      alt={student.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>

                {/* Name */}
                <div className="font-extrabold text-gray-800 dark:text-gray-200 text-center md:text-start">{student.fullName}</div>

                {/* Code */}
                <div className="font-mono text-gray-500 dark:text-gray-400 text-sm text-center">{student.User?.username || "—"}</div>

                {/* Stage */}
                <div className="text-center">
                  <span className={`font-bold text-sm ${enrollment.stage ? "text-gray-700 dark:text-gray-300" : "text-red-500"}`}>
                    {enrollment.stage ? t(enrollment.stage) : "غير مسجل"}
                  </span>
                </div>

                {/* Class/Section */}
                <div className="font-semibold text-gray-600 dark:text-gray-400 text-sm text-center">
                  {enrollment.class ? `${t(enrollment.class)} / ${enrollment.section || ""}` : "—"}
                </div>

                {/* Guardian */}
                <div className="text-center">
                  {hasGuardian ? (
                    <span className="inline-block bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-3 py-1.5 rounded-xl text-xs font-extrabold">
                      {student.Parent?.fullName}
                    </span>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Handle link guardian action
                        setSelectedStudentId(student.id);
                        setIsModalOpen(true);
                      }}
                      className="inline-block bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/50 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-colors border border-red-200 dark:border-red-800">
                      ربط الطالب مع ولي الأمر
                    </button>
                  )}
                </div>

                {/* Created Date */}
                <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center flex items-center justify-center gap-1">
                  <CalendarPlus className="w-3.5 h-3.5" />
                  {student.createdAt ? moment(student.createdAt).format("YYYY-MM-DD") : "—"}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {(data?.totalCount ?? 0) > 30 &&
        (() => {
          const totalPages = Math.ceil((data?.totalCount ?? 0) / 30);
          const startRecord = (pageNumber - 1) * 30 + 1;
          const endRecord = Math.min(pageNumber * 30, data?.totalCount ?? 0);
          return (
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
              {/* Record counter */}
              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl">
                عرض{" "}
                <span className="text-primary font-extrabold">
                  {startRecord}–{endRecord}
                </span>{" "}
                من أصل <span className="text-gray-700 dark:text-gray-200 font-extrabold">{data?.totalCount}</span> طالب
              </div>

              {/* Page controls */}
              <div className="flex items-center gap-2">
                {/* Prev */}
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-200 transition-all duration-200">
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

                {/* Page pills */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (pageNumber <= 3) {
                      page = i + 1;
                    } else if (pageNumber >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = pageNumber - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setPageNumber(page)}
                        className={`w-10 h-10 rounded-xl font-extrabold text-sm transition-all duration-200 ${
                          pageNumber === page
                            ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                            : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
                        }`}>
                        {page}
                      </button>
                    );
                  })}
                </div>

                {/* Next */}
                <button
                  onClick={() => setPageNumber((p) => p + 1)}
                  disabled={!data?.data || data.data.length < 30}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 disabled:hover:border-gray-200 dark:disabled:hover:bg-gray-800 dark:disabled:hover:text-gray-200 transition-all duration-200">
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}

      {/* Export Button - Floating */}
      <div className="fixed bottom-6 left-6 z-50">
        <button
          onClick={() => {
            exportJsonToExcel({
              data:
                data?.data.map((item: any) => {
                  const enrollment = getEnrollmentInfo(item);
                  return {
                    fullName: item.fullName,
                    username: item.User?.username,
                    parent: item.Parent?.fullName,
                    stage: enrollment.stage,
                    class: enrollment.class,
                    section: enrollment.section,
                    gender: item.gender,
                    birth: item.birth,
                    phone1: item.phone1,
                    createdAt: item.createdAt,
                  };
                }) ?? [],
              fileName: "students",
              sheetName: "Students",
            });
          }}
          disabled={!data?.data || data.data.length === 0 || isFetching}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold px-5 py-3 rounded-2xl shadow-lg hover:shadow-xl disabled:cursor-not-allowed transition-all duration-200">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          تصدير Excel
        </button>
      </div>

      {/* Student Modal */}
      <StudentModal
        open={isModalOpen}
        setOpen={setIsModalOpen}
        studentId={selectedStudentId}
        onSuccess={() => {
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default withRole(TableComponent, "student", ["read-any", "read-own"]);
