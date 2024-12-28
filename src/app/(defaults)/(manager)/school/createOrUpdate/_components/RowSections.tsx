import { CheckBoxForm } from '@/components/Form/CheckBoxForm';
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
        <div className='flex gap-4'>
            {sections.map((section) => (
                <CheckBoxForm
                    key={section.title}
                    formikProps={props}
                    name={`StageData.${index}.ClassData.${idx}.${section.title}`}
                    title={t(`${section.title}`)}
                    props={{
                        onChange: (e) => {
                            props.setFieldValue(`StageData.${index}.ClassData.${idx}.${section.title}`, e.target.checked);
                        },
                        checked: props.values.StageData[index].ClassData[idx][section.title],
                        value: String(props.values.StageData[index].ClassData[idx][section.title]),
                    }}
                />
            ))}
        </div>
    );
}

export default RowSections