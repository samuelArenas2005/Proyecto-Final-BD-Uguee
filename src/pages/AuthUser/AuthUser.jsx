import React, { useState } from "react";
import Button from "./Button";
import "./AuthUser.css";
import { useParams, Link } from 'react-router-dom';


export default function AuthUser({ hideRegistration = false }) {
   const { role } = useParams();
   console.log('Rol seleccionado:', role);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoginMode, setIsLoginMode] = useState(true);

  const getTitle = () => (isLoginMode ? "Iniciar Sesión" : "Registro");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica de autenticación o registro
    console.log(isLoginMode ? "Login" : "Register", role, { email, password });
  };


  return (
    <div className="auth-page">
      <main className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">
            {getTitle()} como {role}
          </h1>
          <p className="auth-subtitle">
            {isLoginMode
              ? "Ingresa tus credenciales para acceder a tu cuenta"
              : "Crea una nueva cuenta para acceder a la plataforma"}
          </p>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label htmlFor="email">Correo electrónico</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Contraseña</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            {isLoginMode && (
              <div className="forgot-password">
                <a href="#">¿Olvidaste tu contraseña?</a>
              </div>
            )}

            <Link to={`/${role}`} >
                <Button type="submit" className="full-width">
                  {getTitle()}
                </Button>
              </Link>
           

            {role === "pasajero" && isLoginMode && (
              <div className="separator">O continuar con</div>
            )}

            {role === "pasajero" && isLoginMode && (
              <Button variant="outline" className="google-btn">
                {/* Icono de Google inline */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 488 512"
                  fill="currentColor"
                >
                  <path d="M488 261.8C488 403.3 391.1 504 248 504 110.8 ..." />
                </svg>
                <span>Iniciar con Google</span>
              </Button>
            )}
          </form>

          {!hideRegistration && (
            <div className="toggle-mode">
              <p>
                {isLoginMode
                  ? "¿No tienes una cuenta? "
                  : "¿Ya tienes una cuenta? "}
                <button
                  type="button"
                  className="link-btn"
                  onClick={() => setIsLoginMode(!isLoginMode)}
                >
                  {isLoginMode ? "Regístrate aquí" : "Inicia sesión"}
                </button>
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
