import React, { useEffect, useState } from "react";
import { useLogin } from "../../context/LoginContext";

function RegisterPassenger({ handleChange }) {
  // --- Objetos iniciales ---
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialUsuarioData = {
    nidentificacion: undefined,
    idinstitucion: "",
    tipodocumento: "",
    fechanacimiento: "",
    nombrecompleto: "",
    edad: "",
    telefono: "",
    calle: "",
    numerocasa: "",
    ciudad: "",
    codigoestudiantil: "",
    estatuto: "",
  };

  const initialPasajeroData = {
    idusuario: undefined,
    cantidadviajestomados: 0,
    estadopasajero: "pendiente",
  };

  const initialConductorData = {
    idusuario: undefined,
    idvehiculo: undefined,
    numerodelicencia: "",
    estadoconductor: "pendiente",
    cantidadviajesrealizados: 0,
  };

  const initialVehiculoData = {
    color: "",
    numeroasientos: "",
    modelo: "",
    marca: "",
  };

  const initialLigeroData = {
    nserie: "",
    tipo: "",
  };

  const initialPesadoData = {
    placa: "",
    categoriaviaje: "",
    tipovehiculo: "",
    categoria: "",
    fechaventecno: "",
    fechavensoat: "",
  };

  // --- useState ---
  const [userData, setUserData] = useState(initialUserData);
  const [usuarioData, setUsuarioData] = useState(initialUsuarioData);
  const [pasajeroData, setPasajeroData] = useState(initialPasajeroData);
  const [conductorData, setConductorData] = useState(initialConductorData);

  const [vehiculoData, setVehiculoData] = useState(initialVehiculoData);
  const [ligeroData, setLigeroData] = useState(initialLigeroData);
  const [pesadoData, setPesadoData] = useState(initialPesadoData);

  const [isPassenger, setIsPassenger] = useState(false);
  const [isDriver, setIsDriver] = useState(false);

  const [tipoVehiculo, setTipoVehiculo] = useState(""); // "ligero" o "pesado"

  // --- Contexto de Login ---
  const {
    listUniversities,
    createUser,
    createPassenger,
    createVehicle,
    createDriver,
    submitting,
    loading,
  } = useLogin();

  // --- useEffect para cargar universidades ---
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

  // --- Manejo de cambios en los campos del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPassenger && !isDriver) {
      alert("Debes seleccionar al menos una opción: pasajero o conductor.");
    }
    // Preparar datos del usuario
    console.log("Datos del usuario:", usuarioData);
    try {
      const result = await createUser(userData, usuarioData);
      console.log("Datos del usuario creado:", result);

      if (isPassenger) {
        const user = result.data[0];
        await setPasajeroData((prev) => ({
          ...prev,
          idusuario: user.nidentificacion, // Asigna el id del usuario creado
        }));
        console.log("Datos del pasajero:", pasajeroData);
        const resultPassenger = await createPassenger(pasajeroData);
        console.log("Datos del pasajero creado:", resultPassenger);
      }

      if (isDriver) {
        if (tipoVehiculo == "ligero" || tipoVehiculo == "pesado") {
          const result = await createVehicle(
            vehiculoData,
            tipoVehiculo,
            ligeroData
          );

          
          console.log("Datos del vehículo ligero creado:", result);
        }
      }

      alert("Usuario creado con éxito");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      alert(
        "Error al crear usuario. Inténtalo de nuevo.",
        error?.message || error
      );
      return;
    }
  };

  if (submitting) return <p>Registrando usuario...</p>;
  if (loading) return <p>Cargando universidades...</p>;
  return (
    <form className="rd-form" onSubmit={handleSubmit}>
      {/* Sección datos de usuario */}
      <div className="rd-section">
        <h3 className="rd-section-title">Datos de usuario</h3>
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
            value={usuarioData.idinstitucion}
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
        <div className="rd-field">
          <label>Estatuto</label>
          <select
            name="estatuto"
            value={usuarioData.estatuto}
            required
            onChange={(e) => handleChange(e, setUsuarioData)}
          >
            <option value="" disabled>
              Selecciona estatuto
            </option>
            <option value="estudiante">Estudiante</option>
            <option value="profesor">Profesor</option>
            <option value="funcionario">Funcionario</option>
            <option value="egresado">Egresado</option>
            <option value="otro">Otro</option>
          </select>
        </div>
      </div>

      {/* Sección conductor */}
      {isDriver && (
        <div className="rd-section rd-section-conductor">
          <h3 className="rd-section-title">Datos de conductor</h3>
          {/* Campos conductor */}
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
        </div>
      )}

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

      <button type="submit" className="rd-submit">
        Registrarse
      </button>
    </form>
  );
}

export default RegisterPassenger;
