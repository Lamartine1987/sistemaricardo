import React, { useState, useMemo, useEffect } from 'react';
import { 
  loginWithGoogleDetailed, 
  loginWithEmail, 
  registerWithEmail,
  sendPasswordReset,
  checkEmailExistsInFirebaseAuth
} from '../../services/firebase/auth';
import { Dentist, AdminUser } from '../../types';
import { 
  X, 
  Mail, 
  Lock, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  AlertCircle,
  CheckCircle2,
  KeyRound,
  User,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string, displayName?: string, phone?: string) => void;
  existingDentists?: Dentist[];
  existingAdmins?: AdminUser[];
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingDentists = [],
  existingAdmins = []
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [existingAccountConflict, setExistingAccountConflict] = useState<{
    type: 'EMAIL' | 'PHONE' | 'GOOGLE';
    matchedEmail: string;
    matchedName?: string;
  } | null>(null);

  // Verificação assíncrona no Firebase Auth enquanto digita o e-mail no modo "Criar Conta"
  useEffect(() => {
    if (!isRegister) return;
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return;

    const timer = setTimeout(async () => {
      const existsInAuth = await checkEmailExistsInFirebaseAuth(cleanEmail);
      if (existsInAuth) {
        setExistingAccountConflict(prev => prev || {
          type: 'EMAIL',
          matchedEmail: cleanEmail
        });
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [isRegister, email]);

  // Verificação em tempo real enquanto o usuário digita no modo "Criar Conta"
  const liveConflict = useMemo(() => {
    if (!isRegister) return null;

    const cleanEmail = email.toLowerCase().trim();
    if (cleanEmail && cleanEmail.includes('@') && cleanEmail.includes('.')) {
      const matchedDentistByEmail = existingDentists.find(
        d => d.email?.toLowerCase().trim() === cleanEmail
      );
      if (matchedDentistByEmail) {
        return {
          type: 'EMAIL' as const,
          matchedEmail: matchedDentistByEmail.email,
          matchedName: matchedDentistByEmail.name
        };
      }

      const matchedAdminByEmail = existingAdmins.find(
        a => a.email?.toLowerCase().trim() === cleanEmail
      );
      if (matchedAdminByEmail) {
        return {
          type: 'EMAIL' as const,
          matchedEmail: matchedAdminByEmail.email || cleanEmail,
          matchedName: matchedAdminByEmail.name
        };
      }
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length >= 10) {
      const last9 = cleanPhone.slice(-9);
      const matchedDentistByPhone = existingDentists.find(d => {
        const dDigits = (d.phone || '').replace(/\D/g, '');
        return dDigits.length >= 9 && dDigits.slice(-9) === last9;
      });
      if (matchedDentistByPhone) {
        return {
          type: 'PHONE' as const,
          matchedEmail: matchedDentistByPhone.email,
          matchedName: matchedDentistByPhone.name
        };
      }
    }

    return null;
  }, [isRegister, email, phone, existingDentists, existingAdmins]);

  const activeConflict = existingAccountConflict || liveConflict;

  if (!isOpen) return null;

  const handleSwitchToExistingLogin = (targetEmail?: string) => {
    if (targetEmail) {
      setEmail(targetEmail);
    }
    setIsRegister(false);
    setExistingAccountConflict(null);
    setErrorMessage(null);
    setResetSuccessMessage(null);
  };

  const handlePasswordReset = async (targetEmail?: string) => {
    const emailToReset = (targetEmail || email).trim();
    if (!emailToReset || !emailToReset.includes('@')) {
      setErrorMessage('Informe seu e-mail no campo abaixo para receber o link de recuperação de senha.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setResetSuccessMessage(null);
    try {
      await sendPasswordReset(emailToReset);
      setResetSuccessMessage(
        `Enviamos um link de redefinição de senha para ${emailToReset}. Verifique sua caixa de entrada e spam.`
      );
    } catch (err: any) {
      setErrorMessage('Não foi possível enviar o e-mail de redefinição. Verifique se o endereço está correto.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    setResetSuccessMessage(null);
    setExistingAccountConflict(null);
    try {
      const res = await loginWithGoogleDetailed();
      if (res && res.user) {
        const googleEmail = (res.user.email || '').toLowerCase().trim();
        const alreadyInDatabase =
          existingDentists.some(d => d.email?.toLowerCase().trim() === googleEmail) ||
          existingAdmins.some(a => a.email?.toLowerCase().trim() === googleEmail);

        // Se o usuário estava na tela de "Criar Conta" e a conta Google já existia, avisá-lo claramente
        if (isRegister && (!res.isNewUser || alreadyInDatabase)) {
          setExistingAccountConflict({
            type: 'GOOGLE',
            matchedEmail: res.user.email || googleEmail,
            matchedName: res.user.displayName || undefined
          });
          return;
        }

        onSuccess(res.user.email || '', res.user.displayName || undefined);
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Domínio não autorizado no Firebase Auth (${window.location.hostname}). Adicione este domínio no Firebase Console > Authentication > Configurações > Domínios autorizados.`);
      } else if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        setErrorMessage('A janela de autenticação do Google foi fechada antes de concluir.');
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a janela popup do Google. Permita popups para este site e tente novamente.');
      } else {
        setErrorMessage('Não foi possível concluir a autenticação com o Google. Tente novamente ou use seu e-mail.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setErrorMessage(null);
    setResetSuccessMessage(null);

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }

      // Bloquear criação duplicada caso já conste no cadastro de dentistas ou administradores
      if (liveConflict) {
        setExistingAccountConflict(liveConflict);
        return;
      }
    }

    setLoading(true);
    try {
      let user;
      if (isRegister) {
        user = await registerWithEmail(email.trim(), password, name.trim());
      } else {
        user = await loginWithEmail(email.trim(), password);
      }

      if (user) {
        onSuccess(
          user.email || email.trim(), 
          user.displayName || name.trim() || undefined,
          phone.trim() || undefined
        );
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Domínio não autorizado no Firebase Auth (${window.location.hostname}). Adicione este domínio no Firebase Console > Authentication > Configurações > Domínios autorizados.`);
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setExistingAccountConflict({
          type: 'EMAIL',
          matchedEmail: email.trim()
        });
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      } else if (err.code === 'auth/invalid-email') {
        setErrorMessage('O formato do endereço de e-mail informado é inválido.');
      } else if (err.code === 'auth/too-many-requests') {
        setErrorMessage('Muitas tentativas seguidas. Aguarde alguns instantes ou redefina sua senha.');
      } else {
        setErrorMessage('Não foi possível realizar a autenticação. Verifique seus dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyan-50 border border-cyan-200 text-cyan-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 tracking-tight font-sans">
                {isRegister ? 'Criar Conta no Implant Precision' : 'Entrar no Sistema'}
              </h3>
              <p className="text-xs text-slate-500 font-sans">
                Autenticação segura com verificação de conta existente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2 font-sans">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {resetSuccessMessage && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2 font-sans">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
              <span>{resetSuccessMessage}</span>
            </div>
          )}

          {/* Alerta Inteligente de Cadastro Já Existente */}
          {isRegister && activeConflict && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2.5 font-sans animate-fade-in">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-amber-600" />
                <div className="space-y-1">
                  <p className="font-bold text-amber-900">
                    {activeConflict.type === 'GOOGLE'
                      ? 'Esta conta Google já possui um cadastro ativo!'
                      : activeConflict.type === 'EMAIL'
                      ? 'Este e-mail já possui um cadastro ativo!'
                      : 'Este telefone/WhatsApp já possui um cadastro!'}
                  </p>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    {activeConflict.type === 'GOOGLE' ? (
                      <>
                        Identificamos que a conta Google <strong>{activeConflict.matchedEmail}</strong>
                        {activeConflict.matchedName ? ` (${activeConflict.matchedName})` : ''} já está cadastrada na plataforma. Clique abaixo para acessar seu painel existente.
                      </>
                    ) : activeConflict.type === 'EMAIL' ? (
                      <>
                        Encontramos uma conta existente para <strong>{activeConflict.matchedEmail}</strong>
                        {activeConflict.matchedName ? ` (${activeConflict.matchedName})` : ''}. Você pode entrar diretamente sem criar uma nova conta.
                      </>
                    ) : (
                      <>
                        Este WhatsApp já está vinculado ao cadastro de <strong>{activeConflict.matchedName || 'Dentista Parceiro'}</strong> (e-mail: <strong>{activeConflict.matchedEmail}</strong>).
                      </>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                {activeConflict.type === 'GOOGLE' ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSuccess(activeConflict.matchedEmail, activeConflict.matchedName);
                      onClose();
                    }}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Acessar minha conta existente agora</span>
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => handleSwitchToExistingLogin(activeConflict.matchedEmail)}
                      className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>Entrar com esta conta</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handlePasswordReset(activeConflict.matchedEmail)}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold text-[11px] flex items-center space-x-1.5 transition-colors cursor-pointer"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-amber-700" />
                      <span>Recuperar senha por e-mail</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Botão Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold text-xs transition-all flex items-center justify-center space-x-2.5 shadow-2xs active:scale-[0.99] font-sans cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continuar com o Google</span>
          </button>

          <div className="flex items-center my-3">
            <div className="flex-1 h-[1px] bg-slate-200" />
            <span className="px-3 text-[11px] font-sans text-slate-400 uppercase font-medium">Ou com E-mail</span>
            <div className="flex-1 h-[1px] bg-slate-200" />
          </div>

          {/* Form E-mail / Senha */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                    Nome Completo <span className="text-cyan-600">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isRegister}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Dr(a). Seu Nome Completo"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-sans transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">
                    Telefone / WhatsApp <span className="text-cyan-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required={isRegister}
                      value={phone}
                      onChange={e => {
                        setPhone(e.target.value);
                        setExistingAccountConflict(null);
                      }}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-sans transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1 font-sans">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => {
                    setEmail(e.target.value);
                    setExistingAccountConflict(null);
                  }}
                  placeholder="seuemail@odonto.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-sans transition-all"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 font-sans">Senha</label>
                {!isRegister && (
                  <button
                    type="button"
                    onClick={() => handlePasswordReset()}
                    className="text-[11px] text-cyan-700 hover:underline font-medium cursor-pointer"
                  >
                    Esqueci minha senha
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-sans transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-semibold text-xs transition-all shadow-sm flex items-center justify-center space-x-2 font-sans cursor-pointer"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{loading ? 'Aguarde...' : isRegister ? 'Criar Conta' : 'Entrar na Plataforma'}</span>
            </button>
          </form>

          {/* Toggle Register vs Login */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsRegister(!isRegister);
                setErrorMessage(null);
                setResetSuccessMessage(null);
                setExistingAccountConflict(null);
              }}
              className="text-xs text-cyan-700 hover:underline font-sans font-medium cursor-pointer"
            >
              {isRegister 
                ? 'Já possui uma conta? Faça login aqui' 
                : 'Novo dentista ou membro da equipe? Cadastre-se'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
