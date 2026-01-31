import { IRootState } from "@/store";
import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import Dropdown from "../dropdown";

const SelectFilter = ({
  options,
  title,
  handleChange,
  placement,
  value,
  icon,
  disabled = false,
}: {
  value?: string;
  placement?: string;
  handleChange: (value?: string) => void;
  title: string;
  icon?: React.ReactNode;
  disabled?: boolean;
  options: {
    label: string;
    value: string;
  }[];
}) => {
  const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === "rtl";

  const [selected, setSelected] = React.useState<{
    label: string;
    value: string;
  }>();

  useEffect(() => {
    if (value) {
      setSelected(options.find((item) => item.value === value));
    } else {
      setSelected(undefined);
    }
  }, [value, options]);

  return (
    <div className="dropdown shrink-0 min-w-[160px] flex-1 max-w-[240px]">
      <div className="flex flex-col gap-2">
        <label className={`text-sm font-bold flex items-center gap-1.5 ${disabled ? "text-gray-400 dark:text-gray-600" : "text-gray-800 dark:text-white"}`}>
          {icon && <span className={disabled ? "text-gray-400" : "text-primary"}>{icon}</span>}
          {title}
        </label>
        <Dropdown
          offset={[0, 8]}
          placement={placement ? placement : `${isRtl ? "bottom-start" : "bottom-end"}`}
          btnClassName={`block w-full p-2.5 rounded-lg border transition-colors text-sm ${
            disabled
              ? "bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700 cursor-not-allowed opacity-60"
              : "bg-white dark:bg-[#1b2e4b] border-gray-200 dark:border-[#253b5c] hover:border-primary dark:hover:border-primary"
          }`}
          button={
            <div className="flex items-center justify-between pointer-events-none">
              <span className={selected ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}>{selected ? selected.label : t("common.all") || "الكل"}</span>
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          }
          disabled={disabled}>
          {options.length > 0 && !disabled && (
            <ul className="w-[210px] max-h-64 overflow-auto !px-2 font-semibold text-dark dark:text-white-dark">
              <li className="border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => {
                    setSelected(undefined);
                    handleChange(undefined);
                  }}
                  className={`${!selected && "bg-primary/10 text-primary"} w-full text-right px-3 py-2.5 hover:bg-gray-100 dark:hover:bg-[#253b5c] transition-colors rounded`}>
                  {t("common.all") || "الكل"}
                </button>
              </li>
              {options.map((item, index) => (
                <li key={index} className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
                  <button
                    onClick={() => {
                      setSelected(item);
                      handleChange(item.value);
                    }}
                    className={`${
                      selected?.value === item.value ? "bg-primary text-white" : "hover:bg-gray-100 dark:hover:bg-[#253b5c]"
                    } w-full text-right px-3 py-2.5 transition-colors rounded`}>
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Dropdown>
      </div>
    </div>
  );
};

// Helper translation function (adjust based on your actual translation setup)
const t = (key: string) => {
  const translations: Record<string, string> = {
    "common.all": "الكل",
  };
  return translations[key] || key;
};

export default SelectFilter;
