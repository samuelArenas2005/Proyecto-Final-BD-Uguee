import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Check,
  X,
  Building2,
  Download,
} from "lucide-react";
import { supabase } from "../../supabaseClient.js";
import "./adminPage.css";

const AdminPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [universities, setUniversities] = useState([]);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [selectedUniversity, setSelectedUniversity] = useState(null);
  const [selectedUniversityHistory, setSelectedUniversityHistory] =
    useState(null);
  const [historialData, setHistorialData] = useState([]);
  const [observacion, setObservacion] = useState("");
  const [observacionError, setObservacionError] = useState(false);
  const [adminid, setAdminid] = useState(null);

  useEffect(() => {
    const getAdminId = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Error fetching user data:", error);
        return;
      }
      console.log("User data:", data.user.id);
      setAdminid(data.user.id);
    };

    getAdminId();
  }, []);

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

  useEffect(() => {
    const fetchUniversities = async () => {
      const { data, error } = await supabase.from("institucion").select("*");

      if (error) {
        console.error("Error fetching universities:", error);
        setUniversities([]);
      } else {
        const formattedUniversities = await Promise.all(
          data.map(async (uni) => {
            const logo = await supabase.storage
              .from("publico")
              .getPublicUrl(uni.urllmglogo);

            console.log("Logo URL:", logo, "\npath:", uni.urllmglogo);

            const documentos = await supabase
              .from("urldocumentoinstitucion")
              .select("nombredocumento,urldocumento")
              .eq("idinstitucion", uni.idinstitucion);

            console.log("Documents:", documentos);

            return {
              id: uni.idinstitucion,
              name: uni.nombre,
              requestType: `Sede: ${uni.sede}`,
              status: uni.estado,
              avatar: (
                <img
                  src={logo.data.publicUrl}
                  alt="Logo universidad"
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    background: "#fff",
                  }}
                />
              ),
              documentos: documentos.data,
              details: {
                nombre: uni.nombre,
                colorprincipal: uni.colorprincipal,
                colorsecundario: uni.colorsecundario,
                sede: uni.sede,
                address: `${uni.via_principal} #${uni.placa}, ${uni.ciudad}`,
                ciudad: uni.ciudad,
              },
            };
          })
        );
        setUniversities(formattedUniversities);
      }
    };

    fetchUniversities();
  }, []); // Cargar al montar el componente

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const toggleFilterMenu = () => {
    setShowFilterMenu(!showFilterMenu);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setShowFilterMenu(false);
  };

  const getFilterLabel = () => {
    switch (statusFilter) {
      case "activo":
        return "Activas";
      case "pendiente":
        return "Pendientes";
      case "denegado":
        return "Denegadas";
      default:
        return "Todas";
    }
  };

  const toggleActionMenu = (universityId) => {
    setOpenMenuId(openMenuId === universityId ? null : universityId);
  };

  const handleSubmit = async (universityId, estado) => {
    // Validar que la observación no esté vacía
    if (!observacion.trim()) {
      setObservacionError(true);
      return;
    }

    const { error } = await supabase
      .from("institucion")
      .update({ estado: estado })
      .eq("idinstitucion", universityId);

    if (!error) {
      // Actualizar el estado local en lugar de eliminar la universidad
      setUniversities((prev) =>
        prev.map((uni) =>
          uni.id === universityId ? { ...uni, status: estado } : uni
        )
      );

      // Actualizar también la universidad seleccionada si es la misma
      setSelectedUniversity((prev) =>
        prev && prev.id === universityId ? { ...prev, status: estado } : prev
      );

      closeDetailsModal();
    } else {
      console.error("Error updating university:", error);
      return;
    }

    const result = await supabase.from("administradorinstitucion").insert({
      idinstitucion: universityId,
      idadministrador: adminid,
      observacion: observacion,
      estadoasignado: estado,
    });

    console.log("Admin institution record:", result);
    if (result.error) {
      console.error("Error inserting admin institution record:", result.error);
      return;
    }
  };

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

  const fetchUniversityHistory = async (universityId) => {
    console.log("Fetching history for university ID:", universityId);

    const { data, error } = await supabase
      .from("administradorinstitucion")
      .select(
        `
        fecha,
        observacion,
        estadoasignado,
        administrador:idadministrador (
          nombre
        )
      `
      )
      .eq("idinstitucion", universityId)
      .order("fecha", { ascending: false });

    if (error) {
      console.error("Error fetching university history:", error);
      setHistorialData([]);
    } else {
      console.log("University history data:", data);
      setHistorialData(data);
    }
  };

  const openDetailsModal = (university) => {
    setSelectedUniversity(university);
    setOpenMenuId(null);
  };

  const openHistoryModal = (university) => {
    setSelectedUniversityHistory(university);
    setOpenMenuId(null);
    // Llamar a la función para obtener el historial
    fetchUniversityHistory(university.id);
  };

  const closeDetailsModal = () => {
    setSelectedUniversity(null);
    setObservacion("");
    setObservacionError(false);
  };

  const closeHistoryModal = () => {
    setSelectedUniversityHistory(null);
    setHistorialData([]);
  };

  const filteredUniversities = universities.filter((uni) => {
    // Filtro por búsqueda de texto
    const matchesSearch =
      uni.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (uni.details.ciudad &&
        uni.details.ciudad.toLowerCase().includes(searchTerm.toLowerCase()));

    // Filtro por estado
    const matchesStatus =
      statusFilter === "todos" || uni.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    if (status === "activo") return "var(--text-green-600)";
    if (status === "denegado") return "var(--text-red-600)";
    if (status === "pendiente") return "var(--text-blue-600)";
    return "var(--text-gray-color)";
  };

  const getStatusIcon = (status) => {
    if (status === "activo")
      return <CheckCircle2 size={20} className="status-icon" />;
    if (status === "denegado")
      return <XCircle size={20} className="status-icon" />;
    return null;
  };

  return (
    <div className="universidad-page">
      <h1 className="page-title">
        UNIVERSIDADES CON SOLICITUDES DE INGRESO A <span>UGÜEE</span>
      </h1>

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
                Todo
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
                Activas
              </div>
              <div
                onClick={() => handleFilterChange("denegado")}
                className={`filter-menu-item denegado ${
                  statusFilter === "denegado" ? "active" : ""
                }`}
              >
                Denegadas
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="requests-list">
        {filteredUniversities.length > 0 ? (
          filteredUniversities.map((university) => (
            <div key={university.id} className="request-card">
              <div className="request-info">
                <div className="avatar-icon">{university.avatar}</div>
                <div className="request-details">
                  <span className="request-name">{university.name}</span>
                  <span className="request-type">{university.requestType}</span>
                </div>
              </div>
              <div className="request-actions">
                <div
                  className="request-status"
                  style={{ color: getStatusColor(university.status) }}
                >
                  {university.status === "activo"
                    ? "Activo"
                    : university.status === "pendiente"
                    ? "Pendiente"
                    : university.status === "denegado"
                    ? "Denegado"
                    : university.status}
                  {getStatusIcon(university.status)}
                </div>{" "}
                <div className="actions-menu-container">
                  <button
                    className="more-options-button"
                    onClick={() => toggleActionMenu(university.id)}
                  >
                    <MoreVertical size={24} />
                  </button>
                  {openMenuId === university.id && (
                    <div className="action-menu">
                      <div
                        className="action-menu-item"
                        onClick={() => openDetailsModal(university)}
                      >
                        Administrar
                      </div>
                      <div
                        className="action-menu-item"
                        onClick={() => openHistoryModal(university)}
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
          <p>
            {statusFilter === "todos"
              ? "No hay universidades disponibles."
              : `No hay universidades ${getFilterLabel().toLowerCase()}.`}
          </p>
        )}
      </div>

      {selectedUniversity && (
        <div
          className={`modal-overlay ${selectedUniversity ? "open" : ""}`}
          onClick={closeDetailsModal}
        >
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

            {/* --- SECCIÓN INFORMACIÓN --- */}
            <div className="modal-details-grid">
              <div className="detail-item">
                <strong>Nombre</strong>
                <span>{selectedUniversity.details.nombre}</span>
              </div>
              <div className="detail-item">
                <strong>Sede</strong>
                <span>{selectedUniversity.details.sede}</span>
              </div>
              <div className="detail-item">
                <strong>Dirección</strong>
                <span>{selectedUniversity.details.address}</span>
              </div>
              <div className="detail-item">
                <strong>Color Principal</strong>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{selectedUniversity.details.colorprincipal}</span>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor:
                        selectedUniversity.details.colorprincipal,
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  ></div>
                </div>
              </div>
              <div className="detail-item">
                <strong>Color Secundario</strong>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>{selectedUniversity.details.colorsecundario}</span>
                  <div
                    style={{
                      width: "20px",
                      height: "20px",
                      backgroundColor:
                        selectedUniversity.details.colorsecundario,
                      borderRadius: "4px",
                      border: "1px solid #ccc",
                    }}
                  ></div>
                </div>
              </div>
              <div className="detail-item">
                <strong>Estado</strong>
                <span>{selectedUniversity.status}</span>
              </div>
              <div className="detail-item" style={{ gridColumn: "1/-1" }}>
                <strong>Documentos de soporte</strong>
                <div
                  style={{
                    maxHeight: "120px",
                    overflowY: "auto",
                    border: "1px solid #eee",
                    borderRadius: "6px",
                    padding: "8px",
                    marginTop: "6px",
                    background: "#fafbfc",
                  }}
                >
                  {selectedUniversity.documentos &&
                  selectedUniversity.documentos.length > 0 ? (
                    selectedUniversity.documentos.map((doc, idx) => (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 0",
                          borderBottom:
                            idx !== selectedUniversity.documentos.length - 1
                              ? "1px solid #eee"
                              : "none",
                        }}
                      >
                        <span style={{ fontSize: "0.75em", color: "#222" }}>
                          {doc.nombredocumento}
                        </span>
                        <button
                          onClick={() =>
                            handleDownloadDocument(doc.urldocumento)
                          }
                          className="modal-document-button"
                          style={{
                            padding: "4px",
                          }}
                          title="Descargar documento"
                        >
                          <Download size={15} />
                        </button>
                      </div>
                    ))
                  ) : (
                    <span style={{ color: "#888", fontSize: "0.95em" }}>
                      No hay documentos
                    </span>
                  )}
                </div>
              </div>
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
                  border: observacionError ? "1px solid red" : "1px solid #ccc",
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
              <button
                className={`modal-action-button deny ${
                  !observacion.trim() ||
                  selectedUniversity.status === "denegado"
                    ? "disabled"
                    : ""
                }`}
                onClick={() =>
                  !observacion.trim() ||
                  selectedUniversity.status === "denegado"
                    ? null
                    : handleSubmit(selectedUniversity.id, "denegado")
                }
                style={{
                  opacity:
                    !observacion.trim() ||
                    selectedUniversity.status === "denegado"
                      ? 0.5
                      : 1,
                  cursor:
                    !observacion.trim() ||
                    selectedUniversity.status === "denegado"
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={
                  !observacion.trim() ||
                  selectedUniversity.status === "denegado"
                }
                title={
                  selectedUniversity.status === "denegado"
                    ? "Esta universidad ya está denegada"
                    : ""
                }
              >
                <X size={20} /> Denegar
              </button>
              <button
                className={`modal-action-button accept ${
                  !observacion.trim() || selectedUniversity.status === "activo"
                    ? "disabled"
                    : ""
                }`}
                onClick={() =>
                  !observacion.trim() || selectedUniversity.status === "activo"
                    ? null
                    : handleSubmit(selectedUniversity.id, "activo")
                }
                style={{
                  opacity:
                    !observacion.trim() ||
                    selectedUniversity.status === "activo"
                      ? 0.5
                      : 1,
                  cursor:
                    !observacion.trim() ||
                    selectedUniversity.status === "activo"
                      ? "not-allowed"
                      : "pointer",
                }}
                disabled={
                  !observacion.trim() || selectedUniversity.status === "activo"
                }
                title={
                  selectedUniversity.status === "activo"
                    ? "Esta universidad ya está activa"
                    : ""
                }
              >
                <Check size={20} /> Admitir
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedUniversityHistory && (
        <div
          className={`modal-overlay ${selectedUniversityHistory ? "open" : ""}`}
          onClick={closeHistoryModal}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-button" onClick={closeHistoryModal}>
              <X size={28} />
            </button>
            <div className="modal-header">
              <div className="modal-avatar">
                {selectedUniversityHistory.avatar}
              </div>
              <div className="modal-user-info">
                <h2>Historial - {selectedUniversityHistory.name}</h2>
                <p>{selectedUniversityHistory.requestType}</p>
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
                            Administrador:{" "}
                            {record.administrador?.nombre || "N/A"}
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
                  <p>No hay historial disponible para esta universidad</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
