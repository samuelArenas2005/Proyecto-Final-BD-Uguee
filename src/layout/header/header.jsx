import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./header.css";

const navLinks = [
  { label: "Sobre Nosotros", href: "/#about" },
  { label: "Servicios", href: "/#services" },
  { label: "Contacto", href: "/#contact" },
];

const navLinks2 = [
  { label: "Iniciar Sesión", href: "/login" },
];


const header = () => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    document.documentElement.style.scrollBehavior = "smooth";
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavLinkClick = (e, href) => {
    // Solo manejar anclas si estamos en la página principal
    if (location.pathname === "/" && href.startsWith("/#")) {
      e.preventDefault();
      const targetId = href.split("#")[1];
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
      }
    }
    // Los enlaces normales (/login) se manejarán automáticamente
  };

  return (
    <header className={`header ${scrolled ? "scrolled" : ""}`}>
      <div className="container-wrapper">
        <Link key= '/#hero' to="/#hero" className="logo" onClick={(e) => handleNavLinkClick(e, "/#hero")}>
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
          {navLinks2.map((link) => (
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
        
      </div>
    </header>
  );
};

export default header;
