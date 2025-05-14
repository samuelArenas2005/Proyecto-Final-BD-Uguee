import React, { useState } from 'react';
import Button from '../../AuthUser/Button';
import './CampusVehicleForm.css';

export default function CampusVehicleForm({ onSubmit, onCancel }) {
  const [file, setFile] = useState(null);
  const [vehicleType, setVehicleType] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [isVehicleTypeOpen, setIsVehicleTypeOpen] = useState(false);
  const [isConditionOpen, setIsConditionOpen] = useState(false);

  const handleFileChange = e => {
    const selected = e.target.files?.[0];
    if (selected) {
      const t = selected.type;
      if (['image/jpeg', 'image/png', 'application/pdf'].includes(t)) setFile(selected);
      else alert('Por favor, sube un archivo PDF, JPG o PNG');
    }
  };

  const toggleVehicleTypeOptions = () => {
    setIsVehicleTypeOpen(!isVehicleTypeOpen);
    setIsConditionOpen(false); // Close other dropdown when this one opens
    setTooltipVisible(false); // Close tooltip if open
  };

  const toggleConditionOptions = () => {
    setIsConditionOpen(!isConditionOpen);
    setIsVehicleTypeOpen(false); // Close other dropdown when this one opens
    setTooltipVisible(false); // Close tooltip if open
  };

  return (
    <div className="cvf-container">
      <h3 className="cvf-title">Información del vehículo dentro del campus</h3>

      <div className="cvf-field">
        <label>Tipo de vehículo</label>
        <div className="cvf-select">
          <div className="cvf-trigger" onClick={toggleVehicleTypeOptions}>
            {vehicleType || 'Selecciona un tipo'}
            <span className="cvf-arrow">▾</span>
          </div>
          {isVehicleTypeOpen && (
            <div className="cvf-options">
              {['Bicicleta', 'Patineta', 'Scooter eléctrico', 'Patines', 'Otro'].map(opt => (
                <div key={opt} className="cvf-option" onClick={() => { setVehicleType(opt); setIsVehicleTypeOpen(false); }}>{opt}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cvf-field">
        <label>Marca del vehículo</label>
        <input
          type="text"
          value={brand}
          onChange={e => setBrand(e.target.value)}
          placeholder="Ej: Trek, Xiaomi, etc."
        />
      </div>

      <div className="cvf-field">
        <label>Estado del vehículo</label>
        <div className="cvf-select">
          <div className="cvf-trigger" onClick={toggleConditionOptions}>
            {condition || 'Selecciona un estado'}<span className="cvf-arrow">▾</span>
          </div>
          {isConditionOpen && (
            <div className="cvf-options">
              {['Nuevo', 'Buen estado', 'Estado regular', 'Mal estado'].map(opt => (
                <div key={opt} className="cvf-option" onClick={() => { setCondition(opt); setIsConditionOpen(false); }}>{opt}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="cvf-field">
        <div className="cvf-label-with-tooltip">
          <label>Foto del vehículo</label>
          <span
            className="cvf-info"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
          >ℹ︎</span>
          {tooltipVisible && (
            <div className="cvf-tooltip">
              Sube una foto clara y reciente de tu vehículo donde se vea completamente.
              Formatos permitidos: PDF, JPG o PNG.
            </div>
          )}
        </div>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
        {file && <p className="cvf-file">Archivo seleccionado: {file.name}</p>}
      </div>

      <div className="cvf-actions">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={onSubmit}>Enviar solicitud</Button>
      </div>
    </div>
  );
}