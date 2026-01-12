"use client";

import React, { useState, useEffect } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { ItemList } from "@/components/common/ItemList";
import { getTranslation } from "@/ni18n/i18n";
import { useLazySuperTeacherLibraryGetDataByIdQuery, useSuperTeacherLibraryRemoveMutation } from "@/services/admin/superTeacherLibrary";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { ArrowIcons } from "@/components/common/icons/Actions";
import moment from "moment";
import { AttachmentsImage } from "@/components/common/LightboxImagePreview";
import DeleteModel from "@/components/Model/DeleteModel";
import { BASE_URL } from "@/services/api";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;
  const [SuperTeacherLibraryGetDataById, { currentData: data, isFetching }] = useLazySuperTeacherLibraryGetDataByIdQuery();
  const [SuperTeacherLibraryRemove, { isLoading: isLoadingRemove }] = useSuperTeacherLibraryRemoveMutation();
  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    if (id) {
      SuperTeacherLibraryGetDataById({ id: String(id) }).then((res) => {
        // If query fails or returns null, handle it?
        // Note: The service might throw or return error property.
        // Assuming success path or keeping it simple like Student page.
      });
    }
  }, [id, SuperTeacherLibraryGetDataById]);

  const handleRemove = async () => {
    try {
      await SuperTeacherLibraryRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        return toast.error(t(error.message), { autoClose: 15000 });
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  return (
    <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%] mb-20">
      <BackButton title={t("SuperTeacherLibraryPage.LibraryInformation" as any)} />
      {isFetching ? (
        <LoadingForm />
      ) : (
        <>
          {data?.url && <AttachmentsImage className="my-2 h-44" src={String(BASE_URL + "uploads/" + data?.url)} />}

          <div className="CardDetails internalMenu ">
            <ItemList title={t("SuperTeacherLibraryPage.title")} value={String(data?.title)} />
            <ItemList title={t("SuperTeacherLibraryPage.description")} value={String(data?.description)} />

            <ItemList title={t("StudentEnrollmentPage.ClassName")} value={t((data?.Class?.name as any) ?? "")} />
            <ItemList
              title={t("StudentEnrollmentPage.SectionName")}
              value={Array.isArray(data?.Section) ? data?.Section.map((s) => t(s.name as any)).join(", ") : t((data?.Section as any)?.name ?? "")}
            />

            <ItemList title={t("common.updatedAt")} value={moment(data?.updatedAt).format("YYYY-MM-DD hh:mm:ss A")} />
            <ItemList title={t("common.createdAt")} value={moment(data?.createdAt).format("YYYY-MM-DD hh:mm:ss A")} />
          </div>

          <div className="text-sm font-semibold text-black dark:text-white-dark  mt-2 mb-1 ">{t("common.settings")}</div>
          <div className="CardDetails internalMenu ">
            <ItemList
              props={{
                onClick: () => {
                  router.push(`/superTeacherLibrary/createOrUpdate?id=${id}`);
                },
              }}
              title={t("common.update")}
              value={<ArrowIcons className="rtl:rotate-180 text-[#000]/50" />}
            />

            <ItemList
              props={{
                onClick: () => {
                  setOpenDelete(true);
                },
              }}
              title={<div className="text-danger">{t("common.delete")}</div>}
              value={<ArrowIcons className="rtl:rotate-180 text-danger/50" />}
            />
          </div>
        </>
      )}

      <DeleteModel
        description={t("SuperTeacherLibraryPage.Are-you-sure-you-want-to-delete-this-SuperTeacherLibrary")}
        title={t("SuperTeacherLibraryPage.DeleteSuperTeacherLibrary")}
        open={openDelete}
        setOpen={setOpenDelete}
        handleRemove={handleRemove}
        isLoading={isLoadingRemove}
        name={data?.title ?? ""}
      />
    </div>
  );
};

export default PageComponent;
