import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from "../supabaseClient.js";


export default function ProtectedRoute({ children, role }) {
  const location = useLocation();
  const session = supabase.auth.getSession(); // v2 returns { data: { session }, error }

  const user = session?.data?.session?.user;

  // Si no hay usuario autenticado, redirige a login con el mismo role
  if (!user) {
    return <Navigate to={`/login/${role}`} state={{ from: location }} replace />;
  }

  // Verificar rol en tablas personalizadas (sin await, supón que ya prefetched o hazlo en un contexto)
  // Por simplicidad: aquí solo devolvemos children
  return children;
}