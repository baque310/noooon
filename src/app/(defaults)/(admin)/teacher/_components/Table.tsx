"use client";
import React, { useState, useMemo } from "react";
import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import { getTranslation } from "@/ni18n/i18n";
import { useTeacherGetDataQuery } from "@/services/admin/teacher";
import { useRouter, useSearchParams } from "next/navigation";
import { AddIcons } from "@/components/common/icons/Actions";
import { BASE_URL } from "@/services/api";
import { Search as SearchIcon, ChevronRight, ChevronLeft, CalendarPlus } from "lucide-react";
import { DataTableSortStatus } from "mantine-datatable";
import TeacherModal from "./TeacherModal";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";
  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const [pageNumber, setPageNumber] = useState(Number(1));
  const [searchValue, setSearchValue] = useState(search);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string | undefined>();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const params = {
    skip: pageNumber,
    take: 30,
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(searchValue && { search: searchValue as string }),
  };

  const { isFetching, currentData: data } = useTeacherGetDataQuery({
    ...params,
  });

  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearchValue(value);
    if (value === "") {
      setPageNumber(1);
    }
  };

  const handleSearch = () => {
    setPageNumber(1);
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  // Helper to extract unique subjects from TeacherSubject
  const getSubjects = (teacherSubjects: any[]) => {
    if (!teacherSubjects || teacherSubjects.length === 0) return "—";
    const subjects = teacherSubjects.map((ts: any) => ts?.StageSubject?.Subject?.name).filter(Boolean);
    const uniqueSubjects = Array.from(new Set(subjects));
    return uniqueSubjects.join("، ");
  };

  return (
    <div className="p-4">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-extrabold text-gray-800 dark:text-gray-100">الكادر التدريسي</h2>
        <RolePageAndActionBasedComponent
          component={(props) => (
            <button
              onClick={() => {
                router.push("/teacher/createOrUpdate");
              }}
              className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white font-extrabold px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-sm">
              <AddIcons className="h-5 w-5" />
              إضافة معلم جديد
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
            placeholder="بحث عن معلم..."
            className="w-full rounded-2xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 ps-10 text-sm font-bold focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition shadow-sm"
          />
        </div>
      </div>

      {/* List Header - Matching Student Grid Style */}
      {/* Columns: Image | Name | Specialization (Subjects) | Phone | Status | Date */}
      <div className="hidden md:grid grid-cols-[70px_1.5fr_1.5fr_1.2fr_0.8fr_1.2fr] gap-4 px-6 py-4 bg-primary/5 dark:bg-primary/10 rounded-xl mb-4 text-primary font-extrabold text-sm text-center">
        <div>الصورة</div>
        <div>اسم المعلم</div>
        <div>التخصص</div>
        <div>رقم الهاتف</div>
        <div>الحالة</div>
        <div>تاريخ الإنشاء</div>
      </div>

      {/* Teacher Cards List */}
      <div className="flex flex-col gap-3">
        {isFetching ? (
          <div className="flex justify-center items-center py-16">
            <div className="loader !bg-primary !w-8 !h-8" />
          </div>
        ) : data?.data?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 gap-3 text-gray-400 dark:text-gray-500">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <SearchIcon className="w-8 h-8 opacity-50" />
            </div>
            <p className="font-bold text-sm">{t("common.no-data")}</p>
          </div>
        ) : (
          data?.data?.map((teacher: any) => {
            const hasPhone = teacher.phone1 || teacher.phone2;
            // From provided code we assume user is active naturally because findAll filters inactive users. 
            // We just display Active badge.
            const isActive = true;

            return (
              <div
                key={teacher.id}
                onClick={() => {
                  setSelectedTeacherId(teacher.id);
                  setIsModalOpen(true);
                }}
                className="grid grid-cols-1 md:grid-cols-[70px_1.5fr_1.5fr_1.2fr_0.8fr_1.2fr] gap-4 items-center px-6 py-4 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 cursor-pointer">
                {/* Photo */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white dark:border-gray-700 shadow-sm bg-gray-100 dark:bg-gray-700">
                    {teacher.photo && teacher.photo !== "null" && teacher.photo !== "undefined" && teacher.photo.trim() !== "" ? (
                      <img
                        src={teacher.photo.startsWith("http") ? teacher.photo : `${BASE_URL}uploads/${teacher.photo}`}
                        alt={teacher.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none";
                          (e.target as HTMLImageElement).parentElement!.innerHTML = `<div class="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-extrabold text-lg">${teacher.fullName?.charAt(0) || "?"}</div>`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary/20 text-primary font-extrabold text-lg">
                        {teacher.fullName?.charAt(0) || "?"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Name */}
                <div className="font-extrabold text-gray-800 dark:text-gray-200 text-center md:text-start">{teacher.fullName}</div>

                {/* Specialization (Subjects) */}
                <div className="font-semibold text-gray-600 dark:text-gray-400 text-sm text-center">
                  {getSubjects(teacher.TeacherSubject)}
                </div>

                {/* Phone */}
                <div className="font-mono text-gray-600 dark:text-gray-400 text-sm text-center" dir="ltr">
                  {teacher.phone1 || teacher.phone2 || "—"}
                </div>

                {/* Status */}
                <div className="text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${isActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-500" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-500"}`}>
                    نشط
                  </span>
                </div>

                {/* Created Date */}
                <div className="font-bold text-gray-500 dark:text-gray-400 text-sm text-center flex items-center justify-center gap-1">
                  <CalendarPlus className="w-3.5 h-3.5" />
                  {teacher.createdAt ? moment(teacher.createdAt).format("YYYY-MM-DD") : "—"}
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
              <div className="text-sm font-bold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-2 rounded-xl">
                عرض{" "}
                <span className="text-primary font-extrabold">
                  {startRecord}–{endRecord}
                </span>{" "}
                من أصل <span className="text-gray-700 dark:text-gray-200 font-extrabold">{data?.totalCount}</span> معلم
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
                  disabled={pageNumber === 1}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-gray-700 dark:disabled:hover:text-gray-200 transition-all duration-200">
                  <ChevronRight className="w-4 h-4" />
                  السابق
                </button>

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
                        className={`w-10 h-10 rounded-xl font-extrabold text-sm transition-all duration-200 ${pageNumber === page
                          ? "bg-primary text-white shadow-md shadow-primary/30 scale-110"
                          : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary hover:text-primary"
                          }`}>
                        {page}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setPageNumber((p) => p + 1)}
                  disabled={!data?.data || data.data.length < 30}
                  className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 font-bold text-sm shadow-sm hover:bg-primary hover:text-white hover:border-primary disabled:opacity-40 disabled:cursor-not-allowed dark:disabled:hover:hidden transition-all duration-200">
                  التالي
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })()}
      <TeacherModal open={isModalOpen} setOpen={setIsModalOpen} teacherId={selectedTeacherId} />
    </div>
  );
};

export default withRole(TableComponent, "teacher", ["read-any", "read-own"]);
