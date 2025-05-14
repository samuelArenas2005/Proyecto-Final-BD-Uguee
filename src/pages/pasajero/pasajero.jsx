import React, { useState } from "react";
import "./pasajero.css";
import FilterDialog from "./complementos/filterDialog";
import TripDetailDialog from "./complementos/tripDetailDialog";
import VehicleTypeSelector from "./complementos/VehicleTypeSelector";
import CampusVehicleForm from "./complementos/CampusVehicleForm";
import OutsideVehicleForm from "./complementos/OutsideVehicleForm";
import {
  Calendar,
  Car,
  MessageSquare,
  QrCode,
  Home,
  Filter,
} from "lucide-react";

const PasajeroDashboard = () => {
  // Estados de búsqueda y modales
  const [searchQuery, setSearchQuery] = useState("");
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isDriverModalOpen, setIsDriverModalOpen] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  const [vehicleSelectionStep, setVehicleSelectionStep] = useState("initial");
  const [selectedTripId, setSelectedTripId] = useState(null);
  const [isTripDetailOpen, setIsTripDetailOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("search");

  // Datos de ejemplo
  const [upcomingTrips, setUpcomingTrips] = useState([
    {
      id: 1,
      origin: "Universidad Nacional",
      destination: "Centro Comercial",
      date: "2023-09-20",
      time: "14:30",
      driver: "Juan Pérez",
      price: 5000,
      qrCode: "qr-code-123",
    },
  ]);
  const [searchResults,setSearchResultsNew] = useState([
    {
      id: 1,
      driver: "Carlos Rodríguez",
      photo: "https://i.pravatar.cc/150?img=3",
      vehicle: "Toyota Corolla",
      vehicleType: "Metropolitano",
      licensePlate: "ABC123",
      price: 5000,
      rating: 4.8,
    },
  ]);

  // Handlers de acciones
  const handleSearch = (query) => {
    setSearchQuery(query);
    console.log("Búsqueda iniciada", `Buscando viajes de ${query}`);
    const newTrip = {
        id: searchResults.length + 1,
        driver: "Samuel Arenas",
        photo: "https://i.pravatar.cc/150?img=7",
        vehicle: "Toyota",
        vehicleType: "Jamundi",
        licensePlate: "AB23C3",
        price: 6000,
        rating: 4.8,
    };
    setSearchResultsNew((prev) => [...prev, newTrip]);
    setActiveTab("search");

  };
  const handleViewTripDetail = (tripId) => {
    setSelectedTripId(tripId);
    setIsTripDetailOpen(true);
    console.log("Ver detalle del viaje", `Detalle del viaje ${tripId}`);
  };
  const handleSendMessage = (driverId) => {
    console.log("Mensaje enviado", "Tu mensaje ha sido enviado al conductor.", driverId);
  };
  const handleVehicleTypeSelect = (type) => {
    setVehicleSelectionStep(type);
  };
  const handleDriverApplication = () => {
    console.log("Solicitud enviada", "Tu solicitud para ser conductor ha sido enviada.");
    setIsDriverModalOpen(false);
    setVehicleSelectionStep("initial");
  };
  const handleCancelApplication = () => {
    setVehicleSelectionStep("initial");
    setIsDriverModalOpen(false);
  };

  return (
    <div className="pasajero-dashboard-container">
      {/* Header de la página */}
      <header className="pasajero-dashboard-header">
        <div className="container-wrapper header-content2">
          <div className="header-title-section2">
            <h1 className="main-title2">Panel de Pasajero</h1>
            <a href="/" className="back-to-home-link">
              <Home size={16} /> <span>Volver al inicio</span>
            </a>
          </div>
        </div>
      </header>

      <main className="main-content">
        <div className="main-grid">
          <div className="content-area">
            {/* Botón para abrir modal de conductor */}
            <div className="driver-application-section">
              <button
                className="button primary-button driver-button"
                onClick={() => setIsDriverModalOpen(true)}
              >
                <Car className="button-icon2" /> Quiero ser conductor
              </button>

              {/* Modal de solicitud de conductor */}
              {isDriverModalOpen && (
                <div
                  className="custom-dialog-overlay"
                  onClick={() => setIsDriverModalOpen(false)}
                >
                  <div
                    className="custom-dialog-content"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="custom-dialog-header">
                      <h2 className="custom-dialog-title">
                        Solicitud para ser conductor
                      </h2>
                      {vehicleSelectionStep === "initial" && (
                        <p className="custom-dialog-description">
                          Selecciona el tipo de vehículo que deseas registrar.
                        </p>
                      )}
                    </div>

                    {/* Paso 1: Selección de tipo de vehículo */}
                    {vehicleSelectionStep === "initial" && (
                      <VehicleTypeSelector
                        onSelect={handleVehicleTypeSelect}
                      />
                    )}

                    {/* Paso 2: Formulario para tipo campus */}
                    {vehicleSelectionStep === "campus" && (
                      <CampusVehicleForm
                        onSubmit={handleDriverApplication}
                        onCancel={handleCancelApplication}
                      />
                    )}

                    {/* Paso 3: Formulario para tipo fuera de campus */}
                    {vehicleSelectionStep === "outside" && (
                      <OutsideVehicleForm
                        onSubmit={handleDriverApplication}
                        onCancel={handleCancelApplication}
                      />
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Sección de búsqueda de viajes */}
            <section className="search-section">
              <h2 className="section-title">Buscar viaje</h2>
              <div className="custom-card search-card">
                <div className="search-inputs-grid">
                  <div>
                    <label className="form-label">Punto de partida</label>
                    <input
                      type="text"
                      placeholder="Universidad Nacional"
                      className="form-input"
                      value={searchQuery.split(" → ")[0] || ""}
                      onChange={(e) =>
                        setSearchQuery(
                          `${e.target.value} → ${
                            searchQuery.split(" → ")[1] || ""
                          }`
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Destino</label>
                    <input
                      type="text"
                      placeholder="Centro Comercial"
                      className="form-input"
                      value={searchQuery.split(" → ")[1] || ""}
                      onChange={(e) =>
                        setSearchQuery(
                          `${
                            searchQuery.split(" → ")[0] || ""
                          } → ${e.target.value}`
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="form-label">Fecha/Hora</label>
                    <input type="datetime-local" className="form-input" />
                  </div>
                </div>
                <div className="search-buttons">
                  <button
                    onClick={() =>
                      handleSearch(
                        searchQuery ||
                          "Universidad Nacional → Centro Comercial"
                      )
                    }
                    className="button primary-button search-action-button"
                  >
                    <Car className="button-icon2" /> Buscar
                  </button>
                  <button
                    onClick={() => setIsFilterDialogOpen(true)}
                    className="button outline-button filter-button"
                  >
                    <Filter className="icon-only" />
                  </button>
                </div>
              </div>
            </section>

            {/* Pestañas: Resultados y Próximos viajes */}
            <div className="custom-tabs">
              <div className="custom-tabs-list">
                <button
                  className={`custom-tabs-trigger ${
                    activeTab === "search" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("search")}
                  role="tab"
                  aria-selected={activeTab === "search"}
                >
                  Resultados
                </button>
                <button
                  className={`custom-tabs-trigger ${
                    activeTab === "upcoming" ? "active" : ""
                  }`}
                  onClick={() => setActiveTab("upcoming")}
                  role="tab"
                  aria-selected={activeTab === "upcoming"}
                >
                  Próximos viajes
                </button>
              </div>

              {/* Contenido de la pestaña de Resultados */}
              {activeTab === "search" && (
                <div className="custom-tabs-content" role="tabpanel">
                  <h3 className="tab-content-title">Conductores disponibles</h3>
                  {searchResults.length > 0 ? (
                    <div className="results-grid">
                      {searchResults.map((driver) => (
                        <div
                          key={driver.id}
                          className="custom-card driver-card"
                        >
                          <div className="driver-info-header">
                            <div className="driver-photo-container">
                              <img
                                src={driver.photo}
                                alt={driver.driver}
                                className="driver-photo"
                              />
                            </div>
                            <div>
                              <h4 className="driver-name">{driver.driver}</h4>
                              <div className="driver-rating">
                                ★ {driver.rating}
                              </div>
                            </div>
                          </div>
                          <div className="driver-details">
                            <div className="detail-item">
                              <span className="detail-label">Vehículo:</span>
                              <span className="detail-value">
                                {driver.vehicle}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Tipo:</span>
                              <span className="detail-value">
                                {driver.vehicleType}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Placa:</span>
                              <span className="detail-value">
                                {driver.licensePlate}
                              </span>
                            </div>
                            <div className="detail-item">
                              <span className="detail-label">Precio:</span>
                              <span className="detail-value price">
                                ${driver.price}
                              </span>
                            </div>
                          </div>
                          <div className="driver-card-actions">
                            <button
                              className="button outline-button small-button flex-1"
                              onClick={() => handleSendMessage(driver.id)}
                            >
                              <MessageSquare className="button-icon-small" /> Mensaje
                            </button>
                            <button
                              className="button primary-button small-button flex-1"
                              onClick={() => handleViewTripDetail(driver.id)}
                            >
                              Ver detalle
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="custom-card">
                      <p className="empty-state-text">
                        No se encontraron conductores para tu búsqueda.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Contenido de la pestaña de Próximos viajes */}
              {activeTab === "upcoming" && (
                <div className="custom-tabs-content" role="tabpanel">
                  <h3 className="tab-content-title">Tus próximos viajes</h3>
                  {upcomingTrips.length > 0 ? (
                    <div className="upcoming-trips-list">
                      {upcomingTrips.map((trip) => (
                        <div key={trip.id} className="custom-card trip-card">
                          <div className="trip-card-header">
                            <h4 className="trip-route">
                              {trip.origin} → {trip.destination}
                            </h4>
                            <span className="trip-status">Confirmado</span>
                          </div>
                          <div className="trip-details-grid">
                            <div>
                              <p className="detail-label">Fecha</p>
                              <p className="detail-value-icon">
                                <Calendar className="icon-inline" />
                                {trip.date}
                              </p>
                            </div>
                            <div>
                              <p className="detail-label">Hora</p>
                              <p className="detail-value">{trip.time}</p>
                            </div>
                            <div>
                              <p className="detail-label">Conductor</p>
                              <p className="detail-value">{trip.driver}</p>
                            </div>
                          </div>
                          <div className="trip-card-footer">
                            <span className="detail-value price">${trip.price}</span>
                            <button
                              className="button primary-button"
                              onClick={() => setIsQRModalOpen(true)}
                            >
                              <QrCode className="button-icon2" /> Ver QR
                            </button>
                          </div>

                          {/* Modal QR */}
                          {isQRModalOpen && (
                            <div
                              className="custom-dialog-overlay"
                              onClick={() => setIsQRModalOpen(false)}
                            >
                              <div
                                className="custom-dialog-content"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="custom-dialog-header">
                                  <h2 className="custom-dialog-title">
                                    Tu código QR de abordaje
                                  </h2>
                                </div>
                                <div className="qr-modal-content">
                                  <div className="qr-code-container">
                                    <div className="qr-code-placeholder">
                                      <QrCode className="qr-code-icon" />
                                    </div>
                                  </div>
                                  <p className="qr-modal-instruction">
                                    Muestra este código QR al conductor para abordar.
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="custom-card">
                      <p className="empty-state-text">No tienes viajes programados</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Diálogos exteriores */}
      <FilterDialog
        open={isFilterDialogOpen}
        onOpenChange={setIsFilterDialogOpen}
      />
      <TripDetailDialog
        open={isTripDetailOpen}
        onOpenChange={setIsTripDetailOpen}
        tripId={selectedTripId}
      />
    </div>
  );
};

export default PasajeroDashboard;

