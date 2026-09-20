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

  const filteredCases = cases
    .filter(c => {
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
        (statusFilter === 'ANALYSIS' && (c.status === 'ANALYSIS' || c.status === 'PLANNING'));

      return matchesSearch && matchesDentist && matchesStatus;
    })
    .sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
        return timeB - timeA;
      }
      return (b.id || '').localeCompare(a.id || '');
    });

  const getStatusBadge = (status: DentalCase['status'], amount: number) => {
    switch (status) {
      case 'PLANNING':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-cyan-600" />
            <span>Em Planejamento 3D</span>
          </span>
        );
      case 'PENDING_APPROVAL':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-amber-600" />
            <span>Aprovação Pendente (PIX R$ {amount.toFixed(2)})</span>
          </span>
        );
      case 'APPROVED_PAID':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-xs">
            <Unlock className="w-3.5 h-3.5 text-emerald-600" />
            <span>Aprovado & STL Liberado</span>
          </span>
        );
      case 'IN_PRODUCTION':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-purple-50 text-purple-800 border border-purple-200/80 shadow-xs">
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            <span>Guia em Impressão 3D</span>
          </span>
        );
      case 'ANALYSIS':
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-blue-50 text-blue-800 border border-blue-200/80 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>Em Análise Clínica</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-sans font-semibold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs">
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
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 shadow-xs transition-colors"
          />
        </div>

        {/* Filtros de Status */}
        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'ALL'
                ? 'bg-white border border-slate-200 text-cyan-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            Todos ({cases.length})
          </button>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'PENDING'
                ? 'bg-amber-100/80 border border-amber-300 text-amber-800 shadow-xs'
                : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'
            }`}
          >
            Aguardando Aprovação
          </button>
          <button
            onClick={() => setStatusFilter('PAID')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === 'PAID'
                ? 'bg-emerald-100/80 border border-emerald-300 text-emerald-800 shadow-xs'
                : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'
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
              className="w-full sm:w-auto px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-cyan-500 shadow-xs cursor-pointer font-sans"
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
          <div className="p-12 text-center rounded-2xl bg-white border border-slate-200 shadow-xs">
            <Clock className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-800">Nenhum planejamento localizado</p>
            <p className="text-xs text-slate-500 mt-1 font-sans">
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
                className={`p-4 rounded-2xl bg-white border transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group shadow-xs ${
                  isPending 
                    ? 'border-amber-300/80 hover:border-amber-500 hover:shadow-md' 
                    : 'border-slate-200/90 hover:border-cyan-400 hover:shadow-md'
                }`}
              >
                {/* Paciente & Código */}
                <div className="flex items-center space-x-3.5 min-w-0">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    isPending
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-cyan-50 text-cyan-700 border border-cyan-200'
                  }`}>
                    {caseItem.patientIdentifier || caseItem.patientName.slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors truncate font-sans">
                        {caseItem.patientName}
                      </h4>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600 font-medium">
                        {caseItem.caseCode}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 text-xs text-slate-500 font-sans mt-0.5">
                      {!isDentistView && (
                        <>
                          <span className="font-medium text-slate-700">{caseItem.dentistName}</span>
                          <span>•</span>
                        </>
                      )}
                      <span>{caseItem.surgicalGuideType.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>

                {/* Sítios dos Implantes */}
                <div className="hidden lg:flex items-center space-x-1.5">
                  <span className="text-xs text-slate-500 font-medium">Dentes:</span>
                  {caseItem.implantSites.map(s => (
                    <span
                      key={s.toothNumber}
                      className="px-2 py-0.5 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-700 font-sans text-xs font-semibold"
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
                      className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                      title={isDentistView ? "Excluir solicitação (antes de o Dr. Ricardo aceitar)" : "Excluir caso"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    className="p-2 rounded-xl bg-slate-50 border border-slate-200 group-hover:border-cyan-300 text-slate-400 group-hover:text-cyan-700 transition-colors cursor-pointer"
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
