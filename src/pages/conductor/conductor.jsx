import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Clock,
  SlidersHorizontal,
  Users, // Icono para asientos
} from 'lucide-react';
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsRenderer,
} from '@react-google-maps/api';

// ==== IMPORTACIÓN DE SUPABASE ====
import { supabase } from '../../supabaseClient.js'; // Ajusta la ruta si es necesario

import styles from './conductor.module.css';
import RutaAnteriorCard from './componentes/RutaAnteriorCard';
import SuccessModal from './componentes/succes';
import FilterDialog from '../pasajero/complementos/filterDialog';
import wave from '/wave.svg'; // Ruta correcta para assets en /public en Vite

// ==== CONFIGURACIÓN DE GOOGLE MAPS ====
const apigoogle = import.meta.env.VITE_APIS_GOOGLE;

const libraries = ['places'];

// Estilos para un mapa limpio
const mapCustomStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

const DEFAULT_CENTER = { lat: 3.3745, lng: -76.5308 }; // Univalle Cali

const ConductorPage = () => {
  // Estados para inputs y coordenadas
  const [startPoint, setStartPoint] = useState('');
  const [destination, setDestination] = useState('');
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [asientos, setAsientos] = useState(4); // Nuevo estado para asientos disponibles
  const [dateTime, setDateTime] = useState(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1); // Pone la hora por defecto 1 hora en el futuro
    now.setMinutes(0);
    return now.toISOString().slice(0, 16);
  });

  // Estados del mapa y de la ruta
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null); // Estado para guardar la distancia en metros

  // Estados de UI
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false); // Estado para deshabilitar el botón al enviar

  // Referencias para Autocomplete
  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  // ==== HANDLERS DE AUTOCOMPLETE ====
  const onLoadStart = (autocomplete) => (autoStartRef.current = autocomplete);
  const onPlaceChangedStart = () => {
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

  // ==== EFECTO PARA CALCULAR LA RUTA EN EL MAPA ====
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
            // Extraer y guardar la distancia (en metros)
            const routeDistance = result.routes[0].legs[0].distance.value;
            setDistance(routeDistance);
          } else {
            console.error(`Error fetching directions ${result}`);
          }
        }
      );
    }
  }, [startCoords, destCoords]);

  // ==== FUNCIÓN PARA ESTABLECER RUTA EN SUPABASE ====
  const handleEstablecerRuta = async () => {
    if (!startCoords || !destCoords || !dateTime || asientos <= 0) {
      alert('Por favor, completa todos los campos: partida, destino, fecha/hora y asientos.');
      return;
    }

    setLoading(true);

    try {
      // 1. Obtener el usuario autenticado
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error('Usuario no autenticado.');

      // 2. Obtener el idvehiculo del conductor
      const { data: conductorData, error: conductorError } = await supabase
        .from('conductor')
        .select('idvehiculo')
        .eq('idusuario', user.id)
        .single();

      if (conductorError || !conductorData) throw new Error('No se pudo encontrar el vehículo del conductor.');

      // 3. Preparar los datos para la tabla 'ruta'
      const fechaHora = new Date(dateTime);
      const nuevaRuta = {
        idvehiculo: conductorData.idvehiculo,
        salidalatitud: startCoords.lat,
        salidalongitud: startCoords.lng,
        paradalatitud: destCoords.lat,
        paradalongitud: destCoords.lng,
        distancia: distance, // Distancia en metros calculada por Google Maps
        fecha: fechaHora.toISOString().split('T')[0], // Formato YYYY-MM-DD
        horadesalida: fechaHora.toTimeString().split(' ')[0], // Formato HH:MM:SS
        asientosdisponibles: parseInt(asientos, 10),
        tipoderuta: 'Diaria', // Valor por defecto o puedes añadir un input para esto
        estado: 'activo', // Por defecto 'activo'
      };

      // 4. Insertar la nueva ruta y obtener su ID
      const { data: rutaInsertada, error: rutaError } = await supabase
        .from('ruta')
        .insert(nuevaRuta)
        .select('idruta')
        .single();

      if (rutaError || !rutaInsertada) throw new Error('Error al crear la ruta.');

      // 5. Crear la relación en 'rutaconductorviaje'
      const nuevaRelacion = {
        idruta: rutaInsertada.idruta,
        idconductor: user.id, // Es el id del usuario autenticado
        idviaje: null, // Default NULL como se solicitó
      };

      const { error: relacionError } = await supabase
        .from('rutaconductorviaje')
        .insert(nuevaRelacion);

      if (relacionError) throw new Error('Error al asociar la ruta al conductor.');

      // 6. Éxito: mostrar modal y limpiar formulario
      setShowSuccessModal(true);
      setStartPoint('');
      setDestination('');
      setStartCoords(null);
      setDestCoords(null);
      setDirectionsResponse(null);

    } catch (error) {
      console.error('Error al establecer la ruta:', error.message);
      alert(`Ocurrió un error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseModal = () => setShowSuccessModal(false);

  // Datos mock para rutas anteriores (sin cambios)
  const rutasAnterioresData = [
    { id: 1, title: 'Ruta 1', origin: 'Partida El Caney', destination: 'Destino Univalle', departureTime: 'Lunes, 10:00 am' },
    { id: 2, title: 'Ruta 2', origin: 'Partida El Caney', destination: 'Destino Univalle', departureTime: 'Martes, 8:00 am' },
  ];

  return (
    <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
      <div className={styles.pageContainer}>
        <div className={styles.topSectionWave}>
          <img src={wave} alt="Fondo de ola" className={styles.waveBg} />
          <div className={styles.contentWrapper}>
            <div className={styles.routeSetupSection}>
              <h2 className={styles.greeting}>¡Hola Miguel Andrade! Establece tu ruta de hoy</h2>
              <div className={styles.inputGroup}>
                {/* AUTOCOMPLETE: Punto de partida */}
                <div className={styles.inputWrapper}>
                  <MapPin className={styles.inputIcon} size={20} />
                  <Autocomplete onLoad={onLoadStart} onPlaceChanged={onPlaceChangedStart} fields={['formatted_address', 'geometry']}>
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
                <div className={styles.inputWrapper}>
                  <MapPin className={styles.inputIcon} size={20} />
                  <Autocomplete onLoad={onLoadDest} onPlaceChanged={onPlaceChangedDest} fields={['formatted_address', 'geometry']}>
                    <input
                      type="text"
                      placeholder="Destino"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      className={styles.inputField}
                    />
                  </Autocomplete>
                </div>
                {/* INPUT: Fecha y Hora */}
                <div className={styles.inputWrapper}>
                  <Clock className={styles.inputIcon} size={20} />
                  <input
                    type="datetime-local"
                    value={dateTime}
                    onChange={(e) => setDateTime(e.target.value)}
                    className={styles.inputField}
                  />
                </div>
                {/* INPUT: Asientos Disponibles */}
                <div className={styles.inputWrapper}>
                  <Users className={styles.inputIcon} size={20} />
                  <input
                    type="number"
                    value={asientos}
                    onChange={(e) => setAsientos(e.target.value)}
                    placeholder="Asientos disponibles"
                    className={styles.inputField}
                    min="1"
                  />
                </div>
              </div>
              <div className={styles.buttonGroup}>
                <button className={styles.submitButton} onClick={handleEstablecerRuta} disabled={loading}>
                  {loading ? 'Estableciendo...' : 'Establecer ruta'}
                </button>
                <button className={styles.filterButton} onClick={() => setIsFilterDialogOpen(true)} aria-label="Filtros">
                  <SlidersHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className={styles.mapSection}>
              <GoogleMap
                mapContainerClassName={styles.mapContainer}
                center={mapCenter}
                zoom={mapZoom}
                options={{ styles: mapCustomStyles, disableDefaultUI: true, zoomControl: true }}
              >
                {directionsResponse && (
                  <DirectionsRenderer
                    options={{
                      directions: directionsResponse,
                      suppressMarkers: false, // Google pone los marcadores A y B
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
          <h2 className={styles.sectionTitle}>Rutas anteriores</h2>
          <div className={styles.cardsGrid}>
            {rutasAnterioresData.map((ruta) => (
              <RutaAnteriorCard key={ruta.id} routeData={ruta} onEstablecerRuta={() => { /* Lógica si se reutiliza una ruta */ }} />
            ))}
          </div>
        </div>

        <SuccessModal isOpen={showSuccessModal} onClose={handleCloseModal} />
        <FilterDialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen} />
      </div>
    </LoadScript>
  );
};

export default ConductorPage;