import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  GoogleMap,
  useLoadScript,
  DirectionsRenderer
} from '@react-google-maps/api';
import { supabase } from '../../supabaseClient.js';

import styles from './viajeConductor.module.css';
import PassengerCard from './componentes/pasajeroCard';
import { MapPin, Clock, Users, CheckCircle2, AlertCircle, ExternalLink, Loader } from 'lucide-react';
import waveImage from "../../../public/wave.svg";

// --- CONFIGURACIÓN DE GOOGLE MAPS ---
const apigoogle = import.meta.env.VITE_APIS_GOOGLE;
const libraries = ['places'];
const mapCustomStyles = [
  { featureType: 'poi', elementType: 'labels', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];
const DEFAULT_CENTER = { lat: 3.420556, lng: -76.522222 };

const TravelInfoPage = () => {
  const { idruta } = useParams();
  const navigate = useNavigate();

  // --- Estados de la ruta ---
  const [rutaData, setRutaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);

  // --- Estados de los pasajeros ---
  const [passengers, setPassengers] = useState([]);
  const [passengersLoading, setPassengersLoading] = useState(true);
  const [passengerError, setPassengerError] = useState(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apigoogle,
    libraries: libraries,
  });

  // --- EFECTO PARA BUSCAR DATOS DE LA RUTA Y CALCULAR DIRECCIONES ---
  useEffect(() => {
    if (!idruta || !isLoaded) {
      if (loadError) setError("Error al cargar la API de Google Maps.");
      return;
    }

    const fetchRutaAndDirections = async () => {
      setLoading(true);
      try {
        const { data, error: supabaseError } = await supabase
          .from('ruta')
          .select('*')
          .eq('idruta', idruta)
          .single();

        if (supabaseError) throw supabaseError;
        if (!data) throw new Error("Ruta no encontrada.");

        setRutaData(data);
        setMapCenter({ lat: data.salidalatitud, lng: data.salidalongitud });

        const directionsService = new window.google.maps.DirectionsService();
        directionsService.route({
          origin: { lat: data.salidalatitud, lng: data.salidalongitud },
          destination: { lat: data.paradalatitud, lng: data.paradalongitud },
          travelMode: window.google.maps.TravelMode.DRIVING
        }, (result, status) => {
          if (status === 'OK') {
            setDirectionsResponse(result);
          } else {
            console.error(`Error al obtener la ruta del mapa: ${status}`);
            setError(`Error al obtener la ruta del mapa: ${status}`);
          }
        });
      } catch (err) {
        setError(err.message);
        console.error("Error fetching route data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRutaAndDirections();
  }, [idruta, isLoaded, loadError]);

  // --- EFECTO PARA BUSCAR PASAJEROS EN TIEMPO REAL (POLLING) ---
  useEffect(() => {
    if (!idruta) return;

    const fetchPassengers = async () => {
      try {
        setPassengersLoading(true); // Aseguramos que el estado de carga se active al inicio de cada intento
        setPassengerError(null); // Limpiamos cualquier error previo

        const { data: viajeData, error: viajeError } = await supabase
          .from('rutaconductorviaje')
          .select('idviaje')
          .eq('idruta', idruta)
          .single();

        // Si no se encuentra viajeData o hay un error al obtenerlo
        if (viajeError || !viajeData || !viajeData.idviaje) {
          setPassengersLoading(false);
          // Mensajes de error más específicos para el usuario
          if (viajeError) {
            setPassengerError("Error al conectar con la base de datos para obtener el viaje.");
            console.error("Error fetching viajeData:", viajeError);
          } else if (!viajeData || !viajeData.idviaje) {
            setPassengerError("No se encontró un viaje activo asociado a esta ruta.");
          }
          return; // IMPORTANTE: Detener la ejecución aquí para evitar usar 'undefined'
        }

        const idviaje = viajeData.idviaje; // Aquí idviaje ya está definido y es un número

        const { data: passengerData, error: passengerFetchError } = await supabase
          .from('pasajeroviaje')
          .select(`
            pasajero(
            usuario(
              nombrecompleto,estatuto,codigoestudiantil
            )
            )
          `)
          .eq('idviaje', idviaje); // Usamos 'idviaje' directamente que ya es un número

        if (passengerFetchError) throw passengerFetchError;

        // **CAMBIO en el formateo de los pasajeros**
        // Ahora accedemos directamente a `p.pasajero.usuario` ya que quitamos `user_details`
        const formattedPassengers = passengerData
          .filter(p => p.pasajero && p.pasajero.usuario)
          .map(p => ({
            id: p.pasajero.usuario.idusuario, // Accedemos al idusuario del objeto usuario
            nombrecompleto: p.pasajero.usuario.nombrecompleto,
            estatuto: p.pasajero.usuario.estatuto,
            codigoestudiantil: p.pasajero.usuario.codigoestudiantil,
          }));

        setPassengers(formattedPassengers);
        setPassengerError(null); // Aseguramos que el error se limpie si la consulta fue exitosa

      } catch (err) {
        console.error("Error al buscar pasajeros:", err);
        setPassengerError("No se pudieron cargar los pasajeros. " + err.message);
      } finally {
        setPassengersLoading(false);
      }
    };

    fetchPassengers();
    const intervalId = setInterval(fetchPassengers, 10000);

    return () => clearInterval(intervalId);

  }, [idruta]); // Las dependencias están bien aquí, no es necesario agregar passengersLoading/passengerError

  // --- Manejadores de eventos y Renderizado (sin cambios) ---

  const handleStartTrip = () => {
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 5000);
  };

  const handleCancelTrip = async () => {
    if (window.confirm("¿Estás seguro de que quieres cancelar este viaje? Esta acción no se puede deshacer.")) {
      try {
        const { error: supabaseError } = await supabase
          .from('ruta')
          .update({ estado: 'inactivo' })
          .eq('idruta', idruta);

        if (supabaseError) throw supabaseError;

        alert("Viaje cancelado exitosamente.");
        navigate('/conductor');
      } catch (error) {
        console.error("Error al cancelar el viaje:", error.message);
        alert("No se pudo cancelar el viaje. Inténtalo de nuevo.");
      }
    }
  };

  if (loadError) return <div className={styles.centeredLoader}><AlertCircle size={48} color="red" /> <p>Error al cargar API de Google Maps: {loadError.message}</p></div>;
  if (!isLoaded) return <div className={styles.centeredLoader}><Loader size={48} className="animate-spin" /> <p>Cargando Google Maps...</p></div>;
  if (loading) return <div className={styles.centeredLoader}><Loader size={48} className="animate-spin" /> <p>Cargando información del viaje...</p></div>;
  if (error) return <div className={styles.centeredLoader}><AlertCircle size={48} color="red" /> <p>Error: {error}</p></div>;

  return (
    <div className={styles.pageContainer}>
      <img src={waveImage} alt="Fondo decorativo de onda" className={styles.waveBg} />

      <div className={styles.mainContent}>
        <div className={styles.topRow}>
          <div className={styles.tripInfoCard}>
            <h2 className={styles.sectionTitle}>Información de tu viaje</h2>
            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span>Salida: {directionsResponse?.routes[0].legs[0].start_address || 'Calculando...'}</span>
            </div>
            <div className={styles.infoItem}>
              <MapPin size={20} className={styles.infoIcon} />
              <span>Destino: {directionsResponse?.routes[0].legs[0].end_address || 'Calculando...'}</span>
            </div>
            <div className={styles.infoItem}>
              <Clock size={20} className={styles.infoIcon} />
              <span>{rutaData.fecha} a las {rutaData.horadesalida}</span>
            </div>
            <div className={styles.infoItem}>
              <Users size={20} className={styles.infoIcon} />
              <span>{passengers.length} de {rutaData.asientosdisponibles} pasajeros</span>
            </div>
            <button className={styles.startButton} onClick={handleStartTrip}>
              Comenzar viaje
            </button>
          </div>

          <div className={styles.qrAndMapSection}>
            <div className={styles.qrSection}>
              <h3 className={styles.qrTitle}>Escanear QR</h3>
              <div className={styles.qrImageContainer}>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=RutaID:${idruta}`}
                    alt={`Código QR para la ruta ${idruta}`}
                  />
              </div>
              <p className={styles.qrText}>
                Para obtener información de la ruta y reportes en la vía.
              </p>
              <a href="#" className={styles.appLink}>
                Descarga la app aquí <ExternalLink size={14} />
              </a>
            </div>

            <div className={styles.mapWrapper}>
              <GoogleMap
                  mapContainerClassName={styles.mapContainer}
                  center={mapCenter}
                  zoom={13}
                  options={{ styles: mapCustomStyles, disableDefaultUI: true, zoomControl: true }}
              >
                  {directionsResponse && (
                      <DirectionsRenderer options={{ directions: directionsResponse, polylineOptions: { strokeColor: '#5A2E98', strokeWeight: 5 } }} />
                  )}
                  <Link to="/conductor/reporte" className={styles.viewReportsButtonMap}>
                      <AlertCircle size={18} /> Ver reportes en la vía
                  </Link>
              </GoogleMap>
            </div>
          </div>
        </div>

        <div className={styles.passengersListSection}>
          <h2 className={styles.sectionTitle}>Lista de Pasajeros</h2>
          {passengersLoading ? (
            <div className={styles.centeredMessage}><Loader size={28} className="animate-spin" /> <span>Buscando pasajeros...</span></div>
          ) : passengerError ? (
            <div className={styles.centeredMessage}><AlertCircle size={28} color="red" /> <span>{passengerError}</span></div>
          ) : passengers.length > 0 ? (
            passengers.map(passenger => (
              <PassengerCard
                key={passenger.id}
                // **CAMBIO: se accede a las propiedades directamente desde el objeto passenger**
                passenger={{
                  id: passenger.id,
                  name: passenger.nombrecompleto,
                  estatuto: ` ${passenger.estatuto || 'No especificado'}`,
                  codigo: `Codigo: ${passenger.codigoestudiantil || 'N/A'}`,
                }}
              />
            ))
          ) : (
            <div className={styles.centeredMessage}>
              <Users size={28} />
              <span>Aún no tienes pasajeros que recoger. Esperando...</span>
            </div>
          )}
        </div>

        <div className={styles.bottomActions}>
          <button onClick={handleCancelTrip} className={styles.cancelButtonLink}>
            Cancelar viaje
          </button>
        </div>
      </div>

      {showNotification && (
        <div className={`${styles.notification} ${styles.notificationShow}`}>
          <CheckCircle2 size={24} className={styles.notificationIcon} />
          <span>¡Viaje comenzado con éxito!</span>
        </div>
      )}
    </div>
  );
};

export default TravelInfoPage;