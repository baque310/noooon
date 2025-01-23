"use client";
import { DataTable } from "mantine-datatable";
import React from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { daysArray, useScheduleGetDataQuery } from "@/services/admin/Schedule";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useSelector } from "react-redux";

import { AddIcons } from "@/components/common/icons/Actions";
import IconCaretsDown from "@/components/common/icons/sidebar/icon-carets-down";
import AnimateHeight from "react-animate-height";


const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";


  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();


  const [param, setParam] = useState<
    | {
      search?: string;
    }
    | undefined
  >();
  const params = {
    ...(search && { search: search as string }),
    ...param,
  };

  const { isFetching, currentData: data } = useScheduleGetDataQuery({
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
      router.push(`/schedule?${allParams.toString()}`);

    }
  };
  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const [active, setActive] = useState<number>(-1);
  const togglePara = (value: number) => {
    setActive((oldValue) => {
      return oldValue === value ? -1 : value;
    });
  };
  return (
    <div className={`m-4    rtl:transition-[left] ltr:transition-[right] duration-1000`}>
      <div className={"flex justify-between max-md:flex-col gap-2 "}>
        <div className="text-xl uppercase ">{t("SchedulePage.Schedule")}</div>
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
                  <button
                    className={` ${props.disabled && "hidden"
                      } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2    rounded border `}
                    onClick={() => {
                      router.push("/schedule/createOrUpdate");
                    }}>
                    <AddIcons className="h-4 w-4" />
                    {t("common.add")}
                  </button>
                );
              }}
              resource={"admin"}
              permission={["create-any", "create-own"]}
            />
          }
        </div>
      </div>



      <div className={'flex flex-col gap-4  mt-4'}>

        {
          isFetching?
          <div className="flex w-full justify-center items-center h-72 ">
            <div className="loader !bg-primary"></div>
          </div>
          :
          daysArray
            .filter((item) => data && (data[item.value as keyof typeof data] as any[])?.length > 0)
              .map((item, index: number) => {
                return (
                  <div key={index} className="">
                    <button
                      type="button"
                      className={` Card w-full  flex items-center text-white-dark dark:bg-[#1b2e4b] ${active === index ? '!text-primary' : ''}`}
                      onClick={() => togglePara(index)}
                    >
                      <bdi className=' flex gap-1 font-bold text-lg'>
                        <p>
                          {index + 1} {")"}
                        </p>

                        <p>
                          {t(item.label)}
                        </p>

                      </bdi>
                      <div
                        className={`ltr:ml-auto rtl:mr-auto ${active === index ? 'rotate-180' : ''}`}>
                        <IconCaretsDown />
                      </div>

                    </button>

                    <AnimateHeight duration={300}
                      height={active === index ? 'auto' : 0}>

                      <div className={'flex flex-col gap-4  mt-3 p-2 '}
                      >
                        <div className="datatables pagination-padding mt-2">
                          {isMounted && (
                            <DataTable
                              onRowClick={async (item) => {
                                router.push(`/schedule/${item.record.id}`);
                              }}
                              fetching={isFetching}
                              className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base  border border-dark-dark-light`}
                              records={data ? data[item.value as keyof typeof data] : [] as any}
                              columns={[
                                // {
                                //   title: t("SchedulePage.day"),
                                //   accessor: "day",
                                //   render: ({ day }) => t(day),

                                // },
                                {
                                  title: t("SchedulePage.timeFrom"),
                                  accessor: "timeFrom",
                                  render: ({ timeFrom }: any) => (timeFrom ? <div>{moment.utc(timeFrom).format("hh:mm:ss A")}</div> : null),

                                },

                                {
                                  title: t("SchedulePage.timeTo"),
                                  accessor: "timeTo",
                                  render: ({ timeTo }: any) => (timeTo ? <div>{moment.utc(timeTo).format("hh:mm:ss A")}</div> : null),

                                },

                              ]}
                              customLoader={<div className="loader !bg-primary"></div>}
                              noRecordsText={t("common.no-data")}
                              noRecordsIcon={<></>} 

                            />
                          )}
                        </div>
                      </div>
                    </AnimateHeight>
                  </div>
                );
              })}

      </div>


    </div>
  );
};

export default withRole(TableComponent, "schedule", ["read-any", "read-own"]);
