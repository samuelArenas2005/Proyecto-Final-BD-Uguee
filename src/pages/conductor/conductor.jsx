import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Clock, SlidersHorizontal, Users } from "lucide-react";
import {
  GoogleMap,
  LoadScript,
  Autocomplete,
  DirectionsRenderer,
} from "@react-google-maps/api";
import { supabase } from "../../supabaseClient.js";

import styles from "./conductor.module.css";
import RutaAnteriorCard from "./componentes/RutaAnteriorCard";
import SuccessModal from "./componentes/succes";
import NotActive from "../pasajero/components/NotActive";
import wave from "/wave.svg";

const apigoogle = import.meta.env.VITE_APIS_GOOGLE;
const libraries = ["places"];
const mapCustomStyles = [
  {
    featureType: "poi",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "transit",
    elementType: "labels",
    stylers: [{ visibility: "off" }],
  },
];
const DEFAULT_CENTER = { lat: 3.3745, lng: -76.5308 };

// --- COMPONENTE DE CARGA ---
const LoadingScreen = () => (
  <div className={styles.loaderContainer}>
    <div className={styles.spinner}></div>
    <p className={styles.text}>Buscando Rutas Activas...</p>
  </div>
);

const ConductorPage = () => {
  const navigate = useNavigate();
  // --- NUEVO ESTADO PARA VERIFICACIÓN INICIAL ---
  const [isCheckingForActiveRoute, setIsCheckingForActiveRoute] =
    useState(true);

  // Estados para verificaciones de universidad y conductor
  const [isUniversityActive, setIsUniversityActive] = useState(null); // null = loading, true = active, false = not active
  const [isUserActive, setIsUserActive] = useState(null); // null = loading, true = active, false = not active
  const [universityId, setUniversityId] = useState(null);
  const [universityStatus, setUniversityStatus] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userStatus, setUserStatus] = useState(null);

  const [startPoint, setStartPoint] = useState("");
  const [destination, setDestination] = useState("");
  const [startCoords, setStartCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);
  const [asientos, setAsientos] = useState(1);

  const [dateTime, setDateTime] = useState("");
  const [minDateTime, setMinDateTime] = useState("");
  const [maxDateTime, setMaxDateTime] = useState("");

  useEffect(() => {
    const getFormattedDateTimeColombia = (date) => {
      const options = {
        timeZone: "America/Bogota",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };
      const formatted = new Date(date).toLocaleString("sv-SE", options);

      return formatted.replace(" ", "T");
    };

    const now = new Date();
    const minVal = getFormattedDateTimeColombia(now);
    setMinDateTime(minVal);
    setDateTime(minVal);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 2);
    const maxVal = getFormattedDateTimeColombia(tomorrow);
    setMaxDateTime(maxVal);
  }, []);

  const handleBlur = (e) => {
    const value = e.target.value;
    if (value < minDateTime) {
      console.log("Valor muy bajo. Corrigiendo al mínimo.");
      setDateTime(minDateTime);
    }
  };

  const [mapCenter, setMapCenter] = useState(DEFAULT_CENTER);
  const [mapZoom, setMapZoom] = useState(14);
  const [directionsResponse, setDirectionsResponse] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [maxAsientosVehiculo, setMaxAsientosVehiculo] = useState(null);
  const [isVehicleInfoLoading, setIsVehicleInfoLoading] = useState(true);

  const autoStartRef = useRef(null);
  const autoDestRef = useRef(null);

  async function getAddressFromCoords(lat, lng) {
    const apiKey = import.meta.env.VITE_APIS_GOOGLE;
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;

    try {
      const response = await fetch(endpoint);
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn("No se encontró una dirección para estas coordenadas.");
        return null;
      }
    } catch (error) {
      console.error("Error al obtener dirección:", error);
      return null;
    }
  }

  // intento danicol

  const [previousRoutes, setPreviousRoutes] = useState([]);

  const fetchPreviousRoutes = async (userId) => {
    const { data: historicalTripsAll, error } = await supabase
      .from("rutaconductorviaje")
      .select(
        `idruta,ruta(estado),idconductor
        `
      )
      .eq("idconductor", userId);

    console.log("Hola soy el user:", userId);
    console.log("hola daniel ,", historicalTripsAll);
    const historicalTrips = historicalTripsAll.filter(
      (trip) => trip.ruta.estado == "inactivo"
    );

    console.log("hola soy cosas, ", historicalTrips);

    if (error || !historicalTrips) {
      console.log("El no tiene viajes anteriores.");
      return;
    }

    const rutas = historicalTrips.map(async (ruta) => {
      const { data: historicalTripsruta, error2 } = await supabase
        .from("rutaconductorviaje")
        .select(
          `ruta(salidalatitud,salidalongitud,paradalatitud,paradalongitud,horadesalida)
        `
        )
        .eq("idruta", ruta.idruta);
      if (error2 || !historicalTripsruta) {
        return [];
      }
      return historicalTripsruta;
    });

    const rutasArray = await Promise.all(rutas);
    const rutasArrayPlana = rutasArray.flat();

    console.log("hola soy plana", rutasArrayPlana);
    console.log(
      "HOla viejo, si soy yo el console log despues de arrays planos"
    );
    if (error || !historicalTrips) {
      console.error("Error fetching previous routes:", error);
      return;
    } else {
      setPreviousRoutes(
        rutasArrayPlana.map((ruta, index) => ({
          title: `Ruta ${index + 1}`,
          originlat: ruta.ruta.salidalatitud,
          originlong: ruta.ruta.salidalongitud,
          destinationlat: ruta.ruta.paradalatitud,
          destinationlong: ruta.ruta.paradalongitud,
          departureTime: ruta.ruta.horadesalida,
        }))
      );
      console.log("Numero de rutas previas", previousRoutes.length);
    }
  };

  // Verificar estado de universidad y conductor
  useEffect(() => {
    const checkUniversityAndUserStatus = async () => {
      try {
        // Get current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          console.error("Error getting user:", authError);
          setIsUniversityActive(false);
          setIsUserActive(false);
          return;
        }

        if (!user) {
          console.error("No user found");
          setIsUniversityActive(false);
          setIsUserActive(false);
          return;
        }

        setUserId(user.id);

        // Get user data and check university
        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .select("idinstitucion")
          .eq("nidentificacion", user.id)
          .single();

        if (userError) {
          console.error("Error fetching user data:", userError);
          setIsUniversityActive(false);
          setIsUserActive(false);
          return;
        }

        if (!userData?.idinstitucion) {
          console.error("User has no institution assigned");
          setIsUniversityActive(false);
          setIsUserActive(false);
          return;
        }

        setUniversityId(userData.idinstitucion);

        // Check university status
        const { data: universityData, error: universityError } = await supabase
          .from("institucion")
          .select("estado")
          .eq("idinstitucion", userData.idinstitucion)
          .single();

        if (universityError) {
          console.error("Error fetching university data:", universityError);
          setIsUniversityActive(false);
          setIsUserActive(false);
          return;
        }

        setUniversityStatus(universityData.estado);
        setIsUniversityActive(universityData.estado === "activo");

        // If university is not active, don't check user status
        if (universityData.estado !== "activo") {
          setIsUserActive(false);
          return;
        }

        // Check conductor status
        const { data: conductorData, error: conductorError } = await supabase
          .from("conductor")
          .select("estadoconductor")
          .eq("idusuario", user.id)
          .single();

        if (conductorError) {
          console.error("Error fetching conductor data:", conductorError);
          setIsUserActive(false);
          return;
        }

        setUserStatus(conductorData.estadoconductor);
        setIsUserActive(conductorData.estadoconductor === "activo");
      } catch (error) {
        console.error("Error checking university and conductor status:", error);
        setIsUniversityActive(false);
        setIsUserActive(false);
      }
    };

    checkUniversityAndUserStatus();
  }, []);

  // --- NUEVO USEEFFECT PARA VERIFICAR RUTA ACTIVA AL CARGAR ---
  useEffect(() => {
    // Solo verificar rutas activas si ambos están activos
    if (isUniversityActive !== true || isUserActive !== true) {
      setIsCheckingForActiveRoute(false);
      return;
    }

    const checkForActiveRoute = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        console.log(user);

        if (user) {
          const { data: activeRouteData, error } = await supabase
            .from("rutaconductorviaje")
            .select("idruta, ruta!inner(estado)")
            .eq("idconductor", user.id)
            .eq("ruta.estado", "activo")
            .maybeSingle(); // .maybeSingle() devuelve un solo registro o null, sin lanzar error si no encuentra nada.

          if (error) {
            console.error("Error verificando ruta activa:", error);
          }

          fetchPreviousRoutes(user.id);
          console.log("Hola papu");
          console.log(user.id);

          if (activeRouteData && activeRouteData.idruta) {
            navigate(`/conductor/viaje/${activeRouteData.idruta}`);
          } else {
            setIsCheckingForActiveRoute(false);
          }
        } else {
          setIsCheckingForActiveRoute(false);
        }
      } catch (e) {
        console.error("Error en la verificación de ruta:", e);
        setIsCheckingForActiveRoute(false);
      }
    };

    checkForActiveRoute();
  }, [navigate, isUniversityActive, isUserActive]);

  useEffect(() => {
    const fetchVehicleInfo = async () => {
      setIsVehicleInfoLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          throw new Error("Usuario no autenticado.");
        }
        const { data: conductorData, error } = await supabase
          .from("conductor")
          .select("vehiculo ( numeroasientos ),idvehiculo")
          .eq("idusuario", user.id)
          .single();
        if (error) throw error;
        if (conductorData && conductorData.vehiculo) {
          const capacidadPasajeros = conductorData.vehiculo.numeroasientos - 1;
          setMaxAsientosVehiculo(
            capacidadPasajeros > 0 ? capacidadPasajeros : 0
          );
          if (asientos > capacidadPasajeros) {
            setAsientos(capacidadPasajeros);
          }
        }
      } catch (error) {
        console.error("Error fetching vehicle info:", error.message);
        setMaxAsientosVehiculo(0);
      } finally {
        setIsVehicleInfoLoading(false);
      }
    };
    fetchVehicleInfo();
  }, []);

  const handleAsientosChange = (e) => {
    let value = parseInt(e.target.value, 10);
    if (isNaN(value) || value < 1) {
      value = 1;
    }
    if (maxAsientosVehiculo !== null && value > maxAsientosVehiculo) {
      value = maxAsientosVehiculo;
    }
    setAsientos(value);
  };

  const onLoadStart = (autocomplete) => (autoStartRef.current = autocomplete);
  const onPlaceChangedStart = () => {
    if (autoStartRef.current) {
      const place = autoStartRef.current.getPlace();
      if (place.geometry) {
        const location = place.geometry.location;
        const coords = { lat: location.lat(), lng: location.lng() };
        setStartPoint(place.formatted_address);
        setStartCoords(coords);
        setMapCenter(coords);
        setMapZoom(16);
      }
    }
  };

  const onLoadDest = (autocomplete) => (autoDestRef.current = autocomplete);
  const onPlaceChangedDest = () => {
    //... (código sin cambios)
    if (autoDestRef.current) {
      const place = autoDestRef.current.getPlace();
      if (place.geometry) {
        const location = place.geometry.location;
        const coords = { lat: location.lat(), lng: location.lng() };
        setDestination(place.formatted_address);
        setDestCoords(coords);
      }
    }
  };

  useEffect(() => {
    if (startCoords && destCoords) {
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: startCoords,
          destination: destCoords,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === "OK" && result) {
            setDirectionsResponse(result);
            const leg = result.routes[0].legs[0];
            setDistance(leg.distance.value);
            setDuration(leg.duration.value);
          } else {
            console.error(`Error fetching directions ${result}`);
            setDuration(null);
          }
        }
      );
    }
  }, [startCoords, destCoords]);

  //Función creada por DAniel pa probar

  const getInfoRutaAnterior = async (rutaData) => {
    console.log(rutaData);

    const coordsI = { lat: rutaData.originlat, lng: rutaData.originlong };
    setStartCoords(coordsI);
    const direccion = await getAddressFromCoords(
      rutaData.originlat,
      rutaData.originlong
    );
    setStartPoint(direccion);

    const coordsF = {
      lat: rutaData.destinationlat,
      lng: rutaData.destinationlong,
    };
    setDestCoords(coordsF);
    console.log(coordsF);

    const direcciondestino = await getAddressFromCoords(
      rutaData.destinationlat,
      rutaData.destinationlong
    );
    setDestination(direcciondestino);

    setAsientos(3);
  };

  //aqui termina mi prueba pa
  const handleEstablecerRuta = async () => {
    if (!startCoords || !destCoords || !dateTime || asientos <= 0) {
      alert(
        "Por favor, completa todos los campos y asegúrate de que la ruta y su duración se hayan calculado correctamente."
      );
      return;
    }
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuario no autenticado.");
      const { data: conductorData, error: conductorError } = await supabase
        .from("conductor")
        .select("idvehiculo")
        .eq("idusuario", user.id)
        .single();
      if (conductorError || !conductorData)
        throw new Error("No se pudo encontrar el vehículo del conductor.");
      const fechaHora = new Date(dateTime);

      const yyyy = fechaHora.getFullYear();
      const mm = String(fechaHora.getMonth() + 1).padStart(2, "0");
      const dd = String(fechaHora.getDate()).padStart(2, "0");
      const fechaLocal = `${yyyy}-${mm}-${dd}`;

      console.log("hola soy fecha", fechaHora);
      console.log("hola soy dia", fechaLocal);
      console.log("hola soy hora", fechaHora.toTimeString().split(" ")[0]);
      const nuevaRuta = {
        idvehiculo: conductorData.idvehiculo,
        salidalatitud: startCoords.lat,
        salidalongitud: startCoords.lng,
        paradalatitud: destCoords.lat,
        paradalongitud: destCoords.lng,
        distancia: distance / 1000,
        fecha: fechaLocal,
        horadesalida: fechaHora.toTimeString().split(" ")[0],
        asientosdisponibles: parseInt(asientos, 10),
        tipoderuta: "Municipal",
        estado: "activo",
      };
      const { data: rutaInsertada, error: rutaError } = await supabase
        .from("ruta")
        .insert(nuevaRuta)
        .select("idruta")
        .single();
      if (rutaError || !rutaInsertada)
        throw new Error(`Error al crear la ruta: ${rutaError?.message}`);
      const duracionEnHoras = duration / 3600;
      const nuevoViaje = {
        tiempodesalida: fechaHora.toISOString(),
        tiempodellegada: null,
        duracionviajehoras: duracionEnHoras,
        estadodelviaje: "pendiente",
        ubicacionactuallatitud: null,
        ubicacionactuallongitud: null,
      };
      const { data: viajeInsertado, error: viajeError } = await supabase
        .from("viaje")
        .insert(nuevoViaje)
        .select("idviaje")
        .single();
      if (viajeError || !viajeInsertado)
        throw new Error(`Error al crear el viaje: ${viajeError?.message}`);
      const nuevaRelacion = {
        idruta: rutaInsertada.idruta,
        idconductor: user.id,
        idviaje: viajeInsertado.idviaje,
      };
      const { error: relacionError } = await supabase
        .from("rutaconductorviaje")
        .insert(nuevaRelacion);
      if (relacionError)
        throw new Error(
          `Error al asociar la ruta al conductor: ${relacionError?.message}`
        );
      setShowSuccessModal(true);
      setTimeout(() => {
        setShowSuccessModal(false);
        navigate(`/conductor/viaje/${rutaInsertada.idruta}`);
      }, 2000);
    } catch (error) {
      console.error("Error al establecer la ruta y el viaje:", error.message);
      alert(`Ocurrió un error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const rutasAnterioresData = [];

  if (isCheckingForActiveRoute) {
    return <LoadingScreen />;
  }

  return (
    <>
      {/* Show loading state while checking statuses */}
      {(isUniversityActive === null || isUserActive === null) && (
        <div className={styles.loadingContainer}>
          <div className={styles.loadingContent}>
            <p>Verificando estado de la universidad y conductor...</p>
          </div>
        </div>
      )}

      {/* Show NotActive component if university is not active */}
      {isUniversityActive === false && (
        <NotActive
          universityId={universityId}
          universityStatus={universityStatus}
          userType="university"
        />
      )}

      {/* Show NotActive component if conductor is not active but university is active */}
      {isUniversityActive === true && isUserActive === false && (
        <NotActive userId={userId} userStatus={userStatus} userType="user" />
      )}

      {/* Show main content if both university and conductor are active */}
      {isUniversityActive === true && isUserActive === true && (
        <LoadScript googleMapsApiKey={apigoogle} libraries={libraries}>
          <div className={styles.pageContainer}>
            {/* ... (resto del JSX sin cambios) ... */}
            <div className={styles.topSectionWave}>
              <img src={wave} alt="Fondo de ola" className={styles.waveBg} />
              <div className={styles.contentWrapper}>
                <div className={styles.routeSetupSection}>
                  <h2 className={styles.greeting}>
                    ¡Hola Miguel Andrade! Establece tu ruta de hoy
                  </h2>
                  <div className={styles.inputGroup}>
                    <div className={styles.inputWrapper}>
                      <MapPin className={styles.inputIcon} size={20} />
                      <Autocomplete
                        onLoad={onLoadStart}
                        onPlaceChanged={onPlaceChangedStart}
                        fields={["formatted_address", "geometry"]}
                        restrictions={{ country: "co" }}
                      >
                        <input
                          type="text"
                          placeholder="Punto de partida"
                          value={startPoint}
                          onChange={(e) => setStartPoint(e.target.value)}
                          className={styles.inputField}
                        />
                      </Autocomplete>
                    </div>
                    <div className={styles.inputWrapper}>
                      <MapPin className={styles.inputIcon} size={20} />
                      <Autocomplete
                        onLoad={onLoadDest}
                        onPlaceChanged={onPlaceChangedDest}
                        fields={["formatted_address", "geometry"]}
                        restrictions={{ country: "co" }}
                      >
                        <input
                          type="text"
                          placeholder="Destino"
                          value={destination}
                          onChange={(e) => setDestination(e.target.value)}
                          className={styles.inputField}
                        />
                      </Autocomplete>
                    </div>
                    <div className={styles.inputWrapper}>
                      <Clock className={styles.inputIcon} size={20} />
                      <input
                        type="datetime-local"
                        min={minDateTime}
                        onBlur={handleBlur}
                        max={maxDateTime}
                        value={dateTime}
                        onChange={(e) => setDateTime(e.target.value)}
                        className={styles.inputField}
                      />
                    </div>
                    <div className={styles.inputWrapper}>
                      <Users className={styles.inputIcon} size={20} />
                      <input
                        type="number"
                        value={asientos}
                        onChange={handleAsientosChange}
                        className={styles.inputField}
                        min="1"
                        max={maxAsientosVehiculo}
                        disabled={isVehicleInfoLoading}
                        title={
                          isVehicleInfoLoading
                            ? "Cargando capacidad del vehículo..."
                            : `Máximo ${maxAsientosVehiculo} asientos disponibles`
                        }
                      />
                    </div>
                  </div>
                  <div className={styles.buttonGroup}>
                    <button
                      className={styles.submitButton}
                      onClick={handleEstablecerRuta}
                      disabled={loading || isVehicleInfoLoading}
                    >
                      {loading ? "Estableciendo..." : "Establecer ruta"}
                    </button>
                  </div>
                </div>
                <div className={styles.mapSection}>
                  <GoogleMap
                    mapContainerClassName={styles.mapContainer}
                    center={mapCenter}
                    zoom={mapZoom}
                    options={{
                      styles: mapCustomStyles,
                      disableDefaultUI: true,
                      zoomControl: true,
                    }}
                  >
                    {directionsResponse && (
                      <DirectionsRenderer
                        options={{
                          directions: directionsResponse,
                          suppressMarkers: false,
                          polylineOptions: {
                            strokeColor: "#AA00FF",
                            strokeWeight: 5,
                          },
                        }}
                      />
                    )}
                  </GoogleMap>
                </div>
              </div>
            </div>

            <div className={styles.previousRoutesSection}>
              <h2 className={styles.sectionTitle}>Rutas anteriores</h2>
              <div className={styles.cardsGrid}>
                {previousRoutes.length > 0 ? (
                  previousRoutes.map((rutaData, index) => (
                    <RutaAnteriorCard
                      routeData={rutaData}
                      onEstablecerRuta={() => getInfoRutaAnterior(rutaData)}
                    />
                  ))
                ) : (
                  <div className={styles.infoMessage}>
                    No tienes viajes anteriores
                  </div>
                )}
              </div>
            </div>

            <SuccessModal
              isOpen={showSuccessModal}
              onClose={() => setShowSuccessModal(false)}
            />
          </div>
        </LoadScript>
      )}
    </>
  );
};

export default ConductorPage;
