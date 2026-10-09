import React, { useState, useMemo } from 'react';
import { AdminUser, Dentist, AdminRole } from '../../types';
import { 
  Crown, 
  ShieldCheck, 
  ShieldAlert, 
  UserCheck, 
  UserX, 
  UserPlus, 
  Search, 
  Mail, 
  Check, 
  X, 
  Layers, 
  Wrench, 
  Users, 
  Lock,
  Sparkles,
  AlertTriangle
} from 'lucide-react';

export const ROOT_SUPERADMIN_EMAIL = 'lamartinecezar3@gmail.com';

interface AccessControlManagerProps {
  currentUserEmail?: string | null;
  admins: AdminUser[];
  dentists: Dentist[];
  onPromoteToAdmin: (email: string, name: string, role: AdminRole, roleTitle?: string) => void;
  onRevokeAdmin: (adminId: string, email: string) => void;
  onUpdateAdminRole: (adminId: string, role: AdminRole, roleTitle?: string) => void;
  onNotifyFeedback?: (title: string, message: string) => void;
}

export const AccessControlManager: React.FC<AccessControlManagerProps> = ({
  currentUserEmail,
  admins,
  dentists,
  onPromoteToAdmin,
  onRevokeAdmin,
  onUpdateAdminRole,
  onNotifyFeedback
}) => {
  const isAuthorized = currentUserEmail?.toLowerCase().trim() === ROOT_SUPERADMIN_EMAIL;

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'ADMINS' | 'DENTISTS'>('ALL');

  // Estado do formulário de novo administrador manual
  const [newEmail, setNewEmail] = useState('');
  const [newName, setNewName] = useState('');
  const [newRole, setNewRole] = useState<AdminRole>('SUPER_ADMIN');
  const [isAddingNew, setIsAddingNew] = useState(false);

  // Unificar todos os usuários da plataforma (Admins + Dentistas)
  const unifiedUsers = useMemo(() => {
    const adminEmailMap = new Map<string, AdminUser>();
    admins.forEach(a => {
      if (a.email) adminEmailMap.set(a.email.toLowerCase().trim(), a);
    });

    const list: Array<{
      id: string;
      email: string;
      name: string;
      isAdmin: boolean;
      adminData?: AdminUser;
      dentistData?: Dentist;
      isRootAdmin: boolean;
    }> = [];

    // 1. Adicionar todos os administradores
    admins.forEach(a => {
      const emailLower = (a.email || '').toLowerCase().trim();
      const matchingDentist = dentists.find(d => d.email.toLowerCase().trim() === emailLower);
      list.push({
        id: a.id,
        email: a.email,
        name: a.name,
        isAdmin: true,
        adminData: a,
        dentistData: matchingDentist,
        isRootAdmin: emailLower === ROOT_SUPERADMIN_EMAIL
      });
    });

    // 2. Adicionar dentistas que ainda NÃO são administradores
    dentists.forEach(d => {
      const emailLower = (d.email || '').toLowerCase().trim();
      if (!adminEmailMap.has(emailLower)) {
        list.push({
          id: d.id,
          email: d.email,
          name: d.name,
          isAdmin: false,
          dentistData: d,
          isRootAdmin: false
        });
      }
    });

    return list;
  }, [admins, dentists]);

  // Filtragem por busca e categoria
  const filteredUsers = useMemo(() => {
    return unifiedUsers.filter(u => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || 
        u.name.toLowerCase().includes(q) || 
        u.email.toLowerCase().includes(q) ||
        (u.dentistData?.cro && u.dentistData.cro.toLowerCase().includes(q)) ||
        (u.dentistData?.clinicName && u.dentistData.clinicName.toLowerCase().includes(q));

      const matchesFilter = 
        filterType === 'ALL' ||
        (filterType === 'ADMINS' && u.isAdmin) ||
        (filterType === 'DENTISTS' && !u.isAdmin);

      return matchesSearch && matchesFilter;
    });
  }, [unifiedUsers, searchQuery, filterType]);

  // Se o usuário não for Lamartine Cezar, bloqueia totalmente a tela
  if (!isAuthorized) {
    return (
      <div className="p-8 bg-white rounded-3xl border border-rose-200 shadow-sm text-center space-y-4 max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600">
          <ShieldAlert className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900">Acesso Restrito a Superadministrador</h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Esta área de concessão e revogação de administradores é exclusiva para o e-mail raiz do sistema (<strong>{ROOT_SUPERADMIN_EMAIL}</strong>).
        </p>
      </div>
    );
  }

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || !newName.trim()) {
      alert('Por favor, informe o e-mail e o nome completo.');
      return;
    }

    const roleTitles: Record<AdminRole, string> = {
      SUPER_ADMIN: 'Administrador Geral',
      CAD_PLANNER: 'Planejador CAD 3D / Projetista',
      OPERATOR: 'Operador Técnico & Produção'
    };

    onPromoteToAdmin(newEmail.trim(), newName.trim(), newRole, roleTitles[newRole]);
    if (onNotifyFeedback) {
      onNotifyFeedback(
        'Administrador Cadastrado!',
        `${newName} (${newEmail}) agora possui permissão de administrador na plataforma.`
      );
    }
    setNewEmail('');
    setNewName('');
    setIsAddingNew(false);
  };

  const roleTitles: Record<AdminRole, string> = {
    SUPER_ADMIN: 'Administrador Geral',
    CAD_PLANNER: 'Planejador CAD 3D',
    OPERATOR: 'Operador Técnico'
  };

  return (
    <div className="space-y-6 animate-fade-in font-sans">
      
      {/* 👑 Banner de Controle Super Admin */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-slate-50 border border-amber-300 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-100 border border-amber-300 text-amber-900 text-xs font-mono font-bold">
            <Crown className="w-4 h-4 text-amber-700" />
            <span>PAINEL EXCLUSIVO • SUPERADMIN RAIZ</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Gestão de Permissões & Administradores
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
            Área visível unicamente para <strong>{ROOT_SUPERADMIN_EMAIL}</strong>. Marque qualquer dentista ou usuário como Administrador para conceder acesso total ao painel clínico, financeiro e arquivos 3D.
          </p>
        </div>

        <button
          onClick={() => setIsAddingNew(!isAddingNew)}
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-all shadow-sm hover:shadow flex items-center space-x-2 flex-shrink-0 cursor-pointer"
        >
          {isAddingNew ? <X className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
          <span>{isAddingNew ? 'Fechar Formulário' : '+ Conceder Admin por E-mail'}</span>
        </button>
      </div>

      {/* 📋 Formulário Retrátil para Adicionar Novo Administrador por E-mail */}
      {isAddingNew && (
        <form 
          onSubmit={handleAddSubmit}
          className="p-6 rounded-3xl bg-white border border-amber-300 shadow-md space-y-4 animate-scale-up"
        >
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>Conceder Acesso de Administrador Antecipado</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cadastre o e-mail de um novo sócio, dentista ou projetista. Quando ele fizer login com esse e-mail, entrará como Administrador.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nome Completo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Dr. Ricardo Cezar"
                value={newName}
                onChange={e => setNewName(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">E-mail do Usuário *</label>
              <input
                type="email"
                required
                placeholder="Ex: ricardo@exemplo.com.br"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-700">Nível / Cargo de Permissão</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as AdminRole)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              >
                <option value="SUPER_ADMIN">SUPER_ADMIN (Acesso Geral Total)</option>
                <option value="CAD_PLANNER">CAD_PLANNER (Projetista 3D)</option>
                <option value="OPERATOR">OPERATOR (Técnico Operacional)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsAddingNew(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              Confirmar Permissão de Administrador
            </button>
          </div>
        </form>
      )}

      {/* 📊 Métricas Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Crown className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Administradores Ativos</span>
            <span className="text-lg font-bold text-slate-900 block font-mono">{admins.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-700">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Dentistas Clientes</span>
            <span className="text-lg font-bold text-slate-900 block font-mono">{dentists.length}</span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium">Total de Contas na Base</span>
            <span className="text-lg font-bold text-slate-900 block font-mono">{unifiedUsers.length}</span>
          </div>
        </div>
      </div>

      {/* 🔍 Barra de Busca e Filtros */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar usuário por nome, e-mail, clínica ou CRO..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Todos ({unifiedUsers.length})
            </button>
            <button
              onClick={() => setFilterType('ADMINS')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'ADMINS'
                  ? 'bg-amber-600 text-white'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
              }`}
            >
              Administradores ({admins.length})
            </button>
            <button
              onClick={() => setFilterType('DENTISTS')}
              className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap cursor-pointer transition-colors ${
                filterType === 'DENTISTS'
                  ? 'bg-cyan-700 text-white'
                  : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100 border border-cyan-200'
              }`}
            >
              Dentistas Clientes ({unifiedUsers.length - admins.length})
            </button>
          </div>
        </div>
      </div>

      {/* 👥 Tabela de Usuários & Controles de Permissão */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <UserCheck className="w-4 h-4 text-cyan-700" />
            <span>Lista de Usuários da Plataforma ({filteredUsers.length})</span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Alterações são salvas em tempo real no banco
          </span>
        </div>

        {filteredUsers.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <p className="text-xs font-semibold text-slate-500">Nenhum usuário encontrado com os filtros atuais.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredUsers.map((user) => {
              const isAdmin = user.isAdmin;
              const isRoot = user.isRootAdmin;

              return (
                <div 
                  key={user.id} 
                  className={`p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                    isRoot ? 'bg-amber-50/30' : isAdmin ? 'bg-slate-50/50 hover:bg-slate-50' : 'hover:bg-slate-50/60'
                  }`}
                >
                  {/* Dados do Usuário */}
                  <div className="flex items-center space-x-3.5 min-w-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      isRoot 
                        ? 'bg-amber-100 text-amber-900 border border-amber-300 shadow-xs' 
                        : isAdmin 
                        ? 'bg-amber-50 text-amber-800 border border-amber-200' 
                        : 'bg-cyan-50 text-cyan-800 border border-cyan-200'
                    }`}>
                      {isRoot ? '👑' : user.name.slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {user.name}
                        </span>

                        {isRoot && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-950 border border-amber-300 text-[10px] font-mono font-bold">
                            👑 SUPERADMIN RAIZ
                          </span>
                        )}

                        {!isRoot && isAdmin && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-mono font-bold">
                            ADMINISTRADOR • {roleTitles[user.adminData?.role || 'SUPER_ADMIN']}
                          </span>
                        )}

                        {!isAdmin && (
                          <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-800 border border-cyan-200 text-[10px] font-mono font-medium">
                            DENTISTA CLIENTE
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-slate-500 font-mono">
                        <span className="truncate">{user.email}</span>
                        {user.dentistData?.cro && (
                          <span className="hidden md:inline">• {user.dentistData.cro}</span>
                        )}
                        {user.dentistData?.clinicName && (
                          <span className="hidden lg:inline">• {user.dentistData.clinicName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Ações de Permissão */}
                  <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end flex-shrink-0">
                    {isRoot ? (
                      <span className="px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300 text-amber-950 text-xs font-mono font-bold flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5 text-amber-700" />
                        <span>Acesso Raiz Protegido</span>
                      </span>
                    ) : isAdmin ? (
                      <div className="flex items-center space-x-2">
                        {/* Seletor rápido de papel se já for admin */}
                        <select
                          value={user.adminData?.role || 'SUPER_ADMIN'}
                          onChange={e => {
                            if (user.adminData) {
                              const newRoleVal = e.target.value as AdminRole;
                              onUpdateAdminRole(user.adminData.id, newRoleVal, roleTitles[newRoleVal]);
                              if (onNotifyFeedback) {
                                onNotifyFeedback('Cargo Atualizado', `O cargo de ${user.name} foi alterado para ${roleTitles[newRoleVal]}.`);
                              }
                            }
                          }}
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 font-medium focus:bg-white focus:border-amber-500"
                        >
                          <option value="SUPER_ADMIN">Admin Geral</option>
                          <option value="CAD_PLANNER">Projetista CAD</option>
                          <option value="OPERATOR">Operador</option>
                        </select>

                        {/* Botão de Revogar Acesso Admin */}
                        <button
                          onClick={() => {
                            if (confirm(`Deseja remover as permissões de administrador de "${user.name}" (${user.email})? Ele voltará a ser apenas um dentista cliente.`)) {
                              if (user.adminData) {
                                onRevokeAdmin(user.adminData.id, user.email);
                                if (onNotifyFeedback) {
                                  onNotifyFeedback('Acesso Revogado', `${user.name} agora é um usuário regular.`);
                                }
                              }
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-slate-600 hover:text-rose-700 text-xs font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
                          title="Remover privilégio de administrador"
                        >
                          <UserX className="w-3.5 h-3.5" />
                          <span>Revogar Admin</span>
                        </button>
                      </div>
                    ) : (
                      /* Botão de Promover Dentista a Administrador */
                      <button
                        onClick={() => {
                          onPromoteToAdmin(
                            user.email,
                            user.name,
                            'SUPER_ADMIN',
                            'Administrador Geral'
                          );
                          if (onNotifyFeedback) {
                            onNotifyFeedback(
                              'Usuário Promovido!',
                              `${user.name} (${user.email}) agora é um Administrador na plataforma.`
                            );
                          }
                        }}
                        className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs hover:shadow cursor-pointer"
                        title="Marcar este usuário como Administrador"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>Marcar como Administrador</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
