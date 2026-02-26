"use client";

import React from "react";
import { LoadingForm } from "@/components/Form/loadingForm";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import {
  AddBusPayload,
  useLazyBusGetDataByIdQuery,
  useBusUpdateMutation,
  BusConnectStudentBusPayload,
  useBusConnectStudentBusMutation,
} from "@/services/admin/bus";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends BusConnectStudentBusPayload {}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import { UploadFileForm } from "@/components/Form/uploadFileForm";
import { useStudentGetDataQuery } from "@/services/admin/student";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [BusGetDataById, { currentData: data, isFetching }] =
    useLazyBusGetDataByIdQuery();
  const [searchStudent, setSearchStudent] = useState("");
  useEffect(() => {
    if (id) {
      BusGetDataById({ id: String(id) }).then((data) => {
        if (!data.data) {
          router.back();
        }
      });
    }
  }, [id]);
  const { currentData: StudentData, isFetching: isFetchingStudent } =
    useStudentGetDataQuery({
      search: searchStudent,
      skip: 1,
      take: 100,
    });
  const [BusConnectStudentBus, { isLoading: isLoadingBusConnectStudentBus }] =
    useBusConnectStudentBusMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      await BusConnectStudentBus({
        busId: values.busId,
        studentIds: values.studentIds,
      }).unwrap();

      toast.success(t("common.added-successfully"), { autoClose: 30000 });
      resetForm();
      if (id) {
        router.back();
      }
    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "schoolBus already exist") {
          return toast.error(t("BusPage.bus-already-exists"), {
            autoClose: 30000,
          });
        }
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const busSchema = Yup.object().shape({
    studentIds: Yup.array().of(
      Yup.string().required(t("common.this-field-is-required"))
    ),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton title={t("BusPage.addStudents")} />

        {isFetching ? (
          <LoadingForm />
        ) : (
          <Formik<FormValues>
            initialValues={{
              busId: id as string,
              studentIds: [],
            }}
            validationSchema={busSchema}
            onSubmit={handleSubmit}
          >
            {(props: FormikProps<any>) => (
              <Form className={"px-4 flex flex-col gap-4"}>
                <div className="Card">
                  <div className=" text-sm font-semibold text-black dark:text-white-dark  mb-2 ">
                    {t("StudentEnrollmentPage.Students")}
                  </div>
                  <InputForm
                    formikProps={props}
                    name={"searchStudent"}
                    title={t("" as any)}
                    placeholder={t("common.search")}
                    props={{
                      onChange: (e) => {
                        setSearchStudent(e.target.value);
                        props.setFieldValue("searchStudent", e.target.value);
                      },
                    }}
                  />
                  <>
                    {isFetchingStudent ? (
                      <div className="flex justify-center my-2">
                        <div className="loader !bg-primary !w-10 !h-10" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1 py-2">
                        {StudentData?.data.map((item, index) => (
                          <div className="" key={item.id}>
                            <CheckBoxForm
                              key={index}
                              formikProps={props}
                              name={`studentIds.${index}`}
                              title={`${item.fullName}`}
                              props={{
                                className: "rtl",
                                checked: props.values.studentIds.some(
                                  (it: any) => it == item.id
                                ),
                                value: props.values.studentIds.some(
                                  (it: any) => it == item.id
                                ),
                                onChange: (e) => {
                                  if (e.target.checked) {
                                    let newValues =
                                      props.values.studentIds.concat(item.id);
                                    props.setFieldValue(
                                      `studentIds`,
                                      newValues
                                    );
                                  } else {
                                    let newValues =
                                      props.values.studentIds.filter(
                                        (it: any) => it != item.id
                                      );
                                    props.setFieldValue(
                                      `studentIds`,
                                      newValues
                                    );
                                  }
                                },
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                </div>

                <div className="flex flex-row-reverse gap-2">
                  <ButtonForm
                    props={{
                      type: "submit",
                    }}
                    title={t("common.save")}
                    isLoading={isLoadingBusConnectStudentBus}
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
