import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { getTranslation } from "@/ni18n/i18n";
import {
  useLazyParentGetDataByIdQuery,
  useParentRemoveMutation,
} from "@/services/admin/parent";
import { ParentPageHookResult } from "./types";

export const useParentPage = (): ParentPageHookResult => {
  const { t } = getTranslation();
  const router = useRouter();
  const params = useParams();
  const { id } = params;

  const [ParentGetDataById, { currentData: data, isFetching }] =
    useLazyParentGetDataByIdQuery();
  const [ParentRemove, { isLoading: isLoadingParentRemove }] =
    useParentRemoveMutation();

  const [openDelete, setOpenDelete] = useState(false);

  useEffect(() => {
    if (id) {
      ParentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id, ParentGetDataById, router]);

  const handleRemove = async (): Promise<void> => {
    try {
      await ParentRemove({ id: String(id) }).unwrap();
      toast.success(t("common.deleted-successfully"), { autoClose: 15000 });
      router.back();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error && error.message) {
        toast.error(error.message, { autoClose: 15000 });
        return;
      }
      toast.error(error, { autoClose: 15000 });
    }
  };

  return {
    data,
    isFetching,
    isLoadingParentRemove,
    openDelete,
    setOpenDelete,
    handleRemove,
  };
};
