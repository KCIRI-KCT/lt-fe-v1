import { useState, type FormEvent } from 'react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'password' | 'select' | 'textarea' | 'date' | 'checkbox' | 'file';
  placeholder?: string;
  required?: boolean;
  options?: { label: string; value: string }[];
  disabled?: boolean;
  helpText?: string;
  colSpan?: number;
  accept?: string;
}

interface DynamicFormProps {
  fields: FieldConfig[];
  initialValues?: Record<string, string | boolean>;
  onSubmit: (values: Record<string, string | boolean>) => void;
  submitLabel?: string;
  onCancel?: () => void;
}

export const DynamicForm = ({ fields, initialValues = {}, onSubmit, submitLabel = 'Save', onCancel }: DynamicFormProps) => {
  const [values, setValues] = useState<Record<string, string | boolean>>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (name: string, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.required && !values[f.name]) {
        newErrors[f.name] = `${f.label} is required`;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(values);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="row g-3">
      {fields.map((field) => (
        <div key={field.name} className={`col-12 ${field.colSpan ? `col-md-${field.colSpan}` : 'col-md-6'}`}>
          <label htmlFor={field.name} className="form-label fw-semibold">
            {field.label}
            {field.required && <span className="text-danger ms-1">*</span>}
          </label>

          {field.type === 'select' ? (
            <select
              id={field.name}
              className={`form-select ${errors[field.name] ? 'is-invalid' : ''}`}
              value={String(values[field.name] || '')}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled}
              required={field.required}
            >
              <option value="">Select {field.label}</option>
              {field.options?.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              id={field.name}
              className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
              placeholder={field.placeholder}
              value={String(values[field.name] || '')}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled}
              required={field.required}
              rows={3}
            />
          ) : field.type === 'checkbox' ? (
            <div className="form-check mt-2">
              <input
                id={field.name}
                type="checkbox"
                className="form-check-input"
                checked={Boolean(values[field.name])}
                onChange={(e) => handleChange(field.name, e.target.checked)}
                disabled={field.disabled}
              />
              <label htmlFor={field.name} className="form-check-label">{field.placeholder}</label>
            </div>
          ) : field.type === 'file' ? (
            <div className="d-flex flex-column gap-2">
              <input
                id={field.name}
                type="file"
                className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
                accept={field.accept || 'image/*'}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      if (typeof reader.result === 'string') {
                        handleChange(field.name, reader.result);
                      }
                    };
                    reader.readAsDataURL(file);
                  }
                }}
                disabled={field.disabled}
              />
              {values[field.name] && typeof values[field.name] === 'string' && (
                <div className="mt-1 d-flex align-items-center gap-2">
                  <img
                    src={values[field.name] as string}
                    alt="Preview"
                    className="img-thumbnail"
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%' }}
                  />
                  <small className="text-success fw-bold">✓ Photo Uploaded Successfully</small>
                </div>
              )}
            </div>
          ) : (
            <input
              id={field.name}
              type={field.type}
              className={`form-control ${errors[field.name] ? 'is-invalid' : ''}`}
              placeholder={field.placeholder}
              value={String(values[field.name] || '')}
              onChange={(e) => handleChange(field.name, e.target.value)}
              disabled={field.disabled}
              required={field.required}
            />
          )}

          {errors[field.name] && <div className="invalid-feedback">{errors[field.name]}</div>}
          {field.helpText && !errors[field.name] && <small className="text-muted">{field.helpText}</small>}
        </div>
      ))}

      <div className="col-12 d-flex gap-2 mt-4">
        <button type="submit" className="btn btn-primary">
          <i className="bi bi-check-lg me-1" />{submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>
            <i className="bi bi-x-lg me-1" />Cancel
          </button>
        )}
      </div>
    </form>
  );
};