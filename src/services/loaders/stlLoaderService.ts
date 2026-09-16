import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js';

export interface LoadedModelMetadata {
  fileName: string;
  fileType: 'STL' | 'PLY' | 'OBJ';
  fileSizeKb: number;
  triangleCount: number;
  vertexCount: number;
  dimensionsMm: {
    x: number;
    y: number;
    z: number;
  };
  suggestedScale: number;
}

export interface LoadedMeshResult {
  geometry: THREE.BufferGeometry;
  metadata: LoadedModelMetadata;
}

const stlLoader = new STLLoader();
const plyLoader = new PLYLoader();
const objLoader = new OBJLoader();

/**
/**
 * Carrega e processa malhas 3D odontológicas a partir de um ArrayBuffer binário
 */
export function loadMeshFromBuffer(
  buffer: ArrayBuffer, 
  fileName: string, 
  fileSize?: number
): LoadedMeshResult {
  const extension = fileName.split('.').pop()?.toLowerCase();

  let geometry: THREE.BufferGeometry;
  let fileType: 'STL' | 'PLY' | 'OBJ' = 'STL';

  if (extension === 'ply') {
    fileType = 'PLY';
    geometry = plyLoader.parse(buffer);
  } else if (extension === 'obj') {
    fileType = 'OBJ';
    const text = new TextDecoder().decode(buffer);
    const objGroup = objLoader.parse(text);
    
    // Extrair primeira geometria do grupo OBJ
    let extractedGeo: THREE.BufferGeometry | null = null;
    objGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && (child as THREE.Mesh).geometry) {
        extractedGeo = (child as THREE.Mesh).geometry;
      }
    });

    if (!extractedGeo) {
      throw new Error('Nenhuma malha 3D encontrada no arquivo OBJ.');
    }
    geometry = extractedGeo;
  } else {
    // Padrão: STL
    fileType = 'STL';
    geometry = stlLoader.parse(buffer);
  }

  // Garantir cálculo de normais suaves para iluminação de alta qualidade
  geometry.computeVertexNormals();

  // Centralizar na origem para visualização anatômica
  geometry.center();

  // Calcular dimensões milimétricas reais
  geometry.computeBoundingBox();
  const bbox = geometry.boundingBox || new THREE.Box3();
  const size = new THREE.Vector3();
  bbox.getSize(size);

  const dimX = parseFloat(size.x.toFixed(2));
  const dimY = parseFloat(size.y.toFixed(2));
  const dimZ = parseFloat(size.z.toFixed(2));

  // O Three.js DentalViewer trabalha com arcadas em escala aproximada de ~4 a 6 unidades.
  // Modelos odontológicos exportados de scanners vêm em milímetros (ex: 50mm a 100mm).
  // Se o modelo estiver em milímetros (~60mm), calculamos uma escala de ajuste visual proporcional:
  const maxDim = Math.max(dimX, dimY, dimZ);
  let suggestedScale = 1.0;
  if (maxDim > 15) {
    // Normalizar modelo milimétrico para caber na visualização padrão (~5 unidades)
    suggestedScale = 5.0 / maxDim;
  } else if (maxDim < 0.5) {
    suggestedScale = 5.0 / (maxDim || 1);
  }

  const vertexCount = geometry.attributes.position ? geometry.attributes.position.count : 0;
  const triangleCount = geometry.index 
    ? geometry.index.count / 3 
    : Math.floor(vertexCount / 3);

  return {
    geometry,
    metadata: {
      fileName,
      fileType,
      fileSizeKb: fileSize ? Math.round(fileSize / 1024) : Math.round(buffer.byteLength / 1024),
      triangleCount,
      vertexCount,
      dimensionsMm: {
        x: dimX,
        y: dimY,
        z: dimZ
      },
      suggestedScale
    }
  };
}

/**
 * Carrega e processa arquivos 3D odontológicos (STL, PLY, OBJ) a partir de um File
 */
export async function loadMeshFromFile(file: File): Promise<LoadedMeshResult> {
  const buffer = await file.arrayBuffer();
  return loadMeshFromBuffer(buffer, file.name, file.size);
}

/**
 * Baixa e processa uma malha 3D odontológica a partir de uma URL
 */
export async function loadMeshFromUrl(url: string, fileName: string): Promise<LoadedMeshResult> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar malha 3D de ${url}`);
  }
  const buffer = await res.arrayBuffer();
  return loadMeshFromBuffer(buffer, fileName, buffer.byteLength);
}

/**
 * Gera uma geometria tridimensional anatômica de Guia Cirúrgica Odontológica (CAD/CAM)
 * com arcada protetora em resina e anilhas de perfuração de titânio.
 */
export function createSyntheticSurgicalGuideGeometry(
  fileName: string,
  patientName?: string
): LoadedMeshResult {
  // 1. Corpo principal da guia cirúrgica (ferradura protetora oclusal)
  const guideBody = new THREE.CylinderGeometry(2.95, 3.15, 1.2, 48, 1, true, 0, Math.PI);
  guideBody.scale(1.05, 1.0, 1.25);
  guideBody.rotateY(-Math.PI / 2);
  guideBody.translate(0, 0.3, 0);

  // 2. Anilha de guiagem cirúrgica para dente 36
  const sleeve1 = new THREE.CylinderGeometry(0.38, 0.38, 0.6, 32, 1, true);
  sleeve1.rotateX(0.12);
  sleeve1.translate(2.3, 0.55, 0.2);

  // 3. Anilha de guiagem cirúrgica para dente 46
  const sleeve2 = new THREE.CylinderGeometry(0.38, 0.38, 0.6, 32, 1, true);
  sleeve2.rotateX(0.12);
  sleeve2.translate(-2.3, 0.55, 0.2);

  const merged = mergeGeometries([guideBody, sleeve1, sleeve2]);
  merged.computeVertexNormals();
  merged.center();

  return {
    geometry: merged,
    metadata: {
      fileName: fileName || 'Guia_Cirurgica_CAD.stl',
      fileType: 'STL',
      fileSizeKb: 890,
      triangleCount: merged.index ? merged.index.count / 3 : Math.floor(merged.attributes.position.count / 3),
      vertexCount: merged.attributes.position.count,
      dimensionsMm: { x: 56.4, y: 15.8, z: 47.2 },
      suggestedScale: 1.0
    }
  };
}

