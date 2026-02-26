import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
import { InputForm } from "@/components/Form/inputForm";
import { FieldArray } from "formik";
import React from "react";

const RowSections = ({
  props,
  index,
  idx,
  t,
}: {
  props: any;
  index: number;
  idx: number;
  t: any;
}) => {
  return (
    <>
      <FieldArray name={`StageData.${index}.ClassData.${idx}.sections`}>
        {() => (
          <div className={"grid grid-cols-2 gap-4"}>
            {props.values.StageData[index].ClassData[idx].sections?.map(
              (item: any, idx2: number) => {
                return (
                  <InputForm
                    key={idx2}
                    className="w-full"
                    placeholder={
                      t("StudentEnrollmentPage.enter-SectionName") +
                      ` ${idx2 + 1}`
                    }
                    formikProps={props}
                    name={`StageData.${index}.ClassData.${idx}.sections.${idx2}.value`}
                    title={t("SchoolPage.SectionName") + ` ${idx2 + 1}`}
                    props={{
                      onChange: (val) => {
                        const value = val.target.value;
                        props.setFieldValue(
                          `StageData.${index}.ClassData.${idx}.sections.${idx2}.value`,
                          value
                        );
                      },
                    }}
                  />
                );
              }
            )}
          </div>
        )}
      </FieldArray>
      {/* <div className='flex gap-4'>
                {sections.map((section) => (
                    <CheckBoxForm
                        key={section.title}
                        formikProps={props}
                        name={`StageData.${index}.ClassData.${idx}.section`}
                        title={t(`${section.title}`)}
                        props={{
                            onChange: (e) => {
                                if (e.target.checked) {
                                    props.setFieldValue(`StageData.${index}.ClassData.${idx}.section`, section.title);

                                } else {
                                    props.setFieldValue(`StageData.${index}.ClassData.${idx}.section`, '');
                                }
                                console.log("props.", props.values.StageData[index].ClassData);

                            },
                            // checked: props.values.StageData[index].ClassData[idx].section === section.title,
                            // value: section.title,
                        }}
                    />
                ))}
            </div> */}
    </>
  );
};

export default RowSections;
