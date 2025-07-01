// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabaseClient.js";
import {
  UserCog,
  User,
  Mail,
  University,
  Phone,
  Home,
  Building,
  Hash,
  BookUser,
  Pencil,
  X,
  LoaderCircle,
  Save,
  Upload,
  FileText,
} from "lucide-react";
import styles from "../headerPasajero/SettingsPage.module.css";
import { useParams } from "react-router-dom";
import FileField from "../../pages/login/components/FileField";
import MultiFileField from "../../pages/login/components/MultiFileField";
import ComboField from "../../pages/login/components/ComboField";

// Un componente simple para el estado de carga
const LoadingSpinner = () => (
  <div className={styles.centeredMessage}>
    <LoaderCircle className={styles.spinner} size={48} />
    <p>Cargando información de la universidad...</p>
  </div>
);

// Un componente para mostrar errores
const ErrorDisplay = ({ message }) => (
  <div className={styles.centeredMessage}>
    <p className={styles.errorMessage}>Error: {message}</p>
  </div>
);

const SettingsUniversity = () => {
  const colorOptions = [
    { label: "Violeta", value: "#b86fc6" },
    { label: "Rosa", value: "#f7b6d2" },
    { label: "Rojo", value: "#ff0000" },
    { label: "Naranja", value: "#ff9900" },
    { label: "Amarillo", value: "#ffe600" },
    { label: "Gris", value: "#bdbdbd" },
    { label: "Negro", value: "#000000" },
    { label: "Blanco", value: "#ffffff" },
    { label: "Verde", value: "#00b050" },
    { label: "Azul", value: "#0070c0" },
    { label: "Marrón", value: "#a97c50" },
  ];

  const [universityId, setUniversityId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUniversityId(user ? user.id : null);
      } catch (error) {
        console.error("Error al obtener el id de Supabase:", error);
      }
    };

    fetchUser();
  }, []);

  const [userData, setUserData] = useState(null);
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [observacion, setObservacion] = useState("");
  const [files, setFiles] = useState({ logo: null, certificados: [] });
  const [previewUrl, setPreviewUrl] = useState("");
  const [logoUrl, setLogoUrl] = useState("");

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("institucion")
        .select(
          `
          nombre, sede, colorprincipal, colorsecundario, 
          urllmglogo, via_principal, placa, ciudad, estado
        `
        )
        .eq("idinstitucion", universityId)
        .single();

      if (error) throw error;

      if (data) {
        setUserData(data);
        setFormData(data); // Inicializa el formulario con los datos existentes

        // Obtener la URL pública del logo si existe
        if (data.urllmglogo) {
          const { data: logoUrlData } = supabase.storage
            .from("publico")
            .getPublicUrl(data.urllmglogo);
          setLogoUrl(logoUrlData.publicUrl);
        } else {
          setLogoUrl("");
        }
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [universityId]);

  useEffect(() => {
    if (universityId) {
      fetchUserData();
    }
  }, [universityId, fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChange = (e, setState) => {
    const { name, value } = e.target;
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileLogoChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.name;
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

  const limpiarNombre = (nombreOriginal) => {
    let nombreLimpio = nombreOriginal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^\w\s-.]/g, "")
      .trim()
      .replace(/\s+/g, "-");

    if (nombreLimpio.length > 99) {
      nombreLimpio = nombreLimpio.slice(nombreLimpio.length - 99);
    }

    return nombreLimpio;
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    // Verificar si la universidad está activa para mostrar advertencia

    // Validar observación (siempre obligatoria)
    if (!observacion.trim()) {
      alert(
        "Es obligatorio agregar una observación de los cambios realizados."
      );
      setIsSaving(false);
      return;
    }

    const updates = {
      nombre: formData.nombre,
      sede: formData.sede,
      colorprincipal: formData.colorprincipal,
      colorsecundario: formData.colorsecundario,
      via_principal: formData.via_principal,
      placa: formData.placa,
      ciudad: formData.ciudad,
      estado: "pendiente", // Siempre se guarda como pendiente
    };

    try {
      // Si hay un nuevo logo, subirlo primero
      if (files.logo) {
        const logoPath = `Institucion/${universityId}/logo/${limpiarNombre(
          files.logo.name
        )}`;

        // Primero, eliminar el logo existente si hay uno
        if (userData.urllmglogo) {
          const { error: deleteError } = await supabase.storage
            .from("publico")
            .remove([userData.urllmglogo]);

          if (deleteError) {
            console.log("No se pudo eliminar el logo anterior:", deleteError);
            // No detener el proceso, continuar con la subida
          }
        }

        const { data: logoData, error: logoError } = await supabase.storage
          .from("publico")
          .upload(logoPath, files.logo, {
            cacheControl: "3600",
            upsert: false, // Cambiado a false ya que eliminamos el anterior
          });

        if (logoError) {
          throw new Error(`Error al subir el logo: ${logoError.message}`);
        }

        updates.urllmglogo = logoPath;
      }

      const { data, error } = await supabase
        .from("institucion")
        .update(updates)
        .eq("idinstitucion", universityId)
        .select()
        .single();

      if (error) throw error;

      // Subir certificados si hay nuevos
      if (files.certificados.length > 0) {
        // Primero, eliminar todos los documentos existentes de la universidad
        try {
          // Obtener todos los documentos existentes de la universidad
          const { data: existingDocs, error: fetchError } = await supabase
            .from("urldocumentoinstitucion")
            .select("urldocumento")
            .eq("idinstitucion", universityId);

          if (fetchError) {
            console.warn("Error al obtener documentos existentes:", fetchError);
          } else if (existingDocs && existingDocs.length > 0) {
            // Eliminar archivos del storage
            const filesToDelete = existingDocs.map((doc) => doc.urldocumento);
            const { error: deleteStorageError } = await supabase.storage
              .from("documentos")
              .remove(filesToDelete);

            if (deleteStorageError) {
              console.warn(
                "Error al eliminar algunos documentos del storage:",
                deleteStorageError
              );
            }

            // Eliminar registros de la base de datos
            const { error: deleteDbError } = await supabase
              .from("urldocumentoinstitucion")
              .delete()
              .eq("idinstitucion", universityId);

            if (deleteDbError) {
              console.warn(
                "Error al eliminar registros de documentos:",
                deleteDbError
              );
            }
          }
        } catch (cleanupError) {
          console.warn(
            "Error durante la limpieza de documentos:",
            cleanupError
          );
          // Continuar con la subida de nuevos documentos aunque falle la limpieza
        }

        // Ahora subir los nuevos certificados
        for (const file of files.certificados) {
          const certificadoPath = `Institucion/${universityId}/documentos/${limpiarNombre(
            file.name
          )}`;

          const { data: extraCertificadoData, error: extraCertificadoError } =
            await supabase.storage
              .from("documentos")
              .upload(certificadoPath, file, {
                cacheControl: "3600",
                upsert: false,
              });

          if (extraCertificadoError) {
            console.error(
              "Error al subir el certificado:",
              extraCertificadoError
            );
            // Continuar con los demás archivos aunque uno falle
            continue;
          }

          const { data: certificadoData, error: certificadoError } =
            await supabase.from("urldocumentoinstitucion").insert({
              idinstitucion: universityId,
              urldocumento: certificadoPath,
              nombredocumento: file.name,
            });

          if (certificadoError) {
            console.error(
              "Error al registrar el certificado:",
              certificadoError
            );
            // Continuar con los demás archivos aunque uno falle
          }
        }
      }

      const { error: obsError } = await supabase
        .from("administradorinstitucion")
        .insert({
          idinstitucion: universityId,
          observacion: observacion,
          estadoasignado: "pendiente",
        });

      if (obsError) {
        console.error("Error al guardar observación:", obsError);
        // No detener el proceso si falla la observación
      }

      setUserData(data); // Actualiza la vista con los nuevos datos guardados

      // Actualizar la URL del logo si se subió uno nuevo
      if (updates.urllmglogo) {
        const { data: logoUrlData } = supabase.storage
          .from("publico")
          .getPublicUrl(updates.urllmglogo);
        setLogoUrl(logoUrlData.publicUrl);
      }

      setIsEditing(false);
      setObservacion(""); // Limpiar la observación
      setFiles({ logo: null, certificados: [] }); // Limpiar archivos
      setPreviewUrl(""); // Limpiar preview

      alert("¡Información de la universidad actualizada con éxito!");
    } catch (err) {
      setError(err.message);
      console.error("Error updating profile:", err);
      alert(`Error al actualizar: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setFormData(userData); // Revierte los cambios
    setObservacion(""); // Limpiar la observación
    setFiles({ logo: null, certificados: [] }); // Limpiar archivos
    setPreviewUrl(""); // Limpiar preview
    setIsEditing(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!userData)
    return (
      <div className={styles.centeredMessage}>
        No se encontró información de la universidad.
      </div>
    );

  return (
    <div className={styles.settingsPage}>
      <header className={styles.pageHeader}>
        <UserCog size={32} />
        <h1>Configuración de la Universidad</h1>
      </header>

      <main className={styles.mainGrid}>
        {/* Columna Izquierda: Tarjeta de Perfil */}
        <aside className={styles.profileCard}>
          <img
            src={logoUrl || "https://via.placeholder.com/150"}
            alt="Logo Universidad"
            className={styles.avatar}
            onError={(e) => {
              e.target.src = "https://via.placeholder.com/150";
            }}
          />
          <h2>{userData.nombre}</h2>
          <p className={styles.userStatus}>{userData.estado}</p>

          <div className={styles.profileInfoItem}>
            <BookUser size={18} />
            <span>{userData.sede}</span>
          </div>
          <div className={styles.profileInfoItem}>
            <University size={18} />
            <span>{userData.ciudad}</span>
          </div>
        </aside>

        {/* Columna Derecha: Formulario de Configuración */}
        <form onSubmit={handleSaveChanges} className={styles.settingsForm}>
          <div className={styles.formHeader}>
            <h3>Información de la Universidad</h3>
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={`${styles.button} ${styles.primary}`}
              >
                <Pencil size={16} /> Editar Perfil
              </button>
            ) : (
              <div className={styles.editActions}>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className={`${styles.button} ${styles.secondary}`}
                  disabled={isSaving}
                >
                  <X size={16} /> Cancelar
                </button>
                <button
                  type="submit"
                  className={`${styles.button} ${styles.primary}`}
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <LoaderCircle className={styles.spinner} size={16} />
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving ? "Guardando..." : "Guardar Cambios"}
                </button>
              </div>
            )}
          </div>

          <fieldset
            disabled={!isEditing && !isSaving}
            className={styles.fieldset}
          >
            {/* Sección de Información Básica */}
            <section className={styles.formSection}>
              <h4>
                <University size={20} /> Información Básica
              </h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombre">Nombre de la Universidad</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre || ""}
                    onChange={handleInputChange}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="sede">Sede</label>
                  <input
                    type="text"
                    id="sede"
                    name="sede"
                    value={formData.sede || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            {/* Sección de Ubicación */}
            <section className={styles.formSection}>
              <h4>
                <Home size={20} /> Ubicación
              </h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="via_principal">Vía Principal</label>
                  <input
                    type="text"
                    id="via_principal"
                    name="via_principal"
                    value={formData.via_principal || ""}
                    onChange={handleInputChange}
                    pattern="^[a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+ [0-9]+( [a-zA-ZáéíóúÁÉÍÓÚüÜñÑ]+)*$"
                    title="Debe ser una palabra, un espacio, un número, y opcionalmente más palabras separadas por espacio. Ejemplo: Cl 38 Sur, Av 5 Norte, Cra 10"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="placa">Placa/Dirección</label>
                  <input
                    type="text"
                    id="placa"
                    name="placa"
                    value={formData.placa || ""}
                    onChange={handleInputChange}
                    pattern="^[0-9]+[a-zA-Z]?-[0-9]+[a-zA-Z]?$"
                    title="Debe ser un número, opcionalmente una letra, un guion, seguido de otro número y opcionalmente una letra. Ejemplo: 123A-45 o 123-45B o 123-45"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ciudad">Ciudad</label>
                  <input
                    type="text"
                    id="ciudad"
                    name="ciudad"
                    value={formData.ciudad || ""}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </section>

            {/* Sección de Identidad Visual */}
            <section className={styles.formSection}>
              <h4>
                <User size={20} /> Identidad Visual
              </h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <ComboField
                    label="Color Principal"
                    name="colorprincipal"
                    value={formData.colorprincipal}
                    required
                    placeholder="Selecciona un color"
                    onChange={(e) => handleChange(e, setFormData)}
                    options={colorOptions}
                  />
                </div>
                <div className={styles.formGroup}>
                  <ComboField
                    label="Color Secundario"
                    name="colorsecundario"
                    value={formData.colorsecundario}
                    required
                    placeholder="Selecciona un color"
                    onChange={(e) => handleChange(e, setFormData)}
                    options={colorOptions}
                  />
                </div>
              </div>
            </section>

            {/* Sección de Archivos */}
            <section className={styles.formSection}>
              <h4>
                <Upload size={20} /> Archivos y Documentos
              </h4>
              <div className={styles.formGrid}>
                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <FileField
                    label="Actualizar Logo de la Universidad (PNG o JPG, si se sube uno nuevo, se eliminará el anterior)"
                    name="logo"
                    file={files.logo}
                    accept=".png,.jpg,.jpeg,image/png,image/jpeg"
                    onFileChange={(e) => {
                      handleFileLogoChange(e);
                      handlePreview(e);
                    }}
                    previewUrl={previewUrl}
                  />
                </div>
                <div
                  className={styles.formGroup}
                  style={{ gridColumn: "1 / -1" }}
                >
                  <MultiFileField
                    label="Documentos de Soporte (PDF, si se suben archivos, se eliminarán los anteriores)"
                    name="certificados"
                    files={files.certificados}
                    onFilesChange={handleFileCertificadoChange}
                    accept=".pdf,application/pdf"
                  />
                </div>
              </div>
            </section>

            {/* Sección de Observaciones */}
            <section className={styles.formSection}>
              <h4>
                <Pencil size={20} /> Observación de los Cambios
              </h4>
              <div className={styles.formGroup}>
                <label htmlFor="observacion">
                  Describa brevemente los cambios realizados (obligatorio)
                </label>
                <textarea
                  id="observacion"
                  name="observacion"
                  value={observacion}
                  onChange={(e) => setObservacion(e.target.value)}
                  placeholder="Ej: Actualización de información de contacto, cambio de colores institucionales, etc."
                  rows={4}
                  className={styles.textArea}
                  required
                />
                <small className={styles.helpText}>
                  {userData.estado === "activo"
                    ? "⚠️ Al guardar, su universidad pasará a estado 'pendiente' para revisión administrativa."
                    : "📝 Esta observación será registrada junto con los cambios realizados."}
                </small>
              </div>
            </section>
          </fieldset>
        </form>
      </main>
    </div>
  );
};

export default SettingsUniversity;
