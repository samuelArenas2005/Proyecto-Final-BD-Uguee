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

const NotActive = ({ universityId, universityStatus }) => {
  const [historialData, setHistorialData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const fetchUniversityHistory = async () => {
      if (!universityId) return;

      setLoading(true);
      try {
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
          setHistorialData(data || []);
        }
      } catch (error) {
        console.error("Error fetching university history:", error);
        setHistorialData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUniversityHistory();
  }, [universityId]);

  const getStatusInfo = () => {
    if (universityStatus === "pendiente") {
      return {
        icon: <Clock size={64} className={styles.iconPending} />,
        title: "Universidad en Revisión",
        message:
          "Su solicitud está siendo revisada por nuestro equipo de administradores.",
        submessage: "Le notificaremos tan pronto como tengamos una respuesta.",
        className: styles.pending,
      };
    } else if (universityStatus === "denegado") {
      return {
        icon: <XCircle size={64} className={styles.iconDenied} />,
        title: "Solicitud Denegada",
        message: "Su solicitud ha sido revisada y no ha sido aprobada.",
        submessage:
          "Puede revisar los comentarios del administrador a continuación o contactar soporte para más información.",
        className: styles.denied,
      };
    } else {
      return {
        icon: <AlertCircle size={64} className={styles.icon} />,
        title: "Universidad No Activa",
        message: "La universidad aún no se encuentra activa en el sistema.",
        submessage:
          "Por favor, contacte al administrador del sistema para más información.",
        className: "",
      };
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

        {/* Mostrar historial si es pendiente o denegado */}
        {(universityStatus === "denegado" ||
          universityStatus === "pendiente") && (
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
                              {record.administrador?.nombre
                                ? `Administrador: ${record.administrador.nombre}`
                                : "Cambio de datos de la universidad"}
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
