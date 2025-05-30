import React, { useState } from 'react';
import Button from '../../AuthUser/Button';
import './filterDialog.css';

export default function FilterDialog({ open, onOpenChange }) {
  const [maxPrice, setMaxPrice] = useState(15000);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [onlyHighRated, setOnlyHighRated] = useState(false);

  const toggleVehicleType = type => {
    setVehicleTypes(prev =>
      prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type]
    );
  };
  const toggleTimeSlot = slot => {
    setTimeSlots(prev =>
      prev.includes(slot) ? prev.filter(s => s !== slot) : [...prev, slot]
    );
  };

  if (!open) return null;

  return (
    <div className="fd-overlay">
      <div className="fd-modal">
        <h2 className="fd-title">Filtros de búsqueda</h2>
        <div className="fd-content">
          <div className="fd-section">
            <div className="fd-label">Tipo de vehículo</div>
            <div className="fd-tags">
              {['Intermunicipal','Metropolitano','Campus'].map(type => (
                <Button
                  key={type}
                  variant={vehicleTypes.includes(type) ? 'solid' : 'outline'}
                  className="fd-tag"
                  onClick={() => toggleVehicleType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>

          <div className="fd-section">
            <div className="fd-label">Precio máximo</div>
            <input
              type="range"
              min="0"
              max="30000"
              step="1000"
              value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)}
              className="fd-slider"
            />
            <div className="fd-slider-values">
              <span>$0</span>
              <span>${maxPrice.toLocaleString()}</span>
              <span>$30.000</span>
            </div>
          </div>

          <div className="fd-section">
            <div className="fd-label">Horario de salida</div>
            <div className="fd-tags">
              <input type="time" min="08:00" max="18:00" step="600"></input>
            </div>
          </div>

          <div className="fd-section fd-row">
            <div>
              <div className="fd-label">Solo conductores bien valorados</div>
              <div className="fd-desc">Conductores con al menos 4.5 estrellas</div>
            </div>
            <label className="fd-switch">
              <input
                type="checkbox"
                checked={onlyHighRated}
                onChange={e => setOnlyHighRated(e.target.checked)}
              />
              <span className="fd-slider-switch"></span>
            </label>
          </div>
        </div>

        <div className="fd-footer">
          <Button variant="outline" className="fd-button" onClick={() => {
            setVehicleTypes([]);
            setTimeSlots([]);
            setMaxPrice(15000);
            setOnlyHighRated(false);
          }}>
            Reiniciar filtros
          </Button>
          <Button className="fd-button fd-apply" onClick={() => onOpenChange(false)}>
            Aplicar filtros
          </Button>
        </div>
      </div>
    </div>
  );
}