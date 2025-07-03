import { createContext, useContext } from "react";
import { useState } from "react";
import { supabase } from "../supabaseClient";

export const LoginContext = createContext();

export const useLogin = () => {
  const context = useContext(LoginContext);
  if (!context) throw new Error("No hay contexto");
  return context;
};

export const LoginContextProvider = ({ children }) => {
  //Para informar cuando este subiendo algo
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  function limpiarNombre(nombreOriginal) {
    // Añadimos el punto (.) a la lista de caracteres permitidos [^\w\s-.]
    let nombreLimpio = nombreOriginal
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      // AQUÍ ESTÁ EL CAMBIO: \w\s-. se convierte en \w\s-.
      .replace(/[^\w\s-.]/g, "") // Se eliminan caracteres no deseados, PERO se conserva el punto.
      .trim()
      .replace(/\s+/g, "-");

    // Si el nombre supera los 60 caracteres, recorta las primeras letras hasta que quede de 60
    if (nombreLimpio.length > 59) {
      nombreLimpio = nombreLimpio.slice(nombreLimpio.length - 59);
    }

    return nombreLimpio;
  }
  //Funcion para crear una institucion
  const createUniversity = async (userData, formData, files) => {
    setSubmitting(true);

    const { email, password } = userData;
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log(data, error);
    if (error) {
      setSubmitting(false);
      throw error;
    }
    const logoPath = `Institucion/${data.user.id}/logo/${limpiarNombre(
      files.logo.name
    )}`;
    formData.urllmglogo = logoPath;
    formData.idinstitucion = data.user.id;
    const result = await supabase
      .from("institucion")
      .insert([formData])
      .select();
    if (result.error) {
      setSubmitting(false);
      throw result.error;
    }
    const { data: logoData, error: logoError } = await supabase.storage
      .from("publico")
      .upload(logoPath, files.logo, {
        cacheControl: "3600",
        upsert: false,
      });
    if (logoError) {
      setSubmitting(false);
      throw logoError;
    }

    for (const file of files.certificados) {
      const certificadoPath = `Institucion/${
        data.user.id
      }/documentos/${limpiarNombre(file.name)}`;
      const { data: extraCertificadoData, error: extraCertificadoError } =
        await supabase.storage
          .from("documentos")
          .upload(certificadoPath, file, {
            cacheControl: "3600",
            upsert: false,
          });
      if (extraCertificadoError) {
        setSubmitting(false);
        console.error("Error al subir el certificado:", extraCertificadoError);
        throw extraCertificadoError;
      }
      const { data: certificadoData, error: certificadoError } = await supabase
        .from("urldocumentoinstitucion")
        .insert({
          idinstitucion: data.user.id,
          urldocumento: certificadoPath,
          nombredocumento: file.name,
        });
      if (certificadoError) {
        setSubmitting(false);
        console.error("Error al registrar el certificado:", certificadoError);
        throw certificadoError;
      }
    }
    setSubmitting(false);
  };

  const listUniversities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("institucion")
      .select("nombre, idinstitucion, sede")
      .eq("estado", "activo");
    setLoading(false);
    if (error) throw Error("No se pudo consultar");
    return data;
  };

  const checkUniqueAtributes = async (
    usuarioData,
    conductorData,
    ligeroData,
    pesadoData
  ) => {
    setSubmitting(true);

    if (usuarioData?.telefono) {
      const { data: telData, error: telError } = await supabase
        .from("usuario")
        .select("telefono")
        .eq("telefono", usuarioData.telefono)
        .maybeSingle();
      if (telData) {
        setSubmitting(false);
        throw new Error("El teléfono ya está registrado.");
      }
    }

    if (usuarioData?.codigoestudiantil) {
      const { data: codData, error: codError } = await supabase
        .from("usuario")
        .select("codigoestudiantil")
        .eq("codigoestudiantil", usuarioData.codigoestudiantil)
        .maybeSingle();
      if (codData) {
        setSubmitting(false);
        throw new Error("El código estudiantil ya está registrado.");
      }
    }

    if (conductorData?.numerodelicencia) {
      const { data: licData, error: licError } = await supabase
        .from("conductor")
        .select("numerodelicencia")
        .eq("numerodelicencia", conductorData.numerodelicencia)
        .maybeSingle();
      if (licData) {
        setSubmitting(false);
        throw new Error("La licencia ya está registrada.");
      }
    }

    if (pesadoData?.placa) {
      const { data: placaData, error: placaError } = await supabase
        .from("vehiculopesado")
        .select("placa")
        .eq("placa", pesadoData.placa)
        .maybeSingle();
      if (placaData) {
        setSubmitting(false);
        throw new Error("La placa del vehiculo ya está registrada.");
      }
      setSubmitting(false);
    }

    if (ligeroData?.nserie) {
      const { data: serieData, error: serieError } = await supabase
        .from("vehiculoligero")
        .select("nserie")
        .eq("nserie", ligeroData.nserie)
        .maybeSingle();
      if (serieData) {
        setSubmitting(false);
        throw new Error("El número de serie ya está registrado.");
      }
    }
    setSubmitting(false);
  };

  const createUser = async (userData, formData) => {
    setSubmitting(true);

    const { email, password } = userData;
    const { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });
    console.log(data, error);
    if (error) {
      setSubmitting(false);
      throw error;
    }
    formData.nidentificacion = data.user.id;
    const result = await supabase.from("usuario").insert([formData]).select();
    setSubmitting(false);
    if (result.error) {
      throw result.error;
    }

    return result;
  };

  const createPassenger = async (formData) => {
    setSubmitting(true);
    const result = await supabase.from("pasajero").insert([formData]).select();
    setSubmitting(false);
    if (result.error) throw result.error;
    return result;
  };

  const submitPassengerFiles = async (files, userId) => {
    setSubmitting(true);

    try {
      // Configuración de archivos: bucket y si debe registrarse en la tabla
      const fileConfig = {
        avatar: { bucket: "publico", registerInDB: false },
        carneInstitucional: { bucket: "documentos", registerInDB: true },
        registroAcademico: { bucket: "documentos", registerInDB: true },
        documentoIdentidad: { bucket: "documentos", registerInDB: true },
      };

      let avatarPath = null; // Variable para guardar el path del avatar

      // Recorrer cada archivo
      for (const [fileKey, file] of Object.entries(files)) {
        if (!file) continue; // Saltar si no hay archivo

        const config = fileConfig[fileKey];
        if (!config) continue; // Saltar si no está configurado

        // Crear path del archivo
        const filePath = `Usuario/${userId}/${fileKey}/${limpiarNombre(
          file.name
        )}`;

        // Subir archivo al storage
        const { data, error } = await supabase.storage
          .from(config.bucket)
          .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (error) {
          console.error("Error al subir el archivo:", error);
          setSubmitting(false);
          throw error;
        }

        // Guardar el path del avatar para actualizar el usuario después
        if (fileKey === "avatar") {
          avatarPath = filePath;
        }

        // Registrar en la tabla si está configurado para hacerlo
        if (config.registerInDB) {
          const { data: docData, error: docError } = await supabase
            .from("urllmgdocumentousuario")
            .insert([
              {
                idusuario: userId,
                urllmgdocumento: filePath,
                nombredocumento: fileKey, // Usar el nombre del atributo como nombre del documento
              },
            ])
            .select();

          if (docError) {
            console.error(
              "Error al registrar el documento en la base de datos:",
              docError
            );
            setSubmitting(false);
            throw docError;
          }
        }
      }

      // Actualizar el urlAvatar del usuario si se subió un avatar
      if (avatarPath) {
        const { data: userData, error: userError } = await supabase
          .from("usuario")
          .update({ urlAvatar: avatarPath })
          .eq("nidentificacion", userId);

        if (userError) {
          console.error(
            "Error al actualizar el avatar del usuario:",
            userError
          );
          setSubmitting(false);
          throw userError;
        }
      }

      setSubmitting(false);
    } catch (error) {
      console.error("Error general en submitPassengerFiles:", error);
      setSubmitting(false);
      throw error;
    }
  };

  const submitVehicleFiles = async (files, vehicleId, userId) => {
    setSubmitting(true);

    try {
      // Iterar sobre los documentos del vehículo
      for (const file of files.documents) {
        const documentoPath = `Conductor/${userId}/Vehiculo/${vehicleId}/documentos/${limpiarNombre(
          file.name
        )}`;

        // Subir archivo al storage
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("documentos")
          .upload(documentoPath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) {
          setSubmitting(false);
          console.error(
            "Error al subir el documento del vehículo:",
            uploadError
          );
          throw uploadError;
        }

        // Registrar el documento en la tabla correspondiente
        const { data: documentoData, error: documentoError } = await supabase
          .from("urllmgdocumentovehiculo")
          .insert({
            idvehiculo: vehicleId,
            urllmgdocumento: documentoPath,
            nombredocumento: file.name,
          });

        if (documentoError) {
          setSubmitting(false);
          console.error(
            "Error al registrar el documento del vehículo:",
            documentoError
          );
          throw documentoError;
        }
      }

      setSubmitting(false);
    } catch (error) {
      console.error("Error general en submitVehicleFiles:", error);
      setSubmitting(false);
      throw error;
    }
  };

  const createVehicle = async (formData, vehicleType, vehicleData) => {
    setSubmitting(true);
    const result = await supabase
      .from("vehiculo")
      .insert([formData])
      .select("idvehiculo");
    console.log("Vehiculo creado", result);
    console.log("Primer elemento data:", result.data[0].idvehiculo);
    if (result.error) {
      setSubmitting(false);
      throw result.error;
    }
    vehicleData.idvehiculo = result.data[0].idvehiculo;
    if (vehicleType == "ligero") {
      console.log("Vehiculo ligero intermedio", vehicleData);
      const vehicleSoftResult = await supabase
        .from("vehiculoligero")
        .insert([vehicleData])
        .select();
      if (vehicleSoftResult.error) {
        setSubmitting(false);
        throw vehicleSoftResult.error;
      }
      return vehicleData;
    }
    if (vehicleType == "pesado") {
      const vehicleHardResult = await supabase
        .from("vehiculopesado")
        .insert([vehicleData])
        .select();
      setSubmitting(false);
      if (vehicleHardResult.error) throw vehicleHardResult.error;
      return vehicleData;
    }
  };

  const createDriver = async (formData) => {
    setSubmitting(true);
    const result = await supabase.from("conductor").insert([formData]).select();
    setSubmitting(false);
    if (result.error) throw result.error;
    return result;
  };

  return (
    <LoginContext.Provider
      value={{
        createUniversity,
        listUniversities,
        createUser,
        createPassenger,
        submitPassengerFiles,
        submitVehicleFiles,
        createVehicle,
        createDriver,
        checkUniqueAtributes,
        submitting,
        loading,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
