import React, { useState } from 'react';
import { 
    LineChart, 
    Line, 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    Legend, 
    ResponsiveContainer 
} from 'recharts';
import { 
    LayoutDashboard, 
    Clock, 
    Route, 
    Star, 
    Users, 
    TriangleAlert, 
    Search, 
    Filter, 
    Download, 
    MoreVertical,
    UserX,
    ChevronLeft,
    User // Icono de usuario añadido
} from 'lucide-react';
import styles from './reporte.module.css';


/**
 * Juan Manuel Ampudia
 * Aca lo mas importante es saber el codigo SQL con funciones SQL que me permitan obtener la informacion que busco, se entiende mejor 
 * si accedes a la pagina web y miras los titulos
 * apartir de ella puedes pensar junto a las tablas que tenemos la manera de obtener cada informacion mediante funciones
 * esas funciones las debes declarar en el SQL editor de supabase
 * luego la informacion de ellas las puedes es decir lo que retornan puedes accederlo desde aca con algo llamado como rcp
 * investiga mejor con IA como obtener la info de funciones declaradas en supabase con SQL
 * 
 * luego de que tengas esa info resulta que ellos retorna un array [] con objetos literales adentros (los objetos literales 
 * son como mapas clave valor o son como literal objetos, donde pues tienen atributos a los cuales puedes acceder)
 * 
 * todo el codigo de abajo corresponde a un ejemplo de arreglos con objetos literales, frecuencyData, sheduleData , etc...
 * 
 * luego entonces tu labor sera llenar esa informacion con informacion de la base de datos atraves de las funcioens que definas 
 * si llamas a los datos que obtienes igual a las constantes de abajo no tendras que hacer nada mas, ya el codigo se encarga de mostrar 
 * la informacion mediante graficas 
 */

// --- MOCK DATA (Sin cambios, los mismos datos de muestra) ---
const frequencyData = [
    { name: 'Ene', pasajeros: 40, conductores: 24, vehiculos: 24 }, { name: 'Feb', pasajeros: 85, conductores: 43, vehiculos: 80 },
    { name: 'Mar', pasajeros: 95, conductores: 80, vehiculos: 60 }, { name: 'Abr', pasajeros: 60, conductores: 92, vehiculos: 98 },
    { name: 'May', pasajeros: 22, conductores: 30, vehiculos: 45 }, { name: 'Jun', pasajeros: 65, conductores: 85, vehiculos: 50 },
    { name: 'Jul', pasajeros: 92, conductores: 50, vehiculos: 95 }, { name: 'Ago', pasajeros: 98, conductores: 88, vehiculos: 70 },
    { name: 'Sep', pasajeros: 30, conductores: 60, vehiculos: 90 }, { name: 'Oct', pasajeros: 82, conductores: 95, vehiculos: 55 },
    { name: 'Nov', pasajeros: 18, conductores: 70, vehiculos: 80 }, { name: 'Dic', pasajeros: 85, conductores: 45, vehiculos: 50 },
];
const scheduleData = [
    { name: '06-07', solicitudes: 22 }, { name: '07-08', solicitudes: 75 }, { name: '08-09', solicitudes: 125 }, { name: '09-10', solicitudes: 175 },
    { name: '10-11', solicitudes: 140 }, { name: '11-12', solicitudes: 110 }, { name: '12-13', solicitudes: 95 }, { name: '13-14', solicitudes: 80 },
    { name: '14-15', solicitudes: 90 }, { name: '15-16', solicitudes: 60 }, { name: '16-17', solicitudes: 118 }, { name: '17-18', solicitudes: 180 },
    { name: '18-19', solicitudes: 195 }, { name: '19-20', solicitudes: 145 }, { name: '20-21', solicitudes: 70 }, { name: '21-22', solicitudes: 45 }, { name: '22-23', solicitudes: 30 },
];
const routesData = [
    { name: 'Ciudad Jardín a Univalle', solicitudes: 180 }, { name: 'Pance a Univalle', solicitudes: 160 }, { name: 'Valle de Lili a Univalle', solicitudes: 205 },
    { name: 'Meléndez a Univalle', solicitudes: 150 }, { name: 'San Marcos a Univalle', solicitudes: 140 }, { name: 'El Peñón a Univalle', solicitudes: 130 },
    { name: 'Siloé a Univalle', solicitudes: 118 }, { name: 'Paso del Comercio a Univalle', solicitudes: 110 }, { name: 'Ciudad Jardín a Centro', solicitudes: 60 },
    { name: 'Pance a Centro', solicitudes: 50 }, { name: 'Valle de Lili a Estadio', solicitudes: 40 }, { name: 'Meléndez a Aeropuerto', solicitudes: 30 },
];
const ratingData = [
    { name: '1', pasajeros: 18 }, { name: '2', pasajeros: 45 }, { name: '3', pasajeros: 80 }, { name: '4', pasajeros: 185 }, { name: '5', pasajeros: 245 },
];
const driverData = [
    { id: 1, name: 'Nicolas Arenas', driverRating: 4.88, routeRating: 4.60 },
    { id: 2, name: 'Juliana Rincon', driverRating: 4.78, routeRating: 4.53 },
];

// Vistas de Frecuencia, Horarios, Rutas, y Calificación (sin cambios)
// --- Sub-Componentes para cada vista ---


const ReportWrapper = ({ title, children }) => (
    <div className={styles.reportContainer}>
        <h2 className={styles.reportTitle}>{title}</h2>
        <div className={styles.searchFilterBar}>
            <div className={styles.searchBox}>
                <Search size={20} color="#888" />
                <input type="text" placeholder="BUSCAR INFO DE USUARIO POR NOMBRE, CÓDIGO" />
            </div>
            <Filter size={24} color="#888" cursor="pointer" />
        </div>
        <div className={styles.contentBody}>
            {children}
        </div>
        <button className={styles.downloadButton}>
            <Download size={20} />
            Descargar Informe
        </button>
    </div>
);

const FrequencyView = () => (
    <ReportWrapper title="FRECUENCIA DE VIAJES">
        <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={frequencyData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#666' }} />
                    <YAxis tick={{ fill: '#666' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="pasajeros" stroke="#8884d8" strokeWidth={2} name="Pasajeros" />
                    <Line type="monotone" dataKey="conductores" stroke="#82ca9d" strokeWidth={2} name="Conductores" />
                    <Line type="monotone" dataKey="vehiculos" stroke="#ffc658" strokeWidth={2} name="Vehículos" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    </ReportWrapper>
);

const SchedulesView = () => (
    <ReportWrapper title="INFORME DE HORARIOS">
        <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scheduleData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fill: '#666', fontSize: 12 }} />
                    <YAxis label={{ value: 'N° DE SOLICITUDES', angle: -90, position: 'insideLeft', fill: '#666' }} tick={{ fill: '#666' }}/>
                    <Tooltip cursor={{fill: 'rgba(238, 238, 238, 0.5)'}}/>
                    <Bar dataKey="solicitudes" fill="#0088FE" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </ReportWrapper>
);

const RoutesView = () => (
     <ReportWrapper title="INFORME DE RUTAS">
        <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={routesData} layout="vertical" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" tick={{ fill: '#666' }} />
                    <YAxis dataKey="name" type="category" tick={{ fill: '#666', fontSize: 12 }} width={150} />
                    <Tooltip />
                    <Bar dataKey="solicitudes" fill="#00C49F" radius={[0, 4, 4, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </ReportWrapper>
);


const PassengerRatingView = () => (
     <ReportWrapper title="CALIFICACIÓN DE CONDUCTORES">
        <div className={styles.chartWrapper}>
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={ratingData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" label={{ value: 'CALIFICACIÓN CONDUCTORES', position: 'insideBottom', offset: -5, fill: '#666' }} tick={{ fill: '#666' }}/>
                    <YAxis label={{ value: 'N° DE PASAJERO', angle: -90, position: 'insideLeft', fill: '#666' }} tick={{ fill: '#666' }}/>
                    <Tooltip />
                    <Bar dataKey="pasajeros" fill="#FF8042" radius={[4, 4, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </div>
    </ReportWrapper>
);

// Vista de Desempeño de Conductores ---
const DriverPerformanceView = () => (
    <ReportWrapper title="DESEMPEÑO DE CONDUCTORES">
        <div className={styles.driverList}>
            {driverData.map(driver => (
                <div key={driver.id} className={styles.driverCard}>
                    <div className={styles.driverInfo}>
                        {/* Se reemplaza la imagen por el ícono User */}
                        <div className={styles.driverAvatarIconWrapper}>
                            <User size={32} color="#4A148C" />
                        </div>
                        <div>
                            <p className={styles.driverName}>{driver.name}</p>
                            <div className={styles.driverRatings}>
                                <div className={styles.ratingDetail}>
                                    <p className={styles.ratingLabel}>CALIFICACIÓN COMO CONDUCTOR</p>
                                    <div className={styles.ratingValue}><Star size={16} color="#f9a825" fill="#f9a825"/> {driver.driverRating}</div>
                                </div>
                                <div className={styles.ratingDetail}>
                                    <p className={styles.ratingLabel}>CALIFICACIÓN DE SUS RUTAS</p>
                                    <div className={styles.ratingValue}><Star size={16} color="#f9a825" fill="#f9a825"/> {driver.routeRating}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <MoreVertical color="#888" cursor="pointer" />
                </div>
            ))}
        </div>
    </ReportWrapper>
);

const DriverReportsView = () => ( <ReportWrapper title="REPORTE DE CONDUCTORES"> <div className={styles.emptyState}><UserX size={80} color="#c084fc" /><p>No hay reportes de conductores</p></div></ReportWrapper> );


// Componente Principal de la Página ---
export default function ReportsPage() {
    const [activeView, setActiveView] = useState('driver-performance'); // Inicia en la vista de la imagen
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false); // Estado para la barra lateral

    const sidebarItems = [
        { id: 'frequency', label: 'Frecuencia de uso', icon: LayoutDashboard },
        { id: 'schedules', label: 'Informe de horarios', icon: Clock },
        { id: 'routes', label: 'Informe de rutas', icon: Route },
        { id: 'passenger-rating', label: 'Calificación de Pasajeros', icon: Star },
        { id: 'driver-performance', label: 'Desempeño de Conductores', icon: Users },
        { id: 'driver-reports', label: 'Reporte de Conductores', icon: TriangleAlert },
    ];

    const renderContent = () => {
        switch (activeView) {
            case 'frequency': return <FrequencyView />;
            case 'schedules': return <SchedulesView />;
            case 'routes': return <RoutesView />;
            case 'passenger-rating': return <PassengerRatingView />;
            case 'driver-performance': return <DriverPerformanceView />;
            case 'driver-reports': return <DriverReportsView />;
            default: return <FrequencyView />;
        }
    };

    return (
        <div className={styles.pageContainer}>
            {/* --- [MODIFICADO] BARRA LATERAL (SIDEBAR) --- */}
            <aside className={`${styles.sidebar} ${isSidebarCollapsed ? styles.collapsed : ''}`}>
                <div className={styles.sidebarHeader}>
                     <button 
                        className={styles.collapseButton}
                        onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                     >
                        <ChevronLeft size={24} className={styles.collapseIcon} />
                     </button>
                </div>
                <nav className={styles.sidebarNav}>
                     <p className={styles.analysisTitle}>
                        {/* El título 'Análisis' se oculta si la barra está colapsada */}
                        {!isSidebarCollapsed && 'Análisis'}
                     </p>
                    {sidebarItems.map((item) => (
                        <div
                            key={item.id}
                            className={`${styles.sidebarItem} ${activeView === item.id ? styles.active : ''}`}
                            onClick={() => setActiveView(item.id)}
                            title={item.label} // Tooltip para cuando esté colapsado
                        >
                            <item.icon size={22} />
                            {/* El texto solo se muestra si la barra NO está colapsada */}
                            {!isSidebarCollapsed && <span>{item.label}</span>}
                        </div>
                    ))}
                </nav>
            </aside>

            {/* --- CONTENIDO PRINCIPAL --- */}
            <main className={styles.mainContent}>
                {renderContent()}
            </main>
        </div>
    );
}




