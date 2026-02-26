import { Field, FormikProps, FormikValues } from "formik";
import React, { ReactNode, useMemo, useState } from "react";
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
  showArabicNumber?: boolean;
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
  iconLeft,
  iconRight,
}: InputFormProps<T>): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  let pathArr = name.split(".");
  let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
  let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);

  return (
    <div className={`w-full ${formikProps.submitCount ? (errorValue && touchedValue ? "has-error" : "") : ""}`}>
      <label className="font-bold" htmlFor={name}>
        {title}
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>
        <Field
          {...props}
          name={name}
          id={name}
          {...(isPassword && {
            type: showPassword ? "text" : "password",
          })}
          placeholder={placeholder}
          className={`${className} form-input text-sm font-normal ${props?.disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-800" : ""}`}
        />
        <div className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pl-3 rtl:left-0 rtl:pr-3">{iconLeft}</div>
        <div className="absolute inset-y-0 flex items-center ltr:left-0 ltr:pr-3 rtl:right-0 rtl:pl-3">{iconRight}</div>
        {isPassword && (
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 rtl:left-4 ltr:right-4 px-2 flex items-center text-sm">
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
      {formikProps.submitCount ? errorValue && touchedValue ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></> : <> </>}
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
  const getNestedValue = (path: string, obj: any) => path.split(".").reduce((res, key) => (res ? res[key] : undefined), obj);
  let errorValue = getNestedValue(name, formikProps.errors);
  let touchedValue = getNestedValue(name, formikProps.touched);

  const formatNumberWithCommas = (x: string): string => {
    const parts = x?.toString().split(".") || [];
    parts[0] = parts[0]?.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/,/g, "");
    formikProps.setFieldValue(name, numericValue);
  };
  return (
    <div className={`w-full ${formikProps.submitCount ? (errorValue && touchedValue ? "has-error" : "") : ""}`}>
      <label className="font-normal" htmlFor={name}>
        {title}
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{iconLeft}</div>
        <Field
          {...props}
          as="input"
          name={name}
          id={name}
          placeholder={placeholder}
          className={`${className} form-input text-sm font-normal ${props?.disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-800" : ""}`}
          onChange={handleNumberChange}
          value={formatNumberWithCommas(getNestedValue(name, formikProps.values) as string)}
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pr-3">{iconRight}</div>
      </div>
      {formikProps.submitCount ? errorValue && touchedValue ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></> : <></>}
    </div>
  );
};

// Function to convert numbers to Arabic words
const numberToArabicText = (num: number): string => {
  if (isNaN(num)) return "";
  if (num === 0) return "صفر";

  const ones = ["", "واحد", "اثنان", "ثلاثة", "أربعة", "خمسة", "ستة", "سبعة", "ثمانية", "تسعة"];
  const teens = ["عشرة", "أحد عشر", "اثنا عشر", "ثلاثة عشر", "أربعة عشر", "خمسة عشر", "ستة عشر", "سبعة عشر", "ثمانية عشر", "تسعة عشر"];
  const tens = ["", "", "عشرون", "ثلاثون", "أربعون", "خمسون", "ستون", "سبعون", "ثمانون", "تسعون"];
  const hundreds = ["", "مئة", "مئتان", "ثلاثمئة", "أربعمئة", "خمسمئة", "ستمئة", "سبعمئة", "ثمانمئة", "تسعمئة"];

  if (num < 0) return "سالب " + numberToArabicText(Math.abs(num));
  if (num < 10) return ones[num];
  if (num < 20) return teens[num - 10];
  if (num < 100) {
    const ten = Math.floor(num / 10);
    const one = num % 10;
    return one === 0 ? tens[ten] : ones[one] + " و" + tens[ten];
  }
  if (num < 1000) {
    const hundred = Math.floor(num / 100);
    const remainder = num % 100;
    return remainder === 0 ? hundreds[hundred] : hundreds[hundred] + " و" + numberToArabicText(remainder);
  }
  if (num < 1000000) {
    const thousand = Math.floor(num / 1000);
    const remainder = num % 1000;
    let thousandText = thousand === 1 ? "ألف" : thousand === 2 ? "ألفان" : thousand < 11 ? numberToArabicText(thousand) + " آلاف" : numberToArabicText(thousand) + " ألف";
    return remainder === 0 ? thousandText : thousandText + " و" + numberToArabicText(remainder);
  }
  if (num < 1000000000) {
    const million = Math.floor(num / 1000000);
    const remainder = num % 1000000;
    let millionText = million === 1 ? "مليون" : million === 2 ? "مليونان" : million < 11 ? numberToArabicText(million) + " ملايين" : numberToArabicText(million) + " مليون";
    return remainder === 0 ? millionText : millionText + " و" + numberToArabicText(remainder);
  }

  return num.toString(); // For numbers > 1 billion, just return the number
};

export const InputFormWithText = <T extends FormikValues>({
  formikProps,
  name,
  title,
  placeholder,
  icon,
  isPassword = false,
  props,
  className,
  iconLeft,
  iconRight,
  showArabicNumber = false,
}: InputFormProps<T>): React.ReactElement => {
  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  let pathArr = name.split(".");
  let errorValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.errors);
  let touchedValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.touched);

  // Get the current field value
  const fieldValue = pathArr.reduce((prev: any, curr) => prev && prev[curr], formikProps.values);

  // Convert to Arabic text if it's a number type input
  const arabicNumberText = showArabicNumber && props?.type === "number" && fieldValue ? numberToArabicText(Number(fieldValue)) : "";

  return (
    <div className={`w-full ${formikProps.submitCount ? (errorValue && touchedValue ? "has-error" : "") : ""}`}>
      <label className="font-normal" htmlFor={name}>
        {title}
      </label>
      <div className="relative w-full">
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">{icon}</div>
        <Field
          {...props}
          name={name}
          id={name}
          {...(isPassword && {
            type: showPassword ? "text" : "password",
          })}
          placeholder={placeholder}
          className={`${className} form-input text-sm font-normal ${props?.disabled ? "bg-gray-100 cursor-not-allowed dark:bg-gray-800" : ""}`}
        />
        <div className="absolute inset-y-0 flex items-center ltr:right-0 ltr:pl-3 rtl:left-0 rtl:pr-3">{iconLeft}</div>
        <div className="absolute inset-y-0 flex items-center ltr:left-0 ltr:pr-3 rtl:right-0 rtl:pl-3">{iconRight}</div>
        {isPassword && (
          <button type="button" onClick={togglePasswordVisibility} className="absolute inset-y-0 rtl:left-4 ltr:right-4 px-2 flex items-center text-sm">
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

      {/* Arabic number text display */}
      {showArabicNumber && arabicNumberText && <span className="mt-1 block text-sm text-green-600 dark:text-gray-400">{arabicNumberText}</span>}

      {formikProps.submitCount ? errorValue && touchedValue ? <div className="mt-[2px] w-full p-1 text-sm text-danger">{errorValue}</div> : <></> : <> </>}
    </div>
  );
};
