// src/pages/Home/HomePage.jsx
import React, {useState} from 'react';
import { Link } from "react-router-dom"; // Eliminado useLocation si no se usa directamente aquí
import styles from './Home.module.css';
import homeImage from "../../../public/homeImage2.png"; // Asegúrate que la ruta sea correcta
import { BusFront, MapPin, Bot, BotIcon } from 'lucide-react'; // Iconos de Lucide React
import ChatModal from './chatBot';

const Home = () => {

  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  const abrirChatModal = () => {
    setIsChatModalOpen(true);
  };

  const cerrarChatModal = () => {
    setIsChatModalOpen(false);
  };


  return (
    <main className={styles.main}>
      <div className={styles.asistente}>
        <button className={styles.chatBot} onClick={abrirChatModal}><Bot color = "#1F255A" size = {40} /></button>
      </div>
      {/* Hero Section */}
      <section
        id="hero"
        className={styles.hero}
        style={{ backgroundImage: `url(${homeImage})` }}
      >
        <div className={styles.heroOverlay}></div>
        <div className={styles.heroContent}>
          <div className={styles.logoContainer}>
            <BusFront color="#ffffff" size={64} />
            <h1 className={styles.title}>Ugüee</h1>
          </div>
          <p className={styles.mainSubtitle}>Conectando Estudiantes Universitarios</p>
          <p className={styles.subtitle}>Ir a clase jamás había sido tan fácil.</p>
          <Link to="/prueba" className={styles.ctaButton}>
            Explorar Rutas
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className={styles.section}>
        <h2 className={styles.sectionTitle}>Sobre Nosotros</h2>
        <p className={styles.sectionText}>
          Ugüee es el servicio de transporte colaborativo que conecta estudiantes para facilitar sus desplazamientos dentro y fuera del campus universitario. Nuestra misión es ofrecer una alternativa de movilidad segura, económica y amigable con el medio ambiente.
        </p>
        {/* <Link to="/prueba">
          <button className={styles.secondaryButton}>
            Ir a prueba (Botón de ejemplo)
          </button>
        </Link> */}
      </section>

      {/* Services Section */}
      <section id="services" className={`${styles.section} ${styles.servicesSection}`}>
        <h2 className={styles.sectionTitle}>Nuestros Servicios</h2>
        <div className={styles.cardGrid}>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Viaje Compartido 🚗</h3>
            <p className={styles.cardText}>Encuentra compañeros que van en tu misma ruta y comparte el costo del viaje, haciendo tu trayecto más económico y divertido.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Reserva Anticipada 🗓️</h3>
            <p className={styles.cardText}>Programa tu viaje con antelación directamente desde nuestra app y asegura tu lugar sin contratiempos.</p>
          </div>
          <div className={styles.card}>
            <h3 className={styles.cardTitle}>Rutas Flexibles 🗺️</h3>
            <p className={styles.cardText}>Define puntos de recogida y entrega que se ajusten a tus necesidades dentro y fuera del área universitaria.</p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className={`${styles.section} ${styles.contactSection}`}>
        <h2 className={styles.sectionTitle}>Contáctanos</h2>
        <div className={styles.contactContent}>
          <div className={styles.contactFormContainer}>
            <p className={styles.sectionText}>
              ¿Tienes preguntas o sugerencias? Completa el formulario y nuestro equipo se pondrá en contacto contigo.
            </p>
            <form className={styles.form}>
              <input type="text" placeholder="Nombre Completo" className={styles.input} required />
              <input type="email" placeholder="Correo Electrónico Universitario" className={styles.input} required />
              <textarea placeholder="Tu Mensaje..." className={styles.textarea} rows="5" required  style={{resize: 'none',fontFamily:'Poppins'}}></textarea>
              <button type="submit" className={styles.submitButton}>Enviar Mensaje</button>
            </form>
          </div>
          
        </div>
      </section>
      {isChatModalOpen && <ChatModal onClose={cerrarChatModal} />}
    </main>
  );
};

export default Home;