import React from 'react';
import { Car, ListChecks, User } from 'lucide-react';
import styles from './HeaderPasajero.module.css';
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className={styles.appHeader}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
      <span className={styles.logoU}>U</span>
      <span className={styles.logoGuee}>güee</span>
        </Link>

      </div>
      <nav className={styles.navigation}>
        <button className={`${styles.navButton} ${styles.conductorButton}`}>
          <Car size={20} className={styles.icon} />
          Quiero ser Conductor
        </button>
        <button className={`${styles.navButton} ${styles.activityButton}`}>
          <ListChecks size={20} className={styles.icon} />
          Actividad
        </button>
        <button className={`${styles.navButton} ${styles.profileButton}`}>
          <User size={24} className={styles.iconProfile} />
        </button>
      </nav>
    </header>
  );
};

export default Header;