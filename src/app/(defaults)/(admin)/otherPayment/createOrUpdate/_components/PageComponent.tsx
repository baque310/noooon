"use client";
import React, { useEffect, useState } from "react";
import { Formik, Form, FormikHelpers, FormikProps } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import { useRouter, useSearchParams } from "next/navigation";
import { getTranslation } from "@/ni18n/i18n";
import { useLazyOtherPaymentGetDataByIdQuery, useOtherPaymentCreateMutation, useOtherPaymentGetDataQuery, useOtherPaymentUpdateMutation } from "@/services/admin/other-payment";
import { AddOtherPaymentPayload, IOtherPayment } from "@/services/admin/other-payment";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";
import { InputForm, InputCurrencyMaskForm } from "@/components/Form/inputForm";
import { SelectForm } from "@/components/Form/SelectForm";
import { CheckBoxForm, CheckBoxFormWithCustom } from "@/components/Form/CheckBoxForm";
import { ButtonForm } from "@/components/Form/ButtonForm";
import { PaymentMethod } from "@/services/admin/installmentPayment";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useInstallmentGetDataQuery } from "@/services/admin/Installment";

interface FormValues extends AddOtherPaymentPayload {
  isActive?: boolean;
  // local form helpers for selecting students
  students: { studentId?: string; amount?: number | string }[];
  amountStudent: string;
  searchStudent: string;
  // selection helpers
  studentEnrollmentIds: string[];
  stageId?: string;
  classId?: string;
  sectionId?: string;
  allStudentsThisASectionsORClasses?: "TRUE" | "FALSE";
}

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [searchStudent, setSearchStudent] = useState("");
  const [SchoolYearId, setSchoolYearId] = useState<string | undefined>();

  const [fetchOtherPayment, { currentData: data, isFetching }] = useLazyOtherPaymentGetDataByIdQuery();
  const [createOtherPayment, { isLoading: isCreating }] = useOtherPaymentCreateMutation();
  const [updateOtherPayment, { isLoading: isUpdating }] = useOtherPaymentUpdateMutation();

  // student list filtered by schoolYear, stage, class and section (used for selecting studentEnrollmentIds)

  const [stageId, setStageId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);

  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();

  // const { isFetching: isFetchingOtherPayment, currentData: OtherPaymentData } = useOtherPaymentGetDataQuery({
  //   skip: 1,
  //   take: 30,
  // });

  const { currentData: dataUserGetData, isFetching: isFetchingUserGetDataForAdmin } = useStudentListQuery({
    schoolYearId: SchoolYearId,
    stageId: stageId,
    classId: classId,
    sectionId: sectionId,
  });

  useEffect(() => {
    if (Setting) {
      setSchoolYearId(Setting?.CurrentSchoolYear?.id ?? "");
    }
  }, [Setting]);

  useEffect(() => {
    if (id) {
      fetchOtherPayment({ id }).then((res) => {
        if (!res?.data) router.back();
      });
    }
  }, [id]);

  const validationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    amount: Yup.number().min(1, t("common.must-min-is-one")).required(t("common.this-field-is-required")),
    paymentMethod: Yup.string().required(t("common.this-field-is-required")),
  });

  const handleSubmit = async (values: FormValues, { resetForm }: FormikHelpers<FormValues>) => {
    try {
      const apiPayload: AddOtherPaymentPayload = {
        title: values.title,
        amount: values.amount ? Number(values.amount) : 0,
        studentEnrollmentIds: values.studentEnrollmentIds || [],
        notes: values.notes,
        paymentMethod: values.paymentMethod,
      };

      if (id) {
        await updateOtherPayment({ id, body: apiPayload }).unwrap();
        toast.success(t("common.updated-successfully"), { autoClose: 3000 });
      } else {
        await createOtherPayment(apiPayload).unwrap();
        toast.success(t("common.added-successfully"), { autoClose: 3000 });
        resetForm();
      }

      router.back();
    } catch (error: any) {
      console.error("Error submitting other payment:", error);
      const message = error?.data?.message || error?.error || t("common.error-occurred");
      toast.error(message, { autoClose: 5000 });
    }
  };

  const initialValues: FormValues = {
    title: data?.title ?? "",
    amount: data?.amount ?? undefined,
    notes: data?.notes ?? "",
    paymentMethod: data?.paymentMethod ?? "",
    studentEnrollmentIds: data?.studentEnrollmentIds ?? [],
    // initialize students array so Formik fields exist when checkboxes reference students.<index>.studentId
    students: data?.studentEnrollmentIds?.map((id) => ({ studentId: id, amount: data?.amount })) ?? [],
    amountStudent: "",
    searchStudent: "",
    stageId: undefined,
    classId: undefined,
    sectionId: undefined,
    allStudentsThisASectionsORClasses: "FALSE",
  };

  return (
    <div className="mx-auto my-0 max-md:max-w-full md:max-w-[50%]">
      <BackButton title={t(id ? "OtherPaymentPage.update-info" : "OtherPaymentPage.add")} />

      {isFetching ? (
        <LoadingForm />
      ) : (
        <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={handleSubmit}>
          {(props: FormikProps<any>) => (
            <Form className="flex flex-col gap-5 p-4">
              <div className="Card flex flex-col gap-2">
                <h2 className="text-base font-semibold text-black dark:text-white-dark mb-2">{t("OtherPaymentPage.OtherPaymentInformation")}</h2>

                <InputForm formikProps={props} name="title" title={t("OtherPaymentPage.title")} placeholder={t("OtherPaymentPage.enter-title")} />

                <InputCurrencyMaskForm
                  formikProps={props}
                  name="amount"
                  title={t("OtherPaymentPage.amount")}
                  placeholder={t("OtherPaymentPage.enter-amount")}
                  iconRight={<span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>}
                />

                <SelectForm
                  formikProps={props}
                  name="paymentMethod"
                  title={t("OtherPaymentPage.payment-method")}
                  placeholder={t("OtherPaymentPage.select-payment-method")}
                  options={[
                    { label: t("Cash"), value: PaymentMethod.Cash },
                    { label: t("ZainCash"), value: PaymentMethod.ZainCash },
                    { label: t("QiCard"), value: PaymentMethod.QiCard },
                  ]}
                  props={{
                    isClearable: true,
                    onChange: (e) => props.setFieldValue("paymentMethod", (e as any)?.value ?? ""),
                  }}
                />

                <InputForm
                  formikProps={props}
                  name="notes"
                  title={t("OtherPaymentPage.notes")}
                  placeholder={t("OtherPaymentPage.enter-notes")}
                  props={{
                    ...({ as: "textarea" } as any),
                  }}
                />

                {/* {!!id && (
                  <CheckBoxForm
                    formikProps={props}
                    name="isActive"
                    title={t("common.isActive")}
                    props={{
                      checked: props.values.isActive ?? false,
                      onChange: (e) => props.setFieldValue("isActive", e.target.checked),
                    }}
                  />
                )} */}
              </div>

              {!id && (
                <>
                  <div className="Card">
                    {props.errors.studentEnrollmentIds && (
                      <div className="text-red-500 text-sm">
                        {typeof props.errors.studentEnrollmentIds === "string"
                          ? props.errors.studentEnrollmentIds
                          : Array.isArray(props.errors.studentEnrollmentIds)
                          ? props.errors.studentEnrollmentIds.join(", ")
                          : null}
                      </div>
                    )}
                    {/* // <InputForm
                                    //   formikProps={props}
                                    //   name={"searchUser"}
                                    //   title={t("")}
                                    //   placeholder={t("common.search")}
                                    //   props={{
                                    //     onChange: (e) => {
                                    //       setSearchUser(e.target.value);
                                    //       props.setFieldValue("searchUser", e.target.value);
                                    //     },
                                    //   }}
                                    // /> */}
                    <>
                      <SelectForm
                        formikProps={props}
                        name={`stageId`}
                        title={t("StageSubjectPage.StageName")}
                        placeholder={t("SectionSchedulePage.select-StageName")}
                        options={
                          stage?.map((item) => {
                            return {
                              label: t(item.name as any),
                              value: item.id,
                            };
                          }) ?? []
                        }
                        props={{
                          isLoading: isFetchingStage,
                          isClearable: true,
                          onChange: (e) => {
                            props.setFieldValue(`stageId`, (e as any)?.value ?? "");
                            props.setFieldValue(`classId`, undefined);
                            setStageId((e as any)?.value ?? "");
                            setClassId(undefined);
                            setSectionId(undefined);
                          },
                        }}
                      />
                      {props.values?.stageId && (
                        <SelectForm
                          formikProps={props}
                          name={`classId`}
                          title={t("SectionSchedulePage.ClassName")}
                          placeholder={t("SectionSchedulePage.select-ClassName")}
                          options={
                            stage
                              ? stage
                                  .find((item) => item.id === props.values?.stageId)
                                  ?.Class?.map((item) => {
                                    return {
                                      label: t(item.name as any),
                                      value: item.id,
                                    };
                                  }) || []
                              : []
                          }
                          props={{
                            isLoading: isFetchingStage,
                            isClearable: true,
                            onChange: (e) => {
                              const value = (e as any)?.value ?? "";
                              props.setFieldValue(`classId`, value);
                              props.setFieldValue(`sectionId`, undefined);
                              setClassId(value);
                              setSectionId(undefined);
                            },
                          }}
                        />
                      )}
                      {props?.values?.classId && (
                        <SelectForm
                          formikProps={props}
                          name={`sectionId`}
                          title={t("SectionSchedulePage.SectionName")}
                          placeholder={t("SectionSchedulePage.select-SectionName")}
                          options={
                            stage
                              ? stage
                                  .find((item) => item.id === props?.values?.stageId)
                                  ?.Class?.find((item) => item.id === props?.values?.classId)
                                  ?.Section?.map((item) => {
                                    return {
                                      label: t(item.name as any),
                                      value: item.id,
                                    };
                                  }) || []
                              : []
                          }
                          props={{
                            isLoading: isFetchingStage,
                            isClearable: true,
                            onChange: (e) => {
                              props.setFieldValue(`sectionId`, (e as any)?.value ?? "");
                              setSectionId((e as any)?.value ?? "");
                            },
                          }}
                        />
                      )}

                      <div className="text-base font-semibold text-black dark:text-white-dark my-2">
                        <CheckBoxFormWithCustom formikProps={props} name="allStudentsThisASectionsORClasses" title={t("NotificationPage.allStudentsThisASectionsORClasses")} />
                      </div>
                    </>
                  </div>

                  <>
                    {isFetchingUserGetDataForAdmin ? (
                      <div className="flex justify-center">
                        <div className="loader !bg-primary !w-8 !h-8" />
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-col gap-2">
                          {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                            dataUserGetData
                              // ?.filter((item) => !OtherPaymentData?.data.some((inst) => inst.StudentEnrollment.id === item.studentEnrollmentId))
                              ?.map((item, index) => (
                                <div className="Card !p-3" key={item.studentEnrollmentId}>
                                  {/* Use item.value for key if it's unique */}
                                  <CheckBoxForm
                                    key={index}
                                    formikProps={props}
                                    name={`studentEnrollmentIds.${index}`}
                                    title={`${item.fullName}`}
                                    props={{
                                      checked: props.values.studentEnrollmentIds.some((it: any) => it == item.studentEnrollmentId),
                                      value: props.values.studentEnrollmentIds.some((it: any) => it == item.studentEnrollmentId),
                                      onChange: (e) => {
                                        if (e.target.checked) {
                                          let newValues = props.values.studentEnrollmentIds.concat(item.studentEnrollmentId);
                                          props.setFieldValue(`studentEnrollmentIds`, newValues);
                                        } else {
                                          let newValues = props.values.studentEnrollmentIds.filter((it: any) => it != item.studentEnrollmentId);
                                          props.setFieldValue(`studentEnrollmentIds`, newValues);
                                        }
                                      },
                                    }}
                                  />
                                </div>
                              ))}
                        </div>
                      </>
                    )}
                  </>
                </>
              )}

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm props={{ type: "submit" }} title={t("common.save")} isLoading={isCreating || isUpdating} />
              </div>
            </Form>
          )}
        </Formik>
      )}
    </div>
  );
};

export default PageComponent;
