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

        {/* 💡 Iluminação Clínica de Estúdio Odontológico */}
        <ambientLight intensity={1.4} />
        
        {/* Luz Principal / Key Light de Alto Contraste */}
        <directionalLight 
          position={[6, 8, 6]} 
          intensity={2.8} 
          castShadow 
          color="#FFFFFF"
        />

        {/* Luz de Preenchimento Cirúrgica Suave */}
        <directionalLight 
          position={[-7, 4, -4]} 
          intensity={1.8} 
          color="#E0F2FE" 
        />

        {/* Luz Superior de Destaque no Topo da Plataforma do Implante */}
        <pointLight 
          position={[0, 5, 2]} 
          intensity={1.6} 
          color="#38BDF8" 
          distance={10} 
        />

        {/* Luz Inferior de Reflexo do Leito Ósseo */}
        <pointLight 
          position={[0, -3, 2]} 
          intensity={1.2} 
          color="#0284C7" 
          distance={8} 
        />

        {/* O Parafuso de Implante Gigante e Leito Ósseo */}
        <GiantImplant3D scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
};
