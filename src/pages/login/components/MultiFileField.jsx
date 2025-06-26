// components/MultiFileField.jsx
import React from 'react';

function MultiFileField({
  label,
  name,
  files, // El arreglo de archivos, por defecto es vacío.
  onFilesChange, // La función para notificar al padre de los cambios.
  accept,
}) {

  /**
   * Se activa cuando el usuario selecciona archivos nuevos.
   * Agrega los nuevos archivos al arreglo existente.
   */
  const handleFileAdd = (event) => {
    const newFiles = Array.from(event.target.files);
    if (newFiles.length > 0) {
      onFilesChange([...files, ...newFiles]);
    }
    // Reseteamos el valor del input para permitir subir el mismo archivo de nuevo si se borró.
    event.target.value = '';
  };

  /**
   * Elimina un archivo del arreglo basado en su índice.
   */
  const handleFileRemove = (indexToRemove) => {
    // Crea un nuevo arreglo excluyendo el archivo en la posición 'indexToRemove'.
    const updatedFiles = files.filter((_, index) => index !== indexToRemove);
    onFilesChange(updatedFiles);
  };

  return (
    <div className="rd-field">
      <label>{label}</label>
      <div className="custom-file-input-container">
        <input
          type="file"
          id={`file-${name}`}
          name={name}
          accept={accept}
          multiple // ¡Importante! Permite la selección de múltiples archivos.
          onChange={handleFileAdd}
        />
        <label htmlFor={`file-${name}`} className="custom-file-button">
          Elegir archivos...
        </label>
                <span className="file-name-display">
          {`${files.length} archivos seleccionados`}
        </span>
      </div>

      {/* Lista de archivos subidos */}
      <div className="file-list-container">
        {files.length === 0 ? (
          <p className="file-list-empty">No hay archivos seleccionados.</p>
        ) : (
          files.map((file, index) => (
            <div key={`${file.name}-${index}`} className="file-list-item">
              <span className="file-name">{file.name}</span>
              <button
                type="button" // Evita que el botón envíe el formulario.
                className="remove-file-button"
                onClick={() => handleFileRemove(index)}
                aria-label={`Quitar ${file.name}`}
              >
                &times; {/* Este es el caracter de la 'equis' (multiplicación) */}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default MultiFileField;