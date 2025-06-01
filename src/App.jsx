import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout1 from "./layout/layout";
import Layout2 from "./layout/layout2";
import LayoutUni from "./layout/layoutUni";
import Home from "./pages/Home/Home";
import Login from "./pages/login/Login";
import AuthUser from "./pages/AuthUser/AuthUser";
import Pasajero from "./pages/pasajero/pasajero";
import UniversidadPage from "./pages/universidad/universidad";
import ReportesPage from "./pages/universidad/reportes";
import MonitoreoPage from "./pages/universidad/monitoreo";
import ConductorPage from "./pages/conductor/conductor";
import ConductorPageViaje from "./pages/conductor/viajeConductor";
import ConductorPageReporteVia from "./pages/conductor/reporteVia";
import AdminPage from "./pages/admin/adminPage";
import HistorialPasajero from "./pages/pasajero/historialPasajeros/HistorialPasajerosPage";
import Monitor from "./pages/monitor/monitor";

import ProtectedRoute from "./private/privateRoutes";


import Prueba from "./pages/prueba/prueba"

import NotFoundPage from "./pages/notFound";

import "./App.css";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <Layout1>
              <Home />
            </Layout1>
          }
        />
        <Route
          path="/login"
          element={
            <Layout1>
              <Login />
            </Layout1>
          }
        />
        <Route
          path="/prueba"
          element={
            <Prueba />
          }
        />
        <Route
          path="/authUser/:role"
          element={
            <Layout1>
              <AuthUser />
            </Layout1>
          }
        />
        <Route
          path="/pasajero"
          element={
            <ProtectedRoute role="pasajero">
            <Layout2>
              <Pasajero />
            </Layout2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/pasajero/actividad"
          element={
            <Layout2>
              <HistorialPasajero />
            </Layout2>
          }
        />
        <Route
          path="/conductor"
          element={
            <Layout2>
              <ConductorPage />
            </Layout2>
          }
        />
        <Route
          path="/conductor/viaje"
          element={
            <Layout2>
              <ConductorPageViaje />
            </Layout2>
          }
        />
        <Route
          path="/conductor/reporte"
          element={
            <Layout2>
              <ConductorPageReporteVia />
            </Layout2>
          }
        />
        <Route
          path="/universidad"
          element={
            <LayoutUni>
              <UniversidadPage />
            </LayoutUni>
          }
        />
         <Route
          path="/monitor"
          element={
            <Layout1>
              <Monitor />
            </Layout1>
          }
        />
        <Route
          path="/universidad/reportes"
          element={
            <LayoutUni>
              <ReportesPage />
            </LayoutUni>
          }
        />
        <Route
          path="/universidad/monitoreo"
          element={
            <LayoutUni>
              <MonitoreoPage />
            </LayoutUni>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout1>
              <AdminPage />
            </Layout1>
          }
        />
        <Route
          path="*"
          element={
            <Layout1>
              <NotFoundPage />
            </Layout1>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;

