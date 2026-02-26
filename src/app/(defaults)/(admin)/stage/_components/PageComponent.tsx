"use client"
import React from 'react';
import { Form, Formik, FormikProps } from 'formik';
import { RolePageAndActionBasedComponent } from '@/components/Provider/RolePageAndActionBasedComponent';
import { ButtonForm } from '@/components/Form/ButtonForm';
import Model from '@/components/Model';
import { SelectForm } from '@/components/Form/SelectForm';
import { ListStages } from '@/utils/Data';
import { getTranslation } from "@/ni18n/i18n";
import { useStageCreateMutation } from "@/services/admin/stage";
import { FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import * as Yup from 'yup';
export interface FormValues {
  name: string
}

const PageComponent = ({
  open,
  setOpen
}: {
  open: boolean,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>
}
) => {

  const { t } = getTranslation();
  const router = useRouter();


  const [StageCreate, { isLoading: isLoadingStageCreate }] = useStageCreateMutation();

  const handleSubmit = async (
    values: FormValues, { setSubmitting, resetForm }: FormikHelpers<FormValues>) => {
    try {

      await StageCreate({
        name: values.name,

      }).unwrap()

      toast.success(t("common.added-successfully"), { autoClose: 30000, });
      resetForm();
  

    } catch (error: any) {
      console.error("Failed to operation :", error);
      if (error) {
        if (error.message == "name already exist") {
          return toast.error(t('StagePage.name-already-exists'), { autoClose: 30000 });
        }

        return toast.error(JSON.stringify(error), { autoClose: 30000 });
      }
      toast.error(error, { autoClose: 30000 });
    }
  };
  const schoolSchema = Yup.object().shape({
    name: Yup.string().required(t("common.this-field-is-required")),
  });


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
                        isLoading={isLoadingStageCreate}
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

