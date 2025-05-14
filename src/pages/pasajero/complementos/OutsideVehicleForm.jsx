import React, { useState } from 'react';
import Button from '../../AuthUser/Button';
import './OutsideVehicleForm.css';

export default function OutsideVehicleForm({ onSubmit, onCancel }) {
  const [vehicleType, setVehicleType] = useState('');
  const [tripType, setTripType] = useState('');
  const [color, setColor] = useState('');
  const [plate, setPlate] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [soatDate, setSoatDate] = useState('');
  const [techDate, setTechDate] = useState('');
  const [vehiclePhoto, setVehiclePhoto] = useState(null);
  const [licensePhoto, setLicensePhoto] = useState(null);
  const [tooltip, setTooltip] = useState('');

  const handleFile = (e, setter) => {
    const file = e.target.files?.[0];
    if (file && ['image/jpeg','image/png','application/pdf'].includes(file.type)) setter(file);
    else alert('Formato no permitido');
  };

  const dropdown = (options, value, setValue) => (
    <div className="ovf-select">
      <div className="ovf-trigger" onClick={() => setTooltip('')}>{value || 'Selecciona...'}</div>
      <div className="ovf-options">
        {options.map(opt => (
          <div key={opt} className="ovf-option" onClick={() => setValue(opt)}>{opt}</div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="ovf-container">
      <h3>Información del vehículo fuera del campus</h3>

      <div className="ovf-field">
        <label>Tipo de vehículo</label>
        {dropdown(['Carro','Camioneta','Motocicleta','Furgoneta'], vehicleType, setVehicleType)}
      </div>
      <div className="ovf-field">
        <label>Tipo de viaje</label>
        {dropdown(['Dentro de la ciudad','Fuera de la ciudad'], tripType, setTripType)}
      </div>
      <div className="ovf-field">
        <label>Color del vehículo</label>
        {dropdown(['Blanco','Negro','Gris','Rojo','Azul','Verde','Amarillo','Otro'], color, setColor)}
      </div>
      <div className="ovf-field">
        <label>Número de placa</label>
        <input value={plate} onChange={e => setPlate(e.target.value)} placeholder="ABC-123" />
      </div>
      <div className="ovf-field">
        <label>Marca</label>
        <input value={brand} onChange={e => setBrand(e.target.value)} placeholder="Toyota" />
      </div>
      <div className="ovf-field">
        <label>Modelo</label>
        <input value={model} onChange={e => setModel(e.target.value)} placeholder="Corolla 2020" />
      </div>
      <div className="ovf-field ovf-date">
        <label>Vigencia SOAT</label>
        <input type="date" value={soatDate} onChange={e => setSoatDate(e.target.value)} />
      </div>
      <div className="ovf-field ovf-date">
        <label>Vencimiento técnico</label>
        <input type="date" value={techDate} onChange={e => setTechDate(e.target.value)} />
      </div>
      <div className="ovf-field">
        <label>Foto del vehículo <span className="ovf-info" onMouseEnter={() => setTooltip('Vehículo: PDF,JPG,PNG')} onMouseLeave={() => setTooltip('')}>ℹ︎</span></label>
        {tooltip && <div className="ovf-tooltip">{tooltip}</div>}
        <input type="file" onChange={e => handleFile(e, setVehiclePhoto)} />
      </div>
      <div className="ovf-field">
        <label>Foto de la licencia <span className="ovf-info" onMouseEnter={() => setTooltip('Licencia vigente: PDF,JPG,PNG')} onMouseLeave={() => setTooltip('')}>ℹ︎</span></label>
        {tooltip && <div className="ovf-tooltip">{tooltip}</div>}
        <input type="file" onChange={e => handleFile(e, setLicensePhoto)} />
      </div>
      <div className="ovf-actions">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>Enviar solicitud</Button>
      </div>
    </div>
  );
}