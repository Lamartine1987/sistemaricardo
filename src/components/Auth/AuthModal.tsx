import React, { useState, useMemo, useEffect } from 'react';
import { 
  loginWithGoogleDetailed, 
  loginWithEmail, 
  registerWithEmail,
  sendPasswordReset,
  verifyResetCode,
  completePasswordReset,
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
  Phone,
  Eye,
  EyeOff,
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Sparkles,
  Inbox,
  Check
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
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados dedicados para a Nova Senha (Etapa 3 da Recuperação)
  const [resetOobCode, setResetOobCode] = useState<string | null>(null);
  const [pastedResetInput, setPastedResetInput] = useState('');
  const [showPasteBox, setShowPasteBox] = useState(false);
  const [verifiedResetEmail, setVerifiedResetEmail] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [passwordResetCompleted, setPasswordResetCompleted] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isInvalidCredentialsError, setIsInvalidCredentialsError] = useState(false);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [existingAccountConflict, setExistingAccountConflict] = useState<{
    type: 'EMAIL' | 'PHONE' | 'GOOGLE';
    matchedEmail: string;
    matchedName?: string;
  } | null>(null);

  // Detectar automaticamente se a página foi aberta através de um link de recuperação (?mode=resetPassword&oobCode=...)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mode = params.get('mode');
    const oob = params.get('oobCode');
    if (mode === 'resetPassword' && oob) {
      setIsForgotPassword(true);
      handleVerifyOobCode(oob);
    }
  }, [isOpen]);

  // Verificação assíncrona no Firebase Auth enquanto digita o e-mail no modo "Criar Conta"
  useEffect(() => {
    if (!isRegister || isForgotPassword) return;
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
  }, [isRegister, isForgotPassword, email]);

  // Identificação de conta cadastrada para exibir feedback amigável na tela de recuperação e no cadastro
  const matchedAccountByEmail = useMemo(() => {
    const cleanEmail = email.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes('@') || !cleanEmail.includes('.')) return null;

    const matchedDentist = existingDentists.find(
      d => d.email?.toLowerCase().trim() === cleanEmail
    );
    if (matchedDentist) {
      return {
        email: matchedDentist.email,
        name: matchedDentist.name,
        roleLabel: 'Dentista Parceiro'
      };
    }

    const matchedAdmin = existingAdmins.find(
      a => a.email?.toLowerCase().trim() === cleanEmail
    );
    if (matchedAdmin) {
      return {
        email: matchedAdmin.email || cleanEmail,
        name: matchedAdmin.name,
        roleLabel: 'Administrador'
      };
    }

    return null;
  }, [email, existingDentists, existingAdmins]);

  // Verificação em tempo real enquanto o usuário digita no modo "Criar Conta"
  const liveConflict = useMemo(() => {
    if (!isRegister || isForgotPassword) return null;

    if (matchedAccountByEmail) {
      return {
        type: 'EMAIL' as const,
        matchedEmail: matchedAccountByEmail.email,
        matchedName: matchedAccountByEmail.name
      };
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
  }, [isRegister, isForgotPassword, matchedAccountByEmail, phone, existingDentists]);

  const activeConflict = existingAccountConflict || liveConflict;

  // Atalho inteligente para o provedor de e-mail do usuário
  const webmailShortcut = useMemo(() => {
    const clean = email.toLowerCase().trim();
    if (clean.endsWith('@hotmail.com') || clean.endsWith('@outlook.com') || clean.endsWith('@live.com') || clean.endsWith('@msn.com') || clean.includes('@hotmail.') || clean.includes('@outlook.')) {
      return { label: 'Abrir Outlook / Hotmail', url: 'https://outlook.live.com/mail/0/inbox' };
    }
    if (clean.endsWith('@gmail.com')) {
      return { label: 'Abrir Gmail', url: 'https://mail.google.com' };
    }
    if (clean.endsWith('@yahoo.com') || clean.endsWith('@yahoo.com.br')) {
      return { label: 'Abrir Yahoo Mail', url: 'https://mail.yahoo.com' };
    }
    if (clean.endsWith('@icloud.com')) {
      return { label: 'Abrir iCloud Mail', url: 'https://www.icloud.com/mail' };
    }
    return null;
  }, [email]);

  // Cálculo de força da nova senha
  const passwordStrength = useMemo(() => {
    if (!newPassword) return { score: 0, label: '', color: 'bg-slate-200' };
    let score = 0;
    if (newPassword.length >= 6) score += 1;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) || /[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword) && newPassword.length >= 8) score += 1;

    if (score <= 1) return { score: 1, label: 'Senha fraca (mín. 6 caracteres)', color: 'bg-amber-500' };
    if (score === 2) return { score: 2, label: 'Senha boa', color: 'bg-cyan-500' };
    return { score: 3, label: 'Senha forte e segura', color: 'bg-emerald-500' };
  }, [newPassword]);

  if (!isOpen) return null;

  const extractOobCodeFromInput = (raw: string): string => {
    const trimmed = raw.trim();
    if (trimmed.includes('oobCode=')) {
      try {
        const urlObj = new URL(trimmed);
        const param = urlObj.searchParams.get('oobCode');
        if (param) return param;
      } catch {
        const match = trimmed.match(/[?&]oobCode=([^&#\s]+)/);
        if (match?.[1]) return decodeURIComponent(match[1]);
      }
    }
    return trimmed;
  };

  const handleVerifyOobCode = async (rawCodeOrUrl: string) => {
    const code = extractOobCodeFromInput(rawCodeOrUrl);
    if (!code) {
      setErrorMessage('Cole o link completo recebido no e-mail ou o código de segurança.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      const accountEmail = await verifyResetCode(code);
      setResetOobCode(code);
      setVerifiedResetEmail(accountEmail);
      if (accountEmail) setEmail(accountEmail);
      setResetSuccessMessage(null);
    } catch (err: any) {
      setErrorMessage('Este link ou código de recuperação é inválido ou já expirou. Solicite um novo link abaixo.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetOobCode) return;

    if (newPassword.length < 6) {
      setErrorMessage('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('A confirmação de senha não coincide com a nova senha digitada.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      await completePasswordReset(resetOobCode, newPassword);
      setPasswordResetCompleted(true);

      // Limpar parâmetros da URL caso tenha vindo por link direto
      if (window.location.search.includes('oobCode=')) {
        window.history.replaceState({}, document.title, window.location.pathname);
      }

      // Login automático após redefinir a senha
      const targetEmail = verifiedResetEmail || email.trim();
      if (targetEmail) {
        try {
          const loggedUser = await loginWithEmail(targetEmail, newPassword);
          if (loggedUser) {
            setTimeout(() => {
              onSuccess(loggedUser.email || targetEmail, loggedUser.displayName || undefined);
              onClose();
            }, 1200);
            return;
          }
        } catch {
          // Se o login automático falhar por qualquer motivo, permite voltar à tela de login com a senha já preenchida
        }
      }
    } catch (err: any) {
      setErrorMessage('Não foi possível salvar a nova senha. O link pode ter expirado — solicite um novo envio.');
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchToExistingLogin = (targetEmail?: string) => {
    if (targetEmail) {
      setEmail(targetEmail);
    }
    setIsRegister(false);
    setIsForgotPassword(false);
    setResetOobCode(null);
    setPasswordResetCompleted(false);
    setExistingAccountConflict(null);
    setErrorMessage(null);
    setIsInvalidCredentialsError(false);
    setResetSuccessMessage(null);
  };

  const handlePasswordReset = async (targetEmail?: string) => {
    const emailToReset = (targetEmail || email).trim();
    setIsForgotPassword(true);
    setResetOobCode(null);
    setPasswordResetCompleted(false);

    if (!emailToReset || !emailToReset.includes('@')) {
      setIsInvalidCredentialsError(false);
      setErrorMessage('Digite o endereço de e-mail da sua conta abaixo para enviarmos o link seguro.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setIsInvalidCredentialsError(false);
    setResetSuccessMessage(null);
    try {
      await sendPasswordReset(emailToReset);
      setResetSuccessMessage(emailToReset);
    } catch (err: any) {
      setErrorMessage('Não foi possível enviar o e-mail de recuperação. Verifique se o endereço está digitado corretamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    setIsInvalidCredentialsError(false);
    setResetSuccessMessage(null);
    setExistingAccountConflict(null);
    try {
      const res = await loginWithGoogleDetailed();
      if (res && res.user) {
        const googleEmail = (res.user.email || '').toLowerCase().trim();
        const alreadyInDatabase =
          existingDentists.some(d => d.email?.toLowerCase().trim() === googleEmail) ||
          existingAdmins.some(a => a.email?.toLowerCase().trim() === googleEmail);

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
    if (isForgotPassword) {
      await handlePasswordReset(email);
      return;
    }
    if (!email || !password) return;

    setErrorMessage(null);
    setIsInvalidCredentialsError(false);
    setResetSuccessMessage(null);

    if (isRegister) {
      if (!name.trim()) {
        setErrorMessage('Por favor, informe seu nome completo.');
        return;
      }

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
        setIsInvalidCredentialsError(true);
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
        setIsInvalidCredentialsError(true);
      } else {
        setErrorMessage('Não foi possível realizar a autenticação. Verifique seus dados e tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Etapa ativa na recuperação de senha: 1 (Informar E-mail), 2 (E-mail Enviado), 3 (Nova Senha)
  const recoveryStep = resetOobCode ? 3 : resetSuccessMessage ? 2 : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-3xl bg-white border border-slate-200/90 overflow-hidden shadow-2xl text-slate-800">
        
        {/* ================================================================= */}
        {/* HEADER DO MODAL (Diferenciado para Recuperação de Senha vs Login) */}
        {/* ================================================================= */}
        {isForgotPassword ? (
          <div className="relative px-6 pt-6 pb-5 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-950 text-white overflow-hidden">
            {/* Efeito decorativo de brilho */}
            <div className="absolute -top-12 -right-12 w-36 h-36 rounded-full bg-cyan-500/20 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-28 h-28 rounded-full bg-blue-500/15 blur-xl pointer-events-none" />

            <div className="relative flex items-start justify-between gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400/25 to-blue-500/25 border border-cyan-400/40 flex items-center justify-center text-cyan-300 shadow-inner flex-shrink-0">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <span className="inline-flex items-center space-x-1 text-[10px] font-mono uppercase tracking-wider text-cyan-300 font-semibold">
                    <Sparkles className="w-3 h-3" />
                    <span>Segurança Implant Precision</span>
                  </span>
                  <h3 className="text-base font-extrabold text-white tracking-tight font-sans">
                    Recuperação de Senha
                  </h3>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Barra de Progresso em 3 Passos */}
            <div className="relative mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-2">
              {[
                { step: 1, label: '1. Seu E-mail' },
                { step: 2, label: '2. Link no E-mail' },
                { step: 3, label: '3. Nova Senha' }
              ].map(item => {
                const isDone = recoveryStep > item.step || passwordResetCompleted;
                const isCurrent = recoveryStep === item.step && !passwordResetCompleted;
                return (
                  <div
                    key={item.step}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-[11px] font-sans font-semibold transition-all ${
                      isDone
                        ? 'bg-emerald-500/20 border border-emerald-400/40 text-emerald-200'
                        : isCurrent
                        ? 'bg-cyan-500/25 border border-cyan-400/50 text-white shadow-2xs'
                        : 'bg-white/5 border border-white/10 text-slate-400'
                    }`}
                  >
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold flex-shrink-0 ${
                        isDone
                          ? 'bg-emerald-400 text-slate-950'
                          : isCurrent
                          ? 'bg-cyan-400 text-slate-950'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {isDone ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : item.step}
                    </div>
                    <span className="truncate">{item.label.split('. ')[1]}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-cyan-200/90 shadow-2xs bg-[#0c3960] flex items-center justify-center flex-shrink-0">
                <img 
                  src="/logo-square.png" 
                  alt="Logo Implant Precision" 
                  className="w-full h-full object-cover" 
                />
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
        )}

        {/* ================================================================= */}
        {/* CORPO DO MODAL                                                    */}
        {/* ================================================================= */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs space-y-2.5 font-sans animate-fade-in">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed font-medium">{errorMessage}</span>
              </div>
              {isInvalidCredentialsError && (
                <div className="pt-1 pl-6">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => handlePasswordReset(email)}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>
                      {email.trim()
                        ? `Recuperar senha de ${email.trim()}`
                        : 'Esqueceu sua senha? Clique para recuperar'}
                    </span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* FLUXO DE RECUPERAÇÃO DE SENHA (3 ETAPAS VISUAIS)                */}
          {/* =============================================================== */}
          {isForgotPassword ? (
            <div className="space-y-4">
              {/* ETAPA 3: DEFINIR NOVA SENHA DIRETAMENTE NO SISTEMA */}
              {resetOobCode ? (
                passwordResetCompleted ? (
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50 to-white border border-emerald-200 text-center space-y-3 animate-fade-in">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Sua nova senha foi salva!
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        A senha da conta <strong>{verifiedResetEmail || email}</strong> foi atualizada com sucesso. Conectando você à plataforma...
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSwitchToExistingLogin(verifiedResetEmail || email)}
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-all cursor-pointer"
                    >
                      Ir para o Painel Agora
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleCompleteNewPassword} className="space-y-4 animate-fade-in">
                    <div className="p-3.5 rounded-2xl bg-cyan-50/80 border border-cyan-200 flex items-center space-x-3">
                      <div className="p-2 rounded-xl bg-white border border-cyan-200 text-cyan-700">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div className="text-xs">
                        <span className="text-slate-500 block text-[10px] uppercase font-mono font-bold">
                          Conta Verificada para Redefinição
                        </span>
                        <strong className="text-slate-900 font-semibold">
                          {verifiedResetEmail || email}
                        </strong>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 font-sans">
                        Digite sua Nova Senha
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={e => setNewPassword(e.target.value)}
                          placeholder="Mínimo de 6 caracteres"
                          className="w-full pl-10 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white font-sans transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                        >
                          {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>

                      {/* Medidor visual de força da senha */}
                      {newPassword && (
                        <div className="mt-2 space-y-1">
                          <div className="grid grid-cols-3 gap-1.5 h-1.5">
                            {[1, 2, 3].map(level => (
                              <div
                                key={level}
                                className={`rounded-full transition-all ${
                                  passwordStrength.score >= level ? passwordStrength.color : 'bg-slate-200'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {passwordStrength.label}
                          </p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="text-xs font-bold text-slate-700 block mb-1.5 font-sans">
                        Confirme a Nova Senha
                      </label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                        <input
                          type={showNewPassword ? 'text' : 'password'}
                          required
                          value={confirmNewPassword}
                          onChange={e => setConfirmNewPassword(e.target.value)}
                          placeholder="Repita a nova senha"
                          className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white font-sans transition-all"
                        />
                      </div>
                      {confirmNewPassword && (
                        <p
                          className={`text-[11px] mt-1 font-medium flex items-center space-x-1 ${
                            newPassword === confirmNewPassword ? 'text-emerald-600' : 'text-rose-600'
                          }`}
                        >
                          {newPassword === confirmNewPassword ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>As senhas coincidem perfeitamente</span>
                            </>
                          ) : (
                            <span>As senhas digitadas ainda não coincidem</span>
                          )}
                        </p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <KeyRound className="w-4 h-4" />
                      <span>{loading ? 'Salvando nova senha...' : 'Salvar Nova Senha e Entrar'}</span>
                    </button>
                  </form>
                )
              ) : resetSuccessMessage ? (
                /* ETAPA 2: LINK ENVIADO COM VISUAL MODERNO E ATALHOS */
                <div className="space-y-4 animate-fade-in">
                  <div className="p-5 rounded-2xl bg-gradient-to-b from-emerald-50/90 via-emerald-50/30 to-white border border-emerald-200/90 text-center space-y-3 shadow-2xs">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-700 flex items-center justify-center mx-auto shadow-2xs">
                      <Inbox className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-extrabold text-slate-900">
                        Verifique sua caixa de entrada!
                      </h4>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        Enviamos um link seguro de redefinição de senha para:
                      </p>
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white border border-emerald-300 text-emerald-900 text-xs font-bold shadow-2xs mt-1">
                        <Mail className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{resetSuccessMessage}</span>
                      </div>
                    </div>

                    {webmailShortcut && (
                      <div className="pt-1">
                        <a
                          href={webmailShortcut.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center space-x-2 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-all shadow-xs"
                        >
                          <span>{webmailShortcut.label}</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Checklist de Orientação Rápida */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 space-y-2 text-xs text-slate-600">
                    <p className="font-bold text-slate-800 text-[11px] uppercase tracking-wider font-mono">
                      Como concluir em 30 segundos:
                    </p>
                    <div className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        1
                      </span>
                      <span>
                        Abra o e-mail que enviamos (em contas <strong>Hotmail / Outlook</strong>, confira também a pasta <strong>Lixo Eletrônico / Spam</strong>).
                      </span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="w-4 h-4 rounded-full bg-cyan-100 text-cyan-800 font-bold text-[10px] flex items-center justify-center flex-shrink-0 mt-0.5">
                        2
                      </span>
                      <span>
                        Clique no link do e-mail para escolher sua nova senha <strong>ou</strong> cole o link abaixo para trocar a senha aqui mesmo nesta janela:
                      </span>
                    </div>

                    {/* Opção para colar o link do e-mail e usar a tela estilizada da Etapa 3 */}
                    <div className="pt-1.5">
                      {!showPasteBox ? (
                        <button
                          type="button"
                          onClick={() => setShowPasteBox(true)}
                          className="w-full py-2 px-3 rounded-xl bg-white hover:bg-cyan-50/60 text-cyan-800 border border-cyan-200 font-semibold text-[11px] flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                        >
                          <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
                          <span>Prefere criar a nova senha nesta tela? Cole o link do e-mail aqui</span>
                        </button>
                      ) : (
                        <div className="space-y-2 pt-1 animate-fade-in">
                          <input
                            type="text"
                            value={pastedResetInput}
                            onChange={e => setPastedResetInput(e.target.value)}
                            placeholder="Cole aqui o link recebido no e-mail..."
                            className="w-full px-3 py-2 text-xs bg-white border border-cyan-300 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-600"
                          />
                          <button
                            type="button"
                            disabled={loading || !pastedResetInput.trim()}
                            onClick={() => handleVerifyOobCode(pastedResetInput)}
                            className="w-full py-2 px-3 rounded-xl bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 text-white font-bold text-xs transition-colors cursor-pointer"
                          >
                            {loading ? 'Verificando link...' : 'Continuar para Nova Senha →'}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ações de Reenviar ou Voltar */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handlePasswordReset(resetSuccessMessage)}
                      className="text-slate-600 hover:text-cyan-700 font-semibold flex items-center space-x-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                      <span>Reenviar link</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setResetSuccessMessage(null);
                        setErrorMessage(null);
                      }}
                      className="text-slate-500 hover:text-slate-800 font-medium cursor-pointer"
                    >
                      Trocar endereço de e-mail
                    </button>
                  </div>
                </div>
              ) : (
                /* ETAPA 1: INFORMAR O E-MAIL PARA RECUPERAÇÃO */
                <form onSubmit={handleEmailAuth} className="space-y-4 animate-fade-in">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                    Informe o e-mail cadastrado na sua conta. Nós enviaremos imediatamente um link seguro para você definir uma nova senha.
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-1.5 font-sans">
                      E-mail da sua conta
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        autoFocus
                        value={email}
                        onChange={e => {
                          setEmail(e.target.value);
                          setErrorMessage(null);
                        }}
                        placeholder="seuemail@exemplo.com"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-600 focus:bg-white font-sans transition-all"
                      />
                    </div>

                    {/* Feedback instantâneo quando reconhece a conta cadastrada */}
                    {matchedAccountByEmail && (
                      <div className="mt-2 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center space-x-2 animate-fade-in">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                        <span>
                          Conta localizada: <strong>{matchedAccountByEmail.name}</strong> ({matchedAccountByEmail.roleLabel})
                        </span>
                      </div>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center space-x-2 font-sans cursor-pointer"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span>{loading ? 'Enviando link seguro...' : 'Enviar Link de Recuperação'}</span>
                  </button>
                </form>
              )}

              {/* Botão Voltar para o Login */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(false);
                    setResetOobCode(null);
                    setPasswordResetCompleted(false);
                    setErrorMessage(null);
                    setIsInvalidCredentialsError(false);
                    setResetSuccessMessage(null);
                  }}
                  className="inline-flex items-center space-x-1.5 text-xs text-cyan-700 hover:text-cyan-900 font-sans font-bold cursor-pointer py-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para a tela de Login</span>
                </button>
              </div>
            </div>
          ) : (
            /* =============================================================== */
            /* FLUXO PADRÃO DE LOGIN / CADASTRO                                */
            /* =============================================================== */
            <>
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
                        onClick={() => {
                          setIsForgotPassword(true);
                          setErrorMessage(null);
                          setIsInvalidCredentialsError(false);
                          setResetSuccessMessage(null);
                        }}
                        className="text-[11px] text-cyan-700 hover:text-cyan-800 hover:underline font-semibold flex items-center space-x-1 cursor-pointer"
                      >
                        <KeyRound className="w-3 h-3" />
                        <span>Esqueci minha senha</span>
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-cyan-500 focus:bg-white font-sans transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
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
                    setIsInvalidCredentialsError(false);
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
            </>
          )}
        </div>
      </div>
    </div>
  );
};
