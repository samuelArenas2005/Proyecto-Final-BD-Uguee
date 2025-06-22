import { useLogin } from "../../context/LoginContext";
import { useState } from "react";

function RegisterUniversity({ handleChange }) {
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialFormData = {
    idinstitucion: undefined,
    nombre: "",
    colorprincipal: "",
    colorsecundario: "",
    urllmglogo: "",
    sede: "",
    calle: "",
    numerolugar: "",
    ciudad: "",
    estado: "activo",
  };

  const initialFiles = {
    logo: null,
    certificado: null,
  };

  const [userData, setUserData] = useState(initialUserData);
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState(initialFiles); // Estado para los archivos
  const [previewUrl, setPreviewUrl] = useState(""); // Nuevo estado para el preview
  const [infoMsg, setInfoMsg] = useState(""); // Mensaje de éxito o error

  const { createUniversity, submitting } = useLogin();

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.name; // Obtener el nombre del input
      const file = e.target.files[0];
      setFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
    }
  };

  const handlePreview = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUniversity(userData, formData, files);
      setUserData(initialUserData);
      setFormData(initialFormData);
      setInfoMsg("Universidad registrada con éxito");
    } catch (error) {
      setInfoMsg(
        "Error al registrar universidad: " +
          (error?.message || error) +
          " Inténtalo de nuevo."
      );
    }
  };

  if (submitting) return <p>Registrando universidad...</p>;

  return (
    <form className="rd-form" onSubmit={handleSubmit}>
      <div className="rd-section">
        <h3 className="rd-section-title">Registro de Universidad</h3>
        {infoMsg && (
          <div
            className={infoMsg.includes("éxito") ? "successmsg" : "errormsg"}
          >
            {infoMsg}
          </div>
        )}

        {/* Email y Password */}
        <div className="rd-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            required
            placeholder="ejemplo@universidad.edu"
            onChange={(e) => handleChange(e, setUserData)}
          />
        </div>
        <div className="rd-field">
          <label>Contraseña</label>
          <input
            type="password"
            name="password"
            minLength={6}
            value={userData.password}
            required
            placeholder="Mínimo 6 caracteres"
            onChange={(e) => handleChange(e, setUserData)}
          />
        </div>

        {/* Campos de la universidad */}
        <div className="rd-field">
          <label>Nombre oficial de la Universidad</label>
          <input
            name="nombre"
            value={formData.nombre}
            required
            placeholder="Universidad Nacional Autónoma"
            onChange={(e) => handleChange(e, setFormData)}
          />
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Sede</label>
            <input
              name="sede"
              value={formData.sede}
              required
              placeholder="Melendez"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Calle</label>
            <input
              name="calle"
              value={formData.calle}
              required
              placeholder="12"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Número lugar</label>
            <input
              name="numerolugar"
              value={formData.numerolugar}
              required
              placeholder="12-34"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Ciudad</label>
            <input
              name="ciudad"
              value={formData.ciudad}
              required
              placeholder="Ciudad de México"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Color principal</label>
            <input
              name="colorprincipal"
              value={formData.colorprincipal}
              required
              placeholder="Azul"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Color secundario</label>
            <input
              name="colorsecundario"
              value={formData.colorsecundario}
              required
              placeholder="Blanco"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-field">
          <label>Logo de la universidad (PNG o JPG)</label>
          <div className="custom-file-input-container">
            <input
              type="file"
              id="file-upload"
              name="logo"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              required
              onChange={(e) => {
                handleFileChange(e);
                handlePreview(e);
              }}
            />
            <label htmlFor="file-upload" className="custom-file-button">
              Elegir archivo
            </label>
            <span className="file-name-display">
              {files.logo ? files.logo.name : "No se eligió ningún archivo"}
            </span>
          </div>
          {/* Preview de la imagen */}
          {previewUrl && (
            <div style={{ marginTop: "10px" }}>
              <img
                src={previewUrl}
                alt="Preview logo"
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
        <div className="rd-field">
          <label>Certificado (PDF)</label>
          <div className="custom-file-input-container">
            <input
              type="file"
              id="file-certificado"
              name="certificado"
              accept=".pdf,application/pdf"
              required
              onChange={(e) => {
                handleFileChange(e);
              }}
            />
            <label htmlFor="file-certificado" className="custom-file-button">
              Elegir archivo
            </label>
            <span className="file-name-display">
              {files.certificado
                ? files.certificado.name
                : "No se eligió ningún archivo"}
            </span>
          </div>
        </div>
      </div>
      <button type="submit" className="rd-submit">
        Registrarse como universidad
      </button>
    </form>
  );
}

export default RegisterUniversity;
