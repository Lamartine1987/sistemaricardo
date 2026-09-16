import React from 'react';
import * as THREE from 'three';

export type MeshMaterialPreset = 'RESIN' | 'BONE' | 'TITANIUM';

interface LoadedMeshProps {
  geometry: THREE.BufferGeometry;
  scale?: number;
  materialType?: MeshMaterialPreset;
  wireframe?: boolean;
  opacity?: number;
}

export const LoadedMesh: React.FC<LoadedMeshProps> = ({
  geometry,
  scale = 1.0,
  materialType = 'RESIN',
  wireframe = false,
  opacity = 0.85
}) => {
  // Configuração de Materiais PBR de Alta Fidelidade Odontológica
  let matProps: THREE.MeshStandardMaterialParameters = {
    wireframe,
    transparent: opacity < 1.0,
    opacity: opacity,
    side: THREE.DoubleSide
  };

  switch (materialType) {
    case 'RESIN':
      // Resina Fotopolimerizável Cirúrgica de Guia (Ciano translúcido de alta precisão)
      matProps = {
        ...matProps,
        color: '#00F0FF',
        roughness: 0.15,
        metalness: 0.1,
        emissive: '#003B46',
        emissiveIntensity: 0.2
      };
      break;

    case 'BONE':
      // Osso Cortical / Esmalte Dentário Natural (Marfim Cirúrgico)
      matProps = {
        ...matProps,
        color: '#F8FAFC',
        roughness: 0.4,
        metalness: 0.05,
        emissive: '#1E293B',
        emissiveIntensity: 0.05
      };
      break;

    case 'TITANIUM':
      // Titânio Cirúrgico Grau V Escovado
      matProps = {
        ...matProps,
        color: '#94A3B8',
        roughness: 0.25,
        metalness: 0.9,
        emissive: '#0F172A',
        emissiveIntensity: 0.15
      };
      break;
  }

  return (
    <group scale={[scale, scale, scale]}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial {...matProps} />
      </mesh>
    </group>
  );
};
