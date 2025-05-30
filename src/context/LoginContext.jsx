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
      .select("nombre, idinstitucion");
    setLoading(false);
    if (error) throw Error("No se pudo consultar");
    return data;
  }

  return (
    <LoginContext.Provider value={{ createUniversity, listUniversities, submitting, loading }}>
      {children}
    </LoginContext.Provider>
  );
};
