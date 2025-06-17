import React, { useState, useEffect } from 'react';
import {
    ChevronLeft, BarChart3, Clock, GitFork, Star, Award,
    AlertTriangle, Search, Filter, Users, ChevronDown, Download,
    Loader, ServerCrash // Iconos para estados
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Bar, BarChart } from 'recharts';
import { supabase } from "../../supabaseClient.js";
import './reporte.css';

// --- Componente Genérico para Estados de Carga/Error ---
const ViewState = ({ loading, error, data, children }) => {
    if (loading) {
        return <div className="view-state-container"><Loader className="animate-spin" size={48} /> <p>Cargando datos...</p></div>;
    }
    if (error) {
        return <div className="view-state-container error"><ServerCrash size={48} /> <p>Error al cargar los datos: {error.message}</p></div>;
    }
    if (!data || data.length === 0) {
        return <div className="view-state-container"><BarChart3 size={48} /> <p>No hay datos disponibles para mostrar.</p></div>;
    }
    return children;
};

// --- Componentes para cada vista (CONECTADOS A SUPABASE) ---

const FrecuenciaDeUsoView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Llama a la función RPC creada en Supabase
            const { data: result, error: rpcError } = await supabase.rpc('obtener_frecuencia_mensual');
            
            if (rpcError) {
                setError(rpcError);
            } else {
                // Mapea los nombres de mes a español si es necesario (TMMonth ya lo hace)
                setData(result);
            }
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="view-content">
            <div className="view-header">
                <h2>FRECUENCIA DE USO MENSUAL</h2>
                {/* Controles de búsqueda (funcionalidad a implementar si se necesita) */}
            </div>
            <div className="chart-container" style={{ height: '400px' }}>
                <ViewState loading={loading} error={error} data={data}>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray-200)" vertical={false} />
                            <XAxis dataKey="mes" stroke="var(--text-gray-light-color)" axisLine={false} tickLine={false} />
                            <YAxis stroke="var(--text-gray-light-color)" axisLine={false} tickLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: 'var(--white-color)', borderColor: 'var(--border-gray-300)', borderRadius: '6px' }} />
                            <Legend wrapperStyle={{ paddingTop: '20px' }} formatter={(value) => <span style={{ color: 'var(--text-gray-color)' }}>{value}</span>} />
                            <Line type="monotone" dataKey="Pasajeros" stroke="#8F00FF" strokeWidth={2.5} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="Conductores" stroke="#00C49F" strokeWidth={2.5} activeDot={{ r: 7 }} />
                            <Line type="monotone" dataKey="Vehiculos" stroke="#FFAB2D" strokeWidth={2.5} activeDot={{ r: 7 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </ViewState>
            </div>
        </div>
    );
};

const InformeHorariosView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: result, error: rpcError } = await supabase.rpc('obtener_informe_horarios');
            if (rpcError) setError(rpcError);
            else setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="view-content">
            <div className="view-header"><h2>INFORME DE VIAJES POR HORA</h2></div>
            <div className="chart-container" style={{ height: '400px' }}>
                <ViewState loading={loading} error={error} data={data}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-gray-200)" vertical={false} />
                            <XAxis dataKey="hora" stroke="var(--text-gray-light-color)" />
                            <YAxis stroke="var(--text-gray-light-color)" />
                            <Tooltip cursor={{fill: 'var(--primary-light-bg)'}} contentStyle={{ backgroundColor: 'var(--white-color)', borderRadius: '6px' }}/>
                            <Legend formatter={(value) => <span style={{ color: 'var(--text-gray-color)' }}>{value}</span>}/>
                            <Bar dataKey="Viajes" fill="var(--primary-color)" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </ViewState>
            </div>
        </div>
    );
};

const InformeRutasView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: result, error: rpcError } = await supabase.rpc('obtener_rutas_populares');
            if (rpcError) setError(rpcError);
            else setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="view-content">
            <div className="view-header"><h2>INFORME DE RUTAS MÁS POPULARES</h2></div>
             <ViewState loading={loading} error={error} data={data}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Ruta</th>
                            <th>Total Viajes</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.ruta}</td>
                                <td>{item.Viajes}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ViewState>
        </div>
    );
};

const CalificacionPasajerosView = () => (
    <div className="view-content"><h2>Calificación de Pasajeros</h2><p>Vista en construcción. Define qué datos mostrar aquí.</p></div>
);


const DesempenoConductoresView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            const { data: result, error: rpcError } = await supabase.rpc('obtener_desempeno_conductores');
            if (rpcError) setError(rpcError);
            else setData(result.map(d => ({ ...d, calificacionPromedio: parseFloat(d.calificacionPromedio).toFixed(2) })));
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
         <div className="view-content">
            <div className="view-header"><h2>DESEMPEÑO DE CONDUCTORES</h2></div>
             <ViewState loading={loading} error={error} data={data}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Nombre del Conductor</th>
                            <th>Viajes Realizados</th>
                            <th>Calificación Promedio</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item, index) => (
                            <tr key={index}>
                                <td>{item.nombreCompleto}</td>
                                <td>{item.viajesRealizados}</td>
                                <td><Star size={16} color="#FFAB2D" fill="#FFAB2D" style={{verticalAlign: 'bottom', marginRight: '5px'}}/> {item.calificacionPromedio}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ViewState>
        </div>
    );
};

const ReporteConductoresView = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

     useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            // Consulta directa a la tabla PQRS, buscando usuarios que sean conductores
            const { data: result, error: fetchError } = await supabase
                .from('PQRS')
                .select(`
                    idPQRS,
                    tipoPQRS,
                    descripcion,
                    fecha,
                    usuario:idUsuario ( nombreCompleto )
                `)
                .filter('idUsuario', 'in', '(SELECT idUsuario FROM conductor)'); // Subconsulta para filtrar

            if (fetchError) setError(fetchError);
            else setData(result);
            setLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="view-content">
            <div className="view-header"><h2>REPORTE DE INCIDENCIAS (PQRS) DE CONDUCTORES</h2></div>
             <ViewState loading={loading} error={error} data={data}>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Conductor</th>
                            <th>Tipo de PQRS</th>
                            <th>Descripción</th>
                            <th>Fecha</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item) => (
                            <tr key={item.idPQRS}>
                                <td>{item.usuario?.nombreCompleto || 'Usuario eliminado'}</td>
                                <td>{item.tipoPQRS}</td>
                                <td>{item.descripcion}</td>
                                <td>{new Date(item.fecha).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </ViewState>
        </div>
    );
};


const DashboardPage = () => {
    const [activeView, setActiveView] = useState('Frecuencia de uso');
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    const sidebarItems = [
        { name: 'Frecuencia de uso', icon: <BarChart3 size={24} /> },
        { name: 'Informe de horarios', icon: <Clock size={24} /> },
        { name: 'Informe de rutas', icon: <GitFork size={24} /> },
        { name: 'Calificación de Pasajeros', icon: <Star size={24} /> },
        { name: 'Desempeño de Conductores', icon: <Award size={24} /> },
        { name: 'Reporte de Conductores', icon: <AlertTriangle size={24} /> },
    ];

    function renderView() {
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
        <div className={`dashboard-body-container ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
            <div className="sidebar">
                <div className="sidebar-header-local">
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
                                title={!isSidebarOpen ? item.name : ''}
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