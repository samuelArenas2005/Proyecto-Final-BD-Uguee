import React, { useEffect } from "react"; // Importa useEffect
import { Link, useLocation } from "react-router-dom";
import Button from "../../pages/AuthUser/Button"; // Asegúrate de que la ruta sea correcta
import { Bell, User } from "lucide-react";
import styles from "./estiloheader.module.css"; // Importa los estilos como un módulo
import WebFont from 'webfontloader'; // Importa webfontloader

const Header = () => {
  const location = useLocation();

  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Poppins:400,600,700', 'sans-serif'] // Carga la fuente Poppins
      }
    });
  }, []);

  const getLinkClass = (path) => {
    return location.pathname === path ? `${styles.navLink2} ${styles.active}` : styles.navLink2;
  };

  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.logoAndNav}>
          <Link to="/" className={styles.logo2}>
            Ugüee
          </Link>
          <nav className={styles.navigation}>
            <Link to="/universidad" className={getLinkClass("/universidad")}>
              Solicitudes de ingreso
            </Link>
            <Link
              to="/universidad/reportes"
              className={getLinkClass("/universidad/reportes")}
            >
              Reportes de viajes
            </Link>
            <Link
              to="/universidad/monitoreo"
              className={getLinkClass("/universidad/monitoreo")}
            >
              Monitoreo de usuarios
            </Link>
          </nav>
        </div>

        <div className={styles.userActions}>
          {/* Asegúrate de que el componente Button acepte className como prop y lo aplique correctamente */}
          <Button size="icon" variant="ghost" className={styles.notificationButton}>
            <Bell className={styles.icon} />
          </Button>
          <button className={`${styles.navButton} ${styles.profileButton}`}>
            <User size={24} className={styles.iconProfile} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
