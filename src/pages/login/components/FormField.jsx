import React from 'react';

function FormField({ label, name, value, onChange, ...props }) {
  return (
    <div className="rd-field">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        required // Asumimos que todos son requeridos como en el original
        {...props} // Pasa otras props como type, placeholder, minLength, etc.
      />
    </div>
  );
}

export default FormField;