"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  AddParentPayload,
  useLazyParentGetDataByIdQuery,
  useParentCreateMutation,
  useParentUpdateMutation,
} from "@/services/admin/parent";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddParentPayload {}
export interface FormValuesMulti {
  parentsData: {
    id: number;
    s_name: string;
    s_phone: string;
    p_name: string;
    p_phone: string;
  }[];
}
import SingleAdd from "./SingleAdd";
import { Tab, TabOption } from "./_components/Tab";
import ExcelAdd from "./ExcelAdd";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [selected, setSelected] = useState<TabOption>("add");
  const [ParentGetDataById, { currentData: data, isFetching }] =
    useLazyParentGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      ParentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);

  const [ParentCreate, { isLoading: isLoadingParentCreate }] =
    useParentCreateMutation();

  const [ParentUpdate, { isLoading: isLoadingParentUpdate }] =
    useParentUpdateMutation();

  const handleSubmit = async (
    values: FormValues,
    { resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      const formData = new FormData();
      if (typeof values.photo === "string") {
        delete (values as any).url;
      }
      for (const key in values) {
        if ((values as any)[key]) {
          formData.append(key, (values as any)[key]);
        }
      }

      if (id) {
        await ParentUpdate({
          body: formData,
          id: String(id),
        }).unwrap();
      } else {
        // remove if values is '' or undefined or null ?
        Object.keys(values).forEach((key) => {
          if (
            (values as any)[key] === undefined ||
            (values as any)[key] === ""
          ) {
            delete (values as any)[key];
          }
        });

        await ParentCreate({
          ...values,
          photo: undefined,
        }).unwrap();
      }
      toast.success(
        t(id ? "common.updated-successfully" : "common.added-successfully"),
        { autoClose: 30000 }
      );
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (
          error.message ==
          `Resource already exists. More details: {\"modelName\":\"Parent\",\"target\":\"parents_email_key\"}`
        ) {
          return toast.error(t("ParentPage.email-already-exists"), {
            autoClose: 30000,
          });
        }
        if (error.message == `email must be an email`) {
          return toast.error(t("common.invalid-email"), { autoClose: 30000 });
        }
        if (
          error.message ==
          `Resource already exists. More details: {"modelName":"Parent","target":"parents_phone1_key"}`
        ) {
          return toast.error(t("common.phone-already-exists"), {
            autoClose: 30000,
          });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const parentSchema = Yup.object().shape({
    fullName: Yup.string().required(t("common.this-field-is-required")),
    phone1: Yup.string()
      .matches(/^07\d{9}$/, t("common.invalid-phone"))
      .required(t("common.this-field-is-required")),
    phone2: Yup.string()
      .matches(/^07\d{9}$/, t("common.invalid-phone"))
      .optional(),
    gender: Yup.string()
      .oneOf(["Male", "Female"], t("common.invalid-gender"))
      .required(t("common.this-field-is-required")),
    studentId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton
          title={t(id ? "ParentPage.update-info" : "ParentPage.add")}
        />

        {isFetching ? (
          <LoadingForm />
        ) : !id ? (
          <>
            <Tab selected={selected} setSelected={setSelected} />
            {selected == "add" ? (
              <SingleAdd
                id={id}
                data={data}
                parentSchema={parentSchema}
                handleSubmit={handleSubmit}
                isLoadingParentUpdate={isLoadingParentCreate}
              />
            ) : (
              <ExcelAdd />
            )}
          </>
        ) : (
          <>
            <SingleAdd
              id={id}
              data={data}
              parentSchema={parentSchema}
              handleSubmit={handleSubmit}
              isLoadingParentUpdate={isLoadingParentUpdate}
            />
          </>
        )}
      </div>
    </>
  );
};

export default PageComponent;
