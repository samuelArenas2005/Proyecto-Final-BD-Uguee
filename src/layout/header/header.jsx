import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./header.css";
import { supabase } from '../../supabaseClient.js';
import { User, Home, Settings, LogOut, Gamepad2, Loader } from 'lucide-react';
import styles from '../headerPasajero/HeaderPasajero.module.css';


const navLinks = [
  { label: "Sobre Nosotros", href: "/#about" },
  { label: "Servicios", href: "/#services" },
  { label: "Contacto", href: "/#contact" },
];


const header = ({
  Config,
  IconoComponent,
  userType
}) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [userActual, setUserActual] = useState(null);
  const [urlAvatar, setUrlAvatar] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    async function checkSessionActive() {
      const { data: { user }, error: erroUser } = await supabase.auth.getUser();
      if (!user || erroUser) {
        return
      }

      setUserActual(user);

      const { data: urlData } = await supabase
        .from('usuario')
        .select('urlAvatar , nombrecompleto')
        .eq('nidentificacion', user.id);


      if (urlData.length !== 0) {
        if (urlData[0].urlAvatar !== 'NULL') {
          console.log("no soy usuario");
          setUrlAvatar(urlData);
        }
        return
      }

      const { data: urlDataUni } = await supabase
        .from('institucion')
        .select('urllmglogo , nombre')
        .eq('idinstitucion', user.id);

        console.log(urlDataUni)

      if (urlDataUni.length !== 0) {
        if (urlDataUni[0].urllmglogo !== 'NULL') {
          const urlDataModificate = [{
            urlAvatar: urlDataUni[0].urllmglogo,
            nombrecompleto: urlDataUni[0].nombre
          }]
          setUrlAvatar(urlDataModificate);
        }
        return
      }

      return

    }
    checkSessionActive();
    console.log(urlAvatar)
  }, [])

  const handleActionGoStart = () => {
    navigate('/');
    setIsOpen(false);
  };

  const handleActionGoPanel = () => {
    Config.action()
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
      window.location.reload();
      setIsOpen(false);
    }
  }

  const handleActionMiniGame = () => {
    navigate(`/minijuego`)
    setIsOpen(false);
  }

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.documentElement.style.scrollBehavior = "smooth";
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (e, href) => {
    if (location.pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.split("#")[1];
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
  };
  

  const FinalIcon = IconoComponent ?? Loader;
  const FinalUserType = userType ?? '';
  const configFinal = Config ?? {
    text: 'Cargando...',
    action: () => { alert('cargando..') }
  }

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container-wrapper">
        <Link key='/#hero' to="/#hero" className="logo" onClick={(e) => handleNavLinkClick(e, "/#hero")}>
          Ugüee
        </Link>

        <nav className="nav-links">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="nav-link"
              onClick={(e) => handleNavLinkClick(e, link.href)}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <nav className="nav-links2">
          {userActual != null ? (
            <button
              className={`${styles.navButton} ${styles.profileButton}`}
              onClick={toggleMenu}
            >
              {urlAvatar ? (
                <img src={urlAvatar[0].urlAvatar}
                  alt={urlAvatar[0].nombrecompleto} className={styles.avatar} />
              ) : (
                <User size={24} className={styles.iconProfile} />
              )}

            </button>
          ) : (
            <Link
              key={'/login'}
              to={'/login'}
              className="nav-link"
            >
              Iniciar Sesión
            </Link>
          )}
        </nav>
      </div>


      {isOpen ? (
        <nav className={styles.dropdownPanel}>
          <ul className={styles.menuList}>
            <li>
              <button className={styles.menuItem} onClick={handleActionGoStart}>
                <Home className={styles.menuIcon} size={20} />
                <span>Ir al inicio</span>
              </button>
            </li>
            <li>
              <button className={styles.menuItem} onClick={handleActionGoPanel}>
                <FinalIcon className={styles.menuIcon} size={20} />
                <span>{configFinal.text}</span>
              </button>
            </li>
            {(FinalUserType == 'pasajero' || FinalUserType === 'conductor') && (
              <li>
                <button className={styles.menuItem} onClick={handleActionConfig}>
                  <Settings className={styles.menuIcon} size={20} />
                  <span>Configuración</span>
                </button>
              </li>
            )}
            {(FinalUserType === 'administrador' || FinalUserType === 'pasajero' || FinalUserType === 'conductor') && (
              <li>
                <button className={styles.menuItem} onClick={handleActionMiniGame}>
                  <Gamepad2 className={styles.menuIcon} size={20} />
                  <span>Ir a minijuego</span>
                </button>
              </li>
            )}
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
    </header >
  );
};

export default header;
