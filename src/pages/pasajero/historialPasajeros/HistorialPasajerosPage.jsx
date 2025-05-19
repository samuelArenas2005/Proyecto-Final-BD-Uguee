import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Car, ListFilter, Star, ListChecks, X } from 'lucide-react';
import styles from './HistorialPasajeros.module.css'; // Archivo CSS Modules

// --- Configuración del icono por defecto de Leaflet ---
// Esto evita problemas con la carga de iconos en algunos empaquetadores como Webpack.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// --- Datos de ejemplo para viajes anteriores ---
const samplePreviousTripsData = [
  {
    id: 1,
    locationName: 'Universidad del Valle',
    dateTime: '12 abr - 10:00 am',
    price: 'Gratis',
    rating: 4,
    mapData: {
      center: [3.3760, -76.5330], // Univalle Melendez
      zoom: 15,
      route: [[3.379, -76.535], [3.377, -76.534], [3.3760, -76.5330], [3.375, -76.531]],
      markers: [{ pos: [3.379, -76.535], name: "Inicio Viaje" }, { pos: [3.375, -76.531], name: "Univalle" }],
      tileProvider: 'googleStyle'
    },
    details: {
      driver: "Carlos Pérez",
      vehicle: "Mazda 3 - Placa XYZ789",
      passengers: ["Ana López", "Luis Jiménez"],
      originAddress: "Calle 100 # 20-30",
      destinationAddress: "Universidad del Valle, Sede Meléndez",
      notes: "Recoger frente a la portería principal."
    }
  },
  {
    id: 2,
    locationName: 'Centro Comercial Jardín Plaza',
    dateTime: '10 abr - 03:30 pm',
    price: '$8.000',
    rating: 5,
    mapData: {
      center: [3.370, -76.520], // Jardín Plaza Aprox
      zoom: 16,
      route: [[3.372, -76.522], [3.370, -76.520]],
      markers: [{ pos: [3.372, -76.522], name: "Origen X" }, { pos: [3.370, -76.520], name: "Jardín Plaza" }],
      tileProvider: 'osm'
    },
    details: {
      driver: "Sofía Morales",
      vehicle: "Renault Clio - Placa ABC123",
      passengers: ["Pedro Ramirez"],
      originAddress: "Av. Roosevelt # 30-15",
      destinationAddress: "Centro Comercial Jardín Plaza, Entrada 2",
      notes: "Dejar en la zona de taxis."
    }
  },
];

// --- Componente Principal ---
const BookTripPage = () => {
  const [isBookTripModalOpen, setBookTripModalOpen] = useState(false);
  const [isDetailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedTripDetails, setSelectedTripDetails] = useState(null);
  const [previousTrips, setPreviousTrips] = useState(samplePreviousTripsData);

  // Función para renderizar las estrellas de calificación
  const renderRatingStars = (rating) => {
    const totalStars = 5;
    return (
      <div className={styles.ratingStars}>
        {[...Array(totalStars)].map((_, index) => (
          <Star
            key={index}
            size={18}
            className={index < rating ? styles.filledStar : styles.emptyStar}
          />
        ))}
      </div>
    );
  };

  // Función para manejar la apertura del modal de detalles
  const handleOpenDetailsModal = (trip) => {
    setSelectedTripDetails(trip);
    setDetailsModalOpen(true);
  };

  // Función para manejar el envío del formulario de reserva
  const handleBookTripSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData(event.target);
    const bookingData = {
      origin: formData.get('origin'),
      destination: formData.get('destination'),
      date: formData.get('date'),
      time: formData.get('time'),
      passengers: formData.get('passengers'),
    };
    console.log('Datos de la reserva:', bookingData);
    // Aquí iría la lógica para enviar los datos al backend
    setBookTripModalOpen(false);
    alert('Viaje reservado exitosamente (simulado).');
  };


  // SVG de la Ola
  const WaveSvg = () => (
    <svg className={styles.waveSvg} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
      <path fill="#7150B0" fillOpacity="1" d="M0,224L80,213.3C160,203,320,181,480,197.3C640,213,800,267,960,266.7C1120,267,1280,213,1360,186.7L1440,160L1440,0L1360,0C1280,0,1120,0,960,0C800,0,640,0,480,0C320,0,160,0,80,0L0,0Z"></path>
    </svg>
  );

  return (
    <div className={styles.pageContainer}>
      {/* Sección del Encabezado con Ola */}
      <div className={styles.headerSection}>
        <WaveSvg />
        <h1 className={styles.mainTitle}>Reservar viaje</h1>
      </div>

      {/* Contenido Principal de la Página */}
      <div className={styles.contentWrapper}>
        {/* Sección "No tienes viajes programados" */}
        <section className={styles.noScheduledTrips}>
          <div className={styles.illustrationPlaceholder}>
            {/* Idealmente aquí iría una ilustración SVG importada o un componente de ilustración */}
            <Car size={50} strokeWidth={1.5} />
          </div>
          <h2>No tienes viajes programados próximamente</h2>
          <button className={styles.bookTripButtonLarge} onClick={() => setBookTripModalOpen(true)}>
            <Car size={20} />
            Reservar viaje
          </button>
        </section>

        {/* Sección "Registro de viajes anteriores" */}
        <section className={styles.previousTripsSection}>
          <div className={styles.previousTripsHeader}>
            <h2>Registro de viajes anteriores</h2>
            <button className={styles.filterButton}>
              <ListFilter size={18} />
              Todos los viajes
            </button>
          </div>
          <div className={styles.tripList}>
            {previousTrips.map((trip) => (
              <div key={trip.id} className={styles.tripCard}>
                <div className={styles.mapContainer}>
                  {trip.mapData && trip.mapData.center && (
                    <MapContainer
                      center={trip.mapData.center}
                      zoom={trip.mapData.zoom}
                      style={{ height: '100%', width: '100%' }}
                      scrollWheelZoom={false}
                      dragging={false}
                      doubleClickZoom={false}
                      attributionControl={false}
                      whenCreated={mapInstance => { /* Se puede usar para interacciones futuras */ }}
                    >
                      <TileLayer
                        url={
                          trip.mapData.tileProvider === 'googleStyle'
                            ? 'https://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}'
                            : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                        }
                        subdomains={trip.mapData.tileProvider === 'googleStyle' ? ['mt0', 'mt1', 'mt2', 'mt3'] : ['a', 'b', 'c']}
                      />
                      {trip.mapData.route && <Polyline positions={trip.mapData.route} color="#7150B0" weight={5} />}
                      {trip.mapData.markers && trip.mapData.markers.map((marker, idx) => (
                        <Marker key={idx} position={marker.pos}></Marker>
                      ))}
                    </MapContainer>
                  )}
                </div>
                <div className={styles.tripInfo}>
                  <h3>{trip.locationName}</h3>
                  <p className={styles.dateTime}>{trip.dateTime}</p>
                  <p className={styles.price}>{trip.price}</p>
                  {renderRatingStars(trip.rating)}
                </div>
                <button className={styles.detailsButton} onClick={() => handleOpenDetailsModal(trip)}>
                  <ListChecks size={18} />
                  Detalles
                </button>
              </div>
            ))}
            {previousTrips.length === 0 && <p className={styles.noTripsMessage}>No hay viajes en tu historial.</p>}
          </div>
        </section>
      </div>

      {/* Modal para Reservar Viaje */}
      {isBookTripModalOpen && (
        <div className={styles.modalOverlay} onClick={() => setBookTripModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Reservar un Nuevo Viaje</h2>
              <button onClick={() => setBookTripModalOpen(false)} className={styles.modalCloseButton} aria-label="Cerrar modal">
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <form onSubmit={handleBookTripSubmit} className={styles.bookingForm}>
                <div className={styles.formGroup}>
                  <label htmlFor="origin">Origen:</label>
                  <input type="text" id="origin" name="origin" placeholder="Ej: Calle Falsa 123" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="destination">Destino:</label>
                  <input type="text" id="destination" name="destination" placeholder="Ej: Universidad del Valle" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="date">Fecha:</label>
                  <input type="date" id="date" name="date" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="time">Hora:</label>
                  <input type="time" id="time" name="time" required />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="passengers">Número de Pasajeros:</label>
                  <input type="number" id="passengers" name="passengers" min="1" defaultValue="1" required />
                </div>
                <button type="submit" className={styles.submitBookingButton}>Confirmar Reserva</button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal para Detalles del Viaje */}
      {isDetailsModalOpen && selectedTripDetails && (
        <div className={styles.modalOverlay} onClick={() => setDetailsModalOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Detalles del Viaje a {selectedTripDetails.locationName}</h2>
              <button onClick={() => setDetailsModalOpen(false)} className={styles.modalCloseButton} aria-label="Cerrar modal">
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <div className={styles.tripDetailsContent}>
                <p><strong>Fecha y Hora:</strong> {selectedTripDetails.dateTime}</p>
                <p><strong>Precio:</strong> {selectedTripDetails.price}</p>
                <p><strong>Calificación:</strong> {selectedTripDetails.rating} de 5 estrellas {renderRatingStars(selectedTripDetails.rating)}</p>
                <hr className={styles.detailsSeparator}/>
                <p><strong>Conductor:</strong> {selectedTripDetails.details?.driver || 'No especificado'}</p>
                <p><strong>Vehículo:</strong> {selectedTripDetails.details?.vehicle || 'No especificado'}</p>
                <p><strong>Pasajeros:</strong> {selectedTripDetails.details?.passengers?.join(', ') || 'No especificado'}</p>
                <hr className={styles.detailsSeparator}/>
                <p><strong>Origen:</strong> {selectedTripDetails.details?.originAddress || 'No especificado'}</p>
                <p><strong>Destino:</strong> {selectedTripDetails.details?.destinationAddress || 'No especificado'}</p>
                {selectedTripDetails.details?.notes && <p><strong>Notas:</strong> {selectedTripDetails.details.notes}</p>}
              </div>
               <button className={styles.modalActionButton} onClick={() => { alert('Acción adicional, por ejemplo, contactar al conductor.'); setDetailsModalOpen(false); }}>
                Contactar Conductor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookTripPage;