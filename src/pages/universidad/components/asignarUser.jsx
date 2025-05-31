import React, { useState, useEffect } from 'react';
import styles from './asignarUser.module.css';
import { X, Search, UserCheck, UserPlus, UserMinus } from 'lucide-react';
import WebFont from 'webfontloader';

// Datos de ejemplo para los usuarios (puedes reemplazarlos con datos reales)
const allUsers = [ // Renombrado a allUsers para diferenciar de los filtrados
  { id: 'u1', name: 'Ana García', type: 'Pasajero', avatar: 'AG' },
  { id: 'u2', name: 'Pedro Martínez', type: 'Conductor', avatar: 'PM' },
  { id: 'u3', name: 'Laura Fernández', type: 'Pasajero', avatar: 'LF' },
  { id: 'u4', name: 'Diego Sánchez', type: 'Conductor', avatar: 'DS' },
  { id: 'u5', name: 'Sofía Ramirez', type: 'Pasajero', avatar: 'SR' },
  { id: 'u6', name: 'Gabriel Soto', type: 'Conductor', avatar: 'GS' },
  { id: 'u7', name: 'Valeria Herrera', type: 'Pasajero', avatar: 'VH' },
  { id: 'u8', name: 'Andrés Castro', type: 'Conductor', avatar: 'AC' },
  { id: 'u9', name: 'Carolina Vargas', type: 'Pasajero', avatar: 'CV' },
  { id: 'u10', name: 'Ricardo Morales', type: 'Conductor', avatar: 'RM' },
];

const AssignUserModal = ({ isOpen, onClose, onAssignMonitor, onAssignUser }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedUsers, setDisplayedUsers] = useState([]); // Nuevo estado para usuarios a mostrar
  const [hasSearched, setHasSearched] = useState(false); // Nuevo estado para controlar si ya se buscó

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Poppins:400,500,600,700', 'sans-serif']
      }
    });
  }, []);

  if (!isOpen) return null;

  const handleSearchClick = () => {
  // Si el término de búsqueda está vacío o solo contiene espacios en blanco
  if (searchTerm.trim() === '') {
    setDisplayedUsers([]); // Vacía la lista de usuarios mostrados
    setHasSearched(false); // No se ha realizado una búsqueda "válida"
    return; // Sale de la función sin realizar la búsqueda
  }

  setHasSearched(true); // Indica que ya se realizó una búsqueda válida
  const filtered = allUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  setDisplayedUsers(filtered);
};

  const handleClearSearch = () => {
    setSearchTerm('');
    setDisplayedUsers([]);
    setHasSearched(false); // Reinicia el estado de búsqueda
  };

  const onHandClose = () => {
    onClose()
    console.log("cerrandose")
    setSearchTerm('');
    setDisplayedUsers([]);
    setHasSearched(false);
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={onHandClose}>
          <X size={24} />
        </button>

        <h2 className={styles.modalTitle}>Designar roles de usuario</h2>

        <div className={styles.searchBarContainer}> {/* Nuevo contenedor para el input y el botón */}
          <div className={styles.searchInputWrapper}>
            <Search size={20} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Buscar usuario por nombre..."
              className={styles.searchInput}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => { // Permite buscar con Enter
                if (e.key === 'Enter') {
                  handleSearchClick();
                }
              }}
            />
          </div>
          <button className={styles.searchButton} onClick={handleSearchClick}>
            <Search size={20} /> Buscar
          </button>
        </div>

        {hasSearched && ( // Solo muestra la lista si ya se ha buscado
          <div className={styles.userList}>
            {displayedUsers.length > 0 ? (
              displayedUsers.map(user => (
                <div key={user.id} className={styles.userCard}>
                  <div className={styles.userInfo}>
                    <div className={styles.avatar}>{user.avatar}</div>
                    <span className={styles.userName}>{user.name}</span>
                  </div>
                  <div className={styles.userActions}>
                    <button
                      className={`${styles.actionButton} ${styles.monitorButton}`}
                      onClick={() => onAssignMonitor(user.id)}
                    >
                      <UserCheck size={18} /> Designar Monitor
                    </button>
                    <button
                      className={`${styles.actionButton} ${styles.userButton}`}
                      onClick={() => onAssignUser(user.id)}
                    >
                      <UserPlus size={18} /> Designar Usuario
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p className={styles.noResults}>No se encontraron usuarios que coincidan.</p>
            )}
          </div>
        )}

        {/* Opcional: Un botón para limpiar la búsqueda y ocultar las tarjetas */}
        {hasSearched && (
          <button className={styles.clearSearchButton} onClick={handleClearSearch}>
            Limpiar Búsqueda
          </button>
        )}
      </div>
    </div>
  );
};

export default AssignUserModal;