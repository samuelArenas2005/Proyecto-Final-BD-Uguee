import React from 'react';
import Button from '../../AuthUser/Button';
import { Car, MessageSquare, MapPin, CalendarIcon, Clock, Star, User, QrCode } from 'lucide-react';
import './tripDetailDialog.css';

const mockTrip = {
  id: 1,
  driver: 'Carlos Rodríguez',
  photo: 'https://i.pravatar.cc/150?img=3',
  vehicle: 'Toyota Corolla',
  vehicleType: 'Metropolitano',
  licensePlate: 'ABC123',
  price: 5000,
  rating: 4.8,
  origin: 'Universidad Nacional',
  destination: 'Centro Comercial',
  date: '2023-09-20',
  time: '14:30',
  availableSeats: 3,
  totalSeats: 4,
  estimatedTime: '25 min',
  distance: '8.5 km',
  routeDescription: 'Ruta por la Avenida Principal, pasando por el Parque Central',
};

export default function TripDetailDialog({ open, onOpenChange, tripId, onAcceptTrip }) {
  if (!open) return null;
  const trip = mockTrip; // In real use, fetch by tripId
  const driverId = tripId

  return (
    <div className="td-overlay">
      <div className="td-modal">
        <header className="td-header">
          <h2>Detalle del viaje</h2>
          <button className="td-close" onClick={() => onOpenChange(false)}>×</button>
        </header>
        <div className="td-body">
          <div className="td-driver">
            <div className="td-photo-wrapper">
              <img src={trip.photo} alt={trip.driver} className="td-photo" />
            </div>
            <div>
              <h3 className="td-driver-name">{trip.driver}</h3>
              <div className="td-rating">
                <Star className="td-star" />
                <span>{trip.rating}</span>
              </div>
            </div>
          </div>

          <div className="td-grid td-info-grid">
            <div>
              <p className="td-label">Origen</p>
              <p className="td-value"><MapPin className="td-icon" />{trip.origin}</p>
            </div>
            <div>
              <p className="td-label">Destino</p>
              <p className="td-value"><MapPin className="td-icon" />{trip.destination}</p>
            </div>
            <div>
              <p className="td-label">Fecha</p>
              <p className="td-value"><CalendarIcon className="td-icon" />{trip.date}</p>
            </div>
            <div>
              <p className="td-label">Hora</p>
              <p className="td-value"><Clock className="td-icon" />{trip.time}</p>
            </div>
          </div>

          <div className="td-grid td-info-grid">
            <div>
              <p className="td-label">Vehículo</p>
              <p className="td-value">{trip.vehicle}</p>
            </div>
            <div>
              <p className="td-label">Tipo</p>
              <p className="td-value">{trip.vehicleType}</p>
            </div>
            <div>
              <p className="td-label">Placa</p>
              <p className="td-value">{trip.licensePlate}</p>
            </div>
            <div>
              <p className="td-label">Precio</p>
              <p className="td-value td-price">${trip.price}</p>
            </div>
          </div>

          <div className="td-section">
            <p className="td-label">Asientos disponibles</p>
            <div className="td-seats">
              {Array.from({ length: trip.totalSeats }).map((_, i) => (
                <User
                  key={i}
                  className={i < trip.availableSeats ? 'td-seat-filled' : 'td-seat-available'}
                />
              ))}
              <span className="td-seat-text">
                {trip.availableSeats} de {trip.totalSeats} disponibles
              </span>
            </div>
          </div>

          <div className="td-section">
            <p className="td-label">Ruta</p>
            <p className="td-route">{trip.routeDescription}</p>
            <div className="td-route-info">
              <span>Tiempo estimado: {trip.estimatedTime}</span>
              <span>Distancia: {trip.distance}</span>
            </div>
          </div>
        </div>

        <footer className="td-footer">
          <Button variant="outline" className="td-btn" onClick={() => {
            }}>
            <MessageSquare className="td-btn-icon" />Mensaje al conductor
          </Button>
          <Button className="td-btn td-btn-primary" onClick={() => onAcceptTrip(driverId)}>
            <Car className="td-btn-icon" />Aceptar Viaje
          </Button>
        </footer>
      </div>
    </div>
  );
}