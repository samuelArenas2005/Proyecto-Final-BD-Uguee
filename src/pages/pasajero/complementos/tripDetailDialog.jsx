import React from 'react';
import Button from '../../AuthUser/Button';
import {
  Car,
  MessageSquare,
  MapPin,
  CalendarIcon,
  Clock,
  User,  UserCircle2,Flag
} from 'lucide-react';
import './tripDetailDialog.css';

export default function TripDetailDialog({
  open,
  onOpenChange,
  tripId,
  driverData = {},
  routeData = {},
  vehicleData = {},
  onAcceptTrip,
}) {
  if (!open) return null;

  console.log(vehicleData.tipovehiculo)
  console.log(vehicleData.placa)
 
  const {
    nombre =  '—',
    avatarUrl = '/placeholder-avatar.png',
  } = driverData;

  const {
    horadesalida = '—',
    fecha = '—',
    tipoderuta = '—',
    distancia = '—',
    asientosdisponibles = 0,
  } = routeData;

  const {
    color = '—',
    marca = '—',
    modelo = '—',
    placa = '—',
    tipovehiculo = '—',
    numeroasientos = 0,
  } = vehicleData;

  
  const totalSeats = numeroasientos-1; 
  const availableSeats = asientosdisponibles;

  return (
    <div className="td-overlay">
      <div className="td-modal">
        <header className="td-header">
          <h2>Detalle del viaje</h2>
          <button className="td-close" onClick={() => onOpenChange(false)}>
            ×
          </button>
        </header>
        <div className="td-body">
          <div className="td-driver">
            <div className="td-photo-wrapper">
              <img
                src={avatarUrl}
                alt={nombre}
                className="td-photo"
              />
            </div>
            <div>
              <h3 className="td-driver-name">{nombre}</h3>
            </div>
          </div>

          {/* Información básica: Origen / Destino / Fecha / Hora */}
          <div className="td-grid td-info-grid">
            <div>
              <p className="td-label"><MapPin className="td-icon" /> Origen </p>
              <p className="td-value">
                {routeData.origen.slice(0, 20) + '...' || 'Coordenadas no disponibles'}
              </p>
            </div>
            <div>
              <p className="td-label"><Flag className="td-icon" /> Destino</p>
              <p className="td-value">
                {routeData.destino.slice(0, 20) + '...' || 'Coordenadas no disponibles'}
              </p>
            </div>
            <div>
              <p className="td-label">Fecha</p>
              <p className="td-value">
                <CalendarIcon className="td-icon" />
                {fecha}
              </p>
            </div>
            <div>
              <p className="td-label">Hora</p>
              <p className="td-value">
                <Clock className="td-icon" />
                {horadesalida}
              </p>
            </div>
          </div>

          {/* Información de vehículo */}
          <div className="td-grid td-info-grid">
            <div>
              <p className="td-label">Vehículo</p>
              <p className="td-value">{`${marca} ${modelo}`.trim()}</p>
            </div>
            <div>
              <p className="td-label">Tipo</p>
              <p className="td-value">{tipovehiculo}</p>
            </div>
            <div>
              <p className="td-label">Placa</p>
              <p className="td-value">{placa}</p>
            </div>
            <div>
              <p className="td-label">Color</p>
              <p className="td-value">{color}</p>
            </div>
          </div>

          {/* Asientos disponibles */}
          <div className="td-section">
            <p className="td-label">Asientos disponibles</p>
            <div className="td-seats">
              {Array.from({ length: totalSeats }).map((_, i) => (
                <User
                  key={i}
                  className={
                    i < availableSeats
                      ? 'td-seat-filled'
                      : 'td-seat-available'
                  }
                />
              ))}
              <span className="td-seat-text">
                {availableSeats} de {totalSeats} disponibles
              </span>
            </div>
          </div>

          {/* Datos de ruta: tipo, distancia */}
          <div className="td-section">
            <p className="td-label">Tipo de ruta</p>
            <p className="td-value">{tipoderuta}</p>
            <div className="td-route-info">
              <span>Distancia: {distancia || '—'} km</span>
            </div>
          </div>
        </div>

        <footer className="td-footer">
          <Button
            className="td-btn td-btn-primary"
            onClick={() => onAcceptTrip(tripId)}
          >
            <Car className="td-btn-icon" />Aceptar Viaje
          </Button>
        </footer>
      </div>
    </div>
  );
}
