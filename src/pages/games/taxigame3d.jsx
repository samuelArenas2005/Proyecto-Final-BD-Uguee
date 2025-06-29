import React, { Suspense, useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PointerLockControls, Box, Text } from "@react-three/drei";
import * as THREE from "three";

import styles from "./taxigame3d.module.css";

// — Enhanced Keyboard Hook —
function useKeyboard() {
  const [keys, setKeys] = useState({});

  useEffect(() => {
    const onKeyDown = (e) => {
      // Prevent default behaviors only for game keys
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "Space",
          "KeyF",
          "Escape",
          "KeyR",
          "KeyH",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      setKeys((prev) => ({ ...prev, [e.code]: true }));
    };

    const onKeyUp = (e) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "Space",
          "KeyF",
          "Escape",
          "KeyR",
          "KeyH",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
      setKeys((prev) => ({ ...prev, [e.code]: false }));
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, []);

  return keys;
}

// — Enhanced UI with fuel system and achievements —
function UI({
  score,
  isInVehicle,
  velocity,
  onGround,
  distanceToVehicle,
  passengers,
  destinations,
  playerPosition,
  currentPassenger,
  fuel = 100,
  timeOfDay = 0.8,
  achievements = [],
  totalTrips = 0,
  combo = 1,
}) {
  // Convert world coordinates to minimap
  const worldToMinimap = (worldPos) => {
    const scale = 100 / 200; // World 200x200 to minimap 100x100
    return {
      x: (worldPos[0] + 100) * scale,
      z: (worldPos[2] + 100) * scale,
    };
  };

  const playerMiniPos = worldToMinimap(playerPosition);

  const getTimeEmoji = () => {
    if (timeOfDay < 0.3) return "🌙";
    if (timeOfDay < 0.7) return "☀️";
    return "🌅";
  };

  return (
    <div className={styles.uiContainer}>
      <div className={styles.hud}>
        <div className={styles.topLeft}>
          <div className={styles.scoreSection}>
            <div className={styles.score}>🏆 Puntos: {score}</div>
            <div className={styles.trips}>🚖 Viajes: {totalTrips}</div>
            {combo > 1 && <div className={styles.combo}>🔥 Combo x{combo}</div>}
          </div>

          <div className={styles.status}>
            <div>🚶 Estado: {isInVehicle ? "🚗 Conduciendo" : "🚶 A Pie"}</div>
            <div>⚡ Velocidad: {velocity.toFixed(1)} km/h</div>
            <div>🌍 Suelo: {onGround ? "✅" : "❌"}</div>
            <div>
              {getTimeEmoji()} Hora: {Math.floor(timeOfDay * 24)}:00
            </div>
            {isInVehicle && (
              <div className={styles.fuelBar}>
                ⛽ Combustible:
                <div className={styles.fuelProgress}>
                  <div
                    className={styles.fuelFill}
                    style={{ width: `${fuel}%` }}
                  ></div>
                </div>
                <span>{Math.round(fuel)}%</span>
              </div>
            )}
            <div>
              🎯 Objetivo:{" "}
              {currentPassenger ? "Llevar al destino" : "Recoger pasajeros"}
            </div>
            {currentPassenger && (
              <div>🧑‍🤝‍🧑 Pasajero: {currentPassenger.name}</div>
            )}
          </div>

          {/* Achievement notifications */}
          {achievements.length > 0 && (
            <div className={styles.achievements}>
              <div className={styles.achievementTitle}>🏅 Logros:</div>
              {achievements.slice(-3).map((achievement, i) => (
                <div key={i} className={styles.achievementItem}>
                  {achievement}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className={styles.topRight}>
          <div className={styles.minimap}>
            <div className={styles.minimapTitle}>🗺️ Mini Mapa</div>
            <div className={styles.minimapContent}>
              {/* Player */}
              <div
                className={styles.playerDot}
                style={{
                  backgroundColor: isInVehicle ? "#ff4444" : "#00ff88",
                  left: `${playerMiniPos.x}%`,
                  top: `${playerMiniPos.z}%`,
                }}
              ></div>

              {/* NPCs not picked up */}
              {passengers.map((passenger, i) => {
                if (passenger.pickedUp) return null;
                const npcMiniPos = worldToMinimap(passenger.pos);
                return (
                  <div
                    key={`npc-mini-${i}`}
                    className={styles.npcDot}
                    style={{
                      left: `${npcMiniPos.x}%`,
                      top: `${npcMiniPos.z}%`,
                    }}
                  ></div>
                );
              })}

              {/* Destinations */}
              {destinations.map((dest, i) => {
                const destMiniPos = worldToMinimap(dest.pos);
                return (
                  <div
                    key={`dest-mini-${i}`}
                    className={styles.destinationDot}
                    style={{
                      left: `${destMiniPos.x}%`,
                      top: `${destMiniPos.z}%`,
                    }}
                  ></div>
                );
              })}
            </div>
          </div>
        </div>

        <div className={styles.bottomCenter}>
          {!isInVehicle && distanceToVehicle < 5 && (
            <div className={styles.interactionPrompt}>
              🚗 Presiona F para entrar al taxi
            </div>
          )}
          {isInVehicle && !currentPassenger && (
            <div className={styles.interactionPrompt}>
              🧑‍🤝‍🧑 Acércate a los NPCs verdes para recogerlos
            </div>
          )}
          {isInVehicle && currentPassenger && (
            <div className={styles.interactionPrompt}>
              🎯 Lleva a {currentPassenger.name} al destino marcado
            </div>
          )}
          {isInVehicle && fuel < 20 && (
            <div className={styles.warningPrompt}>
              ⚠️ ¡Combustible bajo! Encuentra una gasolinera
            </div>
          )}
          {isInVehicle && (
            <div className={styles.vehicleHud}>
              <div className={styles.speedometer}>
                <div className={styles.speedometerLabel}>🚗 Velocímetro</div>
                <div className={styles.speedValue}>{Math.round(velocity)}</div>
                <div className={styles.speedUnit}>km/h</div>
              </div>
              <div
                className={styles.interactionPrompt}
                style={{ marginLeft: "20px" }}
              >
                F: Salir | R: Bocina | H: Faros
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Crosshair */}
        <div className={styles.crosshair}>
          <div className={styles.crosshairDot}>⊕</div>
        </div>
      </div>

      <div className={styles.controls}>
        <div className={styles.controlsTitle}>🎮 Controles</div>
        <p>
          <strong>🖱️ Mouse:</strong> Mirar alrededor
        </p>
        <p>
          <strong>WASD:</strong> {isInVehicle ? "Conducir" : "Caminar"}
        </p>
        {!isInVehicle && (
          <p>
            <strong>Espacio:</strong> Saltar
          </p>
        )}
        <p>
          <strong>F:</strong>{" "}
          {isInVehicle ? "Salir del taxi" : "Entrar al taxi"}
        </p>
        {isInVehicle && (
          <>
            <p>
              <strong>R:</strong> Bocina
            </p>
            <p>
              <strong>H:</strong> Faros
            </p>
          </>
        )}
        <p>
          <strong>🎯 Click:</strong> Bloquear cursor (requerido)
        </p>
        <p>
          <strong>🚕 Objetivo:</strong> Recoge pasajeros y llévalos a su destino
        </p>
      </div>
    </div>
  );
}

// — Suelo mejorado con textura de ciudad —
function Ground() {
  return (
    <group>
      {/* Suelo principal */}
      <mesh position={[0, -0.1, 0]} receiveShadow>
        <boxGeometry args={[200, 0.2, 200]} />
        <meshStandardMaterial color="#404040" roughness={0.8} metalness={0.1} />
      </mesh>

      {/* Calles */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[8, 0.1, 200]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[200, 0.1, 8]} />
        <meshStandardMaterial color="#2a2a2a" />
      </mesh>

      {/* Líneas de la calle */}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={`line1-${i}`}
          position={[0, 0.05, -95 + i * 10]}
          receiveShadow
        >
          <boxGeometry args={[0.3, 0.02, 2]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      ))}
      {Array.from({ length: 20 }, (_, i) => (
        <mesh
          key={`line2-${i}`}
          position={[-95 + i * 10, 0.05, 0]}
          receiveShadow
        >
          <boxGeometry args={[2, 0.02, 0.3]} />
          <meshStandardMaterial color="#ffff00" />
        </mesh>
      ))}
    </group>
  );
}

// — Edificios y entorno urbano —
function CityEnvironment() {
  const buildings = [
    // Edificios altos
    { pos: [15, 8, 15], size: [6, 16, 6], color: "#4a5568" },
    { pos: [-20, 12, 20], size: [8, 24, 8], color: "#2d3748" },
    { pos: [25, 10, -25], size: [7, 20, 7], color: "#4a5568" },
    { pos: [-15, 6, -30], size: [5, 12, 5], color: "#718096" },
    { pos: [35, 15, 35], size: [10, 30, 10], color: "#2d3748" },

    // Edificios medianos
    { pos: [8, 4, -8], size: [4, 8, 4], color: "#a0aec0" },
    { pos: [-12, 3, 8], size: [3, 6, 3], color: "#cbd5e0" },
    { pos: [18, 5, 8], size: [4, 10, 4], color: "#4a5568" },
    { pos: [-25, 4, -15], size: [4, 8, 4], color: "#718096" },

    // Edificios pequeños (tiendas)
    { pos: [5, 1.5, 25], size: [3, 3, 3], color: "#e2e8f0" },
    { pos: [-8, 1.5, -18], size: [3, 3, 3], color: "#f7fafc" },
    { pos: [22, 1.5, -12], size: [3, 3, 3], color: "#edf2f7" },
  ];

  return (
    <group>
      {buildings.map((building, i) => (
        <group key={`building-${i}`}>
          {/* Edificio principal */}
          <mesh position={building.pos} castShadow receiveShadow>
            <boxGeometry args={building.size} />
            <meshStandardMaterial
              color={building.color}
              roughness={0.7}
              metalness={0.1}
            />
          </mesh>

          {/* Ventanas */}
          {building.size[1] > 10 &&
            Array.from(
              { length: Math.floor(building.size[1] / 3) },
              (_, floor) =>
                Array.from({ length: 3 }, (_, window) => (
                  <mesh
                    key={`window-${i}-${floor}-${window}`}
                    position={[
                      building.pos[0] + building.size[0] / 2 + 0.05,
                      building.pos[1] - building.size[1] / 2 + 2 + floor * 3,
                      building.pos[2] - building.size[2] / 2 + 1 + window * 2,
                    ]}
                  >
                    <boxGeometry args={[0.1, 1, 0.8]} />
                    <meshStandardMaterial
                      color="#87ceeb"
                      emissive="#4169e1"
                      emissiveIntensity={0.3}
                      transparent
                      opacity={0.8}
                    />
                  </mesh>
                ))
            )}
        </group>
      ))}

      {/* Postes de luz */}
      {Array.from({ length: 8 }, (_, i) => (
        <group key={`streetlight-${i}`}>
          <mesh position={[20 + i * 15, 3, 20]} castShadow>
            <cylinderGeometry args={[0.2, 0.3, 6]} />
            <meshStandardMaterial color="#666666" />
          </mesh>
          <mesh position={[20 + i * 15, 6.5, 20]}>
            <sphereGeometry args={[0.8]} />
            <meshStandardMaterial
              color="#ffffe0"
              emissive="#ffff99"
              emissiveIntensity={0.5}
            />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// — Vehículo realista con interior —
function RealisticVehicle({ position, isPlayerInVehicle }) {
  const vehicleRef = useRef();

  useFrame((state) => {
    if (vehicleRef.current && !isPlayerInVehicle) {
      // Animación sutil cuando está estacionado
      vehicleRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 1.5) * 0.05;
    }
  });

  return (
    <group position={position} ref={vehicleRef}>
      {/* Carrocería principal */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[4, 1.8, 7]} />
        <meshStandardMaterial color="#dc2626" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Techo */}
      <mesh position={[0, 0.5, -0.5]} castShadow>
        <boxGeometry args={[3.5, 1, 4]} />
        <meshStandardMaterial color="#b91c1c" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Parabrisas delantero */}
      <mesh position={[0, 0.8, 1.5]} castShadow>
        <boxGeometry args={[3.2, 1.2, 0.1]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Parabrisas trasero */}
      <mesh position={[0, 0.8, -2.5]} castShadow>
        <boxGeometry args={[3.2, 1.2, 0.1]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Ventanas laterales */}
      <mesh position={[1.8, 0.8, -0.5]} castShadow>
        <boxGeometry args={[0.1, 1.2, 3.5]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>
      <mesh position={[-1.8, 0.8, -0.5]} castShadow>
        <boxGeometry args={[0.1, 1.2, 3.5]} />
        <meshStandardMaterial
          color="#87ceeb"
          transparent
          opacity={0.7}
          metalness={0.1}
          roughness={0.1}
        />
      </mesh>

      {/* Ruedas realistas */}
      {[
        [1.6, -0.7, 2.5],
        [-1.6, -0.7, 2.5],
        [1.6, -0.7, -2.5],
        [-1.6, -0.7, -2.5],
      ].map((pos, i) => (
        <group key={`wheel-${i}`} position={pos}>
          {/* Llanta */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.6, 0.6, 0.4]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
          </mesh>
          {/* Rin */}
          <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
            <cylinderGeometry args={[0.4, 0.4, 0.45]} />
            <meshStandardMaterial
              color="#c0c0c0"
              metalness={0.8}
              roughness={0.2}
            />
          </mesh>
        </group>
      ))}

      {/* Faros delanteros */}
      <mesh position={[1, 0, 3.6]} castShadow>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>
      <mesh position={[-1, 0, 3.6]} castShadow>
        <sphereGeometry args={[0.3]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#ffffff"
          emissiveIntensity={0.3}
        />
      </mesh>

      {/* Luces traseras */}
      <mesh position={[1, 0, -3.6]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>
      <mesh position={[-1, 0, -3.6]} castShadow>
        <sphereGeometry args={[0.2]} />
        <meshStandardMaterial
          color="#ff0000"
          emissive="#ff0000"
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

// — Interior del vehículo —
function VehicleInterior() {
  return (
    <group>
      {/* Dashboard */}
      <mesh position={[0, -0.5, 1.8]}>
        <boxGeometry args={[3, 0.3, 0.8]} />
        <meshStandardMaterial color="#2d2d2d" roughness={0.6} />
      </mesh>

      {/* Volante */}
      <mesh position={[0.5, -0.2, 1.5]} rotation={[-0.3, 0, 0]}>
        <torusGeometry args={[0.3, 0.05]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Asientos */}
      <mesh position={[0.5, -0.8, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>
      <mesh position={[-0.5, -0.8, 0]}>
        <boxGeometry args={[0.8, 0.6, 0.8]} />
        <meshStandardMaterial color="#4a4a4a" />
      </mesh>

      {/* Marco del parabrisas desde adentro */}
      <mesh position={[0, 0.3, 1.5]}>
        <boxGeometry args={[3.4, 0.1, 0.15]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
    </group>
  );
}

// — Monedas —
function Coins({ onCollect, playerPosition }) {
  const [coins, setCoins] = useState([
    { id: 1, pos: [5, 2, 5] },
    { id: 2, pos: [-5, 2, -5] },
    { id: 3, pos: [10, 2, -10] },
    { id: 4, pos: [-10, 2, 15] },
    { id: 5, pos: [0, 2, 20] },
    { id: 6, pos: [18, 2, 18] },
  ]);

  // Animación de rotación para las monedas
  const meshRefs = useRef([]);

  useFrame((state) => {
    meshRefs.current.forEach((mesh, i) => {
      if (mesh) {
        mesh.rotation.y = state.clock.elapsedTime * 2;
        mesh.position.y =
          coins[i]?.pos[1] + Math.sin(state.clock.elapsedTime * 3 + i) * 0.3;
      }
    });
  });

  useEffect(() => {
    setCoins((prevCoins) => {
      return prevCoins.filter((coin) => {
        const distance = Math.sqrt(
          Math.pow(playerPosition[0] - coin.pos[0], 2) +
            Math.pow(playerPosition[1] - coin.pos[1], 2) +
            Math.pow(playerPosition[2] - coin.pos[2], 2)
        );

        if (distance < 3) {
          onCollect();
          return false;
        }
        return true;
      });
    });
  }, [playerPosition, onCollect]);

  return (
    <>
      {coins.map((c, i) => (
        <mesh
          key={c.id}
          position={c.pos}
          ref={(el) => (meshRefs.current[i] = el)}
        >
          <cylinderGeometry args={[0.8, 0.8, 0.3, 32]} />
          <meshStandardMaterial
            color="gold"
            emissive="yellow"
            emissiveIntensity={0.4}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </>
  );
}

// — Efectos de partículas para las monedas —
function ParticleEffect({ position, color = "#ffd700" }) {
  const particlesRef = useRef();
  const particleCount = 20;

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.5;
    }
  });

  return (
    <group position={position} ref={particlesRef}>
      {Array.from({ length: particleCount }, (_, i) => (
        <mesh
          key={i}
          position={[
            (Math.random() - 0.5) * 2,
            Math.random() * 2,
            (Math.random() - 0.5) * 2,
          ]}
        >
          <sphereGeometry args={[0.05]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.2}
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// — Sistema de clima dinámico —
function WeatherSystem() {
  const raindrops = useRef([]);

  useEffect(() => {
    // Generar gotas de lluvia
    for (let i = 0; i < 100; i++) {
      raindrops.current.push({
        x: (Math.random() - 0.5) * 200,
        y: Math.random() * 50 + 50,
        z: (Math.random() - 0.5) * 200,
        speed: Math.random() * 2 + 1,
      });
    }
  }, []);

  useFrame((state, delta) => {
    raindrops.current.forEach((drop) => {
      drop.y -= drop.speed;
      if (drop.y < 0) {
        drop.y = 50;
        drop.x = (Math.random() - 0.5) * 200;
        drop.z = (Math.random() - 0.5) * 200;
      }
    });
  });

  return (
    <group>
      {raindrops.current.map((drop, i) => (
        <mesh key={i} position={[drop.x, drop.y, drop.z]}>
          <sphereGeometry args={[0.02, 4, 4]} />
          <meshStandardMaterial color="#4a90e2" transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
}

// — Vehículo —
function Vehicle({ position, onMount, onDismount, isPlayerInVehicle }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current && !isPlayerInVehicle) {
      // Pequeña animación de flotación cuando no está en uso
      meshRef.current.position.y =
        position[1] + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <group position={position}>
      <mesh ref={meshRef}>
        <boxGeometry args={[3, 1.5, 6]} />
        <meshStandardMaterial color="#cc0000" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Ruedas */}
      <mesh position={[1.2, -0.5, 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.2, -0.5, 2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[1.2, -0.5, -2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[-1.2, -0.5, -2]}>
        <cylinderGeometry args={[0.4, 0.4, 0.3, 16]} />
        <meshStandardMaterial color="#333" />
      </mesh>
    </group>
  );
}

// — Controlador de jugador con colisiones mejoradas —
function PlayerController({
  playerPosition,
  setPlayerPosition,
  isInVehicle,
  setIsInVehicle,
  vehiclePosition,
  setVehiclePosition,
  setVelocity,
  setOnGround,
  setDistanceToVehicle,
}) {
  const { camera } = useThree();
  const keys = useKeyboard();
  const velocityRef = useRef(new THREE.Vector3());
  const vehicleVelocityRef = useRef(new THREE.Vector3());
  const onGroundRef = useRef(true);

  useFrame((state, delta) => {
    const deltaTime = Math.min(delta, 1 / 30);
    const walkSpeed = 8;
    const driveSpeed = 35;
    const jumpPower = 12;
    const gravity = -30;
    const groundY = 0;
    const vehicleHeight = 2;

    // Calcular distancia al vehículo
    const distToVehicle = Math.sqrt(
      Math.pow(playerPosition[0] - vehiclePosition[0], 2) +
        Math.pow(playerPosition[2] - vehiclePosition[2], 2)
    );
    setDistanceToVehicle(distToVehicle);

    // Verificar colisiones con edificios
    const checkBuildingCollision = (newPos) => {
      const buildings = [
        { pos: [15, 8, 15], size: [6, 16, 6] },
        { pos: [-20, 12, 20], size: [8, 24, 8] },
        { pos: [25, 10, -25], size: [7, 20, 7] },
        { pos: [-15, 6, -30], size: [5, 12, 5] },
        { pos: [35, 15, 35], size: [10, 30, 10] },
        { pos: [8, 4, -8], size: [4, 8, 4] },
        { pos: [-12, 3, 8], size: [3, 6, 3] },
        { pos: [18, 5, 8], size: [4, 10, 4] },
        { pos: [-25, 4, -15], size: [4, 8, 4] },
        { pos: [5, 1.5, 25], size: [3, 3, 3] },
        { pos: [-8, 1.5, -18], size: [3, 3, 3] },
        { pos: [22, 1.5, -12], size: [3, 3, 3] },
      ];

      for (let building of buildings) {
        const playerRadius = isInVehicle ? 2.5 : 0.8;
        const minX = building.pos[0] - building.size[0] / 2 - playerRadius;
        const maxX = building.pos[0] + building.size[0] / 2 + playerRadius;
        const minZ = building.pos[2] - building.size[2] / 2 - playerRadius;
        const maxZ = building.pos[2] + building.size[2] / 2 + playerRadius;
        const minY = building.pos[1] - building.size[1] / 2;
        const maxY = building.pos[1] + building.size[1] / 2;

        if (
          newPos[0] > minX &&
          newPos[0] < maxX &&
          newPos[2] > minZ &&
          newPos[2] < maxZ &&
          newPos[1] > minY &&
          newPos[1] < maxY + 2
        ) {
          return true;
        }
      }
      return false;
    };

    if (isInVehicle) {
      // LÓGICA DEL VEHÍCULO
      const currentPos = vehiclePosition;
      const targetY = vehicleHeight;
      const isOnGround = Math.abs(currentPos[1] - targetY) < 0.2;
      onGroundRef.current = isOnGround;
      setOnGround(isOnGround);

      // Movimiento del vehículo basado en la cámara
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();

      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

      const moveDirection = new THREE.Vector3();

      if (keys.KeyW) moveDirection.add(forward);
      if (keys.KeyS) moveDirection.sub(forward);
      if (keys.KeyA) moveDirection.sub(right);
      if (keys.KeyD) moveDirection.add(right);

      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        moveDirection.multiplyScalar(driveSpeed);

        vehicleVelocityRef.current.x = THREE.MathUtils.lerp(
          vehicleVelocityRef.current.x,
          moveDirection.x,
          deltaTime * 6
        );
        vehicleVelocityRef.current.z = THREE.MathUtils.lerp(
          vehicleVelocityRef.current.z,
          moveDirection.z,
          deltaTime * 6
        );
      } else {
        // Fricción del vehículo
        vehicleVelocityRef.current.x = THREE.MathUtils.lerp(
          vehicleVelocityRef.current.x,
          0,
          deltaTime * 4
        );
        vehicleVelocityRef.current.z = THREE.MathUtils.lerp(
          vehicleVelocityRef.current.z,
          0,
          deltaTime * 4
        );
      }

      // Calcular nueva posición del vehículo
      let newVehiclePos = [
        currentPos[0] + vehicleVelocityRef.current.x * deltaTime,
        currentPos[1],
        currentPos[2] + vehicleVelocityRef.current.z * deltaTime,
      ];

      // Colisiones del vehículo
      if (checkBuildingCollision(newVehiclePos)) {
        let testPosX = [
          currentPos[0] + vehicleVelocityRef.current.x * deltaTime,
          currentPos[1],
          currentPos[2],
        ];
        if (!checkBuildingCollision(testPosX)) {
          newVehiclePos[0] = testPosX[0];
          newVehiclePos[2] = currentPos[2];
          vehicleVelocityRef.current.z *= 0.1;
        } else {
          let testPosZ = [
            currentPos[0],
            currentPos[1],
            currentPos[2] + vehicleVelocityRef.current.z * deltaTime,
          ];
          if (!checkBuildingCollision(testPosZ)) {
            newVehiclePos[0] = currentPos[0];
            newVehiclePos[2] = testPosZ[2];
            vehicleVelocityRef.current.x *= 0.1;
          } else {
            newVehiclePos[0] = currentPos[0];
            newVehiclePos[2] = currentPos[2];
            vehicleVelocityRef.current.x *= -0.3;
            vehicleVelocityRef.current.z *= -0.3;
          }
        }
      }

      // Limitar área del vehículo
      const worldBound = 90;
      if (Math.abs(newVehiclePos[0]) > worldBound) {
        newVehiclePos[0] = Math.sign(newVehiclePos[0]) * worldBound;
        vehicleVelocityRef.current.x *= -0.5;
      }
      if (Math.abs(newVehiclePos[2]) > worldBound) {
        newVehiclePos[2] = Math.sign(newVehiclePos[2]) * worldBound;
        vehicleVelocityRef.current.z *= -0.5;
      }

      setVehiclePosition(newVehiclePos);
      setPlayerPosition([
        newVehiclePos[0],
        newVehiclePos[1] + 0.5,
        newVehiclePos[2],
      ]);

      // Cámara en tercera persona para el vehículo - Vista desde atrás
      const vehicleDirection = new THREE.Vector3();
      camera.getWorldDirection(vehicleDirection);

      // Posición de la cámara detrás del vehículo
      const cameraOffset = new THREE.Vector3(0, 6, -12);
      const targetCameraPos = new THREE.Vector3(...newVehiclePos).add(
        cameraOffset
      );

      // Suavizar movimiento de cámara
      camera.position.lerp(targetCameraPos, deltaTime * 2);

      // La cámara mira hacia adelante del vehículo
      const lookAtPoint = new THREE.Vector3(
        newVehiclePos[0],
        newVehiclePos[1] + 2,
        newVehiclePos[2] + 5
      );
      camera.lookAt(lookAtPoint);

      // Velocidad para UI
      const speed =
        Math.sqrt(
          vehicleVelocityRef.current.x ** 2 + vehicleVelocityRef.current.z ** 2
        ) * 3.6;
      setVelocity(speed);
    } else {
      // LÓGICA DEL JUGADOR A PIE
      const targetY = groundY;
      const isOnGround = Math.abs(playerPosition[1] - targetY) < 0.2;
      onGroundRef.current = isOnGround;
      setOnGround(isOnGround);

      // Movimiento del jugador
      const forward = new THREE.Vector3();
      const right = new THREE.Vector3();

      camera.getWorldDirection(forward);
      forward.y = 0;
      forward.normalize();
      right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

      const moveDirection = new THREE.Vector3();

      if (keys.KeyW) moveDirection.add(forward);
      if (keys.KeyS) moveDirection.sub(forward);
      if (keys.KeyA) moveDirection.sub(right);
      if (keys.KeyD) moveDirection.add(right);

      if (moveDirection.length() > 0) {
        moveDirection.normalize();
        moveDirection.multiplyScalar(walkSpeed);

        velocityRef.current.x = THREE.MathUtils.lerp(
          velocityRef.current.x,
          moveDirection.x,
          deltaTime * 15
        );
        velocityRef.current.z = THREE.MathUtils.lerp(
          velocityRef.current.z,
          moveDirection.z,
          deltaTime * 15
        );
      } else {
        velocityRef.current.x = THREE.MathUtils.lerp(
          velocityRef.current.x,
          0,
          deltaTime * 12
        );
        velocityRef.current.z = THREE.MathUtils.lerp(
          velocityRef.current.z,
          0,
          deltaTime * 12
        );
      }

      // Salto
      if (keys.Space && isOnGround) {
        velocityRef.current.y = jumpPower;
      }

      // Gravedad
      if (!isOnGround || velocityRef.current.y > 0) {
        velocityRef.current.y += gravity * deltaTime;
      }

      // Nueva posición del jugador
      let newPosition = [
        playerPosition[0] + velocityRef.current.x * deltaTime,
        playerPosition[1] + velocityRef.current.y * deltaTime,
        playerPosition[2] + velocityRef.current.z * deltaTime,
      ];

      // Colisiones del jugador
      if (checkBuildingCollision(newPosition)) {
        let testPosX = [
          playerPosition[0] + velocityRef.current.x * deltaTime,
          newPosition[1],
          playerPosition[2],
        ];

        if (!checkBuildingCollision(testPosX)) {
          newPosition[0] = testPosX[0];
          newPosition[2] = playerPosition[2];
          velocityRef.current.z *= 0.1;
        } else {
          let testPosZ = [
            playerPosition[0],
            newPosition[1],
            playerPosition[2] + velocityRef.current.z * deltaTime,
          ];

          if (!checkBuildingCollision(testPosZ)) {
            newPosition[0] = playerPosition[0];
            newPosition[2] = testPosZ[2];
            velocityRef.current.x *= 0.1;
          } else {
            newPosition[0] = playerPosition[0];
            newPosition[2] = playerPosition[2];
            velocityRef.current.x *= -0.3;
            velocityRef.current.z *= -0.3;
          }
        }
      }

      // Limitar Y al suelo
      if (newPosition[1] < groundY) {
        newPosition[1] = groundY;
        velocityRef.current.y = 0;
      }

      // Limitar área del jugador
      const worldBound = 90;
      if (Math.abs(newPosition[0]) > worldBound) {
        newPosition[0] = Math.sign(newPosition[0]) * worldBound;
        velocityRef.current.x *= -0.5;
      }
      if (Math.abs(newPosition[2]) > worldBound) {
        newPosition[2] = Math.sign(newPosition[2]) * worldBound;
        velocityRef.current.z *= -0.5;
      }

      setPlayerPosition(newPosition);

      // Cámara primera persona
      const walkingBob = Math.sin(state.clock.elapsedTime * 8) * 0.1;
      const eyeHeight =
        1.7 +
        (Math.abs(velocityRef.current.x) + Math.abs(velocityRef.current.z) > 1
          ? walkingBob
          : 0);

      camera.position.lerp(
        new THREE.Vector3(
          newPosition[0],
          newPosition[1] + eyeHeight,
          newPosition[2]
        ),
        deltaTime * 8
      );

      // Velocidad para UI
      const speed =
        Math.sqrt(velocityRef.current.x ** 2 + velocityRef.current.z ** 2) *
        2.8;
      setVelocity(speed);
    }
  });

  // Entrada/salida del vehículo con animación mejorada
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.code === "KeyF") {
        const distanceToVehicle = Math.sqrt(
          Math.pow(playerPosition[0] - vehiclePosition[0], 2) +
            Math.pow(playerPosition[2] - vehiclePosition[2], 2)
        );

        if (!isInVehicle && distanceToVehicle < 5) {
          // Entrar al vehículo
          setIsInVehicle(true);
          setPlayerPosition([
            vehiclePosition[0],
            vehiclePosition[1] + 0.5,
            vehiclePosition[2],
          ]);
          velocityRef.current.set(0, 0, 0);
          vehicleVelocityRef.current.set(0, 0, 0);
        } else if (isInVehicle) {
          // Salir del vehículo
          setIsInVehicle(false);
          setPlayerPosition([vehiclePosition[0] + 3.5, 0, vehiclePosition[2]]);
          velocityRef.current.set(0, 0, 0);
          vehicleVelocityRef.current.set(0, 0, 0);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    playerPosition,
    vehiclePosition,
    isInVehicle,
    setIsInVehicle,
    setPlayerPosition,
  ]);

  // Enhanced fuel and time system
  useEffect(() => {
    const gameLoop = setInterval(() => {
      // Fuel consumption when in vehicle
      if (isInVehicle && velocity > 0) {
        setFuel((prev) => Math.max(0, prev - velocity * 0.01));
      }
    }, 100);

    return () => clearInterval(gameLoop);
  }, [isInVehicle]);

  return null;
}

// — NPCs (Pasajeros) —
function NPCs({
  playerPosition,
  isInVehicle,
  onPickup,
  passengers,
  destinations,
}) {
  const npcRefs = useRef([]);

  // Animación de los NPCs
  useFrame((state) => {
    npcRefs.current.forEach((npc, i) => {
      if (npc && passengers[i] && !passengers[i].pickedUp) {
        // Animación de flotación
        npc.position.y =
          passengers[i].pos[1] +
          Math.sin(state.clock.elapsedTime * 2 + i) * 0.2;
        // Rotación suave
        npc.rotation.y = state.clock.elapsedTime * 0.5 + i;
      }
    });
  });

  // Verificar recogida de pasajeros
  useEffect(() => {
    if (!isInVehicle) return;

    passengers.forEach((passenger, index) => {
      if (!passenger.pickedUp) {
        const distance = Math.sqrt(
          Math.pow(playerPosition[0] - passenger.pos[0], 2) +
            Math.pow(playerPosition[2] - passenger.pos[2], 2)
        );

        if (distance < 4) {
          onPickup(index);
        }
      }
    });
  }, [playerPosition, isInVehicle, passengers, onPickup]);

  return (
    <>
      {passengers.map(
        (passenger, i) =>
          !passenger.pickedUp && (
            <group key={`passenger-${i}`} position={passenger.pos}>
              {/* NPC Principal */}
              <mesh ref={(el) => (npcRefs.current[i] = el)}>
                <capsuleGeometry args={[0.3, 1.2]} />
                <meshStandardMaterial
                  color={passenger.color}
                  roughness={0.6}
                  metalness={0.1}
                />
              </mesh>

              {/* Cabeza */}
              <mesh position={[0, 1, 0]}>
                <sphereGeometry args={[0.25]} />
                <meshStandardMaterial color="#ffdbac" roughness={0.8} />
              </mesh>

              {/* Indicador de recogida */}
              <mesh position={[0, 2.5, 0]}>
                <coneGeometry args={[0.3, 0.8]} />
                <meshStandardMaterial
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={0.3}
                  transparent
                  opacity={0.8}
                />
              </mesh>

              {/* Partículas alrededor del NPC */}
              {Array.from({ length: 6 }, (_, j) => (
                <mesh
                  key={`particle-${j}`}
                  position={[
                    Math.cos((j * Math.PI) / 3) * 1.5,
                    1 + Math.sin(Date.now() * 0.003 + j) * 0.3,
                    Math.sin((j * Math.PI) / 3) * 1.5,
                  ]}
                >
                  <sphereGeometry args={[0.05]} />
                  <meshStandardMaterial
                    color="#00ff88"
                    emissive="#00ff88"
                    emissiveIntensity={0.5}
                    transparent
                    opacity={0.7}
                  />
                </mesh>
              ))}
            </group>
          )
      )}

      {/* Destinos */}
      {destinations.map((dest, i) => (
        <group key={`destination-${i}`} position={dest.pos}>
          {/* Área de destino */}
          <mesh position={[0, 0.1, 0]}>
            <cylinderGeometry args={[2, 2, 0.2]} />
            <meshStandardMaterial
              color="#ff6600"
              emissive="#ff3300"
              emissiveIntensity={0.2}
              transparent
              opacity={0.6}
            />
          </mesh>

          {/* Marcador vertical */}
          <mesh position={[0, 3, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 6]} />
            <meshStandardMaterial color="#ff6600" />
          </mesh>

          {/* Bandera */}
          <mesh position={[0.5, 5, 0]}>
            <boxGeometry args={[1, 0.6, 0.1]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.3}
            />
          </mesh>

          {/* Anillo de destino animado */}
          <mesh position={[0, 1, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.5, 0.1]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.4}
              transparent
              opacity={0.8}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// — Elementos ambientales adicionales —
function EnvironmentalElements() {
  return (
    <group>
      {/* Semáforos */}
      {[
        [15, 0, 0],
        [-15, 0, 0],
        [0, 0, 15],
        [0, 0, -15],
      ].map((pos, i) => (
        <group key={`traffic-light-${i}`} position={pos}>
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 4]} />
            <meshStandardMaterial color="#444444" />
          </mesh>
          <mesh position={[0, 3.5, 0]}>
            <boxGeometry args={[0.4, 1, 0.3]} />
            <meshStandardMaterial color="#222222" />
          </mesh>
          {/* Luces del semáforo */}
          <mesh position={[0, 3.8, 0.16]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial
              color="#ff0000"
              emissive="#ff0000"
              emissiveIntensity={0.5}
            />
          </mesh>
          <mesh position={[0, 3.5, 0.16]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.3}
            />
          </mesh>
          <mesh position={[0, 3.2, 0.16]}>
            <sphereGeometry args={[0.08]} />
            <meshStandardMaterial color="#00ff00" />
          </mesh>
        </group>
      ))}

      {/* Bancos y mobiliario urbano */}
      {[
        [45, 0, -30],
        [-55, 0, 25],
        [30, 0, 45],
        [-40, 0, -35],
        [65, 0, 15],
        [-25, 0, 55],
      ].map((position, i) => (
        <group key={`bench-${i}`} position={position}>
          <mesh position={[0, 0.4, 0]}>
            <boxGeometry args={[2, 0.1, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[0, 0.8, 0]}>
            <boxGeometry args={[2, 0.1, 0.4]} />
            <meshStandardMaterial color="#8B4513" />
          </mesh>
          <mesh position={[-0.8, 0.6, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.4]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
          <mesh position={[0.8, 0.6, 0]}>
            <boxGeometry args={[0.1, 0.4, 0.4]} />
            <meshStandardMaterial color="#654321" />
          </mesh>
        </group>
      ))}

      {/* Árboles */}
      {[
        [-45, 0, 30],
        [60, 0, -20],
        [-30, 0, -45],
        [75, 0, 40],
        [-60, 0, 15],
        [25, 0, 65],
        [-15, 0, -70],
        [50, 0, -5],
        [-70, 0, -25],
        [35, 0, -50],
        [-25, 0, 50],
        [65, 0, 10],
      ].map((position, i) => (
        <group key={`tree-${i}`} position={position}>
          {/* Tronco */}
          <mesh position={[0, 2, 0]}>
            <cylinderGeometry args={[0.3, 0.4, 4]} />
            <meshStandardMaterial color="#8B4513" roughness={0.8} />
          </mesh>
          {/* Copa del árbol */}
          <mesh position={[0, 5, 0]}>
            <sphereGeometry args={[2]} />
            <meshStandardMaterial color="#228B22" roughness={0.7} />
          </mesh>
          {/* Hojas adicionales */}
          <mesh position={[1, 5.5, 0]}>
            <sphereGeometry args={[1.2]} />
            <meshStandardMaterial color="#32CD32" roughness={0.7} />
          </mesh>
          <mesh position={[-0.8, 4.8, 0.8]}>
            <sphereGeometry args={[1]} />
            <meshStandardMaterial color="#90EE90" roughness={0.7} />
          </mesh>
        </group>
      ))}

      {/* Papeleras */}
      {[
        [35, 0.5, 20],
        [-45, 0.5, -15],
        [60, 0.5, 35],
        [-30, 0.5, 50],
        [25, 0.5, -40],
        [-55, 0.5, 10],
        [70, 0.5, -25],
        [-20, 0.5, -60],
      ].map((position, i) => (
        <mesh key={`trash-${i}`} position={position}>
          <cylinderGeometry args={[0.3, 0.4, 1]} />
          <meshStandardMaterial color="#666666" />
        </mesh>
      ))}

      {/* Carteles y señales */}
      {Array.from({ length: 4 }, (_, i) => (
        <group key={`sign-${i}`} position={[20 + i * 25, 0, -40]}>
          <mesh position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 3]} />
            <meshStandardMaterial color="#888888" />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[1.5, 0.8, 0.1]} />
            <meshStandardMaterial color="#4169E1" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

// — Gas Stations —
function GasStations({ playerPosition, isInVehicle, onRefuel, fuel }) {
  const [gasStations] = useState([
    { id: 1, pos: [45, 0, 45], name: "Shell Station" },
    { id: 2, pos: [-45, 0, -45], name: "BP Station" },
    { id: 3, pos: [45, 0, -45], name: "Exxon Station" },
    { id: 4, pos: [-45, 0, 45], name: "Texaco Station" },
  ]);

  const stationRefs = useRef([]);

  // Animation for gas stations
  useFrame((state) => {
    stationRefs.current.forEach((station, i) => {
      if (
        station &&
        station.children &&
        station.children[2] &&
        station.children[2].material
      ) {
        // Animated neon sign
        station.children[2].material.emissiveIntensity =
          0.3 + Math.sin(state.clock.elapsedTime * 3) * 0.2;
      }
    });
  });

  // Check for refueling
  useEffect(() => {
    if (!isInVehicle || fuel >= 95) return;

    gasStations.forEach((station) => {
      const distance = Math.sqrt(
        Math.pow(playerPosition[0] - station.pos[0], 2) +
          Math.pow(playerPosition[2] - station.pos[2], 2)
      );

      if (distance < 8) {
        onRefuel();
      }
    });
  }, [playerPosition, isInVehicle, gasStations, onRefuel, fuel]);

  return (
    <>
      {gasStations.map((station, i) => (
        <group key={`gas-station-${i}`} position={station.pos}>
          {/* Station building */}
          <mesh
            ref={(el) => (stationRefs.current[i] = el)}
            position={[0, 2, 0]}
          >
            <boxGeometry args={[8, 4, 6]} />
            <meshStandardMaterial color="#e8e8e8" />
          </mesh>

          {/* Canopy */}
          <mesh position={[0, 4.5, 0]}>
            <boxGeometry args={[12, 0.3, 10]} />
            <meshStandardMaterial color="#ff0000" />
          </mesh>

          {/* Neon sign */}
          <mesh position={[0, 5.5, 3.1]}>
            <boxGeometry args={[6, 1, 0.2]} />
            <meshStandardMaterial
              color="#ffff00"
              emissive="#ffff00"
              emissiveIntensity={0.5}
            />
          </mesh>

          {/* Gas pumps */}
          {[
            [-3, 0, 2],
            [3, 0, 2],
            [-3, 0, -2],
            [3, 0, -2],
          ].map((pos, j) => (
            <group key={`pump-${j}`} position={pos}>
              <mesh position={[0, 0.7, 0]}>
                <boxGeometry args={[0.6, 1.4, 0.4]} />
                <meshStandardMaterial color="#333333" />
              </mesh>
              <mesh position={[0, 1.5, 0.25]}>
                <boxGeometry args={[0.4, 0.3, 0.1]} />
                <meshStandardMaterial
                  color="#00ff00"
                  emissive="#00ff00"
                  emissiveIntensity={0.3}
                />
              </mesh>
            </group>
          ))}

          {/* Station sign with text */}
          <group position={[0, 6, 3.2]}>
            <Text
              fontSize={0.8}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {station.name}
            </Text>
          </group>
        </group>
      ))}
    </>
  );
}

// — Traffic Cars (AI vehicles) —
function TrafficCars() {
  const [trafficCars] = useState([
    { id: 1, pos: [20, 1, 0], direction: [1, 0, 0], color: "#0066cc" },
    { id: 2, pos: [-20, 1, 0], direction: [-1, 0, 0], color: "#cc6600" },
    { id: 3, pos: [0, 1, 20], direction: [0, 0, -1], color: "#006600" },
    { id: 4, pos: [0, 1, -20], direction: [0, 0, 1], color: "#990099" },
  ]);

  const carRefs = useRef([]);

  useFrame((state, delta) => {
    carRefs.current.forEach((car, i) => {
      if (car && trafficCars[i]) {
        const speed = 15 * delta;
        const direction = trafficCars[i].direction;

        car.position.x += direction[0] * speed;
        car.position.z += direction[2] * speed;

        // Reset position when out of bounds
        if (Math.abs(car.position.x) > 100 || Math.abs(car.position.z) > 100) {
          car.position.set(...trafficCars[i].pos);
        }
      }
    });
  });

  return (
    <>
      {trafficCars.map((car, i) => (
        <group
          key={`traffic-car-${i}`}
          ref={(el) => (carRefs.current[i] = el)}
          position={car.pos}
        >
          {/* Car body */}
          <mesh>
            <boxGeometry args={[3, 1.2, 5]} />
            <meshStandardMaterial
              color={car.color}
              metalness={0.7}
              roughness={0.3}
            />
          </mesh>

          {/* Car roof */}
          <mesh position={[0, 0.4, -0.5]}>
            <boxGeometry args={[2.8, 0.8, 3]} />
            <meshStandardMaterial
              color={car.color}
              metalness={0.6}
              roughness={0.4}
            />
          </mesh>

          {/* Wheels */}
          {[
            [1.3, -0.4, 1.8],
            [-1.3, -0.4, 1.8],
            [1.3, -0.4, -1.8],
            [-1.3, -0.4, -1.8],
          ].map((pos, j) => (
            <mesh
              key={`wheel-${j}`}
              position={pos}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.4, 0.4, 0.3]} />
              <meshStandardMaterial color="#1a1a1a" />
            </mesh>
          ))}

          {/* Headlights */}
          <mesh position={[0.8, 0, 2.6]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.4}
            />
          </mesh>
          <mesh position={[-0.8, 0, 2.6]}>
            <sphereGeometry args={[0.2]} />
            <meshStandardMaterial
              color="#ffffff"
              emissive="#ffffff"
              emissiveIntensity={0.4}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}

// — Componente principal mejorado —
export default function TaxiGame() {
  const [score, setScore] = useState(0);
  const [playerPosition, setPlayerPosition] = useState([0, 0, 0]);
  const [vehiclePosition, setVehiclePosition] = useState([0, 1, 10]);
  const [isInVehicle, setIsInVehicle] = useState(false);
  const [velocity, setVelocity] = useState(0);
  const [onGround, setOnGround] = useState(true);
  const [distanceToVehicle, setDistanceToVehicle] = useState(100);
  const [gameStarted, setGameStarted] = useState(false);
  const [currentPassenger, setCurrentPassenger] = useState(null);
  const [fuel, setFuel] = useState(100);
  const [timeOfDay, setTimeOfDay] = useState(0.6);
  const [achievements, setAchievements] = useState([]);
  const [totalTrips, setTotalTrips] = useState(0);
  const [combo, setCombo] = useState(1);
  const [lastHonkTime, setLastHonkTime] = useState(0);
  const [headlightsOn, setHeadlightsOn] = useState(false);

  // Instrucciones iniciales
  const [showInstructions, setShowInstructions] = useState(false);

  // Sistema de pasajeros
  const [passengers, setPassengers] = useState([
    {
      id: 1,
      name: "Ana",
      pos: [20, 0, 15],
      color: "#4a90e2",
      pickedUp: false,
      destinationId: 0,
    },
    {
      id: 2,
      name: "Carlos",
      pos: [-25, 0, -20],
      color: "#f5a623",
      pickedUp: false,
      destinationId: 1,
    },
    {
      id: 3,
      name: "María",
      pos: [35, 0, -10],
      color: "#d0021b",
      pickedUp: false,
      destinationId: 2,
    },
    {
      id: 4,
      name: "Luis",
      pos: [-15, 0, 30],
      color: "#7ed321",
      pickedUp: false,
      destinationId: 3,
    },
  ]);

  const [destinations] = useState([
    { id: 0, pos: [-40, 0, 25], name: "Centro Comercial" },
    { id: 1, pos: [40, 0, 20], name: "Aeropuerto" },
    { id: 2, pos: [-20, 0, -35], name: "Hospital" },
    { id: 3, pos: [25, 0, 35], name: "Universidad" },
  ]);

  // Manejar recogida de pasajeros
  const handlePickupPassenger = (passengerIndex) => {
    const passenger = passengers[passengerIndex];
    if (!passenger.pickedUp && !currentPassenger) {
      setPassengers((prev) =>
        prev.map((p, i) =>
          i === passengerIndex ? { ...p, pickedUp: true } : p
        )
      );
      setCurrentPassenger(passenger);
      setScore((prev) => prev + 10); // Puntos por recoger
    }
  };

  // Verificar entrega en destino
  useEffect(() => {
    if (currentPassenger && isInVehicle) {
      const destination = destinations.find(
        (d) => d.id === currentPassenger.destinationId
      );
      if (destination) {
        const distance = Math.sqrt(
          Math.pow(vehiclePosition[0] - destination.pos[0], 2) +
            Math.pow(vehiclePosition[2] - destination.pos[2], 2)
        );

        if (distance < 4) {
          // Pasajero entregado
          setScore((prev) => prev + 50); // Puntos por entrega
          setCurrentPassenger(null);
          setTotalTrips((prev) => prev + 1); // Aumentar contador de viajes
          setCombo((prev) => prev + 1); // Aumentar combo

          // Lograr combo
          if (combo >= 3) {
            setScore((prev) => prev + 20); // Puntos adicionales por combo
            setAchievements((prev) => [...prev, `Combo x${combo} logrado!`]);
          }

          // Generar nuevo pasajero después de un tiempo
          setTimeout(() => {
            const availablePositions = [
              [Math.random() * 80 - 40, 0, Math.random() * 80 - 40],
              [Math.random() * 60 + 20, 0, Math.random() * 60 + 20],
              [Math.random() * -60 - 20, 0, Math.random() * 60 + 20],
              [Math.random() * 60 + 20, 0, Math.random() * -60 - 20],
            ];

            const names = [
              "Pedro",
              "Elena",
              "Jorge",
              "Carmen",
              "Diego",
              "Sofia",
            ];
            const colors = [
              "#9013fe",
              "#50e3c2",
              "#b8e986",
              "#ff9500",
              "#4bd5ff",
            ];

            const newPassenger = {
              id: Date.now(),
              name: names[Math.floor(Math.random() * names.length)],
              pos: availablePositions[
                Math.floor(Math.random() * availablePositions.length)
              ],
              color: colors[Math.floor(Math.random() * colors.length)],
              pickedUp: false,
              destinationId: Math.floor(Math.random() * destinations.length),
            };

            setPassengers((prev) => [...prev, newPassenger]);
          }, 3000);
        }
      }
    }
  }, [vehiclePosition, currentPassenger, isInVehicle, destinations]);

  // Prevenir scroll y otros comportamientos cuando el juego está activo
  useEffect(() => {
    const preventDefaults = (e) => {
      if (
        [
          "Space",
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "KeyF",
          "Tab",
          "Escape",
        ].includes(e.code)
      ) {
        e.preventDefault();
      }
    };

    // Prevenir menú contextual
    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    // Prevenir selección de texto
    const preventSelection = (e) => {
      e.preventDefault();
    };

    document.addEventListener("keydown", preventDefaults);
    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("selectstart", preventSelection);

    // Hacer que el body sea no scrolleable
    document.body.style.overflow = "hidden";
    document.body.style.margin = "0";
    document.body.style.padding = "0";

    return () => {
      document.removeEventListener("keydown", preventDefaults);
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("selectstart", preventSelection);
      document.body.style.overflow = "";
    };
  }, []);

  // Ciclo día/noche - 10 minutos de duración
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay((prev) => (prev + 0.00028) % 1); // 10 minutos = 600 segundos, 1/600 ≈ 0.00167, pero más lento
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleStartGame = () => {
    setShowInstructions(false);
    setGameStarted(true);
  };

  if (showInstructions) {
    return (
      <div className={styles.instructionsScreen}>
        <div className={styles.instructionsContent}>
          <h1>🚕 Uguee Taxi Game 3D</h1>
          <div className={styles.instructionsText}>
            <h2>🎮 Cómo Jugar:</h2>
            <ul>
              <li>
                🖱️ <strong>Haz clic</strong> para bloquear el cursor y mirar
                alrededor
              </li>
              <li>
                🚶 <strong>WASD:</strong> Caminar/Conducir
              </li>
              <li>
                🦘 <strong>Espacio:</strong> Saltar (solo a pie)
              </li>
              <li>
                🚗 <strong>F:</strong> Entrar/Salir del taxi
              </li>
              <li>
                �‍🤝‍🧑 <strong>Objetivo:</strong> Recoge pasajeros (NPCs
                verdes) y llévalos a su destino
              </li>
              <li>
                🏢 <strong>Explora:</strong> Una ciudad 3D completa con
                edificios
              </li>
              <li>
                🗺️ <strong>Minimapa:</strong> Usa el minimapa para encontrar
                pasajeros y destinos
              </li>
            </ul>
            <h2>🌟 Características:</h2>
            <ul>
              <li>✨ Gráficos 3D inmersivos con Three.js</li>
              <li>🚙 Experiencia de conducción realista</li>
              <li>🏙️ Entorno urbano detallado</li>
              <li>🎯 Sistema de colisiones avanzado</li>
              <li>🌅 Iluminación dinámica y sombras</li>
              <li>🧑‍🤝‍🧑 Sistema de pasajeros con IA</li>
            </ul>
          </div>
          <button className={styles.startButton} onClick={handleStartGame}>
            🚀 ¡Comenzar Aventura!
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <UI
        score={score}
        isInVehicle={isInVehicle}
        velocity={velocity}
        onGround={onGround}
        distanceToVehicle={distanceToVehicle}
        passengers={passengers}
        destinations={destinations}
        playerPosition={playerPosition}
        currentPassenger={currentPassenger}
        fuel={fuel}
        timeOfDay={timeOfDay}
        achievements={achievements}
        totalTrips={totalTrips}
        combo={combo}
      />
      <Canvas
        shadows
        camera={{ fov: 75, position: [0, 2, 0] }}
        onCreated={({ gl, camera }) => {
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 1.2;
          camera.far = 300;
        }}
        style={{
          background: "linear-gradient(to bottom, #87CEEB 0%, #98FB98 100%)",
          height: "100vh",
          width: "100vw",
        }}
      >
        <Suspense fallback={null}>
          {/* Dynamic lighting system */}
          <DynamicLighting timeOfDay={timeOfDay} />

          {/* Sound and effect visualizers */}
          <SoundVisualizer
            isHonking={Date.now() - lastHonkTime < 500}
            headlightsOn={headlightsOn}
          />

          {/* Niebla atmosférica para realismo */}
          <fog attach="fog" args={["#87CEEB", 100, 280]} />

          <PlayerController
            playerPosition={playerPosition}
            setPlayerPosition={setPlayerPosition}
            isInVehicle={isInVehicle}
            setIsInVehicle={setIsInVehicle}
            vehiclePosition={vehiclePosition}
            setVehiclePosition={setVehiclePosition}
            setVelocity={setVelocity}
            setOnGround={setOnGround}
            setDistanceToVehicle={setDistanceToVehicle}
          />

          <Ground />
          <CityEnvironment />
          <RealisticVehicle
            position={vehiclePosition}
            isPlayerInVehicle={isInVehicle}
          />

          {/* Interior del vehículo solo visible cuando está dentro */}
          {isInVehicle && (
            <group position={vehiclePosition}>
              <VehicleInterior />
            </group>
          )}

          {/* NPCs y destinos */}
          <NPCs
            playerPosition={vehiclePosition}
            isInVehicle={isInVehicle}
            onPickup={handlePickupPassenger}
            passengers={passengers}
            destinations={destinations}
          />

          <Coins
            onCollect={() => setScore((s) => s + 1)}
            playerPosition={playerPosition}
          />

        
          <WeatherSystem />
          <NPCs
            playerPosition={playerPosition}
            isInVehicle={isInVehicle}
            onPickup={(index) => {
              setScore((s) => s + 5);
              setPassengers((prev) =>
                prev.map((p, i) => (i === index ? { ...p, pickedUp: true } : p))
              );
            }}
            passengers={passengers}
            destinations={destinations}
          />

          <EnvironmentalElements />
          <GasStations
            playerPosition={playerPosition}
            isInVehicle={isInVehicle}
            onRefuel={() => setFuel(100)}
            fuel={fuel}
          />
          <TrafficCars />

          <PointerLockControls makeDefault />
        </Suspense>
      </Canvas>
    </div>
  );
}

// — Dynamic Day/Night Lighting System —
function DynamicLighting({ timeOfDay }) {
  const sunRef = useRef();
  const moonRef = useRef();

  useFrame(() => {
    // Sun movement
    if (sunRef.current) {
      const sunAngle = (timeOfDay - 0.5) * Math.PI;
      sunRef.current.position.set(
        Math.cos(sunAngle) * 100,
        Math.sin(sunAngle) * 100,
        50
      );
      sunRef.current.intensity = Math.max(0, Math.sin(sunAngle) * 1.5);
    }

    // Moon movement
    if (moonRef.current) {
      const moonAngle = (timeOfDay - 0.5) * Math.PI + Math.PI;
      moonRef.current.position.set(
        Math.cos(moonAngle) * 80,
        Math.sin(moonAngle) * 80,
        30
      );
      moonRef.current.intensity = Math.max(0, Math.sin(moonAngle) * 0.4);
    }
  });

  return (
    <>
      {/* Sun */}
      <directionalLight
        ref={sunRef}
        castShadow
        color="#ffffff"
        shadow-mapSize-width={4096}
        shadow-mapSize-height={4096}
        shadow-camera-far={300}
        shadow-camera-left={-100}
        shadow-camera-right={100}
        shadow-camera-top={100}
        shadow-camera-bottom={-100}
        shadow-bias={-0.0001}
      />

      {/* Moon */}
      <directionalLight ref={moonRef} color="#b0c4de" />

      {/* Ambient light varies with time - Improved night lighting */}
      <ambientLight
        intensity={0.4 + Math.sin(timeOfDay * Math.PI) * 0.4}
        color={timeOfDay < 0.3 || timeOfDay > 0.7 ? "#6495ed" : "#ffffff"}
      />

      {/* Additional night lighting for better visibility */}
      {(timeOfDay < 0.3 || timeOfDay > 0.7) && (
        <directionalLight
          position={[0, 50, 0]}
          intensity={0.3}
          color="#87ceeb"
        />
      )}
    </>
  );
}

// — Enhanced Sound System (Visual feedback since we can't use actual audio) —
function SoundVisualizer({ isHonking, headlightsOn }) {
  const hornRef = useRef();

  useFrame((state) => {
    if (hornRef.current && isHonking) {
      hornRef.current.scale.setScalar(
        1 + Math.sin(state.clock.elapsedTime * 20) * 0.3
      );
    }
  });

  return (
    <>
      {/* Horn visual effect */}
      {isHonking && (
        <mesh ref={hornRef} position={[0, 2, 0]}>
          <sphereGeometry args={[2]} />
          <meshStandardMaterial
            color="#ffff00"
            transparent
            opacity={0.3}
            emissive="#ffff00"
            emissiveIntensity={0.5}
          />
        </mesh>
      )}

      {/* Headlight beams */}
      {headlightsOn && (
        <>
          <mesh position={[1, 0, 3]} rotation={[-0.1, 0, 0]}>
            <coneGeometry args={[2, 10, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
          <mesh position={[-1, 0, 3]} rotation={[-0.1, 0, 0]}>
            <coneGeometry args={[2, 10, 8]} />
            <meshStandardMaterial
              color="#ffffff"
              transparent
              opacity={0.1}
              emissive="#ffffff"
              emissiveIntensity={0.2}
            />
          </mesh>
        </>
      )}
    </>
  );
}