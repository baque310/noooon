"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { InputForm } from "@/components/Form/inputForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { useSubSubjectCreateMutation, useSubSubjectUpdateMutation, useLazySubSubjectGetDataByIdQuery } from "@/services/admin/SubSubject";
import { useSubjectGetDataQuery } from "@/services/admin/Subject";
import { FormikHelpers } from "formik";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";

export interface FormValues {
  name: string;
  subjectId: string;
}

const CreateComponent = ({ open, setOpen }: { open: boolean; setOpen: React.Dispatch<React.SetStateAction<boolean>> }) => {
  const { t } = getTranslation();

  const params = useParams();
  const { id } = params;
  const [SubSubjectGetDataById, { currentData: data, isFetching }] = useLazySubSubjectGetDataByIdQuery();

  // Fetch subjects for dropdown
  const { currentData: subjectsData } = useSubjectGetDataQuery({
    sortBy: "name",
    sortDirection: "asc",
  });

  useEffect(() => {
    if (id) {
      SubSubjectGetDataById({ id: String(id) });
    }
  }, [id]);

  const [SubSubjectCreate, { isLoading: isLoadingSubSubjectCreate }] = useSubSubjectCreateMutation();
  const [SubSubjectUpdate, { isLoading: isLoadingSubSubjectUpdate }] = useSubSubjectUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await SubSubjectUpdate({
          id: id as string,
          body: {
            name: values.name,
          },
        }).unwrap();
      } else {
        await SubSubjectCreate({
          name: values.name,
          subjectId: values.subjectId,
        }).unwrap();
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      if (id) {
        setOpen(false);
      } else {
        // Reset form and close modal for create
        setOpen(false);
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist" || error.message == "SubSubject already exists") {
          return toast.error(t("SubSubjectPage.name-already-exist"), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const isCreating = !id;

  const validationSchema = Yup.object().shape({
    name: Yup.string().required(t("common.this-field-is-required")),
    subjectId: isCreating ? Yup.string().required(t("common.this-field-is-required")) : Yup.string(),
  });

  return (
    <Model title={t(id ? "SubSubjectPage.update" : "SubSubjectPage.add")} open={open} setOpen={setOpen}>
      {isFetching ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            name: data?.name ?? "",
            subjectId: data?.id ?? "",
          }}
          validationSchema={validationSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}>
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <InputForm formikProps={props} name={"name"} title={t("SubSubjectPage.name")} placeholder={t("SubSubjectPage.enter-name")} />

              {!id && (
                <SelectForm
                  formikProps={props}
                  name={"subjectId"}
                  title={t("SubSubjectPage.subject")}
                  placeholder={t("SubSubjectPage.select-subject")}
                  options={
                    subjectsData?.map((subject: any) => ({
                      value: subject.id,
                      label: subject.name,
                    })) || []
                  }
                />
              )}

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingSubSubjectUpdate || isLoadingSubSubjectCreate}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Model>
  );
};

export default CreateComponent;
