import React, { useState, useEffect } from 'react';
import { ChevronDown, Search, Filter, MoreVertical, UserCircle, CheckCircle2, XCircle, Download, Check, X, Plus } from 'lucide-react';
import { supabase } from "../../supabaseClient.js";
import "./universidad.css";
import AssignUserModal from "./components/asignarUser";

const UniversidadPage = () => {
  const [activeTab, setActiveTab] = useState('Pasajeros');
  const [searchTerm, setSearchTerm] = useState('');
  const [requests, setRequests] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  // Modal controls
  const openAssignModal = () => setIsAssignModalOpen(true);
  const closeAssignModal = () => setIsAssignModalOpen(false);

  // Fetch data based on activeTab
  useEffect(() => {
    const fetchRequests = async () => {
      if (activeTab === 'Pasajeros') {

        const { data, error } = await supabase
          .from('pasajero')
          .select(`*, usuario(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil, estatuto)`)
          .eq('estadopasajero', 'pendiente');
        if (error) {
          console.error(error);
          setRequests([]);
        } else {
          const emailPromises = data.map(async (item) => {
            const { data: emailUsuario, error: errEmail } = await supabase
              .rpc('get_user_email_by_id', { p_user_id: item.idusuario })
            return emailUsuario 
          })

          const emails = await Promise.all(emailPromises)

          setRequests(
            data.map((item, idx) => ({
              id: item.idusuario,
              name: item.usuario.nombrecompleto,
              requestType: 'Pasajero',
              status: 'Pendiente',
              avatar: <UserCircle size={40} color="#3B82F6" />,
              details: {
                fullName: item.usuario.nombrecompleto,
                studentCode: item.usuario.codigoestudiantil,
                statuto: item.usuario.estatuto,
                institutionalEmail: emails[idx],
                address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                phoneNumber: item.usuario.telefono,
                documentLink: '#'
              }
            }))
          );
        }
      } else {
        const { data, error } = await supabase
          .from('conductor')
          .select(`*, usuario(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil,estatuto)`)
          .eq('estadoconductor', 'pendiente');
        if (error) {
          console.error(error);
          setRequests([]);
        } else {
          setRequests(
            data.map(item => ({
              id: item.idusuario,
              name: item.usuario.nombrecompleto,
              requestType: 'Conductor',
              status: 'Pendiente',
              avatar: <UserCircle size={40} color="#3B82F6" />,
              details: {
                fullName: item.usuario.nombrecompleto,
                studentCode: item.usuario.codigoestudiantil,
                statuto: item.usuario.estatuto || 'No hay',
                institutionalEmail: item.usuario.email || 'No hay',
                address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                phoneNumber: item.usuario.telefono,
                documentLink: '#',
                licenseNumber: item.numerodelicencia || 'No hay'
              }
            }))
          );
        }
      }
    };
    fetchRequests();
  }, [activeTab]);

  // Handlers
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm('');
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleActionMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const changeStateUser = async (id, accept) => {
    if (accept) {
      const { data } = await supabase
        .from('pasajero')
        .update({ estadopasajero: 'activo' })
        .eq('idusuario', id);
    } else {
      const { data } = await supabase
        .from('pasajero')
        .update({ estadopasajero: 'inactivo' })
        .eq('idusuario', id);
    }
  }

  const handleAcceptUser = (id) => {
    changeStateUser(id, true)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Usuario aceptado' } : r));
    setOpenMenuId(null);
  };



  const handleDenyUser = (id) => {
    changeStateUser(id, false)
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status: 'Usuario denegado' } : r));
    setOpenMenuId(null);
  };

  const openDetailsModal = (req) => { setSelectedRequest(req); setOpenMenuId(null); };
  const closeDetailsModal = () => setSelectedRequest(null);

  const filtered = requests.filter(r =>
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.details.studentCode.includes(searchTerm)
  );

  const getStatusColor = status => {
    if (status === 'Usuario aceptado') return 'var(--text-green-600)';
    if (status === 'Usuario denegado') return 'var(--text-red-600)';
    return 'var(--text-blue-600)';
  };

  const getStatusIcon = status => {
    if (status === 'Usuario aceptado') return <CheckCircle2 size={20} />;
    if (status === 'Usuario denegado') return <XCircle size={20} />;
    return null;
  };

  return (
    <div className="universidad-page">
      <h1 className="page-title">SOLICITUDES DE INGRESO A <span>UGÜEE</span> UNIVALE</h1>

      <div className="search-filter-container">
        <div className="search-input-wrapper">
          <Search size={20} />
          <input
            type="text"
            placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO"
            className="search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <Filter size={24} className="filter-icon" />
      </div>

      <div className="tabs">
        <div className={`tab ${activeTab === 'Pasajeros' ? 'active' : ''}`} onClick={() => handleTabClick('Pasajeros')}>Pasajeros</div>
        <div className={`tab ${activeTab === 'Conductores' ? 'active' : ''}`} onClick={() => handleTabClick('Conductores')}>Conductores</div>
        <button className="assignButton" onClick={openAssignModal}><Plus size={20} /> <span>ASIGNAR MONITOR/CONDUCTOR</span></button>
      </div>

      <div className="requests-list">
        {filtered.length > 0 ? filtered.map(request => (
          <div key={request.id} className="request-card">
            <div className="request-info">
              <div className="avatar-icon">{request.avatar}</div>
              <div className="request-details">
                <span className="request-name">{request.name}</span>
                <span className="request-type">{request.requestType}</span>
              </div>
            </div>
            <div className="request-status" style={{ color: getStatusColor(request.status) }}>
              {request.status}{getStatusIcon(request.status)}
            </div>
            <div className="actions-menu-container">
              <button className="more-options-button" onClick={() => toggleActionMenu(request.id)}><MoreVertical size={24} /></button>
              {openMenuId === request.id && (
                <div className="action-menu">
                  <div className="action-menu-item" onClick={() => openDetailsModal(request)}>Ver detalles</div>
                  <div className="action-menu-item accept" onClick={() => handleAcceptUser(request.id)}><Check size={16} /> Aceptar usuario</div>
                  <div className="action-menu-item deny" onClick={() => handleDenyUser(request.id)}><X size={16} /> Denegar usuario</div>
                </div>
              )}
            </div>
          </div>
        )) : <p>No hay solicitudes pendientes.</p>}
      </div>

      {selectedRequest && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeDetailsModal}><X size={28} /></button>
            <div className="modal-header">
              <div className="modal-avatar">{selectedRequest.avatar}</div>
              <div className="modal-user-info">
                <h2>{selectedRequest.name}</h2>
                <p>{selectedRequest.requestType}</p>
              </div>
            </div>
            <div className="modal-details-grid">
              <div className="detail-item"><strong>Nombre Completo</strong><span>{selectedRequest.details.fullName}</span></div>
              <div className="detail-item"><strong>Código Estudiantil</strong><span>{selectedRequest.details.studentCode}</span></div>
              <div className="detail-item"><strong>Dirección y Ciudad</strong><span>{selectedRequest.details.address}</span></div>
              <div className="detail-item"><strong>Estatuto</strong><span>{selectedRequest.details.statuto}</span></div>
              <div className="detail-item"><strong>N° Celular</strong><span>{selectedRequest.details.phoneNumber}</span></div>
              <div className="detail-item"><strong>Correo Institucional</strong><span>{selectedRequest.details.institutionalEmail}</span></div>
              {selectedRequest.requestType === 'Conductor' && (
                <div className="detail-item"><strong>Licencia</strong><span>{selectedRequest.details.licenseNumber}</span></div>
              )}
              <div className="detail-item"><strong>Documento</strong><a href={selectedRequest.details.documentLink} className="modal-document-button"><Download size={18} /> Descargar</a></div>
            </div>
            <div className="modal-actions">
              <button className="modal-action-button deny" onClick={() => handleDenyUser(selectedRequest.id)}><X size={20} /> Denegar</button>
              <button className="modal-action-button accept" onClick={() => handleAcceptUser(selectedRequest.id)}><Check size={20} /> Admitir</button>
            </div>
          </div>
        </div>
      )}

      <AssignUserModal
        isOpen={isAssignModalOpen}
        onClose={closeAssignModal}
        onAssignMonitor={() => { }}
        onAssignUser={() => { }}
      />
    </div>
  );
};

export default UniversidadPage;
