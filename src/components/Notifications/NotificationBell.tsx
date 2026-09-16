import React, { useState, useRef, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  Sparkles, 
  FolderPlus, 
  DollarSign, 
  Info, 
  Check, 
  ExternalLink 
} from 'lucide-react';
import { AppNotification } from '../../types/notifications';

interface NotificationBellProps {
  notifications: AppNotification[];
  onMarkAllAsRead: () => void;
  onSelectNotification: (notification: AppNotification) => void;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({
  notifications,
  onMarkAllAsRead,
  onSelectNotification
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const getNotificationIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'NEW_CASE':
        return <FolderPlus className="w-4 h-4 text-cyber-cyan" />;
      case 'CASE_ACCEPTED':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'PLANNING_READY':
        return <Sparkles className="w-4 h-4 text-amber-400" />;
      case 'PAYMENT_CONFIRMED':
        return <DollarSign className="w-4 h-4 text-emerald-400" />;
      default:
        return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const diffSeconds = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
      if (diffSeconds < 60) return 'Agora mesmo';
      const diffMinutes = Math.floor(diffSeconds / 60);
      if (diffMinutes < 60) return `Há ${diffMinutes} min`;
      const diffHours = Math.floor(diffMinutes / 60);
      if (diffHours < 24) return `Há ${diffHours}h`;
      return new Date(isoString).toLocaleDateString('pt-BR');
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      
      {/* Botão do Sininho */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl bg-cyber-card hover:bg-cyber-surface border border-cyber-border hover:border-cyber-cyan/40 text-slate-300 hover:text-white transition-all shadow-sm flex items-center justify-center"
        title="Notificações do Sistema"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-500 px-1 text-[9px] font-mono font-bold text-black shadow-glow-cyan animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel-glow bg-cyber-card border border-cyber-border shadow-2xl z-50 overflow-hidden animate-fade-in">
          
          {/* Header do Dropdown */}
          <div className="px-4 py-3 border-b border-cyber-border/80 flex items-center justify-between bg-cyber-surface/60">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white tracking-wide">Notificações</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyber-cyan/15 text-cyber-cyan font-semibold border border-cyber-cyan/30">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-mono text-slate-400 hover:text-cyber-cyan transition-colors flex items-center space-x-1"
                title="Marcar todas como lidas"
              >
                <Check className="w-3 h-3" />
                <span>Marcar lidas</span>
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto custom-scrollbar divide-y divide-cyber-border/40">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Bell className="w-8 h-8 mx-auto text-slate-600 mb-2 opacity-40" />
                <p className="text-xs text-slate-400 font-mono">Nenhuma notificação por aqui.</p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Novas solicitações e atualizações de casos aparecerão nesta central.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => {
                    onSelectNotification(n);
                    setIsOpen(false);
                  }}
                  className={`p-3.5 transition-all cursor-pointer flex items-start space-x-3 hover:bg-cyber-surface/90 ${
                    !n.read ? 'bg-cyber-cyan/5' : 'bg-transparent'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-cyber-surface border border-cyber-border flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                        {n.title}
                      </span>
                      <span className="text-[9px] font-mono text-slate-500 whitespace-nowrap">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed font-sans">
                      {n.message}
                    </p>

                    {n.caseCode && (
                      <span className="inline-block mt-1.5 text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyber-surface border border-cyber-border text-slate-400">
                        {n.caseCode}
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-cyber-cyan shadow-sm shadow-cyber-cyan flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="px-4 py-2 border-t border-cyber-border/60 bg-cyber-surface/30 text-center">
            <span className="text-[10px] font-mono text-slate-500">
              Notificações sincronizadas com o WhatsApp
            </span>
          </div>

        </div>
      )}

    </div>
  );
};
