import React, { Component } from 'react';
import { MapContainer, TileLayer, Marker, Popup, ZoomControl } from 'react-leaflet';
import L from 'leaflet';
import { Search, Filter, Users, ChevronDown, MoreVertical, User, UsersRound, Navigation } from 'lucide-react';
import styles from './monitoreo.module.css'; // Importamos el CSS Module

// --- Mockup de Datos (igual que antes) ---
const mockTrips = [
  {
    id: 'trip001',
    userCode: '234b',
    driver: 'Juliana Rincón',
    passengers: 'Juan Manuel Sierra, Alejandro Cordoba...',
    destination: 'Universidad del Valle',
    position: [3.37397, -76.52945],
    isActive: true,
  },
  {
    id: 'trip002',
    userCode: '678x',
    driver: 'Carlos López',
    passengers: 'Ana María Vélez',
    destination: 'Ciudad Jardín',
    position: [3.3553, -76.5320],
    isActive: true,
  },
  {
    id: 'trip003',
    userCode: '912z',
    driver: 'Sofía Herrera',
    passengers: 'Pedro Pascal, Laura Quintero',
    destination: 'Estación MIO Universidades',
    position: [3.3770, -76.5260],
    isActive: true,
  },
  {
    id: 'trip004',
    userCode: 'A45C',
    driver: 'Andrés Rojas',
    passengers: 'Carolina Mesa',
    destination: 'Biblioteca Departamental',
    position: [3.4480, -76.5300],
    isActive: true,
  },
  {
    id: 'trip005',
    userCode: 'B72F',
    driver: 'Laura Vargas',
    passengers: 'David Gómez, Isabela Torres',
    destination: 'Parque del Perro',
    position: [3.4340, -76.5420],
    isActive: true,
  }
];

// --- Icono Personalizado para el Vehículo ---
// La clase 'customCarMarker' ahora está definida en UserMonitoring.module.css
// y es globalmente accesible debido a su uso en HTML inyectado.
// Si quisieras que fuera module-scoped, el DivIcon tendría que ser un componente React.
const carIconHtml = `<div class="${styles.customCarMarker}"><svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="#3C0078" stroke="white" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-car-taxi-front"><path d="M10 2h4"/><path d="m21 8-2 7-1.5 3.5A2 2 0 0 1 15.64 20H8.36a2 2 0 0 1-1.86-1.5L5 15l-2-7Z"/><path d="M12 12V7H5l2 5Z"/><path d="M12 12V7h7l-2 5Z"/><path d="M12 12h-2.5"/><path d="M12 12h2.5"/><path d="M5 15h14"/><path d="M6.2 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/><path d="M17.8 19.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"/></svg></div>`;

const carIcon = new L.DivIcon({
  html: carIconHtml,
  className: styles.emptyMarkerClass, // Usamos la clase del CSS Module
  iconSize: [32, 32],
  iconAnchor: [16, 30],
  popupAnchor: [0, -30]
});


class UserMonitoring extends Component {
  constructor(props) {
    super(props);
    this.state = {
      searchTerm: '',
      mapCenter: [3.372737, -76.529705],
      mapZoom: 14,
      activeTrips: mockTrips.filter(trip => trip.isActive),
      hoveredTripId: null,
    };
    this.popupRef = React.createRef();
  }

  handleSearchChange = (event) => {
    this.setState({ searchTerm: event.target.value });
  };

  handleMarkerMouseOver = (tripId, markerRef) => {
    this.setState({ hoveredTripId: tripId }, () => {
      if (markerRef && markerRef.current) {
        markerRef.current.openPopup();
      }
    });
  };

  render() {
    const { searchTerm, mapCenter, mapZoom, activeTrips } = this.state;

    return (
      <div className={styles.userMonitoringPage}>
        <header className={styles.monitoringMainHeader}>
          <h1>MONITORIO DE USUARIOS DE UNIVALLE</h1>
          <div className={styles.searchAndFilterBar}>
            <Search size={20} color="#757575" className={styles.searchBarIcon} />
            <input
              type="text"
              placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO"
              value={searchTerm}
              onChange={this.handleSearchChange}
              className={styles.mainSearchInput}
            />
            <Filter size={24} color="#7A00FF" className={styles.mainFilterIcon} />
          </div>
        </header>

        <main className={styles.mapContentArea}>
          <MapContainer
            center={mapCenter}
            zoom={mapZoom}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <ZoomControl position="bottomright" />

            {activeTrips.map(trip => {
              const markerRef = React.createRef();
              return (
                <Marker
                  key={trip.id}
                  position={trip.position}
                  icon={carIcon}
                  ref={markerRef}
                  eventHandlers={{
                    mouseover: () => this.handleMarkerMouseOver(trip.id, markerRef),
                    click: () => this.handleMarkerMouseOver(trip.id, markerRef),
                  }}
                >
                  {/* La clase 'trip-info-custom-popup' es global para Leaflet */}
                  <Popup className="trip-info-custom-popup" ref={this.popupRef}>
                    {/* Clases internas del popup pueden ser del CSS module si es necesario */}
                    <div className={styles.tripInfoContent}>
                      <div className={styles.tripInfoHeader}>
                        <h2>Información del viaje {trip.userCode}</h2>
                        <MoreVertical size={20} color="#757575" className={styles.optionsIcon} />
                      </div>
                      <div className={styles.tripInfoDetail}>
                        <User size={18} color="#7A00FF" />
                        <div>
                          <span>Conductor</span>
                          <p>{trip.driver}</p>
                        </div>
                      </div>
                      <div className={styles.tripInfoDetail}>
                        <UsersRound size={18} color="#7A00FF" />
                        <div>
                          <span>Pasajeros</span>
                          <p>{trip.passengers}</p>
                        </div>
                      </div>
                      <div className={styles.tripInfoDetail}>
                        <Navigation size={18} color="#7A00FF" />
                        <div>
                          <span>Destino</span>
                          <p>{trip.destination}</p>
                        </div>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </main>

        <footer className={styles.monitoringMainFooter}>
          <button className={styles.userViewFilterButton}>
            <Users size={18} color="#333333" />
            <span>Todos los usuarios</span>
            <ChevronDown size={18} color="#333333" />
          </button>
        </footer>
      </div>
    );
  }
}

export default UserMonitoring;