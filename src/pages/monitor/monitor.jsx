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
import "../universidad/universidad.css";
import NotActive from "../universidad/components/NotActive";

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
  const [universityName, setUniversityName] = useState(""); // Nuevo estado para el nombre de la universidad
  const [observacion, setObservacion] = useState("");
  const [observacionError, setObservacionError] = useState(false);
  const [monitorId, setMonitorId] = useState(null);
  const [selectedUserHistory, setSelectedUserHistory] = useState(null);
  const [historialData, setHistorialData] = useState([]);

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
      case "denegado":
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

        const { data: monitorData, error: monitorError } = await supabase
          .from("monitor")
          .select("idinstitucion")
          .eq("idmonitor", user.id);

        console.log("Monitor data:", monitorData);
        const idinstitucion = monitorData?.[0]?.idinstitucion;

        // Check if user is a university and get its status
        const { data: universityData, error: universityError } = await supabase
          .from("institucion")
          .select("idinstitucion, estado, nombre")
          .eq("idinstitucion", idinstitucion)
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
        setUniversityName(universityData.nombre || "Universidad");
        setIsUniversityActive(universityData.estado === "activo");
        setMonitorId(user.id);
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

  const fetchUserHistory = async (userId) => {
    console.log("Fetching history for user ID:", userId);

    const { data, error } = await supabase
      .from("monitorusuario")
      .select(
        `
        fecha,
        observacion,
        estadoasignado,
        tipoasignacion,
        monitor:idmonitor(nombrecompleto)
      `
      )
      .eq("idusuario", userId)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching user history:", error);
      setHistorialData([]);
    } else {
      console.log("User history data:", data);
      setHistorialData(data);
    }
  };

  const changeStateUser = async (id, accept) => {
    // Validar que la observación no esté vacía
    if (!observacion.trim()) {
      setObservacionError(true);
      return false;
    }

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

    const newStatus = accept ? "activo" : "denegado";

    const { error } = await supabase
      .from(tableName)
      .update({ [statusColumn]: newStatus })
      .eq(userIdColumn, id);

    if (error) {
      console.error("Error changing user state:", error);
      return false;
    }

    // Guardar la observación en la tabla correspondiente
    const result = await supabase.from("monitorusuario").insert({
      idusuario: id,
      idmonitor: monitorId,
      observacion: observacion,
      estadoasignado: newStatus,
      tipoasignacion: activeTab === "Pasajeros" ? "pasajero" : "conductor",
    });

    console.log("Monitor user record:", result);
    if (result.error) {
      console.error("Error inserting monitor user record:", result.error);
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
      const newStatus = confirmAction === "accept" ? "activo" : "denegado";
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
    setObservacion("");
    setObservacionError(false);
  };

  const handleAcceptUser = (id) => {
    setShowConfirmModal(true);
    setConfirmAction("accept");
    setConfirmUserId(id);
    setOpenMenuId(null); // Close the action menu
    setObservacionError(false); // Reset error state
  };

  const handleDenyUser = (id) => {
    setShowConfirmModal(true);
    setConfirmAction("deny");
    setConfirmUserId(id);
    setOpenMenuId(null); // Close the action menu
    setObservacionError(false); // Reset error state
  };

  const openDetailsModal = (req) => {
    setSelectedRequest(req);
    setOpenMenuId(null);
    setShowVehicleDetails(false); // Reset vehicle details visibility
  };

  const openHistoryModal = (user) => {
    setSelectedUserHistory(user);
    setOpenMenuId(null);
    // Llamar a la función para obtener el historial
    fetchUserHistory(user.id);
  };

  const closeDetailsModal = () => {
    setSelectedRequest(null);
    setObservacion("");
    setObservacionError(false);
  };

  const closeHistoryModal = () => {
    setSelectedUserHistory(null);
    setHistorialData([]);
  };

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
    if (status === "denegado") return "var(--text-red-600)";
    if (status === "pendiente") return "var(--text-blue-600)";
    return "var(--text-gray-color)";
  };

  const getStatusIcon = (status) => {
    if (status === "activo") return <CheckCircle2 size={20} />;
    if (status === "denegado") return <XCircle size={20} />;
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
            GESTIÓN DE USUARIOS DE <span>UGÜEE</span>{" "}
            {(universityName || "UNIVALE").toUpperCase()}
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
                    onClick={() => handleFilterChange("denegado")}
                    className={`filter-menu-item denegado ${
                      statusFilter === "denegado" ? "active" : ""
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
                        : request.status === "denegado"
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
                          <div
                            className="action-menu-item"
                            onClick={() => openHistoryModal(request)}
                          >
                            Historial
                          </div>
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

                {/* --- SEPARADOR --- */}
                <hr
                  style={{
                    margin: "32px 0 18px 0",
                    border: 0,
                    borderTop: "1px solid #eee",
                  }}
                />

                {/* --- SECCIÓN ADMINISTRAR --- */}
                <div className="detail-item" style={{ marginBottom: 0 }}>
                  <strong>
                    Observación <span style={{ color: "red" }}>*</span>
                  </strong>
                  <textarea
                    value={observacion}
                    onChange={(e) => {
                      setObservacion(e.target.value);
                      setObservacionError(false);
                    }}
                    placeholder="Escribe una observación..."
                    rows={3}
                    style={{
                      width: "100%",
                      border: observacionError
                        ? "1px solid red"
                        : "1px solid #ccc",
                      borderRadius: "6px",
                      padding: "8px",
                      marginTop: "6px",
                      resize: "vertical",
                    }}
                    required
                  />
                  {observacionError && (
                    <span style={{ color: "red", fontSize: "0.9em" }}>
                      La observación es obligatoria.
                    </span>
                  )}
                </div>

                <div className="modal-actions">
                  {selectedRequest.status === "pendiente" && (
                    <>
                      <button
                        className={`modal-action-button deny ${
                          !observacion.trim() ? "disabled" : ""
                        }`}
                        onClick={() =>
                          !observacion.trim()
                            ? null
                            : handleDenyUser(selectedRequest.id)
                        }
                        style={{
                          opacity: !observacion.trim() ? 0.5 : 1,
                          cursor: !observacion.trim()
                            ? "not-allowed"
                            : "pointer",
                        }}
                        disabled={!observacion.trim()}
                      >
                        <X size={20} /> Denegar
                      </button>
                      <button
                        className={`modal-action-button accept ${
                          !observacion.trim() ? "disabled" : ""
                        }`}
                        onClick={() =>
                          !observacion.trim()
                            ? null
                            : handleAcceptUser(selectedRequest.id)
                        }
                        style={{
                          opacity: !observacion.trim() ? 0.5 : 1,
                          cursor: !observacion.trim()
                            ? "not-allowed"
                            : "pointer",
                        }}
                        disabled={!observacion.trim()}
                      >
                        <Check size={20} /> Admitir
                      </button>
                    </>
                  )}
                  {selectedRequest.status === "activo" && (
                    <button
                      className={`modal-action-button deny ${
                        !observacion.trim() ? "disabled" : ""
                      }`}
                      onClick={() =>
                        !observacion.trim()
                          ? null
                          : handleDenyUser(selectedRequest.id)
                      }
                      style={{
                        opacity: !observacion.trim() ? 0.5 : 1,
                        cursor: !observacion.trim() ? "not-allowed" : "pointer",
                      }}
                      disabled={!observacion.trim()}
                    >
                      <X size={20} /> Desactivar
                    </button>
                  )}
                  {selectedRequest.status === "denegado" && (
                    <button
                      className={`modal-action-button accept ${
                        !observacion.trim() ? "disabled" : ""
                      }`}
                      onClick={() =>
                        !observacion.trim()
                          ? null
                          : handleAcceptUser(selectedRequest.id)
                      }
                      style={{
                        opacity: !observacion.trim() ? 0.5 : 1,
                        cursor: !observacion.trim() ? "not-allowed" : "pointer",
                      }}
                      disabled={!observacion.trim()}
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
                    ? selectedRequest?.status === "denegado"
                      ? "activar"
                      : "aceptar"
                    : selectedRequest?.status === "activo"
                    ? "desactivar"
                    : "denegar"}{" "}
                  este usuario?
                </h3>
                <div className="confirm-modal-actions">
                  <button
                    onClick={() => {
                      setShowConfirmModal(false);
                      setObservacion("");
                      setObservacionError(false);
                    }}
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
                      ? selectedRequest?.status === "denegado"
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

          {selectedUserHistory && (
            <div
              className={`modal-overlay ${selectedUserHistory ? "open" : ""}`}
              onClick={closeHistoryModal}
            >
              <div
                className="modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  className="modal-close-button"
                  onClick={closeHistoryModal}
                >
                  <X size={28} />
                </button>
                <div className="modal-header">
                  <div className="modal-avatar">
                    {selectedUserHistory.avatar}
                  </div>
                  <div className="modal-user-info">
                    <h2>Historial - {selectedUserHistory.name}</h2>
                    <p>{selectedUserHistory.requestType}</p>
                  </div>
                </div>

                <div style={{ padding: "20px" }}>
                  {historialData && historialData.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "15px",
                        maxHeight: "400px",
                        overflowY: "auto",
                      }}
                    >
                      {historialData.map((record, index) => (
                        <div
                          key={index}
                          style={{
                            backgroundColor: "var(--background-gray-50)",
                            border: "1px solid var(--border-gray-200)",
                            borderRadius: "8px",
                            padding: "15px",
                            boxShadow: "0 2px 4px var(--shadow-color)",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                              marginBottom: "10px",
                            }}
                          >
                            <div>
                              <strong
                                style={{
                                  color: "var(--text-gray-medium-color)",
                                  fontSize: "14px",
                                }}
                              >
                                {record.monitor?.nombrecompleto
                                  ? `Monitor: ${record.monitor.nombrecompleto}`
                                  : "Cambio de datos"}
                              </strong>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <span
                                style={{
                                  fontSize: "12px",
                                  color: "var(--text-gray-color)",
                                }}
                              >
                                {new Date(record.fecha).toLocaleDateString(
                                  "es-ES",
                                  {
                                    year: "numeric",
                                    month: "long",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )}
                              </span>
                            </div>
                          </div>

                          <div style={{ marginBottom: "8px" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "4px 8px",
                                borderRadius: "4px",
                                fontSize: "12px",
                                fontWeight: "500",
                                backgroundColor:
                                  record.estadoasignado === "activo"
                                    ? "var(--text-green-600)"
                                    : record.estadoasignado === "denegado"
                                    ? "var(--text-red-600)"
                                    : "var(--text-blue-600)",
                                color: "white",
                              }}
                            >
                              {record.estadoasignado === "activo"
                                ? "Aprobado"
                                : record.estadoasignado === "denegado"
                                ? "Denegado"
                                : record.estadoasignado}
                            </span>
                            <span
                              style={{
                                marginLeft: "8px",
                                fontSize: "12px",
                                backgroundColor: "var(--text-blue-100)",
                                color: "var(--text-blue-600)",
                                padding: "2px 6px",
                                borderRadius: "3px",
                                textTransform: "capitalize",
                              }}
                            >
                              {record.tipoasignacion}
                            </span>
                          </div>

                          <div style={{ marginTop: "8px" }}>
                            <strong
                              style={{
                                fontSize: "13px",
                                color: "var(--text-gray-color)",
                              }}
                            >
                              Observación:
                            </strong>
                            <p
                              style={{
                                margin: "4px 0 0 0",
                                fontSize: "14px",
                                color: "var(--text-gray-medium-color)",
                                lineHeight: "1.4",
                              }}
                            >
                              {record.observacion || "Sin observaciones"}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "40px",
                        color: "var(--text-gray-color)",
                      }}
                    >
                      <p>No hay historial disponible para este usuario</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default UniversidadPage;
