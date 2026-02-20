"use client";

import { ButtonForm } from "@/components/Form/ButtonForm";
import { SelectForm } from "@/components/Form/SelectForm";
import Model from "@/components/Model";
import { getTranslation } from "@/ni18n/i18n";
import { useParentGetDataQuery } from "@/services/admin/parent";
import { useStudentConnectParentMutation, useStudentDisconnectParentMutation } from "@/services/admin/student";
import { Form, Formik, FormikHelpers, FormikProps } from "formik";
import React, { useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export interface FormValues {
  parentId: string;
}

interface ConnectedStudentWithParentProps {
  data?: any;
  open?: boolean;
  setOpen?: (open: boolean) => void;
  studentId?: string;
}

const ConnectedStudentWithParent = ({ data, open: controlledOpen, setOpen: setControlledOpen, studentId }: ConnectedStudentWithParentProps) => {
  const { t } = getTranslation();
  const [internalOpen, setInternalOpen] = useState(false);
  const [openDisconnect, setOpenDisconnect] = useState(false);

  const isOpen = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setIsOpen = setControlledOpen !== undefined ? setControlledOpen : setInternalOpen;
  const effectiveStudentId = studentId || data?.id;

  const [StudentConnectParent, { isLoading: isLoadingStudentConnectParent }] = useStudentConnectParentMutation();
  const [StudentDisconnectParent, { isLoading: isLoadingStudentDisconnectParent }] = useStudentDisconnectParentMutation();
  const [search, setSearch] = useState<string>();
  const {
    data: parentData,
    isLoading: isLoadingParentData,
    isFetching: isFetchingParentData,
  } = useParentGetDataQuery({
    skip: 1,
    take: 100,
    search,
  });

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      await StudentConnectParent({
        parentId: values?.parentId,
        studentId: effectiveStudentId,
      }).unwrap();

      setIsOpen(false);
      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const bannerSchema = Yup.object().shape({
    parentId: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      {data && (
        <div
          onClick={async (e) => {
            e.stopPropagation();
            if (data?.Parent?.fullName) {
              setOpenDisconnect(true);
            } else {
              setIsOpen(true);
            }
          }}
          className="flex items-center justify-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg p-2">
          <div className="flex items-center gap-2">
            {data?.Parent?.fullName ? (
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded-lg font-medium">{data?.Parent?.fullName}</span>
            ) : (
              <span className="text-sm bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-1 rounded-lg font-medium">
                {t("StudentPage.ConnectedStudentWithParent")}
              </span>
            )}
          </div>
        </div>
      )}

      {isOpen && (
        <Model title={t("StudentPage.ConnectedStudentWithParent")} open={isOpen} setOpen={setIsOpen as any}>
          <Formik<FormValues>
            initialValues={{
              parentId: "",
            }}
            validationSchema={bannerSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <SelectForm
                  formikProps={props}
                  name={"parentId"}
                  title={t("StudentPage.parentFullName")}
                  placeholder={t("StudentPage.enter-parent-full-name")}
                  options={
                    parentData?.data?.map((item) => ({
                      label: item.fullName,
                      value: item.id,
                    })) ?? []
                  }
                  props={{
                    isSearchable: true,
                    isClearable: true,
                    isLoading: isLoadingParentData || isFetchingParentData,
                    onInputChange: (value) => {
                      setSearch(value);
                    },
                    onChange: (value: any) => {
                      props.setFieldValue("parentId", value?.value || "");
                    },
                  }}
                />

                <ButtonForm
                  props={{
                    type: "submit",
                    className: "w-full",
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingStudentConnectParent}
                />
              </Form>
            )}
          </Formik>
        </Model>
      )}

      {openDisconnect && (
        <Model title={t("StudentPage.disconnectParent")} open={openDisconnect} setOpen={setOpenDisconnect}>
          <p className=" text-gray-700 dark:text-gray-300">
            {t("StudentPage.IsDo-disconnectParentMessage")}
            <span className="font-bold px-1 text-primary">{data?.Parent?.fullName}</span>
          </p>
          <div className="flex justify-end mt-4">
            <ButtonForm
              props={{
                type: "button",
                className: "w-full",
                onClick: async () => {
                  try {
                    await StudentDisconnectParent({
                      studentId: effectiveStudentId,
                    }).unwrap();
                    setOpenDisconnect(false);
                    toast.success(t("common.deleted-successfully"), { autoClose: 30000 });
                  } catch (error: any) {
                    console.error("Failed to operation :", error);
                    toast.error(JSON.stringify(error), { autoClose: 30000 });
                  }
                },
              }}
              title={t("common.confirm")}
              isLoading={isLoadingStudentDisconnectParent}
            />
          </div>
        </Model>
      )}
    </>
  );
};

export default ConnectedStudentWithParent;
