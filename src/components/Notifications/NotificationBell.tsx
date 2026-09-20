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
        className="relative p-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-cyan-300 text-slate-600 hover:text-slate-900 transition-all shadow-xs flex items-center justify-center cursor-pointer"
        title="Notificações do Sistema"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-cyan-600 px-1 text-[9px] font-sans font-bold text-white shadow-xs">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown de Notificações */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 overflow-hidden animate-fade-in">
          
          {/* Header do Dropdown */}
          <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/80">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-800 tracking-wide font-sans">Notificações</span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-sans px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 font-semibold border border-cyan-200">
                  {unreadCount} nova{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={onMarkAllAsRead}
                className="text-[11px] font-sans text-slate-500 hover:text-cyan-700 transition-colors flex items-center space-x-1 cursor-pointer"
                title="Marcar todas como lidas"
              >
                <Check className="w-3 h-3" />
                <span>Marcar lidas</span>
              </button>
            )}
          </div>

          {/* Lista de Notificações */}
          <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
            {notifications.length === 0 ? (
              <div className="py-8 text-center px-4">
                <Bell className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p className="text-xs text-slate-500 font-sans">Nenhuma notificação por aqui.</p>
                <p className="text-[10px] text-slate-400 mt-0.5 font-sans">
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
                  className={`p-3.5 transition-all cursor-pointer flex items-start space-x-3 hover:bg-slate-50 ${
                    !n.read ? 'bg-cyan-50/40' : 'bg-transparent'
                  }`}
                >
                  <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 flex-shrink-0 mt-0.5">
                    {getNotificationIcon(n.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className={`text-xs font-semibold truncate ${!n.read ? 'text-slate-900 font-bold' : 'text-slate-700'}`}>
                        {n.title}
                      </span>
                      <span className="text-[10px] font-sans text-slate-400 whitespace-nowrap">
                        {formatRelativeTime(n.createdAt)}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed font-sans">
                      {n.message}
                    </p>

                    {n.caseCode && (
                      <span className="inline-block mt-1.5 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">
                        {n.caseCode}
                      </span>
                    )}
                  </div>

                  {!n.read && (
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shadow-xs flex-shrink-0 mt-1.5" />
                  )}
                </div>
              ))
            )}
          </div>

          {/* Rodapé Informativo */}
          <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-center">
            <span className="text-[10px] font-sans text-slate-400">
              Notificações sincronizadas com o WhatsApp
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
