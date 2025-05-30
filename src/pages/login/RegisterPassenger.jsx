import React, { useEffect, useState } from "react";
import { useLogin } from "../../context/LoginContext";

function RegisterPassenger({ handleChange }) {
  // Campos para usuario
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialUsuarioData = {
    nidentificacion: undefined, // Se asigna en el contexto
    idinstitucion: undefined, // Debe ser el UUID de la universidad seleccionada
    tipodocumento: "",
    fechanacimiento: "",
    nombrecompleto: "",
    edad: "",
    telefono: "",
    calle: "",
    numerocasa: "",
    ciudad: "",
    codigoestudiantil: "",
  };

  // Campos para pasajero
  const initialPasajeroData = {
    idusuario: undefined, // Se asigna en el contexto
    estatuto: "",
    cantidadviajestomados: 0,
    estadopasajero: "activo",
  };

  const [userData, setUserData] = useState(initialUserData);
  const [usuarioData, setUsuarioData] = useState(initialUsuarioData);
  const [pasajeroData, setPasajeroData] = useState(initialPasajeroData);

  const { listUniversities, submitting, loading } = useLogin();
  const [universities, setUniversities] = useState([]);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await listUniversities();
        setUniversities(data);
      } catch (error) {
        console.error("Error al obtener universidades:", error);
      }
    };
    fetchUniversities();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Datos del usuario:", userData);
    console.log("Datos del usuario (usuarioData):", usuarioData);
    console.log("Datos del pasajero:", pasajeroData);
    listUniversities();
  };

  if (submitting) return <p>Registrando pasajero...</p>;
  if (loading) return <p>Cargando universidades...</p>;
  return (
    <form className="rd-form" onSubmit={handleSubmit}>
      {/* Email y Password */}
      <div className="rd-field">
        <label>Email</label>
        <input
          type="email"
          name="email"
          value={userData.email}
          required
          onChange={(e) => handleChange(e, setUserData)}
        />
      </div>
      <div className="rd-field">
        <label>Contraseña</label>
        <input
          type="password"
          name="password"
          value={userData.password}
          required
          onChange={(e) => handleChange(e, setUserData)}
        />
      </div>

      {/* Campos usuario */}
      <div className="rd-field">
        <label>Nombre completo</label>
        <input
          name="nombrecompleto"
          value={usuarioData.nombrecompleto}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Universidad</label>
        <select
          name="idinstitucion"
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        >
          <option value="" disabled>
            Selecciona una universidad
          </option>
          {universities.map((uni) => (
            <option key={uni.idinstitucion} value={uni.idinstitucion}>
              {uni.nombre}
            </option>
          ))}
        </select>
      </div>
      <div className="rd-field">
        <label>Tipo de documento</label>
        <input
          name="tipodocumento"
          value={usuarioData.tipodocumento}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Fecha de nacimiento</label>
        <input
          type="date"
          name="fechanacimiento"
          value={usuarioData.fechanacimiento}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Edad</label>
        <input
          type="number"
          name="edad"
          value={usuarioData.edad}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Teléfono</label>
        <input
          type="number"
          name="telefono"
          value={usuarioData.telefono}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Calle</label>
        <input
          name="calle"
          value={usuarioData.calle}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Número de casa</label>
        <input
          name="numerocasa"
          value={usuarioData.numerocasa}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Ciudad</label>
        <input
          name="ciudad"
          value={usuarioData.ciudad}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>
      <div className="rd-field">
        <label>Código estudiantil</label>
        <input
          type="number"
          name="codigoestudiantil"
          value={usuarioData.codigoestudiantil}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
      </div>

      {/* Campos pasajero */}
      <div className="rd-field">
        <label>Estatuto</label>
        <input
          name="estatuto"
          value={pasajeroData.estatuto}
          required
          onChange={(e) => handleChange(e, setPasajeroData)}
        />
      </div>

      <button type="submit" className="rd-submit">
        Registrarse como pasajero
      </button>
    </form>
  );
}

export default RegisterPassenger;
