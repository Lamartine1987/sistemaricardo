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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header do Modal */}
        <div className="relative px-6 py-5 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-xs ${
              userType === 'ADMIN' 
                ? 'bg-amber-50 border border-amber-200 text-amber-600' 
                : 'bg-cyan-50 border border-cyan-200 text-cyan-600'
            }`}>
              <UserCog className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2 font-sans">
                <span>Meu Perfil</span>
                {userType === 'ADMIN' ? (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                    Admin
                  </span>
                ) : (
                  <span className="text-[10px] font-sans px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-semibold">
                    Dentista Parceiro
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Gerencie suas informações cadastrais e dados de contato
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

        {/* Mensagens de Feedback */}
        {successMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center space-x-2 text-emerald-700 text-xs font-sans animate-fade-in">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs font-sans animate-fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar">
          
          {/* E-mail de Acesso (Read-only) */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
              <Mail className="w-3.5 h-3.5 text-slate-500" />
              <span>E-mail da Conta</span>
            </label>
            <div className="relative">
              <input
                type="email"
                value={currentEmail || ''}
                readOnly
                disabled
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-600 font-sans cursor-not-allowed select-all"
              />
              <span className="absolute right-3 top-2.5 text-[10px] font-sans font-semibold text-slate-400 uppercase">
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
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                  <User className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Nome do Cirurgião-Dentista *</span>
                </label>
                <input
                  type="text"
                  required
                  value={dentistName}
                  onChange={(e) => setDentistName(e.target.value)}
                  placeholder="Ex: Dr. Lucas Mendes"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                />
              </div>

              {/* Telefone / WhatsApp */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                  <Phone className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Telefone / WhatsApp</span>
                </label>
                <input
                  type="tel"
                  value={dentistPhone}
                  onChange={(e) => setDentistPhone(e.target.value)}
                  placeholder="(00) 00000-0000"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                />
              </div>

              {/* Linha dupla: CRO e Clínica */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Registro CRO</span>
                  </label>
                  <input
                    type="text"
                    value={dentistCro}
                    onChange={(e) => setDentistCro(e.target.value)}
                    placeholder="Ex: CRO-SP 12345"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                    <Building2 className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Nome da Clínica</span>
                  </label>
                  <input
                    type="text"
                    value={dentistClinic}
                    onChange={(e) => setDentistClinic(e.target.value)}
                    placeholder="Ex: Clínica Odonto Prime"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-cyan-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                  />
                </div>
              </div>

              {/* Resumo de Atividades do Dentista */}
              <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-sans mb-1">
                    <FolderKanban className="w-3.5 h-3.5 text-cyan-600" />
                    <span>Casos Criados</span>
                  </div>
                  <span className="text-lg font-bold text-slate-900 font-sans">
                    {currentDentist.casesCount || 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center space-x-2 text-slate-500 text-[11px] font-sans mb-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Investimento</span>
                  </div>
                  <span className="text-lg font-bold text-emerald-700 font-sans">
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
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                  <User className="w-3.5 h-3.5 text-amber-600" />
                  <span>Nome do Administrador *</span>
                </label>
                <input
                  type="text"
                  required
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  placeholder="Ex: Lamartine Cezar"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                />
              </div>

              {/* Cargo / Título */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 flex items-center space-x-1.5 font-sans">
                  <Crown className="w-3.5 h-3.5 text-amber-600" />
                  <span>Título / Função</span>
                </label>
                <input
                  type="text"
                  value={adminRoleTitle}
                  onChange={(e) => setAdminRoleTitle(e.target.value)}
                  placeholder="Ex: Administrador Geral"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 focus:bg-white rounded-xl px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 font-sans font-medium focus:outline-none transition-all"
                />
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs font-sans text-amber-900 space-y-1">
                <div className="flex items-center space-x-2 font-semibold text-amber-800">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  <span>Acesso Super Administrador</span>
                </div>
                <p className="text-[11px] text-slate-600 font-sans leading-relaxed">
                  Seu perfil possui controle total sobre os casos cirúrgicos, aprovação e liberação de arquivos, gerenciamento de dentistas parceiros e equipe.
                </p>
              </div>
            </>
          )}

          {/* Botões de Ação */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 text-xs font-semibold transition-colors font-sans"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className={`px-5 py-2.5 rounded-xl text-white font-semibold text-xs font-sans transition-all flex items-center space-x-2 shadow-sm ${
                userType === 'ADMIN'
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700'
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
