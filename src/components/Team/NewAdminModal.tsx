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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                Cadastrar Novo Administrador
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Conceder acesso de gestão à equipe do Dr. Ricardo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
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
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
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
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
              Nível de Acesso / Função na Equipe *
            </label>
            <div className="relative">
              <Briefcase className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <select
                value={role}
                onChange={e => setRole(e.target.value as AdminRole)}
                className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white transition-all font-sans"
              >
                <option value="CAD_PLANNER">Projetista CAD 3D (Elabora planejamentos)</option>
                <option value="OPERATOR">Operador CAM / Impressão 3D (Despacho e produção)</option>
                <option value="SUPER_ADMIN">Administrador Geral (Acesso financeiro total)</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-cyan-50 border border-cyan-100 text-xs text-cyan-900 font-sans">
            <span className="font-semibold text-cyan-800 block mb-0.5">Permissões de Administrador:</span>
            Poderá analisar escaneamentos orais, subir arquivos de guias cirúrgicos STL e gerenciar o fluxo dos dentistas parceiros.
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 hover:text-slate-900 hover:bg-slate-200 text-xs font-semibold transition-colors font-sans"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs transition-all shadow-sm font-sans"
            >
              Cadastrar Administrador
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
