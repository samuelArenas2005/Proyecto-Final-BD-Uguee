// components/FileField.jsx

function FileField({ label, name, file, onFileChange, accept, previewUrl,required=true }) {
  return (
    <div className="rd-field">
      <label>{label}</label>
      <div className="custom-file-input-container">
        <input
          type="file"
          id={`file-${name}`}
          name={name}
          accept={accept}
          onChange={onFileChange}
          required={required}
        />
        <label htmlFor={`file-${name}`} className="custom-file-button">
          Elegir archivo
        </label>
        <span className="file-name-display">
          {file ? "Un archivo seleccionado" : "No se eligió ningún archivo"}
        </span>
      </div>
      {/* Lista de archivos subidos */}
      <div className="file-list-container">
        {file ? (
          <div key={`${file.name}`} className="file-list-item file-preview-item">
            <span className="file-name">{file.name}</span>
            {/* Aquí puedes agregar el botón de eliminar si lo necesitas */}
            {previewUrl && (
              <div style={{ marginTop: "10px" }}>
                <img
                  src={previewUrl}
                  alt={`Preview ${name}`}
                  style={{
                    maxWidth: "120px",
                    maxHeight: "120px",
                    borderRadius: "8px",
                    border: "1px solid #ccc",
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <p className="file-list-empty">No hay archivo seleccionado.</p>
        )}
      </div>
    </div>
  );
}

export default FileField;
