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
  Route,
  Armchair,
  X,
  Car, Phone, Palette, Tag, Shapes
} from 'lucide-react';
import TripDetailDialog from './complementos/tripDetailDialog';
import styles from './pasajero.module.css';
import wave from '/wave.svg';
import RutaAnteriorCard from './historialPasajeros/RutaAnteriorCard';
import QRCode from 'react-qr-code';

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
    numeroasientos,
    vehiculopesado (
      placa,
      tipovehiculo,
      categoriaviaje
    ),vehiculoligero(
      nserie,
      tipo
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
  const [previousRoutes, setPreviousRoutes] = useState([]);
  const [showInfo, setShowInfo] = useState(true)

  const [origen, setOrigen] = useState(null);
  const [destino, setDestino] = useState(null);

  const [dateTime, setDateTime] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [maxDateTime, setMaxDateTime] = useState('');

  useEffect(() => {
    const getFormattedDateTimeColombia = (date) => {
      const options = {
        timeZone: 'America/Bogota',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      };
      const formatted = new Date(date).toLocaleString('sv-SE', options);

      return formatted.replace(' ', 'T');
    };

    const now = new Date();
    const minVal = getFormattedDateTimeColombia(now);
    setMinDateTime(minVal);
    setDateTime(minVal);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const maxVal = getFormattedDateTimeColombia(tomorrow);
    setMaxDateTime(maxVal);

  }, []);

  const handleBlur = (e) => {
    const value = e.target.value;
    console.log(dateTime.slice(11, 16))
    if (value < minDateTime) {
      console.log("Valor muy bajo. Corrigiendo al mínimo.");
      setDateTime(minDateTime);
    }
  };

  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  const fetchPreviousRoutes = async (userId) => {
    const { data: historicalTripsAll, error } = await supabase
      .from('pasajeroviaje')
      .select(`idviaje,viaje(estadodelviaje)

      `)
      .eq('idpasajero', userId)


    const historicalTrips = historicalTripsAll.filter(trip => trip.viaje.estadodelviaje == "terminado")

    if (
      error || !historicalTrips
    ) {
      console.log('El no tiene viajes anteriores.');
      return;
    }

    const rutas = historicalTrips.map(async (viaje) => {
      const { data: historicalTripsruta, error2 } = await supabase
        .from('rutaconductorviaje')
        .select(`ruta(salidalatitud,salidalongitud,paradalatitud,paradalongitud,horadesalida)
      `)
        .eq('idviaje', viaje.idviaje)
      if (error2 || !historicalTripsruta) {
        return []
      }
      return historicalTripsruta;
    })

    const rutasArray = await Promise.all(rutas);
    const rutasArrayPlana = rutasArray.flat()

    console.log(rutasArrayPlana)

    if (error || !historicalTrips) {
      console.error('Error fetching previous routes:', error);
      return;
    }
    else {
      setPreviousRoutes(
        rutasArrayPlana.map((ruta, index) => ({
          title: `Ruta ${index + 1}`,
          originlat: ruta.ruta.salidalatitud,
          originlong: ruta.ruta.salidalongitud,
          destinationlat: ruta.ruta.paradalatitud,
          destinationlong: ruta.ruta.paradalongitud,
          departureTime: ruta.ruta.horadesalida
        }))
      )
    }

  };

  useEffect(() => {
    const checkForActiveTrip = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('No hay usuario logueado.');
        return;
      }

      const { data: lastPassengerTrip, error: passengerError } = await supabase
        .from('pasajeroviaje')
        .select('idviaje, viaje(estadodelviaje)')
        .eq('idpasajero', user.id)
        .order('idviaje', { ascending: false })
        .limit(1)
        .single();

      console.log("hola", lastPassengerTrip);

      if (
        passengerError ||
        !lastPassengerTrip ||
        !['pendiente', 'proceso'].includes(lastPassengerTrip.viaje?.estadodelviaje)
      ) {
        console.log('El usuario no está en ningún viaje activo.');
        fetchPreviousRoutes(user.id)
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
        const fetchDireccion = async () => {
          const direccion = await getAddressFromCoords(
            activeRouteData.salidalatitud,
            activeRouteData.salidalongitud);
          setOrigen(direccion);

          const direcciondestino = await getAddressFromCoords(
            activeRouteData.paradalatitud,
            activeRouteData.paradalongitud);
          setDestino(direcciondestino);
        };

        fetchDireccion()
        setStartCoords({
          lat: activeRouteData.salidalatitud,
          lng: activeRouteData.salidalongitud
        });

        setMapZoom(16);
        setDestCoords({
          lat: activeRouteData.paradalatitud,
          lng: activeRouteData.paradalongitud
        });
        console.log("hola soy prueba coordenadas", activeRouteData.paradalatitud)
        console.log("hola soy coordenadas", startCoords, destCoords)

        if (startCoords && destCoords) {
          console.log("entre a las coordenadas chabon")
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

        console.log('Se encontró un viaje activo. Mostrando panel...');
        setShowInfo(false)
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

    console.log(rutas)

    if (error) {
      console.error('Error al consultar Supabase:', error);
      setSearchMessage('Ocurrió un error al buscar rutas. Intenta más tarde.');
      setLoadingRoutes(false);
      return;
    }

    const fechaHora = new Date(dateTime);

    const yyyy = fechaHora.getFullYear();
    const mm = String(fechaHora.getMonth() + 1).padStart(2, '0');
    const dd = String(fechaHora.getDate()).padStart(2, '0');

    const fechaLocal = `${yyyy}-${mm}-${dd}`


    const RADIUS_METERS = 1000;
    const filtradas = rutas.filter((ruta) => {
      const salidaRuta = {
        lat: parseFloat(ruta.salidalatitud),
        lng: parseFloat(ruta.salidalongitud),
      };
      const destinoRuta = {
        lat: parseFloat(ruta.paradalatitud),
        lng: parseFloat(ruta.paradalongitud),
      };
      const fechaSalidaRuta = new Date(`${ruta.fecha}T${ruta.horadesalida}`);
      const diffMs = fechaHora.getTime() - fechaSalidaRuta.getTime();
      const umbralN = 45 * 60 * 1000;
      const distSalida = getDistanceMeters(startCoords, salidaRuta);
      const distDestino = getDistanceMeters(destCoords, destinoRuta);
      const dentroDeNMin = Math.abs(diffMs) <= umbralN;
      return distSalida <= RADIUS_METERS && distDestino <= RADIUS_METERS && dentroDeNMin && fechaLocal == ruta.fecha;
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

    console.log("hola soy idviaje", viaje.idviaje)

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
    setShowInfo(false)
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
      setShowInfo(true)
      console.log('Viaje cancelado y registro eliminado exitosamente.');
    }

    setAcceptedRoute(null);
    setMatchingRoutes([]);
    setSearchMessage('Tu viaje ha sido cancelado. Puedes buscar uno nuevo.');
  };


  async function getAddressFromCoords(lat, lng) {
    const apiKey = import.meta.env.VITE_APIS_GOOGLE;
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn('No se encontró una dirección para estas coordenadas.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return null;
    }
  }

  const handleOpenQrModal = () => setShowQrModal(true);
  const handleCloseQrModal = () => setShowQrModal(false);


  const jsonString = JSON.stringify(acceptedRoute);
  const objetoString = btoa(jsonString);


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
                    <div className={styles.inputWrapper}>
                      <Clock className={styles.inputIcon} size={20} />
                      <input type="datetime-local" min={minDateTime} onBlur={handleBlur}
                        max={maxDateTime} value={dateTime} onChange={(e) => setDateTime(e.target.value)} className={styles.inputField} />
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
                  </div>
                </>
              ) : (
                <div className={styles.acceptedTripCard}>
                  <h2 className={styles.title}>¡Viaje confirmado!</h2>

                  {/* --- SECCIÓN DEL CONDUCTOR --- */}
                  <div className={styles.section}>
                    <div className={styles.driverInfo}>
                      <img
                        src={acceptedRoute.rutaconductorviaje[0].conductor.usuario.urlAvatar}
                        alt={acceptedRoute.rutaconductorviaje[0].conductor.usuario.nombrecompleto}
                        className={styles.avatar}
                      />
                      <div className={styles.driverText}>
                        <p className={styles.label}>Conductor</p>
                        <p className={styles.value}>{acceptedRoute.rutaconductorviaje[0].conductor.usuario.nombrecompleto}</p>
                      </div>
                    </div>
                    <div className={styles.contactInfo}>
                      <Phone size={18} className={styles.icon} />
                      <p className={styles.value}>{acceptedRoute.rutaconductorviaje[0].conductor.usuario.telefono}</p>
                    </div>
                  </div>

                  {/* --- SECCIÓN DE RUTA --- */}
                  <div className={styles.section}>
                    <div className={styles.routePoint}>
                      <MapPin size={20} className={styles.icon} />
                      <div className={styles.routeText}>
                        <p className={styles.label}>Origen</p>
                        <p className={styles.value}>{origen}</p>
                      </div>
                    </div>
                    <div className={styles.routePoint}>
                      <MapPin size={20} className={styles.icon} color="#8A2BE2" />
                      <div className={styles.routeText}>
                        <p className={styles.label}>Destino</p>
                        <p className={styles.value}>{destino}</p>
                      </div>
                    </div>
                  </div>

                  {/* --- SECCIÓN DE VEHÍCULO Y HORA --- */}
                  <div className={styles.section}>
                    <p className={styles.sectionTitle2}>Detalles del Vehículo</p>
                    <div className={styles.vehicleGrid}>
                      <div className={styles.detailItem}>
                        <Car size={20} className={styles.icon} />
                        <div>
                          <p className={styles.label}>Marca / Modelo</p>
                          <p className={styles.value}>{acceptedRoute?.vehiculo?.marca} {acceptedRoute?.vehiculo?.modelo}</p>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <Palette size={20} className={styles.icon} />
                        <div>
                          <p className={styles.label}>Color</p>
                          <p className={styles.value}>{acceptedRoute?.vehiculo?.color}</p>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <Tag size={20} className={styles.icon} />
                        <div>
                          <p className={styles.label}>Placa</p>
                          <p className={styles.value}>{acceptedRoute?.vehiculo?.vehiculoligero.nserie}</p>
                        </div>
                      </div>
                      <div className={styles.detailItem}>
                        <Shapes size={20} className={styles.icon} />
                        <div>
                          <p className={styles.label}>Tipo</p>
                          <p className={styles.value}>{acceptedRoute?.vehiculo?.vehiculoligero.tipo}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* --- HORA DE SALIDA --- */}
                  <div className={styles.departureTimeSection}>
                    <Clock size={20} className={styles.icon} />
                    <div>
                      <p className={styles.label}>Hora de salida programada</p>
                      <p className={styles.valueLarge}>{acceptedRoute?.horadesalida}</p>
                    </div>
                  </div>


                  {/* --- BOTONES DE ACCIÓN --- */}
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
              )}
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
            {acceptedRoute ? '' : matchingRoutes.length > 0 ? 'Rutas Disponibles' : 'Busca tu ruta'}
          </h2>

          <div className={styles.cardsGrid}>
            {acceptedRoute ? (
              null
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
                  const fetchDireccion = async () => {
                    const direccion = await getAddressFromCoords(
                      ruta.salidalatitud,
                      ruta.salidalongitud);
                    setOrigen(direccion);

                    const direcciondestino = await getAddressFromCoords(
                      ruta.paradalatitud,
                      ruta.paradalongitud);
                    setDestino(direcciondestino);
                  };

                  fetchDireccion()

                  return (
                    <div key={ruta.idruta} className={styles.routeCard}>
                      <div className={styles.driverInfo}>
                        <UserCircle2 size={36} className={styles.driverAvatar} />
                        <div className={styles.driverText}>
                          <span className={styles.driverName}>{conductorNombre}</span>
                          <span className={styles.driverLocation}>
                            <MapPin size={16} className={styles.locationIconSmall} />
                            <span className={styles.ubicationSpan}>Punto de partida: </span>
                            {origen ? (origen.slice(0, origen.length <= 30 ? origen.length : origen.length - 10) + '...') : 'Cargando...'}
                          </span>
                          <span className={styles.driverLocation}>
                            <MapPin size={16} className={styles.locationIconSmall} />
                            <span className={styles.ubicationSpan}>Destino: </span>
                            {destino ? (destino.slice(0, destino.length <= 30 ? destino.length : destino.length - 10) + '...') : 'Cargando...'}
                          </span>
                        </div>
                      </div>
                      <div className={styles.routeDetails}>
                        <div className={styles.detailItem}>
                          <Clock color={'#aa00ff'} size={16} />
                          <span>Hora de salida: {ruta.horadesalida}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <Armchair color={'#aa00ff'} size={16} />
                          <span>Asientos Disponibles: {ruta.asientosdisponibles}</span>
                        </div>
                        <div className={styles.detailItem}>
                          <Route color={'#aa00ff'} size={16} />
                          <span>Distancia de la ruta: {ruta.distancia.toFixed(1)} km</span>
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
              avatarUrl: selectedRoute.rutaconductorviaje?.[0]?.conductor?.usuario
                ?.urlAvatar
            }}
            routeData={{
              origen: origen,
              destino: destino,
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
              placa: selectedRoute.vehiculo?.vehiculopesado?.placa ??
                selectedRoute.vehiculo?.vehiculoligero?.nserie ??
                '—',
              tipovehiculo: selectedRoute.vehiculo?.vehiculopesado?.tipovehiculo ??
                selectedRoute.vehiculo?.vehiculoligero?.tipo ??
                '—',
              numeroasientos: selectedRoute.vehiculo?.numeroasientos,
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
                <QRCode
                  value={objetoString} // Aquí pasas la cadena serializada
                  size={250}
                  color="black"
                  level="Q"
                  className={styles.qrImageModal}
                />
                <p className={styles.qrHelpText}>
                  Escanea este QR en la App movil para ver la información de tu viaje.
                </p>
              </div>
            </div>
          </div>
        )}
        {showInfo ? (
          <div className={styles.previousRoutesSection}>
            <h2 className={styles.sectionTitle}>Viajes anteriores</h2>
            <div className={styles.cardsGrid}>
              {previousRoutes.length > 0 ? (
                previousRoutes.map(rutaData => (
                  <RutaAnteriorCard
                    routeData={rutaData}
                    onEstablecerRuta={() => { console.log("soy yo guacho", previousRoutes); }}
                  />
                ))
              ) : (
                <div className={styles.infoMessage}>No tienes viajes anteriores</div>
              )}
            </div>
          </div>
        ) : (
          <div>
          </div>
        )}
      </div>
    </LoadScript>
  );
};


//CODIGO PARA DECODIFICAR EN REACT NATIVE EN LA APP DEL CELULAR
/* const jsonString = atob(scannedText);        // Decodifica Base64
const objeto = JSON.parse(jsonString);
console.log(objeto); */

export default TravelPage;