import FormField from "./components/FormField";
import FileField from "./components/FileField";
import MultiFileField from "./components/MultiFileField";
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
    via_principal: "",
    placa: "",
    ciudad: "",
    estado: "pendiente",
  };

  const initialFiles = {
    logo: null,
    certificados: [],
  };

  const [userData, setUserData] = useState(initialUserData);
  const [formData, setFormData] = useState(initialFormData);
  const [files, setFiles] = useState(initialFiles); // Estado para los archivos
  const [previewUrl, setPreviewUrl] = useState(""); // Nuevo estado para el preview
  const [infoMsg, setInfoMsg] = useState(""); // Mensaje de éxito o error

  const { createUniversity, submitting } = useLogin();

  const handleFileLogoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.name; // Obtener el nombre del input
      const file = e.target.files[0];
      setFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
    }
  };

  const handleFileCertificadoChange = (newFiles) => {
    setFiles((prevFiles) => ({ ...prevFiles, certificados: newFiles }));
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
      console.log("Datos del usuario:", userData);
      console.log("Datos del formulario:", formData);
      console.log("Archivos seleccionados:", files);
      await createUniversity(userData, formData, files);
      setUserData(initialUserData);
      setFormData(initialFormData);
      setFiles(initialFiles);
      setPreviewUrl(""); // Limpiar el preview
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
        <FormField
          label="Email"
          type="email"
          name="email"
          value={userData.email}
          required
          placeholder="ejemplo@universidad.edu"
          onChange={(e) => handleChange(e, setUserData)}
        />
        <FormField
          label="Contraseña"
          type="password"
          name="password"
          minLength={6}
          value={userData.password}
          required
          placeholder="Mínimo 6 caracteres"
          onChange={(e) => handleChange(e, setUserData)}
        />

        {/* Campos de la universidad */}
        <FormField
          label="Nombre oficial de la Universidad"
          name="nombre"
          value={formData.nombre}
          required
          placeholder="Universidad Nacional Autónoma"
          onChange={(e) => handleChange(e, setFormData)}
        />
        <div className="rd-two-col">
          <FormField
            label="Sede"
            name="sede"
            value={formData.sede}
            required
            placeholder="Melendez"
            onChange={(e) => handleChange(e, setFormData)}
          />
          <FormField
            label="Ciudad"
            name="ciudad"
            value={formData.ciudad}
            required
            placeholder="Cali"
            onChange={(e) => handleChange(e, setFormData)}
          />
        </div>
        <div className="rd-two-col">
          <FormField
            label="Via principal"
            name="via_principal"
            value={formData.via_principal}
            required
            placeholder="Cl 38"
            onChange={(e) => handleChange(e, setFormData)}
            pattern="^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+ [0-9]+( [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$"
            title="Debe ser una palabra, un espacio, un número, y opcionalmente más palabras separadas por espacio. Ejemplo: Cl 38 Sur, Av 5 Norte, Cra 10"
          />
          <FormField
            label="Placa"
            name="placa"
            value={formData.placa}
            required
            placeholder="12-34"
            onChange={(e) => handleChange(e, setFormData)}
            pattern="^[0-9]+[a-zA-Z]?-[0-9]+[a-zA-Z]?$"
            title="Debe ser un número, opcionalmente una letra, un guion, seguido de otro número y opcionalmente una letra. Ejemplo: 123A-45 o 123-45B o 123-45"
          />
        </div>
        <div className="rd-two-col">
          <FormField
            label="Color principal"
            name="colorprincipal"
            value={formData.colorprincipal}
            required
            placeholder="Azul"
            onChange={(e) => handleChange(e, setFormData)}
          />
          <FormField
            label="Color secundario"
            name="colorsecundario"
            value={formData.colorsecundario}
            required
            placeholder="Blanco"
            onChange={(e) => handleChange(e, setFormData)}
          />
        </div>
        <FileField
          label="Logo de la universidad (PNG o JPG)"
          type="file"
          id="file-upload"
          name="logo"
          file={files.logo}
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          required
          onFileChange={(e) => {
            handleFileLogoChange(e);
            handlePreview(e);
          }}
          previewUrl={previewUrl}
        />
        <MultiFileField
          label="Documentos de Soporte (PDF)"
          name="certificados"
          files={files.certificados} // Le pasamos el estado actual.
          onFilesChange={handleFileCertificadoChange} // Le pasamos la función para actualizar el estado.
          accept=".pdf,application/pdf"
        />
      </div>
      <button type="submit" className="rd-submit">
        Registrarse como universidad
      </button>
    </form>
  );
}

export default RegisterUniversity;
