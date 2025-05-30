import React, { useEffect, useState } from "react";
import { useLogin } from "../../context/LoginContext";

function RegisterPassenger({ handleChange }) {
  // Campos para usuario
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialUsuarioData = {
    nidentificacion: undefined,
    idinstitucion: undefined,
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
    idusuario: undefined,
    estatuto: "",
    cantidadviajestomados: 0,
    estadopasajero: "activo",
  };

  // Campos para conductor
  const initialConductorData = {
    idusuario: undefined,
    idvehiculo: undefined,
    numerodelicencia: "",
    estadoconductor: "activo",
    cantidadviajesrealizados: 0,
    estatuto: "",
  };

  const [userData, setUserData] = useState(initialUserData);
  const [usuarioData, setUsuarioData] = useState(initialUsuarioData);
  const [pasajeroData, setPasajeroData] = useState(initialPasajeroData);
  const [conductorData, setConductorData] = useState(initialConductorData);

  const [isPassenger, setIsPassenger] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const { listUniversities, submitting, loading } = useLogin();
  const [universities, setUniversities] = useState([]);

  // Estado para tipo de vehículo
  const [tipoVehiculo, setTipoVehiculo] = useState(""); // "ligero" o "pesado"

  // Estado para datos de vehículo general
  const initialVehiculoData = {
    color: "",
    numeroasientos: "",
    modelo: "",
    marca: "",
  };
  const [vehiculoData, setVehiculoData] = useState(initialVehiculoData);

  // Estado para datos de vehículo ligero
  const initialLigeroData = {
    nserie: "",
    tipo: "",
  };
  const [ligeroData, setLigeroData] = useState(initialLigeroData);

  // Estado para datos de vehículo pesado
  const initialPesadoData = {
    placa: "",
    categoriaviaje: "",
    tipovehiculo: "",
    categoria: "",
    fechaventecno: "",
    fechavensoat: "",
  };
  const [pesadoData, setPesadoData] = useState(initialPesadoData);

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
    if (!isPassenger && !isDriver) {
      alert("Debes seleccionar al menos una opción: pasajero o conductor.");
      return;
    }
    // Aquí puedes manejar el registro según los roles seleccionados
    console.log("Datos del usuario:", userData);
    console.log("Datos del usuario (usuarioData):", usuarioData);
    if (isPassenger) console.log("Datos del pasajero:", pasajeroData);
    if (isDriver) console.log("Datos del conductor:", conductorData);
  };

  if (submitting) return <p>Registrando usuario...</p>;
  if (loading) return <p>Cargando universidades...</p>;
  return (
    <form className="rd-form" onSubmit={handleSubmit}>
      {/* Selección de roles */}
      <div className="rd-field">
        <label>
          <input
            type="checkbox"
            checked={isPassenger}
            onChange={() => setIsPassenger((v) => !v)}
          />
          Quiero ser pasajero
        </label>
        <label>
          <input
            type="checkbox"
            checked={isDriver}
            onChange={() => setIsDriver((v) => !v)}
          />
          Quiero ser conductor
        </label>
      </div>

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
      {isPassenger && (
        <div className="rd-field">
          <label>Estatuto (pasajero)</label>
          <input
            name="estatuto"
            value={pasajeroData.estatuto}
            required
            onChange={(e) => handleChange(e, setPasajeroData)}
          />
        </div>
      )}

      {/* Campos conductor */}
      {isDriver && (
        <>
          <div className="rd-field">
            <label>Estatuto (conductor)</label>
            <input
              name="estatuto"
              value={conductorData.estatuto}
              required
              onChange={(e) => handleChange(e, setConductorData)}
            />
          </div>
          <div className="rd-field">
            <label>Número de licencia</label>
            <input
              type="number"
              name="numerodelicencia"
              value={conductorData.numerodelicencia}
              required
              onChange={(e) => handleChange(e, setConductorData)}
            />
          </div>

          {/* Información de vehículo */}
          <div className="rd-field">
            <label>Tipo de vehículo</label>
            <select
              value={tipoVehiculo}
              required
              onChange={(e) => setTipoVehiculo(e.target.value)}
            >
              <option value="" disabled>
                Selecciona tipo de vehículo
              </option>
              <option value="ligero">Ligero</option>
              <option value="pesado">Pesado</option>
            </select>
          </div>

          {/* Campos generales de vehículo */}
          <div className="rd-field">
            <label>Color</label>
            <input
              name="color"
              value={vehiculoData.color}
              required
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>
          <div className="rd-field">
            <label>Número de asientos</label>
            <input
              type="number"
              name="numeroasientos"
              value={vehiculoData.numeroasientos}
              required
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>
          <div className="rd-field">
            <label>Modelo</label>
            <input
              name="modelo"
              value={vehiculoData.modelo}
              required
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>
          <div className="rd-field">
            <label>Marca</label>
            <input
              name="marca"
              value={vehiculoData.marca}
              required
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>

          {/* Campos específicos según tipo de vehículo */}
          {tipoVehiculo === "ligero" && (
            <>
              <div className="rd-field">
                <label>Número de serie</label>
                <input
                  name="nserie"
                  value={ligeroData.nserie}
                  required
                  onChange={(e) => handleChange(e, setLigeroData)}
                />
              </div>
              <div className="rd-field">
                <label>Tipo</label>
                <input
                  name="tipo"
                  value={ligeroData.tipo}
                  required
                  onChange={(e) => handleChange(e, setLigeroData)}
                />
              </div>
            </>
          )}
          {tipoVehiculo === "pesado" && (
            <>
              <div className="rd-field">
                <label>Placa</label>
                <input
                  name="placa"
                  value={pesadoData.placa}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <div className="rd-field">
                <label>Categoría de viaje</label>
                <input
                  name="categoriaviaje"
                  value={pesadoData.categoriaviaje}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <div className="rd-field">
                <label>Tipo de vehículo</label>
                <input
                  name="tipovehiculo"
                  value={pesadoData.tipovehiculo}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <div className="rd-field">
                <label>Categoría</label>
                <input
                  name="categoria"
                  value={pesadoData.categoria}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <div className="rd-field">
                <label>Fecha vencimiento técnico</label>
                <input
                  type="date"
                  name="fechaventecno"
                  value={pesadoData.fechaventecno}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <div className="rd-field">
                <label>Fecha vencimiento SOAT</label>
                <input
                  type="date"
                  name="fechavensoat"
                  value={pesadoData.fechavensoat}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
            </>
          )}
        </>
      )}

      <button type="submit" className="rd-submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterPassenger;
