import React, { useEffect, useState } from "react";
import Footer from "./footer/footer";
import Navbar from "./headerPasajero/headerPasajero";
import { useLocation, useNavigate } from 'react-router-dom';
import "./layout.css";
import { User, Car } from "lucide-react";
import { supabase } from '../supabaseClient.js';

const Layout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [userActual, setUserActual] = useState()

  useEffect(() => {
    async function getUser() {
      const { data: { user } } = await supabase.auth.getUser();
      const { data: dataConductor } = await supabase
        .from('conductor')
        .select('idusuario')
        .eq('idusuario', user.id);
        console.log(dataConductor)
      if (dataConductor.length == 0) {
        const { data: dataPasajero } = await supabase
        .from('pasajero')
        .select('idusuario')
        .eq('idusuario', user.id);
        if(dataPasajero){
          setUserActual('pasajero')
        }
      } else {
        setUserActual('conductor')
        return
      }
    }
    getUser();
  }, [])


  let headerProps = {};

  if (location.pathname.startsWith('/conductor')) {
    headerProps = {
      conductorConfig: { text: "ir al Panel de Pasajero", action: () => navigate('/pasajero') },
      IconoComponent: User,
      userType: 'conductor'
    };
  } else if (location.pathname.startsWith('/pasajero')) {
    headerProps = {
      conductorConfig: { text: "Registrarse como conductor", action: () => navigate('/conductor') },
      IconoComponent: Car,
      userType: 'pasajero'
    };
  } else if (location.pathname.startsWith('/configuracion') || location.pathname.startsWith('/minijuego')) {
    headerProps = {
      conductorConfig: { text: "Ir al panel principal", action: () => navigate( userActual === 'pasajero' ? '/pasajero' : '/conductor' ) },
      IconoComponent: userActual === 'pasajero' ? User : Car,
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
