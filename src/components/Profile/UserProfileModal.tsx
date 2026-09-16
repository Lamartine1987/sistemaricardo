import React, { useState, useEffect } from 'react';
import { 
  X, 
  User, 
  Phone, 
  Building2, 
  ShieldCheck, 
  Mail, 
  Crown, 
  Save, 
  CheckCircle2, 
  AlertCircle,
  Briefcase,
  UserCog,
  FolderKanban,
  DollarSign
} from 'lucide-react';
import { Dentist, AdminUser, UserType } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userType: UserType;
  currentAdmin: AdminUser;
  currentDentist: Dentist;
  firebaseUser: { email?: string | null; displayName?: string | null } | null;
  onSaveAdminProfile: (updated: Partial<AdminUser>) => Promise<void> | void;
  onSaveDentistProfile: (updated: Partial<Dentist>) => Promise<void> | void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  userType,
  currentAdmin,
  currentDentist,
  firebaseUser,
  onSaveAdminProfile,
  onSaveDentistProfile
}) => {
  // Estados para Administrador
  const [adminName, setAdminName] = useState(currentAdmin.name || '');
  const [adminRoleTitle, setAdminRoleTitle] = useState(currentAdmin.roleTitle || '');

  // Estados para Dentista
  const [dentistName, setDentistName] = useState(currentDentist.name || '');
  const [dentistPhone, setDentistPhone] = useState(currentDentist.phone || '');
  const [dentistCro, setDentistCro] = useState(currentDentist.cro || '');
  const [dentistClinic, setDentistClinic] = useState(currentDentist.clinicName || '');

  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sincroniza campos quando abrir modal
  useEffect(() => {
    if (isOpen) {
      setAdminName(currentAdmin.name || '');
      setAdminRoleTitle(currentAdmin.roleTitle || 'Administrador Geral');
      setDentistName(currentDentist.name || '');
      setDentistPhone(currentDentist.phone || '');
      setDentistCro(currentDentist.cro || '');
      setDentistClinic(currentDentist.clinicName || '');
      setSuccessMessage(null);
      setErrorMessage(null);
    }
  }, [isOpen, currentAdmin, currentDentist]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (userType === 'ADMIN') {
        if (!adminName.trim()) {
          throw new Error('O nome do administrador não pode ficar em branco.');
        }
        await onSaveAdminProfile({
          name: adminName.trim(),
          roleTitle: adminRoleTitle.trim() || 'Administrador Geral'
        });
      } else {
        if (!dentistName.trim()) {
          throw new Error('O nome do profissional não pode ficar em branco.');
        }
        await onSaveDentistProfile({
          name: dentistName.trim(),
          phone: dentistPhone.trim(),
          cro: dentistCro.trim() || 'Aguardando CRO',
          clinicName: dentistClinic.trim() || 'Consultório Odontológico'
        });
      }

      setSuccessMessage('Informações do perfil atualizadas com sucesso!');
      setTimeout(() => {
        setSuccessMessage(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMessage(err.message || 'Erro ao salvar alterações do perfil.');
    } finally {
      setSaving(false);
    }
  };

  const currentEmail = firebaseUser?.email || (userType === 'ADMIN' ? currentAdmin.email : currentDentist.email);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl">
        
        {/* Glow Superior */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-cyber-cyan/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Header do Modal */}
        <div className="relative px-6 py-5 border-b border-cyber-border/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
              userType === 'ADMIN' 
                ? 'bg-gradient-to-tr from-amber-500 to-amber-600 text-black shadow-amber-500/20' 
                : 'bg-gradient-to-tr from-cyber-cyan to-blue-600 text-black shadow-cyber-cyan/20'
            }`}>
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Meu Perfil</span>
                {userType === 'ADMIN' ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-medium">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 font-medium">
                    Dentista Parceiro
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Gerencie suas informações cadastrais e dados de contato
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-cyber-surface transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mensagens de Feedback */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center space-x-2 text-emerald-400 text-xs font-mono animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center space-x-2 text-red-400 text-xs font-mono animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* E-mail de Acesso (Read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-mono text-slate-400 flex items-center space-x-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>E-mail da Conta</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={currentEmail || ''}
                readOnly
                disabled
                className="w-full bg-cyber-bg/70 border border-cyber-border/70 rounded-xl px-3.5 py-2.5 text-xs text-slate-400 font-mono cursor-not-allowed select-all"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-mono text-slate-500 uppercase">
                Autenticado
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans">
              O e-mail é o identificador de login principal e não pode ser alterado por aqui.
            </p>
          </div>

          {/* CAMPOS ESPECÍFICOS DE DENTISTA */}
          {userType === 'CLIENT' ? (
            <>
              {/* Nome Completo */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Nome do Cirurgião-Dentista *</span>
                </label>
                <input
                  type="text"
                  required
                  value={dentistName}
                  onChange={(e) => setDentistName(e.target.value)}
                  placeholder="Ex: Dr. Lucas Mendes"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                />
              </div>

              {/* Telefone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                  <Phone className="w-3.5 h-3.5 text-cyber-cyan" />
                  <span>Telefone / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  value={dentistPhone}
                  onChange={(e) => setDentistPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                />
              </div>

              {/* Linha dupla: CRO e Clínica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Registro CRO</span>
                  </label>
                  <input
                    type="text"
                    value={dentistCro}
                    onChange={(e) => setDentistCro(e.target.value)}
                    placeholder="Ex: CRO-SP 12345"
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                    <Building2 className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Nome da Clínica</span>
                  </label>
                  <input
                    type="text"
                    value={dentistClinic}
                    onChange={(e) => setDentistClinic(e.target.value)}
                    placeholder="Ex: Clínica Odonto Prime"
                    className="w-full bg-cyber-bg border border-cyber-border focus:border-cyber-cyan rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Resumo de Atividades do Dentista */}
              <div className="pt-2 border-t border-cyber-border/60 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-mono mb-1">
                    <FolderKanban className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>Casos Criados</span>
                  </div>
                  <span className="text-lg font-bold text-white font-mono">
                    {currentDentist.casesCount || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-cyber-surface/60 border border-cyber-border/80">
                  <div className="flex items-center space-x-2 text-slate-400 text-[11px] font-mono mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Investimento</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-400 font-mono">
                    R$ {(currentDentist.totalSpent || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </>
          ) : (
            /* CAMPOS ESPECÍFICOS DE ADMINISTRADOR */
            <>
              {/* Nome do Administrador */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                  <User className="w-3.5 h-3.5 text-amber-400" />
                  <span>Nome do Administrador *</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: Lamartine Cezar"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                />
              </div>

              {/* Cargo / Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-mono text-slate-300 flex items-center space-x-1.5">
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                  <span>Título / Função</span>
                </label>
                <input
                  type="text"
                  value={adminRoleTitle}
                  onChange={(e) => setAdminRoleTitle(e.target.value)}
                  placeholder="Ex: Administrador Geral"
                  className="w-full bg-cyber-bg border border-cyber-border focus:border-amber-400 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 font-medium focus:outline-none transition-colors"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs font-mono text-amber-300 space-y-1">
                <div className="flex items-center space-x-2 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Acesso Super Administrador</span>
                </div>
                <p className="text-[11px] text-slate-300 font-sans leading-relaxed">
                  Seu perfil possui controle total sobre os casos cirúrgicos, aprovação e liberação de arquivos, gerenciamento de dentistas parceiros e equipe.
                </p>
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-cyber-border/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-cyber-surface text-xs font-mono transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-black font-semibold text-xs font-mono transition-all flex items-center space-x-2 shadow-lg ${
                userType === 'ADMIN'
                  ? 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-amber-500/20'
                  : 'bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 shadow-cyber-cyan/20'
              } ${saving ? 'opacity-70 cursor-not-allowed' : 'active:scale-95'}`}
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Salvando...' : 'Salvar Alterações'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
