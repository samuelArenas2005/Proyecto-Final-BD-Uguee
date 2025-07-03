import React, { useState } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { Search, Filter, MoreVertical } from 'lucide-react';
import styles from './monitoreo.module.css';



/*
DANIEL ANDRADE
FIJATE EN EL CONST 'trips', bastaria entonces con obtener esa informacion de la base de datos
para mostralas, recuerda que supabase retorna un arreglo de objetos literal, QUE ES LO 
MISMO QUE TIENE TRIPS!!! :DD

VE A RUTASANTERIORESCARD, PARA OBTENER EL METEODO GETORDENADAS, AHI PODRAS CONVERTIR LAS COORDENADAS EN UBICACIONES REALES

Aca solo se muestra la ubicacion de viajes activos, nada de rutas, son los viajes. 
añadele tambien el atributo 'partida' en la info, tu puedes! :D

recuerda que solo puede mostrar la info de la universidad a la que pertenece no puedes mostrar de todos los viajes, por que
hay estudiantes de otras universidad :D
*/

// --- Configuración y Datos ---
const containerStyle = { width: '100%', height: '100%' };
const center = { lat: 3.3762, lng: -76.5323 };

// Datos de ejemplo para los viajes
const trips = [
  { id: '234b', position: { lat: 3.378, lng: -76.535 }, conductor: 'Juliana Rincon', pasajeros: 'Juan Manuel Sierra, Alejandro Cordoba', destino: 'Universidad del Valle' },
  { id: '112c', position: { lat: 3.370, lng: -76.529 }, conductor: 'Carlos Perez', pasajeros: 'Ana Lopez', destino: 'Centro Comercial Unicentro' },
  { id: '589a', position: { lat: 3.385, lng: -76.531 }, conductor: 'Maria Rodriguez', pasajeros: 'Sofia Vergara, Luis Diaz', destino: 'Estación MIO Meléndez' }
];

// Estilo de mapa monocromático para lograr el aspecto de la imagen de referencia


export default function UserMonitorPage() {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_APIS_GOOGLE // Asegúrate que tu API Key esté configurada
  });

  const [selectedTrip, setSelectedTrip] = useState(null);

  // Muestra un mensaje de carga mientras la API de Google Maps se inicializa
  if (!isLoaded) {
    return <div>Cargando mapa...</div>;
  }

  return (
    // Contenedor principal de la página con fondo gris
    <div className={styles.monitorContainer}>
      {/* Wrapper para centrar y dimensionar el panel del mapa */}
      <div className={styles.mapAndControlsWrapper}>
        
        {/* Controles Superiores flotantes */}
        <div className={styles.topControls}>
          <h1 className={styles.title}>MONITORIO DE USUARIOS DE UNIVALLE</h1>
          <div className={styles.searchBar}>
            <input type="text" placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO" />
            <Search size={20} className={styles.searchIcon} />
            <div className={styles.separator}></div>
            <Filter size={20} className={styles.filterIcon} />
          </div>
        </div>
        
        {/* Contenedor del Mapa (la "tarjeta" con bordes redondeados) */}
        <div className={styles.mapWrapper}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={15}
            options={{ 
                disableDefaultUI: true, 
                zoomControl: true // Mantenemos el control de zoom nativo
            }}
          >
            {/* Mapeo de los viajes para crear un marcador por cada uno */}
            {trips.map((trip) => (
              <MarkerF
                key={trip.id}
                position={trip.position}
                icon={'/carIcono.png'}
                onClick={() => setSelectedTrip(trip)}
              />
            ))}

            {/* Ventana de información que aparece al seleccionar un viaje */}
            {selectedTrip && (
              <InfoWindowF
                position={selectedTrip.position}
                onCloseClick={() => setSelectedTrip(null)}
                options={{ pixelOffset: new window.google.maps.Size(0, -40) }}
              >
                <div className={styles.infoWindow}>
                  <div className={styles.infoHeader}>
                    <h3>Información del viaje {selectedTrip.id}</h3>
                    <MoreVertical size={20} cursor="pointer" />
                  </div>
                  <div className={styles.infoBody}>
                    <p><strong>Conductor</strong></p><p>{selectedTrip.conductor}</p>
                    <p><strong>Pasajeros</strong></p><p>{selectedTrip.pasajeros}</p>
                    <p><strong>Destino</strong></p><p>{selectedTrip.destino}</p>
                  </div>
                </div>
              </InfoWindowF>
            )}
          </GoogleMap>
        </div>

      </div>
    </div>
  );
}