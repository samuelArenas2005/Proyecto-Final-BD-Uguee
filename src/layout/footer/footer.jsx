// Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./footer.css";

const Footer = () => (
  <footer className="footer">
    <div className="footer-container">
      <div className="footer-sections">
        {/* Company Info */}
        <div className="footer-section">
          <Link to="/" className="footer-logo">
            Ugüee
          </Link>
          <p className="footer-description">
            Plataforma de transporte para universitarios, conectando pasajeros y
            conductores en un entorno seguro y eficiente.
          </p>
          <div className="social-icons">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Facebook"
            >
              {/* SVG icon */}
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Twitter"
            >
              {/* SVG icon */}
            </a>
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              {/* SVG icon */}
            </a>
          </div>
        </div>

        {/* Quick Links */}
        <div className="footer-section">
          <h3>Enlaces rápidos</h3>
          <ul className="footer-links-list">
            {[
              { to: "/", label: "Inicio" },
              { to: "/#sobre-nosotros", label: "Sobre Nosotros" },
              { to: "/#servicios", label: "Servicios" },
              { to: "/#beneficios", label: "Beneficios" },
              { to: "/#contacto", label: "Contacto" },
              { to: "/login", label: "Iniciar Sesión" },
            ].map((link) => (
              <li key={link.to}>
                <Link to={link.to}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Info */}
        <div className="footer-section">
          <h3>Contacto</h3>
          <address>
            <p>Calle 123 #45-67, Ciudad Universitaria, Colombia</p>
            <p>+57 300 123 4567</p>
            <p>contacto@uguee.com</p>
          </address>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="footer-bottom">
        <p>
          &copy; {new Date().getFullYear()} Ugüeé. Todos los derechos
          reservados.
        </p>
        <div className="footer-policy-links">
          {[
            { to: "/ayuda", label: "Ayuda" },
            { to: "/terminos", label: "Términos y Condiciones" },
            { to: "/privacidad", label: "Política de Privacidad" },
          ].map((link) => (
            <Link key={link.to} to={link.to}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </div>
  </footer>
);

export default Footer;
