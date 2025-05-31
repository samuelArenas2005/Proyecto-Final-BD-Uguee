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

  //Funcion para crear una institucion
  const createUniversity = async (userData, formData) => {
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
    formData.idinstitucion = data.user.id;
    const result = await supabase
      .from("institucion")
      .insert([formData])
      .select();
    setSubmitting(false);
    if (result.error) throw result.error;
  };

  const listUniversities = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("institucion")
      .select("nombre, idinstitucion, sede");
    setLoading(false);
    if (error) throw Error("No se pudo consultar");
    return data;
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
    if (result.error) throw result.error;
    return result;
  };

  const createPassenger = async (formData) => {
    setSubmitting(true);
    const result = await supabase.from("pasajero").insert([formData]).select();
    setSubmitting(false);
    if (result.error) throw result.error;
    return result;
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
        createVehicle,
        createDriver,
        submitting,
        loading,
      }}
    >
      {children}
    </LoginContext.Provider>
  );
};
