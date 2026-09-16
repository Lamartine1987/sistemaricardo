import React, { useMemo } from 'react';
import * as THREE from 'three';
import { ViewerLayers } from '../../types';

interface ProceduralJawProps {
  layers: ViewerLayers;
}

export const ProceduralJaw: React.FC<ProceduralJawProps> = ({ layers }) => {
  // 1. Arcada Mandibular Anatômica (Curva em U / Alveolar Ridge)
  const jawGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    // Curva da arcada dentária inferior
    const points: [number, number][] = [];
    const segments = 40;
    for (let i = 0; i <= segments; i++) {
      const t = (i / segments) * Math.PI; // 0 to PI
      const x = Math.cos(t) * 2.8;
      const z = -Math.sin(t) * 3.4;
      points.push([x, z]);
    }
    
    // Gerar malha de ferradura extrudada
    const jawGeom = new THREE.CylinderGeometry(2.8, 3.0, 1.2, 40, 1, true, 0, Math.PI);
    jawGeom.scale(1, 1, 1.2);
    jawGeom.rotateY(-Math.PI / 2);
    jawGeom.translate(0, -0.4, 0);
    return jawGeom;
  }, []);

  // 2. Dentes individuais posicionados ao longo da curva em U
  const teethData = useMemo(() => {
    const teeth = [];
    const totalTeeth = 14; // Arcada de molar a molar
    for (let i = 0; i < totalTeeth; i++) {
      const angle = (i / (totalTeeth - 1)) * Math.PI; // 0 to PI
      const x = Math.cos(angle) * 2.8;
      const z = -Math.sin(angle) * 3.4 + 1.2;
      const rotY = -angle + Math.PI / 2;

      // Tamanho varia de incisivo (centro) para molar (extremidades)
      const isMolar = i <= 2 || i >= totalTeeth - 3;
      const isCanine = i === 4 || i === totalTeeth - 5;
      const isMissingForImplant = i === 2 || i === totalTeeth - 3; // Locais dos implantes (36 e 46)

      teeth.push({
        id: i,
        position: [x, 0.4, z] as [number, number, number],
        rotation: [0, rotY, 0] as [number, number, number],
        isMolar,
        isCanine,
        isMissing: isMissingForImplant, // Edêntulo para receber o implante
      });
    }
    return teeth;
  }, []);

  // 3. Implantes de Titânio nos sítios cirúrgicos (Dentes 36 e 46)
  const implantSites = useMemo(() => [
    { pos: [2.3, 0.0, 0.2] as [number, number, number], rot: [-0.08, 0.1, -0.15] as [number, number, number], code: '36' },
    { pos: [-2.3, 0.0, 0.2] as [number, number, number], rot: [-0.08, -0.1, 0.15] as [number, number, number], code: '46' }
  ], []);

  // 4. Guia Cirúrgica (Estrutura protetora que recobre a arcada com anilhas de perfuração)
  const guideGeometry = useMemo(() => {
    const guideGeom = new THREE.CylinderGeometry(2.95, 3.1, 1.4, 40, 1, true, 0, Math.PI);
    guideGeom.scale(1.04, 1.05, 1.22);
    guideGeom.rotateY(-Math.PI / 2);
    guideGeom.translate(0, -0.2, 0);
    return guideGeom;
  }, []);

  return (
    <group position={[0, 0, 0]}>
      {/* CAMADA 1: OSSO E GENGIVA */}
      {layers.showJaw && (
        <group>
          {/* Base Óssea Alveolar */}
          <mesh geometry={jawGeometry}>
            <meshStandardMaterial
              color="#F8ECE1"
              roughness={0.4}
              metalness={0.05}
              wireframe={layers.wireframe}
              transparent={layers.jawTransparency > 0}
              opacity={1 - layers.jawTransparency}
              depthWrite={layers.jawTransparency < 0.3}
            />
          </mesh>

          {/* Dentes Naturais */}
          {teethData.map((tooth) => {
            if (tooth.isMissing) return null; // Espaço do implante fica aberto
            return (
              <group key={tooth.id} position={tooth.position} rotation={tooth.rotation}>
                <mesh castShadow receiveShadow>
                  {tooth.isMolar ? (
                    <boxGeometry args={[0.55, 0.7, 0.65]} />
                  ) : tooth.isCanine ? (
                    <coneGeometry args={[0.26, 0.8, 16]} />
                  ) : (
                    <boxGeometry args={[0.35, 0.75, 0.3]} />
                  )}
                  <meshStandardMaterial
                    color="#FDFEFE"
                    roughness={0.2}
                    metalness={0.02}
                    wireframe={layers.wireframe}
                    transparent={layers.jawTransparency > 0}
                    opacity={1 - layers.jawTransparency}
                  />
                </mesh>
              </group>
            );
          })}
        </group>
      )}

      {/* CAMADA 2: IMPLANTES DE TITÂNIO CIRÚRGICOS */}
      {layers.showImplants && (
        <group>
          {implantSites.map((imp, idx) => (
            <group key={idx} position={imp.pos} rotation={imp.rot}>
              {/* Corpo Cônico Rosqueado do Implante */}
              <mesh position={[0, -0.4, 0]} castShadow>
                <cylinderGeometry args={[0.19, 0.12, 1.15, 24]} />
                <meshStandardMaterial
                  color="#94A3B8"
                  metalness={0.92}
                  roughness={0.2}
                />
              </mesh>

              {/* Roscas do Implante (Espiras de Titânio) */}
              {[-0.1, -0.3, -0.5, -0.7].map((yOffset, rIdx) => (
                <mesh key={rIdx} position={[0, yOffset, 0]}>
                  <torusGeometry args={[0.18, 0.025, 12, 24]} />
                  <meshStandardMaterial color="#64748B" metalness={0.95} roughness={0.15} />
                </mesh>
              ))}

              {/* Plataforma Protética Hexagonal */}
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.18, 0.18, 0.15, 6]} />
                <meshStandardMaterial color="#38BDF8" metalness={0.8} roughness={0.2} />
              </mesh>

              {/* Linha Guia de Eixo Cirúrgico (Laser Ciano Neon) */}
              <mesh position={[0, 0.8, 0]}>
                <cylinderGeometry args={[0.015, 0.015, 1.2, 8]} />
                <meshBasicMaterial color="#00F0FF" transparent opacity={0.7} />
              </mesh>
            </group>
          ))}
        </group>
      )}

      {/* CAMADA 3: GUIA CIRÚRGICA VIRTUAL (Resina Biocompatível + Anilhas) */}
      {layers.showGuide && (
        <group>
          {/* Corpo em Resina Translúcida */}
          <mesh geometry={guideGeometry}>
            <meshPhysicalMaterial
              color="#00F0FF"
              roughness={0.1}
              metalness={0.1}
              transmission={0.75}
              transparent
              opacity={layers.guideTransparency}
              depthWrite={false}
              ior={1.45}
            />
          </mesh>

          {/* Anilhas Metálicas de Guiagem de Fresas nos Sítios 36 e 46 */}
          {implantSites.map((imp, idx) => (
            <group key={`guide-ring-${idx}`} position={imp.pos} rotation={imp.rot}>
              {/* Cilindro Metálico com furo central (Anilha de Aço Cirúrgico) */}
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.3, 0.3, 0.35, 24, 1, true]} />
                <meshStandardMaterial color="#E2E8F0" metalness={0.95} roughness={0.1} side={THREE.DoubleSide} />
              </mesh>
              {/* Indicador de Furação */}
              <mesh position={[0, 0.55, 0]}>
                <ringGeometry args={[0.22, 0.28, 24]} />
                <meshBasicMaterial color="#10B981" side={THREE.DoubleSide} />
              </mesh>
            </group>
          ))}
        </group>
      )}
    </group>
  );
};
