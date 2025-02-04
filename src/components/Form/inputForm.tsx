import { Field, FormikProps, FormikValues } from "formik";
import React, { ReactNode, useState } from "react";
import IconEyeOff from "../common/icons/eye-off";
import IconEyeOn from "../common/icons/eye-on";

interface InputFormProps<T = FormikValues> {
  formikProps: FormikProps<T>;
  name: keyof T & string;
  title: string;
  placeholder: string;
  icon?: ReactNode;
  isPassword?: boolean;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;

  iconRight?: ReactNode;
  iconLeft?: ReactNode;
}

export const InputForm = <T extends FormikValues>({
  formikProps,
  name,
  title,
  placeholder,
  icon,
  isPassword = false,
  props,
  className,
}: InputFormProps<T>): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  let pathArr = name.split(".");
  let errorValue = pathArr.reduce(
    (prev: any, curr) => prev && prev[curr],
    formikProps.errors
  );
  let touchedValue = pathArr.reduce(
    (prev: any, curr) => prev && prev[curr],
    formikProps.touched
  );

  return (
    <div
      className={`w-full ${formikProps.submitCount
          ? errorValue && touchedValue
            ? "has-error"
            : ""
          : ""
        }`}
    >
      <label className="font-normal" htmlFor={name}>
        {title}
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          {icon}
        </div>
        <Field
          {...props}
          name={name}
          id={name}
          {...isPassword && {
            type: showPassword ? "text" : "password"
          }}
          placeholder={placeholder}
          className={`${className} form-input text-sm font-normal ${props?.disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-800" : ""}`}
        />
        {isPassword && (
          <button
            type="button"
            onClick={togglePasswordVisibility}
            className="absolute inset-y-0 left-4 px-2 flex items-center text-sm"
          >
            {showPassword ? (
              <>
                {" "}
                <IconEyeOff />{" "}
              </>
            ) : (
              <>
                {" "}
                <IconEyeOn />{" "}
              </>
            )}
          </button>
        )}
      </div>
      {formikProps.submitCount ? (
        errorValue && touchedValue ? (
          <div className="mt-[2px] w-full p-1 text-sm text-danger">
            {errorValue}
          </div>
        ) : (
          <></>
        )
      ) : (
        <> </>
      )}
    </div>
  );
};


export const InputCurrencyMaskForm = <T extends FormikValues>({
  formikProps,
  name,
  title,
  placeholder,
  iconLeft,
  props,
  className,
  iconRight,
}: InputFormProps<T>): React.ReactElement => {
  // Helper function to navigate deep objects
  const getNestedValue = (path: string, obj: any) => path.split('.').reduce((res, key) => (res ? res[key] : undefined), obj);
  let errorValue = getNestedValue(name, formikProps.errors);
  let touchedValue = getNestedValue(name, formikProps.touched);

  const formatNumberWithCommas = (x: string): string => {
      const parts = x?.toString().split(".") || [];
      parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      return parts.join(".");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const numericValue = e.target.value.replace(/,/g, '');
      formikProps.setFieldValue(name, numericValue);
  };
  return (
      <div
          className={`w-full ${formikProps.submitCount ? (errorValue && touchedValue ? 'has-error' : '') : ''}`}>
          <label className='font-normal' htmlFor={name}>{title}</label>
          <div className="relative w-full">
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{iconLeft}</div>
              <Field
                  {...props}
                  as="input"
                  name={name}
                  id={name}
                  placeholder={placeholder}
                  className={`${className} form-input text-sm font-normal ${props?.disabled ? 'bg-gray-100 cursor-not-allowed dark:bg-gray-800' : ''}`}
                  onChange={handleNumberChange}
                  value={formatNumberWithCommas(getNestedValue(name, formikProps.values) as string)} />
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pr-3">{iconRight}</div>
          </div>
          {formikProps.submitCount ?
              (errorValue && touchedValue ?
                  <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></>
              )
              :
              <>
              </>
          }
      </div>
  );
};