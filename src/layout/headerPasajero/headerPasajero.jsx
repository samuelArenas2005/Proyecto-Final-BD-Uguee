import React from 'react';
import { Link } from 'react-router-dom';
import { Car, ListChecks, User } from 'lucide-react';
import styles from './HeaderPasajero.module.css';
import { useState } from 'react';
import RegistroConductor from "../../pages/pasajero/RegistroAConductor/registroConductor.jsx";





const Header = ({
  conductorConfig, // Ejemplo: { text: "Ver Mis Viajes", action: () => navigate('/conductor/viajes') }
  activityConfig,  // Ejemplo: { text: "Dashboard", to: "/conductor/dashboard" }
  profileAction,
  iconoComponent,   // Ejemplo: () => navigate('/perfil-conductor')
  userType 
}) => {
   const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
  // Configuraciones por defecto si no se proveen props específicas
  const defaultConductorConfig = {
    text: "Quiero ser Conductor",
    action:  openModal, // O navegar a una ruta por defecto
  };
  const defaultActivityConfig = {
    text: "Actividad",
    to: "/pasajero/actividad",
  };

  

  const currentConductor = conductorConfig || defaultConductorConfig;
  const currentActivity = activityConfig || defaultActivityConfig;
  const currentProfile = profileAction || defaultProfileAction;
  const IconoComponent = iconoComponent || Car

  return (
    <header className={styles.appHeader}>
      <div className={styles.logoContainer}>
        <Link to="/" className={styles.logo}>
          <span className={styles.logoU}>U</span>
          <span className={styles.logoGuee}>güee</span>
        </Link>
      </div>
      <nav className={styles.navigation}>
        <button
          className={`${styles.navButton} ${styles.conductorButton}`}
          onClick={currentConductor.action}
        >
          <IconoComponent size={20} className={styles.icon} />
          {currentConductor.text}
        </button>

        <Link to={currentActivity.to} className={`${styles.navButton} ${styles.activityButton}`}>
          <ListChecks size={20} className={styles.icon} />
          {currentActivity.text}
        </Link>

        <button
          className={`${styles.navButton} ${styles.profileButton}`}
          onClick={currentProfile}
        >
          <User size={24} className={styles.iconProfile} />
        </button>
        <RegistroConductor isOpen={isModalOpen} onClose={closeModal} />
      </nav>
       
    </header>
  );
};

export default Header;