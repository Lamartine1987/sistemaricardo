import React from 'react';
import { 
  Box, 
  Plus, 
  User, 
  Crown, 
  LogIn, 
  LogOut,
  UserCog,
  Globe
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
  onToggleUserType?: () => void;
  canSwitchRole?: boolean;
  onOpenNewCase: () => void;
  onOpenAuthModal: () => void;
  onOpenProfileModal: () => void;
  firebaseUser: { email?: string | null; displayName?: string | null } | null;
  onLogout: () => void;
  onBackToLanding: () => void;
  notifications: AppNotification[];
  onMarkAllNotificationsAsRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
  onOpenSiteManager?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userType,
  currentAdmin,
  currentDentist,
  admins,
  dentists,
  onSelectAdmin,
  onSelectDentist,
  onToggleUserType,
  canSwitchRole = true,
  onOpenNewCase,
  onOpenAuthModal,
  onOpenProfileModal,
  firebaseUser,
  onLogout,
  onBackToLanding,
  notifications,
  onMarkAllNotificationsAsRead,
  onSelectNotification,
  onOpenSiteManager
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between gap-1.5 sm:gap-2">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          <div 
            onClick={onBackToLanding}
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-cyan-200/90 shadow-xs cursor-pointer hover:scale-105 transition-transform bg-[#0c3960] flex items-center justify-center flex-shrink-0"
            title="Voltar ao Início"
          >
            <img 
              src="/logo-square.png" 
              alt="Logo Implant Precision" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div>
            <div className="flex items-center space-x-1.5 sm:space-x-2">
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900 flex items-center">
                Implant <span className="text-cyan-600 ml-1">Precision</span>
              </span>
              <span className="hidden sm:inline-block text-[10px] font-sans px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 uppercase tracking-wider font-semibold">
                PORTAL CLÍNICO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
              Planejamento Digital & Guias Cirúrgicos
            </p>
          </div>
        </div>

        {/* Centro / Direita: Autenticação, Status e Ações */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">

          {/* Autenticação Real Firebase e Botão de Perfil */}
          {firebaseUser ? (
            <div className="flex items-center space-x-1 sm:space-x-2">
              
              {/* Sininho de Notificações com badge */}
              <div className="flex-shrink-0">
                <NotificationBell
                  notifications={notifications}
                  onMarkAllAsRead={onMarkAllNotificationsAsRead}
                  onSelectNotification={onSelectNotification}
                />
              </div>

              <button
                onClick={onOpenProfileModal}
                className="flex items-center space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-all group cursor-pointer shadow-xs flex-shrink-0"
                title={`Perfil: ${userType === 'ADMIN' ? currentAdmin.name : (currentDentist.name || firebaseUser.displayName || 'Meu Perfil')}`}
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm group-hover:scale-125 transition-transform flex-shrink-0" />
                <span className="text-slate-700 font-sans font-medium truncate max-w-[120px] group-hover:text-cyan-700 transition-colors hidden sm:inline" title={firebaseUser.email || ''}>
                  {userType === 'ADMIN' ? currentAdmin.name : (currentDentist.name || firebaseUser.displayName || 'Meu Perfil')}
                </span>
                <UserCog className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors flex-shrink-0" />
              </button>

              <button
                onClick={onLogout}
                className="p-1.5 sm:p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors flex-shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">Entrar (Google/Email)</span>
            </button>
          )}

          {/* Alternador de Visão / Identificador de Portal */}
          {canSwitchRole ? (
            userType === 'ADMIN' ? (
              <button
                onClick={onToggleUserType}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-cyan-700 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100/80 text-xs font-sans font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
                title="Alternar visão para o Portal do Dentista / Cliente"
              >
                <User className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
                <span className="hidden md:inline">Ver Portal do Cliente</span>
                <span className="hidden sm:inline md:hidden">Dentista</span>
              </button>
            ) : (
              <button
                onClick={onToggleUserType}
                className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100/80 text-xs font-sans font-semibold transition-all shadow-xs active:scale-95 cursor-pointer flex-shrink-0"
                title="Voltar para a visão do Painel Administrativo"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span className="hidden md:inline">Voltar p/ Painel Admin</span>
                <span className="hidden sm:inline md:hidden">Admin</span>
              </button>
            )
          ) : (
            <div
              className="flex items-center space-x-1 sm:space-x-1.5 px-2 sm:px-3 py-1.5 rounded-xl text-cyan-800 bg-cyan-50/80 border border-cyan-200/70 text-xs font-sans font-semibold shadow-xs select-none flex-shrink-0"
              title="Portal do Dentista Parceiro"
            >
              <User className="w-3.5 h-3.5 text-cyan-600 flex-shrink-0" />
              <span className="hidden md:inline">Portal do Dentista</span>
              <span className="hidden sm:inline md:hidden">Cliente</span>
            </div>
          )}

          {/* Botão de Ação */}
          <button
            onClick={onOpenNewCase}
            className="p-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5 active:scale-95 flex-shrink-0"
            title={userType === 'ADMIN' ? 'Novo Planejamento' : 'Enviar Escaneamento'}
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
