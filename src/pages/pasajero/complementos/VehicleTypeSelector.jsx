import React, { useState } from "react";
import Button from "../../AuthUser/Button";
import { Car, Bike } from "lucide-react";
import "./VehicleTypeSelector.css";

export default function VehicleTypeSelector({ onSelect }) {
  const [tooltipVisible, setTooltipVisible] = useState(false);

  return (
    <div className="vts-container">
      <h3 className="vts-title">¿Qué tipo de vehículo vas a conducir?</h3>
      <div className="vts-grid">
        <div className="vts-card" onClick={() => onSelect("outside")}>
          <Car className="vts-icon" />
          <div className="vts-text">
            <h4 className="vts-heading">Vehículo fuera del campus</h4>
            <p className="vts-desc">Carro, Motocicleta, etc.</p>
          </div>
          <Button variant="outline" className="vts-btn">
            Seleccionar
          </Button>
        </div>
        <div className="vts-card" onClick={() => onSelect("campus")}>
          <Bike className="vts-icon" />
          <div className="vts-text">
            <h4 className="vts-heading">Vehículo dentro del campus</h4>
            <p className="vts-desc">Patineta, Bicicleta, etc.</p>
          </div>
          <Button variant="outline" className="vts-btn">
            Seleccionar
          </Button>
        </div>
      </div>
      <div className="vts-footer">
        <span
          className="vts-info"
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => setTooltipVisible(false)}
        >
          ℹ︎
        </span>
        {tooltipVisible && (
          <div className="vts-tooltip">
            Selecciona el tipo de vehículo que utilizarás para prestar el
            servicio de transporte.
          </div>
        )}
        <span className="vts-helper">
          Selecciona la opción que mejor se adapte a tu vehículo
        </span>
      </div>
    </div>
  );
}
