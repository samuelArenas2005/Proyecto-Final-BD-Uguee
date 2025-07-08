import { React, useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Car, ListChecks, User, Home, Settings, LogOut, Gamepad2 } from 'lucide-react';
import styles from './HeaderPasajero.module.css';

import { supabase } from '../../supabaseClient.js';
import { useNavigate } from 'react-router-dom';




const Header = ({
  conductorConfig, 
  IconoComponent,   
  userType
}) => {
  const [urlAvatar, setUrlAvatar] = useState(null)
  const [userActual, setUserActual] = useState(null)
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);


  useEffect(() => {
    async function checkSessionActive() {

      const { data: { user } } = await supabase.auth.getUser();
      const { data: urlData } = await supabase
        .from('usuario')
        .select('urlAvatar , nombrecompleto')
        .eq('nidentificacion', user.id);
      setUserActual(user);
      if (urlData.length !== 0) {
        if (urlData[0].urlAvatar != 'NULL') {
          const avatarUrl = supabase.storage
              .from("publico")
              .getPublicUrl(urlData[0].urlAvatar);
          console.log("hola soy avatar", avatarUrl);
          setUrlAvatar(avatarUrl);
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

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleActionGoStart = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleActionGoPanel = () => {
    conductorConfig.action()
    setIsOpen(false);
  };

  const handleActionConfig = () => {
    navigate(`/configuracion`)
    setIsOpen(false);
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.log("no se pudo cerrar la sesion", error)
    } else {
      navigate('/');
      setIsOpen(false);
    }
  }

  const handleActionMiniGame = () => {
    navigate(`/minijuego`)
    setIsOpen(false);
  }


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
          className={`${styles.navButton} ${styles.profileButton}`}
          onClick={toggleMenu}
        >
          {urlAvatar !== null ? (
            <img src={urlAvatar.data.publicUrl} alt={"none"} className={styles.avatar} />
          ) : (
            <User size={24} className={styles.iconProfile} />
          )}

        </button>
      </nav>

      {isOpen ? (
        <nav ref={menuRef} className={styles.dropdownPanel}>
          <ul className={styles.menuList}>
            <li>
              <button className={styles.menuItem} onClick={handleActionGoStart}>
                <Home className={styles.menuIcon} size={20} />
                <span>Ir al inicio</span>
              </button>
            </li>
            <li>
              <button className={styles.menuItem} onClick={handleActionGoPanel}>
                <IconoComponent className={styles.menuIcon} size={20} />
                <span>{conductorConfig.text}</span>
              </button>

            </li>
            <li>
              <button className={styles.menuItem} onClick={handleActionConfig}>
                <Settings className={styles.menuIcon} size={20} />
                <span>Configuración</span>
              </button>

            </li>
            <li>
              <button className={styles.menuItem} onClick={handleActionMiniGame}>
                <Gamepad2 className={styles.menuIcon} size={20} />
                <span>Ir a minijuego</span>
              </button>
            </li>
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