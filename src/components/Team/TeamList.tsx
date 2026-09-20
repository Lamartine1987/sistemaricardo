import React from 'react';
import { AdminUser } from '../../types';
import { 
  ShieldCheck, 
  UserPlus, 
  Mail, 
  Calendar, 
  Trash2, 
  Crown, 
  Layers, 
  Wrench,
  CheckCircle
} from 'lucide-react';

interface TeamListProps {
  admins: AdminUser[];
  onOpenNewAdminModal: () => void;
  onRemoveAdmin: (adminId: string) => void;
}

export const TeamList: React.FC<TeamListProps> = ({
  admins,
  onOpenNewAdminModal,
  onRemoveAdmin
}) => {
  const getRoleIcon = (role: AdminUser['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return <Crown className="w-4 h-4 text-amber-600" />;
      case 'CAD_PLANNER':
        return <Layers className="w-4 h-4 text-cyan-600" />;
      case 'OPERATOR':
        return <Wrench className="w-4 h-4 text-purple-600" />;
    }
  };

  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            ADMIN GERAL
          </span>
        );
      case 'CAD_PLANNER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
            PROJETISTA CAD 3D
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-sans font-semibold bg-purple-50 text-purple-800 border border-purple-200">
            TÉCNICO OPERACIONAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center space-x-2 font-sans">
            <ShieldCheck className="w-4 h-4 text-cyan-600" />
            <span>Equipe de Gestão e Planejadores Cadastrados</span>
          </h3>
          <p className="text-xs text-slate-500 font-sans">
            Usuários com permissão para gerenciar casos, subir arquivos STL e operar a plataforma
          </p>
        </div>

        <button
          onClick={onOpenNewAdminModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center space-x-1.5 font-sans"
        >
          <UserPlus className="w-4 h-4" />
          <span>Adicionar Novo Administrador</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {admins.map(admin => {
          const isDrRicardo = admin.id === 'admin-01';

          return (
            <div
              key={admin.id}
              className={`p-5 rounded-2xl bg-white border transition-all flex flex-col justify-between shadow-xs ${
                isDrRicardo 
                  ? 'border-amber-200 bg-amber-50/20' 
                  : 'border-slate-200/90 hover:border-cyan-400 hover:shadow-md'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      {getRoleIcon(admin.role)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 font-sans">
                        {admin.name}
                      </h4>
                      <span className="text-[11px] text-slate-500 block font-sans">
                        {admin.roleTitle}
                      </span>
                    </div>
                  </div>

                  {!isDrRicardo && (
                    <button
                      onClick={() => onRemoveAdmin(admin.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remover acesso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs text-slate-600 font-sans">
                  <div className="flex items-center space-x-2 text-slate-600">
                    <Mail className="w-3.5 h-3.5 text-cyan-600" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500 font-sans text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Cadastrado em {new Date(admin.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                {getRoleBadge(admin.role)}
                <span className="text-[11px] font-sans font-semibold text-emerald-700 flex items-center space-x-1">
                  <CheckCircle className="w-3 h-3" />
                  <span>Acesso Ativo</span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
