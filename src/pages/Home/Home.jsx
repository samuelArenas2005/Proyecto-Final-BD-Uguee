// src/pages/Home/HomePage.jsx
import React from 'react';
import styles from './Home.module.css';
import homeImage from "../../../public/homeImage.png";

const Home= () => {
  return (
    <main className={styles.main}>
      <section id="hero" className={styles.hero}>
        <h1 className={styles.title}>Conectando Estudiantes Universitarios</h1>
        <p className={styles.subtitle}>Ir a clase jamás había sido tan fácil</p>
        <div className={styles.imageContainer}>
          <img src={homeImage} alt="Estudiantes conectados" className={styles.image} />
        </div>
      </section>

      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>Sobre Nosotros</h2>
        <p className={styles.sectionText}>
          Ugüee es el servicio de transporte colaborativo que conecta estudiantes para facilitar sus desplazamientos dentro del campus universitario.
        </p>
      </section>

      <section id="services" className={styles.section}>
        <h2 className={styles.sectionTitle}>Servicios</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Viaje Compartido</h3>
            <p className={styles.cardText}>Encuentra compañeros que van en tu misma ruta y comparte el costo.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Reserva Anticipada</h3>
            <p className={styles.cardText}>Programa tu viaje con antelación y asegura tu lugar.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Ruta Personalizada</h3>
            <p className={styles.cardText}>Define puntos de recogida y entrega dentro del campus.</p>
          </div>
        </div>
      </section>

      <section id="contact" className={styles.section}>
        <h2 className={styles.sectionTitle}>Contacto</h2>
        <form className={styles.form}>
          <input type="text" placeholder="Nombre" className={styles.input} />
          <input type="email" placeholder="Correo Electrónico" className={styles.input} />
          <textarea placeholder="Mensaje" className={styles.textarea}></textarea>
          <button type="submit" className={styles.submitButton}>Enviar</button>
        </form>
      </section>
    </main>
  );
};

export default Home;