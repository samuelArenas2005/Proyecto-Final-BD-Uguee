import React from 'react';
import { Link } from 'react-router-dom';
import styles from './reporteVia.module.css';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';

// Iconos de Lucide React
import {
  MapPin,
  Clock,
  Users,
  QrCode,
  AlertTriangle,
  X as XIcon
} from 'lucide-react';

// --- IMPORTANTE: Importa tu imagen de onda aquí ---
// Ejemplo: Asegúrate de tener esta imagen en tu proyecto
import waveImage from '../../../public/wave.svg'; // CAMBIA ESTO por tu imagen real

// Configuración para evitar problemas con el icono por defecto de Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const trafficIconHtml = `
  <div style="
    background-color: #6A0DAD;
    color: white;
    border-radius: 50%;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    font-weight: bold;
    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    border: 2px solid white;
  ">!</div>
`;

const customTrafficIcon = new L.DivIcon({
  html: trafficIconHtml,
  className: '',
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const DetailedTravelPage = () => {
  const mapCenter = [3.3984, -76.5215];
  const trafficMarkerPosition = [3.3950, -76.5050];

  return (
    <div className={styles.pageOverlay}>
         <img src={waveImage} alt="Ola decorativa" className={styles.waveBg} />
      <div className={styles.modalContainer}>
        {/* Ola decorativa usando la etiqueta <img> */}
       
        
        <Link to="/conductor/viaje" className={styles.closeButton}>
          <XIcon size={30} /> {/* Tamaño ligeramente ajustado si es necesario */}
        </Link>

        <div className={styles.contentWrapper}>
          <div className={styles.leftColumn}>
            <section className={styles.tripInfoSection}>
              <h2 className={styles.mainTitle}>Información de tu viaje</h2>
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
                <span>0 pasajeros</span>
              </div>
            </section>

            <section className={styles.qrSection}>
              <h3 className={styles.qrTitle}>Scanea el QR</h3>
              <div className={styles.qrCodeContainer}>
                <QrCode size={110} className={styles.qrIcon} />
              </div>
              <p className={styles.qrText}>
                Para realizar más reportes en la vía y obtener mayor información
              </p>
              <a href="#" className={styles.appLink}>
                descarga la app aqui
              </a>
            </section>
          </div>

          <div className={styles.rightColumn}>
            <button className={styles.reportsButton}>
              <AlertTriangle size={20} className={styles.reportIcon} />
              Reportes en la vía
            </button>
            <div className={styles.mapView}>
              <MapContainer 
                center={mapCenter} 
                zoom={14} 
                className={styles.mapContainer}
                zoomControl={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <ZoomControl position="bottomright" />
                <Marker position={trafficMarkerPosition} icon={customTrafficIcon}>
                  <Popup>
                    <span style={{fontWeight: 'bold'}}>Tráfico en la zona</span><br/>
                    Hay congestión vehicular en esta área.
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailedTravelPage;