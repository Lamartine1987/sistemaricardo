import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface GiantImplant3DProps {
  scrollProgress: number; // 0 (topo) a 1 (final da página)
}

export const GiantImplant3D: React.FC<GiantImplant3DProps> = ({ scrollProgress }) => {
  const groupRef = useRef<THREE.Group>(null);
  const assemblyRef = useRef<THREE.Group>(null); // Conjunto Dente + Munhão + Parafuso
  const socketRef = useRef<THREE.Group>(null); // Leito Ósseo Cibernético Translúcido (Estrutura anterior)
  const lockRingRef = useRef<THREE.Mesh>(null);
  const particlesRef = useRef<THREE.Points>(null);

  // Interpolação suave para 60fps constante
  const smoothProgress = useRef(0);

  // 1. Partículas cósmicas/cibernéticas de fundo
  const particlePositions = useMemo(() => {
    const count = 120;
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 16;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    return positions;
  }, []);

  // 2. Roscas Helicoidais Duplas do Parafuso de Titânio
  const threadRings = useMemo(() => {
    const rings = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      const t = i / count;
      const radius = 0.54 - t * 0.18; // Conicidade natural cirúrgica
      const y = 0.45 - t * 1.9;
      rings.push({ y, radius, rot: (i * 0.45) % (Math.PI * 2) });
    }
    return rings;
  }, []);

  // 3. Geometria da Coroa Anatômica do Dente Molar (Porcelana Zircônia Branca)
  const toothGeometry = useMemo(() => {
    const geom = new THREE.CylinderGeometry(0.82, 0.72, 1.25, 32, 8);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = pos.getZ(i);
      // Esculpir cúspides anatômicas no topo
      if (y > 0.3) {
        const cuspFactor = Math.sin(x * 4) * Math.cos(z * 4) * 0.12;
        pos.setY(i, y + cuspFactor);
      }
    }
    geom.computeVertexNormals();
    return geom;
  }, []);

  useFrame((state, delta) => {
    // Interpolação suave do scroll (Damping exponencial)
    smoothProgress.current = THREE.MathUtils.damp(
      smoothProgress.current,
      scrollProgress,
      4,
      delta
    );

    const p = smoothProgress.current;

    if (assemblyRef.current) {
      // 🚀 Movimento 1: Descida do conjunto (Dente + Parafuso)
      // De Y = 2.2 (flutuando no topo do hero) descendo até Y = -1.1 (encaixado no leito ósseo)
      const targetY = THREE.MathUtils.lerp(2.2, -1.1, Math.min(p * 1.35, 1));
      assemblyRef.current.position.y = targetY;

      // 🔄 Movimento 2: Rotação de Rosqueamento
      // Conforme o implante desce, gira progressivamente no eixo Y
      const rotationSpeed = p > 0.12 ? (p - 0.12) * 15 : 0;
      assemblyRef.current.rotation.y = rotationSpeed + state.clock.elapsedTime * 0.22;

      // 📐 Movimento 3: Alinhamento de Ângulo
      // No topo começa com leve inclinação cinematográfica, endireitando-se ao descer
      assemblyRef.current.rotation.z = THREE.MathUtils.lerp(-0.28, 0, Math.min(p * 2, 1));
      assemblyRef.current.rotation.x = THREE.MathUtils.lerp(0.18, 0, Math.min(p * 2, 1));
    }

    // 🌟 Efeito de Anel de Luz de Torque Máximo ao Final (p > 0.75)
    if (lockRingRef.current) {
      if (p > 0.75) {
        const pulse = (Math.sin(state.clock.elapsedTime * 6) + 1) * 0.5;
        lockRingRef.current.scale.setScalar(1 + pulse * 0.14);
        (lockRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0.85 * ((p - 0.75) / 0.25);
      } else {
        lockRingRef.current.scale.setScalar(0.001);
        (lockRingRef.current.material as THREE.MeshBasicMaterial).opacity = 0;
      }
    }

    // Partículas de poeira cirúrgica flutuando
    if (particlesRef.current) {
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.03;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      
      {/* 🌌 Partículas de Fundo */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[particlePositions, 3]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.05}
          color="#00F0FF"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* 🦴 ============================================================== */}
      {/* 🦴 LEITO ÓSSEO RECEPTOR CIBERNÉTICO TRANSLÚCIDO (Estrutura Anterior) */}
      {/* 🦴 ============================================================== */}
      <group ref={socketRef} position={[0, -2.2, 0]}>
        
        {/* Base Óssea Mandibular Translúcida Futurista */}
        <mesh position={[0, -0.6, 0]}>
          <cylinderGeometry args={[2.4, 2.6, 1.8, 48]} />
          <meshPhysicalMaterial
            color="#0E1626"
            metalness={0.2}
            roughness={0.25}
            transmission={0.45}
            transparent
            opacity={0.85}
            depthWrite={false}
          />
        </mesh>

        {/* Túnel de Fresagem Guiada (Canal Central de Acomodação em Wireframe Ciano) */}
        <mesh position={[0, -0.15, 0]}>
          <cylinderGeometry args={[0.62, 0.42, 2.2, 32, 1, true]} />
          <meshBasicMaterial color="#00F0FF" wireframe transparent opacity={0.35} />
        </mesh>

        {/* Anel Holográfico de Alinhamento de Furação */}
        <mesh position={[0, 0.35, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.65, 0.95, 32]} />
          <meshBasicMaterial color="#00F0FF" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>

        {/* Pulso Verde de Travamento de Torque Máximo */}
        <mesh ref={lockRingRef} position={[0, 0.4, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.95, 1.6, 32]} />
          <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} transparent opacity={0} />
        </mesh>

        {/* Grade de Coordenadas Médicas de Precisão */}
        <gridHelper args={[8, 16, '#00F0FF', '#0F172A']} position={[0, -1.5, 0]} />
      </group>

      {/* 🦷 ============================================================== */}
      {/* 🦷 CONJUNTO CIRÚRGICO MÓVEL: DENTE DE PORCELANA + IMPLANTE 3D     */}
      {/* 🦷 ============================================================== */}
      <group ref={assemblyRef} position={[0, 2.2, 0]}>
        
        {/* 1. COROA DO DENTE (Porcelana Zircônia Branca Translúcida com Esmalte) */}
        <group position={[0, 2.1, 0]}>
          <mesh geometry={toothGeometry} castShadow>
            <meshPhysicalMaterial
              color="#FFFFFF"
              roughness={0.12}
              metalness={0.02}
              clearcoat={0.9}
              clearcoatRoughness={0.1}
              transmission={0.2}
              ior={1.5}
            />
          </mesh>

          {/* Fissuras Oclusais Anatômicas Sutis */}
          <mesh position={[0, 0.64, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#E2E8F0" roughness={0.4} />
          </mesh>
        </group>

        {/* 2. MUNHÃO PROTÉTICO (Pilar de Conexão em Titânio Dourado/Anodizado) */}
        <mesh position={[0, 1.25, 0]}>
          <cylinderGeometry args={[0.62, 0.54, 0.55, 32]} />
          <meshStandardMaterial
            color="#E0B070" // Ouro/Titânio cirúrgico anodizado de alta estética
            metalness={0.95}
            roughness={0.15}
          />
        </mesh>

        {/* Colar Transmucoso Polido Espelhado */}
        <mesh position={[0, 0.88, 0]}>
          <cylinderGeometry args={[0.54, 0.52, 0.25, 32]} />
          <meshStandardMaterial
            color="#F1F5F9"
            metalness={0.98}
            roughness={0.08}
          />
        </mesh>

        {/* 3. CORPO DO PARAFUSO DE IMPLANTE DE TITÂNIO */}
        <group position={[0, 0.0, 0]}>
          {/* Núcleo Cônico de Titânio */}
          <mesh position={[0, -0.4, 0]} castShadow>
            <cylinderGeometry args={[0.52, 0.32, 1.8, 32]} />
            <meshStandardMaterial
              color="#94A3B8"
              metalness={0.94}
              roughness={0.18}
            />
          </mesh>

          {/* Roscas Helicoidais em Espiral */}
          {threadRings.map((thread, idx) => (
            <group key={idx} position={[0, thread.y, 0]} rotation={[0.08, thread.rot, 0]}>
              <mesh>
                <torusGeometry args={[thread.radius + 0.06, 0.045, 12, 32]} />
                <meshStandardMaterial
                  color="#CBD5E1"
                  metalness={0.96}
                  roughness={0.14}
                />
              </mesh>
            </group>
          ))}

          {/* Ápice Cortante Autoperfurante */}
          <mesh position={[0, -1.38, 0]}>
            <coneGeometry args={[0.32, 0.35, 32]} />
            <meshStandardMaterial
              color="#64748B"
              metalness={0.92}
              roughness={0.22}
            />
          </mesh>

          {/* Feixe Laser de Alinhamento de Eixo Cirúrgico */}
          <mesh position={[0, 1.4, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 2.4, 8]} />
            <meshBasicMaterial color="#00F0FF" transparent opacity={0.65} />
          </mesh>
        </group>

      </group>

    </group>
  );
};
