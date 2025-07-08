// src/components/RutasPage/SuccessModal.jsx
import React from 'react';
import styles from './succes.module.css';
import { CheckCircle2, X } from 'lucide-react';
import { Link } from "react-router-dom";

const SuccessModal = ({ isOpen, onClose,rutaInsertadaId }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onClose}>
          <X size={24} />
        </button>
        <div className={styles.iconContainer}>
          <CheckCircle2 size={60} className={styles.successIcon} />
        </div>
        <h3 className={styles.modalTitle}>¡Éxito!</h3>
        <p className={styles.modalMessage}>
          Su viaje se estableció con éxito, <br />
          dentro de poco podra ver aquellos estudiantes interesados en tomar su ruta.
        </p>
        <Link to={`/conductor/viaje/${rutaInsertadaId}`} className={styles.okButton}>  
              <span>Entendido</span>
        </Link>
      </div>
    </div>
  );
};

export default SuccessModal;