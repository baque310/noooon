"use client";

import React, { useEffect, useRef, useState } from "react";
import { CheckBoxForm } from "@/components/Form/CheckBoxForm";
import { FormikProps } from "formik";
import { getTranslation } from "@/ni18n/i18n";

export interface MultiSelectOption {
  label: string | React.ReactNode;
  value: string;
}

interface MultiSelectDropdownProps {
  formikProps: FormikProps<any>;
  name: string;
  title?: string;
  placeholder?: string;
  options: MultiSelectOption[];
  isLoading?: boolean;
  onSelectionChange?: (selectedValues: string[]) => void;
  disabled?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  formikProps,
  name,
  title,
  placeholder,
  options,
  isLoading = false,
  onSelectionChange,
  disabled = false,
}) => {
  const { t } = getTranslation();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedValues = (formikProps.values[name] || []) as string[];
  const error = formikProps.touched[name] && formikProps.errors[name];

  // Filter options based on search query
  const filteredOptions = options.filter((option) => {
    const labelText = typeof option.label === "string" ? option.label : String(option.value);
    return labelText.toLowerCase().includes(searchQuery.toLowerCase());
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery("");
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isDropdownOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isDropdownOpen]);

  const isAllSelected = filteredOptions.length > 0 && filteredOptions.every((option) => selectedValues.includes(option.value));

  return (
    <div className="w-full">
      {title && <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>}

      <div ref={dropdownRef} className="relative">
        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => !disabled && !isLoading && setIsDropdownOpen(!isDropdownOpen)}
          disabled={disabled || isLoading}
          className="w-full flex items-center justify-between px-4 py-2 border border-primary/30 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary/50">
          <span className="text-sm text-gray-700">
            {isLoading
              ? t("common.loading") || "Loading..."
              : selectedValues.length > 0
              ? `${t("common.selected")} ${selectedValues.length}`
              : placeholder || t("common.select") || "Select..."}
          </span>
          <svg className={`w-5 h-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && !isLoading && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-primary/30 rounded-md shadow-lg max-h-[220px] overflow-hidden flex flex-col">
            {/* Search Bar */}
            <div className="p-2 border-b border-gray-200">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t("common.search") || "Search..."}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
                {searchQuery && (
                  <button type="button" onClick={() => setSearchQuery("")} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Options Container */}
            <div className="overflow-y-auto flex-1">
              {/* Select All Checkbox */}
              {filteredOptions.length > 0 && (
                <div className="p-2 border-b hover:bg-gray-50">
                  <CheckBoxForm
                    formikProps={formikProps}
                    name="selectAll"
                    title={(t("common.select-all") || "Select All") as string}
                    props={{
                      checked: isAllSelected,
                      onChange: (e: any) => {
                        if (e.target.checked) {
                          const allValues = filteredOptions.map((option) => option.value);
                          const combined = [...selectedValues, ...allValues];
                          const newValues = Array.from(new Set(combined));
                          formikProps.setFieldValue(name, newValues);
                          onSelectionChange?.(newValues);
                        } else {
                          const filteredValues = filteredOptions.map((option) => option.value);
                          const newValues = selectedValues.filter((val) => !filteredValues.includes(val));
                          formikProps.setFieldValue(name, newValues);
                          onSelectionChange?.(newValues);
                        }
                      },
                    }}
                  />
                </div>
              )}

              {/* Individual Option Checkboxes */}
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <div className="p-2 border-b last:border-b-0 hover:bg-gray-50" key={option.value}>
                    <CheckBoxForm
                      key={index}
                      formikProps={formikProps}
                      name={`${name}.${index}`}
                      title={typeof option.label === "string" ? option.label : String(option.value)}
                      props={{
                        checked: selectedValues.includes(option.value),
                        value: option.value,
                        onChange: (e: any) => {
                          if (e.target.checked) {
                            const newValues = [...selectedValues, option.value];
                            formikProps.setFieldValue(name, newValues);
                            onSelectionChange?.(newValues);
                          } else {
                            const newValues = selectedValues.filter((val) => val !== option.value);
                            formikProps.setFieldValue(name, newValues);
                            onSelectionChange?.(newValues);
                          }
                        },
                      }}
                    />
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-sm text-gray-500">{t("common.no-options-found") || "No options found"}</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && <p className="mt-1 text-sm text-red-600">{typeof error === "string" ? error : JSON.stringify(error)}</p>}
    </div>
  );
};
