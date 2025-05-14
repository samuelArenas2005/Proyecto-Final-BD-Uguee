import React from 'react';
import { Link } from 'react-router-dom'; // Necesitarás react-router-dom para el Link
import './notFound.css'; // Asegúrate que el nombre del archivo CSS coincida

const NotFoundPage = () => {
  return (
    <div className="not-found-container">
      <h1>404</h1>
      <h2>Página No Encontrada</h2>
      <p>Lo sentimos, la página que estás buscando no existe.</p>
      <Link to="/">Volver a la página de inicio</Link>
    </div>
  );
};

export default NotFoundPage;