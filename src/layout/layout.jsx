import React, { useEffect, useState } from "react";
import Navbar from "./header/header";
import Footer from "./footer/footer";
import "./layout.css";
import { supabase } from '../supabaseClient.js';
import { User, Car } from "lucide-react";

const Layout = ({ children }) => {
  const [userActual, setUserActual] = useState()

  useEffect(() => {
    async function getUser() {

      const { data: { user } } = await supabase.auth.getUser();

      const { data: dataConductor } = await supabase
        .from('conductor')
        .select('idusuario')
        .eq('idusuario', user.id);
    
      if (dataConductor.length == 0) {setUserActual('conductor') 
        return }

      const { data: dataPasajero } = await supabase
            .from('pasajero')
            .select('idusuario')
            .eq('idusuario', user.id);
      
      if (!dataPasajero.length == 0) { setUserActual('pasajero')
        return
      }
      
      
      setUserActual('institucion')
       
    }
    getUser();
  }, [])

  let headerProps = {};

  if (location.pathname.startsWith('/')) {
    headerProps = {
      conductorConfig: { text: "ir al Panel de Pasajero", action: () => navigate('/pasajero') },
      IconoComponent: User,
      userType: userActual
    };
  } else {
    headerProps = {
      conductorConfig: { text: "ir al Panel de Pasajero", action: () => navigate('/pasajero') },
      IconoComponent: User,
      userType: 'administrador'
    };
  }


  return (
    <>
      <Navbar {...headerProps} />
      <main className="layout-content">{children}</main>
      <Footer />
    </>
  );
};

export default Layout;
