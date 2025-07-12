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
  // Core state variables
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [isUniversityActive, setIsUniversityActive] = useState(null); // null = loading, true = active, false = not active
  const [universityId, setUniversityId] = useState(null);
  const [universityStatus, setUniversityStatus] = useState(null);
  const [universityName, setUniversityName] = useState(null);

  // User data state - replacing legacy requests state
  const [users, setUsers] = useState([]);

  // UI state
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmUserId, setConfirmUserId] = useState(null);
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
      case "monitores":
        return "Monitores";
      case "monitores-activos":
        return "Monitores Activos";
      case "monitores-inactivos":
        return "Monitores Inactivos";
      case "usuarios":
        return "Usuarios";
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
      // Cierra el menú de acciones si se hace clic fuera
      if (openMenuId && !event.target.closest(".actions-menu-container")) {
        setOpenMenuId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showFilterMenu, openMenuId]);

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
          .select("idinstitucion, estado, nombre")
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
        setUniversityName(universityData.nombre || "Universidad");
        setIsUniversityActive(universityData.estado === "activo");
      } catch (error) {
        console.error("Error checking university status:", error);
        setIsUniversityActive(false);
      }
    };

    checkUniversityStatus();
  }, []);

  useEffect(() => {
    const fetchUsers = async () => {
      // Only fetch users if university is active and we have the university ID
      if (!isUniversityActive || !universityId) return;

      // Fetch all users from this university
      const { data, error } = await supabase
        .from("usuario")
        .select("*")
        .eq("idinstitucion", universityId);

      console.log("Fetched users:", data);

      if (error) {
        console.error("Error fetching users:", error);
        setUsers([]);
        return;
      }

      if (!data || data.length === 0) {
        setUsers([]);
        return;
      }

      // Get emails for all users
      const emailPromises = data.map(async (item) => {
        const { data: emailUsuario, error: errEmail } = await supabase.rpc(
          "get_user_email_by_id",
          { p_user_id: item.idusuario }
        );
        if (errEmail) {
          console.error("Error fetching email:", errEmail);
          return "No disponible";
        }
        return emailUsuario && emailUsuario.length > 0
          ? emailUsuario[0].email
          : "No disponible";
      });

      const emails = await Promise.all(emailPromises);

      // Map users to request format
      const mappedUsers = await Promise.all(
        data.map(async (item, idx) => {
          // Get avatar URL if exists, otherwise use default UserCircle
          let avatarElement;
          if (item.urlAvatar) {
            const avatarUrl = supabase.storage
              .from("publico")
              .getPublicUrl(item.urlAvatar);

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
            .eq("idusuario", item.nidentificacion);

          // Check if user is a monitor and get their status
          const { data: monitorData, error: monitorError } = await supabase
            .from("monitor")
            .select("estado")
            .eq("idmonitor", item.nidentificacion)
            .single();

          let isMonitor = false;
          let monitorStatus = null;

          if (!monitorError && monitorData) {
            isMonitor = true;
            monitorStatus = monitorData.estado;
            console.log(
              `User ${item.nombrecompleto} is a monitor with status: ${monitorStatus}`
            );
          } else if (monitorError && monitorError.code !== "PGRST116") {
            // PGRST116 is "no rows returned" which is expected if user is not a monitor
            console.error("Error checking monitor status:", monitorError);
          }

          return {
            id: item.nidentificacion,
            name: item.nombrecompleto,
            status: item.estado,
            avatar: avatarElement,
            documentos: documentos.data || [],
            isMonitor: isMonitor,
            monitorStatus: monitorStatus,
            details: {
              fullName: item.nombrecompleto,
              studentCode: item.codigoestudiantil,
              institutionalEmail: emails[idx],
              address: `${item.calle} #${item.numerocasa}, ${item.ciudad}`,
              estatuto: item.estatuto,
              phoneNumber: item.telefono,
              age: item.edad,
            },
          };
        })
      );

      setUsers(mappedUsers);
    };

    fetchUsers();
  }, [isUniversityActive, universityId, statusFilter]);

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

  const assignUserAsMonitor = async (user) => {
    try {
      console.log("Assigning user as monitor:", user);

      if (user.isMonitor) {
        // Si ya es monitor pero está inactivo, reactivarlo
        const { data, error } = await supabase
          .from("monitor")
          .update({ estado: "activo" })
          .eq("idmonitor", user.id);

        if (error) {
          console.error("Error reactivating monitor:", error);
          alert("Error al reactivar como monitor: " + error.message);
          return false;
        }

        console.log("Monitor successfully reactivated:", data);
        alert(`${user.name} ha sido reactivado como monitor exitosamente.`);
      } else {
        // Si no es monitor, crear nuevo registro
        const { data, error } = await supabase.from("monitor").insert({
          idmonitor: user.id, // UUID del usuario
          idinstitucion: universityId, // ID de la institución
          nombrecompleto: user.name, // Nombre completo del usuario
          estado: "activo", // Estado activo
        });

        if (error) {
          console.error("Error assigning user as monitor:", error);
          alert("Error al asignar como monitor: " + error.message);
          return false;
        }

        console.log("User successfully assigned as monitor:", data);
        alert(`${user.name} ha sido asignado como monitor exitosamente.`);
      }

      closeDetailsModal(); // Cerrar el modal

      // Actualizar la lista de usuarios para reflejar el cambio
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isMonitor: true, monitorStatus: "activo" }
            : u
        )
      );

      return true;
    } catch (error) {
      console.error("Error in assignUserAsMonitor:", error);
      alert("Error inesperado al asignar como monitor");
      return false;
    }
  };

  const deactivateMonitor = async (user) => {
    try {
      console.log("Deactivating monitor:", user);

      // Desactivar monitor existente
      const { data, error } = await supabase
        .from("monitor")
        .update({ estado: "inactivo" })
        .eq("idmonitor", user.id);

      if (error) {
        console.error("Error deactivating monitor:", error);
        alert("Error al desactivar monitor: " + error.message);
        return false;
      }

      console.log("Monitor successfully deactivated:", data);
      alert(`${user.name} ha sido desactivado como monitor exitosamente.`);

      closeDetailsModal(); // Cerrar el modal

      // Actualizar la lista de usuarios para reflejar el cambio
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, isMonitor: true, monitorStatus: "inactivo" }
            : u
        )
      );

      return true;
    } catch (error) {
      console.error("Error in deactivateMonitor:", error);
      alert("Error inesperado al desactivar monitor");
      return false;
    }
  };

  const changeStateUser = async (id, accept) => {
    // Update user status in the usuario table
    const { error } = await supabase
      .from("usuario")
      .update({ estado: accept ? "activo" : "inactivo" })
      .eq("idusuario", id);

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
      setUsers((prev) =>
        prev.map((user) =>
          user.id === confirmUserId ? { ...user, status: newStatus } : user
        )
      );
      closeDetailsModal(); // Close the main details modal
    }
    setShowConfirmModal(false);
    setConfirmAction(null);
    setConfirmUserId(null);
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

  const closeDetailsModal = () => setSelectedRequest(null);

  const closeHistoryModal = () => {
    setSelectedUserHistory(null);
    setHistorialData([]);
  };

  const filtered = users.filter((user) => {
    // Filtro por búsqueda de texto
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.details.studentCode &&
        user.details.studentCode
          .toLowerCase()
          .includes(searchTerm.toLowerCase()));

    // Filtro por tipo de usuario
    let matchesFilter = true;

    switch (statusFilter) {
      case "usuarios":
        matchesFilter = !user.isMonitor;
        break;
      case "monitores":
        matchesFilter = user.isMonitor;
        break;
      case "monitores-activos":
        matchesFilter = user.isMonitor && user.monitorStatus === "activo";
        break;
      case "monitores-inactivos":
        matchesFilter = user.isMonitor && user.monitorStatus === "inactivo";
        break;
      case "todos":
      default:
        matchesFilter = true;
        break;
    }

    return matchesSearch && matchesFilter;
  });

  console.log("Filtered users:", filtered);

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
            {(universityName || "INSTITUCION").toUpperCase()}
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
                    onClick={() => handleFilterChange("usuarios")}
                    className={`filter-menu-item usuarios ${
                      statusFilter === "usuarios" ? "active" : ""
                    }`}
                  >
                    Usuarios
                  </div>
                  <div
                    onClick={() => handleFilterChange("monitores")}
                    className={`filter-menu-item monitores ${
                      statusFilter === "monitores" ? "active" : ""
                    }`}
                  >
                    Monitores
                  </div>
                  <div
                    onClick={() => handleFilterChange("monitores-activos")}
                    className={`filter-menu-item monitores-activos ${
                      statusFilter === "monitores-activos" ? "active" : ""
                    }`}
                  >
                    Monitores Activos
                  </div>
                  <div
                    onClick={() => handleFilterChange("monitores-inactivos")}
                    className={`filter-menu-item monitores-inactivos ${
                      statusFilter === "monitores-inactivos" ? "active" : ""
                    }`}
                  >
                    Monitores Inactivos
                  </div>
                </div>
              )}
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
                        {request.isMonitor
                          ? `Monitor ${
                              request.monitorStatus === "activo"
                                ? "Activo"
                                : "Inactivo"
                            }`
                          : "Usuario"}
                      </span>
                    </div>
                  </div>
                  <div className="request-actions">
                    <div className="actions-menu-container">
                      <button
                        className="more-options-button"
                        onClick={() => {
                          toggleActionMenu(request.id);
                        }}
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
                    <p>{selectedRequest.isMonitor ? "Monitor" : "Usuario"}</p>
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
                    <span>{selectedRequest.details.estatuto}</span>
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
                  <div className="detail-item">
                    <strong>Edad</strong>
                    <span>{selectedRequest.details.age} años</span>
                  </div>
                  {selectedRequest.isMonitor && (
                    <div className="detail-item">
                      <strong>Estado como Monitor</strong>
                      <span
                        style={{
                          color:
                            selectedRequest.monitorStatus === "activo"
                              ? "var(--text-green-600)"
                              : "var(--text-red-600)",
                          fontWeight: "bold",
                        }}
                      >
                        {selectedRequest.monitorStatus === "activo"
                          ? "Monitor Activo"
                          : "Monitor Inactivo"}
                      </span>
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
                </div>
                <div className="modal-actions">
                  {(!selectedRequest.isMonitor ||
                    selectedRequest.monitorStatus !== "activo") && (
                    <button
                      className="modal-action-button accept"
                      onClick={() => assignUserAsMonitor(selectedRequest)}
                    >
                      <Plus size={20} />
                      {selectedRequest.isMonitor &&
                      selectedRequest.monitorStatus === "inactivo"
                        ? "Reactivar como Monitor"
                        : "Asignar como Monitor"}
                    </button>
                  )}
                  {selectedRequest.isMonitor &&
                    selectedRequest.monitorStatus === "activo" && (
                      <button
                        className="modal-action-button deny"
                        onClick={() => deactivateMonitor(selectedRequest)}
                      >
                        <X size={20} />
                        Desactivar Monitor
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
                    <p>Usuario</p>
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
