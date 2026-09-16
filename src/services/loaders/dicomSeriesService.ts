import * as THREE from 'three';
import dicomParser from 'dicom-parser';

export interface DicomSliceInfo {
  file: File;
  instanceNumber: number;
  sliceLocation: number;
  zPosition: number;
  byteArray?: Uint8Array;
}

export interface DicomSeriesMetadata {
  patientName: string;
  patientId: string;
  modality: string;
  studyDate: string;
  manufacturer: string;
  totalSlices: number;
  rows: number;
  columns: number;
  pixelSpacing: [number, number]; // [rowSpacingMm, colSpacingMm]
  sliceThicknessMm: number;
  sliceSpacingMm: number;
  physicalDimensionsMm: {
    width: number;
    height: number;
    depth: number;
  };
  rescaleIntercept: number;
  rescaleSlope: number;
}

export interface DicomSeriesResult {
  metadata: DicomSeriesMetadata;
  volumeTexture: THREE.Data3DTexture;
  volumeSize: {
    width: number;
    height: number;
    depth: number;
  };
  slices: DicomSliceInfo[];
}

/**
 * Lê e decodifica uma série completa de arquivos DICOM (.dcm) de uma tomografia
 */
export async function loadDicomSeries(
  files: File[],
  onProgress?: (processed: number, total: number, message: string) => void
): Promise<DicomSeriesResult> {
  // 1. Filtrar apenas arquivos .dcm ou com extensão compatível
  const dcmFiles = files.filter(f => {
    const name = f.name.toLowerCase();
    return name.endsWith('.dcm') || name.endsWith('.dicom') || !name.includes('.');
  });

  if (dcmFiles.length === 0) {
    throw new Error('Nenhum arquivo DICOM (.dcm) válido encontrado na pasta selecionada.');
  }

  onProgress?.(0, dcmFiles.length, 'Iniciando leitura dos metadados das fatias...');

  // 2. Extrair metadados e posições Z para ordenação anatômica
  const sliceList: DicomSliceInfo[] = [];
  let firstHeaderDataSet: any = null;
  let rows = 512;
  let columns = 512;
  let pixelSpacing: [number, number] = [0.3, 0.3];
  let sliceThicknessMm = 1.0;
  let rescaleIntercept = 0;
  let rescaleSlope = 1;

  // Lote de leitura de cabeçalhos
  for (let i = 0; i < dcmFiles.length; i++) {
    const file = dcmFiles[i];
    
    if (i % 20 === 0) {
      onProgress?.(i, dcmFiles.length, `Analisando fatias (${i + 1}/${dcmFiles.length})...`);
    }

    try {
      const buffer = await file.arrayBuffer();
      const byteArray = new Uint8Array(buffer);
      const dataSet = dicomParser.parseDicom(byteArray);

      if (!firstHeaderDataSet) {
        firstHeaderDataSet = dataSet;
        rows = dataSet.uint16('x00280010') || 512;
        columns = dataSet.uint16('x00280011') || 512;
        
        const sp = dataSet.string('x00280030');
        if (sp) {
          const parts = sp.split('\\').map(p => parseFloat(p.trim()));
          if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            pixelSpacing = [parts[0], parts[1]];
          }
        }

        sliceThicknessMm = parseFloat(dataSet.string('x00180050') || '1.0');
        rescaleIntercept = parseFloat(dataSet.string('x00281052') || '0');
        rescaleSlope = parseFloat(dataSet.string('x00281053') || '1');
      }

      // Extrair posição Z do corte
      let zPos = 0;
      const imgPos = dataSet.string('x00200032');
      if (imgPos) {
        const parts = imgPos.split('\\').map(p => parseFloat(p.trim()));
        if (parts.length >= 3 && !isNaN(parts[2])) {
          zPos = parts[2];
        }
      } else {
        const loc = parseFloat(dataSet.string('x00201041') || '0');
        zPos = !isNaN(loc) ? loc : i;
      }

      const instanceNumber = dataSet.uint16('x00200013') || i + 1;

      sliceList.push({
        file,
        instanceNumber,
        sliceLocation: zPos,
        zPosition: zPos,
        byteArray
      });
    } catch (err) {
      console.warn(`Arquivo ignorado (não é DICOM válido): ${file.name}`);
    }
  }

  if (sliceList.length === 0) {
    throw new Error('Não foi possível ler as fatias DICOM da pasta informada.');
  }

  // 3. Ordenar as fatias na ordem anatômica correta (Z crescente: caudal para cranial)
  sliceList.sort((a, b) => a.zPosition - b.zPosition);

  // Calcular espaçamento real entre fatias (Slice Spacing)
  let sliceSpacingMm = sliceThicknessMm;
  if (sliceList.length > 1) {
    const dz = Math.abs(sliceList[sliceList.length - 1].zPosition - sliceList[0].zPosition) / (sliceList.length - 1);
    if (dz > 0.05 && dz < 10) {
      sliceSpacingMm = parseFloat(dz.toFixed(3));
    }
  }

  let patientName = firstHeaderDataSet?.string('x00100010') || '';
  patientName = patientName.replace(/\^/g, ' ').replace(/_+/g, ' ').replace(/\s+/g, ' ').trim();
  if (!patientName || patientName.toLowerCase() === 'paciente' || patientName.toLowerCase() === 'anonymized') {
    // Tenta extrair da nomenclatura dos arquivos, ex: "GUERRA DE ALBUQUERQUE_EDINAURA..."
    if (dcmFiles[0]?.name) {
      const cleanName = dcmFiles[0].name.replace(/\.[^/.]+$/, "");
      const tokens = cleanName.split('_');
      if (tokens.length >= 2) {
        patientName = `${tokens[0]} ${tokens[1]}`.trim();
      } else {
        patientName = cleanName;
      }
    } else {
      patientName = 'Paciente';
    }
  }
  const patientId = firstHeaderDataSet?.string('x00100020') || 'TC-01';
  const modality = firstHeaderDataSet?.string('x00080060') || 'CBCT';
  const studyDate = firstHeaderDataSet?.string('x00080020') || 'Recente';
  const manufacturer = firstHeaderDataSet?.string('x00080070') || 'Tomógrafo Odontológico';

  const totalSlices = sliceList.length;

  onProgress?.(
    totalSlices,
    totalSlices,
    `Construindo volume 3D (${columns}×${rows}×${totalSlices} voxels)...`
  );

  // 4. Construção da Textura Volumétrica 3D na GPU (Data3DTexture)
  // Para manter 60 FPS fluídos em qualquer navegador, realizamos amostragem otimizada:
  // Volume Alvo: 192 x 192 x min(totalSlices, 192)
  const targetW = 192;
  const targetH = 192;
  const targetD = Math.min(totalSlices, 192);

  const voxelCount = targetW * targetH * targetD;
  const volumeData = new Uint8Array(voxelCount);

  // Mapear fatias no volume 3D
  for (let z = 0; z < targetD; z++) {
    const sliceIndex = Math.floor((z / (targetD - 1 || 1)) * (totalSlices - 1));
    const slice = sliceList[sliceIndex];

    if (!slice.byteArray) continue;

    try {
      const dataSet = dicomParser.parseDicom(slice.byteArray);
      const pixelElement = dataSet.elements.x7fe00010;
      if (!pixelElement) continue;

      const bitsAllocated = dataSet.uint16('x00280100') || 16;
      const pixelRep = dataSet.uint16('x00280103') || 0;
      const origPixels = rows * columns;

      let pixelData: Int16Array | Uint16Array | Uint8Array;
      if (bitsAllocated === 16) {
        if (pixelRep === 1) {
          pixelData = new Int16Array(slice.byteArray.buffer, pixelElement.dataOffset, origPixels);
        } else {
          pixelData = new Uint16Array(slice.byteArray.buffer, pixelElement.dataOffset, origPixels);
        }
      } else {
        pixelData = new Uint8Array(slice.byteArray.buffer, pixelElement.dataOffset, origPixels);
      }

      // Amostragem bilinear e normalização Hounsfield para Uint8
      const zOffset = z * targetW * targetH;
      for (let y = 0; y < targetH; y++) {
        const origY = Math.floor((y / targetH) * rows);
        const origRowOffset = origY * columns;
        const yOffset = y * targetW;

        for (let x = 0; x < targetW; x++) {
          const origX = Math.floor((x / targetW) * columns);
          const raw = pixelData[origRowOffset + origX] || 0;
          const hu = raw * rescaleSlope + rescaleIntercept;

          // Normalização: ar (-1000 HU) a dente/esmalte denso (+2500 HU)
          // Mapeia para intervalo [0, 255]
          let norm = ((hu - (-800)) / (2500 - (-800))) * 255;
          if (norm < 0) norm = 0;
          if (norm > 255) norm = 255;

          volumeData[zOffset + yOffset + x] = Math.round(norm);
        }
      }
    } catch (e) {
      // Ignorar erros pontuais em fatias corrompidas
    }
  }

  // 5. Criar Data3DTexture para WebGL 2.0
  const texture = new THREE.Data3DTexture(volumeData, targetW, targetH, targetD);
  texture.format = THREE.RedFormat;
  texture.type = THREE.UnsignedByteType;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.unpackAlignment = 1;
  texture.needsUpdate = true;

  const physicalWidth = parseFloat((columns * pixelSpacing[1]).toFixed(1));
  const physicalHeight = parseFloat((rows * pixelSpacing[0]).toFixed(1));
  const physicalDepth = parseFloat((totalSlices * sliceSpacingMm).toFixed(1));

  onProgress?.(totalSlices, totalSlices, 'Volume 3D pronto para inspeção!');

  return {
    metadata: {
      patientName,
      patientId,
      modality,
      studyDate,
      manufacturer,
      totalSlices,
      rows,
      columns,
      pixelSpacing,
      sliceThicknessMm,
      sliceSpacingMm,
      physicalDimensionsMm: {
        width: physicalWidth,
        height: physicalHeight,
        depth: physicalDepth
      },
      rescaleIntercept,
      rescaleSlope
    },
    volumeTexture: texture,
    volumeSize: {
      width: targetW,
      height: targetH,
      depth: targetD
    },
    slices: sliceList
  };
}
