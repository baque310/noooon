"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import { toggleSidebar } from "@/store/themeConfigSlice";
import { IRootState } from "@/store";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { MenuItem } from "../common/Menu/MenuItem";
import { useSession } from "next-auth/react";
import useNotification from "@/hooks/useNotification";
import { usePlaySound } from "@/hooks/usePlaySound";
import { getTranslation } from "@/ni18n/i18n";
import {
  Bell,
  BookCopy,
  BookOpenText,
  Bus,
  CalendarDays,
  ChevronDown,
  ClipboardList,
  Compass,
  GraduationCap,
  Image,
  Layers,
  LayoutDashboard,
  MessageCircle,
  NotebookPen,
  School,
  Settings,
  ShieldCheck,
  UserRoundCheck,
  Video,
  BookText,
} from "lucide-react";
import { useGetAdminCountQuery } from "@/services/admin/Dashboard";
import MenuSubItem from "../common/Menu/MenuSubitems";
import { useAdminGetDataByIdQuery } from "@/services/Manager/Admin";
import { getTitleApp } from "@/utils/getTitleApp";

const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
  const rtlClass = useSelector((state: IRootState) => state.themeConfig.rtlClass);

  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? "" : value;
    });
  };
  const session = useSession();

  const notification = useNotification();
  const playSound = usePlaySound();

  useEffect(() => {
    if (notification) {
      playSound();
    }
  }, [notification]);

  const isLoading = session.status == "loading";

  const isManager = session.data?.user.RoleType == "Manager";
  // ||
  // session.data?.user.RoleType == "Admin";

  const { currentData: DataAdminGetDataById, isFetching: isFetchingAdminGetDataById } = useAdminGetDataByIdQuery({ id: String(session?.data?.user.id) });

  useEffect(() => {
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    if (selector) {
      selector.classList.add("active");
      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any = ul.closest("li.menu").querySelectorAll(".nav-link") || [];
        if (ele.length) {
          ele = ele[0];
          setTimeout(() => {
            ele.click();
          });
        }
      }
    }
  }, []);

  useEffect(() => {
    setActiveRoute();
    if (window.innerWidth < 1024 && themeConfig.sidebar) {
      dispatch(toggleSidebar());
    }
  }, [pathname]);

  const setActiveRoute = () => {
    let allLinks = document.querySelectorAll(".sidebar ul a.active");
    for (let i = 0; i < allLinks.length; i++) {
      const element = allLinks[i];
      element?.classList.remove("active");
    }
    const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
    selector?.classList.add("active");
  };

  const { data: adminCountData } = useGetAdminCountQuery();

  // Determine if RTL based on rtlClass
  const isRTL = rtlClass === "rtl";

  return (
    <div className={semidark ? "dark" : ""}>
      <nav className={`sidebar fixed bottom-0 top-0 z-50 h-[100vh] w-[280px] transition-all duration-300 ltr:left-4 rtl:right-4 ${semidark ? "text-white-dark" : ""}`}>
        <div className={`h-full bg-white dark:bg-[#1a1a1a] `}>
          <div className="flex items-center justify-between px-4 py-3">
            <div className="main-logo flex shrink-0 items-center">
              {/* <img className="ml-[5px] w-10 h-10 rounded-full flex-none" src="/favicon.png" alt="logo" /> */}
              <span className="align-middle text-lg font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">{getTitleApp(window.location.origin)}</span>
            </div>
            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
              onClick={() => dispatch(toggleSidebar())}>
              <ChevronDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar
            className="relative h-[calc(100vh-80px)]"
            options={{
              suppressScrollX: true,
              wheelPropagation: false,
            }}
            style={{
              direction: isRTL ? "rtl" : "ltr",
            }}>
            <div style={{ direction: isRTL ? "rtl" : "ltr" }}>
              {isLoading || isFetchingAdminGetDataById ? (
                <ul className="relative space-y-1.5 mt-4 p-4 py-0 font-semibold">
                  {Array.from({ length: 15 }, (_, index) => (
                    <li key={index} className="bg-white/50 h-9 w-full rounded-lg animate-pulse"></li>
                  ))}
                </ul>
              ) : (
                <ul className="relative space-y-0.5 mt-4 py-0 font-semibold">
                  {isManager && (
                    <>
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"dashboard"}
                        toggleMenu={toggleMenu}
                        to={"/"}
                        label={t("sidebar.dashboard")}
                        icon={<LayoutDashboard className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"admin"}
                        toggleMenu={toggleMenu}
                        to={"/admin"}
                        label={t("sidebar.admins")}
                        icon={<ShieldCheck className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />

                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"school"}
                        toggleMenu={toggleMenu}
                        to={"/school"}
                        label={t("sidebar.schools")}
                        icon={<School className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />

                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"banner"}
                        toggleMenu={toggleMenu}
                        to={"/managerBanner"}
                        label={t("sidebar.banner")}
                        icon={<Image className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />

                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"user"}
                        toggleMenu={toggleMenu}
                        to={"/user"}
                        label={t("sidebar.users")}
                        icon={<GraduationCap className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"complaint"}
                        toggleMenu={toggleMenu}
                        to={"/complaint"}
                        label={t("sidebar.complaint")}
                        number={adminCountData?.complaintsCount ?? 0}
                        icon={<NotebookPen className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"setting"}
                        toggleMenu={toggleMenu}
                        to={"/setting"}
                        label={t("sidebar.settings")}
                        icon={<Settings className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                    </>
                  )}
                  {!isManager && (
                    <>
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"dashboard"}
                        toggleMenu={toggleMenu}
                        to={"/dashboard"}
                        label={t("sidebar.dashboard")}
                        icon={<LayoutDashboard className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"admin"}
                        toggleMenu={toggleMenu}
                        to={"/supperAdmin"}
                        label={t("sidebar.admin")}
                        icon={<ShieldCheck className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"school"}
                        toggleMenu={toggleMenu}
                        to={"/adminSchool"}
                        label={t("sidebar.school")}
                        icon={<School className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />

                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"complaint"}
                        toggleMenu={toggleMenu}
                        to={"/adminComplaint"}
                        label={t("sidebar.complaint")}
                        number={adminCountData?.complaintsCount ?? 0}
                        icon={<NotebookPen className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                    </>
                  )}

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["stage", "class", "section"]}
                    name={"stages"}
                    currentMenu={currentMenu}
                    label={t("sidebar.stages")}
                    icon={<Layers className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    menuList={[
                      {
                        number: 0,
                        label: t("sidebar.stage"),
                        resource: "stage",
                        permission: ["read-any", "read-own"],
                        to: "stage",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.class"),
                        resource: "class",
                        permission: ["read-any", "read-own"],
                        to: "class",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.section"),
                        resource: "section",
                        permission: ["read-any", "read-own"],
                        to: "section",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                    ]}
                    toggleMenu={toggleMenu}
                    setCurrentMenu={setCurrentMenu}
                  />
                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["student", "student_enrollment"]}
                    name={"students"}
                    currentMenu={currentMenu}
                    label={t("sidebar.students")}
                    icon={<GraduationCap className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    menuList={[
                      {
                        number: 0,
                        label: t("sidebar.student"),
                        resource: "student",
                        permission: ["read-any", "read-own"],
                        to: "student",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.studentEnrollment"),
                        resource: "student_enrollment",
                        permission: ["read-any", "read-own"],
                        to: "studentEnrollment",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.studentInstallment"),
                        resource: "installment",
                        permission: ["read-any", "read-own"],
                        to: "installment",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.studentOtherPayment"),
                        resource: "installment",
                        permission: ["read-any", "read-own"],
                        to: "otherPayment",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.discount"),
                        resource: "discount",
                        permission: ["read-any", "read-own"],
                        to: "discount",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                    ]}
                    toggleMenu={toggleMenu}
                    setCurrentMenu={setCurrentMenu}
                  />

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"teacher"}
                    toggleMenu={toggleMenu}
                    to={"/teacher"}
                    label={t("sidebar.teacher")}
                    icon={<UserRoundCheck className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["subject", "stage_subject", "stage_subject"]}
                    name={"subjects"}
                    currentMenu={currentMenu}
                    label={t("sidebar.subjects")}
                    icon={<BookCopy className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    menuList={[
                      {
                        number: 0,
                        label: t("sidebar.subject"),
                        resource: "subject",
                        permission: ["read-any", "read-own"],
                        to: "subject",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.sub_subject"),
                        resource: "subject",
                        permission: ["read-any", "read-own"],
                        to: "sub-subject",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.stageSubject"),
                        resource: "stage_subject",
                        permission: ["read-any", "read-own"],
                        to: "stageSubject",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.teacherSubject"),
                        resource: "teacher_subject",
                        permission: ["read-any", "read-own"],
                        to: "teacherSubject",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                    ]}
                    toggleMenu={toggleMenu}
                    setCurrentMenu={setCurrentMenu}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"parent"}
                    toggleMenu={toggleMenu}
                    to={"/parent"}
                    label={t("sidebar.parent")}
                    icon={<UserRoundCheck className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"bus"}
                    toggleMenu={toggleMenu}
                    to={"/bus"}
                    label={t("sidebar.bus")}
                    icon={<Bus className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  {!isManager && (
                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"banner"}
                      toggleMenu={toggleMenu}
                      to={"/banner"}
                      label={t("sidebar.banner")}
                      icon={<Image className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    />
                  )}

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"video"}
                    toggleMenu={toggleMenu}
                    to={"/video"}
                    label={t("sidebar.video")}
                    icon={<Video className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"guidance"}
                    toggleMenu={toggleMenu}
                    to={"/guidance"}
                    label={t("sidebar.guidance")}
                    icon={<Compass className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"gallery"}
                    toggleMenu={toggleMenu}
                    to={"/gallery"}
                    label={t("sidebar.gallery")}
                    icon={<Image className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"homework"}
                    toggleMenu={toggleMenu}
                    to={"/teacherHomeworks"}
                    label={t("sidebar.homeworks")}
                    number={adminCountData?.homeworkCountToday ?? 0}
                    icon={<NotebookPen className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"attendance"}
                    toggleMenu={toggleMenu}
                    to={"/superTeacherAttendances"}
                    label={t("sidebar.superTeacherAttendances")}
                    number={(adminCountData?.attendanceToday.Absent ?? 0) + (adminCountData?.attendanceToday.Present ?? 0) + (adminCountData?.attendanceToday.Vacation ?? 0)}
                    icon={<CalendarDays className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"lesson"}
                    toggleMenu={toggleMenu}
                    to={"/teacherLessons"}
                    label={t("sidebar.lessons")}
                    number={adminCountData?.lessonsCountToday ?? 0}
                    icon={<BookOpenText className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"library"}
                    toggleMenu={toggleMenu}
                    to={"/superTeacherLibrary"}
                    label={t("sidebar.teacher_library")}
                    number={adminCountData?.lessonsCountToday ?? 0}
                    icon={<BookText className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                  />

                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["schedule", "section_schedule"]}
                    name={"schedules"}
                    currentMenu={currentMenu}
                    label={t("sidebar.schedules")}
                    icon={<CalendarDays className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    menuList={[
                      {
                        number: 0,
                        label: t("sidebar.schedule"),
                        resource: "schedule",
                        permission: ["read-any", "read-own"],
                        to: "schedule",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.sectionSchedule"),
                        resource: ["section_schedule", "schedule"],
                        permission: ["read-any", "read-own"],
                        to: "sectionSchedule",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                    ]}
                    toggleMenu={toggleMenu}
                    setCurrentMenu={setCurrentMenu}
                  />
                  <MenuSubItem
                    permission={["read-any", "read-own"]}
                    resource={["exam", "exam_type", "exam_result"]}
                    name={"exam"}
                    currentMenu={currentMenu}
                    label={t("sidebar.exams")}
                    icon={<ClipboardList className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                    menuList={[
                      {
                        number: 0,
                        label: t("sidebar.examType"),
                        resource: "exam_type",
                        permission: ["read-any", "read-own"],
                        to: "examType",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.exam"),
                        resource: "exam",
                        permission: ["read-any", "read-own"],
                        to: "exams",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                      {
                        number: 0,
                        label: t("sidebar.examResult"),
                        resource: "exam_result",
                        permission: ["read-any", "read-own"],
                        to: "examResult",
                        isNoSub: true,
                        // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                      },
                    ]}
                    toggleMenu={toggleMenu}
                    setCurrentMenu={setCurrentMenu}
                  />
                  {!isManager && (
                    <>
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"chat"}
                        toggleMenu={toggleMenu}
                        to={"/chat"}
                        label={t("sidebar.chats")}
                        icon={<MessageCircle className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"notification"}
                        toggleMenu={toggleMenu}
                        to={"/notification"}
                        label={t("sidebar.notifications")}
                        icon={<Bell className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                      <MenuItem
                        permission={["read-any", "read-own"]}
                        resource={"notification"}
                        toggleMenu={toggleMenu}
                        to={"/alerts"}
                        label={t("sidebar.alerts")}
                        icon={<Bell className="shrink-0 group-hover:!text-primary group-active:!text-white" />}
                      />
                    </>
                  )}
                </ul>
              )}
            </div>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
