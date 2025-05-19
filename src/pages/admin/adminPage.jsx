import React, { useState } from 'react';
import { ChevronDown, Search, Filter, MoreVertical, UserCircle, CheckCircle2, XCircle, Download, Check, X } from 'lucide-react';
import "./adminPage.css"

// Datos de ejemplo para las solicitudes (puedes reemplazarlos con datos de una API)
const initialRequests = [
  {
    id: 1,
    name: 'Nicolas Arenas',
    requestType: 'solicitud de conducción',
    status: 'Pendiente de confirmar usuario',
    avatar: <UserCircle size={40} />, // Icono por defecto
    details: {
      fullName: 'Nicolas David Arenas Castillo',
      studentCode: '20224398-3743',
      university: 'Universidad del Valle',
      institutionalEmail: 'nicolas.arenas@correounivalle.edu.co',
      address: 'Calle 3a #47-118, Cali',
      phoneNumber: '3187835344',
      documentLink: '#', // Enlace al documento
    }
  },
  {
    id: 2,
    name: 'Miguel Andrade',
    requestType: 'solicitud de conducción',
    status: 'Pendiente de confirmar vehiculo',
    avatar: <UserCircle size={40} color="#4B5563" />, // Otro icono o color
    details: {
      fullName: 'Miguel Angel Andrade',
      studentCode: '20215432-1098',
      university: 'Universidad del Valle',
      institutionalEmail: 'miguel.andrade@correounivalle.edu.co',
      address: 'Av Siempre Viva #123, Cali',
      phoneNumber: '3109876543',
      documentLink: '#',
    }
  },
  {
    id: 3,
    name: 'Juliana Rincon',
    requestType: 'solicitud de conducción',
    status: 'Usuario aceptado',
    avatar: <UserCircle size={40} color="#16A34A" />,
    details: {
      fullName: 'Juliana Maria Rincon',
      studentCode: '20231234-5678',
      university: 'Universidad del Valle',
      institutionalEmail: 'juliana.rincon@correounivalle.edu.co',
      address: 'Carrera 100 #5-20, Cali',
      phoneNumber: '3151234567',
      documentLink: '#',
    }
  },
  {
    id: 4,
    name: 'Juan Manuel Sierra',
    requestType: 'solicitud de conducción',
    status: 'Usuario denegado',
    avatar: <UserCircle size={40} color="#DC2626" />,
    details: {
      fullName: 'Juan Manuel Sierra Lopez',
      studentCode: '20209876-0011',
      university: 'Universidad del Valle',
      institutionalEmail: 'juan.sierra@correounivalle.edu.co',
      address: 'Calle Falsa #123, Cali',
      phoneNumber: '3178765432',
      documentLink: '#',
    }
  },
  {
    id: 5,
    name: 'Juan Manuel Sierra',
    requestType: 'solicitud de conducción',
    status: 'Usuario denegado',
    avatar: <UserCircle size={40} color="#DC2626" />,
    details: {
      fullName: 'Juan Manuel Sierra Lopez',
      studentCode: '20209876-0011',
      university: 'Universidad del Valle',
      institutionalEmail: 'juan.sierra@correounivalle.edu.co',
      address: 'Calle Falsa #123, Cali',
      phoneNumber: '3178765432',
      documentLink: '#',
    }
  },
  {
    id: 6,
    name: 'Juan Manuel Sierra',
    requestType: 'solicitud de conducción',
    status: 'Usuario denegado',
    avatar: <UserCircle size={40} color="#DC2626" />,
    details: {
      fullName: 'Juan Manuel Sierra Lopez',
      studentCode: '20209876-0011',
      university: 'Universidad del Valle',
      institutionalEmail: 'juan.sierra@correounivalle.edu.co',
      address: 'Calle Falsa #123, Cali',
      phoneNumber: '3178765432',
      documentLink: '#',
    }
  },
];

const UniversidadPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState(initialRequests);
  const [openMenuId, setOpenMenuId] = useState(null); // Para controlar el menú de acciones
  const [selectedRequest, setSelectedRequest] = useState(null); // Para el modal de detalles

  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    // Aquí podrías filtrar las solicitudes si "Pasajeros" y "Conductores" tienen datos diferentes
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleActionMenu = (requestId) => {
    setOpenMenuId(openMenuId === requestId ? null : requestId);
  };

  const handleAcceptUser = (requestId) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'Usuario aceptado' } : req
      )
    );
    setOpenMenuId(null); // Cerrar menú
    setSelectedRequest(null); // Cerrar modal si está abierto
  };

  const handleDenyUser = (requestId) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId ? { ...req, status: 'Usuario denegado' } : req
      )
    );
    setOpenMenuId(null); // Cerrar menú
    setSelectedRequest(null); // Cerrar modal si está abierto
  };

  const openDetailsModal = (request) => {
    setSelectedRequest(request);
    setOpenMenuId(null); // Cierra el menú de acciones si está abierto
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
  };

  const filteredRequests = requests.filter(request =>
    request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (request.details && request.details.studentCode.includes(searchTerm)) // Asumiendo que quieres buscar por código también
  );

  const getStatusColor = (status) => {
    if (status === 'Usuario aceptado') return 'var(--text-green-600)';
    if (status === 'Usuario denegado') return 'var(--text-red-600)';
    return 'var(--text-blue-600)'; // Para "Pendiente..."
  };

  const getStatusIcon = (status) => {
    if (status === 'Usuario aceptado') return <CheckCircle2 size={20} className="status-icon" />;
    if (status === 'Usuario denegado') return <XCircle size={20} className="status-icon" />;
    return null;
  }; 

    return (
       <div className="universidad-page">

<h1 className="page-title">UNIVERSIDADES CON SOLICITUDES DE INGRESO A <span>UGÜEE</span></h1>

      <div className="search-filter-container">
        <div className="search-input-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="BUSCAR UNIVERSIDAD POR NOMBRE O CIUDAD"
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Filter size={24} className="filter-icon" />
      </div>


      <div className="requests-list">
        {filteredRequests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-info">
              <div className="avatar-icon">{request.avatar}</div>
              <div className="request-details">
                <span className="request-name">{request.name}</span>
                <span className="request-type">{request.requestType}</span>
              </div>
            </div>
            <div className="request-status" style={{ color: getStatusColor(request.status) }}>
              {request.status}
              {getStatusIcon(request.status)}
            </div>
            <div className="actions-menu-container">
              <button
                className="more-options-button"
                onClick={() => toggleActionMenu(request.id)}
              >
                <MoreVertical size={24} />
              </button>
              {openMenuId === request.id && (
                <div className="action-menu">
                  <div className="action-menu-item" onClick={() => openDetailsModal(request)}>
                    Ver detalles
                  </div>
                  <div className="action-menu-item accept" onClick={() => handleAcceptUser(request.id)}>
                    <Check size={16} /> Aceptar usuario
                  </div>
                  <div className="action-menu-item deny" onClick={() => handleDenyUser(request.id)}>
                    <X size={16} /> Denegar usuario
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Detalles */}
      {selectedRequest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}> {/* Evita que el modal se cierre al hacer clic dentro */}
            <button className="modal-close-button" onClick={closeDetailsModal}>
              <X size={28} />
            </button>
            <div className="modal-header">
              <div className="modal-avatar">{selectedRequest.avatar}</div>
              <div className="modal-user-info">
                <h2>{selectedRequest.name}</h2>
                <p>{selectedRequest.requestType}</p>
              </div>
            </div>

            <div className="modal-details-grid">
              <div className="detail-item">
                <strong>Nombre Completo</strong>
                <span>{selectedRequest.details.fullName}</span>
              </div>
              <div className="detail-item">
                <strong>Código Estudiantil</strong>
                <span>{selectedRequest.details.studentCode}</span>
              </div>
              <div className="detail-item">
                <strong>Apellido Completo</strong> {/* Asumo que este campo también debe mostrarse */}
                <span>{selectedRequest.details.fullName.split(' ').slice(2).join(' ')}</span> {/* Lógica simple para apellido */}
              </div>
              <div className="detail-item">
                <strong>Dirección y Ciudad</strong>
                <span>{selectedRequest.details.address}</span>
              </div>
              <div className="detail-item">
                <strong>Universidad</strong>
                <span>{selectedRequest.details.university}</span>
              </div>
              <div className="detail-item">
                <strong>N° Celular</strong>
                <span>{selectedRequest.details.phoneNumber}</span>
              </div>
              <div className="detail-item">
                <strong>Correo Institucional</strong>
                <span>{selectedRequest.details.institutionalEmail}</span>
              </div>
              <div className="detail-item">
                <strong>Documento</strong>
                <a href={selectedRequest.details.documentLink} target="_blank" rel="noopener noreferrer" className="modal-document-button">
                  <Download size={18} /> Descargar
                </a>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-action-button deny" onClick={() => { handleDenyUser(selectedRequest.id); }}>
                 <X size={20} /> Denegar
              </button>
              <button className="modal-action-button accept" onClick={() => { handleAcceptUser(selectedRequest.id); }}>
                <Check size={20} /> Admitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversidadPage;