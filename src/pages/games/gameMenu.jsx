import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Gamepad2 } from 'lucide-react'; 
import styles from './gameMenu.module.css';

const GameSelectionPage = () => {
  const navigate = useNavigate();

  const handleNavigateTo2D = () => {
    navigate('/minijuego/taxigame2d');
  };

  const handleNavigateTo3D = () => {
    navigate('/minijuego/taxigame3d');
  };

  return (
    <div className={styles.pageContainer}>
      <h1 className={styles.mainTitle}>SELECCIONA UN JUEGO</h1>
      <div className={styles.cardsWrapper}>
        {/* Card para el Minijuego 2D */}
        <div className={styles.gameCard} onClick={handleNavigateTo2D}>
          <img
            src="/taxigame2d.png" 
            alt="Uguee Minigame 2D"
            className={styles.cardImage}
          />
          <div className={styles.cardOverlay} />
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>UGUEE MINIGAME 2D</h2>
            <div className={styles.playIconWrapper}>
              <Gamepad2 color="#aa00ff" size={48} />
              <span className={styles.playText}>PLAY</span>
            </div>
          </div>
        </div>

        {/* Card para el Minijuego 3D */}
        <div className={styles.gameCard} onClick={handleNavigateTo3D}>
          <img
            src="/taxigame3d.png" 
            alt="Uguee Minigame 3D"
            className={styles.cardImage}
          />
          <div className={styles.cardOverlay} />
          <div className={styles.cardContent}>
            <h2 className={styles.cardTitle}>UGUEE MINIGAME 3D</h2>
            <div className={styles.playIconWrapper}>
              <Gamepad2 color="#aa00ff" size={48} />
               <span className={styles.playText}>PLAY</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameSelectionPage;