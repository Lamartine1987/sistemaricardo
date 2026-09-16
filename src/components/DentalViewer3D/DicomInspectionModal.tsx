import React, { useState } from 'react';
import { 
  X, 
  Sliders, 
  Maximize2, 
  Sparkles, 
  RotateCcw, 
  Info, 
  Layers,
  Activity
} from 'lucide-react';
import { 
  DicomMetadata, 
  renderDicomToCanvasTexture 
} from '../../services/loaders/dicomLoaderService';

interface DicomInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: DicomMetadata;
  pixelData: Int16Array | Uint16Array | Uint8Array;
  canvas: HTMLCanvasElement;
  onUpdateTexture: (newCanvas: HTMLCanvasElement, newTexture: any) => void;
}

export const DicomInspectionModal: React.FC<DicomInspectionModalProps> = ({
  isOpen,
  onClose,
  metadata,
  pixelData,
  canvas,
  onUpdateTexture
}) => {
  const [wl, setWl] = useState(metadata.windowCenter);
  const [ww, setWw] = useState(metadata.windowWidth);
  const [invert, setInvert] = useState(false);
  const [canvasDataUrl, setCanvasDataUrl] = useState<string>(() => canvas.toDataURL());

  if (!isOpen) return null;

  const applyWindowing = (newWl: number, newWw: number, newInvert: boolean) => {
    setWl(newWl);
    setWw(newWw);
    setInvert(newInvert);

    const { canvas: updatedCanvas, texture: updatedTexture } = renderDicomToCanvasTexture(
      pixelData,
      metadata.rows,
      metadata.columns,
      newWl,
      newWw,
      metadata.rescaleIntercept,
      metadata.rescaleSlope,
      newInvert
    );

    setCanvasDataUrl(updatedCanvas.toDataURL());
    onUpdateTexture(updatedCanvas, updatedTexture);
  };

  const applyPreset = (preset: 'BONE' | 'SOFT_TISSUE' | 'HIGH_CONTRAST') => {
    switch (preset) {
      case 'BONE':
        applyWindowing(500, 1800, invert);
        break;
      case 'SOFT_TISSUE':
        applyWindowing(50, 350, invert);
        break;
      case 'HIGH_CONTRAST':
        applyWindowing(300, 1000, invert);
        break;
    }
  };

  const resetWindowing = () => {
    applyWindowing(metadata.windowCenter, metadata.windowWidth, false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-surface/90">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-white tracking-wide">
                  Inspeção Tomográfica 2D (DICOM MPR)
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 font-bold uppercase">
                  {metadata.modality}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                {metadata.fileName} • Matriz {metadata.columns}×{metadata.rows} px
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Coluna 1 & 2: Imagem Tomográfica de Alta Definição */}
          <div className="md:col-span-2 flex flex-col items-center justify-center bg-black/60 rounded-xl border border-cyber-border p-4 relative">
            <img 
              src={canvasDataUrl} 
              alt="Corte Tomográfico DICOM" 
              className="max-h-[420px] object-contain rounded border border-slate-800 shadow-lg"
              style={{ imageRendering: 'pixelated' }}
            />

            {/* Overlay de Telemetria nos 4 Cantos do Corte */}
            <div className="absolute top-6 left-6 text-[11px] font-mono text-cyan-400/90 drop-shadow">
              WL: {Math.round(wl)} | WW: {Math.round(ww)} HU
            </div>
            <div className="absolute top-6 right-6 text-[11px] font-mono text-cyan-400/90 drop-shadow">
              {metadata.physicalWidthMm} × {metadata.physicalHeightMm} mm
            </div>
            <div className="absolute bottom-6 left-6 text-[11px] font-mono text-slate-400 drop-shadow">
              Voxel: {metadata.pixelSpacing[0]} mm
            </div>
            <div className="absolute bottom-6 right-6 text-[11px] font-mono text-slate-400 drop-shadow">
              Corte: {metadata.sliceThicknessMm} mm
            </div>
          </div>

          {/* Coluna 3: Controles de Contraste Radiográfico e Tags */}
          <div className="flex flex-col space-y-5">
            
            {/* Presets Rápidos */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Presets Radiográficos</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => applyPreset('BONE')}
                  className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs font-mono text-slate-200 hover:border-cyber-cyan/50 transition-colors"
                >
                  🦴 Osso / Dente
                </button>
                <button
                  onClick={() => applyPreset('SOFT_TISSUE')}
                  className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs font-mono text-slate-200 hover:border-cyber-cyan/50 transition-colors"
                >
                  🥩 Tecido Mole
                </button>
                <button
                  onClick={() => applyPreset('HIGH_CONTRAST')}
                  className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs font-mono text-slate-200 hover:border-cyber-cyan/50 transition-colors"
                >
                  ⚡ Alto Contraste
                </button>
                <button
                  onClick={resetWindowing}
                  className="px-2.5 py-1.5 rounded-lg bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-xs font-mono text-slate-400 hover:text-white transition-colors flex items-center justify-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Padrão</span>
                </button>
              </div>
            </div>

            {/* Sliders de Window Level / Window Width */}
            <div className="space-y-4 p-3.5 rounded-xl bg-cyber-surface/50 border border-cyber-border">
              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Nível (Window Level / Brilho):</span>
                  <span className="text-cyber-cyan font-bold">{Math.round(wl)} HU</span>
                </div>
                <input
                  type="range"
                  min="-500"
                  max="1500"
                  step="10"
                  value={wl}
                  onChange={(e) => applyWindowing(parseFloat(e.target.value), ww, invert)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-mono mb-1">
                  <span className="text-slate-400">Janela (Window Width / Contraste):</span>
                  <span className="text-cyber-cyan font-bold">{Math.round(ww)} HU</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="3500"
                  step="25"
                  value={ww}
                  onChange={(e) => applyWindowing(wl, parseFloat(e.target.value), invert)}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyber-cyan"
                />
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-white/5">
                <span className="text-xs font-mono text-slate-400">Inverter Negativo:</span>
                <button
                  onClick={() => applyWindowing(wl, ww, !invert)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono transition-colors ${
                    invert 
                      ? 'bg-cyber-cyan text-black font-bold' 
                      : 'bg-cyber-surface border border-cyber-border text-slate-300'
                  }`}
                >
                  {invert ? 'Ativado' : 'Desativado'}
                </button>
              </div>
            </div>

            {/* Metadados Clínicos DICOM */}
            <div className="space-y-2 p-3.5 rounded-xl bg-cyber-surface/30 border border-cyber-border text-xs font-mono">
              <span className="text-slate-400 flex items-center space-x-1.5 font-bold">
                <Info className="w-3.5 h-3.5 text-cyber-cyan" />
                <span>Metadados da Tomografia</span>
              </span>
              <div className="space-y-1 text-slate-300 text-[11px] pt-1">
                <div><span className="text-slate-500">Paciente:</span> {metadata.patientName}</div>
                <div><span className="text-slate-500">Equipamento:</span> {metadata.manufacturer}</div>
                <div><span className="text-slate-500">Data do Exame:</span> {metadata.studyDate}</div>
                <div><span className="text-slate-500">Dimensões:</span> {metadata.physicalWidthMm} × {metadata.physicalHeightMm} mm</div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
