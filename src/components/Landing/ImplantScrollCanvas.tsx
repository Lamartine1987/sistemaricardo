import React from 'react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera } from '@react-three/drei';
import { GiantImplant3D } from './GiantImplant3D';

interface ImplantScrollCanvasProps {
  scrollProgress: number;
}

export const ImplantScrollCanvas: React.FC<ImplantScrollCanvasProps> = ({ scrollProgress }) => {
  return (
    <div className="fixed inset-0 z-0 pointer-events-none w-full h-full overflow-hidden">
      <Canvas shadows gl={{ antialias: true, alpha: true }}>
        <PerspectiveCamera makeDefault position={[0, 0.4, 6.8]} fov={45} />

        {/* 💡 Iluminação Cinematográfica de Estúdio (Estilo Lusion) */}
        <ambientLight intensity={1.1} />
        
        {/* Luz Principal / Key Light de Alto Contraste */}
        <directionalLight 
          position={[6, 8, 6]} 
          intensity={2.8} 
          castShadow 
          color="#FFFFFF"
        />

        {/* Luz de Borda Ciano Neon (Rim Light) */}
        <directionalLight 
          position={[-7, -3, -4]} 
          intensity={2.2} 
          color="#00F0FF" 
        />

        {/* Luz Superior de Destaque no Topo da Plataforma do Implante */}
        <pointLight 
          position={[0, 5, 2]} 
          intensity={1.8} 
          color="#38BDF8" 
          distance={10} 
        />

        {/* Luz Inferior de Reflexo do Leito Ósseo */}
        <pointLight 
          position={[0, -3, 2]} 
          intensity={1.5} 
          color="#00F0FF" 
          distance={8} 
        />

        {/* O Parafuso de Implante Gigante e Leito Ósseo */}
        <GiantImplant3D scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};
