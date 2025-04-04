"use client";

import React, { useState } from "react";
import { BackButton } from "@/components/common/BackButton";

import { getTranslation } from "@/ni18n/i18n";
import { FormikHelpers } from "formik";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from "yup";
export interface FormValues extends NotificationToAll {
  all: string;
}
import { ButtonForm } from "@/components/Form/ButtonForm";
import { Form, Formik, FormikProps } from "formik";
import { InputForm } from "@/components/Form/inputForm";
import {
  NotificationToAll,
  useNotificationSendForManyAllForAdminMutation,
  useNotificationSendToAllForAdminMutation,
} from "@/services/Notification";
import {
  CheckBoxForm,
  CheckBoxFormWithCustom,
} from "@/components/Form/CheckBoxForm";
import { useUserGetDataQuery } from "@/services/Manager/User";

const PageComponent = () => {
  const { t } = getTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const title = searchParams.get("title") || "";
  const body = searchParams.get("body") || "";

  const [searchUser, setSearchUser] = useState("");
  const {
    currentData: dataUserGetData,
    isFetching: isFetchingUserGetDataForAdmin,
  } = useUserGetDataQuery({
    skip: 1,
    take: 100,
    search: searchUser,
  });

  const [NotificationSendToAll, { isLoading: isLoadingNotificationSendToAll }] =
    useNotificationSendToAllForAdminMutation();
  const [
    NotificationSendForMany,
    { isLoading: isLoadingNotificationSendForMany },
  ] = useNotificationSendForManyAllForAdminMutation();

  const handleSubmit = async (
    values: FormValues,
    { setSubmitting, resetForm }: FormikHelpers<FormValues>
  ) => {
    try {
      if (values.all == "TRUE") {
        await NotificationSendToAll({
          title: values.title,
          body: values.body,
        }).unwrap();
      } else {
        await NotificationSendForMany({
          title: values.title,
          body: values.body,
          userIds: values.userIds,
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
        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };

  const notificationSchema = Yup.object().shape({
    title: Yup.string().required(t("common.this-field-is-required")),
    body: Yup.string().required(t("common.this-field-is-required")),
  });

  return (
    <>
      <div className="mx-auto my-0 max-md:max-w-[100%] md:max-w-[50%]">
        <BackButton
          title={t(
            id ? "NotificationPage.update-info" : "NotificationPage.add"
          )}
        />
        <Formik<FormValues>
          initialValues={{
            all: "FALSE",
            userIds: [],
            title: title,
            body: body,
          }}
          validationSchema={notificationSchema}
          onSubmit={handleSubmit}
        >
          {(props: FormikProps<any>) => (
            <Form className={"px-4 flex flex-col gap-4"}>
              <div className="Card flex flex-col gap-1">
                <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                  {t("NotificationPage.NotificationInformation")}
                </div>
                <InputForm
                  formikProps={props}
                  name={"title"}
                  title={t("NotificationPage.title")}
                  placeholder={t("NotificationPage.enter-title")}
                />

                <InputForm
                  formikProps={props}
                  name={"body"}
                  title={t("NotificationPage.body")}
                  placeholder={t("NotificationPage.enter-body")}
                  props={{
                    ...({ as: "textarea" } as any),
                  }}
                />
              </div>

              <>
                <div className="Card">
                  <div className="text-base font-semibold text-black dark:text-white-dark mb-2">
                    <CheckBoxFormWithCustom
                      formikProps={props}
                      name="all"
                      title={t("NotificationPage.allowedAllUsers")}
                    />
                  </div>
                  {props.values.all !== "TRUE" && (
                    <InputForm
                      formikProps={props}
                      name={"searchUser"}
                      title={t("")}
                      placeholder={t("common.search")}
                      props={{
                        onChange: (e) => {
                          setSearchUser(e.target.value);
                          props.setFieldValue("searchUser", e.target.value);
                        },
                      }}
                    />
                  )}
                </div>
                {props.values.all !== "TRUE" && (
                  <>
                    {isFetchingUserGetDataForAdmin ? (
                      <div className="flex justify-center">
                        <div className="loader !bg-primary !w-8 !h-8" />
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        {dataUserGetData?.data.map((item, index) => (
                          <div className="Card !p-3" key={item.id}>
                            {/* Use item.value for key if it's unique */}
                            <CheckBoxForm
                              key={index}
                              formikProps={props}
                              name={`userIds.${index}`}
                              title={`${item.username}`}
                              props={{
                                checked: props.values.userIds.some(
                                  (it: any) => it == item.id
                                ),
                                value: props.values.userIds.some(
                                  (it: any) => it == item.id
                                ),
                                onChange: (e) => {
                                  if (e.target.checked) {
                                    let newValues = props.values.userIds.concat(
                                      item.id
                                    );
                                    props.setFieldValue(`userIds`, newValues);
                                  } else {
                                    let newValues = props.values.userIds.filter(
                                      (it: any) => it != item.id
                                    );
                                    props.setFieldValue(`userIds`, newValues);
                                  }
                                },
                              }}
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>

              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                  }}
                  title={t("common.save")}
                  isLoading={
                    isLoadingNotificationSendForMany ||
                    isLoadingNotificationSendToAll
                  }
                />
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </>
  );
};

export default PageComponent;
