import React from 'react';
import * as THREE from 'three';
import { DicomMetadata } from '../../services/loaders/dicomLoaderService';

interface DicomSlicePlaneProps {
  texture: THREE.CanvasTexture;
  metadata: DicomMetadata;
  opacity?: number;
}

export const DicomSlicePlane: React.FC<DicomSlicePlaneProps> = ({
  texture,
  metadata,
  opacity = 0.95
}) => {
  // Ajustar dimensões 3D proporcionais
  // Normalizar para caber no viewport (~5 unidades)
  const maxDim = Math.max(metadata.physicalWidthMm, metadata.physicalHeightMm) || 100;
  const scaleFactor = 5.0 / maxDim;
  const planeWidth = metadata.physicalWidthMm * scaleFactor;
  const planeHeight = metadata.physicalHeightMm * scaleFactor;

  return (
    <group position={[0, 0, 0]}>
      {/* 3D Tomographic Slice Plane */}
      <mesh receiveShadow>
        <planeGeometry args={[planeWidth, planeHeight]} />
        <meshBasicMaterial 
          map={texture} 
          transparent={opacity < 1.0} 
          opacity={opacity} 
          side={THREE.DoubleSide} 
        />
      </mesh>

      {/* Moldura Milimétrica Cibernética do Campo de Visão (FOV) */}
      <lineSegments>
        <edgesGeometry args={[new THREE.PlaneGeometry(planeWidth, planeHeight)]} />
        <lineBasicMaterial color="#00F0FF" linewidth={2} />
      </lineSegments>

      {/* Régua de Escala Física Sutil no Rodapé do Corte */}
      <group position={[0, -planeHeight / 2 - 0.15, 0]}>
        <mesh>
          <planeGeometry args={[planeWidth, 0.04]} />
          <meshBasicMaterial color="#00F0FF" />
        </mesh>
      </group>
    </group>
  );
};
