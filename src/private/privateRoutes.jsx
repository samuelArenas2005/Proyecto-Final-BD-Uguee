import React ,{useState,useEffect} from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from "../supabaseClient.js";


export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    // Suscribirse a cambios de auth
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!session || !session.user) {
    return <Navigate to={`/authUser/${role}`} state={{ from: location }} replace />;
  }

  return children;
}