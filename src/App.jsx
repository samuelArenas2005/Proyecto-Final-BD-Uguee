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
            <Layout2>
              <Pasajero />
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
