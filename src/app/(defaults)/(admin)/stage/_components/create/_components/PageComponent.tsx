"use client"


import React from 'react';

import _logic, { FormValues } from './_logic';
import { Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { RolePageAndActionBasedComponent } from '@/components/Provider/RolePageAndActionBasedComponent';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { ListStages } from '@/utils/Data';


const PageComponent = ({
  open,
  setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
) => {
  const { t,
    schoolSchema,
    handleSubmit,
    isLoadingStageUpdate,

  } = _logic();


  return (
    <Model title={t("StagePage.add")}
      open={open}
      setOpen={setOpen}
    >
      <Formik<FormValues>
        initialValues={{
          name: "",

        }}
        validationSchema={schoolSchema}
        onSubmit={handleSubmit}
      >
        {(props: FormikProps<any>) => (
          <Form className={"flex flex-col gap-4"}>
            <SelectForm
              formikProps={props}
              name={"name"}
              title={t("StagePage.name")}
              placeholder={t("StagePage.enter-name")}
              options={ListStages.map((item) => {
                return {
                  label: t(item.label as any),
                  value: item.value,
                };
              })}

            />
            <div className="flex flex-row-reverse gap-2">
              {
                <RolePageAndActionBasedComponent
                  component={(props) => {
                    return (
                      <ButtonForm
                        props={{
                          type: "submit",
                          className: `${props?.disabled && "hidden"} w-full`,
                        }}
                        title={t("common.save")}
                        isLoading={isLoadingStageUpdate}
                      />
                    );
                  }}
                  resource={"stage"}
                  permission={["update-any", "update-own"]}
                />
              }

            </div>
          </Form>
        )}
      </Formik>
    </Model>
  );
};

export default PageComponent

