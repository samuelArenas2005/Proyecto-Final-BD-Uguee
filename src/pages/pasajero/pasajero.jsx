// TravelPage.jsx

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

// ==== IMPORTACIÓN DE SUPABASE ====
import { supabase } from '../../supabaseClient.js';
// =================================

// Google API Key
const apigoogle = import.meta.env.VITE_APIS_GOOGLE;

// Estilos personalizados para el mapa
const mapCustomStyles = [
  // ... (tus estilos de mapa no han cambiado)
];

const libraries = ['places'];

// Centro por defecto en Bogotá
const DEFAULT_CENTER = {
  lat: 4.624335,
  lng: -74.063644,
};

// ==============================================================================
// ==== NUEVO: Constante para la consulta de Supabase para evitar repetición ====
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
// ==============================================================================

const TravelPage = () => {
  // Estados para inputs de Google Autocomplete
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  // Estados del mapa
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);

  // Estados para manejar la búsqueda de rutas
  const [matchingRoutes, setMatchingRoutes] = useState([]); // lista de rutas encontradas
  const [loadingRoutes, setLoadingRoutes] = useState(false); // indica búsqueda en curso
  const [searchMessage, setSearchMessage] = useState(''); // mensaje si no hay rutas

  // Estados para diálagos (filtros y detalle de viaje)
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [isTripDetailDialogOpen, setIsTripDetailDialogOpen] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null); // ruta seleccionada para modal

  // NUEVO: estado para la ruta aceptada
  const [acceptedRoute, setAcceptedRoute] = useState(null);

  // Referencias para Autocomplete
  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  // QR Modal
  const [showQrModal, setShowQrModal] = useState(false);
  const handleOpenQrModal = () => setShowQrModal(true);
  const handleCloseQrModal = () => setShowQrModal(false);


  // ========================================================================================
  // ==== MODIFICACIÓN 1: Verificación de viaje activo al cargar el componente ====
  useEffect(() => {
    const checkForActiveTrip = async () => {
      // 1. Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No hay usuario logueado.');
        return;
      }

      // 2. Buscar el último viaje del pasajero
      const { data: lastPassengerTrip, error: passengerError } = await supabase
        .from('pasajeroviaje')
        .select(`idviaje` )
        .eq('idpasajero', user.id)
        .order('idviaje', { ascending: false }) 
        .limit(1)
        .single();

        console.log(lastPassengerTrip)

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

        console.log(activeRouteData)
      
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
  }, []); // El array vacío asegura que esto solo se ejecute al montar el componente
  // ========================================================================================


  // ==== CÁLCULO DE DISTANCIA (Haversine) ====
  const getDistanceMeters = (coord1, coord2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371000; // Radio de la Tierra en metros

    const dLat = toRad(coord2.lat - coord1.lat);
    const dLon = toRad(coord2.lng - coord1.lng);
    const lat1 = toRad(coord1.lat);
    const lat2 = toRad(coord2.lat);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const d = R * c;
    return d; // en metros
  };
  // ==========================================

  // ==== HANDLERS DE AUTOCOMPLETE ====
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
  // ==================================

  // Recalcular ruta visual en el mapa
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

  // ==== FUNCIÓN PARA BUSCAR RUTAS EN SUPABASE ====
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
      .select(FULL_ROUTE_QUERY) // Usamos la constante
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
  // ============================================

  // Abrir modal con detalle de ruta
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

  // Manejar aceptación de ruta desde el modal
  const handleAcceptRoute = (tripId) => {
    setPasajeroViaje(tripId);
    setAcceptedRoute(selectedRoute);
    setIsTripDetailDialogOpen(false);
  };

  // ============================================================================
  // ==== MODIFICACIÓN 2: Función para cancelar el viaje y borrar el registro ====
  const handleCancelTrip = async () => {
    if (!acceptedRoute) return;
  
    // 1. Obtener el idviaje de la ruta aceptada
    const viajeInfo = acceptedRoute.rutaconductorviaje?.[0];
    if (!viajeInfo || !viajeInfo.idviaje) {
      console.error("No se pudo encontrar el idviaje para cancelar.");
      // Incluso si hay error, limpiar la UI para el usuario
      setAcceptedRoute(null);
      return;
    }
    const idviaje = viajeInfo.idviaje;
  
    // 2. Obtener el ID del usuario actual
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error("No se encontró usuario para cancelar el viaje.");
      setAcceptedRoute(null);
      return;
    }
  
    // 3. Borrar el registro de la tabla 'pasajeroviaje'
    const { error: deleteError } = await supabase
      .from('pasajeroviaje')
      .delete()
      .match({ idpasajero: user.id, idviaje: idviaje });
  
    if (deleteError) {
      console.error('Error al cancelar el viaje en la base de datos:', deleteError);
    } else {
      console.log('Viaje cancelado y registro eliminado exitosamente.');
    }
  
    // 4. Limpiar el estado para volver a la pantalla de búsqueda
    setAcceptedRoute(null);
    setMatchingRoutes([]); // Limpiar resultados de búsqueda anteriores
    setSearchMessage('Tu viaje ha sido cancelado. Puedes buscar uno nuevo.');
  };
  // ============================================================================

  // Opciones del mapa (“limpio”)
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

  // Construir datos dinámicos para el “Conductor Elegido”
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
      avatarUrl: '', // Puedes agregar una columna de avatar en tu tabla de usuario
      rating: 0, // Puedes agregar una lógica de calificación
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

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
      <div className={styles.travelPageContainer}>
        <div className={styles.leftPanel}>
          {/* Si NO hay una ruta aceptada, mostrar el formulario de búsqueda */}
          {!acceptedRoute && (
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
          )}

          {acceptedRoute && chosenDriverData ? (
            // === Conductor Elegido (mostrado cuando ya se aceptó una ruta) ===
            <div className={styles.cardContainer}>
              <h2 className={styles.mainTitle}>Conductor Elegido</h2>
              <div className={styles.driverSection}>
                <img
                  src={chosenDriverData.avatarUrl || '/placeholder-avatar.png'}
                  alt={chosenDriverData.name}
                  className={styles.driverAvatarBig}
                />
                <div className={styles.driverInfoBig}>
                  <p className={styles.driverNameBig}>{chosenDriverData.name}</p>
                  <div className={styles.locationRow}>
                    <MapPin size={16} className={styles.locationIcon} />
                    <p className={styles.driverLocation}>
                      {chosenDriverData.location}
                    </p>
                  </div>
                </div>
              </div>

              <div className={styles.vehicleDetailsSectionWrapper}>
                <div className={styles.driverAvatarRatingColumn}>
                  <img
                    src={chosenDriverData.avatarUrl || '/placeholder-avatar.png'}
                    alt=""
                    className={styles.driverAvatarSmall}
                  />
                  <div className={styles.ratingBadge}>
                    <Star
                      size={12}
                      className={styles.starIcon}
                      fill="#AA00FF"
                      color="#AA00FF"
                    />
                    <span className={styles.ratingText}>
                      {chosenDriverData.rating.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={styles.carImageColumn}>
                  <img
                    src={chosenDriverData.car.imageUrl}
                    alt={chosenDriverData.car.model}
                    className={styles.carImage}
                  />
                </div>

                <div className={styles.vehicleTextInfoColumn}>
                  <p className={styles.carPlate}>{chosenDriverData.car.plate}</p>
                  <p className={styles.carModel}>{chosenDriverData.car.model}</p>
                  <p className={styles.priceInfo}>{chosenDriverData.price}</p>
                </div>
              </div>

              <div className={styles.etaSection}>
                <Clock size={24} className={styles.clockIconDetails} />
                <div className={styles.etaTextContainer}>
                  <p className={styles.etaTitle}>Tiempo estimado de salida</p>
                  <p className={styles.etaTime}>{chosenDriverData.eta}</p>
                </div>
              </div>

              <div className={styles.actionButtons}>
                <button
                  className={styles.cancelButton}
                  onClick={handleCancelTrip} // MODIFICADO: Llama a la nueva función
                >
                  Cancelar viaje
                </button>
                <button className={styles.qrButton} onClick={handleOpenQrModal}>
                  <QrCode size={20} className={styles.qrIcon} /> ver QR
                </button>
              </div>

              {/* ... El resto del modal QR sigue igual ... */}
            </div>
          ) : (
            // === Listado de rutas o mensajes, cuando NO hay ruta aceptada ===
            <>
              {loadingRoutes && (
                <p className={styles.searchStatus}>Buscando rutas...</p>
              )}
              {!loadingRoutes && searchMessage && (
                <p className={styles.searchStatus}>{searchMessage}</p>
              )}

              {matchingRoutes.length > 0 && (
                <div className={styles.cardContainer}>
                  <h2 className={styles.mainTitle}>Rutas Disponibles</h2>
                  <div className={styles.driverList}>
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
                        <div key={ruta.idruta} className={styles.driverItem}>
                          <div className={styles.driverInfo}>
                            <UserCircle2
                              size={36}
                              className={styles.driverAvatarDefault}
                            />
                            <div className={styles.driverText}>
                              <span className={styles.driverName}>
                                {conductorNombre}
                              </span>
                              <span className={styles.driverLocation}>
                                <MapPin
                                  size={12}
                                  style={{
                                    marginRight: '4px',
                                    color: '#6b7280',
                                  }}
                                />
                                {coordsShort}
                              </span>
                            </div>
                          </div>
                          <button
                            className={styles.driverMoreButton}
                            onClick={() => openTripDetailDialog(ruta)}
                            aria-label={`Más opciones para ruta ${ruta.idruta}`}
                          >
                            <MoreVertical size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
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

        {/* Diálogo de filtros */}
        <FilterDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen} />

        {/* Diálogo de detalles de ruta */}
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

        {/* Modal QR */}
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
      </div>
    </LoadScript>
  );
};

export default TravelPage;