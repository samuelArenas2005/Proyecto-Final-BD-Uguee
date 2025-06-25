import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  SlidersHorizontal,
  Users,
} from 'lucide-react';
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';
import { supabase } from '../../supabaseClient.js';

import styles from './conductor.module.css';
import RutaAnteriorCard from './componentes/RutaAnteriorCard';
import SuccessModal from './componentes/succes';
import FilterDialog from '../pasajero/complementos/filterDialog';
import wave from '/wave.svg';

const apigoogle = import.meta.env.VITE_APIS_GOOGLE;
const libraries = ['places'];
const mapCustomStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
const DEFAULT_CENTER = { lat: 3.3745, lng: -76.5308 };

// --- COMPONENTE DE CARGA ---
const LoadingScreen = () => (
  <div className={styles.loadingScreen}>
    <h2>Verificando rutas activas...</h2>
    {/* Podrías agregar un spinner aquí */}
  </div>
);


const ConductorPage = () => {
  const navigate = useNavigate();
  // --- NUEVO ESTADO PARA VERIFICACIÓN INICIAL ---
  const [isCheckingForActiveRoute, setIsCheckingForActiveRoute] = useState(true);

  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [asientos, setAsientos] = useState(1);
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  });

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [maxAsientosVehiculo, setMaxAsientosVehiculo] = useState(null);
  const [isVehicleInfoLoading, setIsVehicleInfoLoading] = useState(true);

  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  // intento danicol

  const [showInfo,setShowInfo] = useState(true)
  

  
  // --- NUEVO USEEFFECT PARA VERIFICAR RUTA ACTIVA AL CARGAR ---
  useEffect(() => {
    const checkForActiveRoute = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          // Busca una relación que pertenezca al conductor y cuya ruta interna tenga estado 'activo'
          const { data: activeRouteData, error } = await supabase
            .from('rutaconductorviaje')
            .select('idruta, ruta!inner(estado)') // !inner asegura que solo traiga registros si hay una ruta coincidente
            .eq('idconductor', user.id)
            .eq('ruta.estado', 'activo')
            .maybeSingle(); // .maybeSingle() devuelve un solo registro o null, sin lanzar error si no encuentra nada.

          if (error) {
            console.error('Error verificando ruta activa:', error);
          }

          // Si se encuentra una ruta activa, redirige al usuario a la página de información del viaje
          if (activeRouteData && activeRouteData.idruta) {
            // El usuario ya tiene una ruta activa, lo redirigimos a la página de esa ruta.
            // Asumo que la página de información del viaje es TravelInfoPage, montada en esta URL.
            navigate(`/conductor/viaje/${activeRouteData.idruta}`);
          } else {
            // No hay ruta activa, permite que la página se cargue para crear una nueva.
            setIsCheckingForActiveRoute(false);
          }
        } else {
          // No hay usuario, permite que la página cargue.
          // Otras lógicas (como guardias de ruta) deberían manejar el caso de usuario no autenticado.
          setIsCheckingForActiveRoute(false);
        }
      } catch (e) {
        console.error("Error en la verificación de ruta:", e);
        setIsCheckingForActiveRoute(false); // En caso de cualquier error, permite que la página cargue
      }
    };

    checkForActiveRoute();
  }, [navigate]); // Se agrega navigate a las dependencias


  useEffect(() => {
    const fetchVehicleInfo = async () => {
      //... (el resto del código de este useEffect no cambia)
      setIsVehicleInfoLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            throw new Error("Usuario no autenticado.");
        }
        const { data: conductorData, error } = await supabase
          .from('conductor')
          .select('vehiculo ( numeroasientos )')
          .eq('idusuario', user.id)
          .single();
        if (error) throw error;
        if (conductorData && conductorData.vehiculo) {
          const capacidadPasajeros = conductorData.vehiculo.numeroasientos - 1;
          setMaxAsientosVehiculo(capacidadPasajeros > 0 ? capacidadPasajeros : 0);
          if (asientos > capacidadPasajeros) {
              setAsientos(capacidadPasajeros);
          }
        }
      } catch (error) {
        console.error('Error fetching vehicle info:', error.message);
        setMaxAsientosVehiculo(0);
      } finally {
        setIsVehicleInfoLoading(false);
      }
    };
    fetchVehicleInfo();
  }, [asientos]);

  const handleAsientosChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
        value = 1;
    }
    if (maxAsientosVehiculo !== null && value > maxAsientosVehiculo) {
        value = maxAsientosVehiculo;
    }
    setAsientos(value);
  };

  const onLoadStart = (autocomplete) => (autoStartRef.current = autocomplete);
  const onPlaceChangedStart = () => {
    //... (código sin cambios)
    if (autoStartRef.current) {
        const place = autoStartRef.current.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            const coords = { lat: location.lat(), lng: location.lng() };
            setStartPoint(place.formatted_address);
            setStartCoords(coords);
            setMapCenter(coords);
            setMapZoom(16);
        }
    }
  };

  const onLoadDest = (autocomplete) => (autoDestRef.current = autocomplete);
  const onPlaceChangedDest = () => {
    //... (código sin cambios)
    if (autoDestRef.current) {
        const place = autoDestRef.current.getPlace();
        if (place.geometry) {
            const location = place.geometry.location;
            const coords = { lat: location.lat(), lng: location.lng() };
            setDestination(place.formatted_address);
            setDestCoords(coords);
        }
    }
  };

  useEffect(() => {
    //... (código sin cambios)
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
                    const leg = result.routes[0].legs[0];
                    setDistance(leg.distance.value);
                    setDuration(leg.duration.value);
                } else {
                    console.error(`Error fetching directions ${result}`);
                    setDuration(null);
                }
            }
        );
    }
  }, [startCoords, destCoords]);

  const handleEstablecerRuta = async () => {
    //... (código de la función sin cambios)
    if (!startCoords || !destCoords || !dateTime || asientos <= 0 || !duration) {
      alert('Por favor, completa todos los campos y asegúrate de que la ruta y su duración se hayan calculado correctamente.');
      return;
    }
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado.');
      const { data: conductorData, error: conductorError } = await supabase
          .from('conductor').select('idvehiculo').eq('idusuario', user.id).single();
      if (conductorError || !conductorData) throw new Error('No se pudo encontrar el vehículo del conductor.');
      const fechaHora = new Date(dateTime);
      const nuevaRuta = {
        idvehiculo: conductorData.idvehiculo,
        salidalatitud: startCoords.lat,
        salidalongitud: startCoords.lng,
        paradalatitud: destCoords.lat,
        paradalongitud: destCoords.lng,
        distancia: distance / 1000,
        fecha: fechaHora.toISOString().split('T')[0],
        horadesalida: fechaHora.toTimeString().split(' ')[0],
        asientosdisponibles: parseInt(asientos, 10),
        tipoderuta: 'Diaria',
        estado: 'activo',
      };
      const { data: rutaInsertada, error: rutaError } = await supabase
        .from('ruta')
        .insert(nuevaRuta)
        .select('idruta')
        .single();
      if (rutaError || !rutaInsertada) throw new Error(`Error al crear la ruta: ${rutaError?.message}`);
      const duracionEnHoras = duration / 3600;
      const nuevoViaje = {
        tiempodesalida: fechaHora.toISOString(),
        tiempodellegada: null,
        duracionviajehoras: duracionEnHoras,
        estadodelviaje: 'pendiente',
        ubicacionactuallatitud: null,
        ubicacionactuallongitud: null,
      };
      const { data: viajeInsertado, error: viajeError } = await supabase
        .from('viaje')
        .insert(nuevoViaje)
        .select('idviaje')
        .single();
      if (viajeError || !viajeInsertado) throw new Error(`Error al crear el viaje: ${viajeError?.message}`);
      const nuevaRelacion = {
        idruta: rutaInsertada.idruta,
        idconductor: user.id,
        idviaje: viajeInsertado.idviaje,
      };
      const { error: relacionError } = await supabase.from('rutaconductorviaje').insert(nuevaRelacion);
      if (relacionError) throw new Error(`Error al asociar la ruta al conductor: ${relacionError?.message}`);
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(`/conductor/viaje/${rutaInsertada.idruta}`);
      }, 2000);
    } catch (error) {
      console.error('Error al establecer la ruta y el viaje:', error.message);
      alert(`Ocurrió un error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rutasAnterioresData = [
  ];

  // --- RENDERIZADO CONDICIONAL ---
  if (isCheckingForActiveRoute) {
    return <LoadingScreen />;
  }

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
      <div className={styles.pageContainer}>
        {/* ... (resto del JSX sin cambios) ... */}
        <div className={styles.topSectionWave}>
            <img src={wave} alt="Fondo de ola" className={styles.waveBg} />
            <div className={styles.contentWrapper}>
                <div className={styles.routeSetupSection}>
                    <h2 className={styles.greeting}>¡Hola Miguel Andrade! Establece tu ruta de hoy</h2>
                    <div className={styles.inputGroup}>
                        <div className={styles.inputWrapper}>
                            <MapPin className={styles.inputIcon} size={20} />
                            <Autocomplete onLoad={onLoadStart} onPlaceChanged={onPlaceChangedStart} fields={['formatted_address', 'geometry']} restrictions={{ country: 'co' }}>
                                <input type="text" placeholder="Punto de partida" value={startPoint} onChange={(e) => setStartPoint(e.target.value)} className={styles.inputField} />
                            </Autocomplete>
                        </div>
                        <div className={styles.inputWrapper}>
                            <MapPin className={styles.inputIcon} size={20} />
                            <Autocomplete onLoad={onLoadDest} onPlaceChanged={onPlaceChangedDest} fields={['formatted_address', 'geometry']} restrictions={{ country: 'co' }}>
                                <input type="text" placeholder="Destino" value={destination} onChange={(e) => setDestination(e.target.value)} className={styles.inputField} />
                            </Autocomplete>
                        </div>
                        <div className={styles.inputWrapper}>
                            <Clock className={styles.inputIcon} size={20} />
                            <input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} className={styles.inputField} />
                        </div>
                        <div className={styles.inputWrapper}>
                            <Users className={styles.inputIcon} size={20} />
                            <input
                                type="number"
                                value={asientos}
                                onChange={handleAsientosChange}
                                className={styles.inputField}
                                min="1"
                                max={maxAsientosVehiculo}
                                disabled={isVehicleInfoLoading}
                                title={isVehicleInfoLoading ? "Cargando capacidad del vehículo..." : `Máximo ${maxAsientosVehiculo} asientos disponibles`}
                            />
                        </div>
                    </div>
                    <div className={styles.buttonGroup}>
                        <button className={styles.submitButton} onClick={handleEstablecerRuta} disabled={loading || isVehicleInfoLoading}>
                            {loading ? 'Estableciendo...' : 'Establecer ruta'}
                        </button>
                        <button className={styles.filterButton} onClick={() => setIsFilterDialogOpen(true)} aria-label="Filtros">
                            <SlidersHorizontal size={20} />
                        </button>
                    </div>
                </div>
                <div className={styles.mapSection}>
                    <GoogleMap mapContainerClassName={styles.mapContainer} center={mapCenter} zoom={mapZoom} options={{ styles: mapCustomStyles, disableDefaultUI: true, zoomControl: true }}>
                        {directionsResponse && (<DirectionsRenderer options={{ directions: directionsResponse, suppressMarkers: false, polylineOptions: { strokeColor: '#AA00FF', strokeWeight: 5 } }} />)}
                    </GoogleMap>
                </div>
            </div>
        </div>
        {showInfo ? (
                  <div className={styles.previousRoutesSection}>
                    <h2 className={styles.sectionTitle}>Viajes anteriores</h2>
                    <div className={styles.cardsGrid}>
                      {rutasAnterioresData.length > 0 ? (
                        rutasAnterioresData.map((ruta) => (<RutaAnteriorCard key={ruta.id} routeData={ruta} onEstablecerRuta={() => { }} />))
                        /*
                        previousRoutes.map(rutaData => (
                          <RutaAnteriorCard
                            routeData={rutaData}
                            onEstablecerRuta={() => { console.log("soy yo guacho", previousRoutes); }}
                          />
                        ))*/
                      ) : (
                        <div className={styles.infoMessage}>No tienes viajes anteriores</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                  </div>
                )}
        <SuccessModal isOpen={showSuccessModal} onClose={() => setShowSuccessModal(false)} />
        <FilterDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen} />
      </div>
    </LoadScript>
  );
};


export default ConductorPage;