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
  onSelectNotification
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-xl shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        
        {/* Logo & Brand */}
        <div className="flex items-center space-x-3 flex-shrink-0">
          <div 
            onClick={onBackToLanding}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-sm cursor-pointer hover:scale-105 transition-transform"
            title="Voltar ao Início"
          >
            <Box className="w-5 h-5 fill-white stroke-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-base font-bold tracking-tight text-slate-900 flex items-center">
                Implant <span className="text-cyan-600 ml-1">Precision</span>
              </span>
              <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200/80 uppercase tracking-wider font-semibold">
                PORTAL CLÍNICO
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium hidden md:block">
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
                className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-all group cursor-pointer shadow-xs"
                title="Clique para ver e editar seu perfil"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm group-hover:scale-125 transition-transform" />
                <span className="text-slate-700 font-sans font-medium truncate max-w-[150px] group-hover:text-cyan-700 transition-colors" title={firebaseUser.email || ''}>
                  {userType === 'ADMIN' ? currentAdmin.name : (currentDentist.name || firebaseUser.displayName || 'Meu Perfil')}
                </span>
                <UserCog className="w-3.5 h-3.5 text-slate-400 group-hover:text-cyan-600 transition-colors" />
              </button>

              <button
                onClick={onLogout}
                className="p-2 rounded-xl bg-slate-50 hover:bg-red-50 border border-slate-200 hover:border-red-200 text-slate-400 hover:text-red-500 transition-colors"
                title="Sair da conta"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-medium flex items-center space-x-1.5 transition-colors"
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
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-cyan-700 bg-cyan-50 border border-cyan-200 hover:bg-cyan-100/80 text-xs font-sans font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Alternar visão para o Portal do Dentista / Cliente"
              >
                <User className="w-3.5 h-3.5 text-cyan-600" />
                <span className="hidden sm:inline">Ver Portal do Cliente</span>
                <span className="sm:hidden">Dentista</span>
              </button>
            ) : (
              <button
                onClick={onToggleUserType}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-amber-800 bg-amber-50 border border-amber-200 hover:bg-amber-100/80 text-xs font-sans font-semibold transition-all shadow-xs active:scale-95 cursor-pointer"
                title="Voltar para a visão do Painel Administrativo"
              >
                <Crown className="w-3.5 h-3.5 text-amber-600" />
                <span className="hidden sm:inline">Voltar p/ Painel Admin</span>
                <span className="sm:hidden">Admin</span>
              </button>
            )
          ) : (
            <div
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-cyan-800 bg-cyan-50/80 border border-cyan-200/70 text-xs font-sans font-semibold shadow-xs select-none"
              title="Portal do Dentista Parceiro"
            >
              <User className="w-3.5 h-3.5 text-cyan-600" />
              <span className="hidden sm:inline">Portal do Dentista</span>
              <span className="sm:hidden">Cliente</span>
            </div>
          )}

          {/* Botão de Ação */}
          <button
            onClick={onOpenNewCase}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition-all shadow-sm hover:shadow-md flex items-center space-x-1.5 active:scale-95"
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
