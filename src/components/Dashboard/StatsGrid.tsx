import React from 'react';
import { DentalCase } from '../../types';
import { 
  FolderSync, 
  CheckCircle2, 
  TrendingUp, 
  Lock, 
  ShieldCheck, 
  Sparkles,
  Users,
  Clock,
  Layers
} from 'lucide-react';

interface StatsGridProps {
  cases: DentalCase[];
  isDentistView?: boolean;
  totalDentistsCount?: number;
}

export const StatsGrid: React.FC<StatsGridProps> = ({ 
  cases, 
  isDentistView = false,
  totalDentistsCount = 0 
}) => {
  const pendingPaymentCases = cases.filter(c => c.status === 'PENDING_APPROVAL');
  const paidCases = cases.filter(c => c.status === 'APPROVED_PAID' || c.status === 'IN_PRODUCTION' || c.status === 'COMPLETED');
  const inAnalysisCases = cases.filter(c => c.status === 'ANALYSIS');

  // Visão do CLIENTE (Dentista Parceiro): Foco puramente clínico e operacional. Sem valores de faturamento global!
  if (isDentistView) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Casos em Andamento */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Meus Pacientes Ativos</span>
            <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
              <FolderSync className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-slate-900">
              {cases.length} <span className="text-xs font-normal text-slate-400">caso(s)</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {inAnalysisCases.length} em análise pelo Dr. Ricardo
            </p>
          </div>
        </div>

        {/* Card 2: Aguardando Validação e Liberação */}
        <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700">Prontos p/ Sua Aprovação</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-amber-700">
              {pendingPaymentCases.length} <span className="text-xs font-normal text-slate-400">guia(s)</span>
            </div>
            <p className="text-xs text-amber-700/80 mt-1">
              Inspecione o planejamento e aprove para liberar o STL
            </p>
          </div>
        </div>

        {/* Card 3: Guias Aprovadas & Prontas */}
        <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700">Guias Liberadas</span>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
              {paidCases.length} <span className="text-xs font-normal text-slate-400">cirurgia(s)</span>
            </div>
            <p className="text-xs text-emerald-700/80 mt-1">
              Arquivos prontos para impressão 3D
            </p>
          </div>
        </div>

        {/* Card 4: Prazo Médio */}
        <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tempo de Resposta</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-bold text-blue-700">
              24 a 48h
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Planejamento digital ágil & suporte direto
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Visão do ADMINISTRADOR (Dr. Ricardo & Equipe): Métricas financeiras e de gestão da operação.
  const pendingRevenue = pendingPaymentCases.reduce((acc, curr) => acc + curr.payment.amount, 0);
  const paidRevenue = paidCases.reduce((acc, curr) => acc + curr.payment.amount, 0);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Card 1: Casos em Andamento */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Planejamentos Ativos</span>
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600 group-hover:scale-105 transition-transform">
            <FolderSync className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {cases.length} <span className="text-xs font-normal text-slate-400">casos</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {inAnalysisCases.length} em fase de desenho CAD
          </p>
        </div>
      </div>

      {/* Card 2: Aguardando Pagamento (Paywall Ativo) */}
      <div className="p-5 rounded-2xl bg-white border border-amber-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-amber-700">
            Aguardando PIX (Clientes)
          </span>
          <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-amber-700">
            {pendingPaymentCases.length} <span className="text-xs font-normal text-slate-400">caso(s)</span>
          </div>
          <p className="text-xs text-amber-700/80 mt-1 font-medium">
            R$ {pendingRevenue.toFixed(2)} a liquidar
          </p>
        </div>
      </div>

      {/* Card 3: Aprovados & Pagos (Faturamento Liquidado) */}
      <div className="p-5 rounded-2xl bg-white border border-emerald-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-emerald-700">
            Faturamento Liquidado
          </span>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-105 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-emerald-700">
            R$ {paidRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-emerald-700/80 mt-1 font-medium">
            {paidCases.length} projeto(s) faturados
          </p>
        </div>
      </div>

      {/* Card 4: Clientes / Dentistas Credenciados */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-500">Dentistas Clientes</span>
          <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900">
            {totalDentistsCount} <span className="text-xs font-normal text-slate-400">parceiros</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cobrança 100% automatizada via PIX
          </p>
        </div>
      </div>

    </div>
  );
};
