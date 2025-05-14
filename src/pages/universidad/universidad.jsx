import React, { useState } from "react";
// import { Link } from 'react-router-dom'; // No es necesario aquí si la navegación es solo por header
import Button from "../AuthUser/Button";
import {
  Search,
  Filter,
  Download,
  Check,
  X,
  MoreVertical,
  UserPlus,
} from "lucide-react";
import "./universidad.css";

// Mock data (sin cambios respecto a la versión anterior)
const studentRequestsData = [
  {
    id: "1",
    name: "Nicolas Arenas",
    avatar: "https://i.pravatar.cc/150?img=32",
    type: "Solicitud de conducción",
    status: "Pendiente de confirmar usuario",
  },
  {
    id: "2",
    name: "Miguel Andrade",
    avatar: "https://i.pravatar.cc/150?img=12",
    type: "Solicitud de conducción",
    status: "Pendiente de confirmar vehículo",
  },
  {
    id: "3",
    name: "Juliana Rincon",
    avatar: "https://i.pravatar.cc/150?img=24",
    type: "Solicitud de conducción",
    status: "Usuario aceptado",
  },
  {
    id: "4",
    name: "Juan Manuel Sierra",
    avatar: "https://i.pravatar.cc/150?img=4",
    type: "Solicitud de conducción",
    status: "Usuario denegado",
  },
];

const studentDetailData = {
  id: "1",
  name: "Nicolas David",
  lastName: "Arenas Castillo",
  avatar: "https://i.pravatar.cc/150?img=32",
  studentId: "20224398-3743",
  address: "Calle 3a #47-118, Cali",
  university: "Universidad del Valle",
  phone: "3187835344",
  email: "nicolas.arenas@correo.univalle.edu.co",
  requestType: "Solicitud de conducción",
};

const UniversidadPage = () => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState("pasajeros");
  const [studentRequests, setStudentRequests] = useState(studentRequestsData);
  const [isModalOpen, setIsModalOpen] = useState(false); // Estado para el modal

  const handleUserAction = (action) => {
    console.log(`Acción: ${action} para el usuario ${selectedUser.name}`);
    setStudentRequests((requests) =>
      requests.map((request) =>
        request.id === selectedUser.id
          ? {
              ...request,
              status:
                action === "approve" ? "Usuario aceptado" : "Usuario denegado",
            }
          : request,
      ),
    );
    setSelectedUser(null);
  };

  const currentStudentDetail = selectedUser
    ? studentRequests.find((s) => s.id === selectedUser.id) || studentDetailData
    : studentDetailData;

  const filteredRequests = studentRequests.filter((request) => {
    if (activeSubTab === "pasajeros") {
      return (
        !request.status.includes("aceptado") &&
        !request.status.includes("denegado")
      );
    } else if (activeSubTab === "conductores") {
      return (
        request.status.includes("aceptado") ||
        request.status.includes("denegado")
      );
    }
    return true;
  });

  const openDesignateDriverModal = () => {
    setIsModalOpen(true);
  };

  const closeDesignateDriverModal = () => {
    setIsModalOpen(false);
  };

  const handleDesignateDriverSubmit = (event) => {
    event.preventDefault();
    // Aquí iría la lógica para enviar los datos del formulario
    console.log("Formulario de designar conductor enviado");
    closeDesignateDriverModal();
  };

  return (
    <div className="page-container">
      <main className="main-content-wrapper">
        {selectedUser ? (
          <div className="user-detail-container">
            {/* ... (contenido del detalle de usuario sin cambios) ... */}
            <div className="user-detail-header">
              <div className="user-info-block">
                <img
                  src={currentStudentDetail.avatar}
                  alt={currentStudentDetail.name}
                  className="user-avatar-large"
                />
                <div>
                  <h2 className="user-name-large">
                    {currentStudentDetail.name}{" "}
                    {currentStudentDetail.lastName || ""}
                  </h2>
                  <p className="user-request-type">
                    {currentStudentDetail.requestType ||
                      studentDetailData.requestType}
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                onClick={() => setSelectedUser(null)}
                className="close-button"
              >
                <X className="icon-small" />
              </Button>
            </div>

            <div className="user-detail-grid">
              <div>
                <h3 className="detail-label">Nombre Completo</h3>
                <p className="detail-value">{currentStudentDetail.name}</p>
              </div>
              <div>
                <h3 className="detail-label">Código Estudiantil</h3>
                <p className="detail-value">{studentDetailData.studentId}</p>
              </div>
              <div>
                <h3 className="detail-label">Apellido Completo</h3>
                <p className="detail-value">
                  {currentStudentDetail.lastName || studentDetailData.lastName}
                </p>
              </div>
              <div>
                <h3 className="detail-label">Dirección y Ciudad</h3>
                <p className="detail-value">{studentDetailData.address}</p>
              </div>
              <div>
                <h3 className="detail-label">Universidad</h3>
                <p className="detail-value">{studentDetailData.university}</p>
              </div>
              <div>
                <h3 className="detail-label">N° Celular</h3>
                <p className="detail-value">{studentDetailData.phone}</p>
              </div>
              <div>
                <h3 className="detail-label">Correo Institucional</h3>
                <p className="detail-value">{studentDetailData.email}</p>
              </div>
              <div>
                <h3 className="detail-label">Documento</h3>
                <Button variant="outline" className="download-button">
                  <Download className="icon-extra-small" />
                  Descargar
                </Button>
              </div>
            </div>

            <div className="action-buttons-container">
              <Button
                variant="outline"
                className="deny-button"
                onClick={() => handleUserAction("deny")}
              >
                <X className="icon-extra-small" />
                Denegar
              </Button>
              <Button
                className="approve-button"
                onClick={() => handleUserAction("approve")}
              >
                <Check className="icon-extra-small" />
                Admitir
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="requests-section">
              <h1 className="main-title">
                SOLICITUDES DE INGRESO A UGÜEE UNIVALLE
              </h1>

              <div className="controls-container">
                <div className="search-bar-wrapper">
                  <Search className="search-icon" size={18} />
                  <input
                    type="text"
                    placeholder="BUSCAR ESTUDIANTE POR NOMBRE, CÓDIGO"
                    className="search-input"
                  />
                  <Button
                    variant="ghost"
                    className="filter-button-inside-search"
                  >
                    <Filter size={18} />
                  </Button>
                </div>
                <Button
                  className="designate-driver-button"
                  onClick={openDesignateDriverModal}
                >
                  {" "}
                  {/* onClick añadido */}
                  <UserPlus size={18} className="button-icon-designate" />
                  Designar conductor
                </Button>
              </div>

              <div className="requests-list-container">
                <div className="subtabs-bar">
                  <button
                    className={`subtab-button ${activeSubTab === "pasajeros" ? "active" : ""}`}
                    onClick={() => setActiveSubTab("pasajeros")}
                  >
                    Pasajeros
                  </button>
                  <button
                    className={`subtab-button ${activeSubTab === "conductores" ? "active" : ""}`}
                    onClick={() => setActiveSubTab("conductores")}
                  >
                    Conductores
                  </button>
                </div>

                <div className="requests-list-content">
                  {filteredRequests.length > 0 ? (
                    filteredRequests.map((student) => (
                      <div
                        key={student.id}
                        className="student-request-item"
                        onClick={() => setSelectedUser(student)}
                      >
                        <div className="student-info">
                          <img
                            src={student.avatar}
                            alt={student.name}
                            className="student-avatar"
                          />
                          <div>
                            <h3 className="student-name">{student.name}</h3>
                            <p className="student-request-type-small">
                              {student.type}
                            </p>
                          </div>
                        </div>
                        <div className="student-status-section">
                          <span
                            className={`status-text ${
                              student.status.includes("Pendiente")
                                ? "status-pending"
                                : student.status.includes("aceptado")
                                  ? "status-accepted"
                                  : "status-denied"
                            }`}
                          >
                            {student.status}
                            {student.status.includes("aceptado") && (
                              <Check className="status-icon" size={16} />
                            )}
                            {student.status.includes("denegado") && (
                              <X className="status-icon" size={16} />
                            )}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="more-options-button"
                          >
                            <MoreVertical size={16} />
                          </Button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="no-requests-message">
                      No hay solicitudes pendientes.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Modal para Designar Conductor */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={closeDesignateDriverModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Designar Nuevo Conductor</h2>
              <button
                onClick={closeDesignateDriverModal}
                className="modal-close-button"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleDesignateDriverSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="vehicleType" className="form-label">
                  Tipo de vehículo
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  className="form-select"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Selecciona un tipo
                  </option>
                  <option value="car">Automóvil</option>
                  <option value="motorcycle">Motocicleta</option>
                  <option value="van">Camioneta</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">
                  Nombre completo
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  placeholder="Nombre del conductor"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  placeholder="correo@ejemplo.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="idNumber" className="form-label">
                  Número de identificación
                </label>
                <input
                  type="text"
                  id="idNumber"
                  name="idNumber"
                  placeholder="Ej: 1234567890"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="contactPhone" className="form-label">
                  Teléfono de contacto
                </label>
                <input
                  type="tel"
                  id="contactPhone"
                  name="contactPhone"
                  placeholder="Ej: 3001234567"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignedRoute" className="form-label">
                  Ruta asignada
                </label>
                <input
                  type="text"
                  id="assignedRoute"
                  name="assignedRoute"
                  placeholder="Ej: Universidad - Centro"
                  className="form-input"
                />
              </div>
              <div className="modal-actions">
                <Button
                  type="button"
                  variant="outline"
                  onClick={closeDesignateDriverModal}
                  className="modal-button-cancel"
                >
                  Cancelar
                </Button>
                <Button type="submit" className="modal-button-submit">
                  Designar Conductor
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UniversidadPage;
