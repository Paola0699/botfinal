import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

import Cadenas from "./pages/Cadenas.jsx";
import NotFound from "./pages/NotFound.jsx";
import Leads from "./pages/Leads.jsx";
import CadenasMasivas from "./pages/CadenasMasivas.jsx";
import Training from "./pages/Training.jsx";
import Plantillas from "./pages/Plantillas.jsx";
import Login from "./pages/Login.jsx";

import PrivateRoute from "./routes/PrivateRoute.jsx";
import PublicRoute from "./routes/PublicRoute.jsx";
import NuevaPlantilla from "./pages/NuevaPlantilla.jsx";
import ContactosView from "./pages/Contactos.jsx";

const Home = () => <h1>Home Page</h1>;

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <BrowserRouter>
        <Routes>
          {/* Rutas públicas */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
          </Route>

          {/* Rutas privadas */}
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<App />}>
              <Route index element={<Home />} />
              <Route path="cadenas" element={<Cadenas />} />
              <Route path="leads" element={<Leads />} />
              <Route path="cadenas_masivas" element={<CadenasMasivas />} />
              <Route path="training" element={<Training />} />
              <Route path="plantillas" element={<Plantillas />} />
              <Route path="plantilla-nueva" element={<NuevaPlantilla />} />
              <Route path="contactos" element={<ContactosView />} />
            </Route>
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </React.StrictMode>
  );
} else {
  console.error("No se encontró el elemento 'root' en el DOM.");
}
