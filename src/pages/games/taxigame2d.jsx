import React, { useState, useEffect, useRef } from 'react';
import styles from './taxigame2d.module.css';
import { 
  Car, PersonStanding, Star, Trophy, Zap, Users, Clock, AlertTriangle, 
  ArrowUp, ArrowDown, ArrowLeft, ArrowRight 
} from 'lucide-react';

const TaxiGame = () => {
  // Estado del jugador
  const [player, setPlayer] = useState({ 
    x: 400, 
    y: 300,
    rotation: 0,
    carrying: null,
    maxPassengers: 1,
    speedModifier: 1,
    invertedControls: false
  });
  
  // Personas para recoger
  const [people, setPeople] = useState([
    { id: 1, x: 100, y: 100, destination: { x: 700, y: 100 }, collected: false },
    { id: 2, x: 700, y: 500, destination: { x: 100, y: 500 }, collected: false }
  ]);
  
  // Obstáculos
  const [obstacles, setObstacles] = useState([]);
  
  // Power-ups
  const [powerUps, setPowerUps] = useState([]);
  
  // Estado del juego
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameActive, setGameActive] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [activeEffects, setActiveEffects] = useState([]);
  
  const gameAreaRef = useRef(null);
  const keysPressed = useRef({ w: false, a: false, s: false, d: false });

  // Manejo de teclado
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!gameActive) return;
      
      switch(e.key.toLowerCase()) {
        case 'w': keysPressed.current.w = true; break;
        case 'a': keysPressed.current.a = true; break;
        case 's': keysPressed.current.s = true; break;
        case 'd': keysPressed.current.d = true; break;
        default: break;
      }
    };

    const handleKeyUp = (e) => {
      switch(e.key.toLowerCase()) {
        case 'w': keysPressed.current.w = false; break;
        case 'a': keysPressed.current.a = false; break;
        case 's': keysPressed.current.s = false; break;
        case 'd': keysPressed.current.d = false; break;
        default: break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameActive]);

  // Generar obstáculos según nivel
  const generateObstacles = (level) => {
    const newObstacles = [];
    const obstacleCount = Math.min(level * 2, 10); // Máximo 10 obstáculos
    
    for (let i = 0; i < obstacleCount; i++) {
      newObstacles.push({
        id: Date.now() + i,
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50,
        width: Math.random() > 0.7 ? 80 : 50,
        height: Math.random() > 0.7 ? 80 : 50
      });
    }
    
    return newObstacles;
  };

  // Generar power-up aleatorio
  const generatePowerUp = () => {
    const types = ['speed', 'double'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    return {
      id: Date.now(),
      x: Math.random() * 700 + 50,
      y: Math.random() * 500 + 50,
      type
    };
  };

  // Generar evento aleatorio
  const triggerRandomEvent = () => {
    const events = ['inverted', 'slow'];
    const event = events[Math.floor(Math.random() * events.length)];
    const duration = 5000; // 5 segundos
    
    setActiveEffects(prev => [...prev, { type: event, duration }]);
    
    if (event === 'inverted') {
      setPlayer(prev => ({ ...prev, invertedControls: true }));
      setTimeout(() => {
        setPlayer(prev => ({ ...prev, invertedControls: false }));
        setActiveEffects(prev => prev.filter(e => e.type !== 'inverted'));
      }, duration);
    } else if (event === 'slow') {
      setPlayer(prev => ({ ...prev, speedModifier: 0.5 }));
      setTimeout(() => {
        setPlayer(prev => ({ ...prev, speedModifier: 1 }));
        setActiveEffects(prev => prev.filter(e => e.type !== 'slow'));
      }, duration);
    }
  };

  // Bucle del juego
  useEffect(() => {
    if (!gameActive || gameOver) return;

    const gameLoop = setInterval(() => {
      // Actualizar posición del jugador
      setPlayer(prev => {
        let newX = prev.x;
        let newY = prev.y;
        let rotation = prev.rotation;
        
        // Determinar dirección según controles invertidos
        const controls = prev.invertedControls ? 
          { w: keysPressed.current.s, a: keysPressed.current.d, s: keysPressed.current.w, d: keysPressed.current.a } : 
          keysPressed.current;
        
        const speed = 5 * prev.speedModifier;
        
        if (controls.w) {
          newY -= speed;
          rotation = 0;
        }
        if (controls.s) {
          newY += speed;
          rotation = 180;
        }
        if (controls.a) {
          newX -= speed;
          rotation = 270;
        }
        if (controls.d) {
          newX += speed;
          rotation = 90;
        }

        // Limitar al área de juego
        newX = Math.max(30, Math.min(770, newX));
        newY = Math.max(30, Math.min(570, newY));

        return { ...prev, x: newX, y: newY, rotation };
      });

      // Verificar colisiones con obstáculos
      const playerRect = {
        x: player.x - 25,
        y: player.y - 25,
        width: 50,
        height: 50
      };
      
      obstacles.forEach(obstacle => {
        const obstacleRect = {
          x: obstacle.x - obstacle.width/2,
          y: obstacle.y - obstacle.height/2,
          width: obstacle.width,
          height: obstacle.height
        };
        
        if (
          playerRect.x < obstacleRect.x + obstacleRect.width &&
          playerRect.x + playerRect.width > obstacleRect.x &&
          playerRect.y < obstacleRect.y + obstacleRect.height &&
          playerRect.y + playerRect.height > obstacleRect.y
        ) {
          // Colisión detectada - penalizar tiempo
          setTimeLeft(prev => Math.max(0, prev - 3));
        }
      });

      // Verificar colisiones con power-ups
      powerUps.forEach(powerUp => {
        const distance = Math.sqrt(
          Math.pow(player.x - powerUp.x, 2) + 
          Math.pow(player.y - powerUp.y, 2)
        );
        
        if (distance < 40) {
          // Aplicar power-up
          if (powerUp.type === 'speed') {
            setPlayer(prev => ({ ...prev, speedModifier: 2 }));
            setActiveEffects(prev => [...prev, { type: 'speed', duration: 10000 }]);
            setTimeout(() => {
              setPlayer(prev => ({ ...prev, speedModifier: 1 }));
              setActiveEffects(prev => prev.filter(e => e.type !== 'speed'));
            }, 10000);
          } else if (powerUp.type === 'double') {
            setPlayer(prev => ({ ...prev, maxPassengers: 2 }));
            setActiveEffects(prev => [...prev, { type: 'double', duration: 15000 }]);
            setTimeout(() => {
              setPlayer(prev => ({ ...prev, maxPassengers: 1 }));
              setActiveEffects(prev => prev.filter(e => e.type !== 'double'));
            }, 15000);
          }
          
          // Eliminar power-up recolectado
          setPowerUps(prev => prev.filter(p => p.id !== powerUp.id));
        }
      });

      // Verificar colisiones con personas
      setPeople(prevPeople => {
        return prevPeople.map(person => {
          if (person.collected) return person;
          
          const distance = Math.sqrt(
            Math.pow(player.x - person.x, 2) + 
            Math.pow(player.y - person.y, 2)
          );
          
          if (distance < 40 && (!player.carrying || player.maxPassengers > 1)) {
            const carrying = player.carrying ? 
              [...player.carrying, person.id] : 
              [person.id];
              
            setPlayer(prev => ({ ...prev, carrying }));
            
            // 20% de probabilidad de evento aleatorio al recoger persona
            if (Math.random() < 0.2) {
              triggerRandomEvent();
            }
            
            return { ...person, collected: true };
          }
          
          return person;
        });
      });

      // Verificar entregas
      if (player.carrying && player.carrying.length > 0) {
        const carriedPeople = people.filter(p => 
          player.carrying.includes(p.id) && p.collected
        );
        
        carriedPeople.forEach(person => {
          const distance = Math.sqrt(
            Math.pow(player.x - person.destination.x, 2) + 
            Math.pow(player.y - person.destination.y, 2)
          );
          
          if (distance < 40) {
            setScore(prev => prev + 10);
            setTimeLeft(prev => prev + 10); // Añadir tiempo por entrega
            
            // Actualizar estado de carga
            const newCarrying = player.carrying.filter(id => id !== person.id);
            setPlayer(prev => ({ ...prev, carrying: newCarrying.length > 0 ? newCarrying : null }));
            
            // Eliminar persona entregada
            setPeople(prev => prev.filter(p => p.id !== person.id));
            
            // Generar nueva persona
            const newPerson = generateRandomPerson();
            setPeople(prev => [...prev, newPerson]);
            
            // 10% de probabilidad de generar power-up
            if (Math.random() < 0.1) {
              const newPowerUp = generatePowerUp();
              setPowerUps(prev => [...prev, newPowerUp]);
            }
          }
        });
      }
    }, 16); // ~60 FPS

    return () => clearInterval(gameLoop);
  }, [player, people, obstacles, powerUps, gameActive, gameOver]);

  // Temporizador
  useEffect(() => {
    if (!gameActive || gameOver) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setGameOver(true);
          setGameActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [gameActive, gameOver]);

  // Subir nivel cada 50 puntos
  useEffect(() => {
    const newLevel = Math.floor(score / 50) + 1;
    if (newLevel > level) {
      setLevel(newLevel);
      const newObstacles = generateObstacles(newLevel);
      setObstacles(newObstacles);
    }
  }, [score, level]);

  // Generar persona aleatoria
  const generateRandomPerson = () => {
    const id = Date.now();
    return {
      id,
      x: Math.random() * 700 + 50,
      y: Math.random() * 500 + 50,
      destination: {
        x: Math.random() * 700 + 50,
        y: Math.random() * 500 + 50
      },
      collected: false
    };
  };

  // Reiniciar juego
  const resetGame = () => {
    setPlayer({ 
      x: 400, 
      y: 300, 
      rotation: 0, 
      carrying: null,
      maxPassengers: 1,
      speedModifier: 1,
      invertedControls: false
    });
    setPeople([
      { id: 1, x: 100, y: 100, destination: { x: 700, y: 100 }, collected: false },
      { id: 2, x: 700, y: 500, destination: { x: 100, y: 500 }, collected: false }
    ]);
    setObstacles([]);
    setPowerUps([]);
    setScore(0);
    setLevel(1);
    setTimeLeft(60);
    setGameActive(true);
    setGameOver(false);
    setActiveEffects([]);
  };

  const audioRef = useRef(null);

  useEffect(() => {
    const audio = new Audio('/Casino Jazz.mp3');
    audio.loop = true;
    audioRef.current = audio;
    audio.play();

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);


  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Uguee MiniGame</h1>
        
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <Trophy className={styles.icon} />
            <span className={styles.statValue}>{score}</span>
          </div>
          
          <div className={styles.statItem}>
            <span className={styles.levelBadge}>Nivel {level}</span>
          </div>
          
          <div className={styles.statItem}>
            <Clock className={styles.icon} />
            <span className={styles.statValue}>{timeLeft}s</span>
          </div>
        </div>
        
      </div>

      {activeEffects.length > 0 && (
        <div className={styles.effectsContainer}>
          {activeEffects.map((effect, index) => (
            <div key={index} className={styles.effectBadge}>
              {effect.type === 'speed' && <Zap size={16} />}
              {effect.type === 'double' && <Users size={16} />}
              {effect.type === 'inverted' && <AlertTriangle size={16} />}
              {effect.type === 'slow' && <Clock size={16} />}
              <span>{effect.type}</span>
            </div>
          ))}
        </div>
      )}
      
      <div 
        ref={gameAreaRef} 
        className={styles.gameArea}
        style={{ backgroundColor: '#1a1a1a' }}
      >
      
        {obstacles.map(obstacle => (
          <div 
            key={obstacle.id}
            className={styles.obstacle}
            style={{ 
              left: obstacle.x, 
              top: obstacle.y,
              width: obstacle.width,
              height: obstacle.height
            }}
          />
        ))}
        
        
        {powerUps.map(powerUp => (
          <div 
            key={powerUp.id}
            className={`${styles.powerUp} ${styles[powerUp.type]}`}
            style={{ 
              left: powerUp.x, 
              top: powerUp.y,
            }}
          >
            {powerUp.type === 'speed' ? (
              <Zap size={24} color="#00ffaa" />
            ) : (
              <Users size={24} color="#ffaa00" />
            )}
          </div>
        ))}
        
      
        {people.map(person => (
          <div key={person.id}>
            {!person.collected && (
              <div 
                className={styles.person}
                style={{ left: person.x, top: person.y }}
              >
                <PersonStanding size={24} color="#00ffaa" />
              </div>
            )}
            
           
            <div 
              className={styles.destination}
              style={{ 
                left: person.destination.x, 
                top: person.destination.y,
                border: `2px dashed ${person.collected ? '#aa00ff' : '#ffaa00'}`
              }}
            >
              <Star size={20} color={person.collected ? '#aa00ff' : '#ffaa00'} />
            </div>
          </div>
        ))}
        
  
        <div 
          className={styles.player}
          style={{ 
            left: player.x, 
            top: player.y,
            transform: `rotate(${player.rotation}deg)`,
            backgroundColor: player.carrying ? '#aa00ff' : '#2c2c2c'
          }}
        >
          <Car size={28} color="#ffffff" />
          {player.carrying && (
            <div className={styles.passengerIndicator}>
              <PersonStanding size={16} color="#ffffff" />
              {player.maxPassengers > 1 && player.carrying.length > 1 && (
                <span className={styles.passengerCount}>{player.carrying.length}</span>
              )}
            </div>
          )}
        </div>
      </div>
      
    
      
      
      <div className={styles.controls}>
        <div className={styles.controlRow}>
          <div className={styles.key}><ArrowUp size={24} /></div>
        </div>
        <div className={styles.controlRow}>
          <div className={styles.key}><ArrowLeft size={24} /></div>
          <div className={styles.key}><ArrowDown size={24} /></div>
          <div className={styles.key}><ArrowRight size={24} /></div>
        </div>
        <p className={styles.instructions}>Usa las teclas WASD para mover el taxi</p>
      </div>
      
      <div className={styles.footer}>
        <button onClick={resetGame} className={styles.resetButton}>
          {gameOver ? 'Jugar de Nuevo' : 'Reiniciar Juego'}
        </button>
      </div>
      
      {gameOver && (
        <div className={styles.gameOver}>
          <h2>¡Tiempo Agotado!</h2>
          <p>Puntuación Final: <strong>{score}</strong></p>
          <p>Nivel Alcanzado: <strong>{level}</strong></p>
          <button onClick={resetGame} className={styles.resetButton}>
            Jugar de Nuevo
          </button>
        </div>
      )}
    </div>
  );
};

export default TaxiGame;