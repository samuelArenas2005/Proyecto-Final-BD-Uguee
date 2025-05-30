// src/components/RutasPage/RutasPage.jsx
import React, { useState, useEffect } from 'react';
import styles from './conductor.module.css';
import { MapPin, Clock, SlidersHorizontal, Search } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from 'react-leaflet';
import RutaAnteriorCard from './componentes/RutaAnteriorCard';
import ControlDeRuta from './componentes/controlDeRuta';
import SuccessModal from './componentes/succes';
import wave from "../../../public/wave.svg";
import iconoSalidaimg from "../../../public/salidaicono.png";
import iconoLlegadaimg from "../../../public/llegadaicono.png";
import FilterDialog from '../pasajero/complementos/filterDialog';


// Componente para ajustar el centrado del mapa cuando cambian las coordenadas
const ChangeView = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};



const ConductorPage = () => {

  const handleSearchTrip = () => {
    console.log('Buscando viaje desde:', startPoint, 'hasta:', destination);
    // Lógica de búsqueda aquí
  };

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);

  const start = [0, -76.52894062328538];
  const end   = [0, -76.53804766609106];

  const iconoSalida = new L.Icon({
    iconUrl: iconoSalidaimg,
    iconSize: [19/1.5,32/1.5],     // tamaño del icono
    iconAnchor: [20, 40],   // punto del icono que corresponde a la posición [lat, lng]
  });

  const iconoLLegada = new L.Icon({
    iconUrl: iconoLlegadaimg,
    iconSize: [35/1.5, 35/1.5],     // tamaño del icono
    iconAnchor: [20, 40],   // punto del icono que corresponde a la posición [lat, lng]
  });


  const [origin, setOrigin] = useState('Avenida Ciudad de Cali');
  const [destination, setDestination] = useState('Univalle');
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Mes es 0-indexado
    const day = now.getDate().toString().padStart(2, '0');
    const hours = '10';
    const minutes = '00';
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [mapCenter, setMapCenter] = useState([3.3745, -76.5308]); // Coordenadas aproximadas de Univalle Cali
  const [mapZoom, setMapZoom] = useState(14);

  const handleEstablecerRuta = () => {
    console.log('Estableciendo ruta:', { origin, destination, dateTime });
    // Aquí podrías añadir lógica para interactuar con el mapa o backend
    // Por ejemplo, cambiar el centro del mapa basado en la ruta
    if (destination.toLowerCase().includes('univalle')) {
        setMapCenter([3.3745, -76.5308]); // Univalle
    } else if (origin.toLowerCase().includes('cali')) {
        setMapCenter([3.420556, -76.522222]); // Cali centro (ejemplo)
    }
    setShowSuccessModal(true);
  };

  const handleCloseModal = () => {
    setShowSuccessModal(false);
  };

  const rutasAnterioresData = [
    {
      id: 1,
      title: 'Ruta 1',
      origin: 'Partida El Caney',
      destination: 'Destino Univalle',
      departureTime: 'Lunes, 10:00 am',
    },
    {
      id: 2,
      title: 'Ruta 2',
      origin: 'Partida El Caney',
      destination: 'Destino Univalle',
      departureTime: 'Martes, 8:00 am',
    },
  ];

  return (
    <div className={styles.pageContainer}>

      <div className={styles.topSectionWave}>
     <img src={wave} alt="Descripción del ícono" width={50} height={50} className={styles.waveBg} />
        <div className={styles.contentWrapper}>
              
          <div className={styles.routeSetupSection}>
            <h2 className={styles.greeting}>¡Hola Miguel Andrade! Establece tu ruta de hoy</h2>
            <div className={styles.inputGroup}>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={origin}
                  onChange={(e) => setOrigin(e.target.value)}
                  placeholder="Punto de partida"
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputWrapper}>
                <MapPin className={styles.inputIcon} size={20} />
                <input
                  type="text"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  placeholder="Destino"
                  className={styles.inputField}
                />
              </div>
              <div className={styles.inputWrapper}>
                <Clock className={styles.inputIcon} size={20} />
                <input
                  type="datetime-local"
                  value={dateTime}
                  onChange={(e) => setDateTime(e.target.value)}
                  className={styles.inputField}
                />
              </div>
            </div>
            <div className={styles.buttonGroup}>
            <button className={styles.submitButton} onClick={handleSearchTrip}>
                Establecer ruta
            </button>
            <button
              className={styles.filterButton}
              onClick={() => setIsFilterDialogOpen(true)}
              aria-label="Filtros"
            >
              <SlidersHorizontal size={20} />
            </button>
          </div>
          </div>

          <div className={styles.mapSection}>
            <MapContainer className={styles.mapContainer} center={mapCenter} zoom={mapZoom} scrollWheelZoom={true}>
              <ChangeView center={mapCenter} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" // CARTO Positron (escala de grises sin etiquetas prominentes) 
              />
            
            
            </MapContainer>
          </div>
        </div>
      </div>

      <div className={styles.previousRoutesSection}>
        <h2 className={styles.sectionTitle}>Rutas anteriores</h2>
        <div className={styles.cardsGrid}>
          {rutasAnterioresData.map((ruta) => (
            <RutaAnteriorCard
              key={ruta.id} 
              routeData={ruta}
              onEstablecerRuta={handleEstablecerRuta}
            />
          ))}
        </div>
      </div>

      <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
      <FilterDialog
              open={isFilterDialogOpen}
              onOpenChange={setIsFilterDialogOpen}
            />
    </div>
  );
};

export default ConductorPage;