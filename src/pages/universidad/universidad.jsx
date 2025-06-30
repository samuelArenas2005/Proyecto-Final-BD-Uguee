import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  Search,
  Filter,
  MoreVertical,
  UserCircle,
  CheckCircle2,
  XCircle,
  Download,
  Check,
  X,
  Plus,
} from "lucide-react";
import { supabase } from "../../supabaseClient.js";
import "./universidad.css";
import AssignUserModal from "./components/asignarUser";
import NotActive from "./components/NotActive";

const UniversidadPage = () => {
  const [activeTab, setActiveTab] = useState("Pasajeros");
  const [searchTerm, setSearchTerm] = useState("");
  const [requests, setRequests] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null); // 'accept' or 'deny'
  const [confirmUserId, setConfirmUserId] = useState(null);
  const [showVehicleDetails, setShowVehicleDetails] = useState(false);
  const [isUniversityActive, setIsUniversityActive] = useState(null); // null = loading, true = active, false = not active
  const [universityId, setUniversityId] = useState(null);
  const [universityStatus, setUniversityStatus] = useState(null);

  // Modal controls
  const openAssignModal = () => setIsAssignModalOpen(true);
  const closeAssignModal = () => setIsAssignModalOpen(false);

  // Check university activation status
  useEffect(() => {
    const checkUniversityStatus = async () => {
      try {
        // Get current authenticated user
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();
        if (authError) {
          console.error("Error getting user:", authError);
          setIsUniversityActive(false);
          return;
        }

        if (!user) {
          console.error("No user found");
          setIsUniversityActive(false);
          return;
        }

        // Check if user is a university and get its status
        const { data: universityData, error: universityError } = await supabase
          .from("institucion")
          .select("idinstitucion, estado")
          .eq("idinstitucion", user.id)
          .single();

        if (universityError) {
          console.error("Error fetching university data:", universityError);
          setIsUniversityActive(false);
          return;
        }

        if (!universityData) {
          console.error("No university found for this user");
          setIsUniversityActive(false);
          return;
        }

        setUniversityId(universityData.idinstitucion);
        setUniversityStatus(universityData.estado);
        setIsUniversityActive(universityData.estado === "activo");
      } catch (error) {
        console.error("Error checking university status:", error);
        setIsUniversityActive(false);
      }
    };

    checkUniversityStatus();
  }, []);

  useEffect(() => {
    const fetchRequests = async () => {
      // Only fetch requests if university is active and we have the university ID
      if (!isUniversityActive || !universityId) return;

      if (activeTab === "Pasajeros") {
        const { data, error } = await supabase
          .from("pasajero")
          .select(
            "*, usuario(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil, estatuto)"
          )
          .eq("estadopasajero", "pendiente")
          .eq("idinstitucion", universityId);
        if (error) {
          console.error(error);
          setRequests([]);
        } else {
          const emailPromises = data.map(async (item) => {
            const { data: emailUsuario, error: errEmail } = await supabase.rpc(
              "get_user_email_by_id",
              { p_user_id: item.idusuario }
            );
            if (errEmail) {
              console.error("Error fetching email:", errEmail);
              return "No disponible";
            }
            // Supabase RPCs return data as an array of objects
            return emailUsuario && emailUsuario.length > 0
              ? emailUsuario[0].email
              : "No disponible";
          });

          const emails = await Promise.all(emailPromises);

          setRequests(
            data.map((item, idx) => ({
              id: item.idusuario,
              name: item.usuario.nombrecompleto,
              requestType: "Pasajero",
              status: "Pendiente",
              avatar: <UserCircle size={40} color="#3B82F6" />,
              details: {
                fullName: item.usuario.nombrecompleto,
                studentCode: item.usuario.codigoestudiantil,
                statuto: item.usuario.estatuto,
                institutionalEmail: emails[idx],
                address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                phoneNumber: item.usuario.telefono,
                documentLink: "#",
              },
            }))
          );
        }
      } else {
        // activeTab === 'Conductores'
        const { data, error } = await supabase
          .from("conductor")
          .select(
            `
            *,
            usuario(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil, estatuto),
            vehiculo(
              idvehiculo, 
              color, 
              numeroasientos, 
              modelo, 
              marca,
              vehiculopesado(idvehiculo, placa, categoriaviaje, tipovehiculo, fechaventecno, fechavensoat),
              vehiculoligero(idvehiculo, nserie, tipo)
            )
          `
          )
          .eq("estadoconductor", "pendiente")
          .eq("idinstitucion", universityId);

        if (error) {
          console.error(error);
          setRequests([]);
        } else {
          setRequests(
            data.map((item) => ({
              id: item.idusuario,
              name: item.usuario.nombrecompleto,
              requestType: "Conductor",
              status: "Pendiente",
              avatar: <UserCircle size={40} color="#3B82F6" />,
              details: {
                fullName: item.usuario.nombrecompleto,
                studentCode: item.usuario.codigoestudiantil,
                statuto: item.usuario.estatuto || "No hay",
                institutionalEmail: item.usuario.email || "No hay", // Assuming email is directly on usuario for conductor
                address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                phoneNumber: item.usuario.telefono,
                documentLink: "#",
                licenseNumber: item.numerodelicencia || "No hay",
                vehicle: item.vehiculo
                  ? {
                      color: item.vehiculo.color,
                      numeroasientos: item.vehiculo.numeroasientos,
                      modelo: item.vehiculo.modelo,
                      marca: item.vehiculo.marca,
                      placa: item.vehiculo.vehiculopesado?.[0]?.placa || "N/A",
                      categoriaViaje:
                        item.vehiculo.vehiculopesado?.[0]?.categoriaviaje ||
                        "N/A",
                      tipoVehiculo:
                        item.vehiculo.vehiculopesado?.[0]?.tipovehiculo ||
                        item.vehiculo.vehiculoligero?.[0]?.tipo ||
                        "N/A",
                      fechaVenTecno:
                        item.vehiculo.vehiculopesado?.[0]?.fechaventecno ||
                        "N/A",
                      fechaVenSoat:
                        item.vehiculo.vehiculopesado?.[0]?.fechavensoat ||
                        "N/A",
                      nSerie:
                        item.vehiculo.vehiculoligero?.[0]?.nserie || "N/A",
                      isHeavy:
                        item.vehiculo.vehiculopesado &&
                        item.vehiculo.vehiculopesado.length > 0,
                      isLight:
                        item.vehiculo.vehiculoligero &&
                        item.vehiculo.vehiculoligero.length > 0,
                    }
                  : null,
              },
            }))
          );
        }
      }
    };
    fetchRequests();
  }, [activeTab, isUniversityActive, universityId]);

  // Handlers
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setOpenMenuId(null); // Close any open menus when changing tabs
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleActionMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const changeStateUser = async (id, accept) => {
    let tableName = "";
    let statusColumn = "";
    let userIdColumn = "idusuario";

    if (activeTab === "Pasajeros") {
      tableName = "pasajero";
      statusColumn = "estadopasajero";
    } else {
      // activeTab === 'Conductores'
      tableName = "conductor";
      statusColumn = "estadoconductor";
    }

    const { error } = await supabase
      .from(tableName)
      .update({ [statusColumn]: accept ? "activo" : "inactivo" })
      .eq(userIdColumn, id);

    if (error) {
      console.error("Error changing user state:", error);
      return false;
    }
    return true;
  };

  const handleConfirmAction = async () => {
    const success = await changeStateUser(
      confirmUserId,
      confirmAction === "accept"
    );
    if (success) {
      // Remove the request from the list after successful update
      setRequests((prev) => prev.filter((r) => r.id !== confirmUserId));
      closeDetailsModal(); // Close the main details modal
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmUserId(null);
  };

  const handleAcceptUser = (id) => {
    setShowConfirmModal(true);
    setConfirmAction("accept");
    setConfirmUserId(id);
    setOpenMenuId(null); // Close the action menu
  };

  const handleDenyUser = (id) => {
    setShowConfirmModal(true);
    setConfirmAction("deny");
    setConfirmUserId(id);
    setOpenMenuId(null); // Close the action menu
  };

  const openDetailsModal = (req) => {
    setSelectedRequest(req);
    setOpenMenuId(null);
    setShowVehicleDetails(false); // Reset vehicle details visibility
  };
  const closeDetailsModal = () => setSelectedRequest(null);

  const filtered = requests.filter(
    (r) =>
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.details.studentCode &&
        r.details.studentCode.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getStatusColor = (status) => {
    if (status === "Usuario aceptado") return "var(--text-green-600)";
    if (status === "Usuario denegado") return "var(--text-red-600)";
    return "var(--text-blue-600)";
  };

  const getStatusIcon = (status) => {
    if (status === "Usuario aceptado") return <CheckCircle2 size={20} />;
    if (status === "Usuario denegado") return <XCircle size={20} />;
    return null;
  };

  return (
    <>
      {/* Show loading state while checking university status */}
      {isUniversityActive === null && (
        <div
          className="universidad-page"
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "50vh",
          }}
        >
          <p>Verificando estado de la universidad...</p>
        </div>
      )}

      {/* Show NotActive component if university is not active */}
      {isUniversityActive === false && (
        <NotActive
          universityId={universityId}
          universityStatus={universityStatus}
        />
      )}

      {/* Show main content if university is active */}
      {isUniversityActive === true && (
        <div className="universidad-page">
          <h1 className="page-title">
            SOLICITUDES DE INGRESO A <span>UGÜEE</span> UNIVALE
          </h1>

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
            <div
              className={`tab ${activeTab === "Pasajeros" ? "active" : ""}`}
              onClick={() => handleTabClick("Pasajeros")}
            >
              Pasajeros
            </div>
            <div
              className={`tab ${activeTab === "Conductores" ? "active" : ""}`}
              onClick={() => handleTabClick("Conductores")}
            >
              Conductores
            </div>
            <button className="assignButton" onClick={openAssignModal}>
              <Plus size={20} /> <span>ASIGNAR MONITOR/CONDUCTOR</span>
            </button>
          </div>

          <div className="requests-list">
            {filtered.length > 0 ? (
              filtered.map((request) => (
                <div key={request.id} className="request-card">
                  <div className="request-info">
                    <div className="avatar-icon">{request.avatar}</div>
                    <div className="request-details">
                      <span className="request-name">{request.name}</span>
                      <span className="request-type">
                        {request.requestType}
                      </span>
                    </div>
                  </div>
                  <div
                    className="request-status"
                    style={{ color: getStatusColor(request.status) }}
                  >
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
                        <div
                          className="action-menu-item"
                          onClick={() => openDetailsModal(request)}
                        >
                          Ver detalles
                        </div>
                        <div
                          className="action-menu-item accept"
                          onClick={() => handleAcceptUser(request.id)}
                        >
                          <Check size={16} /> Aceptar usuario
                        </div>
                        <div
                          className="action-menu-item deny"
                          onClick={() => handleDenyUser(request.id)}
                        >
                          <X size={16} /> Denegar usuario
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p>No hay solicitudes pendientes.</p>
            )}
          </div>

          {selectedRequest && (
            <div
              className={`modal-overlay ${selectedRequest ? "open" : ""}`}
              onClick={closeDetailsModal}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close-button"
                  onClick={closeDetailsModal}
                >
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
                    <strong>Estatuto</strong>
                    <span>{selectedRequest.details.statuto}</span>
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
                    <strong>Dirección y Ciudad</strong>
                    <span>{selectedRequest.details.address}</span>
                  </div>
                  {selectedRequest.requestType === "Conductor" && (
                    <div className="detail-item">
                      <strong>Licencia</strong>
                      <span>{selectedRequest.details.licenseNumber}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <strong>Documento</strong>
                    <a
                      href={selectedRequest.details.documentLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="modal-document-button"
                    >
                      <Download size={18} /> Descargar
                    </a>
                  </div>

                  {selectedRequest.requestType === "Conductor" &&
                    selectedRequest.details.vehicle && (
                      <div className="detail-item full-width">
                        <strong
                          onClick={() =>
                            setShowVehicleDetails(!showVehicleDetails)
                          }
                          style={{
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            color: "var(--text-gray-medium-color)",
                          }}
                        >
                          Información del Vehículo{" "}
                          <ChevronDown
                            size={18}
                            style={{
                              transform: showVehicleDetails
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                              transition: "transform 0.2s",
                            }}
                          />
                        </strong>
                        {showVehicleDetails && (
                          <div
                            style={{
                              marginTop: "15px",
                              borderTop: "1px solid var(--border-gray-200)",
                              paddingTop: "15px",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr",
                              gap: "15px",
                            }}
                          >
                            <div className="detail-item-nested">
                              <strong>Marca</strong>
                              <span>
                                {selectedRequest.details.vehicle.marca}
                              </span>
                            </div>
                            <div className="detail-item-nested">
                              <strong>Modelo</strong>
                              <span>
                                {selectedRequest.details.vehicle.modelo}
                              </span>
                            </div>
                            <div className="detail-item-nested">
                              <strong>Color</strong>
                              <span>
                                {selectedRequest.details.vehicle.color}
                              </span>
                            </div>
                            <div className="detail-item-nested">
                              <strong>Número Asientos</strong>
                              <span>
                                {selectedRequest.details.vehicle.numeroasientos}
                              </span>
                            </div>

                            {selectedRequest.details.vehicle.isHeavy && (
                              <>
                                <div className="detail-item-nested">
                                  <strong>Placa</strong>
                                  <span>
                                    {selectedRequest.details.vehicle.placa}
                                  </span>
                                </div>
                                <div className="detail-item-nested">
                                  <strong>Categoría de Viaje</strong>
                                  <span>
                                    {
                                      selectedRequest.details.vehicle
                                        .categoriaViaje
                                    }
                                  </span>
                                </div>
                                <div className="detail-item-nested">
                                  <strong>Tipo de Vehículo</strong>
                                  <span>
                                    {
                                      selectedRequest.details.vehicle
                                        .tipoVehiculo
                                    }
                                  </span>
                                </div>
                                <div className="detail-item-nested">
                                  <strong>Fecha Vencimiento Tecno</strong>
                                  <span>
                                    {
                                      selectedRequest.details.vehicle
                                        .fechaVenTecno
                                    }
                                  </span>
                                </div>
                                <div className="detail-item-nested">
                                  <strong>Fecha Vencimiento SOAT</strong>
                                  <span>
                                    {
                                      selectedRequest.details.vehicle
                                        .fechaVenSoat
                                    }
                                  </span>
                                </div>
                              </>
                            )}
                            {selectedRequest.details.vehicle.isLight && (
                              <>
                                <div className="detail-item-nested">
                                  <strong>Número de Serie</strong>
                                  <span>
                                    {selectedRequest.details.vehicle.nSerie}
                                  </span>
                                </div>
                                <div className="detail-item-nested">
                                  <strong>Tipo</strong>
                                  <span>
                                    {
                                      selectedRequest.details.vehicle
                                        .tipoVehiculo
                                    }
                                  </span>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                </div>
                <div className="modal-actions">
                  <button
                    className="modal-action-button deny"
                    onClick={() => handleDenyUser(selectedRequest.id)}
                  >
                    <X size={20} /> Denegar
                  </button>
                  <button
                    className="modal-action-button accept"
                    onClick={() => handleAcceptUser(selectedRequest.id)}
                  >
                    <Check size={20} /> Admitir
                  </button>
                </div>
              </div>
            </div>
          )}

          {showConfirmModal && (
            <div className={`modal-overlay ${showConfirmModal ? "open" : ""}`}>
              <div
                className="confirm-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="modal-close-button"
                >
                  <X size={28} />
                </button>
                <h3>
                  ¿Estás seguro de{" "}
                  {confirmAction === "accept" ? "aceptar" : "denegar"} este
                  usuario?
                </h3>
                <div className="confirm-modal-actions">
                  <button
                    onClick={() => setShowConfirmModal(false)}
                    className="confirm-modal-button cancel"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmAction}
                    className={`confirm-modal-button ${
                      confirmAction === "accept"
                        ? "action-accept"
                        : "action-deny"
                    }`}
                  >
                    {confirmAction === "accept" ? "Aceptar" : "Denegar"}
                  </button>
                </div>
              </div>
            </div>
          )}

          <AssignUserModal
            isOpen={isAssignModalOpen}
            onClose={closeAssignModal}
            onAssignMonitor={() => {
              /* Lógica de asignación */
            }}
            onAssignUser={() => {
              /* Lógica de asignación */
            }}
          />
        </div>
      )}
    </>
  );
};

export default UniversidadPage;
