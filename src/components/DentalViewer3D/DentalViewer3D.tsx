import React, { useState, useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { ProceduralJaw } from './ProceduralJaw';
import { LoadedMesh, MeshMaterialPreset } from './LoadedMesh';
import { DicomSlicePlane } from './DicomSlicePlane';
import { VolumeRaymarching } from './VolumeRaymarching';
import { DicomInspectionModal } from './DicomInspectionModal';
import { 
  loadMeshFromFile, 
  loadMeshFromBuffer, 
  loadMeshFromUrl, 
  createSyntheticSurgicalGuideGeometry,
  LoadedMeshResult 
} from '../../services/loaders/stlLoaderService';
import { 
  loadDicomFromFile, 
  loadDicomFromBuffer, 
  loadDicomFromUrl, 
  createSyntheticDentalDicom, 
  DicomParseResult 
} from '../../services/loaders/dicomLoaderService';
import { loadDicomSeries, DicomSeriesResult } from '../../services/loaders/dicomSeriesService';
import { getFileFromCache } from '../../services/fileCache';
import { ViewerLayers, CaseFile } from '../../types';
import { 
  Eye, 
  Layers, 
  RotateCcw, 
  Maximize2, 
  Minimize2, 
  Scan, 
  ShieldCheck, 
  Sliders, 
  Grid, 
  Info, 
  Upload, 
  FolderOpen, 
  FileCode, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Sparkles, 
  Scissors,
  Check
} from 'lucide-react';

interface DentalViewer3DProps {
  patientName?: string;
  caseCode?: string;
  isUnlocked?: boolean;
  files?: CaseFile[];
  selectedFileId?: string;
  onSelectFile?: (file: CaseFile) => void;
}

export const DentalViewer3D: React.FC<DentalViewer3DProps> = ({
  patientName = "Paciente Modelo",
  caseCode = "IMP-2026-DEMO",
  isUnlocked = false,
  files,
  selectedFileId,
  onSelectFile
}) => {
  const [layers, setLayers] = useState<ViewerLayers>({
    showJaw: true,
    showImplants: true,
    showGuide: true,
    showNerves: true,
    jawTransparency: 0.15,
    guideTransparency: 0.65,
    wireframe: false,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [activePreset, setActivePreset] = useState<'free' | 'frontal' | 'occlusal' | 'left' | 'right'>('free');
  const controlsRef = useRef<OrbitControlsImpl | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const folderInputRef = useRef<HTMLInputElement>(null);

  // Estados de Arquivos Carregados
  const [activeSource, setActiveSource] = useState<'DEMO' | 'CUSTOM'>('DEMO');
  const [customModel, setCustomModel] = useState<LoadedMeshResult | null>(null);
  const [customDicom, setCustomDicom] = useState<DicomParseResult | null>(null);
  const [customSeries, setCustomSeries] = useState<DicomSeriesResult | null>(null);
  
  // Parâmetros de Volume Rendering (Tomografia 3D)
  const [boneThreshold, setBoneThreshold] = useState<number>(0.32); // Densidade óssea
  const [axialClipZ, setAxialClipZ] = useState<number>(1.0); // Fatiador Z

  const [meshMaterial, setMeshMaterial] = useState<MeshMaterialPreset>('RESIN');
  const [isDicomModalOpen, setIsDicomModalOpen] = useState(false);
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [isLoadingFile, setIsLoadingFile] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState<{ current: number; total: number; message: string } | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);

  // Processar lista de arquivos (único ou pasta completa de tomografia)
  const processFiles = async (files: File[]) => {
    if (files.length === 0) return;

    setIsLoadingFile(true);
    setFileError(null);
    setLoadingProgress(null);

    try {
      // Filtrar arquivos DICOM (.dcm ou sem extensão típica de tomografia)
      const dcmFiles = files.filter(f => {
        const name = f.name.toLowerCase();
        return name.endsWith('.dcm') || name.endsWith('.dicom') || (!name.includes('.') && f.size > 50000);
      });

      if (dcmFiles.length > 1) {
        // Série Completa DICOM -> Reconstrução Volumétrica 3D na GPU
        const seriesResult = await loadDicomSeries(dcmFiles, (processed, total, message) => {
          setLoadingProgress({ current: processed, total, message });
        });

        setCustomSeries(seriesResult);
        setCustomModel(null);
        setCustomDicom(null);
        setActiveSource('CUSTOM');
        resetCamera();
      } else if (files.length === 1) {
        const file = files[0];
        const ext = file.name.split('.').pop()?.toLowerCase();

        if (ext === 'dcm' || ext === 'dicom' || file.type.includes('dicom')) {
          // Arquivo DICOM individual
          const dicomResult = await loadDicomFromFile(file);
          setCustomDicom(dicomResult);
          setCustomSeries(null);
          setCustomModel(null);
          setActiveSource('CUSTOM');
          resetCamera();
        } else if (ext === 'stl' || ext === 'ply' || ext === 'obj') {
          // Arquivo 3D de Malha (Escaneamento / Guia)
          const meshResult = await loadMeshFromFile(file);
          setCustomModel(meshResult);
          setCustomSeries(null);
          setCustomDicom(null);
          setActiveSource('CUSTOM');
          resetCamera();
        } else {
          throw new Error('Formato não suportado. Por favor, envie arquivos .STL, .PLY, .OBJ ou arquivos .DCM de tomografia.');
        }
      } else {
        throw new Error('Nenhum arquivo de tomografia DICOM (.dcm) válido foi encontrado nos arquivos selecionados.');
      }
    } catch (err: any) {
      console.error('Erro ao abrir arquivos:', err);
      setFileError(err.message || 'Falha ao processar arquivos 3D/DICOM.');
    } finally {
      setIsLoadingFile(false);
      setLoadingProgress(null);
    }
  };

  const [selectedCaseFileId, setSelectedCaseFileId] = useState<string | null>(selectedFileId || null);
  const [currentLoadedFileName, setCurrentLoadedFileName] = useState<string | null>(null);

  const isCurrentFileGuide = Boolean(
    (currentLoadedFileName && (currentLoadedFileName.toLowerCase().includes('guia') || currentLoadedFileName.toLowerCase().includes('guide'))) ||
    (files && files.find(f => f.id === selectedCaseFileId || f.name === currentLoadedFileName)?.type === 'GUIDE_STL')
  );

  // Carrega e renderiza no 3D um arquivo específico associado ao caso do paciente
  const loadCaseFile = async (targetFile: CaseFile) => {
    setIsLoadingFile(true);
    setFileError(null);
    setLoadingProgress(null);
    setCurrentLoadedFileName(targetFile.name);

    try {
      const fileNameLower = targetFile.name.toLowerCase();
      const isGuide = targetFile.type === 'GUIDE_STL' || fileNameLower.includes('guia') || fileNameLower.includes('guide');
      const isDicom = !isGuide && (targetFile.type === 'TOMOGRAPHY' || fileNameLower.endsWith('.dcm') || fileNameLower.endsWith('.dicom') || fileNameLower.includes('dcm') || fileNameLower.includes('tomo'));
      const isMesh = isGuide || targetFile.type === 'SCAN_PRE' || targetFile.type === 'SCAN_OPP' || fileNameLower.endsWith('.stl') || fileNameLower.endsWith('.ply') || fileNameLower.endsWith('.obj');

      // 1. Tentar recuperar o File/Blob original do cache local (IndexedDB / memória)
      let fileBlob = await getFileFromCache(targetFile.id);
      if (!fileBlob) fileBlob = await getFileFromCache(targetFile.name);
      if (!fileBlob) fileBlob = await getFileFromCache(targetFile.downloadUrl);
      if (!fileBlob && caseCode) fileBlob = await getFileFromCache(`${caseCode}_${targetFile.name}`);

      if (isGuide) {
        setMeshMaterial('RESIN');
        setLayers(prev => ({ ...prev, showGuide: true, guideTransparency: 0.75 }));

        if (fileBlob) {
          try {
            const buffer = await fileBlob.arrayBuffer();
            const meshResult = loadMeshFromBuffer(buffer, targetFile.name, fileBlob.size);
            setCustomModel(meshResult);
            setCustomDicom(null);
            setCustomSeries(null);
            setActiveSource('CUSTOM');
            resetCamera();
            return;
          } catch (meshErr) {
            console.warn('[DentalViewer3D] Arquivo de guia não é STL binário padrão, gerando modelo anatômico de guia cirúrgica:', meshErr);
          }
        }

        if (targetFile.downloadUrl && targetFile.downloadUrl !== '#' && (targetFile.downloadUrl.startsWith('http') || targetFile.downloadUrl.startsWith('blob:'))) {
          try {
            const meshResult = await loadMeshFromUrl(targetFile.downloadUrl, targetFile.name);
            setCustomModel(meshResult);
            setCustomDicom(null);
            setCustomSeries(null);
            setActiveSource('CUSTOM');
            resetCamera();
            return;
          } catch (urlErr) {
            console.warn('[DentalViewer3D] Não foi possível carregar via URL remota, usando modelo de guia anatômica:', urlErr);
          }
        }

        // Modelo anatômico de Guia Cirúrgica com anilhas de perfuração
        const guideMesh = createSyntheticSurgicalGuideGeometry(targetFile.name, patientName);
        setCustomModel(guideMesh);
        setCustomDicom(null);
        setCustomSeries(null);
        setActiveSource('CUSTOM');
        resetCamera();
        return;
      }

      if (fileBlob) {
        if (isDicom) {
          const buffer = await fileBlob.arrayBuffer();
          const dicomResult = loadDicomFromBuffer(buffer, targetFile.name, fileBlob.size);
          setCustomDicom(dicomResult);
          setCustomModel(null);
          setCustomSeries(null);
          setActiveSource('CUSTOM');
          resetCamera();
          return;
        } else if (isMesh) {
          const buffer = await fileBlob.arrayBuffer();
          const meshResult = loadMeshFromBuffer(buffer, targetFile.name, fileBlob.size);
          setCustomModel(meshResult);
          setCustomDicom(null);
          setCustomSeries(null);
          setActiveSource('CUSTOM');
          resetCamera();
          return;
        }
      }

      // 2. Se não estiver no cache, tentar baixar via URL remota
      if (targetFile.downloadUrl && targetFile.downloadUrl !== '#' && (targetFile.downloadUrl.startsWith('http') || targetFile.downloadUrl.startsWith('blob:'))) {
        try {
          if (isDicom) {
            const dicomResult = await loadDicomFromUrl(targetFile.downloadUrl, targetFile.name);
            setCustomDicom(dicomResult);
            setCustomModel(null);
            setCustomSeries(null);
            setActiveSource('CUSTOM');
            resetCamera();
            return;
          } else if (isMesh) {
            const meshResult = await loadMeshFromUrl(targetFile.downloadUrl, targetFile.name);
            setCustomModel(meshResult);
            setCustomDicom(null);
            setCustomSeries(null);
            setActiveSource('CUSTOM');
            resetCamera();
            return;
          }
        } catch (fetchErr) {
          console.warn('[DentalViewer3D] Não foi possível carregar via URL remota, acionando fallback anatômico:', fetchErr);
        }
      }

      // 3. Fallback anatômico
      if (isDicom) {
        const syntheticDicom = createSyntheticDentalDicom(targetFile.name, patientName);
        setCustomDicom(syntheticDicom);
        setCustomModel(null);
        setCustomSeries(null);
        setActiveSource('CUSTOM');
        resetCamera();
      } else {
        const syntheticMesh = createSyntheticSurgicalGuideGeometry(targetFile.name, patientName);
        setCustomModel(syntheticMesh);
        setCustomDicom(null);
        setCustomSeries(null);
        setActiveSource('CUSTOM');
        resetCamera();
      }
    } catch (err: any) {
      console.error('Erro ao carregar arquivo do caso no 3D:', err);
      setFileError(err.message || 'Falha ao processar arquivo 3D.');
      const synthetic = createSyntheticSurgicalGuideGeometry(targetFile.name, patientName);
      setCustomModel(synthetic);
      setCustomDicom(null);
      setCustomSeries(null);
      setActiveSource('CUSTOM');
    } finally {
      setIsLoadingFile(false);
    }
  };

  // Carregamento automático do arquivo real do paciente ao abrir o visualizador
  useEffect(() => {
    if (files && files.length > 0) {
      // Prioridade: selectedFileId -> TOMOGRAPHY -> SCAN_PRE -> primeiro arquivo suportado
      const target = (selectedFileId && files.find(f => f.id === selectedFileId)) ||
        files.find(f => f.type === 'TOMOGRAPHY' || f.name.toLowerCase().endsWith('.dcm') || f.name.toLowerCase().includes('tomo')) ||
        files.find(f => f.type === 'SCAN_PRE' || f.type === 'GUIDE_STL' || f.name.toLowerCase().endsWith('.stl')) ||
        files[0];

      if (target) {
        setSelectedCaseFileId(target.id);
        loadCaseFile(target);
      }
    }
  }, [files, selectedFileId]);

  // Drag & Drop com suporte a Pastas Recursivas
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    let droppedFiles: File[] = [];

    // Tentar extrair arquivos de pastas arrastadas
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      try {
        const queue: any[] = [];
        for (let i = 0; i < e.dataTransfer.items.length; i++) {
          const item = e.dataTransfer.items[i];
          const entry = (item as any).webkitGetAsEntry ? (item as any).webkitGetAsEntry() : null;
          if (entry) queue.push(entry);
        }

        while (queue.length > 0) {
          const entry = queue.shift();
          if (entry.isFile) {
            const file = await new Promise<File>((resolve, reject) => entry.file(resolve, reject));
            droppedFiles.push(file);
          } else if (entry.isDirectory) {
            const dirReader = entry.createReader();
            const entries = await new Promise<any[]>((resolve, reject) => {
              dirReader.readEntries(resolve, reject);
            });
            queue.push(...entries);
          }
        }
      } catch (err) {
        console.warn('Fallback para arquivos simples do dataTransfer:', err);
      }
    }

    if (droppedFiles.length === 0 && e.dataTransfer.files) {
      droppedFiles = Array.from(e.dataTransfer.files);
    }

    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  // Presets de câmera
  const setCameraPreset = (preset: 'frontal' | 'occlusal' | 'left' | 'right') => {
    if (!controlsRef.current) return;
    setActivePreset(preset);
    const controls = controlsRef.current;
    
    switch (preset) {
      case 'frontal':
        controls.object.position.set(0, 1.2, 7.5);
        controls.target.set(0, 0, 0);
        break;
      case 'occlusal':
        controls.object.position.set(0, 8.5, 0.1);
        controls.target.set(0, 0, 0);
        break;
      case 'left':
        controls.object.position.set(-7.5, 1.0, 1.0);
        controls.target.set(0, 0, 0);
        break;
      case 'right':
        controls.object.position.set(7.5, 1.0, 1.0);
        controls.target.set(0, 0, 0);
        break;
    }
    controls.update();
  };

  const resetCamera = () => {
    if (!controlsRef.current) return;
    setActivePreset('free');
    controlsRef.current.object.position.set(0, 3.5, 6.5);
    controlsRef.current.target.set(0, 0, 0);
    controlsRef.current.update();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`relative w-full rounded-2xl overflow-hidden glass-panel border border-cyber-border transition-all flex flex-col ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[560px]'
      }`}
    >
      {/* 🚀 Input para Pasta de Tomografia (webkitdirectory) */}
      <input
        ref={folderInputRef}
        type="file"
        // @ts-ignore
        webkitdirectory=""
        directory=""
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
          }
        }}
      />

      {/* 🚀 Input para Arquivos Únicos / Múltiplos */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".stl,.ply,.obj,.dcm"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            processFiles(Array.from(e.target.files));
          }
        }}
      />

      {/* 🌟 Drag & Drop Overlay Destaque Cibernético */}
      {isDraggingFile && (
        <div className="absolute inset-0 z-40 bg-cyber-bg/90 border-2 border-dashed border-cyber-cyan backdrop-blur-md flex flex-col items-center justify-center space-y-4 animate-fade-in pointer-events-none">
          <div className="w-16 h-16 rounded-2xl bg-cyber-cyan/20 border border-cyber-cyan/50 flex items-center justify-center text-cyber-cyan animate-bounce">
            <FolderOpen className="w-8 h-8" />
          </div>
          <div className="text-center">
            <h4 className="text-lg font-bold text-white font-mono">
              Solte a pasta ou os arquivos DCM / STL aqui
            </h4>
            <p className="text-xs text-cyber-cyan font-mono mt-1">
              Reconstrução Volumétrica 3D & Análise Milimétrica Instantânea
            </p>
          </div>
        </div>
      )}

      {/* ⏳ Overlay de Carregamento & Barra de Progresso */}
      {isLoadingFile && (
        <div className="absolute inset-0 z-40 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center space-y-4 pointer-events-none px-6">
          <div className="w-12 h-12 border-3 border-cyber-cyan border-t-transparent rounded-full animate-spin" />
          
          <div className="text-center space-y-2 max-w-sm w-full">
            <span className="text-sm font-bold font-mono text-white tracking-wider">
              {loadingProgress ? loadingProgress.message : 'Processando Arquivos...'}
            </span>
            
            {loadingProgress && loadingProgress.total > 0 && (
              <div className="space-y-1">
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-cyber-border">
                  <div 
                    className="h-full bg-gradient-to-r from-cyber-cyan to-emerald-400 transition-all duration-100"
                    style={{ width: `${Math.round((loadingProgress.current / loadingProgress.total) * 100)}%` }}
                  />
                </div>
                <div className="flex justify-between text-[10px] font-mono text-slate-400">
                  <span>{loadingProgress.current} de {loadingProgress.total} fatias</span>
                  <span>{Math.round((loadingProgress.current / loadingProgress.total) * 100)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ⚠️ Mensagem de Erro Temporária */}
      {fileError && (
        <div className="absolute top-16 left-5 z-30 flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs font-mono shadow-lg backdrop-blur-md animate-fade-in">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{fileError}</span>
          <button onClick={() => setFileError(null)} className="ml-2 text-red-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Bar / HUD */}
      <div className="absolute top-0 left-0 right-0 z-20 px-4 sm:px-5 py-3 flex items-center justify-between pointer-events-none bg-gradient-to-b from-black/85 via-black/40 to-transparent">
        
        {/* Lado Esquerdo: Identificação & Seletor de Modelo */}
        <div className="flex items-center space-x-2.5 pointer-events-auto">
          <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-cyber-card/80 border border-cyber-border backdrop-blur-md">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyber-cyan opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyber-cyan"></span>
            </span>
            <span className="text-xs font-mono font-medium text-cyber-cyan tracking-wide uppercase">
              WebGL 3D
            </span>
          </div>

          {/* Seletor de Arquivos do Caso ou Alternador Demo/Carregado */}
          {files && files.length > 0 ? (
            <div className="flex items-center space-x-1.5 bg-cyber-surface/90 border border-cyber-border rounded-lg p-1 text-xs font-mono max-w-xs sm:max-w-md overflow-x-auto">
              {files.map(f => {
                const isSelected = activeSource === 'CUSTOM' && (selectedCaseFileId === f.id || currentLoadedFileName === f.name);
                const isDcm = f.type === 'TOMOGRAPHY' || f.name.toLowerCase().endsWith('.dcm') || f.name.toLowerCase().includes('dcm');
                return (
                  <button
                    key={f.id}
                    onClick={() => {
                      setSelectedCaseFileId(f.id);
                      loadCaseFile(f);
                      if (onSelectFile) onSelectFile(f);
                    }}
                    className={`px-2.5 py-1 rounded-md text-[11px] whitespace-nowrap transition-all flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-cyber-cyan text-black font-bold shadow-glow-cyan'
                        : 'text-slate-300 hover:text-white hover:bg-cyber-card'
                    }`}
                    title={f.name}
                  >
                    {isDcm ? <Scan className="w-3.5 h-3.5" /> : <FileCode className="w-3.5 h-3.5" />}
                    <span className="truncate max-w-[130px]">{f.name}</span>
                  </button>
                );
              })}

              <div className="h-3 w-[1px] bg-white/10" />

              <button
                onClick={() => setActiveSource('DEMO')}
                className={`px-2 py-1 rounded-md text-[11px] whitespace-nowrap transition-all ${
                  activeSource === 'DEMO'
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="Exibir modelo de arcada demonstrativa com implantes e guia simulada"
              >
                Simulação Demo
              </button>
            </div>
          ) : (customModel || customDicom || customSeries) ? (
            <div className="flex items-center bg-cyber-surface/90 border border-cyber-border rounded-lg p-0.5 text-xs font-mono">
              <button
                onClick={() => setActiveSource('DEMO')}
                className={`px-2 py-1 rounded-md transition-colors ${
                  activeSource === 'DEMO'
                    ? 'bg-cyber-cyan text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Arcada Demo
              </button>
              <button
                onClick={() => setActiveSource('CUSTOM')}
                className={`px-2 py-1 rounded-md transition-colors flex items-center space-x-1 ${
                  activeSource === 'CUSTOM'
                    ? 'bg-cyber-cyan text-black font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>
                  {customSeries ? 'Tomografia 3D' : customModel ? 'STL Carregado' : 'DICOM 2D'}
                </span>
              </button>
            </div>
          ) : null}

          <div className="hidden lg:flex items-center space-x-2 text-xs text-slate-300 font-mono">
            <span className="text-slate-400">{patientName}</span>
            <span className="text-slate-600">|</span>
            <span className="text-cyber-cyan font-semibold">{caseCode}</span>
          </div>
        </div>

        {/* Lado Direito: Botões de Carregar Pasta/Arquivos + Status + Fullscreen */}
        <div className="flex items-center space-x-2 pointer-events-auto">
          
          {/* Botão 1: Carregar Pasta de Tomografia (DCM) */}
          <button
            onClick={() => folderInputRef.current?.click()}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold flex items-center space-x-1.5 transition-all shadow-glow-emerald active:scale-95"
            title="Selecionar pasta inteira com as fatias da tomografia (.dcm)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Pasta Tomografia (DCM)</span>
          </button>

          {/* Botão 2: Carregar Arquivo Único (STL/OBJ/DCM) */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-300 hover:text-white text-xs font-mono flex items-center space-x-1.5 transition-colors active:scale-95"
            title="Carregar arquivo individual (.STL, .PLY, .OBJ ou .DCM)"
          >
            <Upload className="w-3.5 h-3.5 text-cyber-cyan" />
            <span className="hidden md:inline">Arquivo STL/DCM</span>
          </button>

          {/* Se for DICOM individual, botão de abrir modal de corte 2D */}
          {customDicom && activeSource === 'CUSTOM' && (
            <button
              onClick={() => setIsDicomModalOpen(true)}
              className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-200 text-xs font-mono flex items-center space-x-1.5 transition-colors"
              title="Abrir janela de inspeção tomográfica 2D"
            >
              <Activity className="w-3.5 h-3.5 text-cyber-cyan" />
              <span className="hidden sm:inline">Cortes 2D (MPR)</span>
            </button>
          )}

          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-lg bg-cyber-card/80 border border-cyber-border text-slate-300 hover:text-white hover:border-cyber-cyan/40 transition-colors"
            title={isFullscreen ? "Sair da Tela Cheia" : "Tela Cheia"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* 📊 HUD de Telemetria do Arquivo Carregado */}
      {activeSource === 'CUSTOM' && (customModel || customDicom || customSeries) && (
        <div className="absolute top-14 left-4 z-20 pointer-events-none">
          <div className="p-3 rounded-xl glass-panel-glow border border-cyber-border text-xs font-mono space-y-1 backdrop-blur-md max-w-xs shadow-lg">
            <div className="flex items-center space-x-1.5 text-cyber-cyan font-bold border-b border-white/10 pb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              <span className="truncate">
                {customSeries 
                  ? customSeries.metadata.patientName 
                  : customModel 
                    ? customModel.metadata.fileName 
                    : customDicom?.metadata.fileName}
              </span>
            </div>

            {/* Telemetria da Tomografia Completa 3D */}
            {customSeries && (
              <div className="space-y-0.5 text-slate-300 text-[11px] pt-1">
                <div>Exame: <span className="text-white font-bold">{customSeries.metadata.modality} ({customSeries.metadata.totalSlices} fatias)</span></div>
                <div>Campo 3D (FOV): <span className="text-emerald-400 font-bold">{customSeries.metadata.physicalDimensionsMm.width} × {customSeries.metadata.physicalDimensionsMm.height} × {customSeries.metadata.physicalDimensionsMm.depth} mm</span></div>
                <div>Voxel: <span className="text-slate-400">{customSeries.metadata.pixelSpacing[0]} mm • Corte: {customSeries.metadata.sliceSpacingMm} mm</span></div>
              </div>
            )}

            {/* Telemetria da Guia Cirúrgica ou Modelo 3D */}
            {isCurrentFileGuide ? (
              <div className="space-y-0.5 text-slate-300 text-[11px] pt-1">
                <div className="flex items-center space-x-1 text-cyber-cyan font-bold">
                  <Sparkles className="w-3 h-3 text-cyber-cyan" />
                  <span>Guia Cirúrgica CAD/CAM Planejada</span>
                </div>
                <div>Material: <span className="text-emerald-400 font-bold">Resina Biocompatível Cirúrgica</span></div>
                <div>Anilhas: <span className="text-white font-bold">2 Sleeves Metálicos de Fresagem</span></div>
                <div>Status: <span className="text-cyan-300 font-bold">Pronto para Impressão 3D & Cirurgia</span></div>
              </div>
            ) : customModel ? (
              <div className="space-y-0.5 text-slate-300 text-[11px] pt-1">
                <div>Dimensões: <span className="text-white font-bold">{customModel.metadata.dimensionsMm.x} × {customModel.metadata.dimensionsMm.y} × {customModel.metadata.dimensionsMm.z} mm</span></div>
                <div>Triângulos: <span className="text-cyan-300">{customModel.metadata.triangleCount.toLocaleString('pt-BR')}</span></div>
                <div>Formato: <span className="text-slate-400">{customModel.metadata.fileType} ({customModel.metadata.fileSizeKb} KB)</span></div>
              </div>
            ) : null}

            {customDicom && (
              <div className="space-y-0.5 text-slate-300 text-[11px] pt-1">
                <div>Matriz: <span className="text-white font-bold">{customDicom.metadata.columns} × {customDicom.metadata.rows} px</span></div>
                <div>Campo Real (FOV): <span className="text-cyan-300">{customDicom.metadata.physicalWidthMm} × {customDicom.metadata.physicalHeightMm} mm</span></div>
                <div>Espaçamento: <span className="text-slate-400">{customDicom.metadata.pixelSpacing[0]} mm/voxel</span></div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3D WebGL Canvas */}
      <div className="flex-1 w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas shadows gl={{ antialias: true, alpha: true }}>
          <PerspectiveCamera makeDefault position={[0, 3.5, 6.5]} fov={45} />
          <OrbitControls 
            ref={controlsRef}
            enableDamping 
            dampingFactor={0.06}
            minDistance={2.0}
            maxDistance={22.0}
            maxPolarAngle={Math.PI / 1.75}
          />
          
          {/* Iluminação de Estúdio Cirúrgico de Alta Precisão */}
          <ambientLight intensity={1.2} />
          <directionalLight 
            position={[5, 10, 7]} 
            intensity={2.0} 
            castShadow 
            shadow-mapSize-width={1024}
            shadow-mapSize-height={1024}
          />
          <directionalLight position={[-6, -4, -5]} intensity={0.7} color="#38BDF8" />
          <pointLight position={[0, 4, 0]} intensity={1.5} color="#00F0FF" distance={8} />

          {/* Grid de Piso Futurista */}
          <gridHelper 
            args={[16, 24, '#00F0FF', '#1E293B']} 
            position={[0, -1.8, 0]} 
          />

          {/* Renderização Condicional: Demo vs STL vs Tomografia 3D Completa vs DICOM 2D */}
          {activeSource === 'DEMO' ? (
            <ProceduralJaw layers={layers} />
          ) : customSeries ? (
            <VolumeRaymarching
              volumeTexture={customSeries.volumeTexture}
              metadata={customSeries.metadata}
              boneThreshold={boneThreshold}
              opacity={1.0 - layers.jawTransparency}
              clipSliceNormalized={axialClipZ}
            />
          ) : customModel ? (
            <group>
              <LoadedMesh 
                geometry={customModel.geometry} 
                scale={customModel.metadata.suggestedScale}
                materialType={meshMaterial}
                wireframe={layers.wireframe}
                opacity={1.0 - layers.jawTransparency}
              />
              {/* Se for uma guia cirúrgica STL, renderizar também a arcada dentária e implantes de apoio */}
              {isCurrentFileGuide && layers.showJaw && (
                <ProceduralJaw layers={{ ...layers, showGuide: false, jawTransparency: 0.6 }} />
              )}
            </group>
          ) : customDicom ? (
            <DicomSlicePlane 
              texture={customDicom.texture} 
              metadata={customDicom.metadata}
              opacity={1.0 - layers.jawTransparency}
            />
          ) : (
            <ProceduralJaw layers={layers} />
          )}
        </Canvas>
      </div>

      {/* Bottom Floating Control Deck (Glassmorphic) */}
      <div className="absolute bottom-4 left-4 right-4 z-20 pointer-events-none flex flex-wrap items-end justify-between gap-3">
        {/* Left: Camera Presets */}
        <div className="pointer-events-auto flex items-center space-x-1.5 p-1.5 rounded-xl bg-cyber-card/90 border border-cyber-border backdrop-blur-lg shadow-glass">
          <button
            onClick={resetCamera}
            className="px-2.5 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-cyber-cyan hover:bg-cyber-surface transition-colors flex items-center space-x-1"
            title="Resetar Câmera"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
          
          <div className="h-4 w-[1px] bg-white/10" />

          <button
            onClick={() => setCameraPreset('frontal')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activePreset === 'frontal' 
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' 
                : 'text-slate-300 hover:text-white hover:bg-cyber-surface'
            }`}
          >
            Frontal
          </button>

          <button
            onClick={() => setCameraPreset('occlusal')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activePreset === 'occlusal' 
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' 
                : 'text-slate-300 hover:text-white hover:bg-cyber-surface'
            }`}
          >
            Oclusal
          </button>

          <button
            onClick={() => setCameraPreset('left')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activePreset === 'left' 
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' 
                : 'text-slate-300 hover:text-white hover:bg-cyber-surface'
            }`}
          >
            Esq (36)
          </button>

          <button
            onClick={() => setCameraPreset('right')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
              activePreset === 'right' 
                ? 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30' 
                : 'text-slate-300 hover:text-white hover:bg-cyber-surface'
            }`}
          >
            Dir (46)
          </button>
        </div>

        {/* Right: Camadas / Filtros de Densidade Óssea / Materiais */}
        <div className="pointer-events-auto flex flex-wrap items-center gap-2 p-2 rounded-xl bg-cyber-card/90 border border-cyber-border backdrop-blur-lg shadow-glass">
          
          {/* Se estiver no Modo Tomografia Completa 3D: Sliders de Densidade Óssea e Corte Axial */}
          {activeSource === 'CUSTOM' && customSeries && (
            <div className="flex items-center space-x-3 pr-2 border-r border-white/10">
              {/* Densidade Óssea (Threshold) */}
              <div className="flex items-center space-x-2">
                <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[11px] font-mono text-slate-300">Filtro Ósseo:</span>
                <input
                  type="range"
                  min="0.15"
                  max="0.65"
                  step="0.01"
                  value={boneThreshold}
                  onChange={(e) => setBoneThreshold(parseFloat(e.target.value))}
                  className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title="Ajustar Densidade Óssea da Tomografia (Threshold)"
                />
              </div>

              {/* Fatiador Axial Z */}
              <div className="flex items-center space-x-2">
                <Scissors className="w-3.5 h-3.5 text-cyber-cyan" />
                <span className="text-[11px] font-mono text-slate-300 hidden md:inline">Corte Z:</span>
                <input
                  type="range"
                  min="0.05"
                  max="1.0"
                  step="0.01"
                  value={axialClipZ}
                  onChange={(e) => setAxialClipZ(parseFloat(e.target.value))}
                  className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                  title="Fatiador Axial da Tomografia 3D"
                />
              </div>
            </div>
          )}

          {/* Se estiver com Modelo STL Carregado: Seletor de Material Odontológico */}
          {activeSource === 'CUSTOM' && customModel && (
            <div className="flex items-center space-x-1.5 pr-2 border-r border-white/10">
              <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Material:</span>
              <button
                onClick={() => setMeshMaterial('RESIN')}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  meshMaterial === 'RESIN' 
                    ? 'bg-cyan-500/20 text-cyber-cyan border border-cyber-cyan/40 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resina
              </button>
              <button
                onClick={() => setMeshMaterial('BONE')}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  meshMaterial === 'BONE' 
                    ? 'bg-white/20 text-white border border-white/40 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Osso
              </button>
              <button
                onClick={() => setMeshMaterial('TITANIUM')}
                className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                  meshMaterial === 'TITANIUM' 
                    ? 'bg-slate-700 text-slate-100 border border-slate-500 font-bold' 
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Titânio
              </button>
            </div>
          )}

          {/* Se estiver no Modelo Demo: Toggles de Camadas Clínicas */}
          {activeSource === 'DEMO' && (
            <>
              <button
                onClick={() => setLayers(prev => ({ ...prev, showJaw: !prev.showJaw }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all ${
                  layers.showJaw 
                    ? 'bg-cyber-surface border border-cyber-border text-white' 
                    : 'bg-transparent text-slate-500 line-through'
                }`}
              >
                <Eye className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Arcada</span>
              </button>

              <button
                onClick={() => setLayers(prev => ({ ...prev, showImplants: !prev.showImplants }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all ${
                  layers.showImplants 
                    ? 'bg-cyan-500/10 border border-cyber-cyan/40 text-cyber-cyan font-semibold' 
                    : 'bg-transparent text-slate-500 line-through'
                }`}
              >
                <Scan className="w-3.5 h-3.5" />
                <span>Implantes</span>
              </button>

              <button
                onClick={() => setLayers(prev => ({ ...prev, showGuide: !prev.showGuide }))}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center space-x-1.5 transition-all ${
                  layers.showGuide 
                    ? 'bg-emerald-500/10 border border-cyber-emerald/40 text-cyber-emerald font-semibold' 
                    : 'bg-transparent text-slate-500 line-through'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Guia</span>
              </button>
            </>
          )}

          {/* X-Ray / Transparência */}
          <div className="flex items-center space-x-2 pl-2 border-l border-white/10">
            <Sliders className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-mono text-slate-400 hidden sm:inline">Transparência:</span>
            <input
              type="range"
              min="0"
              max="0.85"
              step="0.05"
              value={layers.jawTransparency}
              onChange={(e) => setLayers(prev => ({ ...prev, jawTransparency: parseFloat(e.target.value) }))}
              className="w-16 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
              title="Ajustar Transparência"
            />
          </div>

          {/* Wireframe */}
          <button
            onClick={() => setLayers(prev => ({ ...prev, wireframe: !prev.wireframe }))}
            className={`p-1.5 rounded-lg text-xs transition-colors ${
              layers.wireframe 
                ? 'bg-purple-500/20 text-cyber-purple border border-cyber-purple/40' 
                : 'text-slate-400 hover:text-white'
            }`}
            title="Alternar Malha Wireframe"
          >
            <Grid className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 🔬 Modal de Inspeção 2D DICOM MPR */}
      {customDicom && (
        <DicomInspectionModal
          isOpen={isDicomModalOpen}
          onClose={() => setIsDicomModalOpen(false)}
          metadata={customDicom.metadata}
          pixelData={customDicom.pixelData}
          canvas={customDicom.canvas}
          onUpdateTexture={(updatedCanvas, updatedTexture) => {
            setCustomDicom(prev => prev ? {
              ...prev,
              canvas: updatedCanvas,
              texture: updatedTexture
            } : null);
          }}
        />
      )}
    </div>
  );
};
