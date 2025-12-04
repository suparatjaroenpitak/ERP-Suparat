// Form Template
// A flexible form component with validation

"use client";

import { useState, FormEvent } from "react";

type FieldType = "text" | "email" | "password" | "number" | "tel" | "url" | "textarea" | "select";

interface SelectOption {
  value: string;
  label: string;
}

interface FormField {
  name: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  required?: boolean;
  options?: SelectOption[]; // for select type
  rows?: number; // for textarea
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
}

interface FormProps {
  title?: string;
  description?: string;
  fields: FormField[];
  submitLabel?: string;
  onSubmit?: (data: Record<string, string>) => Promise<void>;
  successMessage?: string;
  layout?: "vertical" | "horizontal";
}

export default function Form({
  title,
  description,
  fields,
  submitLabel = "Submit",
  onSubmit,
  successMessage = "Form submitted successfully!",
  layout = "vertical",
}: FormProps) {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    fields.forEach((field) => {
      const value = formData[field.name] || "";

      if (field.required && !value.trim()) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.validation) {
        if (field.validation.minLength && value.length < field.validation.minLength) {
          newErrors[field.name] = `Minimum ${field.validation.minLength} characters required`;
        }
        if (field.validation.maxLength && value.length > field.validation.maxLength) {
          newErrors[field.name] = `Maximum ${field.validation.maxLength} characters allowed`;
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          newErrors[field.name] = `Invalid ${field.label.toLowerCase()} format`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setIsSuccess(false);

    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
      setIsSuccess(true);
      setFormData({});
    } catch (error) {
      setErrors({ form: "Something went wrong. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: FormField) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      placeholder: field.placeholder,
      required: field.required,
      value: formData[field.name] || "",
      onChange: handleChange,
      className: `
        w-full px-4 py-2.5 border rounded-lg transition-colors
        ${errors[field.name] 
          ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
          : "border-slate-300 focus:ring-primary-500 focus:border-primary-500"
        }
        focus:ring-2 focus:outline-none
      `,
    };

    switch (field.type) {
      case "textarea":
        return (
          <textarea
            {...commonProps}
            rows={field.rows || 4}
            className={`${commonProps.className} resize-none`}
          />
        );
      case "select":
        return (
          <select {...commonProps}>
            <option value="">{field.placeholder || "Select an option"}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow-md p-8 max-w-lg mx-auto"
    >
      {/* Header */}
      {(title || description) && (
        <div className="mb-6">
          {title && (
            <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
          )}
          {description && (
            <p className="text-slate-600 mt-2">{description}</p>
          )}
        </div>
      )}

      {/* Success Message */}
      {isSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-700 text-sm">{successMessage}</p>
        </div>
      )}

      {/* Form Error */}
      {errors.form && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">{errors.form}</p>
        </div>
      )}

      {/* Fields */}
      <div className="space-y-5">
        {fields.map((field) => (
          <div
            key={field.name}
            className={layout === "horizontal" ? "sm:flex sm:items-center" : ""}
          >
            <label
              htmlFor={field.name}
              className={`
                block text-sm font-medium text-slate-700 mb-1
                ${layout === "horizontal" ? "sm:w-1/3 sm:mb-0" : ""}
              `}
            >
              {field.label}
              {field.required && <span className="text-red-500 ml-1">*</span>}
            </label>
            <div className={layout === "horizontal" ? "sm:w-2/3" : ""}>
              {renderField(field)}
              {errors[field.name] && (
                <p className="mt-1 text-sm text-red-600">{errors[field.name]}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-8 w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? (
          <span className="flex items-center justify-center">
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            Submitting...
          </span>
        ) : (
          submitLabel
        )}
      </button>
    </form>
  );
}
