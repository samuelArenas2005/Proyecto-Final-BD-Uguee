// src/components/GoogleAd.jsx
import React, { useEffect, useRef, useState } from 'react';

const GoogleAd = ({
  adSlot = "7422989551",                 
  adClient = "ca-pub-9602403530954410",  
  adFormat = "auto",
  fullWidthResponsive = true,
  style = {},
}) => {
  const adRef = useRef(null);
  const hasPushedRef = useRef(false);
  const [isLocalhost, setIsLocalhost] = useState(false);

  useEffect(() => {
    // Detectar si estamos en modo desarrollo (localhost)
    if (window.location.hostname === "localhost") {
      setIsLocalhost(true);
      return; // No inyectamos el script en local
    }

    // Si no es localhost, procedemos a cargar/inicializar AdSense
    if (!window.adsbygoogle) {
      // 1. Inyectar el script la primera vez
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);

      script.onload = () => {
        // Solo hacemos push si aún no se ha hecho
        if (!hasPushedRef.current) {
          try {
            (window.adsbygoogle = window.adsbygoogle || []).push({});
            hasPushedRef.current = true;
          } catch (e) {
            console.error("Error inicializando adsbygoogle después de load:", e);
          }
        }
      };
    } else {
      // 2. Si ya existía window.adsbygoogle, solo hacemos push una vez
      if (!hasPushedRef.current) {
        try {
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          hasPushedRef.current = true;
        } catch (e) {
          console.error("Error inicializando adsbygoogle en useEffect:", e);
        }
      }
    }
  }, [adClient]);

  // Si estamos en localhost, mostramos un placeholder para no disparar el request real
  if (isLocalhost) {
    return (
      <div>
        [Espacio de anuncio]
      </div>
    );
  }

  // En producción (dominio real), renderizamos el <ins> para AdSense
  return (
    <ins
      className="adsbygoogle"
      style={style}
      data-ad-client={adClient}
      data-ad-slot={adSlot}
      data-ad-format={adFormat}
      data-full-width-responsive={fullWidthResponsive ? "true" : "false"}
      ref={adRef}
    ></ins>
  );
};

export default GoogleAd;


