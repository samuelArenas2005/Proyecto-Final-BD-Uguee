// RegisterDialog.js
import React, { useState, useEffect, useRef } from 'react';
import './RegisterDialog.css';
import supabase from '../../supabaseClient';

export default function RegisterDialog({ open, onOpenChange }) {
  const [role, setRole] = useState('pasajero');

  const [formData, setFormData] = useState({
  nombre: '',
  apellido: '',
  universidad: '',
  codigo_estudiantil: '',
  correo_institucional: '',
  direccion: '',
  ciudad: '',
  telefono: ''
  });
  
  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {

    const errors = [];
    if (role === 'pasajero') {
      if (!nombre || !apellido || !codigoEstudiantil || !universidad || !correoInstitucional || !direccion || !ciudad || !telefono || !documentoIdentidad) {
        errors.push('Completa todos los campos de pasajero');
      }
    } else {
      if (!nombreUniversidad || !direccionUniversidad || !sede || !ciudadUniversidad || !codigoInstitucional || !colorPrimario || !colorSecundario || !logoUniversidad || !documentosAutorizacion) {
        errors.push('Completa todos los campos de universidad');
      }
    }
    if (errors.length > 0) {
      alert(errors[0]);
      return;
    }
    // Submit stub
    console.log('Submitting', role === 'pasajero' ? { nombre, apellido } : { nombreUniversidad });
    onOpenChange(false);

    e.preventDefault();

    const { data, error } = await supabase
      .from('usuario')
      .insert([formData]);

    if (error) {
      console.error('Error al guardar encuesta:', error);
      setMensaje('Error al guardar');
    } else {
      setMensaje('Encuesta guardada con éxito');
      setFormData({ nombre: '', edad: '', opinion: '' }); // limpiar
    }
  };

  // Pasajero fields
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [codigoEstudiantil, setCodigoEstudiantil] = useState('');
  const [universidad, setUniversidad] = useState('');
  const [correoInstitucional, setCorreoInstitucional] = useState('');
  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [telefono, setTelefono] = useState('');
  const [documentoIdentidad, setDocumentoIdentidad] = useState(null);

  // Universidad fields
  const [nombreUniversidad, setNombreUniversidad] = useState('');
  const [direccionUniversidad, setDireccionUniversidad] = useState('');
  const [sede, setSede] = useState('');
  const [ciudadUniversidad, setCiudadUniversidad] = useState('');
  const [codigoInstitucional, setCodigoInstitucional] = useState('');
  const [colorPrimario, setColorPrimario] = useState('');
  const [colorSecundario, setColorSecundario] = useState('');
  const [logoUniversidad, setLogoUniversidad] = useState(null);
  const [documentosAutorizacion, setDocumentosAutorizacion] = useState(null);

  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    else document.removeEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onOpenChange]);

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  if (!open) return null;

  return (
    <div className="rd-overlay">
      <div className="rd-modal" ref={modalRef}>
        <header className="rd-header">
          <h2>Registro en Ugüee</h2>
          <button className="rd-close" onClick={() => onOpenChange(false)}>×</button>
        </header>

        <div className="rd-role-toggle">
          <button
            className={role === 'pasajero' ? 'active' : ''}
            onClick={() => setRole('pasajero')}
          >
            Pasajero
          </button>
          <button
            className={role === 'universidad' ? 'active' : ''}
            onClick={() => setRole('universidad')}
          >
            Universidad
          </button>
        </div>

        <div className="rd-content">
          {role === 'pasajero' && (
            <form className="rd-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <div className="rd-two-col">
                <div className="rd-field">
                  <label>Nombre</label>
                  <input value={formData.nombre} onChange={handleChange} />
                </div>
                <div className="rd-field">
                  <label>Apellido</label>
                  <input value={formData.apellido} onChange={handleChange} />
                </div>
              </div>
              <div className="rd-field">
                <label>Universidad</label>
                <select value={formData.universidad} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  <option>Universidad del Valle</option>
                  <option>Universidad Nacional</option>
                  <option>Universidad de Antioquia</option>
                  <option>Universidad Javeriana</option>
                  <option>Universidad de Los Andes</option>
                  <option>Universidad Icesi</option>
                </select>
              </div>
              <div className="rd-field">
                <label>Código estudiantil</label>
                <input value={formData.codigo_estudiantil} onChange={handleChange} />
              </div>
              <div className="rd-field">
                <label>Correo institucional</label>
                <input type="email" value={formData.correo_institucional} onChange={handleChange} />
              </div>
              <div className="rd-field">
                <label>Dirección</label>
                <input value={formData.direccion} onChange={handleChange} />
              </div>
              <div className="rd-field">
                <label>Ciudad</label>
                <select value={formData.ciudad} onChange={handleChange}>
                  <option value="">Selecciona...</option>
                  <option>Bogotá</option>
                  <option>Medellín</option>
                  <option>Cali</option>
                  <option>Barranquilla</option>
                </select>
              </div>
              <div className="rd-field">
                <label>Teléfono</label>
                <input value={formData.telefono} onChange={handleChange} />
              </div>
              <div className="rd-field">
                <label>Documento identidad</label>
                <input type="file" onChange={e => handleFileChange(e, setDocumentoIdentidad)} />
              </div>
              <button type="submit" className="rd-submit">Registrarse como pasajero</button>
            </form>
          )}

          {role === 'universidad' && (
            <form className="rd-form" onSubmit={e => { e.preventDefault(); handleSubmit(); }}>
              <div className="rd-field">
                <label>Nombre oficial de la Universidad</label>
                <input value={nombreUniversidad} onChange={e => setNombreUniversidad(e.target.value)} />
              </div>
              <div className="rd-two-col">
                <div className="rd-field">
                  <label>Dirección</label>
                  <input value={direccionUniversidad} onChange={e => setDireccionUniversidad(e.target.value)} />
                </div>
                <div className="rd-field">
                  <label>Sede</label>
                  <input value={sede} onChange={e => setSede(e.target.value)} />
                </div>
              </div>
              <div className="rd-two-col">
                <div className="rd-field">
                  <label>Ciudad</label>
                  <select value={ciudadUniversidad} onChange={e => setCiudadUniversidad(e.target.value)}>
                    <option value="">Selecciona...</option>
                    <option>Bogotá</option>
                    <option>Medellín</option>
                    <option>Cali</option>
                  </select>
                </div>
                <div className="rd-field">
                  <label>Código institucional</label>
                  <input value={codigoInstitucional} onChange={e => setCodigoInstitucional(e.target.value)} />
                </div>
              </div>
              <div className="rd-two-col">
                <div className="rd-field">
                  <label>Color primario</label>
                  <select value={colorPrimario} onChange={e => setColorPrimario(e.target.value)}>
                    <option value="">Selecciona...</option>
                    <option value="#FF0000">Rojo</option>
                    <option value="#0000FF">Azul</option>
                    <option value="#008000">Verde</option>
                  </select>
                </div>
                <div className="rd-field">
                  <label>Color secundario</label>
                  <select value={colorSecundario} onChange={e => setColorSecundario(e.target.value)}>
                    <option value="">Selecciona...</option>
                    <option value="#FFFF00">Amarillo</option>
                    <option value="#FFA500">Naranja</option>
                    <option value="#800080">Morado</option>
                  </select>
                </div>
              </div>
              <div className="rd-field">
                <label>Logo Universidad</label>
                <input type="file" onChange={e => handleFileChange(e, setLogoUniversidad)} />
              </div>
              <div className="rd-field">
                <label>Documentos autorización</label>
                <input type="file" onChange={e => handleFileChange(e, setDocumentosAutorizacion)} />
              </div>
              <button type="submit" className="rd-submit">Registrarse como universidad</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}