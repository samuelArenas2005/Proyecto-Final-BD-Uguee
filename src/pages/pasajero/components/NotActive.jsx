import React, { useState, useEffect } from "react";
import styles from "./NotActive.module.css";
import {
  AlertCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { supabase } from "../../../supabaseClient.js";

const NotActive = ({
  universityId,
  universityStatus,
  userId,
  userStatus,
  userType = "university",
}) => {
  const [historialData, setHistorialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      // Solo buscar historial para usuarios, no para universidades
      if (userType !== "user" || !userId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch user history only
        const result = await supabase
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

        if (result.error) {
          console.error("Error fetching user history:", result.error);
          setHistorialData([]);
        } else {
          setHistorialData(result.data || []);
        }
      } catch (error) {
        console.error("Error fetching user history:", error);
        setHistorialData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId, userType]);

  const getStatusInfo = () => {
    if (userType === "university") {
      if (universityStatus === "pendiente") {
        return {
          icon: <Clock size={64} className={styles.iconPending} />,
          title: "Universidad en Revisión",
          message:
            "Su universidad está siendo revisada por nuestro equipo de administradores.",
          submessage:
            "Le notificaremos tan pronto como tengamos una respuesta.",
          className: styles.pending,
        };
      } else if (universityStatus === "denegado") {
        return {
          icon: <XCircle size={64} className={styles.iconDenied} />,
          title: "Universidad No Aprobada",
          message: "Su universidad ha sido revisada y no ha sido aprobada.",
          submessage:
            "Puede revisar los comentarios del administrador a continuación o contactar soporte para más información.",
          className: styles.denied,
        };
      } else {
        return {
          icon: <AlertCircle size={64} className={styles.icon} />,
          title: "Universidad No Activa",
          message: "Su universidad aún no se encuentra activa en el sistema.",
          submessage:
            "Por favor, contacte al administrador de su universidad para más información.",
          className: "",
        };
      }
    } else {
      // User type
      if (userStatus === "pendiente") {
        return {
          icon: <Clock size={64} className={styles.iconPending} />,
          title: "Usuario en Revisión",
          message:
            "Su solicitud está siendo revisada por el monitor de su universidad.",
          submessage:
            "Le notificaremos tan pronto como tengamos una respuesta.",
          className: styles.pending,
        };
      } else if (userStatus === "denegado") {
        return {
          icon: <XCircle size={64} className={styles.iconDenied} />,
          title: "Usuario No Aprobado",
          message: "Su solicitud ha sido revisada y no ha sido aprobada.",
          submessage:
            "Puede revisar los comentarios del monitor a continuación o contactar al monitor de su universidad.",
          className: styles.denied,
        };
      } else {
        return {
          icon: <AlertCircle size={64} className={styles.icon} />,
          title: "Usuario No Activo",
          message:
            "Su cuenta de usuario aún no se encuentra activa en el sistema.",
          submessage:
            "Por favor, contacte al monitor de su universidad para más información.",
          className: "",
        };
      }
    }
  };

  const statusInfo = getStatusInfo();

  return (
    <div className={styles.container}>
      <div className={`${styles.card} ${statusInfo.className}`}>
        <div className={styles.iconContainer}>{statusInfo.icon}</div>
        <h1 className={styles.title}>{statusInfo.title}</h1>
        <p className={styles.message}>{statusInfo.message}</p>
        <p className={styles.submessage}>{statusInfo.submessage}</p>

        {/* Mostrar historial solo para usuarios (no para universidades) */}
        {userType === "user" &&
          (userStatus === "denegado" || userStatus === "pendiente") && (
            <div className={styles.historySection}>
              <button
                onClick={() => setShowHistory(!showHistory)}
                className={styles.historyToggle}
              >
                <span>Ver Historial de Revisión</span>
                {showHistory ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>

              {showHistory && (
                <div className={styles.historyContent}>
                  {loading ? (
                    <p className={styles.loading}>Cargando historial...</p>
                  ) : historialData.length > 0 ? (
                    <div className={styles.historyList}>
                      {historialData.map((record, index) => (
                        <div key={index} className={styles.historyItem}>
                          <div className={styles.historyHeader}>
                            <div className={styles.adminInfo}>
                              <strong>
                                {record.monitor?.nombrecompleto
                                  ? `Monitor: ${record.monitor.nombrecompleto}`
                                  : "Cambio de datos del usuario"}
                              </strong>
                            </div>
                            <div className={styles.dateInfo}>
                              <span>
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

                          <div className={styles.statusBadge}>
                            <span
                              className={`${styles.badge} ${
                                styles[record.estadoasignado]
                              }`}
                            >
                              {record.estadoasignado === "activo"
                                ? "Aprobado"
                                : record.estadoasignado === "denegado"
                                ? "Denegado"
                                : record.estadoasignado}
                            </span>
                            {record.tipoasignacion && (
                              <span className={styles.typeBadge}>
                                {record.tipoasignacion}
                              </span>
                            )}
                          </div>

                          <div className={styles.observationSection}>
                            <strong>Observación:</strong>
                            <p>{record.observacion || "Sin observaciones"}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className={styles.noHistory}>
                      <p>No hay revisión aún</p>
                      <span>
                        Su solicitud será revisada pronto por nuestro equipo.
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
      </div>
    </div>
  );
};

export default NotActive;
