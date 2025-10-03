"use client";

import React, { useState } from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends AddInstallmentPayload {
  allStudentsThisASectionsORClasses?: "TRUE" | "FALSE";
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputCurrencyMaskForm, InputForm } from "@/components/Form/inputForm";
import {
  AddInstallmentPayload,
  useInstallmentCreateMutation,
  useInstallmentGetDataQuery,
  useInstallmentUpdateMutation,
  useLazyInstallmentGetDataByIdQuery,
} from "@/services/admin/Installment";
import { useSchoolYearGetDataQuery } from "@/services/SchoolYear";
import { useSettingGetDataQuery } from "@/services/Setting";
import { useStudentListQuery } from "@/services/admin/studentEnrollment";
import { useStageGetDataQuery } from "@/services/admin/stage";
import { SelectForm } from "@/components/Form/SelectForm";
import { CheckBoxForm, CheckBoxFormWithCustom } from "@/components/Form/CheckBoxForm";
import { DateTimeForm } from "@/components/Form/DateTimeForm";
import { useAdminDiscountGetDataQuery } from "@/services/admin/discount";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [InstallmentGetDataById, { currentData: data, isFetching }] = useLazyInstallmentGetDataByIdQuery();
  useEffect(() => {
    if (id) {
      InstallmentGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const [InstallmentCreate, { isLoading: isLoadingInstallmentCreate }] = useInstallmentCreateMutation();
  const [InstallmentUpdate, { isLoading: isLoadingInstallmentUpdate }] = useInstallmentUpdateMutation();

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {
      if (id) {
        // console.log({
        //   numberOfInstallments: Number(values.numberOfInstallments),
        //   totalAmount: Number(values.totalAmount),
        //   installmentAmount: Number(values.installmentAmount),
        //   daysBetweenInstallments: Number(values.daysBetweenInstallments),
        //   discountId: values.discountId,
        //   notes: values.notes,
        //   startDate: values.startDate,
        //   studentEnrollmentIds: values.allStudentsThisASectionsORClasses == "TRUE" ? dataUserGetData?.map((item) => item.studentEnrollmentId) ?? [] : values.studentEnrollmentIds,
        //   title: values.title,
        //   isActive: values.isActive,
        // });

        await InstallmentUpdate({
          body: {
            numberOfInstallments: Number(values.numberOfInstallments),
            totalAmount: Number(values.totalAmount),
            installmentAmount: Number(values.installmentAmount),
            daysBetweenInstallments: Number(values.daysBetweenInstallments),
            discountId: values.discountId,
            notes: values.notes,
            startDate: values.startDate,
            title: values.title,
            isActive: values.isActive,
          },
          id: String(id),
        }).unwrap();
      } else {
        await InstallmentCreate({
          numberOfInstallments: Number(values.numberOfInstallments),
          totalAmount: Number(values.totalAmount),
          installmentAmount: Number(values.installmentAmount),
          daysBetweenInstallments: Number(values.daysBetweenInstallments),
          discountId: values.discountId,
          notes: values.notes,
          startDate: values.startDate,
          studentEnrollmentIds: values.allStudentsThisASectionsORClasses == "TRUE" ? dataUserGetData?.map((item) => item.studentEnrollmentId) ?? [] : values.studentEnrollmentIds,
          title: values.title,
        }).unwrap();
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000 });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message) {
          return toast.error(t(error.message), { autoClose: 30000 });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const installmentSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    numberOfInstallments: Yup.number().min(1, t("common.must-min-is-one")).required(t("common.this-field-is-required")),
    totalAmount: Yup.number().min(0, t("common.must-min-is-one")).required(t("common.this-field-is-required")),
    installmentAmount: Yup.number().min(0, t("common.must-min-is-one")).required(t("common.this-field-is-required")),
    daysBetweenInstallments: Yup.number().min(1, t("common.must-min-is-one")).required(t("common.this-field-is-required")),
    startDate: Yup.string().required(t("common.this-field-is-required")),
    // discountId: Yup.string().required(t("common.this-field-is-required")),
    ...(!id && {
      studentEnrollmentIds: Yup.array()
        // must be at least one
        .min(1, t("common.must-min-is-one"))
        .of(Yup.string().required(t("common.this-field-is-required")))
        .required(t("common.this-field-is-required")),
    }),
  });

  const { currentData: SchoolYear, isFetching: isFetchingSchoolYear } = useSchoolYearGetDataQuery();
  const { currentData: Setting, isFetching: isFetchingSetting } = useSettingGetDataQuery();
  const [searchUser, setSearchUser] = useState("");
  const [schoolYearId, setSchoolYearId] = useState<string | undefined>(Setting?.CurrentSchoolYear?.id ?? "");
  const [stageId, setStageId] = useState<string | undefined>(undefined);
  const [classId, setClassId] = useState<string | undefined>(undefined);
  const [sectionId, setSectionId] = useState<string | undefined>(undefined);

  const { currentData: dataUserGetData, isFetching: isFetchingUserGetDataForAdmin } = useStudentListQuery({
    // search: searchUser,
    schoolYearId: schoolYearId,
    stageId: stageId,
    classId: classId,
    sectionId: sectionId,
  });
  useEffect(() => {
    setSchoolYearId(Setting?.CurrentSchoolYear?.id ?? "");
  }, [Setting?.CurrentSchoolYear?.id]);

  const { currentData: stage, isFetching: isFetchingStage } = useStageGetDataQuery();
  const [searchDiscount, setSearchDiscount] = useState<string | undefined>(undefined);
  const { currentData: discounts, isFetching: isFetchingDiscounts } = useAdminDiscountGetDataQuery({
    skip: 1,
    take: 100,
    search: searchDiscount,
  });

  const { isFetching: isFetchingInstallment, currentData: installmentData } = useInstallmentGetDataQuery({
    skip: 1,
    take: 30,
  });

  // console.log(dataUserGetData);
  // console.log(installmentData?.data);
  // console.log(dataUserGetData?.filter((item) => !installmentData?.data.some((inst) => inst.StudentEnrollment.id === item.studentEnrollmentId)));

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t(id ? "InstallmentPage.update-info" : "InstallmentPage.add")} />

        {isFetching || isFetchingSchoolYear || isFetchingSetting ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              title: data?.title ?? "",
              numberOfInstallments: data?.numberOfInstallments ?? 0,
              totalAmount: data?.totalAmount ?? 0,
              installmentAmount: data?.installmentAmount ?? 0,
              notes: data?.notes ?? "",
              studentEnrollmentIds: data?.StudentEnrollment.id ? [data?.StudentEnrollment.id] : [],
              discountId: data?.discountId ?? "",
              daysBetweenInstallments: data?.daysBetweenInstallments ?? 0,
              startDate: data?.startDate ?? "",
              isActive: data?.isActive ?? false,
            }}
            validationSchema={installmentSchema}
            onSubmit={handleSubmit}>
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card flex flex-col gap-1">
                  <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">{t("InstallmentPage.InstallmentInformation")}</div>
                  {!!id && (
                    <CheckBoxForm
                      formikProps={props}
                      name={"isActive"}
                      title={t("common.isActive")}
                      props={{
                        checked: props.values.isActive,
                        value: props.values.isActive,
                        onChange: (e) => {
                          props.setFieldValue("isActive", e.target.checked);
                        },
                      }}
                    />
                  )}
                  <InputForm formikProps={props} name={"title"} title={t("InstallmentPage.title")} placeholder={t("InstallmentPage.enter-title")} />
                  <InputForm
                    formikProps={props}
                    name={"numberOfInstallments"}
                    title={t("InstallmentPage.numberOfInstallments")}
                    placeholder={t("InstallmentPage.enter-numberOfInstallments")}
                    props={{
                      type: "number",
                      min: 0,
                    }}
                  />
                  <InputForm
                    formikProps={props}
                    name={"daysBetweenInstallments"}
                    title={t("InstallmentPage.daysBetweenInstallments")}
                    placeholder={t("InstallmentPage.enter-daysBetweenInstallments")}
                    props={{
                      type: "number",
                      min: 0,
                    }}
                  />
                  <DateTimeForm formikProps={props} name={"startDate"} title={t("InstallmentPage.startDate")} placeholder={t("InstallmentPage.enter-startDate")} />
                  <SelectForm
                    formikProps={props}
                    name={"discountId"}
                    title={t("InstallmentPage.discount")}
                    placeholder={t("InstallmentPage.enter-discount")}
                    options={
                      discounts?.data.map((item) => {
                        return {
                          label: item.title,
                          value: item.id,
                        };
                      }) || []
                    }
                    props={{
                      isLoading: isFetchingDiscounts,
                      onChange: (e) => {
                        props.setFieldValue("discountId", (e as any)?.value ?? "");
                      },
                      isClearable: true,
                      onInputChange: (text, _) => {
                        setSearchDiscount(text);
                      },
                    }}
                  />
                  <InputCurrencyMaskForm
                    formikProps={props}
                    name={"totalAmount"}
                    title={t("InstallmentPage.totalAmount")}
                    placeholder={t("InstallmentPage.enter-totalAmount")}
                    iconRight={<span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>}
                  />
                  {/* <InputCurrencyMaskForm
                    formikProps={props}
                    name={"installmentAmount"}
                    title={t("InstallmentPage.installmentAmount")}
                    placeholder={t("InstallmentPage.enter-installmentAmount")}
                    iconRight={<span className="font-bold text-teal-500 bg-teal-500/20 h-full justify-center items-center rounded-md flex text-xs px-1">{t("IQD")}</span>}
                  /> */}
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
                      {isFetchingUserGetDataForAdmin && isFetchingInstallment ? (
                        <div className="flex justify-center">
                          <div className="loader !bg-primary !w-8 !h-8" />
                        </div>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {props.values.allStudentsThisASectionsORClasses !== "TRUE" &&
                            dataUserGetData
                              ?.filter((item) => !installmentData?.data.some((inst) => inst.StudentEnrollment.id === item.studentEnrollmentId))
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
                      )}
                    </>
                  </>
                )}

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingInstallmentUpdate || isLoadingInstallmentCreate}
                  />
                </div>
              </Form>
            )}
          </Formik>
        )}
      </div>
    </>
  );
};

export default PageComponent;
