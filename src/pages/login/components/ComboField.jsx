import React from "react";

function ComboField({ label, name, value, onChange, options = [], ...props }) {
  return (
    <div className="rd-field">
      <label>{label}</label>
      <select name={name} value={value} onChange={onChange} required {...props}>
        <option value="" disabled>
          Seleccione una opción
        </option>
        {options.map((opt) => (
          <option key={opt.value ?? opt} value={opt.value ?? opt}>
            {opt.label ?? opt}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ComboField;
