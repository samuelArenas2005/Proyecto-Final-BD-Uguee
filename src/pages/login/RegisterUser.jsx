import React, { useEffect, useState } from "react";
import { useLogin } from "../../context/LoginContext";
import FormField from "./components/FormField";
import ComboField from "./components/ComboField";
import FileField from "./components/FileField";
import MultiFileField from "./components/MultiFileField";

function RegisterPassenger({ handleChange }) {
  // --- Objetos iniciales ---
  const initialUserData = {
    email: "",
    password: "",
  };

  const initialUsuarioData = {
    nidentificacion: undefined,
    idinstitucion: "",
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
    idvehiculo: undefined,
    nserie: "",
    tipo: "",
  };

  const initialPesadoData = {
    idvehiculo: undefined,
    placa: "",
    categoriaviaje: "",
    tipovehiculo: "",
    fechaventecno: "",
    fechavensoat: "",
  };

  const initialPassengerFiles = {
    avatar: null, // Para el avatar del usuario
    carneInstitucional: null, // Para el carné estudiantil
    registroAcademico: null, // Para el registro académico
    documentoIdentidad: null, // Para el documento de identidad
  };

  const initialVehiculoFiles = {
    documents: [], // Array para los documentos del vehículo
  };

  // --- useState ---
  const [userData, setUserData] = useState(initialUserData);
  const [usuarioData, setUsuarioData] = useState(initialUsuarioData);
  const [pasajeroData, setPasajeroData] = useState(initialPasajeroData);
  const [conductorData, setConductorData] = useState(initialConductorData);

  const [vehiculoData, setVehiculoData] = useState(initialVehiculoData);
  const [ligeroData, setLigeroData] = useState(initialLigeroData);
  const [pesadoData, setPesadoData] = useState(initialPesadoData);
  const [passengerFiles, setPassengerFiles] = useState(initialPassengerFiles);
  const [vehiculoFiles, setVehiculoFiles] = useState(initialVehiculoFiles);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");

  const [isDriver, setIsDriver] = useState(false);

  const [tipoVehiculo, setTipoVehiculo] = useState(""); // "ligero" o "pesado"

  const [infoMsg, setInfoMsg] = useState(""); // información de error o éxito

  // --- Contexto de Login ---
  const {
    listUniversities,
    checkUniqueAtributes,
    createUser,
    createPassenger,
    submitPassengerFiles,
    submitVehicleFiles,
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
        console.error(
          "Error al obtener universidades:",
          error?.message || error
        );
      }
    };
    fetchUniversities();
  }, []);

  // --- File handling functions ---
  const handlePassengerFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const name = e.target.name;
      const file = e.target.files[0];
      setPassengerFiles((prevFiles) => ({ ...prevFiles, [name]: file }));
    }
  };

  const handleAvatarPreview = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onloadend = () => {
      setAvatarPreviewUrl(reader.result);
    };
  };

  const handleVehiculoFileChange = (newFiles) => {
    setVehiculoFiles((prevFiles) => ({ ...prevFiles, documents: newFiles }));
  };

  // --- Manejo de cambios en los campos del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Preparar datos del usuario
    console.log("Datos del usuario:", usuarioData);
    try {
      const check = await checkUniqueAtributes(
        usuarioData,
        conductorData,
        ligeroData,
        pesadoData
      );
      const result = await createUser(userData, usuarioData);
      console.log("Datos del usuario creado:", result);

      const user = result.data[0];
      const pasajeroPayload = {
        ...pasajeroData,
        idusuario: user.nidentificacion,
      };
      console.log("Datos del pasajero:", pasajeroPayload);
      const resultPassenger = await createPassenger(pasajeroPayload);
      console.log("Datos del pasajero creado:", resultPassenger);
      const resultFiles = await submitPassengerFiles(
        passengerFiles,
        user.nidentificacion
      );
      console.log("Archivos del pasajero enviados:", resultFiles);

      if (isDriver) {
        if (tipoVehiculo == "ligero") {
          const resultVehicle = await createVehicle(
            vehiculoData,
            tipoVehiculo,
            ligeroData
          );
          console.log("Datos del vehículo creado:", resultVehicle);
          const conductorPayload = {
            ...conductorData,
            idvehiculo: resultVehicle.idvehiculo,
            idusuario: result.data[0].nidentificacion,
          };
          const resultDriver = await createDriver(conductorPayload);
          console.log("Datos del conductor creado:", resultDriver);
        }
        if (tipoVehiculo == "pesado") {
          const resultVehicle = await createVehicle(
            vehiculoData,
            tipoVehiculo,
            pesadoData
          );
          console.log("Datos del vehículo creado:", resultVehicle);
          const conductorPayload = {
            ...conductorData,
            idvehiculo: resultVehicle.idvehiculo,
            idusuario: result.data[0].nidentificacion,
          };
          const resultDriver = await createDriver(conductorPayload);
          console.log("Datos del conductor creado:", resultDriver);

          // Subir documentos del vehículo si existen
          if (vehiculoFiles.documents.length > 0) {
            const resultVehicleFiles = await submitVehicleFiles(
              vehiculoFiles,
              resultVehicle.idvehiculo,
              result.data[0].nidentificacion
            );
            console.log("Archivos del vehículo enviados:", resultVehicleFiles);
          }
        }
      }
      setInfoMsg("Usuario creado con éxito");
      setUserData(initialUserData);
      setUsuarioData(initialUsuarioData);
      setPasajeroData(initialPasajeroData);
      setConductorData(initialConductorData);
      setVehiculoData(initialVehiculoData);
      setLigeroData(initialLigeroData);
      setPesadoData(initialPesadoData);
      setPassengerFiles(initialPassengerFiles);
      setVehiculoFiles(initialVehiculoFiles);
      setAvatarPreviewUrl("");
      setIsDriver(false);
      setTipoVehiculo("");
    } catch (error) {
      console.error("Error al crear usuario:", error);
      setInfoMsg(
        "Error al crear usuario: " + error?.message + " Intentelo de nuevo"
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
        <h3 className="rd-section-title">Datos de pasajero</h3>
        {infoMsg && (
          <div
            className={
              infoMsg.includes("Usuario creado con éxito")
                ? "successmsg"
                : "errormsg"
            }
          >
            {infoMsg}
          </div>
        )}
        {/* Email y Password */}
        <FormField
          label="Email"
          type="email"
          name="email"
          value={userData.email}
          required
          placeholder="ejemplo@correo.com"
          onChange={(e) => handleChange(e, setUserData)}
        />
        <FormField
          label="Contraseña"
          type="password"
          name="password"
          minLength={6}
          value={userData.password}
          required
          placeholder="Mínimo 6 caracteres"
          onChange={(e) => handleChange(e, setUserData)}
        />

        {/* Campos usuario */}
        <FormField
          label="Nombre completo"
          name="nombrecompleto"
          value={usuarioData.nombrecompleto}
          required
          placeholder="Juan Pérez"
          pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ]+(\s+[A-Za-zÁÉÍÓÚáéíóúÑñ]+)+$"
          title="Debe ingresar al menos dos palabras, solo letras y espacios."
          onChange={(e) => handleChange(e, setUsuarioData)}
        />
        <ComboField
          label="Universidad"
          name="idinstitucion"
          value={usuarioData.idinstitucion}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
          options={universities.map((uni) => ({
            value: uni.idinstitucion,
            label: `${uni.nombre}${uni.sede ? ` - ${uni.sede}` : ""}`,
          }))}
        />
        <div className="rd-two-col">
          <FormField
            label="Edad"
            type="number"
            name="edad"
            value={usuarioData.edad}
            required
            placeholder="20"
            min={13}
            max={120}
            onChange={(e) => handleChange(e, setUsuarioData)}
            style={{ appearance: "textfield" }}
          />
          <FormField
            label="Teléfono"
            type="text"
            name="telefono"
            value={usuarioData.telefono}
            required
            placeholder="3001234567"
            pattern="^\d{10}$"
            title="El teléfono debe tener exactamente 10 números."
            maxLength={10}
            onChange={(e) => handleChange(e, setUsuarioData)}
          />
        </div>
        <div className="rd-two-col">
          <FormField
            label="Calle"
            name="calle"
            value={usuarioData.calle}
            required
            placeholder="45"
            onChange={(e) => handleChange(e, setUsuarioData)}
          />
          <FormField
            label="Número de casa"
            name="numerocasa"
            value={usuarioData.numerocasa}
            required
            placeholder="12-34"
            onChange={(e) => handleChange(e, setUsuarioData)}
          />
        </div>
        <div className="rd-two-col">
          <FormField
            label="Ciudad"
            name="ciudad"
            value={usuarioData.ciudad}
            required
            placeholder="Bogotá"
            pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
            title="La ciudad solo debe contener letras y espacios, sin números."
            onChange={(e) => handleChange(e, setUsuarioData)}
          />
          <FormField
            label="Código estudiantil"
            type="number"
            name="codigoestudiantil"
            value={usuarioData.codigoestudiantil}
            placeholder="202011111"
            onChange={(e) => handleChange(e, setUsuarioData)}
          />
        </div>
        <ComboField
          label="Estatuto"
          name="estatuto"
          value={usuarioData.estatuto}
          required
          onChange={(e) => handleChange(e, setUsuarioData)}
          options={[
            { value: "estudiante", label: "Estudiante" },
            { value: "profesor", label: "Profesor" },
            { value: "funcionario", label: "Funcionario" },
            { value: "egresado", label: "Egresado" },
            { value: "otro", label: "Otro" },
          ]}
        />
        <FileField
          label="Avatar del usuario (PNG o JPG)"
          type="file"
          name="avatar"
          file={passengerFiles.avatar}
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onFileChange={(e) => {
            handlePassengerFileChange(e);
            handleAvatarPreview(e);
          }}
          previewUrl={avatarPreviewUrl}
        />
        <FileField
          label="Carné Institucional (PDF)"
          type="file"
          name="carneInstitucional"
          file={passengerFiles.carneInstitucional}
          accept=".pdf,application/pdf"
          onFileChange={handlePassengerFileChange}
        />
        <FileField
          label="Registro Académico (PDF)"
          type="file"
          name="registroAcademico"
          file={passengerFiles.registroAcademico}
          required={false}
          accept=".pdf,application/pdf"
          onFileChange={handlePassengerFileChange}
        />
        <FileField
          label="Documento de Identidad (PDF)"
          type="file"
          name="documentoIdentidad"
          required={false}
          file={passengerFiles.documentoIdentidad}
          accept=".pdf,application/pdf"
          onFileChange={handlePassengerFileChange}
        />
      </div>

      {/* Sección conductor */}
      {isDriver && (
        <div className="rd-section rd-section-conductor">
          <h3 className="rd-section-title">Datos de conductor</h3>
          {/* Campos conductor */}
          <FormField
            label="Número de licencia"
            type="text"
            name="numerodelicencia"
            value={conductorData.numerodelicencia}
            required
            placeholder="1234567890"
            pattern="^\d{3,}$"
            title="El número de licencia debe tener al menos 3 números, solo números positivos."
            onChange={(e) => handleChange(e, setConductorData)}
            inputMode="numeric"
          />

          {/* Información de vehículo */}
          <ComboField
            label="¿Como es tu vehiculo?"
            value={tipoVehiculo}
            required
            onChange={(e) => setTipoVehiculo(e.target.value)}
            options={[
              { value: "ligero", label: "Ligero (Solo dentro del campus)" },
              { value: "pesado", label: "Pesado" },
            ]}
          />

          {/* Campos generales de vehículo */}
          <div className="rd-two-col">
            <FormField
              label="Color"
              name="color"
              value={vehiculoData.color}
              required
              placeholder="Rojo"
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
            <FormField
              label="Número de asientos (sin contar el conductor)"
              type="number"
              name="numeroasientos"
              value={vehiculoData.numeroasientos}
              required
              placeholder="4"
              min={1}
              max={100}
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>
          <div className="rd-two-col">
            <FormField
              label="Modelo"
              name="modelo"
              value={vehiculoData.modelo}
              required
              placeholder="Toyota Fortuner"
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
            <FormField
              label="Marca"
              name="marca"
              value={vehiculoData.marca}
              required
              placeholder="Toyota"
              onChange={(e) => handleChange(e, setVehiculoData)}
            />
          </div>

          {/* Campos específicos según tipo de vehículo */}
          {tipoVehiculo === "ligero" && (
            <div className="rd-two-col">
              <FormField
                label="Número de serie"
                name="nserie"
                value={ligeroData.nserie}
                required
                placeholder="ABC123456789"
                onChange={(e) => handleChange(e, setLigeroData)}
              />
              <FormField
                label="Tipo"
                name="tipo"
                value={ligeroData.tipo}
                required
                placeholder="Motocicleta, bicicleta, etc."
                onChange={(e) => handleChange(e, setLigeroData)}
              />
            </div>
          )}
          {tipoVehiculo === "pesado" && (
            <>
              <FormField
                label="Placa"
                name="placa"
                value={pesadoData.placa}
                required
                placeholder="ABC123"
                pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ]{3}\d{3}$"
                title="La placa debe tener 3 letras seguidas de 3 números, por ejemplo: ABC123"
                onChange={(e) => handleChange(e, setPesadoData)}
              />
              <div className="rd-two-col">
                <ComboField
                  label="Categoría de viaje"
                  name="categoriaviaje"
                  value={pesadoData.categoriaviaje}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                  options={[
                    { value: "intermunicipal", label: "Intermunicipal" },
                    { value: "municipal", label: "Municipal" },
                    { value: "dentro del campus", label: "Dentro del campus" },
                  ]}
                />
                <ComboField
                  label="Tipo de vehículo"
                  name="tipovehiculo"
                  value={pesadoData.tipovehiculo}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                  options={[
                    { value: "automovil", label: "Automóvil" },
                    { value: "buseta", label: "Buseta" },
                    { value: "bus", label: "Bus" },
                    { value: "camion", label: "Camión" },
                    { value: "motocicleta", label: "Motocicleta" },
                  ]}
                />
              </div>
              <div className="rd-two-col">
                <FormField
                  label="Fecha vencimiento técnico"
                  type="date"
                  name="fechaventecno"
                  value={pesadoData.fechaventecno}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
                <FormField
                  label="Fecha vencimiento SOAT"
                  type="date"
                  name="fechavensoat"
                  value={pesadoData.fechavensoat}
                  required
                  onChange={(e) => handleChange(e, setPesadoData)}
                />
              </div>
              <MultiFileField
                label="Documentos del Vehículo (PDF) * - SOAT, Tarjeta de Propiedad, Revisión Tecnomecánica, Licencia de Tránsito, etc."
                name="documents"
                files={vehiculoFiles.documents}
                onFilesChange={handleVehiculoFileChange}
                accept=".pdf,application/pdf"
              />
            </>
          )}
        </div>
      )}

      {/* Selección de roles */}
      <div className="rd-field">
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
