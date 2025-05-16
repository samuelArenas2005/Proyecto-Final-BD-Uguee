import React, { useState } from 'react';
import {
  ChevronLeft,
  BarChart3,
  Clock,
  GitFork, // O Route si prefieres para rutas
  Star,
  Award,   // O ShieldCheck para desempeño
  AlertTriangle,
  Search,
  Filter,
  Users,
  ChevronDown,
  Download,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './reporte.css'; 

// --- Datos de ejemplo para las gráficas (sin cambios) ---
const travelFrequencyData = [
  { name: 'Enero', Pasajeros: 65, Conductores: 80, Vehiculos: 50 },
  { name: 'Febrero', Pasajeros: 59, Conductores: 90, Vehiculos: 45 },
  { name: 'Marzo', Pasajeros: 80, Conductores: 70, Vehiculos: 60 },
  { name: 'Abril', Pasajeros: 81, Conductores: 88, Vehiculos: 90 },
  { name: 'Mayo', Pasajeros: 56, Conductores: 35, Vehiculos: 85 },
  { name: 'Junio', Pasajeros: 55, Conductores: 68, Vehiculos: 40 },
  { name: 'Julio', Pasajeros: 40, Conductores: 92, Vehiculos: 65 },
  { name: 'Agosto', Pasajeros: 70, Conductores: 60, Vehiculos: 88 },
  { name: 'Sept', Pasajeros: 48, Conductores: 28, Vehiculos: 70 },
  { name: 'Oct', Pasajeros: 90, Conductores: 80, Vehiculos: 55 },
  { name: 'Nov', Pasajeros: 38, Conductores: 15, Vehiculos: 72 },
  { name: 'Dic', Pasajeros: 76, Conductores: 82, Vehiculos: 42 },
];

// --- Componentes para cada vista (sin cambios en su lógica interna) ---
const FrecuenciaDeUsoView = () => (
  <div className="view-content">
    <div className="view-header">
      <h2>FRECUENCIA DE VIAJES</h2>
      <div className="view-controls">
        <div className="search-bar-minimal">
          <input type="text" placeholder="BUSCAR ESTUDIANTE POR NO..." /> {/* Placeholder ajustado */}
          <Search size={20} className="search-icon-minimal" />
          <Filter size={22} className="filter-icon-minimal" />
        </div>
        <div className="user-filter-dropdown">
          <Users size={20} />
          <span>Todos los usuarios</span>
          <ChevronDown size={18} />
        </div>
      </div>
    </div>
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={350}> {/* Altura ligeramente reducida */}
        <LineChart data={travelFrequencyData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}> {/* Ajuste de márgenes */}
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray-200)" vertical={false}/> {/* Sin líneas verticales */}
          <XAxis dataKey="name" stroke="var(--text-gray-light-color)" axisLine={false} tickLine={false} />
          <YAxis stroke="var(--text-gray-light-color)" axisLine={false} tickLine={false} domain={[0, 100]}/>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--white-color)',
              borderColor: 'var(--border-gray-300)',
              borderRadius: '6px',
              boxShadow: '0 2px 10px var(--shadow-color)'
            }}
          />
          <Legend
            iconType="plainline"
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={(value) => <span style={{ color: 'var(--text-gray-color)' }}>{value}</span>}
           />
          <Line type="monotone" dataKey="Pasajeros" stroke="#8F00FF" strokeWidth={2.5} dot={{ r: 5, fill: '#8F00FF', strokeWidth: 2, stroke: 'var(--white-color)' }} activeDot={{ r: 7, fill: '#8F00FF', strokeWidth: 2, stroke: 'var(--white-color)' }} />
          <Line type="monotone" dataKey="Conductores" stroke="#00C49F" strokeWidth={2.5} dot={{ r: 5, fill: '#00C49F', strokeWidth: 2, stroke: 'var(--white-color)' }} activeDot={{ r: 7, fill: '#00C49F', strokeWidth: 2, stroke: 'var(--white-color)' }} />
          <Line type="monotone" dataKey="Vehiculos" stroke="#FFAB2D" strokeWidth={2.5} dot={{ r: 5, fill: '#FFAB2D', strokeWidth: 2, stroke: 'var(--white-color)' }} activeDot={{ r: 7, fill: '#FFAB2D', strokeWidth: 2, stroke: 'var(--white-color)' }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
    <div className="view-footer">
      <button className="download-report-button">
        <Download size={18} />
        Descargar Informe
      </button>
    </div>
  </div>
);

const InformeHorariosView = () => (
  <div className="view-content"><h2>Informe de Horarios</h2><p>Contenido...</p></div>
);
const InformeRutasView = () => (
  <div className="view-content"><h2>Informe de Rutas</h2><p>Contenido...</p></div>
);
const CalificacionPasajerosView = () => (
  <div className="view-content"><h2>Calificación de Pasajeros</h2><p>Contenido...</p></div>
);
const DesempenoConductoresView = () => (
  <div className="view-content"><h2>Desempeño de Conductores</h2><p>Contenido...</p></div>
);
const ReporteConductoresView = () => (
  <div className="view-content"><h2>Reporte de Conductores</h2><p>Contenido...</p></div>
);


const DashboardPage = () => {
  const [activeView, setActiveView] = useState('Frecuencia de uso');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const sidebarItems = [
    { name: 'Frecuencia de uso', icon: <BarChart3 size={24} /> }, // Iconos un poco más grandes
    { name: 'Informe de horarios', icon: <Clock size={24} /> },
    { name: 'Informe de rutas', icon: <GitFork size={24} /> },
    { name: 'Calificación de Pasajeros', icon: <Star size={24} /> },
    { name: 'Desempeño de Conductores', icon: <Award size={24} /> },
    { name: 'Reporte de Conductores', icon: <AlertTriangle size={24} /> },
  ];

  const renderView = () => {
    switch (activeView) {
      case 'Frecuencia de uso': return <FrecuenciaDeUsoView />;
      case 'Informe de horarios': return <InformeHorariosView />;
      case 'Informe de rutas': return <InformeRutasView />;
      case 'Calificación de Pasajeros': return <CalificacionPasajerosView />;
      case 'Desempeño de Conductores': return <DesempenoConductoresView />;
      case 'Reporte de Conductores': return <ReporteConductoresView />;
      default: return <FrecuenciaDeUsoView />;
    }
  };

  return (
    // El div "dashboard-container" envuelve solo el sidebar y el main-content
    // Asumimos que el Header global está fuera de este componente, en un Layout superior
    <div className={`dashboard-body-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <div className="sidebar">
        <div className="sidebar-header-local"> {/* Renombrado para evitar conflicto con un header global */}
          {isSidebarOpen && <span className="sidebar-title">Análisis</span>}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="sidebar-toggle-button"
            aria-label={isSidebarOpen ? "Cerrar menú lateral" : "Abrir menú lateral"}
          >
            <ChevronLeft size={24} style={{ transform: isSidebarOpen ? 'rotate(0deg)' : 'rotate(180deg)' }} />
          </button>
        </div>
        <nav className="sidebar-nav">
          <ul>
            {sidebarItems.map((item) => (
              <li
                key={item.name}
                className={`sidebar-item ${activeView === item.name ? 'active' : ''}`}
                onClick={() => setActiveView(item.name)}
                title={!isSidebarOpen ? item.name : ''} // Muestra el nombre como tooltip cuando está cerrado
              >
                <div className="sidebar-item-icon">{item.icon}</div>
                {isSidebarOpen && <span className="sidebar-item-text">{item.name}</span>}
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <main className="main-content">
        {renderView()}
      </main>
    </div>
  );
};

export default DashboardPage;