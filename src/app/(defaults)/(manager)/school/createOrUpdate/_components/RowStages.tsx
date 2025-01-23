import { OptionType, SelectForm } from '@/components/Form/SelectForm';
import { ListClasses, ListStages } from '@/utils/Data';
import { FieldArray } from 'formik';
import React from 'react'
import RowSections from './RowSections';
import { InputForm } from '@/components/Form/inputForm';
import { CheckBoxForm } from '@/components/Form/CheckBoxForm';
import { sections } from './PageComponent';

const RowStages = ({
    t,
    props,
}: {
    t: any,
    props: any,

}) => {
    return (
        <div className="Card">
            <div className="text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                {t('SchoolPage.Stages')}
            </div>
            <FieldArray name="StageData">
                {({ insert, remove, push, replace }) => (
                    <div className={'flex flex-col gap-2'}>
                        {props.values.StageData?.map((item: any, index: number) => {
                            return (
                                <div
                                    className={'border rounded-md p-4 border-[#7070701f]'}
                                    key={index}
                                >

                                    <div className='flex justify-between items-start'>
                                        <SelectForm
                                            className='w-full'
                                            formikProps={props}
                                            name={`StageData.${index}.name`}
                                            title={t("SchoolPage.StageName")}
                                            placeholder={t("SchoolPage.selectStage")}
                                            options={
                                                ListStages.map((item) => {
                                                    return {
                                                        label: t(item.label as any),
                                                        value: item.value
                                                    }
                                                }
                                                )
                                            }
                                            props={{
                                                onChange: (val) => {
                                                    const value = (val as OptionType)?.value;
                                                    props.setFieldValue(`StageData.${index}.name`, value);

                                                },
                                            }}
                                        />
                                        <button
                                            className='hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded  font-bold'
                                            type="button" onClick={() => {

                                                remove(index)

                                            }}>
                                            X
                                        </button>
                                    </div>


                                    <div className="p-1">
                                        <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                                            {t('SchoolPage.Classes')}
                                        </div>
                                        <FieldArray name={`StageData.${index}.ClassData`}>
                                            {({ insert, remove, push, replace }) => (
                                                <div className={'flex flex-col gap-2'}>
                                                    {
                                                        props.values.StageData[index].ClassData?.map((_: any, idx: number) => {
                                                            return (
                                                                <div
                                                                    className={'border rounded-md p-4 border-[#7070701f]'}
                                                                    key={idx}
                                                                >
                                                                    <div className='flex justify-between items-start'>
                                                                        <InputForm
                                                                            className='w-full'
                                                                            formikProps={props}
                                                                            name={`StageData.${index}.ClassData.${idx}.name`}
                                                                            title={t("SchoolPage.ClassName")}
                                                                            placeholder={t("SchoolPage.enter-ClassName")}

                                                                        />
                                                                        <button
                                                                            className='hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded  font-bold'
                                                                            type="button" onClick={() => {

                                                                                remove(idx)

                                                                            }}>
                                                                            X
                                                                        </button>

                                                                    </div>
                                                                    <div className="py-1 text-base font-semibold text-black dark:text-white-dark  mb-2 ">
                                                                        {t('SchoolPage.sections')}
                                                                    </div>

                                                                    <RowSections
                                                                        props={props}
                                                                        index={index}
                                                                        idx={idx}
                                                                        t={t}
                                                                    />
                                                                </div>
                                                            );
                                                        })}
                                                    {
                                                        props.values.StageData[index].ClassData.length < 6 &&
                                                        <div className="flex justify-end gap-2">
                                                            <button type="button"
                                                                className=" bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                                                                onClick={() => push({
                                                                    id: Math.random(),
                                                                    name: "",
                                                                    sections: sections

                                                                })}>
                                                                {t('common.add')}
                                                            </button>

                                                        </div>}
                                                </div>
                                            )}
                                        </FieldArray>
                                    </div>
                                </div>
                            );
                        })}
                        {props.values.StageData.length < 3 && <div className="flex justify-end gap-2">
                            <button type="button"
                                className=" bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                                onClick={() =>
                                    push({
                                        id: Math.random(),
                                        name: "",
                                        "ClassData": [
                                            {
                                                "id": 1,
                                                "name": ""
                                            }
                                        ]
                                    })
                                }>
                                {t('common.add')}
                            </button>

                        </div>
                        }
                    </div>
                )}
            </FieldArray>
        </div>
    )
}

export default RowStages