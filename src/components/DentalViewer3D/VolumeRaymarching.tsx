import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DicomSeriesMetadata } from '../../services/loaders/dicomSeriesService';

interface VolumeRaymarchingProps {
  volumeTexture: THREE.Data3DTexture;
  metadata: DicomSeriesMetadata;
  boneThreshold?: number; // 0.1 a 0.85 (densidade óssea)
  opacity?: number;
  clipSliceNormalized?: number; // 0.0 a 1.0 (plano de corte axial)
}

export const VolumeRaymarching: React.FC<VolumeRaymarchingProps> = ({
  volumeTexture,
  metadata,
  boneThreshold = 0.30,
  opacity = 0.95,
  clipSliceNormalized = 1.0
}) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const invMatrix = useMemo(() => new THREE.Matrix4(), []);
  const localCamPos = useMemo(() => new THREE.Vector3(), []);

  // Proporções físicas reais em milímetros
  // wMm: largura (esquerda-direita)
  // hMm: profundidade (anterior-posterior)
  // dMm: altura do volume (cortes Z / inferior-superior)
  const { width: wMm, height: hMm, depth: dMm } = metadata.physicalDimensionsMm;
  const maxDim = Math.max(wMm, hMm, dMm) || 100;
  const scale = 5.0 / maxDim; // Normaliza para caber na cena (~5 unidades Three.js)

  const sizeX = wMm * scale;
  const sizeY = dMm * scale; // Altura vertical em Three.js
  const sizeZ = hMm * scale; // Profundidade anterior-posterior em Three.js

  // Shader Material customizado de Raymarching com aceleração por GPU WebGL2
  const shaderMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3,
      uniforms: {
        u_volume: { value: volumeTexture },
        u_localCam: { value: new THREE.Vector3(0, 3.5, 6.5) },
        u_boxSize: { value: new THREE.Vector3(sizeX, sizeY, sizeZ) },
        u_threshold: { value: boneThreshold },
        u_opacity: { value: opacity },
        u_clipZ: { value: clipSliceNormalized },
        u_steps: { value: 120.0 },
        u_boneColor: { value: new THREE.Color('#FAF7F0') },
        u_teethColor: { value: new THREE.Color('#FFFFFF') }
      },
      vertexShader: `
        out vec3 v_localPos;

        void main() {
          v_localPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        precision highp float;
        precision highp sampler3D;

        in vec3 v_localPos;
        out vec4 fragColor;

        uniform sampler3D u_volume;
        uniform vec3 u_localCam;
        uniform vec3 u_boxSize;
        uniform float u_threshold;
        uniform float u_opacity;
        uniform float u_clipZ;
        uniform float u_steps;
        uniform vec3 u_boneColor;
        uniform vec3 u_teethColor;

        // Interseção Raio x Caixa Delimitadora AABB [box_min, box_max]
        vec2 hitBox(vec3 orig, vec3 dir, vec3 box_min, vec3 box_max) {
          vec3 inv_dir = 1.0 / dir;
          vec3 tmin_tmp = (box_min - orig) * inv_dir;
          vec3 tmax_tmp = (box_max - orig) * inv_dir;
          vec3 tmin = min(tmin_tmp, tmax_tmp);
          vec3 tmax = max(tmin_tmp, tmax_tmp);
          float t0 = max(tmin.x, max(tmin.y, tmin.z));
          float t1 = min(tmax.x, min(tmax.y, tmax.z));
          return vec2(t0, t1);
        }

        void main() {
          // Direção do raio em coordenadas do objeto
          vec3 localRayDir = normalize(v_localPos - u_localCam);

          vec3 boxMin = -0.5 * u_boxSize;
          vec3 boxMax = 0.5 * u_boxSize;

          vec2 bounds = hitBox(u_localCam, localRayDir, boxMin, boxMax);
          if (bounds.x > bounds.y) {
            discard;
          }

          bounds.x = max(bounds.x, 0.0);

          vec3 p = u_localCam + localRayDir * bounds.x;
          float rayLength = bounds.y - bounds.x;
          float stepSize = rayLength / u_steps;
          vec3 stepVec = localRayDir * stepSize;

          vec4 accColor = vec4(0.0);
          vec3 lightDir = normalize(vec3(0.5, 1.0, 0.7));
          vec3 fillLight = normalize(vec3(-0.6, -0.2, -0.4));

          for (float i = 0.0; i < 150.0; i += 1.0) {
            if (i >= u_steps || accColor.a >= 0.95) break;

            // Mapear posição p [-size/2, size/2] para coordenadas normalizadas [0, 1]
            vec3 boxNorm = (p / u_boxSize) + 0.5;

            // No volume 3D:
            // X: colunas (largura) -> boxNorm.x
            // Y: linhas (profundidade) -> boxNorm.z
            // Z: fatias (altura cranial) -> boxNorm.y
            vec3 texCoord = vec3(boxNorm.x, boxNorm.z, boxNorm.y);

            // Verificar se está dentro do volume e respeitar o plano de corte axial
            if (texCoord.z <= u_clipZ && 
                texCoord.x >= 0.0 && texCoord.x <= 1.0 &&
                texCoord.y >= 0.0 && texCoord.y <= 1.0 &&
                texCoord.z >= 0.0 && texCoord.z <= 1.0) {
              
              float val = texture(u_volume, texCoord).r;

              if (val > u_threshold) {
                // Cálculo de Normais por Gradiente Central na GPU
                float eps = 0.015;
                float gx = texture(u_volume, texCoord + vec3(eps, 0.0, 0.0)).r - texture(u_volume, texCoord - vec3(eps, 0.0, 0.0)).r;
                float gy = texture(u_volume, texCoord + vec3(0.0, eps, 0.0)).r - texture(u_volume, texCoord - vec3(0.0, eps, 0.0)).r;
                float gz = texture(u_volume, texCoord + vec3(0.0, 0.0, eps)).r - texture(u_volume, texCoord - vec3(0.0, 0.0, eps)).r;
                
                // Mapear gradiente de volta para o espaço da caixa (X, Y=gz, Z=gy)
                vec3 norm = normalize(vec3(-gx, -gz, -gy) + 0.0001);

                // Iluminação Cirúrgica Difusa + Especular
                float diff = max(dot(norm, lightDir), 0.0);
                float fill = max(dot(norm, fillLight), 0.0) * 0.3;
                vec3 viewDir = -localRayDir;
                vec3 halfDir = normalize(lightDir + viewDir);
                float spec = pow(max(dot(norm, halfDir), 0.0), 20.0) * 0.4;

                // Cor: se for densidade muito alta (> 0.65), é dente/esmalte; senão, osso
                vec3 baseColor = mix(u_boneColor, u_teethColor, smoothstep(0.55, 0.85, val));
                vec3 shadedColor = baseColor * (0.4 + 0.6 * diff + fill) + vec3(spec);

                // Acúmulo de Transparência Volumétrica
                float sampleAlpha = clamp((val - u_threshold) * 5.0, 0.0, 1.0) * u_opacity * 0.3;
                accColor.rgb += (1.0 - accColor.a) * shadedColor * sampleAlpha;
                accColor.a += (1.0 - accColor.a) * sampleAlpha;
              }
            }

            p += stepVec;
          }

          if (accColor.a <= 0.01) {
            discard;
          }

          fragColor = accColor;
        }
      `,
      transparent: true,
      side: THREE.BackSide,
      depthWrite: false
    });
  }, [volumeTexture, sizeX, sizeY, sizeZ]);

  // Atualizar a posição local da câmera a cada frame com precisão
  useFrame(({ camera }) => {
    if (meshRef.current && shaderMaterial) {
      meshRef.current.updateWorldMatrix(true, false);
      invMatrix.copy(meshRef.current.matrixWorld).invert();
      localCamPos.copy(camera.position).applyMatrix4(invMatrix);
      shaderMaterial.uniforms.u_localCam.value.copy(localCamPos);
    }
  });

  // Atualizar uniforms reativamente quando os sliders mudarem
  if (shaderMaterial) {
    shaderMaterial.uniforms.u_threshold.value = boneThreshold;
    shaderMaterial.uniforms.u_opacity.value = opacity;
    shaderMaterial.uniforms.u_clipZ.value = clipSliceNormalized;
    shaderMaterial.uniforms.u_boxSize.value.set(sizeX, sizeY, sizeZ);
  }

  return (
    <group position={[0, 0, 0]}>
      {/* Volume 3D da Tomografia (Raymarching) */}
      <mesh ref={meshRef} material={shaderMaterial}>
        <boxGeometry args={[sizeX, sizeY, sizeZ]} />
      </mesh>

      {/* Caixa Delimitadora / Grid Milimétrico do Campo de Visão (FOV) */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(sizeX, sizeY, sizeZ)]} />
        <lineBasicMaterial color="#00F0FF" opacity={0.35} transparent linewidth={1} />
      </lineSegments>

      {/* Plano Indicador de Corte Axial Fatiador */}
      {clipSliceNormalized < 0.99 && (
        <group position={[0, (clipSliceNormalized - 0.5) * sizeY, 0]}>
          <mesh>
            <planeGeometry args={[sizeX, sizeZ]} />
            <meshBasicMaterial 
              color="#00F0FF" 
              transparent 
              opacity={0.15} 
              side={THREE.DoubleSide} 
            />
          </mesh>
          <lineSegments>
            <edgesGeometry args={[new THREE.PlaneGeometry(sizeX, sizeZ)]} />
            <lineBasicMaterial color="#00F0FF" linewidth={2} />
          </lineSegments>
        </group>
      )}
    </group>
  );
};
