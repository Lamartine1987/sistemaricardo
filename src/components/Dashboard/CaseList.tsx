import React, { useState } from 'react';
import { DentalCase, Dentist } from '../../types';
import { 
  Search, 
  Lock, 
  Unlock, 
  ChevronRight, 
  Clock, 
  Layers,
  Trash2
} from 'lucide-react';

interface CaseListProps {
  cases: DentalCase[];
  dentists: Dentist[];
  onSelectCase: (caseItem: DentalCase) => void;
  selectedDentistFilter: string;
  onFilterDentistChange: (dentistId: string) => void;
  isDentistView?: boolean;
  onDeleteCase?: (caseId: string) => void;
}

export const CaseList: React.FC<CaseListProps> = ({
  cases,
  dentists,
  onSelectCase,
  selectedDentistFilter,
  onFilterDentistChange,
  isDentistView = false,
  onDeleteCase
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredCases = cases.filter(c => {
    const matchesSearch = 
      c.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.caseCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (!isDentistView && c.dentistName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDentist = 
      isDentistView || selectedDentistFilter === 'ALL' || c.dentistId === selectedDentistFilter;

    const matchesStatus = 
      statusFilter === 'ALL' ||
      (statusFilter === 'PENDING' && c.status === 'PENDING_APPROVAL') ||
      (statusFilter === 'PAID' && (c.status === 'APPROVED_PAID' || c.status === 'IN_PRODUCTION' || c.status === 'COMPLETED')) ||
      (statusFilter === 'ANALYSIS' && c.status === 'ANALYSIS');

    return matchesSearch && matchesDentist && matchesStatus;
  });

  const getStatusBadge = (status: DentalCase['status'], amount: number) => {
    switch (status) {
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30 animate-pulse-subtle">
            <Lock className="w-3 h-3" />
            <span>Aprovação Pendente (PIX R$ {amount.toFixed(2)})</span>
          </span>
        );
      case 'APPROVED_PAID':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <Unlock className="w-3 h-3" />
            <span>Aprovado & STL Liberado</span>
          </span>
        );
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-purple-500/15 text-purple-300 border border-purple-500/30">
            <Layers className="w-3 h-3" />
            <span>Guia em Impressão 3D</span>
          </span>
        );
      case 'ANALYSIS':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <Clock className="w-3 h-3" />
            <span>Em Análise CAD</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <span>Concluído</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={isDentistView ? "Buscar paciente ou código..." : "Buscar por paciente, código ou dentista..."}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-cyber-card border border-cyber-border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-cyber-cyan transition-colors"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'ALL'
                ? 'bg-cyber-surface border border-cyber-cyan/40 text-cyber-cyan'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Todos ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'PENDING'
                ? 'bg-amber-500/20 border border-amber-500/40 text-amber-300'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            Aguardando Aprovação
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'PAID'
                ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-300'
                : 'text-slate-400 hover:text-emerald-300'
            }`}
          >
            Liberados / Concluídos
          </button>
        </div>

        {/* Filtro por Dentista (Exibido APENAS para Administrador) */}
        {!isDentistView && (
          <div className="w-full sm:w-auto">
            <select
              value={selectedDentistFilter}
              onChange={e => onFilterDentistChange(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-xs bg-cyber-card border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
            >
              <option value="ALL">Todos os Clientes / Clínicas</option>
              {dentists.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.casesCount} casos)
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Lista de Casos */}
      <div className="space-y-2.5">
        {filteredCases.length === 0 ? (
          <div className="p-12 text-center rounded-2xl glass-panel border border-cyber-border">
            <Clock className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-300">Nenhum planejamento localizado</p>
            <p className="text-xs text-slate-500 mt-1">
              {isDentistView 
                ? "Envie um novo escaneamento para o Dr. Ricardo planejar sua cirurgia." 
                : "Ajuste os filtros para encontrar os registros desejados."}
            </p>
          </div>
        ) : (
          filteredCases.map(caseItem => {
            const isPending = caseItem.status === 'PENDING_APPROVAL';

            return (
              <div
                key={caseItem.id}
                onClick={() => onSelectCase(caseItem)}
                className={`p-4 rounded-2xl glass-panel border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group ${
                  isPending 
                    ? 'border-amber-500/30 hover:border-amber-500/70 hover:shadow-lg' 
                    : 'border-cyber-border hover:border-cyber-cyan/40'
                }`}
              >
                {/* Paciente & Código */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isPending
                      ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                      : 'bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30'
                  }`}>
                    {caseItem.patientIdentifier || caseItem.patientName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors truncate">
                        {caseItem.patientName}
                      </h4>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-surface border border-cyber-border text-slate-400">
                        {caseItem.caseCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-400 font-mono mt-0.5">
                      {!isDentistView && (
                        <>
                          <span>{caseItem.dentistName}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{caseItem.surgicalGuideType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Sítios dos Implantes */}
                <div className="hidden lg:flex items-center space-x-1.5">
                  <span className="text-xs text-slate-500 font-mono">Dentes:</span>
                  {caseItem.implantSites.map(s => (
                    <span
                      key={s.toothNumber}
                      className="px-2 py-0.5 rounded bg-cyber-surface border border-cyber-border text-cyber-cyan font-mono text-xs font-semibold"
                    >
                      {s.toothNumber}
                    </span>
                  ))}
                </div>

                {/* Status & Valor */}
                <div className="flex items-center space-x-2.5 w-full md:w-auto justify-between md:justify-end">
                  {getStatusBadge(caseItem.status, caseItem.payment.amount)}

                  {/* Excluir: apenas se for caso não aceito (status ANALYSIS) para dentista, ou admin */}
                  {onDeleteCase && ((isDentistView && caseItem.status === 'ANALYSIS') || !isDentistView) && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCase(caseItem.id);
                      }}
                      className="p-2 rounded-xl bg-cyber-surface hover:bg-red-500/20 border border-cyber-border hover:border-red-500/40 text-slate-400 hover:text-red-400 transition-colors"
                      title={isDentistView ? "Excluir solicitação (antes de o Dr. Ricardo aceitar)" : "Excluir caso"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    className="p-2 rounded-xl bg-cyber-surface border border-cyber-border group-hover:border-cyber-cyan/40 text-slate-400 group-hover:text-cyber-cyan transition-colors"
                    title="Abrir Caso"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
