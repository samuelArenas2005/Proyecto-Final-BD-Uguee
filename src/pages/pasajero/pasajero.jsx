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
  X 
} from 'lucide-react';
import FilterDialog from './complementos/filterDialog';
import TripDetailDialog from './complementos/tripDetailDialog';
import styles from './pasajero.module.css';
import RutaAnteriorCard from './historialPasajeros/RutaAnteriorCard';
import wave from '/wave.svg';

import { 
  GoogleMap, 
  LoadScript, 
  Autocomplete, 
  DirectionsRenderer 
} from '@react-google-maps/api';

import { supabase } from '../../supabaseClient.js';

const apigoogle = import.meta.env.VITE_APIS_GOOGLE;
const mapCustomStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
const libraries = ['places'];
const DEFAULT_CENTER = { lat: 4.624335, lng: -74.063644 };

 const rutasAnterioresData = [
    { id: 1, title: 'Ruta 1', origin: 'Partida El Caney', destination: 'Destino Univalle', departureTime: 'Lunes, 10:00 am' },
    { id: 2, title: 'Ruta 2', origin: 'Partida El Caney', destination: 'Destino Univalle', departureTime: 'Martes, 8:00 am' },
  ];

const FULL_ROUTE_QUERY = `
  idruta,
  salidalatitud,
  salidalongitud,
  paradalatitud,
  paradalongitud,
  horadesalida,
  fecha,
  tipoderuta,
  distancia,
  asientosdisponibles,
  estado,
  rutaconductorviaje (
    idviaje,
    conductor (
      usuario (*)
    )
  ),
  vehiculo (
    color,
    marca,
    modelo,
    vehiculopesado (
      placa,
      tipovehiculo
    )
  )
`;

const TravelPage = () => {
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [matchingRoutes, setMatchingRoutes] = useState([]);
  const [loadingRoutes, setLoadingRoutes] = useState(false);
  const [searchMessage, setSearchMessage] = useState('');
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isTripDetailDialogOpen, setIsTripDetailDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [acceptedRoute, setAcceptedRoute] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  
  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  useEffect(() => {
    const checkForActiveTrip = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No hay usuario logueado.');
        return;
      }

      const { data: lastPassengerTrip, error: passengerError } = await supabase
        .from('pasajeroviaje')
        .select(`idviaje` )
        .eq('idpasajero', user.id)
        .order('idviaje', { ascending: false }) 
        .limit(1)
        .single();

      if (passengerError || !lastPassengerTrip) {
        console.log('El usuario no está en ningún viaje activo.');
        return;
      }

      const { data: activeRouteData, error: routeError } = await supabase
        .from('ruta')
        .select(FULL_ROUTE_QUERY)
        .eq('estado', 'activo') 
        .eq('rutaconductorviaje.idviaje', lastPassengerTrip.idviaje)
        .single();
      
      if (routeError) {
        console.error('Error al verificar la ruta activa:', routeError);
        return;
      }
      
      if (activeRouteData) {
        console.log('Se encontró un viaje activo. Mostrando panel...');
        setAcceptedRoute(activeRouteData);
      }
    };

    checkForActiveTrip();
  }, []);

  const getDistanceMeters = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000;
    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d;
  };

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
            setDirectionsResponse(null);
          }
        }
      );
    }
  }, [startCoords, destCoords]);

  const handleSearchTrip = async () => {
    setMatchingRoutes([]);
    setSearchMessage('');
    setLoadingRoutes(true);
    setSelectedRoute(null);
    setIsTripDetailDialogOpen(false);

    if (!startCoords || !destCoords) {
      setSearchMessage('Primero ingresa punto de partida y destino válidos.');
      setLoadingRoutes(false);
      return;
    }

    const { data: rutas, error } = await supabase
      .from('ruta')
      .select(FULL_ROUTE_QUERY)
      .eq('estado', 'activo');

    if (error) {
      console.error('Error al consultar Supabase:', error);
      setSearchMessage('Ocurrió un error al buscar rutas. Intenta más tarde.');
      setLoadingRoutes(false);
      return;
    }

    const RADIUS_METERS = 500;
    const filtradas = rutas.filter((ruta) => {
      const salidaRuta = {
        lat: parseFloat(ruta.salidalatitud),
        lng: parseFloat(ruta.salidalongitud),
      };
      const destinoRuta = {
        lat: parseFloat(ruta.paradalatitud),
        lng: parseFloat(ruta.paradalongitud),
      };
      const distSalida = getDistanceMeters(startCoords, salidaRuta);
      const distDestino = getDistanceMeters(destCoords, destinoRuta);
      return distSalida <= RADIUS_METERS && distDestino <= RADIUS_METERS;
    });

    if (filtradas.length === 0) {
      setSearchMessage('No se encontraron rutas que coincidan con los criterios.');
    }
    setMatchingRoutes(filtradas);
    setLoadingRoutes(false);
  };

  const openTripDetailDialog = (ruta) => {
    setSelectedRoute(ruta);
    setIsTripDetailDialogOpen(true);
  };

  const setPasajeroViaje = async (tripId) => {
    const { data: viaje, error } = await supabase
      .from('rutaconductorviaje')
      .select('idviaje')
      .eq('idruta', tripId)
      .single();

    if (error) {
      console.log("viaje no encontrado ", error);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();

    const nuevoPasajeroViaje = {
      idpasajero: user.id,
      idviaje: viaje.idviaje,
    };

    const { error: insertError } = await supabase
      .from('pasajeroviaje')
      .insert(nuevoPasajeroViaje);

    if (insertError) {
      console.log('no se pudo ingresar el pasajero al viaje ', insertError);
    } else {
        console.log('Pasajero añadido al viaje exitosamente.');
    }
  };

  const handleAcceptRoute = (tripId) => {
    setPasajeroViaje(tripId);
    setAcceptedRoute(selectedRoute);
    setIsTripDetailDialogOpen(false);
  };

  const handleCancelTrip = async () => {
    if (!acceptedRoute) return;
  
    const viajeInfo = acceptedRoute.rutaconductorviaje?.[0];
    if (!viajeInfo || !viajeInfo.idviaje) {
      console.error("No se pudo encontrar el idviaje para cancelar.");
      setAcceptedRoute(null);
      return;
    }
    const idviaje = viajeInfo.idviaje;
  
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No se encontró usuario para cancelar el viaje.");
      setAcceptedRoute(null);
      return;
    }
  
    const { error: deleteError } = await supabase
      .from('pasajeroviaje')
      .delete()
      .match({ idpasajero: user.id, idviaje: idviaje });
  
    if (deleteError) {
      console.error('Error al cancelar el viaje en la base de datos:', deleteError);
    } else {
      console.log('Viaje cancelado y registro eliminado exitosamente.');
    }
  
    setAcceptedRoute(null);
    setMatchingRoutes([]);
    setSearchMessage('Tu viaje ha sido cancelado. Puedes buscar uno nuevo.');
  };

  const mapOptions = {
    disableDefaultUI: true,
    zoomControl: true,
    streetViewControl: false,
    mapTypeControl: false,
    styles: mapCustomStyles,
  };

  const formatCoordsShort = (lat, lng) => {
    const round4 = (num) => Number(num).toFixed(4);
    return `${round4(lat)}, ${round4(lng)}`;
  };

  let chosenDriverData = null;
  if (acceptedRoute) {
    const rutaconductor = acceptedRoute.rutaconductorviaje?.[0];
    const usuario = rutaconductor?.conductor?.usuario || {};
    const nombre =
      usuario.nombrecompleto || usuario.codigoestudiantil || 'Sin nombre';
    const coordsShort = formatCoordsShort(
      acceptedRoute.salidalatitud,
      acceptedRoute.salidalongitud
    );

    chosenDriverData = {
      name: nombre,
      location: coordsShort,
      avatarUrl: '',
      rating: 0,
      car: {
        plate: acceptedRoute.vehiculo?.vehiculopesado?.placa || '—',
        model: `${acceptedRoute.vehiculo?.marca || ''} ${
          acceptedRoute.vehiculo?.modelo || ''
        }`.trim(),
        imageUrl: '/car.png',
      },
      eta: acceptedRoute.horadesalida || '—',
      price: 'Gratis',
    };
  }

  const handleOpenQrModal = () => setShowQrModal(true);
  const handleCloseQrModal = () => setShowQrModal(false);

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
      <div className={styles.pageContainer}>
        <div className={styles.topSectionWave}>
          <img src={wave} alt="Fondo de ola" className={styles.waveBg} />
          <div className={styles.contentWrapper}>
            <div className={styles.routeSetupSection}>
              {!acceptedRoute ? (
                <>
                  <h2 className={styles.greeting}>¡Busca tu viaje ideal!</h2>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <MapPin className={styles.inputIcon} size={20} />
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
                    <div className={styles.inputWrapper}>
                      <MapPin className={styles.inputIcon} size={20} />
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
                  </div>
                  <div className={styles.buttonGroup}>
                    <button 
                      className={styles.submitButton} 
                      onClick={handleSearchTrip}
                      disabled={loadingRoutes}
                    >
                      {loadingRoutes ? 'Buscando...' : (
                        <>
                          <Search size={18} /> Buscar
                        </>
                      )}
                    </button>
                    <button
                      className={styles.filterButton}
                      onClick={() => setIsFilterDialogOpen(true)}
                      aria-label="Filtros"
                    >
                      <SlidersHorizontal size={20} />
                    </button>
                  </div>
                </>
              ) : chosenDriverData ? (
                <div className={styles.acceptedTripCard}>
                  <h2 className={styles.greeting}>¡Viaje confirmado!</h2>
                  <div className={styles.driverInfoBig}>
                    <div className={styles.driverAvatarContainer}>
                      <UserCircle2 size={36} className={styles.driverAvatar} />
                    </div>
                    <div className={styles.driverDetails}>
                      <h3 className={styles.driverName}>{chosenDriverData.name}</h3>
                      <div className={styles.locationRow}>
                        <MapPin size={16} className={styles.locationIcon} />
                        <span className={styles.driverLocation}>{chosenDriverData.location}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles.vehicleDetails}>
                    <div className={styles.carImageColumn}>
                      <img 
                        src={chosenDriverData.car.imageUrl} 
                        alt={chosenDriverData.car.model} 
                        className={styles.carImage} 
                      />
                    </div>
                    <div className={styles.vehicleInfo}>
                      <div className={styles.carInfo}>
                        <span className={styles.carPlate}>{chosenDriverData.car.plate}</span>
                        <span className={styles.carModel}>{chosenDriverData.car.model}</span>
                      </div>
                      <div className={styles.etaSection}>
                        <Clock size={18} className={styles.clockIcon} />
                        <div>
                          <p className={styles.etaTitle}>Hora de salida</p>
                          <p className={styles.etaTime}>{chosenDriverData.eta}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.cancelButton}
                      onClick={handleCancelTrip}
                    >
                      Cancelar viaje
                    </button>
                    <button 
                      className={styles.qrButton}
                      onClick={handleOpenQrModal}
                    >
                      <QrCode size={18} /> Ver QR
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div className={styles.mapSection}>
              <GoogleMap
                center={mapCenter}
                zoom={mapZoom}
                mapContainerClassName={styles.mapContainer}
                options={{ 
                  styles: mapCustomStyles, 
                  disableDefaultUI: true, 
                  zoomControl: true 
                }}
              >
                {directionsResponse && (
                  <DirectionsRenderer
                    options={{
                      directions: directionsResponse,
                      suppressMarkers: false,
                      polylineOptions: {
                        strokeColor: '#AA00FF',
                        strokeWeight: 5,
                      },
                    }}
                  />
                )}
              </GoogleMap>
            </div>
          </div>
        </div>
        
        <div className={styles.previousRoutesSection}>
          <h2 className={styles.sectionTitle}>
            {acceptedRoute ? 'Tu viaje actual' : matchingRoutes.length > 0 ? 'Rutas Disponibles' : 'Busca tu ruta'}
          </h2>
          
          <div className={styles.cardsGrid}>
            {acceptedRoute && chosenDriverData ? (
              <div className={styles.activeTripCard}>
                <div className={styles.driverInfo}>
                  <UserCircle2 size={36} className={styles.driverAvatar} />
                  <div className={styles.driverText}>
                    <span className={styles.driverName}>{chosenDriverData.name}</span>
                    <span className={styles.driverLocation}>
                      <MapPin size={12} className={styles.locationIconSmall} />
                      {chosenDriverData.location}
                    </span>
                  </div>
                </div>
                <div className={styles.tripDetails}>
                  <div className={styles.detailItem}>
                    <Clock size={16} />
                    <span>Salida: {chosenDriverData.eta}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Vehículo: {chosenDriverData.car.model}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span>Placa: {chosenDriverData.car.plate}</span>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {loadingRoutes && (
                  <div className={styles.loadingMessage}>Buscando rutas disponibles...</div>
                )}
                
                {!loadingRoutes && searchMessage && (
                  <div className={styles.infoMessage}>{searchMessage}</div>
                )}
                
                {matchingRoutes.map((ruta) => {
                  const rutaconductor = ruta.rutaconductorviaje?.[0];
                  const usuario = rutaconductor?.conductor?.usuario || {};
                  const conductorNombre =
                    usuario.nombrecompleto ||
                    usuario.codigoestudiantil ||
                    'Sin nombre';
                  const coordsShort = formatCoordsShort(
                    ruta.salidalatitud,
                    ruta.salidalongitud
                  );
                  
                  return (
                    <div key={ruta.idruta} className={styles.routeCard}>
                      <div className={styles.driverInfo}>
                        <UserCircle2 size={36} className={styles.driverAvatar} />
                        <div className={styles.driverText}>
                          <span className={styles.driverName}>{conductorNombre}</span>
                          <span className={styles.driverLocation}>
                            <MapPin size={12} className={styles.locationIconSmall} />
                            {coordsShort}
                          </span>
                        </div>
                      </div>
                      <div className={styles.routeDetails}>
                        <div className={styles.detailItem}>
                          <Clock size={16} />
                          <span>{ruta.horadesalida}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Asientos: {ruta.asientosdisponibles}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <span>Distancia: {ruta.distancia.toFixed(1)} km</span>
                        </div>
                      </div>
                      <button
                        className={styles.detailsButton}
                        onClick={() => openTripDetailDialog(ruta)}
                      >
                        <MoreVertical size={20} />
                      </button>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        </div>
        
        <FilterDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen} />
        
        {selectedRoute && (
          <TripDetailDialog
            open={isTripDetailDialogOpen}
            onOpenChange={setIsTripDetailDialogOpen}
            tripId={selectedRoute.idruta}
            driverData={{
              nombre:
                selectedRoute.rutaconductorviaje?.[0]?.conductor?.usuario
                  ?.nombrecompleto ||
                selectedRoute.rutaconductorviaje?.[0]?.conductor?.usuario
                  ?.codigoestudiantil ||
                'Sin nombre',
            }}
            routeData={{
              horadesalida: selectedRoute.horadesalida,
              fecha: selectedRoute.fecha,
              tipoderuta: selectedRoute.tipoderuta,
              distancia: selectedRoute.distancia,
              asientosdisponibles: selectedRoute.asientosdisponibles,
            }}
            vehicleData={{
              color: selectedRoute.vehiculo?.color,
              marca: selectedRoute.vehiculo?.marca,
              modelo: selectedRoute.vehiculo?.modelo,
              placa: selectedRoute.vehiculo?.vehiculopesado?.placa,
              tipovehiculo: selectedRoute.vehiculo?.vehiculopesado?.tipovehiculo,
            }}
            onAcceptTrip={handleAcceptRoute}
          />
        )}
        
        {showQrModal && acceptedRoute && (
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
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=ViajeRuta:${encodeURIComponent(
                    acceptedRoute.idruta
                  )}`}
                  alt="Código QR"
                  className={styles.qrImageModal}
                />
                <p className={styles.qrHelpText}>
                  Escanea este QR en la App del conductor para confirmar el viaje.
                </p>
              </div>
            </div>
          </div>
        )}
        <div className={styles.previousRoutesSection}>
            <h2 className={styles.sectionTitle}>Rutas anteriores</h2>
            <div className={styles.cardsGrid}>
                {rutasAnterioresData.map((ruta) => (<RutaAnteriorCard key={ruta.id} routeData={ruta} onEstablecerRuta={() => { }} />))}
            </div>
        </div>
      </div>
    </LoadScript>
  );
};

export default TravelPage;