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

import Monitor from "./pages/monitor/monitor";

import ProtectedRoute from "./private/privateRoutes";

import Prueba from "./pages/prueba/prueba";

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
        <Route path="/prueba" element={<Prueba />} />
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
          path="/conductor"
          element={
            <ProtectedRoute role="conductor">
              <Layout2>
                <ConductorPage />
              </Layout2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/conductor/viaje/:idruta"
          element={
            <ProtectedRoute role="conductor">
              <Layout2>
                <ConductorPageViaje />
              </Layout2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/conductor/reporte"
          element={
            <ProtectedRoute role="conductor">
              <Layout2>
                <ConductorPageReporteVia />
              </Layout2>
            </ProtectedRoute>
          }
        />
        <Route
          path="/universidad"
          element={
            <ProtectedRoute role="universidad">
              <LayoutUni>
                <UniversidadPage />
              </LayoutUni>
            </ProtectedRoute>
          }
        />
        <Route
          path="/monitor"
          element={
            <ProtectedRoute role="monitor">
              <Layout1>
                <Monitor />
              </Layout1>
            </ProtectedRoute>
          }
        />
        <Route
          path="/universidad/reportes"
          element={
            <ProtectedRoute role="universidad">
              <LayoutUni>
                <ReportesPage />
              </LayoutUni>
            </ProtectedRoute>
          }
        />
        <Route
          path="/universidad/monitoreo"
          element={
            <ProtectedRoute role="universidad">
              <LayoutUni>
                <MonitoreoPage />
              </LayoutUni>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout1>
                <AdminPage />
              </Layout1>
            </ProtectedRoute>
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
