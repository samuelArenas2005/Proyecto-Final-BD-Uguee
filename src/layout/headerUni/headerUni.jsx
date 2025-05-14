import React from "react";
import { Link, useLocation } from "react-router-dom";
import Button from "../../pages/AuthUser/Button";
import { Bell, User } from "lucide-react";
import "./estiloheader.css";

const Header = () => {
  const location = useLocation();

  const getLinkClass = (path) => {
    return location.pathname === path ? "nav-link2 active" : "nav-link2";
  };

  return (
    <header className="header-container">
      <div className="header-content">
        <div className="logo-and-nav">
          <Link to="/" className="logo2">
            Ugüee
          </Link>
          <nav className="navigation">
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

        <div className="user-actions">
          <Button size="icon" variant="ghost" className="notification-button">
            <Bell className="icon" />
          </Button>
          {/* Este botón simula el "samuel@gmail.com" de la imagen */}
          <Button variant="primary" className="user-profile-button">
            <User className="icon user-icon" />
            samuel@gmail.com
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
