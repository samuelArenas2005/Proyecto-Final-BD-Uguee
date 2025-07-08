// src/pages/SettingsPage/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../supabaseClient.js';
import {
  UserCog, User, Mail, University, Phone, Home, Building, Hash,
  BookUser, Pencil, X, LoaderCircle, Save
} from 'lucide-react';
import styles from './SettingsPage.module.css';
import { useParams } from 'react-router-dom';

// Un componente simple para el estado de carga
const LoadingSpinner = () => (
  <div className={styles.centeredMessage}>
    <LoaderCircle className={styles.spinner} size={48} />
    <p>Cargando información del usuario...</p>
  </div>
);

// Un componente para mostrar errores
const ErrorDisplay = ({ message }) => (
  <div className={styles.centeredMessage}>
    <p className={styles.errorMessage}>Error: {message}</p>
  </div>
);

const SettingsPage = () => {

  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user ? user.id : null);
      } catch (error) {
        console.error("Error al obtener el usuario de Supabase:", error);
      }
    };

    fetchUser();
  }, []);

  const [userData, setUserData] = useState(null);
  const [urlAvatar, setUrlAvatar] = useState(null)
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const fetchUserData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('usuario')
        .select(`
          nombrecompleto, edad, telefono, calle, numerocasa, ciudad, 
          codigoestudiantil, estatuto, urlAvatar,
          institucion ( nombre )
        `)
        .eq('nidentificacion', userId)
        .single();

      if (error) throw error;

      if (data) {
        const avatarUrl = supabase.storage
          .from("publico")
          .getPublicUrl(data?.urlAvatar);
        setUrlAvatar(avatarUrl)
        setUserData(data);
        setFormData(data); // Inicializa el formulario con los datos existentes
      }
    } catch (err) {
      setError(err.message);
      console.error("Error fetching user data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchUserData();
    }
  }, [userId, fetchUserData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveChanges = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    const updates = {
      nombrecompleto: formData.nombrecompleto,
      telefono: formData.telefono,
      calle: formData.calle,
      numerocasa: formData.numerocasa,
      ciudad: formData.ciudad,
    };

    try {
      const { data, error } = await supabase
        .from('usuario')
        .update(updates)
        .eq('nidentificacion', userId)
        .select()
        .single();

      if (error) throw error;

      setUserData(data); // Actualiza la vista con los nuevos datos guardados
      setIsEditing(false);
      alert("¡Perfil actualizado con éxito!");

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
    setIsEditing(false);
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorDisplay message={error} />;
  if (!userData) return <div className={styles.centeredMessage}>No se encontró información del usuario.</div>;

  return (
    <div className={styles.settingsPage}>
      <header className={styles.pageHeader}>
        <UserCog size={32} />
        <h1>Configuración de la Cuenta</h1>
      </header>

      <main className={styles.mainGrid}>
        {/* Columna Izquierda: Tarjeta de Perfil */}
        <aside className={styles.profileCard}>
          <img src={urlAvatar.data.publicUrl} alt="Avatar" className={styles.avatar} />
          <h2>{userData.nombrecompleto}</h2>
          <p className={styles.userStatus}>{userData.estatuto}</p>

          <div className={styles.profileInfoItem}>
            <BookUser size={18} />
            <span>{userData.codigoestudiantil}</span>
          </div>
          <div className={styles.profileInfoItem}>
            <University size={18} />
            <span>{userData.institucion?.nombre || 'No especificada'}</span>
          </div>
        </aside>

        {/* Columna Derecha: Formulario de Configuración */}
        <form onSubmit={handleSaveChanges} className={styles.settingsForm}>
          <div className={styles.formHeader}>
            <h3>Tu Información</h3>
            {!isEditing ? (
              <button type="button" onClick={() => setIsEditing(true)} className={`${styles.button} ${styles.primary}`}>
                <Pencil size={16} /> Editar Perfil
              </button>
            ) : (
              <div className={styles.editActions}>
                <button type="button" onClick={handleCancelEdit} className={`${styles.button} ${styles.secondary}`} disabled={isSaving}>
                  <X size={16} /> Cancelar
                </button>
                <button type="submit" className={`${styles.button} ${styles.primary}`} disabled={isSaving}>
                  {isSaving ? <LoaderCircle className={styles.spinner} size={16} /> : <Save size={16} />}
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            )}
          </div>

          <fieldset disabled={!isEditing && !isSaving} className={styles.fieldset}>
            {/* Sección de Información Personal */}
            <section className={styles.formSection}>
              <h4><User size={20} /> Información Personal</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nombrecompleto">Nombre Completo</label>
                  <input type="text" id="nombrecompleto" name="nombrecompleto" value={formData.nombrecompleto || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="telefono">Teléfono</label>
                  <input type="tel" id="telefono" name="telefono" value={formData.telefono || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label>Edad</label>
                  <p className={styles.staticData}>{userData.edad} años</p>
                </div>
              </div>
            </section>

            {/* Sección de Dirección */}
            <section className={styles.formSection}>
              <h4><Home size={20} /> Dirección</h4>
              <div className={styles.formGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="calle">Calle</label>
                  <input type="text" id="calle" name="calle" value={formData.calle || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="numerocasa">Número de Casa</label>
                  <input type="text" id="numerocasa" name="numerocasa" value={formData.numerocasa || ''} onChange={handleInputChange} />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="ciudad">Ciudad</label>
                  <input type="text" id="ciudad" name="ciudad" value={formData.ciudad || ''} onChange={handleInputChange} />
                </div>
              </div>
            </section>
          </fieldset>
        </form>
      </main>
    </div>
  );
};

export default SettingsPage;