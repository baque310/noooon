"use client";
import PerfectScrollbar from "react-perfect-scrollbar";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { toggleSidebar } from "@/store/themeConfigSlice";
import { IRootState } from "@/store";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import IconCaretsDown from "../common/icons/sidebar/icon-carets-down";
import { MenuItem } from "../common/Menu/MenuItem";
import { useSession } from "next-auth/react";
import useNotification from "@/hooks/useNotification";
import { usePlaySound } from "@/hooks/usePlaySound";
import { getTranslation } from "@/ni18n/i18n";
import IconManagerAdmin from "../common/icons/sidebar/IconManagerAdmin";
import MenuSubItem from "../common/Menu/MenuSubitems";
import { useAdminGetDataByIdQuery } from "@/services/Manager/Admin";


const Sidebar = () => {
  const dispatch = useDispatch();
  const { t } = getTranslation();
  const pathname = usePathname();
  const [currentMenu, setCurrentMenu] = useState<string>("");
  const [errorSubMenu, setErrorSubMenu] = useState(false);
  const themeConfig = useSelector((state: IRootState) => state.themeConfig);
  const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
  const toggleMenu = (value: string) => {
    setCurrentMenu((oldValue) => {
      return oldValue === value ? "" : value;
    });
  };
  const session = useSession();

  const notification = useNotification();
  const playSound = usePlaySound();
  const isLoading = session.status == "loading"

  const isManager = session.data?.user.RoleType == "Manager"


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




  return (
    <div className={!semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? "text-white-dark" : ""
          }`}>
        <div className={`h-full bg-white dark:bg-black ${!semidark && "bg-[#28243d]"} `}>
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="main-logo flex shrink-0 items-center">

              {/* <img className="ml-[5px] w-10 h-10 rounded-full flex-none" src="/favicon.png" alt="logo" /> */}
              <span className="align-middle text-lg font-semibold ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light lg:inline">{t("appName")}</span>
            </Link>
            <button
              type="button"
              className="collapse-icon flex h-8 w-8 items-center rounded-full transition duration-300 hover:bg-gray-500/10 rtl:rotate-180 dark:text-white-light dark:hover:bg-dark-light/10"
              onClick={() => dispatch(toggleSidebar())}>
              <IconCaretsDown className="m-auto rotate-90" />
            </button>
          </div>
          <PerfectScrollbar className="relative h-[calc(100vh-80px)]">
            {isLoading || isFetchingAdminGetDataById ?
              <ul className="relative space-y-1.5 mt-4 p-4 py-0 font-semibold">
                {
                  Array.from({ length: 15 }, (_, index) => (
                    <li key={index} className="bg-white/50 h-9 w-full rounded-lg animate-pulse"></li>
                  ))
                }
              </ul> :
              <ul className="relative space-y-0.5 mt-4 p-4 py-0 font-semibold">

                {isManager &&
                  <>


                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"dashboard"}
                      toggleMenu={toggleMenu}
                      to={"/"}
                      label={t("sidebar.dashboard")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />
                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"admin"}
                      toggleMenu={toggleMenu}
                      to={"/admin"}
                      label={t("sidebar.admins")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />

                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"school"}
                      toggleMenu={toggleMenu}
                      to={"/school"}
                      label={t("sidebar.schools")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />

                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"banner"}
                      toggleMenu={toggleMenu}
                      to={"/managerBanner"}
                      label={t("sidebar.banner")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />
                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"user"}
                      toggleMenu={toggleMenu}
                      to={"/user"}
                      label={t("sidebar.users")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />
                    <MenuItem
                      permission={["read-any", "read-own"]}
                      resource={"setting"}
                      toggleMenu={toggleMenu}
                      to={"/setting"}
                      label={t("sidebar.settings")}
                      icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                    />
                  </>
                }
                {!isManager && <>

                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"dashboard"}
                    toggleMenu={toggleMenu}
                    to={"/dashboard"}
                    label={t("sidebar.dashboard")}
                    icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"admin"}
                    toggleMenu={toggleMenu}
                    to={"/supperAdmin"}
                    label={t("sidebar.admin")}
                    icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                  />
                  <MenuItem
                    permission={["read-any", "read-own"]}
                    resource={"school"}
                    toggleMenu={toggleMenu}
                    to={"/adminSchool"}
                    label={t("sidebar.school")}
                    icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                  />
                </>
                }

                <MenuSubItem
                  permission={["read-any", "read-own"]}
                  resource={["stage", "class", "section"]}
                  name={"stages"}
                  currentMenu={currentMenu}
                  label={t("sidebar.stages")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
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
                  resource={["student", "student_enrollment",]}
                  name={"students"}
                  currentMenu={currentMenu}
                  label={t("sidebar.students")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
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
                      resource: "student_installment",
                      permission: ["read-any", "read-own"],
                      to: "studentInstallment",
                      isNoSub: true,
                      // icon: <IconMenuSubscription className="shrink-0 group-hover:!text-primary" />
                    }
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
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />
                <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"bus"}
                  toggleMenu={toggleMenu}
                  to={"/bus"}
                  label={t("sidebar.bus")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />
                {!isManager && <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"banner"}
                  toggleMenu={toggleMenu}
                  to={"/banner"}
                  label={t("sidebar.banner")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />}


                <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"guidance"}
                  toggleMenu={toggleMenu}
                  to={"/guidance"}
                  label={t("sidebar.guidance")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />
                <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"gallery"}
                  toggleMenu={toggleMenu}
                  to={"/gallery"}
                  label={t("sidebar.gallery")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />
                <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"homework"}
                  toggleMenu={toggleMenu}
                  to={"/homework"}
                  label={t("sidebar.homeworks")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />
                <MenuItem
                  permission={["read-any", "read-own"]}
                  resource={"lesson"}
                  toggleMenu={toggleMenu}
                  to={"/lesson"}
                  label={t("sidebar.lessons")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
                />

                <MenuSubItem
                  permission={["read-any", "read-own"]}
                  resource={["subject", "stage_subject", "stage_subject"]}
                  name={"subjects"}
                  currentMenu={currentMenu}
                  label={t("sidebar.subjects")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
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
                <MenuSubItem
                  permission={["read-any", "read-own"]}
                  resource={["schedule", "section_schedule"]}
                  name={"schedules"}
                  currentMenu={currentMenu}
                  label={t("sidebar.schedules")}
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
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
                  icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
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

              </ul>
            }
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
