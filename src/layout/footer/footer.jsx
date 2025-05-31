// Footer.jsx
import React, { useEffect } from 'react';
import styles from './footer.module.css';
import { Mail, Phone } from 'lucide-react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faTwitter, faInstagram, faLinkedinIn } from '@fortawesome/free-brands-svg-icons';
import WebFont from 'webfontloader';

const Footer = () => {
  useEffect(() => {
    WebFont.load({
      google: {
        families: ['Poppins:400,600,700', 'sans-serif']
      }
    });
  }, []);

  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.section}>
          <h3 className={styles.logo}>Ugüee</h3>
          <p className={styles.description}>
            Plataforma de transporte para universitarios, conectando pasajeros y conductores en un entorno seguro y eficiente.
          </p>
        </div>

        <div className={styles.section}>
          <h4 className={styles.heading}>Enlaces rápidos</h4>
          <ul className={styles.links}>
            <li><a href="#inicio">Inicio</a></li>
            <li><a href="#sobre-nosotros">Sobre Nosotros</a></li>
            <li><a href="#servicios">Servicios</a></li>
            <li><a href="#beneficios">Beneficios</a></li>
            <li><a href="#contacto">Contacto</a></li>
            <li><a href="#iniciar-sesion">Iniciar Sesión</a></li>
          </ul>
        </div>

        <div className={styles.section}>
          <h4 className={styles.heading}>Contacto</h4>
          <p className={styles.contactInfo}>
            Calle 123 #45-67, Ciudad Universitaria, Colombia
          </p>
          <p className={styles.contactInfo}>
            <Phone size={18} className={styles.icon} /> +57 300 123 4567
          </p>
          <p className={styles.contactInfo}>
            <Mail size={18} className={styles.icon} /> contacto@uguee.com
          </p>
          <div className={styles.socialIcons}>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
              <FontAwesomeIcon icon={faFacebookF} className={styles.socialIcon} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
              <FontAwesomeIcon icon={faTwitter} className={styles.socialIcon} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <FontAwesomeIcon icon={faInstagram} className={styles.socialIcon} />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <FontAwesomeIcon icon={faLinkedinIn} className={styles.socialIcon} />
            </a>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p className={styles.copyright}>© 2025 Ugüee. Todos los derechos reservados.</p>
        <div className={styles.legalLinks}>
          <a href="#ayuda">Ayuda</a>
          <a href="#terminos-condiciones">Términos y Condiciones</a>
          <a href="#politica-privacidad">Política de Privacidad</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
