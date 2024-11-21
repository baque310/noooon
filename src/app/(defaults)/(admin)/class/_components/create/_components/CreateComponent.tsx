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
    isLoadingClassUpdate,
    stage,
    isFetchingStage,
    data,
    isFetching,
    id

  } = useLogic();


  return (
    <Model title={t(id ? "ClassPage.update" : "ClassPage.add")}
      open={open}
      setOpen={setOpen}
    >
      {isFetching ? (
        <LoadingForm className='!h-36' />
      ) : (
        <Formik<FormValues>
          initialValues={{
            name: data?.name ?? "",
            stageId: data?.stageId ?? ""

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
                title={t("ClassPage.name")}
                placeholder={t("ClassPage.enter-name")}

              />
              {!id && <SelectForm
                formikProps={props}
                name={"stageId"}
                title={t("ClassPage.StageName")}
                placeholder={t("ClassPage.enter-StageName")}
                options={stage?.map((item) => {
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
                    props.setFieldValue("stageId", (e as any)?.value ?? "")
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
                  isLoading={isLoadingClassUpdate}
                />
              </div>
            </Form>
          )}
        </Formik>)}
    </Model>
  );
};

export default CreateComponent

