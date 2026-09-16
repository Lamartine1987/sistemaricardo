import React from 'react';
import { Dentist } from '../../types';
import { 
  Users, 
  Phone, 
  Mail, 
  Building2, 
  ExternalLink, 
  TrendingUp, 
  ArrowUpRight,
  MessageSquare
} from 'lucide-react';

interface DentistsDirectoryProps {
  dentists: Dentist[];
  onSelectDentist: (dentistId: string) => void;
}

export const DentistsDirectory: React.FC<DentistsDirectoryProps> = ({
  dentists,
  onSelectDentist
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
            <Users className="w-4 h-4 text-cyber-cyan" />
            <span>Dentistas Parceiros Credenciados</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Histórico cirúrgico e faturamento consolidado por profissional
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {dentists.map(dentist => {
          // Formatar telefone para link do WhatsApp
          const cleanPhone = dentist.phone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${cleanPhone}?text=Ol%C3%A1%20${encodeURIComponent(dentist.name)},%20tudo%20bem?%20Aqui%20%C3%A9%20o%20Dr.%20Ricardo%20da%20Implant%20Precision.`;

          return (
            <div
              key={dentist.id}
              className="p-5 rounded-2xl glass-panel border border-cyber-border hover:border-cyber-cyan/50 transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-cyber-cyan transition-colors">
                      {dentist.name}
                    </h4>
                    <span className="text-xs font-mono text-cyber-cyan block mt-0.5">
                      {dentist.cro}
                    </span>
                  </div>
                  
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-black transition-colors"
                    title="Enviar WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                {/* Detalhes da Clínica */}
                <div className="mt-4 space-y-2 text-xs text-slate-300">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Building2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{dentist.clinicName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Phone className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{dentist.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className="truncate">{dentist.email}</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mt-5 pt-4 border-t border-cyber-border/80 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Casos Realizados</span>
                  <span className="text-sm font-bold font-mono text-white">{dentist.casesCount} projetos</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase">Total Faturado</span>
                  <span className="text-sm font-bold font-mono text-cyber-emerald">R$ {dentist.totalSpent.toFixed(2)}</span>
                </div>
              </div>

              {/* Botão Ver Casos */}
              <button
                onClick={() => onSelectDentist(dentist.id)}
                className="mt-4 w-full py-2 rounded-xl bg-cyber-surface border border-cyber-border text-xs font-medium text-slate-300 hover:text-white hover:border-cyber-cyan/40 transition-colors flex items-center justify-center space-x-1.5"
              >
                <span>Filtrar Casos Deste Colega</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyber-cyan" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
