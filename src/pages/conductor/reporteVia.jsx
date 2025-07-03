import React from 'react';
import { Link } from 'react-router-dom';
import styles from './reporteVia.module.css';

import {
  GoogleMap,
  LoadScript,
  MarkerF,
  InfoWindowF
} from '@react-google-maps/api';

/**
 * Juan Manuel Ampudia
 * con MarkerF y InfoWindoWf puedes colocar marcas en el mapa, cuya ubicacion se puede ver en la
 * tabla de pqrs de nuestra base de datos, abria entonces que mirar que reportes son del tipo 
 * trafico en la via o choques etc....
 * este tambien tiene una latitud y longitud para obtener las coordenadas
 * 
 * Si te vas a page/universidad/monitero.jsx puedes encontrar un ejemplo que utiliza las marcas y las ventanas
 * ahi le explico a daniel como obtener la informacion, sin embargo mas abajo de estas puedes encotnrar en el elemento
 * googleMap el uso de MarkerF e INfoWindowF y como establecerles una ubicacion e incluso un icono
 * 
 * asi mismo sera para el componente googleMap de aca, asi entonces deberas crear un arreglo de objeto literal 
 * que contenga la inforamcion que requieres desde la base de datos, si acaso me preguntas...
 * 
 * a y pon mapCenter en la ubicacion actual del conductor, para obtener info del conductor lo puedes hacer con auth.user, mira en 
 * conductor.jsx ejemplos o preguntale alguna IA.
 * 
 * para iconos como trafico o choques si quieres descargalos de canva y lo pones en la carpeta public con el resto de archivos(procura que
 * se la public de la pagina web y no de la carpeta mobile)
 */

const apigoogle = import.meta.env.VITE_APIS_GOOGLE; 
const mapCustomStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
/* const libraries = ['places'];
const DEFAULT_CENTER = { lat: 4.624335, lng: -74.063644 }; */

// Iconos de Lucide React
import {
  MapPin,
  Clock,
  Users,
  QrCode,
  AlertTriangle,
  X as XIcon
} from 'lucide-react';

import waveImage from '../../../public/wave.svg'; 

const DetailedTravelPage = () => {
  const libraries = ['places'];
  const mapCenter = { lat: 4.624335, lng: -74.063644 }; 
  const trafficMarkerPosition = [3.3950, -76.5050];

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
    <div className={styles.pageOverlay}>
         <img src={waveImage} alt="Ola decorativa" className={styles.waveBg} />
      <div className={styles.modalContainer}>
        
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
              <GoogleMap
                center={mapCenter}
                zoom={16}
                mapContainerClassName={styles.mapContainer}
                options={{
                  styles: mapCustomStyles,
                  disableDefaultUI: true,
                  zoomControl: true
                }}
              >
              </GoogleMap>
            </div>
          </div>
        </div>
      </div>
    </div>
    </LoadScript>
  );
};

export default DetailedTravelPage;