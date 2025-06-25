import React from "react";
import Footer from "./footer/footer";
import Navbar from "./headerPasajero/headerPasajero";
import { useLocation, useNavigate } from 'react-router-dom';
import "./layout.css";
import { User, Car } from "lucide-react";

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  

  let headerProps = {}; 

  if (location.pathname.startsWith('/conductor')) {
    headerProps = {
      conductorConfig: { text: "ir al Panel de Pasajero", action: () => navigate('/pasajero') },
      IconoComponent : User,
      userType: 'conductor'
    };
  } else if (location.pathname.startsWith('/pasajero')) {
    headerProps = {
      conductorConfig: { text: "Registrarse como conductor", action: () => navigate('/conductor') },
      IconoComponent : Car,
      userType: 'pasajero'
    };
  }else if (location.pathname.startsWith('/configuracion') || location.pathname.startsWith('/minijuego') ) {
    headerProps = {
      conductorConfig: { text: "Ir al panel principal", action: () => navigate('/pasajero') },
      IconoComponent : User,
      userType: 'configuracion'
    };
  }

  return (
    <div>
      <Navbar {...headerProps} />
      <main>
        {children} 
      </main>
       <Footer />
    </div>
  );
};

export default Layout;
