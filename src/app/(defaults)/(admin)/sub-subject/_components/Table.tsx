"use client";
import { DataTable } from "mantine-datatable";
import React, { useEffect, useState } from "react";

import moment from "moment";
import { RolePageAndActionBasedComponent, withRole } from "@/components/Provider/RolePageAndActionBasedComponent";
import useMounted from "@/hooks/useMounted";
import { getTranslation } from "@/ni18n/i18n";
import { useSubSubjectGetDataQuery } from "@/services/admin/SubSubject";
import { IRootState } from "@/store";
import { DataTableSortStatus } from "mantine-datatable";
import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { AddIcons } from "@/components/common/icons/Actions";
import CreateComponent from "./CreateComponent";

const TableComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const search = searchParams.get("search") || "";

  const [Search, setSearch] = useState(search);

  const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({
    columnAccessor: "createdAt",
    direction: "desc",
  });

  const isDark = useSelector((state: IRootState) => state.themeConfig.theme) === "dark";
  const { isMounted } = useMounted();

  // Sync search from URL
  useEffect(() => {
    setSearch(search);
  }, [search]);

  const params = {
    sortBy: sortStatus.columnAccessor,
    sortDirection: sortStatus.direction,
    ...(search && { search }),
  };

  const { isFetching, currentData: data } = useSubSubjectGetDataQuery(params);

  const handleChange = (e: any) => {
    const value = e.target.value;
    setSearch(value);

    if (value === "") handleSearch("");
  };

  const allParams = new URLSearchParams(searchParams);

  const handleSearch = (value?: string) => {
    if (search !== Search) {
      allParams.set("search", value ?? Search);
      router.push(`/sub-subject?${allParams.toString()}`);
    }
  };

  const handleKeyPress = (event: any) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  const [open, setOpen] = useState(false);

  return (
    <div className="m-4 rtl:transition-[left] ltr:transition-[right] duration-1000">
      <div className="flex justify-between max-md:flex-col gap-2">
        <div className="text-xl uppercase">{t("SubSubjectPage.SubSubjects")}</div>

        <div className="flex gap-3 max-md:flex-col max-md:items-end">
          <input
            value={Search ?? ""}
            placeholder={`${t("common.search")} ...`}
            onKeyDown={handleKeyPress}
            onChange={handleChange}
            id="search"
            className="form-input text-white-dark"
            name="search"
          />

          <RolePageAndActionBasedComponent
            component={(props) => (
              <button
                className={`${
                  props.disabled && "hidden"
                } flex justify-center gap-1 items-center bg-primary border-primary/70 text-white hover:scale-[1.01] transition-transform py-1 px-2 rounded border`}
                onClick={() => setOpen(true)}>
                <AddIcons className="h-4 w-4" />
                {t("common.add")}
              </button>
            )}
            resource="admin"
            permission={["create-any", "create-own"]}
          />
        </div>
      </div>

      <div className="datatables pagination-padding mt-2">
        {isMounted && (
          <DataTable
            withTableBorder={false}
            fetching={isFetching}
            className={`${isDark} table-hover whitespace-nowrap rounded-lg shadow-base`}
            records={data as any}
            columns={[
              {
                title: t("SubSubjectPage.name"),
                accessor: "name",
                sortable: true,
              },
              {
                title: t("common.updatedAt"),
                accessor: "updatedAt",
                sortable: true,
                render: ({ updatedAt }: any) => (updatedAt ? moment(updatedAt).format("YYYY-MM-DD hh:mm:ss A") : null),
              },
              {
                title: t("common.createdAt"),
                accessor: "createdAt",
                sortable: true,
                render: ({ createdAt }: any) => (createdAt ? moment(createdAt).format("YYYY-MM-DD hh:mm:ss A") : null),
              },
            ]}
            customLoader={<div className="loader !bg-primary"></div>}
            noRecordsText={t("common.no-data")}
            noRecordsIcon={<></>}
            {...(isFetching && { minHeight: 130 })}
            sortStatus={sortStatus}
            onSortStatusChange={setSortStatus}
            onRowClick={(item) => router.push(`/sub-subject/${item.record.id}`)}
          />
        )}
      </div>

      <CreateComponent open={open} setOpen={setOpen} />
    </div>
  );
};

export default withRole(TableComponent, "subject", ["read-any", "read-own"]);
