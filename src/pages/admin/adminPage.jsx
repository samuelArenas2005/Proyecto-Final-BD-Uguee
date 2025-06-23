import React, { useState, useEffect } from 'react';
import { Search, Filter, MoreVertical, CheckCircle2, XCircle, Check, X, Building2 } from 'lucide-react';
import { supabase } from "../../supabaseClient.js";
import "./adminPage.css";

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [universities, setUniversities] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);

  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase
        .from('institucion')
        .select('*')
        .eq('estado', 'pendiente');

      if (error) {
        console.error('Error fetching universities:', error);
        setUniversities([]);
      } else {
        const formattedUniversities = data.map(uni => ({
          id: uni.idinstitucion,
          name: uni.nombre,
          requestType: `Sede: ${uni.sede}`,
          status: 'Pendiente de Aprobación',
          avatar: <Building2 size={40} color="#3B82F6" />,
          details: {
            nombre: uni.nombre,
            colorprincipal: uni.colorprincipal,
            colorsecundario: uni.colorsecundario,
            sede: uni.sede,
            address: `${uni.calle} #${uni.numerolugar}, ${uni.ciudad}`,
            ciudad: uni.ciudad,
          }
        }));
        setUniversities(formattedUniversities);
      }
    };

    fetchUniversities();
  }, []); // Cargar al montar el componente

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleActionMenu = (universityId) => {
    setOpenMenuId(openMenuId === universityId ? null : universityId);
  };

  const handleAcceptUniversity = async (universityId) => {
    const { error } = await supabase
      .from('institucion')
      .update({ estado: 'activo' })
      .eq('idinstitucion', universityId);

    if (!error) {
      setUniversities(prev => prev.filter(u => u.id != universityId));
      closeDetailsModal();
    } else {
      console.error('Error accepting university:', error);
    }
  };

  const handleDenyUniversity = async (universityId) => {
    const { error } = await supabase
      .from('institucion')
      .update({ estado: 'inactivo' })
      .eq('idinstitucion', universityId);

    if (!error) {
      setUniversities(prev => prev.filter(u => u.id !== universityId));
      closeDetailsModal();
    } else {
      console.error('Error denying university:', error);
    }
  };

  const openDetailsModal = (university) => {
    setSelectedUniversity(university);
    setOpenMenuId(null);
  };

  const closeDetailsModal = () => {
    setSelectedUniversity(null);
  };

  const filteredUniversities = universities.filter(uni =>
    uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (uni.details.ciudad && uni.details.ciudad.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    if (status === 'Universidad Aceptada') return 'var(--text-green-600)';
    if (status === 'Universidad Denegada') return 'var(--text-red-600)';
    return 'var(--text-blue-600)';
  };

  const getStatusIcon = (status) => {
    if (status === 'Universidad Aceptada') return <CheckCircle2 size={20} className="status-icon" />;
    if (status === 'Universidad Denegada') return <XCircle size={20} className="status-icon" />;
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
        {filteredUniversities.length > 0 ? filteredUniversities.map((university) => (
          <div key={university.id} className="request-card">
            <div className="request-info">
              <div className="avatar-icon">{university.avatar}</div>
              <div className="request-details">
                <span className="request-name">{university.name}</span>
                <span className="request-type">{university.requestType}</span>
              </div>
            </div>
            <div className="request-status" style={{ color: getStatusColor(university.status) }}>
              {university.status}
              {getStatusIcon(university.status)}
            </div>
            <div className="actions-menu-container">
              <button className="more-options-button" onClick={() => toggleActionMenu(university.id)}>
                <MoreVertical size={24} />
              </button>
              {openMenuId === university.id && (
                <div className="action-menu">
                  <div className="action-menu-item" onClick={() => openDetailsModal(university)}>
                    Ver detalles
                  </div>
                  <div className="action-menu-item accept" onClick={() => handleAcceptUniversity(university.id)}>
                    <Check size={16} /> Aceptar Universidad
                  </div>
                  <div className="action-menu-item deny" onClick={() => handleDenyUniversity(university.id)}>
                    <X size={16} /> Denegar Universidad
                  </div>
                </div>
              )}
            </div>
          </div>
        )) : <p>No hay solicitudes de universidades pendientes.</p>}
      </div>

      {selectedUniversity && (
        <div className="modal-overlay" onClick={closeDetailsModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeDetailsModal}>
              <X size={28} />
            </button>
            <div className="modal-header">
              <div className="modal-avatar">{selectedUniversity.avatar}</div>
              <div className="modal-user-info">
                <h2>{selectedUniversity.name}</h2>
                <p>{selectedUniversity.requestType}</p>
              </div>
            </div>

            <div className="modal-details-grid">
              <div className="detail-item"><strong>Nombre</strong><span>{selectedUniversity.details.nombre}</span></div>
              <div className="detail-item"><strong>Sede</strong><span>{selectedUniversity.details.sede}</span></div>
              <div className="detail-item"><strong>Dirección</strong><span>{selectedUniversity.details.address}</span></div>
              <div className="detail-item"><strong>Color Principal</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{selectedUniversity.details.colorprincipal}</span>
                  <div style={{ width: '20px', height: '20px', backgroundColor: selectedUniversity.details.colorprincipal, borderRadius: '4px', border: '1px solid #ccc' }}></div>
                </div>
              </div>
              <div className="detail-item"><strong>Color Secundario</strong>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span>{selectedUniversity.details.colorsecundario}</span>
                  <div style={{ width: '20px', height: '20px', backgroundColor: selectedUniversity.details.colorsecundario, borderRadius: '4px', border: '1px solid #ccc' }}></div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button className="modal-action-button deny" onClick={() => handleDenyUniversity(selectedUniversity.id)}>
                <X size={20} /> Denegar
              </button>
              <button className="modal-action-button accept" onClick={() => handleAcceptUniversity(selectedUniversity.id)}>
                <Check size={20} /> Admitir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;