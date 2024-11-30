
import React from 'react'
 import { FieldArray, Form, Formik, FormikProps } from 'formik';
import { InputForm } from '@/components/Form/inputForm';
import { ButtonForm } from '@/components/Form/ButtonForm';
import { FormValuesMulti } from './PageComponent';


const MuiltAdd = ({
  t,
  studentSchemaMulti,
  handleSubmitMulti,
  isLoadingStudentCreateMulti,
}: {
  t: any,
  studentSchemaMulti: any,
  handleSubmitMulti: any,
  isLoadingStudentCreateMulti: any

}) => {

  return (
    <Formik<FormValuesMulti>
      initialValues={{
        studentsData: [
          {
            id: Math.random(),
            fullName: "",
            phone1: "",

          }
        ]
      }}
      validationSchema={studentSchemaMulti}
      onSubmit={handleSubmitMulti}
    >
      {(props: FormikProps<any>) => (
        <Form className={"px-4 flex flex-col gap-4"}>
          <div className="Card flex flex-col gap-1">
            <div className=" text-base font-semibold text-black dark:text-white-dark  mb-2 ">
              {t("StudentPage.infoStudent")}
            </div>
            <FieldArray name="studentsData">
              {({ insert, remove, push, replace }) => (
                <div className={'flex flex-col gap-2'}>
                  {props.values.studentsData?.map((item: any, index: number) => {
                    return (
                      <div
                        className={'border rounded-md p-4 border-[#7070701f]'}
                        key={index}
                      >
                        <div className='flex justify-end relative pb-1'>
                          <button
                            className='absolute hover:bg-danger/10 border-danger/70 text-danger/70  hover:scale-[1.01] transition-transform py-[2px] px-2  rounded  font-bold'
                            type="button" onClick={() => {

                              remove(index)

                            }}>
                            X
                          </button>
                        </div>
                        <InputForm
                          className='w-full'
                          formikProps={props}
                          name={`studentsData.${index}.fullName`}
                          title={t("StudentPage.fullName")}
                          placeholder={t("StudentPage.enter-fullName")}

                        />
                        <InputForm
                          className='w-full'
                          formikProps={props}
                          name={`studentsData.${index}.phone1`}
                          title={t("StudentPage.phone1")}
                          placeholder={t("StudentPage.enter-phone1")}
                        />

                      </div>
                    );
                  })}
                  <div className="flex justify-end gap-2">
                    <button type="button"
                      className=" bg-secondary/10 hover:bg-secondary/20 border-secondary/70 text-secondary/70 hover:scale-[1.01] transition-transform py-1 px-2   rounded border"
                      onClick={() =>
                        push({
                          id: Math.random(),
                          fullName: "",
                          phone1: "",

                        })
                      }>
                      {t('common.add')}
                    </button>

                  </div>

                </div>
              )}
            </FieldArray>

          </div>

          <div className="flex flex-row-reverse gap-2">
            <ButtonForm
              props={{
                type: "submit",

              }}
              title={t("common.save")}
              isLoading={isLoadingStudentCreateMulti}
            />
          </div>
        </Form>
      )}
    </Formik>
  )
}

export default MuiltAdd