// src/components/RutasPage/RutaAnteriorCard.jsx
import React, { useRef, useEffect, useState } from 'react';
import styles from './RutaAnteriorCard.module.css';
import { MapPinCheck, Clock, Route as RouteIcon , MapPinHouse,Trash2} from 'lucide-react';

const RutaAnteriorCard = ({ routeData, onEstablecerRuta,onBorrarRuta }) => {
  const [origen, setOrigen] = useState(null);
  const [destino,setDestino] = useState(null);

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

  useEffect(() => {
    const fetchDireccion = async () => {
        const direccion = await getAddressFromCoords(
          routeData.originlat,
          routeData.originlong);
        setOrigen(direccion);

        const direcciondestino = await getAddressFromCoords(
          routeData.destinationlat,
          routeData.destinationlong);
        setDestino(direcciondestino);
    };
    fetchDireccion();
  }, []);


  


return (
    <div className={styles.card}>
      <div className={styles.header}>
        <RouteIcon size={30} className={styles.routeIconGlobal} />
        <h3 className={styles.title}>{routeData.title}</h3>
        <h3 className={styles.translucent}>{"CongitoJrProtei"}</h3>
        <button className={styles.translucidActionButton} onClick={onBorrarRuta}>
          <Trash2 size={18} className={styles.icon} />
        </button>
      </div>
      <div className={styles.details}>
        <div className={styles.location}>
          <MapPinHouse size={18} className={styles.icon} />
          <span>{origen}</span>
        </div>
        <div className={styles.location}>
          <MapPinCheck size={18} className={styles.icon} color="#5752B9"/>
          <span>{destino}</span>
        </div>
      </div>
      <div className={styles.info}>
        <h4 className={styles.infoTitle}>Mas info:</h4>
        <div className={styles.departureTime}>
          <Clock size={18} className={styles.icon} />
          <span>{routeData.departureTime}</span>
        </div>
      </div>
      <button className={styles.actionButton} onClick={onEstablecerRuta}>
        Establecer nuevamente la ruta
      </button>
    </div>
  );
};

export default RutaAnteriorCard;