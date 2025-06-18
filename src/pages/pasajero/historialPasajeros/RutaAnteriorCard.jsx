// src/components/RutasPage/RutaAnteriorCard.jsx
import React from 'react';
import styles from './RutaAnteriorCard.module.css';
import { MapPin, Clock, Route as RouteIcon } from 'lucide-react';

const RutaAnteriorCard = ({ routeData, onEstablecerRuta }) => {
  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <RouteIcon size={30} className={styles.routeIconGlobal} />
        <h3 className={styles.title}>{routeData.title}</h3>
      </div>
      <div className={styles.details}>
        <div className={styles.location}>
          <MapPin size={18} className={styles.icon} />
          <span>{routeData.origin}</span>
        </div>
        <div className={styles.location}>
          <MapPin size={18} className={styles.icon} />
          <span>{routeData.destination}</span>
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