"use client"

import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { LoadingForm } from '@/components/Form/loadingForm';
import { getTranslation } from "@/ni18n/i18n";
import { useClassGetDataQuery } from "@/services/admin/class";
import { useLazySectionGetDataByIdQuery, useSectionCreateMutation, useSectionUpdateMutation } from "@/services/admin/section";
import { FormikHelpers } from "formik";
import { useParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
  name: string
  classId: string
  isActive?: string
}
const CreateComponent = ({
  open,
  setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
) => {

  const { t } = getTranslation();
  const router = useRouter();


  const params = useParams()
  const { id } = params
  const [SectionGetDataById, { currentData: data, isFetching }] = useLazySectionGetDataByIdQuery()
  useEffect(() => {
    if (id) {
      SectionGetDataById({ id: String(id) })

    }
  }, [id])


  const [SectionCreate, { isLoading: isLoadingSectionCreate }] = useSectionCreateMutation();
  const [SectionUpdate, { isLoading: isLoadingSectionUpdate }] = useSectionUpdateMutation();
  const { currentData: classData, isFetching: isFetchingClass } = useClassGetDataQuery({});

  const handleSubmit = async (values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>, setOpen: any) => {
    try {
      if (id) {
        await SectionUpdate({
          id: id as string,
          body: {
            name: values.name,
            isActive: values.isActive as string,
          }

        }).unwrap()
      }
      else {
        await SectionCreate({
          name: values.name,
          classId: values.classId
        }).unwrap()
      }
      toast.success(t(id ? "common.updated-successfully" : "common.added-successfully"), { autoClose: 30000, });
      resetForm();
      setOpen(false)

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "section already exists" || error.message == "name already exist") {
          return toast.error(t('SectionPage.name-already-exists'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    name: Yup.string().required(t("common.this-field-is-required")),
    ...id ? {
      isActive: Yup.string().required(t("common.this-field-is-required")),
    } : {
      classId: Yup.string().required(t("common.this-field-is-required")),
    }
  });
  const sections = [
    { title: 'A' },
    { title: 'B' },
    { title: 'C' },
    { title: 'D' },
    { title: 'E' },
    { title: 'F' },
  ];

  return (
    <Model title={t(id ? "SectionPage.update" : "SectionPage.add")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            name: data?.name ?? "",
            classId: data?.classId ?? "",
            isActive: data?.isActive ?? "true"

          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen)

          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <SelectForm
                formikProps={props}
                name={"name"}
                title={t("SectionPage.name")}
                placeholder={t("SectionPage.enter-name")}
                options={sections.map(section => {
                  return {
                    value: section.title,
                    label: t(section.title as any)
                  }
                })}

              />
              {id ?
                // <SelectForm
                //   formikProps={props}
                //   name={"isActive"}
                //   title={t("common.status")}
                //   placeholder={t("common.choses-status")}
                //   options={[
                //     {
                //       label: t("common.isActive"),
                //       value: "true"
                //     },
                //     {
                //       label: t("common.isNotActive"),
                //       value: "false"
                //     }
                //   ]}
                //   props={{
                //     isClearable: true,
                //     onChange: (e) => {
                //       props.setFieldValue("isActive", (e as any)?.value ?? "")
                //     }
                //   }}
                // />
                <></>

                : <SelectForm
                  formikProps={props}
                  name={"classId"}
                  title={t("SectionPage.ClassName")}
                  placeholder={t("SectionPage.enter-ClassName")}
                  options={classData?.map((item) => {
                    return {
                      label: t(item.name as any),
                      value: item.id,
                    };
                  }) ?? []
                  }
                  props={{
                    isLoading: isFetchingClass,
                    isClearable: true,
                    onChange: (e) => {
                      props.setFieldValue("classId", (e as any)?.value ?? "")
                    }
                  }}
                />}
              <div className="flex flex-row-reverse gap-2">
                <ButtonForm
                  props={{
                    type: "submit",
                    className: `w-full`,
                  }}
                  title={t("common.save")}
                  isLoading={isLoadingSectionUpdate || isLoadingSectionCreate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

