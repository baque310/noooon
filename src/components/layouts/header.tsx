"use client";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Link from "next/link";
import { IRootState } from "@/store";
import { toggleRTL, toggleSidebar, toggleTheme } from "@/store/themeConfigSlice";
import { signOut, useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import Dropdown from "../dropdown";
import useNotification from "@/hooks/useNotification";
import { getTranslation } from "@/ni18n/i18n";
import { get } from "lodash";
import { getTitleApp } from "@/utils/getTitleApp";
import { ChangePasswordByAdminModel } from "../Model/ChangePasswordByAdminModel";

export const Header = () => {
  const pathname = usePathname();
  const dispatch = useDispatch();
  const router = useRouter();
  const { t, i18n, initLocale } = getTranslation();

  useEffect(() => {
    const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
    if (selector) {
      const all: any = document.querySelectorAll("ul.horizontal-menu .nav-link.active");
      for (let i = 0; i < all.length; i++) {
        all[0]?.classList.remove("active");
      }

      let allLinks = document.querySelectorAll("ul.horizontal-menu a.active");
      for (let i = 0; i < allLinks.length; i++) {
        const element = allLinks[i];
        element?.classList.remove("active");
      }
      selector?.classList.add("active");

      const ul: any = selector.closest("ul.sub-menu");
      if (ul) {
        let ele: any = ul.closest("li.menu").querySelectorAll(".nav-link");
        if (ele) {
          ele = ele[0];
          setTimeout(() => {
            ele?.classList.add("active");
          });
        }
      }
    }
  }, [pathname]);

  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  const themeConfig = useSelector((state: IRootState) => state.themeConfig);

  const setLocale = (flag: string) => {
    if (flag.toLowerCase() === "ae") {
      dispatch(toggleRTL("rtl"));
    } else {
      dispatch(toggleRTL("ltr"));
    }
    router.refresh();
  };

  const session = useSession();

  const notification = useNotification();
  const [openChangePassword, setOpenChangePassword] = useState(false);

  return (
    <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === "horizontal" ? "dark" : ""} shadow-3xl `}>
      <div className="border-b border-dark-dark-light">
        <div className="relative flex w-full items-center bg-white px-5 py-2.5 dark:bg-black">
          <div className="horizontal-logo flex items-center justify-between ltr:mr-2 rtl:ml-2 lg:hidden">
            <Link href="/" className="main-logo flex shrink-0 items-center">
              {/* <img className="inline  w-10 h-10 rounded-full ltr:-ml-1 rtl:-mr-1" src="/favicon.png" alt="logo" /> */}
              <span className="hidden align-middle text-lg  font-semibold  transition-all duration-300 ltr:ml-1.5 rtl:mr-1.5 dark:text-white-light md:inline">
                {getTitleApp(window.location.origin)}
              </span>
            </Link>
            <button
              type="button"
              className="collapse-icon flex flex-none rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary ltr:ml-2 rtl:mr-2 dark:bg-dark/40 dark:text-[#d0d2d6] dark:hover:bg-dark/60 dark:hover:text-primary lg:hidden"
              onClick={() => dispatch(toggleSidebar())}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 7L4 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path opacity="0.5" d="M20 12L4 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M20 17L4 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center justify-end space-x-1.5 ltr:ml-auto rtl:mr-auto rtl:space-x-reverse dark:text-[#d0d2d6] sm:flex-1 ltr:sm:ml-0 sm:rtl:mr-0 lg:space-x-2">
            <div>
              {themeConfig.theme === "light" ? (
                <button
                  className={`${
                    themeConfig.theme === "light" &&
                    "flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                  }`}
                  onClick={() => dispatch(toggleTheme("dark"))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M12 2V4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M12 20V22" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M4 12L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M22 12L20 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M19.7778 4.22266L17.5558 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M4.22217 4.22266L6.44418 6.25424" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M6.44434 17.5557L4.22211 19.7779" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M19.7778 19.7773L17.5558 17.5551" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              ) : (
                ""
              )}
              {themeConfig.theme === "dark" && (
                <button
                  className={`${
                    themeConfig.theme === "dark" &&
                    "flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                  }`}
                  onClick={() => dispatch(toggleTheme("system"))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M21.0672 11.8568L20.4253 11.469L21.0672 11.8568ZM12.1432 2.93276L11.7553 2.29085V2.29085L12.1432 2.93276ZM21.25 12C21.25 17.1086 17.1086 21.25 12 21.25V22.75C17.9371 22.75 22.75 17.9371 22.75 12H21.25ZM12 21.25C6.89137 21.25 2.75 17.1086 2.75 12H1.25C1.25 17.9371 6.06294 22.75 12 22.75V21.25ZM2.75 12C2.75 6.89137 6.89137 2.75 12 2.75V1.25C6.06294 1.25 1.25 6.06294 1.25 12H2.75ZM15.5 14.25C12.3244 14.25 9.75 11.6756 9.75 8.5H8.25C8.25 12.5041 11.4959 15.75 15.5 15.75V14.25ZM20.4253 11.469C19.4172 13.1373 17.5882 14.25 15.5 14.25V15.75C18.1349 15.75 20.4407 14.3439 21.7092 12.2447L20.4253 11.469ZM9.75 8.5C9.75 6.41182 10.8627 4.5828 12.531 3.57467L11.7553 2.29085C9.65609 3.5593 8.25 5.86509 8.25 8.5H9.75ZM12 2.75C11.9115 2.75 11.8077 2.71008 11.7324 2.63168C11.6686 2.56527 11.6538 2.50244 11.6503 2.47703C11.6461 2.44587 11.6482 2.35557 11.7553 2.29085L12.531 3.57467C13.0342 3.27065 13.196 2.71398 13.1368 2.27627C13.0754 1.82126 12.7166 1.25 12 1.25V2.75ZM21.7092 12.2447C21.6444 12.3518 21.5541 12.3539 21.523 12.3497C21.4976 12.3462 21.4347 12.3314 21.3683 12.2676C21.2899 12.1923 21.25 12.0885 21.25 12H22.75C22.75 11.2834 22.1787 10.9246 21.7237 10.8632C21.286 10.804 20.7293 10.9658 20.4253 11.469L21.7092 12.2447Z"
                      fill="currentColor"
                    />
                  </svg>
                </button>
              )}
              {themeConfig.theme === "system" && (
                <button
                  className={`${
                    themeConfig.theme === "system" &&
                    "flex items-center rounded-full bg-white-light/40 p-2 hover:bg-white-light/90 hover:text-primary dark:bg-dark/40 dark:hover:bg-dark/60"
                  }`}
                  onClick={() => dispatch(toggleTheme("light"))}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M3 9C3 6.17157 3 4.75736 3.87868 3.87868C4.75736 3 6.17157 3 9 3H15C17.8284 3 19.2426 3 20.1213 3.87868C21 4.75736 21 6.17157 21 9V14C21 15.8856 21 16.8284 20.4142 17.4142C19.8284 18 18.8856 18 17 18H7C5.11438 18 4.17157 18 3.58579 17.4142C3 16.8284 3 15.8856 3 14V9Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                    <path opacity="0.5" d="M22 21H2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    <path opacity="0.5" d="M15 15H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>

            <div className="dropdown shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                btnClassName="block p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60"
                button={<div className="h-5 w-5 rounded-full ">{t(i18n.language as any)}</div>}>
                <ul className="grid  gap-2 !px-2 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                  {themeConfig.languageList.map((item: any) => {
                    return (
                      <li key={item.code}>
                        <button
                          type="button"
                          className={`flex w-full hover:text-primary ${i18n.language === item.code ? "bg-primary/10 text-primary" : ""}`}
                          onClick={() => {
                            initLocale(item.code);
                            i18n.changeLanguage(item.code);
                            setLocale(item.code);
                            dispatch(toggleRTL(item.code !== "en" ? "rtl" : "ltr"));
                          }}>
                          <span className="ltr:ml-3 rtl:mr-3">{t(item.name)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </Dropdown>
            </div>
            <div className="dropdown flex shrink-0">
              <Dropdown
                offset={[0, 8]}
                placement={`${isRtl ? "bottom-start" : "bottom-end"}`}
                btnClassName="relative group block"
                button={
                  <div className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100 flex justify-center items-center bg-purple-700/20 text-purple-700">
                    {(session.status !== "loading" && session.status === "authenticated" && session.data.user.name && session.data.user.name[0]) ?? "A"}
                  </div>
                }>
                <ul className="w-[230px] !py-0 font-semibold text-dark dark:text-white-dark dark:text-white-light/90">
                  <li>
                    <div className="flex items-center px-4 py-4">
                      <div className="h-9 w-9 rounded-full object-cover saturate-50 group-hover:saturate-100 flex justify-center items-center bg-purple-700/20 text-purple-700">
                        {(session.status !== "loading" && session.status === "authenticated" && session.data.user.name && session.data.user.name[0]) ?? "A"}
                      </div>
                      <div className="ltr:pl-4 rtl:pr-4 truncate">
                        <h4 className="text-base">
                          {session?.data?.user?.name}
                          {/* <span className="rounded bg-success-light px-1 text-xs text-success p-1 ltr:ml-2 rtl:ml-2">{session.data?.user.roles} </span> */}
                        </h4>
                        <button type="button" className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">
                          {session.data?.user?.username}
                        </button>
                      </div>
                    </div>
                  </li>
                  {/* <li className="border-t border-white-light dark:border-white-light/10">
                    <button
                      onClick={async () => {
                        setOpenChangePassword(true);
                      }}
                      className="!py-3 "
                    >
                      {t("common.changePassword")}
                    </button>
                  </li> */}
                  <li className="border-t border-white-light dark:border-white-light/10">
                    <button
                      onClick={async () => {
                        await signOut({
                          redirect: true,
                          callbackUrl: "/signIn",
                        });
                        // router.replace('/signIn' )
                        localStorage.removeItem("username");
                        localStorage.removeItem("password");
                      }}
                      className="!py-3 text-danger">
                      <svg className="shrink-0 rotate-90 ltr:mr-2 rtl:ml-2" width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path
                          opacity="0.5"
                          d="M17 9.00195C19.175 9.01406 20.3529 9.11051 21.1213 9.8789C22 10.7576 22 12.1718 22 15.0002V16.0002C22 18.8286 22 20.2429 21.1213 21.1215C20.2426 22.0002 18.8284 22.0002 16 22.0002H8C5.17157 22.0002 3.75736 22.0002 2.87868 21.1215C2 20.2429 2 18.8286 2 16.0002L2 15.0002C2 12.1718 2 10.7576 2.87868 9.87889C3.64706 9.11051 4.82497 9.01406 7 9.00195"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                        <path d="M12 15L12 2M12 2L15 5.5M12 2L9 5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      {t("common.SignOut")}
                    </button>
                  </li>
                </ul>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>{" "}
      {session.data?.user && openChangePassword && (
        <ChangePasswordByAdminModel
          open={openChangePassword}
          setOpen={setOpenChangePassword}
          data={{
            username: session.data?.user.username as any,
            userId: session.data?.user.id as any,
          }}
          isAdmin={session.data?.user.RoleType !== "Manager"}
        />
      )}
    </header>
  );
};
