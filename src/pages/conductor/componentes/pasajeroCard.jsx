
import React from 'react';
import styles from './pasajeroCard.module.css';
import { MapPin, Clock, UserCircle2 } from 'lucide-react'; // Agregado UserCircle2

const PassengerCard = ({ passenger }) => {
  return (
    <div className={styles.card}>
      <div className={styles.avatarContainer}>
        {passenger.avatarUrl ? (
          <img src={passenger.avatarUrl} alt={passenger.name} className={styles.avatarImage} />
        ) : (
          <UserCircle2 size={48} className={styles.avatarIcon} /> // Icono por defecto
        )}
      </div>

      <div className={styles.passengerInfo}>
        <p className={styles.passengerName}>{passenger.name}</p>
        <div className={styles.locationDetails}>
          <div className={styles.locationItem}>
            <MapPin size={16} className={styles.locationIcon} />
            <span>{passenger.departure}</span>
          </div>
          <div className={styles.locationItem}>
            <MapPin size={16} className={styles.locationIcon} />
            <span>{passenger.destination}</span>
          </div>
        </div>
      </div>

      <div className={styles.moreInfo}>
        <p className={styles.moreInfoTitle}>Mas info:</p>
        <div className={styles.arrivalTimeLine}>
          <Clock size={16} className={styles.clockIcon} />
          <span className={styles.arrivalLabel}>Hora de llegada</span>
        </div>
        <p className={styles.arrivalTimeValue}>{passenger.arrivalTime}</p>
      </div>
    </div>
  );
};

export default PassengerCard;