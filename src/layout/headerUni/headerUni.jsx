import React, { useEffect, useRef, useState } from "react"; // Importa useEffect
import { Link, useLocation, useNavigate } from "react-router-dom";
import Button from "../../pages/AuthUser/Button"; // Asegúrate de que la ruta sea correcta
import { Bell, University, User, Home, LogOut } from "lucide-react";
import styles from "./estiloheader.module.css"; // Importa los estilos como un módulo
import WebFont from 'webfontloader'; // Importa webfontloader
import { supabase } from '../../supabaseClient.js';

const Header = () => {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const [urlAvatar, setUrlAvatar] = useState(null);
  const menuRef = useRef(null)

  useEffect(() => {
    async function checkSessionActive() {

      const { data: { user } } = await supabase.auth.getUser();
      const { data: urlData } = await supabase
        .from('institucion')
        .select('urllmglogo , nombre')
        .eq('idinstitucion', user.id);

      if (urlData.length !== 0) {
        if (urlData[0].urllmglogo != 'NULL') {
          console.log(urlData[0].urllmglogo);
          setUrlAvatar(urlData);
        }
        return
      }
    }
    checkSessionActive();
  }, [])

    useEffect(() => {
      const handleClickOutside = (event) => {
        if (menuRef.current && !menuRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
  
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);


  const getLinkClass = (path) => {
    return location.pathname === path ? `${styles.navLink2} ${styles.active}` : styles.navLink2;
  };

  const toggleMenu = () => {
    console.log('me abri/cerre')
    setIsOpen(!isOpen);
  };

  const handleActionGoStart = () => {
    navigate('/');
    setIsOpen(false);
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("no se pudo cerrar la sesion", error)
    } else {
      navigate('/');
      setIsOpen(false);
    }
  }


  return (
    <header className={styles.headerContainer}>
      <div className={styles.headerContent}>
        <div className={styles.logoAndNav} >
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
          {/* <Button size="icon" variant="ghost" className={styles.notificationButton}>
            <Bell className={styles.icon} />
          </Button> */}
          <button className={`${styles.navButton} ${styles.profileButton}`} onClick={toggleMenu}>
            {urlAvatar !== null ? (
              <img src={urlAvatar[0].urllmglogo} alt={urlAvatar[0].nombre} className={styles.avatar} />
            ) : (
              <User size={24} className={styles.iconProfile} />
            )}
          </button>
        </div>
      </div>

      {isOpen ? (
        <nav className={styles.dropdownPanel} ref={menuRef}>
          <ul className={styles.menuList}>
            <li>
              <button className={styles.menuItem} onClick={handleActionGoStart}>
                <Home className={styles.menuIcon} size={20} />
                <span>Ir al inicio</span>
              </button>
            </li>
            <li>
              <button className={styles.menuItem} onClick={() => navigate("/universidad")}>
                <University className={styles.menuIcon} size={20} />
                <span>Ir al panel principal</span>
              </button>
            </li>
            {/* <li>
              <button className={styles.menuItem} onClick={handleActionConfig}>
                <Settings className={styles.menuIcon} size={20} />
                <span>Configuración</span>
              </button>
            </li> */}
            <li className={styles.separator}></li>
            <li>
              <button className={styles.menuItem} onClick={signOut}>
                <LogOut className={styles.menuIcon} size={20} />
                <span>Cerrar sesión</span>
              </button>
            </li>
          </ul>
        </nav>
      ) : null}


    </header>
  );
};

export default Header;
