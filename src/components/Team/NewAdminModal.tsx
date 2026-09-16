import React, { useState } from 'react';
import { AdminUser, AdminRole } from '../../types';
import { 
  X, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  User, 
  Briefcase
} from 'lucide-react';

interface NewAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAdmin: (newAdmin: AdminUser) => void;
}

export const NewAdminModal: React.FC<NewAdminModalProps> = ({
  isOpen,
  onClose,
  onAddAdmin
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AdminRole>('CAD_PLANNER');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    const roleTitleMap: Record<AdminRole, string> = {
      SUPER_ADMIN: 'Administrador Geral da Plataforma',
      CAD_PLANNER: 'Planejador CAD 3D / Projetista',
      OPERATOR: 'Operador de Impressão 3D & Logística'
    };

    const newAdmin: AdminUser = {
      id: `admin-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      role,
      roleTitle: roleTitleMap[role],
      active: true,
      createdAt: new Date().toISOString()
    };

    onAddAdmin(newAdmin);
    setName('');
    setEmail('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-surface/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Cadastrar Novo Administrador
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Conceder acesso de gestão à equipe do Dr. Ricardo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Nome Completo do Colaborador *
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="Ex: Carlos Eduardo Silveira"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              E-mail de Acesso Corporativo *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="Ex: carlos@implantprecision.com.br"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-mono text-slate-300 block mb-1">
              Nível de Acesso / Função na Equipe *
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={e => setRole(e.target.value as AdminRole)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
              >
                <option value="CAD_PLANNER">Projetista CAD 3D (Elabora planejamentos)</option>
                <option value="OPERATOR">Operador CAM / Impressão 3D (Despacho e produção)</option>
                <option value="SUPER_ADMIN">Administrador Geral (Acesso financeiro total)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyber-cyan/5 border border-cyber-cyan/20 text-xs text-slate-300">
            <span className="font-semibold text-cyber-cyan block mb-0.5">Permissões de Administrador:</span>
            Poderá analisar escaneamentos orais, subir arquivos de guias cirúrgicos STL e gerenciar o fluxo dos dentistas parceiros.
          </div>

          <div className="pt-3 border-t border-cyber-border flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-cyber-surface border border-cyber-border text-slate-300 hover:text-white text-xs font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan"
            >
              Cadastrar Administrador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
