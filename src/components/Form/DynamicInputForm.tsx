import { Field, FormikProps, FormikValues, getIn, FieldArrayRenderProps } from "formik";
import React, { ReactNode } from "react";

interface DynamicInputFormProps<T = FormikValues> {
  formikProps: FormikProps<T>;
  name: string;
  title: string;
  placeholder: string;
  icon?: ReactNode;
  props?: React.InputHTMLAttributes<HTMLInputElement>;
  className?: string;
  onRemove?: () => void;
  isRemovable?: boolean;
}

export const DynamicInputForm = <T extends FormikValues>({
  formikProps,
  name,
  title,
  placeholder,
  icon,
  props,
  className,
  onRemove,
  isRemovable = false,
}: DynamicInputFormProps<T>): React.ReactElement => {
  const errorValue = getIn(formikProps.errors, name);
  const touchedValue = getIn(formikProps.touched, name);

  return (
    <div className={`w-full ${errorValue && touchedValue ? "has-error" : ""}`}>
      <label className="font-normal" htmlFor={name}>
        {title}
      </label>
      <div className="relative w-full flex items-center">
        {icon && (
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
            {icon}
          </div>
        )}
        <Field
          {...props}
          name={name}
          id={name}
          placeholder={placeholder}
          className={`${className} form-input text-sm font-normal`}
        />
        {isRemovable && onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="ml-2 text-red-500 hover:text-red-700"
          >
            إزالة
          </button>
        )}
      </div>
      {errorValue && touchedValue && (
        <div className="mt-[2px] w-full p-1 text-sm text-danger">
          {errorValue}
        </div>
      )}
    </div>
  );
};
