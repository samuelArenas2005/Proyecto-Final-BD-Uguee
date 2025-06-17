
import React from 'react';
import styles from './pasajeroCard.module.css';
import { MapPin, Clock, UserCircle2,User2, Info} from 'lucide-react'; // Agregado UserCircle2

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
            <User2 size={16} className={styles.locationIcon} />
            <span>{passenger.estatuto}</span>
          </div>
          
        </div>
      </div>

      <div className={styles.moreInfo}>
        <p className={styles.moreInfoTitle}>Mas info:</p>
        <div className={styles.locationItem}>
            <Info size={16} className={styles.locationIcon} />
            <span>{passenger.codigo}</span>
        </div>
      </div>
    </div>
  );
};

export default PassengerCard;