import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./header.css";
import { supabase } from '../../supabaseClient.js';
import { User, Home, Settings, LogOut, Gamepad2 } from 'lucide-react';
import styles from '../headerPasajero/HeaderPasajero.module.css';


const navLinks = [
  { label: "Sobre Nosotros", href: "/#about" },
  { label: "Servicios", href: "/#services" },
  { label: "Contacto", href: "/#contact" },
];




const header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const [userActual, setUserActual] = useState(null)
  const [urlAvatar, setUrlAvatar] = useState(null)
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    const checkForActiveRoute = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: urlData } = await supabase
        .from('usuario')
        .select('urlAvatar , nombrecompleto')
        .eq('nidentificacion', user.id)
      setUrlAvatar(urlData)
      setUserActual(user)
      console.log(user)
    }
    checkForActiveRoute();
  }, [])

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
        window.location.reload();
        navigate('/');
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
          {userActual ? (
            <button
              className={`${styles.navButton} ${styles.profileButton}`}
              onClick={toggleMenu}
            >
              {urlAvatar ? (
                <img src={urlAvatar[0].urlAvatar} alt={urlAvatar[0].nombrecompleto} className={styles.avatar} />
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
                <User className={styles.menuIcon} size={20} />
                <span>ir a panel pasajero</span>
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
    </header >
  );
};

export default header;
