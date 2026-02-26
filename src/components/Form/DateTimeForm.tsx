import { Field, FormikProps, FormikValues } from 'formik';
import { ReactNode } from 'react';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { useSelector } from 'react-redux';
import moment from 'moment';
import { IRootState } from '@/store';

interface DateTimeFormProps<T = FormikValues> {
    formikProps: FormikProps<T>;
    name: keyof T & string;
    title: string;
    placeholder: string;
    icon?: ReactNode;
    props?: React.InputHTMLAttributes<HTMLInputElement>;
    className?: string;
}

export const DateTimeForm = <T extends FormikValues>({
    formikProps,
    name,
    title,
    placeholder,
    icon,
    props,
    className
}: DateTimeFormProps<T>): React.ReactElement => {
    let pathArr = name.split('.');
    let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
    let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);

    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';
    const handleChange = (selectedDates: Date[], dateStr: string) => {
        // Assuming you want to set the first selected date in YYYY-MM-DD format
        if (selectedDates.length > 0) {
            formikProps.setFieldValue(name, selectedDates[0].toISOString().split('T')[0]);
        }
    };
    return (
        <div className={`w-full ${className} ${formikProps.submitCount && errorValue && touchedValue ? 'has-error' : ''}`}>
            <label className='font-normal' htmlFor={name}>{title}</label>
            <div className="relative w-full">
                {icon && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">{icon}</div>}
                <Flatpickr
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    options={{ dateFormat: 'Y-m-d', }}
                    className="form-input text-sm font-normal"
                    value={formikProps.values[name]}
                    {...{
                        onChange: (date: any) => {
                            formikProps.setFieldValue(name, moment(date[0]).format('YYYY-MM-DD'))
                        }
                    } as any}
                    {...props}
                />
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