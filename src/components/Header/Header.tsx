import React from 'react';
import { 
  Box, 
  Plus, 
  User, 
  Crown, 
  LogIn, 
  LogOut,
  UserCog
} from 'lucide-react';
import { AdminUser, Dentist, UserType } from '../../types';
import { AppNotification } from '../../types/notifications';
import { NotificationBell } from '../Notifications/NotificationBell';

interface HeaderProps {
  userType: UserType;
  currentAdmin: AdminUser;
  currentDentist: Dentist;
  admins: AdminUser[];
  dentists: Dentist[];
  onSelectAdmin: (admin: AdminUser) => void;
  onSelectDentist: (dentist: Dentist) => void;
  onOpenNewCase: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  firebaseUser: { email?: string | null; displayName?: string | null } | null;
  onLogout: () => void;
  onBackToLanding: () => void;
  notifications: AppNotification[];
  onMarkAllNotificationsAsRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const Header: React.FC<HeaderProps> = ({
  userType,
  currentAdmin,
  currentDentist,
  admins,
  dentists,
  onSelectAdmin,
  onSelectDentist,
  onOpenNewCase,
  onOpenAuthModal,
  onOpenProfileModal,
  firebaseUser,
  onLogout,
  onBackToLanding,
  notifications,
  onMarkAllNotificationsAsRead,
  onSelectNotification
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-cyber-border bg-cyber-bg/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div 
            onClick={onBackToLanding}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyber-cyan via-blue-500 to-indigo-600 flex items-center justify-center text-black shadow-glow-cyan cursor-pointer hover:scale-105 transition-transform"
            title="Voltar ao Início"
          >
            <Box className="w-5 h-5 fill-black stroke-black" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-white flex items-center">
                Implant <span className="text-cyber-cyan ml-1">Precision</span>
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan border border-cyber-cyan/30 uppercase tracking-wider font-semibold">
                3D OS
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono hidden md:block">
              Planejamento Digital & Guias Cirúrgicos
            </p>
          </div>
        </div>

        {/* Centro / Direita: Autenticação, Status e Ações */}
        <div className="flex items-center space-x-3">

          {/* Autenticação Real Firebase e Botão de Perfil */}
          {firebaseUser ? (
            <div className="flex items-center space-x-2">
              
              {/* Sininho de Notificações com badge */}
              <NotificationBell
                notifications={notifications}
                onMarkAllAsRead={onMarkAllNotificationsAsRead}
                onSelectNotification={onSelectNotification}
              />

              <button
                onClick={onOpenProfileModal}
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-cyber-card hover:bg-cyber-surface border border-cyber-border hover:border-cyber-cyan/40 text-xs transition-all group cursor-pointer shadow-sm"
                title="Clique para ver e editar seu perfil"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 group-hover:scale-125 transition-transform" />
                <span className="text-slate-200 font-mono font-medium truncate max-w-[150px] group-hover:text-cyber-cyan transition-colors" title={firebaseUser.email || ''}>
                  {userType === 'ADMIN' ? currentAdmin.name : (currentDentist.name || firebaseUser.displayName || 'Meu Perfil')}
                </span>
                <UserCog className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyber-cyan transition-colors" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-cyber-card hover:bg-red-500/10 border border-cyber-border hover:border-red-500/30 text-slate-400 hover:text-red-400 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-cyber-surface hover:bg-cyber-surface/80 border border-cyber-border text-slate-200 text-xs font-medium flex items-center space-x-1.5 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-cyber-cyan" />
              <span className="hidden sm:inline">Entrar (Google/Email)</span>
            </button>
          )}

          {/* Badge Visual do Perfil Conectado (Painel Admin ou Portal Cliente) */}
          {userType === 'ADMIN' ? (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:border-amber-500/50 text-xs font-mono font-medium transition-colors"
              title="Abrir configurações de perfil"
            >
              <Crown className="w-3.5 h-3.5 text-amber-400" />
              <span>Painel Admin</span>
            </button>
          ) : (
            <button
              onClick={onOpenProfileModal}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-cyber-cyan bg-cyber-cyan/10 border border-cyber-cyan/30 hover:border-cyber-cyan/50 text-xs font-mono font-medium transition-colors"
              title="Abrir configurações de perfil"
            >
              <User className="w-3.5 h-3.5" />
              <span>Portal do Cliente</span>
            </button>
          )}

          {/* Botão de Ação */}
          <button
            onClick={onOpenNewCase}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-cyber-cyan to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-semibold text-xs transition-all shadow-glow-cyan flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">
              {userType === 'ADMIN' ? 'Novo Planejamento' : 'Enviar Escaneamento'}
            </span>
          </button>
        </div>

      </div>
    </header>
  );
};
