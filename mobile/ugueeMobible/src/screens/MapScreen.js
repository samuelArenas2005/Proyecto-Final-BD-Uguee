import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Modal,
  Image,
  FlatList,
  Animated, TextInput
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons, Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import * as Location from 'expo-location';
import { supabase } from '../../supabase';
import { API_KEY } from "@env";

const MapScreen = ({ navigation }) => {
  // Estados para el formulario de ruta
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [region, setRegion] = useState(null);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [loading, setLoading] = useState(true);
  const [asientos, setAsientos] = useState(1);
  const [dateTime, setDateTime] = useState('');
  const [minDateTime, setMinDateTime] = useState('');
  const [maxDateTime, setMaxDateTime] = useState('');

  // Estados para la ruta activa
  const [activeRoute, setActiveRoute] = useState(null);
  const [passengers, setPassengers] = useState([]);
  const [loadingPassengers, setLoadingPassengers] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [currentPassengerIndex, setCurrentPassengerIndex] = useState(0);

  const mapRef = useRef(null);
  const originRef = useRef(null);
  const destinationRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  // Configuración inicial de fecha/hora
  useEffect(() => {
    const now = new Date();
    const minVal = now.toISOString().slice(0, 16);
    setMinDateTime(minVal);
    setDateTime(minVal);

    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 2);
    const maxVal = tomorrow.toISOString().slice(0, 16);
    setMaxDateTime(maxVal);
  }, []);

  // Obtener dirección a partir de coordenadas
  async function getAddressFromCoords(lat, lng) {
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn('No se encontró dirección para estas coordenadas');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return null;
    }
  }

  // Obtener ubicación actual al cargar
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.warn('Permiso de ubicación denegado');
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Highest,
        });
        const { latitude, longitude } = coords;

        const initialRegion = {
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };
        setRegion(initialRegion);

        const address = (await getAddressFromCoords(latitude, longitude)) || 'Mi ubicación';
        setUbicacionActual({
          description: address,
          geometry: { location: { lat: latitude, lng: longitude } },
        });

      } catch (error) {
        console.error('Error obteniendo ubicación:', error);
      } finally {
        setLoading(false);
        if (mapRef.current && region) {
          mapRef.current.animateToRegion(region, 1000);
        }
      }
    })();
  }, []);

  // Verificar si hay ruta activa
  useEffect(() => {
    const checkActiveRoute = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: activeRouteData, error } = await supabase
            .from('rutaconductorviaje')
            .select('idruta, ruta!inner(estado)')
            .eq('idconductor', user.id)
            .eq('ruta.estado', 'activo')
            .maybeSingle();

          if (activeRouteData && activeRouteData.idruta) {
            loadActiveRoute(activeRouteData.idruta);
          }
        }
      } catch (e) {
        console.error("Error verificando ruta activa:", e);
      }
    };

    checkActiveRoute();
  }, []);

  // Cargar ruta activa
  const loadActiveRoute = async (routeId) => {
    try {
      const { data, error } = await supabase
        .from('ruta')
        .select('*')
        .eq('idruta', routeId)
        .single();

      if (error) throw error;

      setActiveRoute(data);
      setOrigin({
        latitude: data.salidalatitud,
        longitude: data.salidalongitud,
        name: 'Origen'
      });
      setDestination({
        latitude: data.paradalatitud,
        longitude: data.paradalongitud,
        name: 'Destino'
      });

      // Enfocar en la ruta
      fitMapToMarkers(
        { latitude: data.salidalatitud, longitude: data.salidalongitud },
        { latitude: data.paradalatitud, longitude: data.paradalongitud }
      );

      // Cargar pasajeros
      loadPassengers(routeId);

    } catch (error) {
      console.error('Error cargando ruta activa:', error);
    }
  };

  // Cargar pasajeros
  const loadPassengers = async (routeId) => {
    setLoadingPassengers(true);
    try {
      console.log(activeRoute.idruta)
      // Obtener ID del viaje asociado a la ruta
     const { data: viajeData, error: viajeError } = await supabase
               .from('rutaconductorviaje')
               .select('idviaje')
               .eq('idruta',  activeRoute.idruta)
               .single();
     
             // Si no se encuentra viajeData o hay un error al obtenerlo
             if (viajeError || !viajeData || !viajeData.idviaje) {
               setPassengersLoading(false);
               // Mensajes de error más específicos para el usuario
               if (viajeError) {
                 setPassengerError("Error al conectar con la base de datos para obtener el viaje.");
                 console.error("Error fetching viajeData:", viajeError);
               } else if (!viajeData || !viajeData.idviaje) {
                 setPassengerError("No se encontró un viaje activo asociado a esta ruta.");
               }
               return; // IMPORTANTE: Detener la ejecución aquí para evitar usar 'undefined'
             }
     
             const idviaje = viajeData.idviaje;

      // Obtener pasajeros del viaje
      const { data: passengerData, error: passengerFetchError } = await supabase
        .from('pasajeroviaje')
        .select(`
                  pasajero(
                  usuario(
                    nombrecompleto,estatuto,codigoestudiantil
                  )
                  )
                `)
        .eq('idviaje', idviaje);

      if (passengerFetchError) throw passengerFetchError;

      // Formatear datos de pasajeros
      const formattedPassengers = passengerData.map(item => ({
        id: item.pasajero.usuario.idusuario,
        name: item.pasajero.usuario.nombrecompleto,
        code: item.pasajero.usuario.codigoestudiantil
      }));

      setPassengers(formattedPassengers);
    } catch (error) {
      console.error('Error cargando pasajeros:', error);
    } finally {
      setLoadingPassengers(false);
    }
  };

  // Enfocar mapa en un punto
  const focusMapOnPoint = (point) => {
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }, 1000);
    }
  };

  // Ajustar mapa a ambos marcadores
  const fitMapToMarkers = (start, end) => {
    if (mapRef.current) {
      mapRef.current.fitToCoordinates([start, end], {
        edgePadding: { top: 150, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    }
  };

  // Manejar selección de ubicaciones
  const handlePlaceSelected = (data, details, type) => {
    if (!details?.geometry?.location) {
      console.warn('Ubicación no válida');
      return;
    }

    const point = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      name: data.description,
    };

    if (type === 'origin') {
      setOrigin(point);
      if (originRef.current) {
        originRef.current.setAddressText(data.description);
      }
    } else {
      setDestination(point);
      if (destinationRef.current) {
        destinationRef.current.setAddressText(data.description);
      }
    }

    focusMapOnPoint(point);
  };

  // Establecer nueva ruta
  const handleEstablecerRuta = async () => {
    if (!origin || !destination || !dateTime) {
      alert('Por favor completa todos los campos');
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      // Obtener información del vehículo del conductor
      const { data: conductorData, error: conductorError } = await supabase
        .from('conductor')
        .select('idvehiculo')
        .eq('idusuario', user.id)

      if (conductorError || !conductorData) throw new Error('Error obteniendo vehículo');

      // Formatear fecha y hora
      const fechaHora = new Date(dateTime);
      const fecha = fechaHora.toISOString().split('T')[0];
      const hora = fechaHora.toTimeString().split(' ')[0];

      // Crear nueva ruta
      const nuevaRuta = {
        idvehiculo: conductorData.idvehiculo,
        salidalatitud: origin.latitude,
        salidalongitud: origin.longitude,
        paradalatitud: destination.latitude,
        paradalongitud: destination.longitude,
        fecha: fecha,
        horadesalida: hora,
        asientosdisponibles: asientos,
        tipoderuta: 'Municipal',
        estado: 'activo',
        distancia: 20,
      };

      const { data: rutaInsertada, error: rutaError } = await supabase
        .from('ruta')
        .insert(nuevaRuta)
        .select('idruta')
        .single();

      if (rutaError) throw rutaError;

      // Crear nuevo viaje
      const nuevoViaje = {
        tiempodesalida: fechaHora.toISOString(),
        estadodelviaje: 'pendiente',
      };

      const { data: viajeInsertado, error: viajeError } = await supabase
        .from('viaje')
        .insert(nuevoViaje)
        .select('idviaje')
        .single();

      if (viajeError) throw viajeError;

      // Crear relación entre ruta, conductor y viaje
      const nuevaRelacion = {
        idruta: rutaInsertada.idruta,
        idconductor: user.id,
        idviaje: viajeInsertado.idviaje,
      };

      const { error: relacionError } = await supabase
        .from('rutaconductorviaje')
        .insert(nuevaRelacion);

      if (relacionError) throw relacionError;

      // Actualizar UI con la nueva ruta
      setActiveRoute({ ...nuevaRuta, idruta: rutaInsertada.idruta });
      loadPassengers(rutaInsertada.idruta);

    } catch (error) {
      console.error('Error estableciendo ruta:', error);
      alert('Error al establecer la ruta: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Cancelar ruta activa
  const handleCancelarRuta = async () => {
    if (!activeRoute) return;

    try {
      const { error } = await supabase
        .from('ruta')
        .update({ estado: 'cancelado' })
        .eq('idruta', activeRoute.idruta);

      if (error) throw error;

      // Resetear estado
      setActiveRoute(null);
      setPassengers([]);
      setShowConfirmModal(false);

    } catch (error) {
      console.error('Error cancelando ruta:', error);
      alert('Error al cancelar la ruta');
    }
  };

  // Navegar entre pasajeros
  const handlePassengerSwipe = (direction) => {
    if (passengers.length <= 1) return;

    if (direction === 'next') {
      setCurrentPassengerIndex(prev =>
        prev === passengers.length - 1 ? 0 : prev + 1
      );
    } else {
      setCurrentPassengerIndex(prev =>
        prev === 0 ? passengers.length - 1 : prev - 1
      );
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  const predefinedOriginPlaces = ubicacionActual ? [ubicacionActual] : [];

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <BackButton navigation={navigation} />
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={styles.map}
          initialRegion={region}
          loadingEnabled={true}
          showsUserLocation
        >
          {origin && <Marker coordinate={origin} title="Origen" pinColor="#8A2BE2" />}
          {destination && <Marker coordinate={destination} title="Destino" />}
          {origin && destination && (
            <MapViewDirections
              origin={origin}
              destination={destination}
              apikey={API_KEY}
              strokeWidth={5}
              strokeColor="#8A2BE2"
              onError={e => console.error('[Directions]', e)}
              onReady={() => fitMapToMarkers(origin, destination)}
            />
          )}
        </MapView>

        <TouchableOpacity
          style={styles.burgerButton}
          onPress={() => navigation.toggleDrawer()}
        >
          <Feather name="menu" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={32} color="black" />
        </TouchableOpacity>

        {!activeRoute ? (
          // Vista para establecer ruta
          <View style={styles.bottomPanel}>
            <View style={styles.handleBar} />

            <ScrollView
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled={true}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <View style={styles.inputContainer}>
                <Ionicons
                  name="location-sharp"
                  size={24}
                  color="#555"
                  style={styles.inputIcon}
                />
                <GooglePlacesAutocomplete
                  ref={originRef}
                  placeholder="Punto de partida"
                  onPress={(data, details) => handlePlaceSelected(data, details, 'origin')}
                  timeout={20000}
                  query={{
                    key: API_KEY,
                    language: 'es',
                    components: 'country:co',
                  }}
                  fetchDetails={true}
                  minLength={2}
                  debounce={400}
                  enablePoweredByContainer={false}
                  keepResultsAfterBlur={true}
                  styles={{
                    container: { flex: 1 },
                    textInput: {
                      backgroundColor: 'transparent',
                      height: 50,
                      fontSize: 16,
                      color: '#333',
                    },
                    listView: {
                      position: 'absolute',
                      zIndex: 1000,
                      top: 50,
                      backgroundColor: 'white',
                    },
                  }}
                  /* predefinedPlaces={predefinedOriginPlaces} */
                  predefinedPlaces={[]}
                  textInputProps={{
                    nestedScrollEnabled: true,
                    autoFocus: false,
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons
                  name="flag"
                  size={24}
                  color="#555"
                  style={styles.inputIcon}
                />
                <GooglePlacesAutocomplete
                  ref={destinationRef}
                  placeholder="Destino"
                  onPress={(data, details) => handlePlaceSelected(data, details, 'destination')}
                  timeout={20000}
                  query={{
                    key: API_KEY,
                    language: 'es',
                    components: 'country:co',
                  }}
                  fetchDetails={true}
                  minLength={2}
                  debounce={400}
                  enablePoweredByContainer={false}
                  keepResultsAfterBlur={true}
                  styles={{
                    container: { flex: 1 },
                    textInput: {
                      backgroundColor: 'transparent',
                      height: 50,
                      fontSize: 16,
                      color: '#333',
                    },
                    listView: {
                      position: 'absolute',
                      zIndex: 1000,
                      top: 50,
                      backgroundColor: 'white',
                    },
                  }}
                  predefinedPlaces={[]}
                  textInputProps={{
                    nestedScrollEnabled: true,
                    autoFocus: false,
                  }}
                />
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="time-outline" size={24} color="#555" style={styles.inputIcon} />
                <Text style={styles.timeInputText}>Hora de Salida</Text>
                <View style={{ flex: 1 }}>
                  <TextInput
                    style={styles.dateTimeInput}
                    value={dateTime}
                    onChangeText={setDateTime}
                    placeholder="Seleccionar fecha y hora"
                  />
                  {Platform.OS === 'android' && (
                    <DateTimePicker
                      value={dateTime ? new Date(dateTime) : new Date()}
                      mode="datetime"
                      display="default"
                      onChange={(event, selectedDate) => {
                        if (selectedDate) {
                          setDateTime(selectedDate.toISOString().slice(0, 16));
                        }
                      }}
                    />
                  )}
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={24} color="#555" style={styles.inputIcon} />
                <Text style={styles.timeInputText}>Asientos disponibles</Text>
                <TextInput
                  style={styles.seatsInput}
                  keyboardType="numeric"
                  value={asientos.toString()}
                  onChangeText={(text) => {
                    const num = parseInt(text) || 1;
                    setAsientos(num > 0 ? num : 1);
                  }}
                />
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.mainButton}
                  onPress={handleEstablecerRuta}
                  disabled={loading}
                >
                  <Text style={styles.mainButtonText}>
                    {loading ? 'Creando ruta...' : 'Establecer ruta'}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        ) : (
          // Vista de ruta activa
          <View style={styles.activeRoutePanel}>
            <View style={styles.handleBar} />

            <View style={styles.routeInfo}>
              <View style={styles.routeHeader}>
                <Text style={styles.routeTitle}>Ruta Activa</Text>
                <TouchableOpacity
                  style={styles.qrButton}
                  onPress={() => navigation.navigate('QRGenerator', { routeId: activeRoute.idruta })}
                >
                  <FontAwesome name="qrcode" size={24} color="#8A2BE2" />
                  <Text style={styles.qrText}>Ver QR</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.routeDetails}>
                <View style={styles.detailItem}>
                  <Ionicons name="location-sharp" size={20} color="#8A2BE2" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {origin.name}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="flag" size={20} color="#8A2BE2" />
                  <Text style={styles.detailText} numberOfLines={1}>
                    {destination.name}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="time-outline" size={20} color="#8A2BE2" />
                  <Text style={styles.detailText}>
                    {activeRoute.fecha} a las {activeRoute.horadesalida.slice(0, 5)}
                  </Text>
                </View>

                <View style={styles.detailItem}>
                  <Ionicons name="people-outline" size={20} color="#8A2BE2" />
                  <Text style={styles.detailText}>
                    {passengers.length} / {activeRoute.asientosdisponibles} pasajeros
                  </Text>
                </View>
              </View>

              {/* Pasajeros */}
              {passengers.length > 0 ? (
                <View style={styles.passengersContainer}>
                  <Text style={styles.sectionTitle}>Pasajeros</Text>

                  <View style={styles.passengerCarousel}>
                    <TouchableOpacity
                      style={styles.carouselArrow}
                      onPress={() => handlePassengerSwipe('prev')}
                    >
                      <Ionicons name="chevron-back" size={24} color="#8A2BE2" />
                    </TouchableOpacity>

                    <View style={styles.passengerCard}>
                      <Ionicons name="person" size={40} color="#8A2BE2" />
                      <Text style={styles.passengerName}>
                        {passengers[currentPassengerIndex]?.name}
                      </Text>
                      <Text style={styles.passengerCode}>
                        {passengers[currentPassengerIndex]?.code}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.carouselArrow}
                      onPress={() => handlePassengerSwipe('next')}
                    >
                      <Ionicons name="chevron-forward" size={24} color="#8A2BE2" />
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passengerIndicators}>
                    {passengers.map((_, index) => (
                      <View
                        key={index}
                        style={[
                          styles.indicatorDot,
                          index === currentPassengerIndex && styles.activeDot
                        ]}
                      />
                    ))}
                  </View>
                </View>
              ) : (
                <View style={styles.noPassengers}>
                  <Ionicons name="people-outline" size={40} color="#ccc" />
                  <Text style={styles.noPassengersText}>
                    Aún no hay pasajeros en esta ruta
                  </Text>
                </View>
              )}

              <View style={styles.routeActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    // Lógica para comenzar el viaje
                  }}
                >
                  <Text style={styles.actionButtonText}>Comenzar viaje</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowConfirmModal(true)}
                >
                  <Text style={styles.cancelButtonText}>Cancelar ruta</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>

      {/* Modal de confirmación para cancelar ruta */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showConfirmModal}
        onRequestClose={() => setShowConfirmModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>¿Cancelar ruta?</Text>
            <Text style={styles.modalText}>
              ¿Estás seguro de que deseas cancelar esta ruta?
              Esta acción no se puede deshacer.
            </Text>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButton}
                onPress={() => setShowConfirmModal(false)}
              >
                <Text style={styles.modalButtonText}>Volver</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.cancelModalButton]}
                onPress={handleCancelarRuta}
              >
                <Text style={styles.modalButtonText}>Cancelar ruta</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { ...StyleSheet.absoluteFillObject },
  burgerButton: {
    position: 'absolute',
    top: StatusBar.currentHeight + 20,
    left: 20,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    zIndex: 10,
  },
  infoButton: {
    position: 'absolute',
    top: '50%',
    right: 20,
    transform: [{ translateY: -16 }],
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    elevation: 5,
    zIndex: 10,
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    elevation: 10,
    maxHeight: '60%',
  },
  activeRoutePanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingHorizontal: 20,
    elevation: 10,
    maxHeight: '70%',
  },
  handleBar: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    alignSelf: 'center',
    marginBottom: 10
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 12,
  },
  inputIcon: {
    marginRight: 10,
    color: '#aa00ff'
  },
  timeInputText: {
    color: '#888',
    fontSize: 16,
    marginRight: 10,
  },
  dateTimeInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  seatsInput: {
    width: 50,
    height: 40,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    textAlign: 'center',
    fontSize: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    marginTop: 10
  },
  mainButton: {
    flex: 1,
    backgroundColor: '#aa00ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  mainButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },

  // Estilos para la vista de ruta activa
  routeInfo: {
    paddingBottom: 20,
  },
  routeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  routeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#f0e6ff',
    borderRadius: 10,
  },
  qrText: {
    marginLeft: 5,
    color: '#8A2BE2',
    fontWeight: '500',
  },
  routeDetails: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  detailText: {
    marginLeft: 10,
    fontSize: 16,
    color: '#555',
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  passengersContainer: {
    marginBottom: 15,
  },
  passengerCarousel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  carouselArrow: {
    padding: 10,
  },
  passengerCard: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f0e6ff',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 10,
  },
  passengerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
    color: '#333',
  },
  passengerCode: {
    fontSize: 16,
    color: '#666',
    marginTop: 5,
  },
  passengerIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  indicatorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#ccc',
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: '#8A2BE2',
  },
  noPassengers: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f9f9f9',
    borderRadius: 15,
    marginBottom: 15,
  },
  noPassengersText: {
    marginTop: 10,
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  routeActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#8A2BE2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#8A2BE2',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#8A2BE2',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Estilos para el modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  modalText: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 24,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginHorizontal: 5,
    backgroundColor: '#f0f0f0',
  },
  cancelModalButton: {
    backgroundColor: '#ffebee',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default MapScreen;