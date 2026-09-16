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
        <div className="p-5 rounded-2xl glass-panel border border-cyber-border hover:border-cyber-cyan/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Meus Pacientes Ativos</span>
            <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan">
              <FolderSync className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-white">
              {cases.length} <span className="text-xs font-normal text-slate-400">caso(s)</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              {inAnalysisCases.length} em análise pelo Dr. Ricardo
            </p>
          </div>
        </div>

        {/* Card 2: Aguardando Validação e Liberação */}
        <div className="p-5 rounded-2xl glass-panel-glow border border-amber-500/30 hover:border-amber-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-amber-400 font-semibold">Prontos p/ Sua Aprovação</span>
            <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-amber-300">
              {pendingPaymentCases.length} <span className="text-xs font-normal text-slate-400">guia(s)</span>
            </div>
            <p className="text-[11px] text-amber-400/80 mt-1">
              Inspecione em 3D e aprove para liberar o STL
            </p>
          </div>
        </div>

        {/* Card 3: Guias Aprovadas & Prontas */}
        <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 hover:border-emerald-500/60 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-emerald-400 font-semibold">Guias Liberadas</span>
            <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-emerald-300">
              {paidCases.length} <span className="text-xs font-normal text-slate-400">cirurgia(s)</span>
            </div>
            <p className="text-[11px] text-emerald-400/80 mt-1">
              Arquivos disponíveis para impressão 3D
            </p>
          </div>
        </div>

        {/* Card 4: Prazo Médio */}
        <div className="p-5 rounded-2xl glass-panel border border-cyber-border hover:border-purple-500/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Tempo de Resposta</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-bold font-mono text-purple-300">
              24 a 48h
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
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
      <div className="p-5 rounded-2xl glass-panel border border-cyber-border hover:border-cyber-cyan/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">Planejamentos Ativos</span>
          <div className="p-2 rounded-xl bg-cyber-cyan/10 text-cyber-cyan group-hover:scale-110 transition-transform">
            <FolderSync className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-white">
            {cases.length} <span className="text-xs font-normal text-slate-400">casos</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {inAnalysisCases.length} em fase de desenho CAD
          </p>
        </div>
      </div>

      {/* Card 2: Aguardando Pagamento (Paywall Ativo) */}
      <div className="p-5 rounded-2xl glass-panel-glow border border-amber-500/30 hover:border-amber-500/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-amber-400 font-semibold">
            Aguardando PIX (Clientes)
          </span>
          <div className="p-2 rounded-xl bg-amber-500/15 text-amber-400 group-hover:scale-110 transition-transform">
            <Lock className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-amber-300">
            {pendingPaymentCases.length} <span className="text-xs font-normal text-slate-400">caso(s)</span>
          </div>
          <p className="text-[11px] text-amber-400/80 mt-1 font-mono">
            R$ {pendingRevenue.toFixed(2)} a liquidar
          </p>
        </div>
      </div>

      {/* Card 3: Aprovados & Pagos (Faturamento Liquidado) */}
      <div className="p-5 rounded-2xl glass-panel border border-emerald-500/30 hover:border-emerald-500/60 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            Faturamento Liquidado
          </span>
          <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-emerald-300">
            R$ {paidRevenue.toFixed(2)}
          </div>
          <p className="text-[11px] text-emerald-400/80 mt-1 font-mono">
            {paidCases.length} projeto(s) faturados
          </p>
        </div>
      </div>

      {/* Card 4: Clientes / Dentistas Credenciados */}
      <div className="p-5 rounded-2xl glass-panel border border-cyber-border hover:border-purple-500/40 transition-all group">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">Dentistas Clientes</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
            <Users className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="text-2xl font-bold font-mono text-purple-300">
            {totalDentistsCount} <span className="text-xs font-normal text-slate-400">parceiros</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Cobrança 100% automatizada via PIX
          </p>
        </div>
      </div>

    </div>
  );
};
