"use client";

import React from "react";
import { FormikProps } from "formik";
import { getTranslation } from "@/ni18n/i18n";

interface FieldCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

export const FieldCard: React.FC<FieldCardProps> = ({ title, icon, children }) => {
  return (
    <div className="field-card">
      <div className="card-title">
        <span className="card-title-icon">{icon}</span>
        {title}
      </div>
      {children}
    </div>
  );
};

interface ModalFooterProps {
  isLoading: boolean;
  onCancel: () => void;
  submitText: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ isLoading, onCancel, submitText }) => {
  const { t } = getTranslation();

  return (
    <div className="drawer-footer">
      <button type="submit" disabled={isLoading} className="btn-modal-primary">
        {isLoading && (
          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
        {submitText}
      </button>
      <button type="button" onClick={onCancel} className="btn-modal-outline">
        {t("common.cancel") || "إلغاء"}
      </button>
    </div>
  );
};

interface FormGridProps {
  children: React.ReactNode;
  fullWidth?: boolean;
}

export const FormGrid: React.FC<FormGridProps> = ({ children, fullWidth = false }) => {
  return <div className={fullWidth ? "form-group-full" : "form-grid"}>{children}</div>;
};

interface RadioGroupProps {
  name: string;
  options: { label: string; value: string }[];
  value: string;
  onChange: (value: string) => void;
}

export const RadioGroup: React.FC<RadioGroupProps> = ({ name, options, value, onChange }) => {
  return (
    <div className="radio-group">
      {options.map((option) => (
        <label key={option.value} className={`radio-option ${value === option.value ? "radio-option-checked" : ""}`}>
          <input type="radio" name={name} value={option.value} checked={value === option.value} onChange={(e) => onChange(e.target.value)} />
          {option.label}
        </label>
      ))}
    </div>
  );
};

interface ModalInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
}

export const ModalInput: React.FC<ModalInputProps> = ({ label, name, type = "text", placeholder, value, onChange, error, required = false }) => {
  return (
    <div>
      <label htmlFor={name} className="modal-label">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <input id={name} name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} className="modal-input" />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};

interface ModalTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  error?: string;
  required?: boolean;
  rows?: number;
}

export const ModalTextarea: React.FC<ModalTextareaProps> = ({ label, name, placeholder, value, onChange, error, required = false, rows = 4 }) => {
  return (
    <div>
      <label htmlFor={name} className="modal-label">
        {label}
        {required && <span className="text-red-500 mr-1">*</span>}
      </label>
      <textarea id={name} name={name} placeholder={placeholder} value={value} onChange={onChange} rows={rows} className="modal-textarea" />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
