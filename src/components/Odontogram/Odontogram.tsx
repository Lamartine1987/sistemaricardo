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
        className={`w-8 h-9 rounded-lg flex flex-col items-center justify-center transition-all font-sans text-[11px] font-semibold ${
          isSelected
            ? 'bg-cyan-600 text-white font-bold shadow-sm scale-105 border border-cyan-700'
            : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 hover:bg-slate-100/70'
        } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
      >
        <span>{num}</span>
        <div className={`w-1.5 h-1.5 rounded-full mt-0.5 ${isSelected ? 'bg-white' : 'bg-transparent'}`} />
      </button>
    );
  };

  return (
    <div className="p-4 rounded-xl bg-slate-50/80 border border-slate-200">
      <div className="flex items-center justify-between mb-3 text-xs font-sans text-slate-500 font-medium">
        <span>Odontograma FDI (Sítios de Implante)</span>
        <div className="flex items-center space-x-3 text-[11px]">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-cyan-600 inline-block"></span>
            <span className="text-slate-700">Implante Selecionado</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded bg-white border border-slate-300 inline-block"></span>
            <span className="text-slate-500">Dente Hígido</span>
          </span>
        </div>
      </div>

      {/* Arcada Superior */}
      <div className="mb-2">
        <div className="text-[10px] text-center text-slate-400 font-sans mb-1 uppercase tracking-wider font-semibold">
          Arcada Superior (Maxila)
        </div>
        <div className="flex items-center justify-center gap-1">
          {/* Quadrante 1 */}
          <div className="flex gap-1 pr-2 border-r border-slate-200">
            {upperRight.map(renderTooth)}
          </div>
          {/* Quadrante 2 */}
          <div className="flex gap-1 pl-2">
            {upperLeft.map(renderTooth)}
          </div>
        </div>
      </div>

      <div className="h-[1px] bg-slate-200 my-2 w-full" />

      {/* Arcada Inferior */}
      <div>
        <div className="flex items-center justify-center gap-1">
          {/* Quadrante 4 */}
          <div className="flex gap-1 pr-2 border-r border-slate-200">
            {lowerRight.map(renderTooth)}
          </div>
          {/* Quadrante 3 */}
          <div className="flex gap-1 pl-2">
            {lowerLeft.map(renderTooth)}
          </div>
        </div>
        <div className="text-[10px] text-center text-slate-400 font-sans mt-1 uppercase tracking-wider font-semibold">
          Arcada Inferior (Mandíbula)
        </div>
      </div>
    </div>
  );
};
