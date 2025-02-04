"use client";

import React from "react";
import { Form, Formik, FormikProps } from "formik";
import { ButtonForm } from "@/components/Form/ButtonForm";
import Model from "@/components/Model";
import { SelectForm } from "@/components/Form/SelectForm";
import { LoadingForm } from "@/components/Form/loadingForm";
import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { toast } from "react-toastify";
import * as Yup from "yup";
import {
  AddStudentInstallmentPayload,
  IStudentInstallment,
  useStudentInstallmentCreateMutation,
  useStudentInstallmentUpdateMutation,
} from "@/services/admin/studentInstallment";
import { DateTimeForm } from "@/components/Form/DateTimeForm";
import { useStudentEnrollmentGetDataQuery } from "@/services/admin/studentEnrollment";
import { InputCurrencyMaskForm } from "@/components/Form/inputForm";
export interface FormValues extends AddStudentInstallmentPayload {}
const CreateOrUpdateComponent = ({
  open,
  setOpen,
  data,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  data: IStudentInstallment;
}) => {
  const { t } = getTranslation();
  const [search, setSearch] = React.useState();
  const {
    currentData: StudentEnrollment,
    isFetching: isFetchingStudentEnrollment,
  } = useStudentEnrollmentGetDataQuery({
    search,
    skip: 1,
    take: 30,
  });

  const [
    StudentInstallmentUpdate,
    { isLoading: isLoadingStudentInstallmentUpdate },
  ] = useStudentInstallmentUpdateMutation();
  const [
    StudentInstallmentCreate,
    { isLoading: isLoadingStudentInstallmentCreate },
  ] = useStudentInstallmentCreateMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>,
    setOpen: any
  ) => {
    try {
      if (data && data.id) {
        await StudentInstallmentUpdate({
          id: data.id,
          body: {
            amount: Number(values.amount),
            date: values.date,
          },
        }).unwrap();
      } else {
        await StudentInstallmentCreate({
          amount: Number(values.amount),
          date: values.date,
          studentEnrollmentId: values.studentEnrollmentId,
        }).unwrap();
      }

      toast.success(
        t(
          data && data.id
            ? "common.updated-successfully"
            : "common.updated-successfully"
        ),
        { autoClose: 30000 }
      );
      resetForm();
      setOpen(false);
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist") {
          return toast.error(t("ClassPage.name-already-exists"), {
            autoClose: 30000,
          });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    amount: Yup.number()
      .min(0, t("common.must-min-is-one"))
      .required(t("common.this-field-is-required")),
    date: Yup.string().required(t("common.this-field-is-required")),
    studentEnrollmentId: Yup.string().required(
      t("common.this-field-is-required")
    ),
  });

  return (
    <Model
      title={t(
        data && data?.id
          ? "StudentInstallmentPage.update-info"
          : "StudentInstallmentPage.create-info"
      )}
      open={open}
      setOpen={setOpen}
    >
      {false ? (
        <LoadingForm className="!h-36" />
      ) : (
        <Formik<FormValues>
          initialValues={{
            date: data?.date ?? "",
            amount: data?.amount ?? 0,
            studentEnrollmentId: data?.studentEnrollmentId ?? "",
          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen);
          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <InputCurrencyMaskForm
                formikProps={props}
                name={"amount"}
                title={t("StudentInstallmentPage.amount")}
                placeholder={t("StudentInstallmentPage.enter-amount")}
                iconRight={
                  <span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">
                    {t("IQD")}
                  </span>
                }
              />
              <DateTimeForm
                formikProps={props}
                name={"date"}
                title={t("StudentInstallmentPage.date")}
                placeholder={t("StudentInstallmentPage.enter-date")}
              />
              <SelectForm
                formikProps={props}
                name={"studentEnrollmentId"}
                title={t("StudentInstallmentPage.studentEnrollment")}
                placeholder={t(
                  "StudentInstallmentPage.enter-studentEnrollment"
                )}
                options={
                  StudentEnrollment?.data.map((item) => {
                    return {
                      label: item.Student.fullName,
                      value: item.id,
                    };
                  }) ?? []
                }
                props={{
                  isClearable: true,
                  isLoading: isFetchingStudentEnrollment,
                  onChange: (e) => {
                    props.setFieldValue(
                      "studentEnrollmentId",
                      (e as any).value ?? ""
                    );
                  },
                }}
              />
              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingStudentInstallmentUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </Model>
  );
};

export default CreateOrUpdateComponent;
