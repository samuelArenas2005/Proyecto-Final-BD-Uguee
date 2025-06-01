import { useLogin } from "../../context/LoginContext";
import { useState } from "react";

function RegisterUniversity({ handleChange }) {
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialFormData = {
    idinstitucion: undefined,
    nombre: "",
    colorprincipal: "",
    colorsecundario: "",
    urllmglogo: "",
    sede: "",
    calle: "",
    numerolugar: "",
    ciudad: "",
    estado: "activo",
  };

  const [userData, setUserData] = useState(initialUserData);
  const [formData, setFormData] = useState(initialFormData);

  const { createUniversity, submitting } = useLogin();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUniversity(userData, formData);
      setUserData(initialUserData);
      setFormData(initialFormData);
      alert("Universidad registrada con éxito");
    } catch (error) {
      console.error(
        "Error al registrar universidad:",
        error,
        error?.message,
        error?.stack
      );
      alert(
        "Error al registrar universidad. Inténtalo de nuevo.\n" +
          (error?.message || error)
      );
    }
  };

  if (submitting) return <p>Registrando universidad...</p>;
  else
    return (
      <form
        className="rd-form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(e);
        }}
      >
        {/* Email y Password */}
        <div className="rd-field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            required
            placeholder="ejemplo@universidad.edu"
            onChange={(e) => handleChange(e, setUserData)}
          />
        </div>
        <div className="rd-field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            minLength={6}
            value={userData.password}
            required
            placeholder="Minimo 6 caracteres"
            onChange={(e) => handleChange(e, setUserData)}
          />
        </div>

        {/* Campos de initialFormData */}
        <div className="rd-field">
          <label>Nombre oficial de la Universidad</label>
          <input
            name="nombre"
            value={formData.nombre}
            required
            placeholder="Universidad Nacional Autónoma"
            onChange={(e) => handleChange(e, setFormData)}
          />
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Sede</label>
            <input
              name="sede"
              value={formData.sede}
              required
              placeholder="Melendez"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Calle</label>
            <input
              name="calle"
              value={formData.calle}
              required
              placeholder="12"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Número lugar</label>
            <input
              name="numerolugar"
              value={formData.numerolugar}
              required
              placeholder="12-34"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Ciudad</label>
            <input
              name="ciudad"
              value={formData.ciudad}
              required
              placeholder="Ciudad de México"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-two-col">
          <div className="rd-field">
            <label>Color principal</label>
            <input
              name="colorprincipal"
              value={formData.colorprincipal}
              required
              placeholder="Azul"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
          <div className="rd-field">
            <label>Color secundario</label>
            <input
              name="colorsecundario"
              value={formData.colorsecundario}
              required
              placeholder="Blanco"
              onChange={(e) => handleChange(e, setFormData)}
            />
          </div>
        </div>
        <div className="rd-field">
          <label>URL Imagen Logo</label>
          <input
            name="urllmglogo"
            value={formData.urllmglogo}
            required
            placeholder="https://ejemplo.com/logo.png"
            onChange={(e) => handleChange(e, setFormData)}
          />
        </div>
        <button type="submit" className="rd-submit">
          Registrarse como universidad
        </button>
      </form>
    );
}

export default RegisterUniversity;
