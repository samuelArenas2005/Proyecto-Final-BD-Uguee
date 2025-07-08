import React, { useEffect, useState } from "react";
import Navbar from "./header/header";
import Footer from "./footer/footer";
import "./layout.css";
import { useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient.js';
import { User, Car, University, ShieldUser, UserRoundCog } from "lucide-react";

const Layout = ({ children }) => {
  const [userActual, setUserActual] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    async function getUser() {

      const { data: { user } } = await supabase.auth.getUser();

      const { data: dataMonitor } = await supabase
        .from('monitor')
        .select('idmonitor')
        .eq('idmonitor', user.id)

      if (dataMonitor.length !== 0) {
        setUserActual('monitor')
        return
      }

      const { data: dataConductor } = await supabase
        .from('conductor')
        .select('idusuario,numerodelicencia')
        .eq('idusuario', user.id);

      if (dataConductor.length !== 0) {

        setUserActual('conductor')
        return
      }

      const { data: dataPasajero } = await supabase
        .from('pasajero')
        .select('idusuario')
        .eq('idusuario', user.id);

      if (dataPasajero.length !== 0) {
        setUserActual('pasajero')
        return
      }


      const { data: dataAdmin } = await supabase
        .from('administrador')
        .select('idadministrador')
        .eq('idadministrador', user.id)

      if (dataAdmin.length !== 0) {
        setUserActual('administrador')
        return
      }
      

      setUserActual('universidad')

    }
    getUser();
  }, [])

  let headerProps = {};

  const icono = {
    conductor: Car,
    pasajero: User,
    universidad: University,
    monitor: UserRoundCog,
    administrador: ShieldUser
  };

  if (userActual !== null) {
    if (location.pathname.startsWith('/') || location.pathname.startsWith('/login') ||
      location.pathname.startsWith('/administrador') || location.pathname.startsWith('/monitor')
    ) {
      headerProps = {
        Config: { text: "ir al Panel de " + userActual, action: () => navigate('/' + userActual) },
        IconoComponent: icono[userActual],
        userType: userActual
      };
    }
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
