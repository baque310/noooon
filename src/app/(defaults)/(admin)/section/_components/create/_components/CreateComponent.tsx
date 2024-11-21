"use client"

import React from 'react';
import useLogic, { FormValues } from './_logic';
import { Form, Formik, FormikProps } from 'formik';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { InputForm } from '@/components/Form/inputForm';
import { LoadingForm } from '@/components/Form/loadingForm';

const CreateComponent = ({
  open,
  setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const {
    t,
    schoolSchema,
    handleSubmit,
    isLoadingSectionUpdate,
    classData,
    isFetchingClass,
    data,
    isFetching,
    id

  } = useLogic();


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
            isActive : data?.isActive ?? ""

          }}
          validationSchema={schoolSchema}
          onSubmit={(values, formikHelpers) => {
            handleSubmit(values, formikHelpers, setOpen)

          }}
        >
          {(props: FormikProps<any>) => (
            <Form className={"flex flex-col gap-4"}>
              <InputForm
                formikProps={props}
                name={"name"}
                title={t("SectionPage.name")}
                placeholder={t("SectionPage.enter-name")}

              />
              {id ?
              <SelectForm
                formikProps={props}
                name={"isActive"}
                title={t("common.status")}
                placeholder={t("common.choses-status")}
                options={[
                  {
                    label: t("common.isActive"),
                    value: "true"
                  },
                  {
                    label: t("common.isNotActive"),
                    value: "false"
                  }
                ]}
                props={{
                  isClearable: true,
                  onChange: (e) => {
                    props.setFieldValue("isActive", (e as any)?.value ?? "")
                  }
                }}
              />
              
              :<SelectForm
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
                  isLoading={isLoadingSectionUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

