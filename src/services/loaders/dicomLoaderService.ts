import * as THREE from 'three';
import dicomParser from 'dicom-parser';

export interface DicomMetadata {
  fileName: string;
  fileSizeKb: number;
  patientName: string;
  patientId: string;
  modality: string; // Ex: CT, CBCT, DX, SC
  studyDate: string;
  manufacturer: string;
  seriesDescription: string;
  rows: number;
  columns: number;
  bitsAllocated: number;
  bitsStored: number;
  pixelSpacing: [number, number]; // [rowSpacingMm, colSpacingMm]
  sliceThicknessMm: number;
  windowCenter: number;
  windowWidth: number;
  rescaleIntercept: number;
  rescaleSlope: number;
  physicalWidthMm: number;
  physicalHeightMm: number;
}

export interface DicomParseResult {
  metadata: DicomMetadata;
  pixelData: Int16Array | Uint16Array | Uint8Array;
  texture: THREE.CanvasTexture;
  canvas: HTMLCanvasElement;
}

/**
 * Lê e decodifica um buffer binário DICOM (.dcm) odontológico / médico
 */
export function loadDicomFromBuffer(
  buffer: ArrayBuffer, 
  fileName: string, 
  fileSize?: number
): DicomParseResult {
  const byteArray = new Uint8Array(buffer);

  // 1. Parsing do DataSet DICOM com proteção de cabeçalho
  let dataSet;
  try {
    dataSet = dicomParser.parseDicom(byteArray);
  } catch (err: any) {
    throw new Error(
      `O arquivo "${fileName}" não parece ser um arquivo DICOM válido ou possui formato proprietário sem suporte a leitura web direta (${err.message}).`
    );
  }

  // 2. Extração das Tags Principais
  const patientName = dataSet.string('x00100010') || 'Paciente Anônimo';
  const patientId = dataSet.string('x00100020') || 'ID-NÃO-INFORMADO';
  const modality = dataSet.string('x00080060') || 'CT';
  const studyDate = dataSet.string('x00080020') || 'Data Desconhecida';
  const manufacturer = dataSet.string('x00080070') || 'Equipamento Odontológico';
  const seriesDescription = dataSet.string('x0008103e') || 'Tomografia / Corte';

  const rows = dataSet.uint16('x00280010') || 512;
  const columns = dataSet.uint16('x00280011') || 512;
  const bitsAllocated = dataSet.uint16('x00280100') || 16;
  const bitsStored = dataSet.uint16('x00280101') || bitsAllocated;
  const pixelRepresentation = dataSet.uint16('x00280103') || 0; // 0 = unsigned, 1 = signed

  // Espaçamento de pixel em mm (ex: "0.25\0.25")
  const spacingStr = dataSet.string('x00280030');
  let pixelSpacing: [number, number] = [0.3, 0.3];
  if (spacingStr) {
    const parts = spacingStr.split('\\').map(p => parseFloat(p.trim()));
    if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      pixelSpacing = [parts[0], parts[1]];
    }
  }

  const sliceThicknessMm = parseFloat(dataSet.string('x00180050') || '1.0');
  const rescaleIntercept = parseFloat(dataSet.string('x00281052') || '0');
  const rescaleSlope = parseFloat(dataSet.string('x00281053') || '1');

  // Window Center (WL) e Window Width (WW) padrão para contraste ósseo
  let windowCenter = parseFloat(dataSet.string('x00281050') || '450');
  let windowWidth = parseFloat(dataSet.string('x00281051') || '1500');

  if (isNaN(windowCenter) || windowWidth <= 0) {
    windowCenter = 450;
    windowWidth = 1500;
  }

  // 3. Localizar e Extrair os Pixels Radiográficos
  const pixelElement = dataSet.elements.x7fe00010;
  if (!pixelElement) {
    throw new Error('O arquivo DICOM não contém dados de imagem de pixel (Tag 7FE0,0010).');
  }

  const numPixels = rows * columns;
  let pixelData: Int16Array | Uint16Array | Uint8Array;

  if (bitsAllocated === 16) {
    const byteOffset = pixelElement.dataOffset;
    if (pixelRepresentation === 1) {
      pixelData = new Int16Array(byteArray.buffer, byteOffset, numPixels);
    } else {
      pixelData = new Uint16Array(byteArray.buffer, byteOffset, numPixels);
    }
  } else {
    pixelData = new Uint8Array(byteArray.buffer, pixelElement.dataOffset, numPixels);
  }

  // 4. Renderizar Texture Canvas inicial com Windowing Ósseo
  const { canvas, texture } = renderDicomToCanvasTexture(
    pixelData,
    rows,
    columns,
    windowCenter,
    windowWidth,
    rescaleIntercept,
    rescaleSlope,
    false
  );

  const physicalHeightMm = parseFloat((rows * pixelSpacing[0]).toFixed(2));
  const physicalWidthMm = parseFloat((columns * pixelSpacing[1]).toFixed(2));

  return {
    metadata: {
      fileName,
      fileSizeKb: fileSize ? Math.round(fileSize / 1024) : Math.round(buffer.byteLength / 1024),
      patientName,
      patientId,
      modality,
      studyDate,
      manufacturer,
      seriesDescription,
      rows,
      columns,
      bitsAllocated,
      bitsStored,
      pixelSpacing,
      sliceThicknessMm,
      windowCenter,
      windowWidth,
      rescaleIntercept,
      rescaleSlope,
      physicalWidthMm,
      physicalHeightMm
    },
    pixelData,
    texture,
    canvas
  };
}

/**
 * Lê e decodifica um arquivo DICOM (.dcm) odontológico a partir de um File
 */
export async function loadDicomFromFile(file: File): Promise<DicomParseResult> {
  const buffer = await file.arrayBuffer();
  return loadDicomFromBuffer(buffer, file.name, file.size);
}

/**
 * Baixa e decodifica um arquivo DICOM (.dcm) a partir de uma URL
 */
export async function loadDicomFromUrl(url: string, fileName: string): Promise<DicomParseResult> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Falha ao baixar arquivo DICOM (${res.statusText})`);
  }
  const buffer = await res.arrayBuffer();
  return loadDicomFromBuffer(buffer, fileName, buffer.byteLength);
}

/**
 * Gera uma fatia tomográfica odontológica sintética de alta fidelidade
 * caso o arquivo remoto esteja temporariamente inacessível.
 */
export function createSyntheticDentalDicom(fileName: string, patientName: string = 'Paciente'): DicomParseResult {
  const rows = 512;
  const columns = 512;
  const numPixels = rows * columns;
  const pixelData = new Int16Array(numPixels);

  // Construir arcada mandibular com densidade óssea em Hounsfield Units (HU)
  const cx = columns / 2;
  const cy = rows / 2;

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < columns; x++) {
      const idx = y * columns + x;
      const dx = (x - cx) / 160;
      const dy = (y - cy) / 160;
      const r = Math.sqrt(dx * dx + dy * dy);

      // Fundo: Ar (-1000 HU)
      let hu = -1000;

      // Tecido mole / bochecha (-50 a +40 HU)
      if (r < 1.35) {
        hu = 30 + Math.sin(x * 0.1) * 10;
      }

      // Osso Cortical e Medular Mandibular (Parábola da mandíbula)
      const archY = (dx * dx * 0.9) - 0.4;
      const distToArch = Math.abs(dy - archY);

      if (distToArch < 0.22 && dy > -0.7 && dy < 0.8) {
        if (distToArch < 0.05 || distToArch > 0.17) {
          // Osso cortical denso (+1200 a +1800 HU)
          hu = 1400 + Math.random() * 200;
        } else {
          // Osso trabecular / esponjoso (+300 a +600 HU)
          hu = 450 + (Math.sin(x * 0.5) * Math.cos(y * 0.5)) * 150;
        }
      }

      // Canal Mandibular / Nervo Alveolar Inferior (-100 HU radiotransparente)
      const nerveLeft = Math.sqrt((dx + 0.45) ** 2 + (dy - 0.15) ** 2);
      const nerveRight = Math.sqrt((dx - 0.45) ** 2 + (dy - 0.15) ** 2);
      if (nerveLeft < 0.04 || nerveRight < 0.04) {
        hu = -50;
      }

      pixelData[idx] = hu;
    }
  }

  const windowCenter = 450;
  const windowWidth = 1500;
  const { canvas, texture } = renderDicomToCanvasTexture(
    pixelData,
    rows,
    columns,
    windowCenter,
    windowWidth,
    0,
    1,
    false
  );

  return {
    metadata: {
      fileName,
      fileSizeKb: 840,
      patientName,
      patientId: 'ID-TOMO-CBCT',
      modality: 'CBCT',
      studyDate: new Date().toLocaleDateString('pt-BR'),
      manufacturer: 'ImplantPrecision Cone Beam',
      seriesDescription: 'Tomografia Computadorizada Cone Beam 3D',
      rows,
      columns,
      bitsAllocated: 16,
      bitsStored: 16,
      pixelSpacing: [0.25, 0.25],
      sliceThicknessMm: 1.0,
      windowCenter,
      windowWidth,
      rescaleIntercept: 0,
      rescaleSlope: 1,
      physicalWidthMm: 128.0,
      physicalHeightMm: 128.0
    },
    pixelData,
    texture,
    canvas
  };
}

/**
 * Converte dados de pixel radiográficos em Canvas e CanvasTexture para o Three.js
 */
export function renderDicomToCanvasTexture(
  pixelData: Int16Array | Uint16Array | Uint8Array,
  rows: number,
  columns: number,
  windowCenter: number,
  windowWidth: number,
  rescaleIntercept: number,
  rescaleSlope: number,
  invert: boolean = false
): { canvas: HTMLCanvasElement; texture: THREE.CanvasTexture } {
  const canvas = document.createElement('canvas');
  canvas.width = columns;
  canvas.height = rows;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Não foi possível inicializar o contexto 2D do Canvas.');
  }

  const imgData = ctx.createImageData(columns, rows);
  const data = imgData.data;

  // Fórmula Médica de Windowing (Window Level / Window Width)
  const halfW = windowWidth / 2;
  const minVal = windowCenter - halfW;
  const maxVal = windowCenter + halfW;
  const range = maxVal - minVal || 1;

  for (let i = 0; i < pixelData.length; i++) {
    const raw = pixelData[i];
    // Conversão para Hounsfield Units (HU)
    const hu = raw * rescaleSlope + rescaleIntercept;

    // Mapeamento de intensidade
    let norm = ((hu - minVal) / range) * 255;
    if (norm < 0) norm = 0;
    if (norm > 255) norm = 255;

    if (invert) {
      norm = 255 - norm;
    }

    const idx = i * 4;
    data[idx] = norm;       // R
    data[idx + 1] = norm;   // G
    data[idx + 2] = norm;   // B
    data[idx + 3] = 255;    // Alpha opaco
  }

  ctx.putImageData(imgData, 0, 0);

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.needsUpdate = true;

  return { canvas, texture };
}
