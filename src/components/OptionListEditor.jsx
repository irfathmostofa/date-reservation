import { useState } from "react";

// Time formatting function
function formatTime(timeString) {
  if (!timeString) return "";
  const [hours, minutes] = timeString.split(":");
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? "PM" : "AM";
  const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${displayHour}:${minutes} ${ampm}`;
}

export default function OptionListEditor({
  label,
  placeholder,
  type = "text",
  values,
  onChange,
  inputMode,
  pattern,
  min,
  max,
  step,
  required = false,
  maxLength,
  minLength,
}) {
  const [draft, setDraft] = useState("");
  const [error, setError] = useState("");

  function validateInput(value) {
    if (!value.trim()) return "Value cannot be empty";

    // Type-specific validation
    if (type === "email") {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) return "Please enter a valid email address";
    }

    if (type === "number") {
      const num = parseFloat(value);
      if (isNaN(num)) return "Please enter a valid number";
      if (min !== undefined && num < min)
        return `Value must be at least ${min}`;
      if (max !== undefined && num > max) return `Value must be at most ${max}`;
    }

    if (type === "url") {
      try {
        new URL(value);
      } catch {
        return "Please enter a valid URL";
      }
    }

    if (type === "tel") {
      const phoneRegex = /^[\+\d\s\-\(\)]{7,20}$/;
      if (!phoneRegex.test(value)) return "Please enter a valid phone number";
    }

    // Time validation (HH:MM format)
    if (type === "time") {
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(value)) {
        return "Please enter time in HH:MM format (e.g., 14:30)";
      }
    }

    if (minLength && value.length < minLength) {
      return `Must be at least ${minLength} characters`;
    }

    if (maxLength && value.length > maxLength) {
      return `Must be at most ${maxLength} characters`;
    }

    return "";
  }

  function addValue() {
    const trimmed = draft.trim();

    const validationError = validateInput(trimmed);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (values.includes(trimmed)) {
      setError("This value already exists");
      setDraft("");
      setTimeout(() => setError(""), 2000);
      return;
    }

    onChange([...values, trimmed]);
    setDraft("");
    setError("");
  }

  function removeValue(val) {
    onChange(values.filter((v) => v !== val));
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      addValue();
    }
    if (e.key === "Escape") {
      setDraft("");
      setError("");
    }
  }

  function handleBlur() {
    if (draft.trim()) {
      addValue();
    }
  }

  // Get appropriate input attributes based on type
  function getInputProps() {
    const baseProps = {
      type: type === "number" ? "text" : type,
      placeholder,
      value: draft,
      onChange: (e) => {
        setDraft(e.target.value);
        setError("");
      },
      onKeyDown: handleKeyDown,
      onBlur: handleBlur,
      "aria-label": `Add ${label.toLowerCase()}`,
    };

    // Add type-specific props
    if (type === "number") {
      return {
        ...baseProps,
        inputMode: "decimal",
        pattern: "[0-9]*",
      };
    }

    if (type === "email") {
      return {
        ...baseProps,
        inputMode: "email",
        autoComplete: "email",
      };
    }

    if (type === "tel") {
      return {
        ...baseProps,
        inputMode: "tel",
      };
    }

    if (type === "url") {
      return {
        ...baseProps,
        inputMode: "url",
        autoComplete: "url",
      };
    }

    if (type === "time") {
      return {
        ...baseProps,
        inputMode: "numeric",
        pattern: "[0-9:]*",
        placeholder: "HH:MM (e.g., 14:30)",
      };
    }

    return baseProps;
  }

  // Format display value for chips
  function getDisplayValue(value) {
    if (type === "time") {
      return formatTime(value);
    }
    return value;
  }

  return (
    <div className="field">
      <label>
        {label}
        {required && <span className="required-star">*</span>}
      </label>

      <div className="option-row">
        <input {...getInputProps()} />
        <button type="button" className="btn btn-ghost" onClick={addValue}>
          Add
        </button>
      </div>

      {error && <p className="error-text">{error}</p>}

      {values.length > 0 && (
        <div className="chip-list">
          {values.map((val) => (
            <span className="chip" key={val}>
              {getDisplayValue(val)}
              <button
                type="button"
                onClick={() => removeValue(val)}
                aria-label={`Remove ${getDisplayValue(val)}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
