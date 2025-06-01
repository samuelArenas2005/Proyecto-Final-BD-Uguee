import React, { useRef, useEffect, useState } from 'react';
import {
  MapPin,
  Search,
  SlidersHorizontal,
  MoreVertical,
  UserCircle2,
  Clock,
  Star,
  QrCode,
  X,
} from 'lucide-react';
import FilterDialog from './complementos/filterDialog';
import TripDetailDialog from './complementos/tripDetailDialog';
import styles from './pasajero.module.css';

import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

const apigoogle = import.meta.env.VITE_APIS_GOOGLE;

const mapCustomStyles = [
  {
    featureType: 'poi', // Puntos de Interés (negocios, parques, etc.)
    elementType: 'labels',
    stylers: [{ visibility: 'on' }], // Oculta todas las etiquetas de POIs
  },
  {
    featureType: 'transit', // Transporte público (estaciones, paradas)
    elementType: 'labels',
    stylers: [{ visibility: 'off' }], // Oculta etiquetas de transporte
  },
  {
    featureType: 'road', // Carreteras y calles
    elementType: 'labels.text.fill', // Color del texto de las etiquetas de carretera
    stylers: [{ visibility: 'simplified' }], // Muestra solo las etiquetas principales, o 'off' para ocultarlas
  },
  {
    featureType: 'road',
    elementType: 'labels.text.stroke', // Borde del texto de las etiquetas de carretera
    stylers: [{ visibility: 'simplified' }], // O 'off'
  },
  {
    featureType: 'road',
    elementType: 'labels.icon', // Iconos en las carreteras (como escudos de autopistas)
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'administrative', // Límites administrativos (países, provincias, ciudades)
    elementType: 'labels.text.fill',
    stylers: [{ color: '#666666' }, { visibility: 'simplified' }], // Mantiene algunas etiquetas administrativas pero simplificadas
  },
];

const libraries = ['places'];

// Centro por defecto (Bogotá), antes de seleccionar “Punto de partida”
const DEFAULT_CENTER = {
  lat: 4.624335,
  lng: -74.063644,
};

// Rutas a tus assets
const carImagePath = '/car.png';
const carIconoPath = '/carIcono.png';

const mockDrivers = [
  {
    id: 'driver1',
    name: 'Nicolas Arenas',
    location: 'Ave. Ciudad de Cali',
    avatar: null,
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
];

const driverData = {
  name: 'Nicolas Arenas',
  location: 'Ave. Ciudad de Cali',
  avatarUrl: 'https://i.pravatar.cc/150?img=56',
  rating: 4.88,
  car: {
    plate: 'PLA234',
    model: 'Ford Explore Blanca',
    imageUrl: carImagePath,
  },
  eta: '10:00 am - 10:10 am',
  price: 'Gratis',
};

const TravelPage = () => {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isTripDetailDialogOpen, setIsTripDetailDialogOpen] = useState(false);
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [acceptedTripId, setAcceptedTripId] = useState(null);

  // Autocomplete refs
  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const handleOpenQrModal = () => setShowQrModal(true);
  const handleCloseQrModal = () => setShowQrModal(false);

  // Botones de búsqueda / cancelación
  const handleSearchTrip = () => {
    console.log('Buscando viaje desde:', startPoint, 'hasta:', destination);
    console.log('Coordenadas:', startCoords, destCoords);
    setAcceptedTripId(null);
    setDirectionsResponse(null); // Limpiar ruta anterior
  };

  const openTripDetailDialog = (tripId) => {
    setSelectedTripId(tripId);
    setIsTripDetailDialogOpen(true);
  };

  const handleAcceptTrip = (tripId) => {
    setAcceptedTripId(tripId);
    setIsTripDetailDialogOpen(false);
  };

  const handleCancelAcceptedTrip = () => {
    setAcceptedTripId(null);
  };

  // Callbacks de Autocomplete
  const onLoadStart = (autocompleteInstance) => {
    autoStartRef.current = autocompleteInstance;
  };
  const onPlaceChangedStart = () => {
    if (autoStartRef.current) {
      const place = autoStartRef.current.getPlace();
      if (place.formatted_address) {
        setStartPoint(place.formatted_address);
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setStartCoords({ lat, lng });
          setMapCenter({ lat, lng });
          setMapZoom(16);
        }
      }
    }
  };

  const onLoadDest = (autocompleteInstance) => {
    autoDestRef.current = autocompleteInstance;
  };
  const onPlaceChangedDest = () => {
    if (autoDestRef.current) {
      const place = autoDestRef.current.getPlace();
      if (place.formatted_address) {
        setDestination(place.formatted_address);
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          setDestCoords({ lat, lng });
        }
      }
    }
  };

  // Cuando ambos puntos están disponibles, calculamos la ruta con el DirectionsService “manual”
  useEffect(() => {
    if (startCoords && destCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startCoords,
          destination: destCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK' && result) {
            setDirectionsResponse(result);
          } else {
            console.error('Error obteniendo ruta:', status);
          }
        }
      );
    }
  }, [startCoords, destCoords]);

  // Opciones del mapa para que esté “limpio”
  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    styles: mapCustomStyles,
  };

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
      <div className={styles.travelPageContainer}>
        <div className={styles.leftPanel}>
          <div className={styles.tripRequestCard}>
            <h2>Solicita tu viaje</h2>

            {/* AUTOCOMPLETE: Punto de partida */}
            <div className={styles.inputGroup}>
              <MapPin size={20} className={styles.inputIcon} />
              <Autocomplete
                onLoad={onLoadStart}
                onPlaceChanged={onPlaceChangedStart}
                fields={['formatted_address', 'geometry']}
                restrictions={{ country: 'co' }}
              >
                <input
                  type="text"
                  placeholder="Punto de partida"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className={styles.inputField}
                />
              </Autocomplete>
            </div>

            {/* AUTOCOMPLETE: Destino */}
            <div className={styles.inputGroup} style={{ marginTop: '1rem' }}>
              <MapPin size={20} className={styles.inputIcon} />
              <Autocomplete
                onLoad={onLoadDest}
                onPlaceChanged={onPlaceChangedDest}
                fields={['formatted_address', 'geometry']}
                restrictions={{ country: 'co' }}
              >
                <input
                  type="text"
                  placeholder="Destino"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className={styles.inputField}
                />
              </Autocomplete>
            </div>

            <div className={styles.buttonGroup}>
              <button className={styles.searchButton} onClick={handleSearchTrip}>
                <Search size={18} /> Buscar
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
                <img
                  src={driverData.avatarUrl}
                  alt={driverData.name}
                  className={styles.driverAvatarBig}
                />
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
                  <img
                    src={driverData.avatarUrl}
                    alt=""
                    className={styles.driverAvatarSmall}
                  />
                  <div className={styles.ratingBadge}>
                    <Star size={12} className={styles.starIcon} fill="#AA00FF" color="#AA00FF" />
                    <span className={styles.ratingText}>{driverData.rating.toFixed(2)}</span>
                  </div>
                </div>

                <div className={styles.carImageColumn}>
                  <img
                    src={driverData.car.imageUrl}
                    alt={driverData.car.model}
                    className={styles.carImage}
                  />
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

              <div className={styles.actionButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={() => {
                    setAcceptedTripId(null);
                  }}
                >
                  Cancelar viaje
                </button>
                <button className={styles.qrButton} onClick={handleOpenQrModal}>
                  <QrCode size={20} className={styles.qrIcon} /> ver QR
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
                        src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ViajeConductor:${encodeURIComponent(
                          driverData.name,
                        )}-Placa:${encodeURIComponent(driverData.car.plate)}`}
                        alt="Código QR"
                        className={styles.qrImageModal}
                      />
                      <p className={styles.qrHelpText}>
                        Scanea este QR en la App para seguir el viaje.
                      </p>
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
                        <img
                          src={driver.avatar}
                          alt={driver.name}
                          className={styles.driverAvatar}
                        />
                      ) : (
                        <UserCircle2 size={36} className={styles.driverAvatarDefault} />
                      )}

                      <div className={styles.driverText}>
                        <span className={styles.driverName}>{driver.name}</span>
                        <span className={styles.driverLocation}>
                          <MapPin
                            size={12}
                            style={{ marginRight: '4px', color: '#6b7280' }}
                          />
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

        {/* === SECCIÓN: MAPA DE GOOGLE === */}
        <div className={styles.rightPanelMap}>
          <GoogleMap
            center={mapCenter}
            zoom={mapZoom}
            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '20px' }}
            options={mapOptions}
          >
            {/* Si directionsResponse no es null, lo pintamos */}
            {directionsResponse && (
              <DirectionsRenderer
                options={{
                  directions: directionsResponse,
                  suppressMarkers: false,
                  polylineOptions: {
                    strokeColor: '#AA00FF',
                    strokeWeight: 4,
                  },
                }}
              />
            )}
          </GoogleMap>
        </div>

        <FilterDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen} />
        <TripDetailDialog
          open={isTripDetailDialogOpen}
          onOpenChange={setIsTripDetailDialogOpen}
          tripId={selectedTripId}
          driverData={
            selectedTripId
              ? mockDrivers.find((d) => d.id === selectedTripId) || driverData
              : driverData
          }
          onAcceptTrip={() => handleAcceptTrip(selectedTripId)}
        />
      </div>
    </LoadScript>
  );
};

export default TravelPage;
