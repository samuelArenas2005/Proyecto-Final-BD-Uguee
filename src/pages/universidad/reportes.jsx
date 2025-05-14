import React from 'react';
import Button from '../AuthUser/Button';
import { Search, Filter, Download, X } from 'lucide-react';
import './reporte.css';

const ReportesPage = () => {
  return (
    <div className="page-container-reportes">
      <main className="main-content-wrapper-reportes">
        <div>
          <h1 className="main-title-reportes">FRECUENCIA DE VIAJES</h1>

          <div className="controls-container-reportes">
            <div className="search-bar-wrapper-reportes">
              <Search className="search-icon-reportes" size={18} />
              <input
                type="text"
                placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO"
                className="search-input-reportes"
              />
              <Button variant="ghost" className="filter-button-inside-search-reportes">
                <Filter size={18} />
              </Button>
            </div>

            <div className="filter-tag-reportes">
              <span className="filter-tag-text-reportes">Todos los usuarios</span>
              <X size={16} className="filter-tag-icon-reportes" />
            </div>
          </div>

          <div className="chart-container-reportes">
            <div className="chart-placeholder-reportes">
              Aquí se mostraría el gráfico de frecuencia de viajes
            </div>

            <div className="download-action-reportes">
              <Button className="download-report-button-reportes">
                <Download className="icon-extra-small-reportes" />
                Descargar Informe
              </Button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ReportesPage;