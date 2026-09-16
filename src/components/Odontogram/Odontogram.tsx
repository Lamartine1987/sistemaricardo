import React from 'react';

interface OdontogramProps {
  selectedTeeth: number[];
  onToggleTooth?: (toothNumber: number) => void;
  readOnly?: boolean;
}

export const Odontogram: React.FC<OdontogramProps> = ({
  selectedTeeth,
  onToggleTooth,
  readOnly = false
}) => {
  // Quadrantes FDI
  // Superior Direito (18 a 11) | Superior Esquerdo (21 a 28)
  const upperRight = [18, 17, 16, 15, 14, 13, 12, 11];
  const upperLeft = [21, 22, 23, 24, 25, 26, 27, 28];
  
  // Inferior Direito (48 a 41) | Inferior Esquerdo (31 a 38)
  const lowerRight = [48, 47, 46, 45, 44, 43, 42, 41];
  const lowerLeft = [31, 32, 33, 34, 35, 36, 37, 38];

  const renderTooth = (num: number) => {
    const isSelected = selectedTeeth.includes(num);

    return (
      <button
        key={num}
        type="button"
        disabled={readOnly}
        onClick={() => onToggleTooth && onToggleTooth(num)}
        className={`w-8 h-9 rounded flex flex-col items-center justify-center transition-all font-mono text-[11px] ${
          isSelected
            ? 'bg-cyber-cyan text-black font-bold shadow-glow-cyan scale-105 border border-cyan-300'
            : 'bg-cyber-surface border border-cyber-border text-slate-400 hover:text-white hover:border-slate-500'
        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span>{num}</span>
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-black' : 'bg-transparent'}`} />
      </button>
    );
  };

  return (
    <div className="p-4 rounded-xl bg-cyber-card/60 border border-cyber-border">
      <div className="flex items-center justify-between mb-3 text-xs font-mono text-slate-400">
        <span>Odontograma FDI (Sítios de Implante)</span>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cyber-cyan inline-block"></span>
            <span className="text-slate-300">Implante Selecionado</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cyber-surface border border-cyber-border inline-block"></span>
            <span className="text-slate-400">Dente Hígido</span>
          </span>
        </div>
      </div>

      {/* Arcada Superior */}
      <div className="mb-2">
        <div className="text-[10px] text-center text-slate-400 font-mono mb-1 uppercase tracking-wider">
          Arcada Superior (Maxila)
        </div>
        <div className="flex items-center justify-center gap-1">
          {/* Quadrante 1 */}
          <div className="flex gap-1 pr-2 border-r border-cyber-border">
            {upperRight.map(renderTooth)}
          </div>
          {/* Quadrante 2 */}
          <div className="flex gap-1 pl-2">
            {upperLeft.map(renderTooth)}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-cyber-border my-2 w-full" />

      {/* Arcada Inferior */}
      <div>
        <div className="flex items-center justify-center gap-1">
          {/* Quadrante 4 */}
          <div className="flex gap-1 pr-2 border-r border-cyber-border">
            {lowerRight.map(renderTooth)}
          </div>
          {/* Quadrante 3 */}
          <div className="flex gap-1 pl-2">
            {lowerLeft.map(renderTooth)}
          </div>
        </div>
        <div className="text-[10px] text-center text-slate-400 font-mono mt-1 uppercase tracking-wider">
          Arcada Inferior (Mandíbula)
        </div>
      </div>
    </div>
  );
};
