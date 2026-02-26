import { FormikProps, FormikValues } from "formik";
import React, { ReactNode, useRef } from "react";
import Select, { ActionMeta, MultiValue, Props as SelectProps, SingleValue } from "react-select";

export interface OptionType {
  value: string; // or number, depending on your value type
  label: ReactNode;
}

interface SelectFormProps<T = FormikValues> {
  formikProps: FormikProps<T>;
  name: keyof T & string;
  title: string;
  placeholder: string;
  icon?: ReactNode;
  props?: SelectProps<OptionType>;
  className?: string;
  options: OptionType[];
  isLoading?: boolean;
}

export const SelectForm = <T extends FormikValues>({ formikProps, name, title, placeholder, props, className, isLoading, options }: SelectFormProps<T>): React.ReactElement => {
  const selectRef = useRef<HTMLDivElement>(null);

  let pathArr = name.split(".");
  let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
  let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);

  // Scroll to this element when clicked
  const handleFocus = () => {
    if (selectRef.current) {
      selectRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center", // You can use 'start', 'center', or 'end'
      });
    }
  };

  // Custom onChange handler to integrate with Formik
  const handleChange = (newValue: SingleValue<OptionType> | MultiValue<OptionType>, actionMeta: ActionMeta<OptionType>) => {
    if (actionMeta.action === "select-option" || actionMeta.action === "remove-value") {
      if (Array.isArray(newValue)) {
        // Handle multi-value (array of options) case
        const values = newValue.map((item) => item.value);
        formikProps.setFieldValue(name, values);
      } else {
        // Handle single-value case
        formikProps.setFieldValue(name, newValue ? (newValue as OptionType)?.value : "");
      }
    }
  };

  const handleValue = props?.isMulti
    ? pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.values)
    : options?.find((item) => item.value == pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.values));

  const combinedProps = {
    ...props,
    onChange: props?.onChange ? props.onChange : handleChange,
    value: handleValue ?? null, // Use Formik's value, or default if not set
    onFocus: handleFocus, // Add scroll on focus
  };

  return (
    <div ref={selectRef} className={`custom-select text-sm font-normal  ${formikProps.submitCount ? (errorValue && touchedValue ? "has-error" : "") : ""} ${className || ""}`}>
      <label className="font-normal" htmlFor={name}>
        {title}{" "}
      </label>
      <Select
        {...combinedProps}
        placeholder={placeholder}
        options={options}
        isSearchable={true}
        // isLoading={isLoading}
        styles={{
          ...props?.styles,
          control: (baseStyle) => ({
            ...baseStyle,
            backgroundColor: formikProps.submitCount ? (errorValue && touchedValue ? "#F7ECF0" : "#F3F4F6") : "#F3F4F6",
            borderColor: formikProps.submitCount ? (errorValue && touchedValue ? "rgb(231 81 90 /1)" : "#F3F4F6") : "rgb(224 230 237)",
          }),
          menuPortal: (base) => ({
            ...base,
            ...(props?.styles?.menuPortal ? (props.styles.menuPortal as any)(base) : {}),
          }),
        }}
        menuPortalTarget={combinedProps.menuPortalTarget}
        menuPosition={combinedProps.menuPosition}
      />
      {formikProps.submitCount ? errorValue && touchedValue ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></> : <></>}
    </div>
  );
};
