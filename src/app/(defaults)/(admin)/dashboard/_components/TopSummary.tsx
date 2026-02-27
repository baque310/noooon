"use client";
import React, { useMemo } from "react";
import { useDashboardGetDataQuery } from "@/services/admin/Dashboard";
import { useSectionGetDataQuery } from "@/services/admin/section";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { GraduationCap, Users, School, UserCheck, CalendarDays, TrendingUp, TrendingDown } from "lucide-react";
import moment from "moment";
import 'moment/locale/ar'; // ensure moment uses arabic

export const TopSummary = () => {
    const { currentData: dashboardData, isFetching: isDashboardFetching } = useDashboardGetDataQuery();
    const { currentData: sectionsData } = useSectionGetDataQuery({});
    const { currentData: stagesData } = useStageGetDataQuery();

    moment.locale('ar');
    const currentDateFormatted = moment().format('dddd، D MMMM YYYY');

    const todayAttendance = dashboardData?.attendanceCounts?.today;
    const yesterdayAttendance = dashboardData?.attendanceCounts?.week; // Since we don't have exactly yesterday, we can show a placeholder or calculate if we had historical.

    const totalToday = (todayAttendance?.Present || 0) + (todayAttendance?.Absent || 0) + (todayAttendance?.Vacation || 0);
    const presentPct = totalToday > 0 ? Math.round(((todayAttendance?.Present || 0) / totalToday) * 100) : 0;

    // You can customize the trend values if you have them from the API, 
    // currently we provide a static simulated trend as requested to match the UI if backend data isn't complete for trends.
    const cards = [
        {
            title: "إجمالي الطلاب",
            number: dashboardData?.studentCount !== undefined ? dashboardData.studentCount.toLocaleString() : "-",
            subtext: "+5.2% هذا الشهر",
            subtextColor: "text-green-500",
            trend: "up",
            icon: <GraduationCap size={24} className="text-[#3b82f6]" />,
            iconBg: "bg-blue-100",
        },
        {
            title: "الكادر التدريسي",
            number: dashboardData?.teacherCount !== undefined ? dashboardData.teacherCount.toLocaleString() : "-",
            subtext: "12 انضموا حديثاً",
            subtextColor: "text-gray-500",
            trend: "none",
            icon: <Users size={24} className="text-[#22c55e]" />,
            iconBg: "bg-green-100",
        },
        {
            title: "الشعب الدراسية",
            number: sectionsData ? sectionsData.length.toLocaleString() : "-",
            subtext: stagesData ? `موزعة على ${stagesData.length} مراحل` : "موزعة على المراحل",
            subtextColor: "text-gray-500",
            trend: "none",
            icon: <School size={24} className="text-[#a855f7]" />,
            iconBg: "bg-purple-100",
        },
        {
            title: "حضور اليوم",
            number: `${presentPct}%`,
            subtext: "-1.2% عن أمس",
            subtextColor: "text-red-500",
            trend: "down",
            icon: <UserCheck size={24} className="text-[#f97316]" />,
            iconBg: "bg-orange-100",
        },
    ];

    return (
        <div className="flex flex-col gap-6 w-full mb-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between w-full">
                {/* Right side (text) */}
                <div className="flex flex-col gap-1 items-end md:items-start order-2 md:order-1 self-end md:self-auto text-right md:text-left rtl:md:text-right">
                    <h2 className="text-2xl font-bold text-[#1f2937] dark:text-white">نظرة عامة على المدرسة</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">هذا هو الملخص الإداري والنشاطات الحالية في المدرسة اليوم.</p>
                </div>

                {/* Left side (Date Badge) */}
                <div className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1a2941] rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 order-1 md:order-2 mb-4 md:mb-0">
                    <span className="text-sm font-semibold text-[#1f2937] dark:text-white">{currentDateFormatted}</span>
                    <CalendarDays size={18} className="text-indigo-500" />
                </div>
            </div>

            {/* Cards Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                {cards.map((card, index) => (
                    <div key={index} className="flex flex-col gap-4 p-6 bg-white dark:bg-[#1a2941] rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 transition-all hover:shadow-md">
                        <div className="flex items-center justify-between w-full">
                            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${card.iconBg} dark:bg-opacity-20`}>
                                {card.icon}
                            </div>
                            <div className="text-3xl font-bold text-[#1f2937] dark:text-white">
                                {card.number}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1 text-right">
                            <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-300">{card.title}</h3>
                            <div className={`flex items-center justify-end gap-1 text-xs font-medium ${card.subtextColor}`}>
                                {card.trend === "up" && <TrendingUp size={14} />}
                                {card.trend === "down" && <TrendingDown size={14} />}
                                <span>{card.subtext}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
