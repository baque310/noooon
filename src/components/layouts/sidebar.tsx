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

  const session = useSession();

  const notification = useNotification();
  const playSound = usePlaySound();



  return (
    <div className={!semidark ? "dark" : ""}>
      <nav
        className={`sidebar fixed bottom-0 top-0 z-50 h-full min-h-screen w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] transition-all duration-300 ${semidark ? "text-white-dark" : ""
          }`}>
        <div className={`h-full bg-white dark:bg-black ${!semidark && "bg-[#28243d]"} `}>
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/dashboard" className="main-logo flex shrink-0 items-center">
              <img className="ml-[5px] w-10 h-10 rounded-full flex-none" src="/favicon.png" alt="logo" />
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
            <ul className="relative space-y-0.5 mt-4 p-4 py-0 font-semibold">
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"admin"}
                toggleMenu={toggleMenu}
                to={"/admin"}
                label={t("sidebar.admin")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"school"}
                toggleMenu={toggleMenu}
                to={"/school"}
                label={t("sidebar.school")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"stage"}
                toggleMenu={toggleMenu}
                to={"/stage"}
                label={t("sidebar.stage")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"class"}
                toggleMenu={toggleMenu}
                to={"/class"}
                label={t("sidebar.class")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"section"}
                toggleMenu={toggleMenu}
                to={"/section"}
                label={t("sidebar.section")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"student"}
                toggleMenu={toggleMenu}
                to={"/student"}
                label={t("sidebar.student")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />
              <MenuItem
                permission={["read-any", "read-own"]}
                resource={"student_enrollment"}
                toggleMenu={toggleMenu}
                to={"/studentEnrollment"}
                label={t("sidebar.studentEnrollment")}
                icon={<IconManagerAdmin className="shrink-0 group-hover:!text-white group-active:!text-white" />}
              />

            </ul>
          </PerfectScrollbar>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
