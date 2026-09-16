import React, { useState } from 'react';
import { 
  loginWithGoogle, 
  loginWithEmail, 
  registerWithEmail 
} from '../../services/firebase/auth';
import { 
  X, 
  Mail, 
  Lock, 
  ShieldCheck, 
  LogIn, 
  UserPlus, 
  AlertCircle,
  User,
  Phone
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (userEmail: string, displayName?: string, phone?: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const user = await loginWithGoogle();
      if (user) {
        onSuccess(user.email || '', user.displayName || undefined);
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Falha ao autenticar com Google.');
    } finally {
      setLoading(false);
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (isRegister && !name.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    try {
      let user;
      if (isRegister) {
        user = await registerWithEmail(email, password, name.trim());
      } else {
        user = await loginWithEmail(email, password);
      }

      if (user) {
        onSuccess(
          user.email || '', 
          user.displayName || name.trim() || undefined,
          phone.trim() || undefined
        );
        onClose();
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está cadastrado. Tente entrar.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
      } else {
        setErrorMessage(err.message || 'Erro ao realizar autenticação.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cyber-border flex items-center justify-between bg-cyber-surface/90">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-cyber-cyan/10 border border-cyber-cyan/30 text-cyber-cyan">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                {isRegister ? 'Criar Conta no Implant Precision' : 'Entrar no Sistema'}
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Autenticação direta com Firebase Auth
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

        {/* Content */}
        <div className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Botão Google Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs transition-all flex items-center justify-center space-x-2.5 shadow-md active:scale-[0.99]"
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
            <div className="flex-1 h-[1px] bg-cyber-border" />
            <span className="px-3 text-[11px] font-mono text-slate-500 uppercase">Ou com E-mail</span>
            <div className="flex-1 h-[1px] bg-cyber-border" />
          </div>

          {/* Form E-mail / Senha */}
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isRegister && (
              <>
                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Nome Completo <span className="text-cyber-cyan">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required={isRegister}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Dr(a). Seu Nome Completo"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-mono text-slate-300 block mb-1">
                    Telefone / WhatsApp <span className="text-cyber-cyan">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      required={isRegister}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                      className="w-full pl-9 pr-3 py-2 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="seuemail@odonto.com"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-slate-300 block mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs bg-cyber-surface border border-cyber-border rounded-xl text-white focus:outline-none focus:border-cyber-cyan"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center justify-center space-x-2"
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
              }}
              className="text-xs text-cyber-cyan hover:underline font-mono"
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
