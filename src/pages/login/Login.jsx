import React, { useState } from "react";
import RoleSelector from "./RoleSelector";
import RegisterDialog from "./RegisterDialog";
import { Link } from "react-router-dom";
import { ShieldUser, GraduationCap, User, CarFront } from "lucide-react";
import "./login.css";
<CarFront />;

const roles = [
  {
    id: "conductor",
    name: "Conductor",
    description: "Ofrece viajes, gestiona rutas y comunícate con pasajeros.",
    icon: <CarFront className="icon-car" />,
    href: "/authUser",
  },
  {
    id: "pasajero",
    name: "Pasajero",
    description:
      "Busca y reserva viajes, accede a rutas y conductores verificados.",
    icon: <User className="icon-user" />,
    href: "/authUser",
  },
  {
    id: "universidad",
    name: "Universidad",
    description: "Administra estudiantes, solicitudes y reportes de viaje.",
    icon: <GraduationCap className="icon-university" />,
    href: "/authUser",
  },
];

export default function Login() {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);

  return (
    <div className="login-container">
      <main className="main-section">
        <section className="role-section">
          <div className="content-wrapper">
            <div className="header-container">
              <h1 className="title">Ugüee</h1>
              <h2 className="subtitle">Selecciona tu rol</h2>
              <p className="description">
                Elige tu perfil de acceso para ingresar a las funcionalidades
                específicas de la plataforma
              </p>
            </div>

            <RoleSelector roles={roles} excludeRoles={["admin"]} />

            <div className="register-prompt">
              <p>
                ¿No tienes una cuenta?
                <button
                  className="register-button"
                  onClick={() => setIsRegisterDialogOpen(true)}
                >
                  Regístrate aquí
                </button>
              </p>
              <div className="admin-access">
                <Link to="/auth/admin" className="admin-link">
                  <ShieldUser className="admin-icon" />
                  <span>Acceso Administrador</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <RegisterDialog
        open={isRegisterDialogOpen}
        onOpenChange={setIsRegisterDialogOpen}
      />
    </div>
  );
}
