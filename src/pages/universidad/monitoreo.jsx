import React from "react";
import Button from '../AuthUser/Button';
import { Search, Filter, X, MoreVertical } from "lucide-react";
import "./monitoreo.css";

const MonitoreoPage = () => {
  return (
    <div className="page-container-monitoreo">
      <main className="main-content-wrapper-monitoreo">
        <div>
          <h1 className="main-title-monitoreo">
            MONITOREO DE USUARIOS DE UNIVALLE
          </h1>

          <div className="controls-container-monitoreo">
            <div className="search-bar-wrapper-monitoreo">
              <Search className="search-icon-monitoreo" size={18} />
              <input
                type="text"
                placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO"
                className="search-input-monitoreo"
              />
              <Button
                variant="ghost"
                className="filter-button-inside-search-monitoreo"
              >
                <Filter size={18} />
              </Button>
            </div>
          </div>

          <div className="map-area-container-monitoreo">
            <div className="map-placeholder-monitoreo">
              Aquí se mostraría el mapa con la ubicación de los vehículos
            </div>

            <div className="map-filter-tag-monitoreo">
              <span className="map-filter-text-monitoreo">
                Todos los usuarios
              </span>
              <X size={16} className="map-filter-icon-monitoreo" />
            </div>

            <div className="map-zoom-controls-monitoreo">
              <Button variant="ghost" className="map-zoom-button-monitoreo">
                +
              </Button>
              <Button variant="ghost" className="map-zoom-button-monitoreo">
                -
              </Button>
            </div>

            <div className="trip-info-card-monitoreo">
              <h3 className="trip-info-title-monitoreo">
                Información del viaje 234b
              </h3>
              <p className="trip-info-detail-monitoreo">
                <strong>Conductor:</strong> Juliana Rincon
              </p>
              <p className="trip-info-detail-monitoreo">
                <strong>Pasajeros:</strong> Juan Manuel Sierra, Alejandro
                Cordoba...
              </p>
              <p className="trip-info-detail-monitoreo last-detail">
                <strong>Destino:</strong> Universidad del Valle
              </p>

              <Button
                variant="ghost"
                size="sm"
                className="trip-info-more-button-monitoreo"
              >
                <MoreVertical size={16} />
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MonitoreoPage;
