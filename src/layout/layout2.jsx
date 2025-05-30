import React from "react";
import Footer from "./footer/footer";
import Navbar from "./headerPasajero/headerPasajero";
import { useLocation, useNavigate } from 'react-router-dom';
import "./layout.css";
import { User, Car } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  

  let headerProps = {}; // Objeto para las props del header

  if (location.pathname.startsWith('/conductor')) {
    headerProps = {
      conductorConfig: { text: "ir al Panel de Pasajero", action: () => navigate('/pasajero') },
      activityConfig: { text: "Mis viajes", to: "/conductor/dashboard" },
      profileAction: () => navigate('/conductor/perfil'),
      iconoComponent : User,
      userType: 'conductor'
    };
  } else if (location.pathname.startsWith('/admin')) {
    headerProps = {
      conductorConfig: { text: "Gestionar Conductores", action: () => navigate('/admin/conductores') },
      activityConfig: { text: "Reportes", to: "/admin/reportes" },
      profileAction: () => navigate('/admin/configuracion'),
      userType: 'admin'
    };
  } else {
    headerProps = {
      activityConfig: { text: "Actividad", to: "/pasajero/actividad" },
      profileAction: () => navigate('/perfil'),
      iconoComponent : Car,
      userType: 'pasajero'
    };
  }

  return (
    <div>
      <Navbar {...headerProps} />
      <main>
        {children} {/* El contenido de la página actual */}
      </main>
       <Footer />
    </div>
  );
};

export default Layout;
