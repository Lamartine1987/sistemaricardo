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
        return <Crown className="w-4 h-4 text-amber-400" />;
      case 'CAD_PLANNER':
        return <Layers className="w-4 h-4 text-cyber-cyan" />;
      case 'OPERATOR':
        return <Wrench className="w-4 h-4 text-purple-400" />;
    }
  };

  const getRoleBadge = (role: AdminUser['role']) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            ADMIN GERAL
          </span>
        );
      case 'CAD_PLANNER':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30">
            PROJETISTA CAD 3D
          </span>
        );
      case 'OPERATOR':
        return (
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-purple-500/15 text-purple-300 border border-purple-500/30">
            TÉCNICO OPERACIONAL
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-cyber-cyan" />
            <span>Equipe de Gestão e Planejadores Cadastrados</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">
            Usuários com permissão para gerenciar casos, subir arquivos STL e operar a plataforma
          </p>
        </div>

        <button
          onClick={onOpenNewAdminModal}
          className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5"
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
              className={`p-5 rounded-2xl glass-panel border transition-all flex flex-col justify-between ${
                isDrRicardo 
                  ? 'border-amber-500/40 bg-gradient-to-b from-amber-500/5 to-transparent' 
                  : 'border-cyber-border hover:border-cyber-cyan/40'
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="p-2 rounded-xl bg-cyber-surface border border-cyber-border">
                      {getRoleIcon(admin.role)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {admin.name}
                      </h4>
                      <span className="text-[11px] text-slate-400 block font-mono">
                        {admin.roleTitle}
                      </span>
                    </div>
                  </div>

                  {!isDrRicardo && (
                    <button
                      onClick={() => onRemoveAdmin(admin.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Remover acesso"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="mt-4 space-y-2 text-xs">
                  <div className="flex items-center space-x-2 text-slate-400">
                    <Mail className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span className="truncate">{admin.email}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-400 font-mono text-[11px]">
                    <Calendar className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Cadastrado em {new Date(admin.createdAt).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-cyber-border flex items-center justify-between">
                {getRoleBadge(admin.role)}
                <span className="text-[11px] font-mono text-emerald-400 flex items-center space-x-1">
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
