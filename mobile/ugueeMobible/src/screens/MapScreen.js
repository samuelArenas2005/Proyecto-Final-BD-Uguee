import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  ActivityIndicator
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { Ionicons, Feather } from '@expo/vector-icons';
import BackButton from '../components/BackButton';
import * as Location from 'expo-location';
import { ScrollView } from 'react-native-virtualized-view'

import { API_KEY } from "@env";
import { map } from 'leaflet';

const MapScreen = ({ navigation }) => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [region, setRegion] = useState(null);
  const [ubicacionActual, setUbicacionActual] = useState(null);
  const [loading, setLoading] = useState(true);

  const mapRef = useRef(null);

  async function getAddressFromCoords(lat, lng) {
    const endpoint = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${API_KEY}`;
    try {
      const response = await fetch(endpoint);
      const data = await response.json();
      if (data.status === 'OK' && data.results.length > 0) {
        return data.results[0].formatted_address;
      } else {
        console.warn('No se encontró una dirección para estas coordenadas.');
        return null;
      }
    } catch (error) {
      console.error('Error al obtener dirección:', error);
      return null;
    }
  }

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
        console.log(coords);

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
        console.error('🔴 Error en useEffect de ubicación:', error);
      } finally {
        setLoading(false);
        if (mapRef.current && region) {
          mapRef.current.animateToRegion(region, 1000);
        }
      }
    })();
  }, []);

  const onPlaceSelected = (data, details = null, type) => {
    console.log('[onPlaceSelected]', type, data, details);
   /*  if (!details?.geometry?.location) {
      console.warn('[PlaceDetails] no geometry.location');
      return;
    }

    const point = {
      latitude: details.geometry.location.lat,
      longitude: details.geometry.location.lng,
      name: data.description,
    };

    type === 'origin' ? setOrigin(point) : setDestination(point);

    mapRef.current?.animateToRegion({
      latitude: point.latitude,
      longitude: point.longitude,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    }); */
  };

  const fitMapToMarkers = () => {
   /*  if (origin && destination && mapRef.current) {
      console.log('[fitMap] markers count', origin, destination);
      mapRef.current.fitToCoordinates([origin, destination], {
        edgePadding: { top: 150, right: 50, bottom: 350, left: 50 },
        animated: true,
      });
    } */
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

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
              onReady={()=>{console.log("hola")}}
            />
          )}
        </MapView>

        <TouchableOpacity style={styles.burgerButton}>
          <Feather name="menu" size={28} color="black" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={32} color="black" />
        </TouchableOpacity>

        <View style={styles.bottomPanel}>
          <View style={styles.handleBar} />

          <ScrollView
            keyboardShouldPersistTaps="always"
            nestedScrollEnabled={true}
            contentContainerStyle={{ paddingBottom: 20 }}
          >

            {['origin', 'destination'].map(type => (
              <View style={styles.inputContainer} key={type}>
                <Ionicons
                  name={type === 'origin' ? 'location-sharp' : 'flag'}
                  size={24}
                  color="#555"
                  style={styles.inputIcon}
                />
                <GooglePlacesAutocomplete
                  placeholder={type === 'origin' ? 'Punto de partida' : 'Destino'}
                  onPress={(data, details) =>{
                    const {lat,lng} = details.geometry.location;
                    setOrigin({latitude:lat,longitude:lng})
                  } }
                  query={{
                    key: API_KEY,
                    language: 'es',
                    components: 'country:co',
                  }}
                  fetchDetails = {true}
                  minLength={2}
                  debounce={400}
                  onFail={e => console.error('[GPA Fail]', e)}
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

                  defaultValue={type === 'origin' ? ubicacionActual?.description : ''}
                  predefinedPlaces={type === 'origin' ? [ubicacionActual] : []}
                  textInputProps={{ nestedScrollEnabled: true }}
                  listViewProps={{ nestedScrollEnabled: true }}
                
                />
              </View>
            ))}
            
            

            <TouchableOpacity style={styles.inputContainer}>
              <Ionicons name="time-outline" size={24} color="#555" style={styles.inputIcon} />
              <Text style={styles.timeInputText}>Hora de Salida</Text>
            </TouchableOpacity>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.mainButton} onPress={fitMapToMarkers}>
                <Text style={styles.mainButtonText}>Establecer ruta</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="options-outline" size={24} color="black" />
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
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
  },
  infoButton: {
    position: 'absolute',
    top: '50%',
    right: 20,
    transform: [{ translateY: -16 }],
  },
  bottomPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0, right: 0,
    backgroundColor: 'white',
    borderTopLeftRadius: 20, borderTopRightRadius: 20,
    paddingTop: 10, paddingHorizontal: 20, paddingBottom: 0,
    elevation: 10,
  },
  handleBar: { width: 40, height: 5, backgroundColor: '#ccc', alignSelf: 'center', marginBottom: 10 },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 50,
    marginBottom: 12,
  },
  inputIcon: { marginRight: 10, color:'#aa00ff' },
  timeInputText: { color: '#888', fontSize: 16 },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  mainButton: {
    flex: 1,
    backgroundColor: '#aa00ff',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 10,
  },
  mainButtonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  filterButton: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
  },
  center: { flex:1, justifyContent:'center', alignItems:'center' }
});

export default MapScreen;
