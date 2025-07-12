import React from 'react';

function FormField({ label, name, value, onChange, ...props }) {
  return (
    <div className="rd-field">
      <label>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        {...props} // Pasa otras props como type, placeholder, minLength, etc.
      />
    </div>
  );
}

export default FormField;