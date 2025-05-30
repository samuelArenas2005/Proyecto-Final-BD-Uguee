// src/pages/TravelInfoPage/TravelInfoPage.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './viajeConductor.module.css';
import PassengerCard from './componentes/pasajeroCard'; // Ajusta la ruta si es necesario
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet'; 

import { MapPin, Clock, Users, QrCode, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react';

import waveImage from "../../../public/wave.svg";

// Datos de ejemplo para pasajeros
const passengersData = [
  {
    id: 1,
    name: "Juliana Rincon",
    avatarUrl: null, 
    departure: "Partida El Caney",
    destination: "Destino Univalle",
    arrivalTime: "10:10 am"
  }
];



const TravelInfoPage = () => {
  const [showNotification, setShowNotification] = useState(false);
  const mapPosition = [3.420556, -76.522222]; // Coordenadas de ejemplo (Cali)

  const handleStartTrip = () => {
    setShowNotification(true);
    setTimeout(() => {
      setShowNotification(false);
    }, 10000); // 10 segundos
  };

  return (
    <div className={styles.pageContainer}>
      <img 
        src={waveImage} 
        alt="Fondo decorativo de onda" 
        className={styles.waveBg} 
        />

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.tripInfoCard}>
            <h2 className={styles.sectionTitle}>Información de tu viaje</h2>
            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span>Avenida Ciudad de Cali</span>
            </div>
            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span>Univalle</span>
            </div>
            <div className={styles.infoItem}>
              <Clock size={20} className={styles.infoIcon} />
              <span>10:00 am</span>
            </div>
            <div className={styles.infoItem}>
              <Users size={20} className={styles.infoIcon} />
              <span>0 pasajeros</span> {/* Puedes hacerlo dinámico */}
            </div>
            <button className={styles.startButton} onClick={handleStartTrip}>
              Comenzar viaje
            </button>
          </div>

          <div className={styles.qrAndMapSection}>
            <div className={styles.qrSection}>
              <h3 className={styles.qrTitle}>Scanea el QR</h3>
              <div className={styles.qrImageContainer}>
                <QrCode size={150} color="#3A479F" />
              </div>
              <p className={styles.qrText}>
                Para obtener información de su ruta y reportes en la vía.
              </p>
              <a href="#" className={styles.appLink}>
                descarga la app aqui <ExternalLink size={14} />
              </a>
            </div>

            <div className={styles.mapWrapper}>
              <MapContainer center={mapPosition} zoom={14} scrollWheelZoom={true} className={styles.mapContainer} zoomControl={false}>
                 <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" // CARTO Positron (escala de grises sin etiquetas prominentes) 
                />
                <ZoomControl position="bottomright" />
                <Link to="/conductor/reporte" className={styles.viewReportsButtonMap}>
                  <AlertCircle size={18} /> Ver reportes en la vía
                </Link>
              </MapContainer>
            </div>
          </div>
        </div>

        <div className={styles.passengersListSection}>
          <h2 className={styles.sectionTitle}>Lista de Pasajeros</h2>
          {passengersData.length > 0 ? (
            passengersData.map(passenger => (
              <PassengerCard key={passenger.id} passenger={passenger} />
            ))
          ) : (
            <p>No hay pasajeros en este viaje.</p>
          )}
        </div>

        <div className={styles.bottomActions}>
            <Link to="/conductor" className={styles.cancelButtonLink}>
                Cancelar viaje
            </Link>
        </div>

      </div>

      {showNotification && (
        <div className={`${styles.notification} ${showNotification ? styles.notificationShow : ''}`}>
          <CheckCircle2 size={24} className={styles.notificationIcon} />
          <span>¡Viaje comenzado con éxito!</span>
        </div>
      )}
    </div>
  );
};

export default TravelInfoPage;