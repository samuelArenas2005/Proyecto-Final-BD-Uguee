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
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
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

  // Filter controls
  const toggleFilterMenu = () => setShowFilterMenu(!showFilterMenu);

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setShowFilterMenu(false);
  };

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "activo":
        return "Activos";
      case "pendiente":
        return "Pendientes";
      case "inactivo":
        return "Denegados";
      default:
        return "Todos";
    }
  };

  // Efecto para cerrar el menú de filtro al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showFilterMenu && !event.target.closest(".filter-container")) {
        setShowFilterMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterMenu]);

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
            "*, usuario!inner(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil, estatuto, idinstitucion, urlAvatar)"
          )
          .eq("usuario.idinstitucion", universityId);
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
            await Promise.all(
              data.map(async (item, idx) => {
                // Get avatar URL if exists, otherwise use default UserCircle
                let avatarElement;
                if (item.usuario.urlAvatar) {
                  const avatarUrl = supabase.storage
                    .from("publico")
                    .getPublicUrl(item.usuario.urlAvatar);
                  console.log(
                    "Avatar URL:",
                    avatarUrl,
                    "el src es:",
                    item.usuario.urlAvatar
                  );

                  avatarElement = (
                    <img
                      src={avatarUrl.data.publicUrl}
                      alt="Avatar usuario"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#fff",
                      }}
                    />
                  );
                } else {
                  avatarElement = <UserCircle size={40} color="#3B82F6" />;
                }

                // Get documents for this user
                const documentos = await supabase
                  .from("urllmgdocumentousuario")
                  .select("nombredocumento, urllmgdocumento")
                  .eq("idusuario", item.idusuario);

                console.log("Documents:", documentos);

                return {
                  id: item.idusuario,
                  name: item.usuario.nombrecompleto,
                  requestType: "Pasajero",
                  status: item.estadopasajero,
                  avatar: avatarElement,
                  documentos: documentos.data,
                  details: {
                    fullName: item.usuario.nombrecompleto,
                    studentCode: item.usuario.codigoestudiantil,
                    statuto: item.usuario.estatuto,
                    institutionalEmail: emails[idx],
                    address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                    phoneNumber: item.usuario.telefono,
                  },
                };
              })
            )
          );
        }
      } else {
        // activeTab === 'Conductores'
        const { data, error } = await supabase
          .from("conductor")
          .select(
            `
            *,
            usuario!inner(nombrecompleto, edad, telefono, calle, numerocasa, ciudad, codigoestudiantil, estatuto, idinstitucion, urlAvatar),
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
          .eq("usuario.idinstitucion", universityId);

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
            await Promise.all(
              data.map(async (item, idx) => {
                // Get avatar URL if exists, otherwise use default UserCircle
                let avatarElement;
                if (item.usuario.urlAvatar) {
                  const avatarUrl = supabase.storage
                    .from("publico")
                    .getPublicUrl(item.usuario.urlAvatar);
                  console.log("Avatar URL:", avatarUrl);
                  avatarElement = (
                    <img
                      src={avatarUrl.data.publicUrl}
                      alt="Avatar usuario"
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        objectFit: "cover",
                        background: "#fff",
                      }}
                    />
                  );
                } else {
                  avatarElement = <UserCircle size={40} color="#3B82F6" />;
                }

                // Get documents for this user
                const documentos = await supabase
                  .from("urllmgdocumentousuario")
                  .select("nombredocumento, urllmgdocumento")
                  .eq("idusuario", item.idusuario);

                const documentosVehiculo = await supabase
                  .from("urllmgdocumentovehiculo")
                  .select("nombredocumento, urllmgdocumento")
                  .eq("idvehiculo", item.vehiculo.idvehiculo);

                return {
                  id: item.idusuario,
                  name: item.usuario.nombrecompleto,
                  requestType: "Conductor",
                  status: item.estadoconductor,
                  avatar: avatarElement,
                  documentos: documentos.data,
                  documentosVehiculo: documentosVehiculo.data,
                  details: {
                    fullName: item.usuario.nombrecompleto,
                    studentCode: item.usuario.codigoestudiantil,
                    statuto: item.usuario.estatuto || "No hay",
                    institutionalEmail: emails[idx],
                    address: `${item.usuario.calle} #${item.usuario.numerocasa}, ${item.usuario.ciudad}`,
                    phoneNumber: item.usuario.telefono,
                    licenseNumber: item.numerodelicencia || "No hay",
                    vehicle: item.vehiculo
                      ? {
                          color: item.vehiculo.color,
                          numeroasientos: item.vehiculo.numeroasientos,
                          modelo: item.vehiculo.modelo,
                          marca: item.vehiculo.marca,
                          placa:
                            item.vehiculo.vehiculopesado?.[0]?.placa || "N/A",
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
                };
              })
            )
          );
        }
      }
    };
    fetchRequests();
  }, [activeTab, isUniversityActive, universityId, statusFilter]);

  // Handlers
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setStatusFilter("todos"); // Reset filter when changing tabs
    setOpenMenuId(null); // Close any open menus when changing tabs
  };

  const handleSearchChange = (e) => setSearchTerm(e.target.value);

  const toggleActionMenu = (id) => setOpenMenuId(openMenuId === id ? null : id);

  const handleDownloadDocument = async (documentPath) => {
    console.log("Downloading document:", documentPath);
    const { data, error } = await supabase.storage
      .from("documentos")
      .download(documentPath);

    if (error) {
      console.error("Error downloading document:", error);
      return;
    }

    const url = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = url;
    link.download = documentPath.split("/").pop();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url); // Limpia el objeto URL
  };

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
      // Update the status in the local state instead of removing
      const newStatus = confirmAction === "accept" ? "activo" : "inactivo";
      setRequests((prev) =>
        prev.map((r) =>
          r.id === confirmUserId ? { ...r, status: newStatus } : r
        )
      );
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

  const filtered = requests.filter((r) => {
    // Filtro por búsqueda de texto
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.details.studentCode &&
        r.details.studentCode.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por estado
    const matchesStatus = statusFilter === "todos" || r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === "activo") return "var(--text-green-600)";
    if (status === "inactivo") return "var(--text-red-600)";
    if (status === "pendiente") return "var(--text-blue-600)";
    return "var(--text-gray-color)";
  };

  const getStatusIcon = (status) => {
    if (status === "activo") return <CheckCircle2 size={20} />;
    if (status === "inactivo") return <XCircle size={20} />;
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
            GESTIÓN DE USUARIOS DE <span>UGÜEE</span> UNIVALE
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
            <div className="filter-container">
              <button onClick={toggleFilterMenu} className="filter-button">
                <Filter size={18} />
                {getFilterLabel()}
              </button>

              {showFilterMenu && (
                <div className="filter-menu">
                  <div
                    onClick={() => handleFilterChange("todos")}
                    className={`filter-menu-item todos ${
                      statusFilter === "todos" ? "active" : ""
                    }`}
                  >
                    Todos
                  </div>
                  <div
                    onClick={() => handleFilterChange("pendiente")}
                    className={`filter-menu-item pendiente ${
                      statusFilter === "pendiente" ? "active" : ""
                    }`}
                  >
                    Pendientes
                  </div>
                  <div
                    onClick={() => handleFilterChange("activo")}
                    className={`filter-menu-item activo ${
                      statusFilter === "activo" ? "active" : ""
                    }`}
                  >
                    Activos
                  </div>
                  <div
                    onClick={() => handleFilterChange("inactivo")}
                    className={`filter-menu-item inactivo ${
                      statusFilter === "inactivo" ? "active" : ""
                    }`}
                  >
                    Denegados
                  </div>
                </div>
              )}
            </div>
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
                  <div className="request-actions">
                    <div
                      className="request-status"
                      style={{ color: getStatusColor(request.status) }}
                    >
                      {request.status === "activo"
                        ? "Activo"
                        : request.status === "pendiente"
                        ? "Pendiente"
                        : request.status === "inactivo"
                        ? "Denegado"
                        : request.status}
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
                          {request.status === "pendiente" && (
                            <>
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
                            </>
                          )}
                          {request.status === "activo" && (
                            <div
                              className="action-menu-item deny"
                              onClick={() => handleDenyUser(request.id)}
                            >
                              <X size={16} /> Desactivar usuario
                            </div>
                          )}
                          {request.status === "inactivo" && (
                            <div
                              className="action-menu-item accept"
                              onClick={() => handleAcceptUser(request.id)}
                            >
                              <Check size={16} /> Activar usuario
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p>No hay usuarios que coincidan con los filtros aplicados.</p>
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
                  <div className="detail-item" style={{ gridColumn: "1/-1" }}>
                    <strong>Documentos</strong>
                    <div className="documents-container">
                      {selectedRequest.documentos &&
                      selectedRequest.documentos.length > 0 ? (
                        selectedRequest.documentos.map((doc, idx) => (
                          <div key={idx} className="document-item">
                            <span className="document-name">
                              {doc.nombredocumento}
                            </span>
                            <button
                              onClick={() =>
                                handleDownloadDocument(doc.urllmgdocumento)
                              }
                              className="modal-document-button document-button"
                              title="Descargar documento"
                            >
                              <Download size={15} />
                            </button>
                          </div>
                        ))
                      ) : (
                        <span className="no-documents">No hay documentos</span>
                      )}
                    </div>
                  </div>

                  {selectedRequest.requestType === "Conductor" &&
                    selectedRequest.details.vehicle && (
                      <div className="detail-item full-width">
                        <strong
                          onClick={() =>
                            setShowVehicleDetails(!showVehicleDetails)
                          }
                          className="vehicle-header"
                        >
                          Información del Vehículo{" "}
                          <ChevronDown
                            size={18}
                            className={`vehicle-chevron ${
                              showVehicleDetails ? "expanded" : ""
                            }`}
                          />
                        </strong>
                        {showVehicleDetails && (
                          <div className="vehicle-details-container">
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

                        {/* Documentos del Vehículo */}
                        <div style={{ marginTop: "20px" }}>
                          <strong>Documentos del Vehículo</strong>
                          <div className="documents-container">
                            {selectedRequest.documentosVehiculo &&
                            selectedRequest.documentosVehiculo.length > 0 ? (
                              selectedRequest.documentosVehiculo.map(
                                (doc, idx) => (
                                  <div key={idx} className="document-item">
                                    <span className="document-name">
                                      {doc.nombredocumento}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleDownloadDocument(
                                          doc.urllmgdocumento
                                        )
                                      }
                                      className="modal-document-button document-button"
                                      title="Descargar documento del vehículo"
                                    >
                                      <Download size={15} />
                                    </button>
                                  </div>
                                )
                              )
                            ) : (
                              <span className="no-documents">
                                No hay documentos del vehículo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                </div>
                <div className="modal-actions">
                  {selectedRequest.status === "pendiente" && (
                    <>
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
                    </>
                  )}
                  {selectedRequest.status === "activo" && (
                    <button
                      className="modal-action-button deny"
                      onClick={() => handleDenyUser(selectedRequest.id)}
                    >
                      <X size={20} /> Desactivar
                    </button>
                  )}
                  {selectedRequest.status === "inactivo" && (
                    <button
                      className="modal-action-button accept"
                      onClick={() => handleAcceptUser(selectedRequest.id)}
                    >
                      <Check size={20} /> Activar
                    </button>
                  )}
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
                  {confirmAction === "accept"
                    ? selectedRequest?.status === "inactivo"
                      ? "activar"
                      : "aceptar"
                    : selectedRequest?.status === "activo"
                    ? "desactivar"
                    : "denegar"}{" "}
                  este usuario?
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
                    {confirmAction === "accept"
                      ? selectedRequest?.status === "inactivo"
                        ? "Activar"
                        : "Aceptar"
                      : selectedRequest?.status === "activo"
                      ? "Desactivar"
                      : "Denegar"}
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
