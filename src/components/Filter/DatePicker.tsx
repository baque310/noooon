import { ReactNode } from "react";
import Flatpickr, { DateTimePickerProps } from "react-flatpickr";
import "flatpickr/dist/flatpickr.css";
import { useSelector } from "react-redux";
import moment from "moment";
import { IRootState } from "@/store";

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  title?: string;
  placeholder?: string;
  icon?: ReactNode;
  className?: string;
  // ✅ Use only props that Flatpickr actually accepts
  inputProps?: {
    id?: string;
    name?: string;
    disabled?: boolean;
    required?: boolean;
    readOnly?: boolean;
  };
  error?: string;
  showError?: boolean;
}

export const DatePicker = ({
  value,
  onChange,
  title,
  placeholder = "Select Date",
  icon,
  className = "",
  inputProps,
  error,
  showError = false,
}: DatePickerProps): React.ReactElement => {
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  return (
    <div className={`w-full ${className} ${showError && error ? "has-error" : ""}`}>
      {title && <label className="font-normal">{title}</label>}
      <div className="relative w-full">
        {icon && <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center">{icon}</div>}
        <Flatpickr
          placeholder={placeholder}
          options={{
            dateFormat: "Y-m-d",
            position: !isRtl ? "auto right" : "auto left",
          }}
          className="form-input text-sm font-normal"
          value={value}
          // ✅ Correct onChange type for Flatpickr
          onChange={(dates: Date[]) => {
            if (dates?.[0]) {
              onChange(moment(dates[0]).format("YYYY-MM-DD"));
            } else {
              onChange("");
            }
          }}
          {...inputProps} // ✅ only known safe props
        />
      </div>
      {showError && error && <div className="mt-[2px] w-full p-1 text-sm text-danger">{error}</div>}
    </div>
  );
};
