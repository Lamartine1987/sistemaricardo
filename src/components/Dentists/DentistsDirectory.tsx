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
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-sans">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>Dentistas Parceiros Credenciados</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans">
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
              className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-cyan-400 hover:shadow-md transition-all flex flex-col justify-between group shadow-xs"
            >
              <div>
                {/* Header Card */}
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 group-hover:text-cyan-700 transition-colors font-sans">
                      {dentist.name}
                    </h4>
                    <span className="text-xs font-sans text-cyan-700 font-medium block mt-0.5">
                      {dentist.cro}
                    </span>
                  </div>
                  
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 transition-colors border border-emerald-200"
                    title="Enviar WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                {/* Detalhes da Clínica */}
                <div className="mt-4 space-y-2 text-xs text-slate-600 font-sans">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{dentist.clinicName}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Phone className="w-3.5 h-3.5 text-cyan-600" />
                    <span>{dentist.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="truncate">{dentist.email}</span>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-sans text-slate-400 block uppercase tracking-wider font-semibold">Casos Realizados</span>
                  <span className="text-sm font-bold font-sans text-slate-800">{dentist.casesCount} projetos</span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-sans text-slate-400 block uppercase tracking-wider font-semibold">Total Faturado</span>
                  <span className="text-sm font-bold font-sans text-emerald-700">R$ {dentist.totalSpent.toFixed(2)}</span>
                </div>
              </div>

              {/* Botão Ver Casos */}
              <button
                onClick={() => onSelectDentist(dentist.id)}
                className="mt-4 w-full py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:border-slate-300 transition-colors flex items-center justify-center space-x-1.5 font-sans"
              >
                <span>Filtrar Casos Deste Colega</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-cyan-600" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
