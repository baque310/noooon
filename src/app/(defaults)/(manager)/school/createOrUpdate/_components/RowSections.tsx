import { CheckBoxForm } from '@/components/Form/CheckBoxForm';
import { FieldArray } from 'formik';
import React from 'react'

const RowSections = ({
    props,
    index,
    idx,
    t
}: {
    props: any,
    index: number,
    idx: number,
    t: any
}) => {

    const sections = [
        // { key: 'SectionA', title: 'A' },
        // { key: 'SectionB', title: 'B' },
        // { key: 'SectionC', title: 'C' },
        // { key: 'SectionD', title: 'D' },
        // { key: 'SectionE', title: 'E' },
        // { key: 'SectionF', title: 'F' },

        { title: 'أ' },
        { title: 'ب' },
        { title: 'ج' },
        { title: 'د' },
        { title: 'و' },
    ];

    return (
        <>
            <FieldArray name={`StageData.${index}.ClassData.${idx}.sections`}>
                {() => (
                    <div className={'flex gap-4'}>
                        {
                            props.values.StageData[index].ClassData[idx].sections?.map((item: any, idx2: number) => {
                                return (

                                    <CheckBoxForm
                                        key={idx2}
                                        className='w-full'
                                        formikProps={props}
                                        name={`StageData.${index}.ClassData.${idx}.sections.${idx2}.value`}
                                        title={item.label ?? ""}
                                        props={
                                            {
                                                onChange: (val) => {
                                                    const value = val.target.checked;
                                                    props.setFieldValue(`StageData.${index}.ClassData.${idx}.sections.${idx2}.value`, value);

                                                },
                                            }
                                        }
                                    />
                                );
                            })}

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
}

export default RowSections