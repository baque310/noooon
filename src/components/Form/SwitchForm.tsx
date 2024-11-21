import { Field, FormikProps, FormikValues } from 'formik';
import React, { ReactNode } from 'react';

// Assuming you want to make this component generic for any form values
interface SwitchFormProps<T = FormikValues> {
    formikProps: FormikProps<T>;
    name: keyof T & string;
    title: string;
    placeholder: string;
    icon?: ReactNode;
    props?: React.InputHTMLAttributes<HTMLInputElement>;
    className?: string;
}

export const SwitchForm = <T extends FormikValues>({
    formikProps,
    name,
    title,
    placeholder,
    icon,
    props,
    className
}: SwitchFormProps<T>): React.ReactElement => {
    let pathArr = name.split('.');
    let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
    let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);

    return (
        <div
            className={`w-fit flex gap-2 items-center ${formikProps.submitCount ? (errorValue && touchedValue ? 'has-error' : '') : ''}`}>
            <label className='font-normal !m-0' htmlFor={name}>{title}</label>
            <div className={"relative w-full"}>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>
                <label className="w-12 h-6 relative !m-0 ">
                    <Field {...props} type="checkbox" name={name} id={name} placeholder={placeholder} className="custom_switch absolute w-full h-full opacity-0 z-10 cursor-pointer peer" />
                    <span className="bg-[#ebedf2] dark:bg-dark block h-full rounded-full before:absolute before:left-1 before:bg-white dark:before:bg-white-dark dark:peer-checked:before:bg-white before:bottom-1 before:w-4 before:h-4 before:rounded-full peer-checked:before:left-7 peer-checked:bg-primary before:transition-all before:duration-300"></span>
                </label> 
            </div>
            {formikProps.submitCount ?
                (errorValue && touchedValue ?
                    <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></>
                )
                :
                <> </>
            }
        </div>
    );
};
