// RegisterDialog.js
import React, { useState, useEffect, useRef } from "react";
import "./RegisterDialog.css";
import { supabase } from "../../supabaseClient";
import RegisterPassenger from "./RegisterPassenger";
import RegisterUniversity from "./RegisterUniversity";
import Login from "./Login";
import { LoginContextProvider } from "../../context/LoginContext";

export default function RegisterDialog({ open, onOpenChange }) {
  const [role, setRole] = useState("pasajero");

  const handleChange = (e, setFormData) => {
    e.preventDefault();
    const { name, value } = e.target;
    console.log(`Nombre: ${name}, Valor: ${value}`);
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const modalRef = useRef();

  useEffect(() => {
    function handleClickOutside(e) {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onOpenChange(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, onOpenChange]);

  const handleFileChange = (e, setter) => {
    if (e.target.files && e.target.files[0]) setter(e.target.files[0]);
  };

  if (!open) return null;

  return (
    <div className="rd-overlay">
      <div className="rd-modal" ref={modalRef}>
        <header className="rd-header">
          <h2>Registro en Ugüee</h2>
          <button className="rd-close" onClick={() => onOpenChange(false)}>
            ×
          </button>
        </header>

        <div className="rd-role-toggle">
          <button
            className={role === "pasajero" ? "active" : ""}
            onClick={() => setRole("pasajero")}
          >
            Pasajero
          </button>
          <button
            className={role === "universidad" ? "active" : ""}
            onClick={() => setRole("universidad")}
          >
            Universidad
          </button>
        </div>

        <div className="rd-content">
          <LoginContextProvider>
            {role === "pasajero" && <RegisterPassenger handleChange={handleChange}/>}
            {role === "universidad" && <RegisterUniversity handleChange={handleChange}/>}
          </LoginContextProvider>
        </div>
      </div>
    </div>
  );
}
