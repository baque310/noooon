"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/store/themeConfigSlice";
import { IRootState } from "@/store";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import useNotification from "@/hooks/useNotification";
import { usePlaySound } from "@/hooks/usePlaySound";
import { getTranslation } from "@/ni18n/i18n";
import {
  BellRing,
  BookCopy,
  BusFront,
  CalendarClock,
  Award,
  Lightbulb,
  GraduationCap,
  Images,
  Network,
  LayoutGrid,
  MessagesSquare,
  AlertOctagon,
  School,
  Sliders,
  Fingerprint,
  UserCheck,
  MonitorPlay,
  Gavel,
  Users,
  Backpack,
  Library,
  Flag,
  FileSignature,
  Presentation,
  Zap,
  Megaphone,
  Wallet,
} from "lucide-react";
import { useGetAdminCountQuery } from "@/services/admin/Dashboard";
import { useAdminGetDataByIdQuery } from "@/services/Manager/Admin";
import { getTitleApp } from "@/utils/getTitleApp";

import MenuItem from "./Sidebar/MenuItem";
import MenuSubItem from "./Sidebar/MenuSubItem";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
  const rtlClass = useSelector((state: IRootState) => state.themeConfig.rtlClass);

  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => (oldValue === value ? "" : value));
  };
  const session = useSession();
  const notification = useNotification();
  const playSound = usePlaySound();

  useEffect(() => {
    if (notification) playSound();
  }, [notification]);

  const isLoading = session.status === "loading";
  const isManager = session.data?.user.RoleType === "Manager";
  const { currentData: DataAdminGetDataById, isFetching: isFetchingAdminGetDataById } =
    useAdminGetDataByIdQuery({ id: String(session?.data?.user.id) });

  useEffect(() => {
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const { data: adminCountData } = useGetAdminCountQuery();
  const isRTL = rtlClass === "rtl";

  return (
    <div className={semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-4 top-4 z-[51] w-[280px] transition-all duration-300 ltr:left-4 rtl:right-4 ${semidark ? "text-white-dark" : ""
          } ${!themeConfig.sidebar ? "ltr:-left-[300px] rtl:-right-[300px]" : ""}`}
      >
        <div className="h-full overflow-hidden rounded-[2.5rem] bg-white/80 shadow-[0_20px_50px_rgba(0,0,0,0.1)] backdrop-blur-2xl border border-white/40 dark:bg-[#1a1a1a]/90 dark:border-white/10 dark:shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
          {/* Dashboard Header */}
          <div className="relative flex flex-col items-center justify-center px-6 py-8 text-center pt-10">
            <div className="absolute -top-10 -left-10 h-32 w-32 rounded-full bg-primary/20 blur-[80px]"></div>
            <div className="absolute -top-10 -right-10 h-32 w-32 rounded-full bg-secondary/20 blur-[80px]"></div>

            <div className="mb-4 relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-primary to-secondary rounded-[1.8rem] opacity-20 blur-lg group-hover:opacity-40 transition duration-500"></div>
              <div className="relative flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-primary to-secondary p-3 shadow-xl shadow-primary/40 transition-transform duration-500 group-hover:scale-110">
                <GraduationCap className="h-full w-full text-white" />
              </div>
            </div>

            <h2 className="text-xl font-black tracking-tight text-slate-800 dark:text-white">
              {getTitleApp(typeof window !== 'undefined' ? window.location.origin : '')}
            </h2>

          </div>

          <PerfectScrollbar
            className="relative h-[calc(100vh-180px)]"
            options={{ suppressScrollX: true, wheelPropagation: false }}
            style={{ direction: isRTL ? "rtl" : "ltr" }}
          >
            <div className="pb-32">
              {isLoading || isFetchingAdminGetDataById ? (
                <ul className="space-y-4 px-6 mt-4">
                  {Array.from({ length: 8 }, (_, index) => (
                    <li key={index} className="h-12 w-full rounded-2xl bg-slate-100 animate-pulse dark:bg-white/5"></li>
                  ))}
                </ul>
              ) : (
                <ul className="space-y-1 pt-2">
                  <li className="px-8 pb-3 pt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    القائمة الرئيسية
                  </li>

                  {isManager ? (
                    <>
                      <MenuItem permission={["read-any", "read-own"]} resource={"dashboard"} toggleMenu={toggleMenu} to={"/"} label={t("sidebar.dashboard")} pathname={pathname} icon={<LayoutGrid size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"admin"} toggleMenu={toggleMenu} to={"/admin"} label={t("sidebar.admins")} pathname={pathname} icon={<Fingerprint size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"school"} toggleMenu={toggleMenu} to={"/school"} label={t("sidebar.schools")} pathname={pathname} icon={<School size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"user"} toggleMenu={toggleMenu} to={"/user"} label={t("sidebar.users")} pathname={pathname} icon={<Users size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"setting"} toggleMenu={toggleMenu} to={"/setting"} label={t("sidebar.settings")} pathname={pathname} icon={<Sliders size={18} />} />
                    </>
                  ) : (
                    <>
                      <MenuItem permission={["read-any", "read-own"]} resource={"dashboard"} toggleMenu={toggleMenu} to={"/dashboard"} label={t("sidebar.dashboard")} pathname={pathname} icon={<LayoutGrid size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"admin"} toggleMenu={toggleMenu} to={"/supperAdmin"} label={t("sidebar.admin")} pathname={pathname} icon={<Fingerprint size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"school"} toggleMenu={toggleMenu} to={"/adminSchool"} label={t("sidebar.school")} pathname={pathname} icon={<School size={18} />} />
                    </>
                  )}

                  <li className="px-8 pb-3 pt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    الأكاديمي
                  </li>

                  <MenuItem permission={["read-any", "read-own"]} resource={"stage"} toggleMenu={toggleMenu} to={"/stage"} label={t("sidebar.stages")} pathname={pathname} icon={<Network size={18} />} />

                  <MenuItem permission={["read-any", "read-own"]} resource={"student"} toggleMenu={toggleMenu} to={"/student"} label={"معلومات الطلاب"} pathname={pathname} icon={<Backpack size={18} />} />

                  <MenuItem permission={["read-any", "read-own"]} resource={"teacher"} toggleMenu={toggleMenu} to={"/teacher"} label={t("sidebar.teacher")} pathname={pathname} icon={<GraduationCap size={18} />} />

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["subject", "stage_subject"]}
                    name={"subjects"}
                    currentMenu={currentMenu}
                    label={t("sidebar.subjects")}
                    pathname={pathname}
                    icon={<Library size={18} />}
                    toggleMenu={toggleMenu}
                    menuList={[
                      { label: t("sidebar.subject"), resource: "subject", permission: ["read-any", "read-own"], to: "subject" },
                      { label: t("sidebar.sub_subject"), resource: "subject", permission: ["read-any", "read-own"], to: "sub-subject" },
                      { label: t("sidebar.stageSubject"), resource: "stage_subject", permission: ["read-any", "read-own"], to: "stageSubject" },
                      { label: t("sidebar.teacherSubject"), resource: "teacher_subject", permission: ["read-any", "read-own"], to: "teacherSubject" },
                    ]}
                  />

                  <MenuItem permission={["read-any", "read-own"]} resource={"parent"} toggleMenu={toggleMenu} to={"/parent"} label={t("sidebar.parent")} pathname={pathname} icon={<Users size={18} />} />

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["installment", "discount"]}
                    name={"installments"}
                    currentMenu={currentMenu}
                    label={"إدارة الأقساط"}
                    pathname={pathname}
                    icon={<Wallet size={18} />}
                    toggleMenu={toggleMenu}
                    menuList={[
                      { label: t("sidebar.studentInstallment"), resource: "installment", permission: ["read-any", "read-own"], to: "installment" },
                      { label: t("sidebar.studentOtherPayment"), resource: "installment", permission: ["read-any", "read-own"], to: "otherPayment" },
                      { label: t("sidebar.discount"), resource: "discount", permission: ["read-any", "read-own"], to: "discount" },
                    ]}
                  />

                  <MenuItem permission={["read-any", "read-own"]} resource={"bus"} toggleMenu={toggleMenu} to={"/bus"} label={t("sidebar.bus")} pathname={pathname} icon={<BusFront size={18} />} />


                  <li className="px-8 pb-3 pt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    الأنشطة والمتابعة
                  </li>

                  <MenuItem permission={["read-any", "read-own"]} resource={"video"} toggleMenu={toggleMenu} to={"/video"} label={t("sidebar.video")} pathname={pathname} icon={<MonitorPlay size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"guidance"} toggleMenu={toggleMenu} to={"/guidance"} label={t("sidebar.guidance")} pathname={pathname} icon={<Lightbulb size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"gallery"} toggleMenu={toggleMenu} to={"/gallery"} label={t("sidebar.gallery")} pathname={pathname} icon={<Images size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"homework"} toggleMenu={toggleMenu} to={"/teacherHomeworks"} label={t("sidebar.homeworks")} pathname={pathname} number={adminCountData?.homeworkCountToday ?? 0} icon={<FileSignature size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"attendance"} toggleMenu={toggleMenu} to={"/superTeacherAttendances"} label={t("sidebar.superTeacherAttendances")} pathname={pathname} number={(adminCountData?.attendanceToday.Absent ?? 0) + (adminCountData?.attendanceToday.Present ?? 0) + (adminCountData?.attendanceToday.Vacation ?? 0)} icon={<UserCheck size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"lesson"} toggleMenu={toggleMenu} to={"/teacherLessons"} label={t("sidebar.lessons")} pathname={pathname} number={adminCountData?.lessonsCountToday ?? 0} icon={<Presentation size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"library"} toggleMenu={toggleMenu} to={"/superTeacherLibrary"} label={t("sidebar.teacher_library")} pathname={pathname} icon={<Library size={18} />} />
                  <MenuItem permission={["read-any", "read-own"]} resource={"library"} toggleMenu={toggleMenu} to={"/behaviors"} label={t("sidebar.Behaviors")} pathname={pathname} icon={<Gavel size={18} />} />

                  {isManager ? (
                    <>
                      <MenuItem permission={["read-any", "read-own"]} resource={"banner"} toggleMenu={toggleMenu} to={"/managerBanner"} label={t("sidebar.banner")} pathname={pathname} icon={<Megaphone size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"complaint"} toggleMenu={toggleMenu} to={"/complaint"} label={t("sidebar.complaint")} pathname={pathname} number={adminCountData?.complaintsCount ?? 0} icon={<AlertOctagon size={18} />} />
                    </>
                  ) : (
                    <>
                      <MenuItem permission={["read-any", "read-own"]} resource={"banner"} toggleMenu={toggleMenu} to={"/banner"} label={t("sidebar.banner")} pathname={pathname} icon={<Flag size={18} />} />
                      <MenuItem permission={["read-any", "read-own"]} resource={"complaint"} toggleMenu={toggleMenu} to={"/adminComplaint"} label={t("sidebar.complaint")} pathname={pathname} number={adminCountData?.complaintsCount ?? 0} icon={<AlertOctagon size={18} />} />
                    </>
                  )}

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["schedule", "section_schedule"]}
                    name={"schedules"}
                    currentMenu={currentMenu}
                    label={t("sidebar.schedules")}
                    pathname={pathname}
                    icon={<CalendarClock size={18} />}
                    toggleMenu={toggleMenu}
                    menuList={[
                      { label: t("sidebar.schedule"), resource: "schedule", permission: ["read-any", "read-own"], to: "schedule" },
                      { label: t("sidebar.sectionSchedule"), resource: ["section_schedule", "schedule"], permission: ["read-any", "read-own"], to: "sectionSchedule" },
                    ]}
                  />

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["exam", "exam_type", "exam_result"]}
                    name={"exam"}
                    currentMenu={currentMenu}
                    label={t("sidebar.exams")}
                    pathname={pathname}
                    icon={<Award size={18} />}
                    toggleMenu={toggleMenu}
                    menuList={[
                      { label: t("sidebar.examType"), resource: "exam_type", permission: ["read-any", "read-own"], to: "examType" },
                      { label: t("sidebar.exam"), resource: "exam", permission: ["read-any", "read-own"], to: "exams" },
                      { label: t("sidebar.examResult"), resource: "exam_result", permission: ["read-any", "read-own"], to: "examResult" },
                    ]}
                  />

                  <li className="px-8 pb-3 pt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    التواصل
                  </li>

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"chat"}
                    toggleMenu={toggleMenu}
                    to={"/chat"}
                    label={t("sidebar.chats")}
                    pathname={pathname}
                    icon={<MessagesSquare size={18} />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"notification"}
                    toggleMenu={toggleMenu}
                    to={"/notification"}
                    label={t("sidebar.notifications")}
                    pathname={pathname}
                    icon={<BellRing size={18} />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"notification"}
                    toggleMenu={toggleMenu}
                    to={"/alerts"}
                    label={t("sidebar.alerts")}
                    pathname={pathname}
                    icon={<Zap size={18} />}
                  />

                  <li className="px-8 pb-3 pt-6 text-[11px] font-black uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300">
                    الأجهزة
                  </li>

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"attendance"}
                    toggleMenu={toggleMenu}
                    to={"/fingerprint"}
                    label={"نظام البصمة"}
                    pathname={pathname}
                    icon={<Fingerprint size={18} />}
                  />
                </ul>
              )}
            </div>
          </PerfectScrollbar>

          {/* Footer Branding */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent p-6 dark:from-[#1a1a1a] dark:via-[#1a1a1a]">
            <p className="text-center text-[10px] font-medium text-slate-400 dark:text-slate-500">
              © {new Date().getFullYear()} Noon Iraq System <br />

            </p>
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
