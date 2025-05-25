import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, ZoomControl, Marker } from 'react-leaflet';
import { MapPin, Search, SlidersHorizontal, MoreVertical, UserCircle2, Clock, Star, QrCode, X, Car} from 'lucide-react';
import FilterDialog from "./complementos/filterDialog";
import TripDetailDialog from "./complementos/tripDetailDialog";
import styles from './pasajero.module.css'
import car from "../../../public/car.png";
import carIcono from "../../../public/carIcono.png";
import wave from "../../../public/wave2.svg";



const mockDrivers = [
  {
    id: 'driver1',
    name: 'Nicolas Arenas',
    location: 'Ave. Ciudad de Cali',
    avatar: null, // Puedes poner una URL a una imagen o usar un icono por defecto
  },
  {
    id: 'driver2',
    name: 'Miguel Andrade',
    location: 'Carrera 82',
    avatar: null,
  },
  {
    id: 'driver3',
    name: 'Juliana Rincon',
    location: 'Ave. Ciudad de Cali',
    avatar: null,
  },
  {
    id: 'driver4',
    name: 'Carlos Vélez',
    location: 'Calle 5ta',
    avatar: null,
  }
];

 // Datos de ejemplo (idealmente vendrían de props o un estado global)
const driverData = {
    name: "Nicolas Arenas",
    location: "Ave. Ciudad de Cali",
    avatarUrl: "https://i.pravatar.cc/150?img=56", // Avatar de ejemplo
    rating: 4.88,
    car: {
      plate: "PLA234",
      model: "Ford Explore Blanca",
      imageUrl: car 
    },
    eta: "10:00 am - 10:10 am",
    price: "Gratis"
  };

const TravelPage = () => {

  const [markerPos, setMarkerPos] = useState([3.385652986516403, -76.52930740707798]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkerPos(([lat, lng]) => [
        lat - 5 * 0.0001,
        lng
      ]);
    }, 1000000);

    return () => clearInterval(interval);
  }, []);


  const carDivIcon = new L.Icon({
  iconUrl: carIcono,
  iconSize: [56/1.5, 94/1.5],     // tamaño del icono
  iconAnchor: [20, 40],   // punto del icono que corresponde a la posición [lat, lng]
});

  const [showQrModal, setShowQrModal] = useState(false);

  const handleOpenQrModal = () => setShowQrModal(true);
  const handleCloseQrModal = () => setShowQrModal(false);
 
  
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [mapCenter, setMapCenter] = useState([3.399206, -76.522093]); // Centro aproximado (Valle de Lili, Cali)
  const [mapZoom, setMapZoom] = useState(14);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isTripDetailDialogOpen, setIsTripDetailDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);

  const [acceptedTripId, setAcceptedTripId] = useState(null);

  // Simulación para centrar el mapa si se busca (opcional)
  // useEffect(() => {
  //   // Aquí podrías usar una API de geocodificación si el usuario escribe una dirección
  //   // y luego actualizar mapCenter.
  // }, [destination]);

  const handleSearchTrip = () => {
    console.log('Buscando viaje desde:', startPoint, 'hasta:', destination);
    // Lógica de búsqueda aquí
  };

  const openTripDetailDialog = (tripId) => {
    setSelectedTripId(tripId);
    setIsTripDetailDialogOpen(true);
  };

   const handleAcceptTrip = (tripId) => {
    setAcceptedTripId(tripId);
    setIsTripDetailDialogOpen(false);
  };

  return (
    
    <div className={styles.travelPageContainer}>

          
      <div className={styles.leftPanel}>

        <div className={styles.tripRequestCard}>
          
          <h2>Solicita tu viaje</h2>
          <div className={styles.inputGroup}>
            <MapPin size={20} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Punto de partida"
              value={startPoint}
              onChange={(e) => setStartPoint(e.target.value)}
              className={styles.inputField}
            />
          </div>
          <div className={styles.inputGroup}>
            <MapPin size={20} className={styles.inputIcon} />
            <input
              type="text"
              placeholder="Destino"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className={styles.inputField}
            />
          </div>
          <div className={styles.buttonGroup}>
            <button className={styles.searchButton} onClick={handleSearchTrip}>
              <Search size={18} style={{ marginRight: '8px' }} />
              Buscar
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

        {acceptedTripId ? (


           <div className={styles.cardContainer}>
      <h2 className={styles.mainTitle}>Conductor Elegido</h2>

      <div className={styles.driverSection}>
        <img src={driverData.avatarUrl} alt={driverData.name} className={styles.driverAvatarBig} />
        <div className={styles.driverInfoBig}>
          <p className={styles.driverNameBig}>{driverData.name}</p>
          <div className={styles.locationRow}>
            <MapPin size={16} className={styles.locationIcon} />
            <p className={styles.driverLocation}>{driverData.location}</p>
          </div>
        </div>
      </div>

      <div className={styles.vehicleDetailsSectionWrapper}>
        <div className={styles.driverAvatarRatingColumn}>
              <img src={driverData.avatarUrl} alt="" className={styles.driverAvatarSmall} />
              <div className={styles.ratingBadge}>
                  <Star size={12} className={styles.starIcon} fill="#AA00FF" color="#AA00FF" />
                  <span className={styles.ratingText}>{driverData.rating.toFixed(2)}</span>
              </div>
        </div>
        <div className={styles.carImageColumn}>
            <img src={driverData.car.imageUrl} alt={driverData.car.model} className={styles.carImage} />
        </div>
        <div className={styles.vehicleTextInfoColumn}>
            <p className={styles.carPlate}>{driverData.car.plate}</p>
            <p className={styles.carModel}>{driverData.car.model}</p>
            <p className={styles.priceInfo}>{driverData.price}</p>
        </div>
      </div>

      <div className={styles.etaSection}>
        <Clock size={24} className={styles.clockIconDetails} />
        <div className={styles.etaTextContainer}>
          <p className={styles.etaTitle}>Tiempo estimado de salida</p>
          <p className={styles.etaTime}>{driverData.eta}</p>
        </div>
      </div>

      <input type="text" placeholder='Enviar mensaje al conductor' className={styles.messageButton}></input>

      <div className={styles.actionButtons}>
        <button className={styles.cancelButton} onClick={() => {
            setAcceptedTripId(null);   
          }}>
          Cancelar viaje
        </button>
        <button className={styles.qrButton} onClick={handleOpenQrModal}>
          <QrCode size={20} className={styles.qrIcon}/> ver QR
        </button>
      </div>

      {showQrModal && (
        <div className={styles.modalOverlay} onClick={handleCloseQrModal}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Código QR del Viaje</h3>
              <button onClick={handleCloseQrModal} className={styles.closeModalButton}>
                <X size={24} />
              </button>
            </div>
            <div className={styles.modalBody}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ViajeConductor:${encodeURIComponent(driverData.name)}-Placa:${encodeURIComponent(driverData.car.plate)}`}
                alt="Código QR"
                className={styles.qrImageModal}
              />
              <p className={styles.qrHelpText}>Scanea este QR en la App para seguir el viaje.</p>
            </div>
          </div>
        </div>
      )}
    </div>
        ) : (
        <div className={styles.driverOptionsCard}>
          <h3>Opciones de conductores</h3>
          <div className={styles.driverList}>
            {mockDrivers.map((driver) => (
              <div key={driver.id} className={styles.driverItem}>
                <div className={styles.driverInfo}>
                  {driver.avatar ? (
                    <img src={driver.avatar} alt={driver.name} className={styles.driverAvatar} />
                  ) : (
                    <UserCircle2 size={36} className={styles.driverAvatarDefault} />
                  )}
                  <div className={styles.driverText}>
                    <span className={styles.driverName}>{driver.name}</span>
                    <span className={styles.driverLocation}>
                      <MapPin size={12} style={{ marginRight: '4px', color: '#6b7280' }} />
                      {driver.location}
                    </span>
                  </div>
                </div>
                <button
                  className={styles.driverMoreButton}
                  onClick={() => openTripDetailDialog(driver.id)}
                  aria-label={`Más opciones para ${driver.name}`}
                >
                  <MoreVertical size={20} />
                </button>
              </div>
            ))}
          </div>
        </div>
        )}
      </div>
    

      <div className={styles.rightPanelMap}>
        <MapContainer
          center={mapCenter}
          zoom={mapZoom}
          style={{ height: '100%', width: '100%', borderRadius: '30px' }}
          zoomControl={false} // Deshabilitamos el default para poner el nuestro
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png" // CARTO Positron (escala de grises sin etiquetas prominentes)
            // Opcional: Stamen TonerLite para un look similar
            // url="https://stamen-tiles-{s}.a.ssl.fastly.net/toner-lite/{z}/{x}/{y}{r}.png"
            // attribution='Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          <ZoomControl position="bottomright" />
          <Marker position={markerPos} icon={carDivIcon} />
        </MapContainer>
      </div>

      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
      />
      <TripDetailDialog
        open={isTripDetailDialogOpen}
        onOpenChange={setIsTripDetailDialogOpen}
        tripId={selectedTripId}
        onAcceptTrip={handleAcceptTrip}
      />
    </div>
  );
};

export default TravelPage;
