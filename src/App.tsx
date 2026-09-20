import React, { useState, useEffect } from 'react';
import { DentalCase, Dentist, AdminUser, UserType, CaseFile } from './types';
import { INITIAL_CASES, INITIAL_DENTISTS, INITIAL_ADMINS } from './services/mockData';
import { Header } from './components/Header/Header';
import { StatsGrid } from './components/Dashboard/StatsGrid';
import { CaseList } from './components/Dashboard/CaseList';
import { DentistsDirectory } from './components/Dentists/DentistsDirectory';
import { TeamList } from './components/Team/TeamList';
import { NewAdminModal } from './components/Team/NewAdminModal';
import { CaseDetailsModal } from './components/CaseDetails/CaseDetailsModal';
import { NewCaseModal } from './components/NewCaseModal/NewCaseModal';
import { AuthModal } from './components/Auth/AuthModal';
import { UserProfileModal } from './components/Profile/UserProfileModal';
import { SettingsTab } from './components/Settings/SettingsTab';
import { LandingPage } from './components/Landing/LandingPage';
import { AppNotification } from './types/notifications';
import { 
  getStoredWhatsAppConfig, 
  sendWhatsAppMessage, 
  buildNewCaseAdminMessage, 
  buildCaseAcceptedDentistMessage, 
  buildPlanningReadyDentistMessage,
  buildPaymentConfirmedDentistMessage 
} from './services/whatsapp/whatsappService';
import { 
  seedInitialDataIfEmpty, 
  subscribeToCases, 
  subscribeToDentists, 
  subscribeToAdmins,
  subscribeToNotifications,
  saveCaseToFirestore,
  updateCasePaymentInFirestore,
  saveAdminToFirestore,
  saveDentistToFirestore,
  deleteCaseFromFirestore,
  saveNotificationToFirestore,
  markNotificationReadInFirestore,
  markAllNotificationsReadInFirestore
} from './services/firebase/firestore';
import { subscribeToAuth, logoutFirebase, updateCurrentUserProfile } from './services/firebase/auth';
import { 
  FolderKanban, 
  Users, 
  Lock, 
  UserCheck,
  Settings
} from 'lucide-react';

const DEFAULT_DENTIST_FALLBACK: Dentist = {
  id: 'dentist-novo',
  name: 'Novo Dentista Parceiro',
  cro: 'CRO-UF 00.000',
  clinicName: 'Consultório Odontológico',
  email: 'dentista@exemplo.com.br',
  phone: '(11) 90000-0000',
  casesCount: 0,
  totalSpent: 0
};

export function App() {
  // Limpeza de dados fictícios legados do piloto anterior
  useEffect(() => {
    localStorage.removeItem('implantflow_cases');
    localStorage.removeItem('implantflow_dentists');
    localStorage.removeItem('implantflow_admins');
  }, []);

  // Administradores da Equipe (Lamartine Cezar - Administrador Geral)
  const [admins, setAdmins] = useState<AdminUser[]>(() => {
    const saved = localStorage.getItem('implantprecision_admins');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.length > 0 && parsed[0].name?.includes('Ricardo')) {
          return INITIAL_ADMINS;
        }
        return parsed;
      } catch (e) {
        return INITIAL_ADMINS;
      }
    }
    return INITIAL_ADMINS;
  });

  // Dentistas Clientes (Inicialmente vazio para testes reais)
  const [dentists, setDentists] = useState<Dentist[]>(() => {
    const saved = localStorage.getItem('implantprecision_dentists');
    return saved ? JSON.parse(saved) : INITIAL_DENTISTS;
  });

  // Casos de Implante (Inicialmente vazio para testes reais)
  const [cases, setCases] = useState<DentalCase[]>(() => {
    const saved = localStorage.getItem('implantprecision_cases');
    return saved ? JSON.parse(saved) : INITIAL_CASES;
  });

  // Sessão Ativa
  const [userType, setUserType] = useState<UserType>('ADMIN');
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser>(admins[0] || INITIAL_ADMINS[0]);
  const [currentDentist, setCurrentDentist] = useState<Dentist>(dentists[0] || DEFAULT_DENTIST_FALLBACK);
  const [firebaseUser, setFirebaseUser] = useState<{ email?: string | null; displayName?: string | null } | null>(null);

  // Modo de visualização: 'LANDING' (Site 3D Lusion) ou 'DASHBOARD' (Sistema/Plataforma)
  const [viewMode, setViewMode] = useState<'LANDING' | 'DASHBOARD'>(() => {
    const saved = localStorage.getItem('implantprecision_view_mode');
    return (saved === 'DASHBOARD' || saved === 'LANDING') ? saved : 'LANDING';
  });

  useEffect(() => {
    localStorage.setItem('implantprecision_view_mode', viewMode);
  }, [viewMode]);

  // Sincronizar perfil ativo com o usuário autenticado do Firebase (Lamartine Cezar como Super Admin, outros como Dentistas Clientes)
  useEffect(() => {
    if (firebaseUser?.email) {
      const emailLower = firebaseUser.email.toLowerCase();
      const isAdmin = emailLower === 'lamartinecezar3@gmail.com' || emailLower === 'ricardo@implantprecision.com.br';

      if (isAdmin) {
        const activeName = firebaseUser.displayName || 'Lamartine Cezar';
        setUserType('ADMIN');
        setCurrentAdmin({
          id: 'admin-01',
          name: activeName,
          email: firebaseUser.email,
          role: 'SUPER_ADMIN',
          roleTitle: 'Administrador Geral',
          active: true,
          createdAt: '2026-01-01T08:00:00Z'
        });
        setAdmins(prev => {
          const others = prev.filter(a => a.id !== 'admin-01' && a.email?.toLowerCase() !== emailLower);
          return [{
            id: 'admin-01',
            name: activeName,
            email: firebaseUser.email!,
            role: 'SUPER_ADMIN',
            roleTitle: 'Administrador Geral',
            active: true,
            createdAt: '2026-01-01T08:00:00Z'
          }, ...others];
        });
      } else {
        setUserType('CLIENT');
        const matched = dentists.find(d => d.email.toLowerCase() === emailLower);
        if (matched) {
          setCurrentDentist(matched);
        } else {
          const fallbackDentist: Dentist = {
            id: `dentist-${Date.now()}`,
            name: firebaseUser.displayName || 'Dr(a). Dentista Parceiro',
            email: firebaseUser.email,
            phone: '',
            cro: 'Aguardando CRO',
            clinicName: 'Consultório Odontológico',
            casesCount: 0,
            totalSpent: 0
          };
          setDentists(prev => [fallbackDentist, ...prev]);
          setCurrentDentist(fallbackDentist);
          saveDentistToFirestore(fallbackDentist);
        }
      }
    }
  }, [firebaseUser]);

  // Navegação
  const [activeTab, setActiveTab] = useState<'CASES' | 'DENTISTS' | 'TEAM' | 'CONFIG'>('CASES');
  const [selectedDentistFilter, setSelectedDentistFilter] = useState<string>('ALL');
  
  // Modais
  const [selectedCase, setSelectedCase] = useState<DentalCase | null>(null);
  const [isNewCaseOpen, setIsNewCaseOpen] = useState(false);
  const [isNewAdminModalOpen, setIsNewAdminModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Central de Notificações In-App
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    const saved = localStorage.getItem('implantprecision_notifications');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('implantprecision_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const addNotification = (item: Omit<AppNotification, 'id' | 'createdAt' | 'read'>) => {
    const newNotif: AppNotification = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      read: false,
      createdAt: new Date().toISOString()
    };
    setNotifications(prev => [newNotif, ...prev]);
    saveNotificationToFirestore(newNotif);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    markAllNotificationsReadInFirestore(notifications);
  };

  const handleSelectNotification = (notification: AppNotification) => {
    setNotifications(prev => prev.map(n => n.id === notification.id ? { ...n, read: true } : n));
    markNotificationReadInFirestore(notification.id);
    if (notification.caseId) {
      const targetCase = cases.find(c => c.id === notification.caseId || c.caseCode === notification.caseCode);
      if (targetCase) {
        setSelectedCase(targetCase);
      }
    }
  };

  // 1. Ouvir estado de autenticação Firebase
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuth((user) => {
      if (user) {
        setFirebaseUser({
          email: user.email,
          displayName: user.displayName
        });
      } else {
        setFirebaseUser(null);
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // 2. Sincronização em tempo real com o Firestore (Apenas quando autenticado para evitar erros de permissão)
  useEffect(() => {
    if (!firebaseUser) return;

    // Semear dados iniciais se banco estiver limpo
    seedInitialDataIfEmpty(INITIAL_CASES, INITIAL_DENTISTS, INITIAL_ADMINS);

    const unsubCases = subscribeToCases((updatedCases) => {
      setCases(updatedCases);
    });

    const unsubDentists = subscribeToDentists((updatedDentists) => {
      setDentists(updatedDentists);
    });

    const unsubAdmins = subscribeToAdmins((updatedAdmins) => {
      setAdmins(updatedAdmins);
    });

    const unsubNotifications = subscribeToNotifications((updatedNotifications) => {
      if (updatedNotifications) {
        setNotifications(updatedNotifications);
      }
    });

    return () => {
      unsubCases();
      unsubDentists();
      unsubAdmins();
      unsubNotifications();
    };
  }, [firebaseUser]);

  // Persistência local de backup
  useEffect(() => {
    localStorage.setItem('implantprecision_admins', JSON.stringify(admins));
  }, [admins]);

  useEffect(() => {
    localStorage.setItem('implantprecision_cases', JSON.stringify(cases));
  }, [cases]);

  useEffect(() => {
    localStorage.setItem('implantprecision_dentists', JSON.stringify(dentists));
  }, [dentists]);

  // Alternadores de Sessão
  const handleSelectAdmin = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setUserType('ADMIN');
  };

  const handleSelectDentist = (dentist: Dentist) => {
    setCurrentDentist(dentist);
    setUserType('CLIENT');
    if (activeTab === 'DENTISTS' || activeTab === 'TEAM') {
      setActiveTab('CASES');
    }
  };

  // Usuários com permissão para alternar entre painel do administrador e portal do cliente
  const canSwitchRole = !firebaseUser || Boolean(
    firebaseUser.email && (
      firebaseUser.email.toLowerCase() === 'lamartinecezar3@gmail.com' ||
      firebaseUser.email.toLowerCase() === 'ricardo@implantprecision.com.br'
    )
  );

  const handleToggleUserType = () => {
    if (userType === 'ADMIN') {
      setUserType('CLIENT');
      if (dentists.length > 0) {
        setCurrentDentist(dentists[0]);
      }
      if (activeTab === 'DENTISTS' || activeTab === 'TEAM') {
        setActiveTab('CASES');
      }
    } else {
      setUserType('ADMIN');
    }
  };

  // Filtragem estrita dos casos: se for cliente, ele enxerga APENAS os pacientes dele!
  // Ordenação: sempre dos mais novos para os mais antigos (createdAt descendente)
  const displayedCases = (userType === 'CLIENT' 
    ? cases.filter(c => c.dentistId === currentDentist.id)
    : cases
  ).slice().sort((a, b) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
      return timeB - timeA;
    }
    return (b.id || '').localeCompare(a.id || '');
  });

  // Handler de aprovação e pagamento PIX (atualiza estado local e Firestore)
  const handlePaymentSuccess = (caseId: string) => {
    const targetCase = cases.find(c => c.id === caseId);

    setCases(prevCases =>
      prevCases.map(c => {
        if (c.id === caseId) {
          return {
            ...c,
            status: 'APPROVED_PAID',
            payment: {
              ...c.payment,
              status: 'PAID',
              paidAt: new Date().toISOString(),
              receiptUrl: `#recibo-${c.caseCode}`
            },
            files: c.files.map(f => ({ ...f, isLocked: false }))
          };
        }
        return c;
      })
    );

    if (targetCase) {
      setDentists(prevDentists =>
        prevDentists.map(d => {
          if (d.id === targetCase.dentistId) {
            return {
              ...d,
              totalSpent: d.totalSpent + targetCase.payment.amount
            };
          }
          return d;
        })
      );

      // Persistir no Firestore
      updateCasePaymentInFirestore(caseId, targetCase.payment.amount, targetCase.dentistId);

      // Notificação In-App para o Dentista
      addNotification({
        targetUserType: 'CLIENT',
        targetUserId: targetCase.dentistId,
        caseId: targetCase.id,
        caseCode: targetCase.caseCode,
        title: 'Pagamento Confirmado & STL Liberado',
        message: `O pagamento do caso ${targetCase.caseCode} foi confirmado. Os arquivos cirúrgicos STL foram desbloqueados para download!`,
        type: 'PAYMENT_CONFIRMED'
      });

      // Disparo de WhatsApp para o Dentista
      const waConfig = getStoredWhatsAppConfig();
      if (waConfig.autoNotifyDentistOnPayment && targetCase.dentistPhone) {
        const msg = buildPaymentConfirmedDentistMessage(
          targetCase.patientName,
          targetCase.dentistName,
          targetCase.caseCode,
          waConfig
        );
        sendWhatsAppMessage(targetCase.dentistPhone, msg, waConfig).catch(console.error);
      }
    }

    setSelectedCase(prev => {
      if (prev && prev.id === caseId) {
        return {
          ...prev,
          status: 'APPROVED_PAID',
          payment: {
            ...prev.payment,
            status: 'PAID',
            paidAt: new Date().toISOString()
          },
          files: prev.files.map(f => ({ ...f, isLocked: false }))
        };
      }
      return prev;
    });
  };

  // Criar novo caso (salva localmente e no Firestore)
  const handleCreateCase = (newCase: DentalCase) => {
    setCases(prev => [newCase, ...prev]);
    setDentists(prev =>
      prev.map(d => (d.id === newCase.dentistId ? { ...d, casesCount: d.casesCount + 1 } : d))
    );
    setSelectedCase(newCase);

    // Persistir no Firestore
    saveCaseToFirestore(newCase);

    // 1. Notificação In-App para o Administrador (Dr. Ricardo)
    addNotification({
      targetUserType: 'ADMIN',
      caseId: newCase.id,
      caseCode: newCase.caseCode,
      title: 'Nova Solicitação de Planejamento',
      message: `Dr(a). ${newCase.dentistName} enviou o caso do paciente ${newCase.patientName} (${newCase.files.length} arquivo(s)) para avaliação.`,
      type: 'NEW_CASE'
    });

    // 2. Disparo de Mensagem WhatsApp para o Dr. Ricardo
    const waConfig = getStoredWhatsAppConfig();
    if (waConfig.autoNotifyAdminOnNewCase && waConfig.adminPhone) {
      const msg = buildNewCaseAdminMessage(
        newCase.patientName,
        newCase.dentistName,
        newCase.caseCode,
        newCase.surgicalGuideType,
        newCase.files.length,
        waConfig
      );
      sendWhatsAppMessage(waConfig.adminPhone, msg, waConfig).catch(console.error);
    }
  };

  // Dr. Ricardo aceita o caso recebido para iniciar o planejamento tridimensional
  const handleAcceptCase = (caseId: string) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    const updatedCase: DentalCase = {
      ...targetCase,
      status: 'PLANNING' // Planejamento aceito e iniciado pelo Dr. Ricardo (em andamento 3D)
    };

    setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    saveCaseToFirestore(updatedCase);
    setSelectedCase(updatedCase);

    const dentistObj = dentists.find(d => d.id === targetCase.dentistId);

    // 1. Notificação In-App para o Dentista Solicitante
    addNotification({
      targetUserType: 'CLIENT',
      targetUserId: targetCase.dentistId,
      targetUserEmail: dentistObj?.email || undefined,
      caseId: targetCase.id,
      caseCode: targetCase.caseCode,
      title: 'Caso Aceito pelo Dr. Ricardo',
      message: `O Dr. Ricardo recebeu os arquivos do paciente ${targetCase.patientName} e iniciou o planejamento cirúrgico 3D.`,
      type: 'CASE_ACCEPTED'
    });

    // 2. Disparo de WhatsApp para o Dentista
    const waConfig = getStoredWhatsAppConfig();
    const targetPhone = (targetCase.dentistPhone || dentistObj?.phone || waConfig.adminPhone || '').trim();
    console.log(`[WhatsApp] Disparando aviso de aceite de caso para: ${targetPhone}`);
    if (waConfig.autoNotifyDentistOnCaseAccepted && targetPhone) {
      const msg = buildCaseAcceptedDentistMessage(
        targetCase.patientName,
        targetCase.dentistName,
        targetCase.caseCode,
        waConfig
      );
      sendWhatsAppMessage(targetPhone, msg, waConfig)
        .then(res => console.log('WhatsApp enviado com sucesso para o dentista:', res))
        .catch(err => console.error('Erro ao disparar WhatsApp de aceite do caso:', err));
    }
  };

  // Dr. Ricardo entrega e envia os arquivos do planejamento (Guia STL e Relatório PDF) ao dentista
  const handleDeliverPlanning = async (
    caseId: string, 
    newFiles: CaseFile[], 
    notes?: string, 
    amount?: number,
    notifyWhatsApp: boolean = true
  ) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    const updatedAmount = amount !== undefined && amount > 0 ? amount : targetCase.payment.amount;
    const updatedCase: DentalCase = {
      ...targetCase,
      status: 'PENDING_APPROVAL',
      notes: notes || targetCase.notes,
      payment: {
        ...targetCase.payment,
        amount: updatedAmount
      },
      files: [...targetCase.files, ...newFiles]
    };

    setCases(prev => prev.map(c => c.id === caseId ? updatedCase : c));
    setSelectedCase(updatedCase);
    await saveCaseToFirestore(updatedCase);

    const dentistObj = dentists.find(d => d.id === targetCase.dentistId);

    // 1. Notificação In-App para o Dentista Solicitante
    addNotification({
      targetUserType: 'CLIENT',
      targetUserId: targetCase.dentistId,
      targetUserEmail: dentistObj?.email || undefined,
      caseId: targetCase.id,
      caseCode: targetCase.caseCode,
      title: 'Planejamento 3D Concluído!',
      message: `O Dr. Ricardo concluiu o projeto da guia cirúrgica do paciente ${targetCase.patientName} (${newFiles.length} novo(s) arquivo(s)). Acesse para inspecionar e liberar o download!`,
      type: 'PLANNING_READY'
    });

    // 2. Disparo de WhatsApp para o Dentista
    const waConfig = getStoredWhatsAppConfig();
    const targetPhone = (targetCase.dentistPhone || dentistObj?.phone || waConfig.adminPhone || '').trim();
    if (notifyWhatsApp && waConfig.autoNotifyDentistOnPlanningReady && targetPhone) {
      const msg = buildPlanningReadyDentistMessage(
        targetCase.patientName,
        targetCase.dentistName,
        targetCase.caseCode,
        updatedAmount,
        waConfig
      );
      sendWhatsAppMessage(targetPhone, msg, waConfig)
        .then(res => console.log('WhatsApp de planejamento pronto enviado com sucesso:', res))
        .catch(err => console.error('Erro ao enviar WhatsApp de planejamento pronto:', err));
    }
  };

  // Exclusão de caso: o cliente só pode excluir se o Dr. Ricardo ainda NÃO tiver aceitado (status ANALYSIS)
  const handleDeleteCase = async (caseId: string) => {
    const targetCase = cases.find(c => c.id === caseId);
    if (!targetCase) return;

    if (userType === 'CLIENT' && targetCase.status !== 'ANALYSIS') {
      alert('Não é possível excluir este caso: o Dr. Ricardo já aceitou os arquivos e iniciou o planejamento cirúrgico 3D.');
      return;
    }

    const confirmMessage = userType === 'CLIENT'
      ? `Deseja realmente cancelar e excluir a solicitação do paciente "${targetCase.patientName}" (${targetCase.caseCode})? Esta ação não poderá ser desfeita.`
      : `Deseja realmente excluir o caso do paciente "${targetCase.patientName}" (${targetCase.caseCode})?`;

    if (!confirm(confirmMessage)) return;

    // 1. Atualizar lista de casos local
    setCases(prev => prev.filter(c => c.id !== caseId));

    // 2. Decrementar contagem de casos do dentista
    setDentists(prev =>
      prev.map(d => (d.id === targetCase.dentistId ? { ...d, casesCount: Math.max(0, d.casesCount - 1) } : d))
    );

    // 3. Fechar modal de detalhes se for o caso selecionado
    if (selectedCase?.id === caseId) {
      setSelectedCase(null);
    }

    // 4. Excluir do banco Firestore
    await deleteCaseFromFirestore(caseId);

    // 5. Notificação in-app
    addNotification({
      targetUserType: userType,
      targetUserId: userType === 'CLIENT' ? currentDentist.id : undefined,
      title: 'Caso Excluído',
      message: `A solicitação do paciente ${targetCase.patientName} (${targetCase.caseCode}) foi excluída com sucesso.`,
      type: 'INFO'
    });
  };

  // Gestão da Equipe de Administradores
  const handleAddAdmin = (newAdmin: AdminUser) => {
    setAdmins(prev => [...prev, newAdmin]);
    saveAdminToFirestore(newAdmin);
  };

  const handleRemoveAdmin = (adminId: string) => {
    if (adminId === 'admin-01') {
      alert('Não é possível remover o Administrador Principal (Lamartine Cezar).');
      return;
    }
    setAdmins(prev => prev.filter(a => a.id !== adminId));
  };

  // Sucesso na autenticação (Login ou Cadastro com Nome e Telefone)
  const handleAuthSuccess = (email: string, name?: string, phone?: string) => {
    setFirebaseUser({ email, displayName: name });
    setViewMode('DASHBOARD');
    localStorage.setItem('implantprecision_view_mode', 'DASHBOARD');

    const emailLower = email.toLowerCase();
    const isAdmin = emailLower === 'lamartinecezar3@gmail.com' || emailLower === 'ricardo@implantprecision.com.br';

    if (isAdmin) {
      setUserType('ADMIN');
      const activeName = name || 'Lamartine Cezar';
      const adminObj: AdminUser = {
        id: 'admin-01',
        name: activeName,
        email,
        role: 'SUPER_ADMIN',
        roleTitle: 'Administrador Geral',
        active: true,
        createdAt: '2026-01-01T08:00:00Z'
      };
      setCurrentAdmin(adminObj);
      saveAdminToFirestore(adminObj);
    } else {
      setUserType('CLIENT');
      const existing = dentists.find(d => d.email.toLowerCase() === emailLower);
      if (existing) {
        const updated: Dentist = {
          ...existing,
          name: name || existing.name,
          phone: phone || existing.phone
        };
        setDentists(prev => prev.map(d => d.id === existing.id ? updated : d));
        setCurrentDentist(updated);
        saveDentistToFirestore(updated);
      } else {
        const newDentist: Dentist = {
          id: `dentist-${Date.now()}`,
          name: name || 'Dr(a). Dentista Parceiro',
          email,
          phone: phone || '',
          cro: 'Aguardando CRO',
          clinicName: 'Consultório Odontológico',
          casesCount: 0,
          totalSpent: 0
        };
        setDentists(prev => [newDentist, ...prev]);
        setCurrentDentist(newDentist);
        saveDentistToFirestore(newDentist);
      }
    }
  };

  // Salvar alterações no perfil do Administrador (Firebase Auth + Firestore)
  const handleSaveAdminProfile = async (updated: Partial<AdminUser>) => {
    if (updated.name) {
      try {
        await updateCurrentUserProfile(updated.name);
      } catch (err) {
        console.warn('Não foi possível atualizar Auth displayName diretamente:', err);
      }
      setFirebaseUser(prev => prev ? { ...prev, displayName: updated.name } : prev);
    }
    const newAdmin: AdminUser = {
      ...currentAdmin,
      ...updated
    };
    setCurrentAdmin(newAdmin);
    setAdmins(prev => prev.map(a => a.id === newAdmin.id ? newAdmin : a));
    await saveAdminToFirestore(newAdmin);
  };

  // Salvar alterações no perfil do Dentista Parceiro (Firebase Auth + Firestore)
  const handleSaveDentistProfile = async (updated: Partial<Dentist>) => {
    if (updated.name) {
      try {
        await updateCurrentUserProfile(updated.name);
      } catch (err) {
        console.warn('Não foi possível atualizar Auth displayName diretamente:', err);
      }
      setFirebaseUser(prev => prev ? { ...prev, displayName: updated.name } : prev);
    }
    const newDentist: Dentist = {
      ...currentDentist,
      ...updated
    };
    setCurrentDentist(newDentist);
    setDentists(prev => prev.map(d => d.id === newDentist.id ? newDentist : d));
    await saveDentistToFirestore(newDentist);
  };

  // Deslogar do Firebase e redirecionar imediatamente para a página inicial (Landing Page)
  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.error('Erro ao sair da conta:', e);
    }
    setFirebaseUser(null);
    setViewMode('LANDING');
    localStorage.setItem('implantprecision_view_mode', 'LANDING');
  };

  const pendingCount = displayedCases.filter(c => c.status === 'PENDING_APPROVAL').length;

  // Se estiver no modo Landing Page (Site Institucional 3D estilo Lusion.co)
  if (viewMode === 'LANDING') {
    return (
      <>
        <LandingPage
          onEnterApp={() => setViewMode('DASHBOARD')}
          onOpenAuthModal={() => setIsAuthModalOpen(true)}
          firebaseUser={firebaseUser}
          onLogout={handleLogout}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={handleAuthSuccess}
        />
      </>
    );
  }

  // Modo Plataforma / Sistema Operacional Odontológico (Dashboard)
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      
      {/* Top Navigation */}
      <Header
        userType={userType}
        currentAdmin={currentAdmin}
        currentDentist={currentDentist}
        admins={admins}
        dentists={dentists}
        onSelectAdmin={handleSelectAdmin}
        onSelectDentist={handleSelectDentist}
        onToggleUserType={handleToggleUserType}
        canSwitchRole={canSwitchRole}
        onOpenNewCase={() => setIsNewCaseOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
        firebaseUser={firebaseUser}
        onLogout={handleLogout}
        onBackToLanding={() => {
          setViewMode('LANDING');
          localStorage.setItem('implantprecision_view_mode', 'LANDING');
        }}
        notifications={notifications.filter(n => {
          if (userType === 'ADMIN') return n.targetUserType === 'ADMIN';
          return n.targetUserType === 'CLIENT' && (
            !n.targetUserId || 
            n.targetUserId === currentDentist.id || 
            (Boolean(n.targetUserEmail) && Boolean(currentDentist.email) && n.targetUserEmail!.toLowerCase() === currentDentist.email.toLowerCase())
          );
        })}
        onMarkAllNotificationsAsRead={handleMarkAllNotificationsAsRead}
        onSelectNotification={handleSelectNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Banner de Contexto da Sessão */}
        <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              {userType === 'ADMIN' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  Painel Administrativo • {currentAdmin.name}
                </span>
              ) : (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-sans font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200">
                  Portal do Dentista • {currentDentist.name}
                </span>
              )}

              <span className="text-xs text-slate-500 font-medium">
                {userType === 'ADMIN' 
                  ? currentAdmin.roleTitle 
                  : currentDentist.clinicName}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {userType === 'ADMIN'
                ? 'Painel de Controle Clínico & Gestão Financeira'
                : 'Seus Casos Cirúrgicos & Liberação de Guias'}
            </h1>
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            {pendingCount > 0 && (
              <div className="px-3.5 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-sans font-medium flex items-center space-x-2 shadow-xs">
                <Lock className="w-3.5 h-3.5 text-amber-600" />
                <span>
                  {userType === 'ADMIN'
                    ? `${pendingCount} caso(s) aguardando PIX dos clientes`
                    : `${pendingCount} planejamento(s) pronto(s) para sua aprovação`}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Métricas Bento Grid (Totalmente adaptadas para cada papel) */}
        <StatsGrid 
          cases={displayedCases} 
          isDentistView={userType === 'CLIENT'}
          totalDentistsCount={dentists.length}
        />

        {/* Abas de Navegação */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
          {/* Aba de Casos */}
          <button
            onClick={() => setActiveTab('CASES')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'CASES'
                ? 'bg-white border border-slate-200 text-cyan-700 shadow-xs font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
            }`}
          >
            <FolderKanban className="w-4 h-4" />
            <span>
              {userType === 'ADMIN' 
                ? `Todos os Casos (${displayedCases.length})` 
                : `Meus Pacientes (${displayedCases.length})`}
            </span>
          </button>

          {/* Abas Exclusivas do Administrador */}
          {userType === 'ADMIN' && (
            <>
              <button
                onClick={() => setActiveTab('DENTISTS')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'DENTISTS'
                    ? 'bg-white border border-slate-200 text-cyan-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Users className="w-4 h-4" />
                <span>Dentistas Clientes ({dentists.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('TEAM')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'TEAM'
                    ? 'bg-white border border-slate-200 text-cyan-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Equipe & Administradores ({admins.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('CONFIG')}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-all whitespace-nowrap cursor-pointer ${
                  activeTab === 'CONFIG'
                    ? 'bg-white border border-slate-200 text-cyan-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Configurações & WhatsApp</span>
              </button>
            </>
          )}
        </div>

        {/* Conteúdo de acordo com a Aba Ativa */}
        {activeTab === 'CASES' && (
          <CaseList
            cases={displayedCases}
            dentists={dentists}
            onSelectCase={setSelectedCase}
            selectedDentistFilter={selectedDentistFilter}
            onFilterDentistChange={setSelectedDentistFilter}
            isDentistView={userType === 'CLIENT'}
            onDeleteCase={handleDeleteCase}
          />
        )}

        {activeTab === 'DENTISTS' && userType === 'ADMIN' && (
          <DentistsDirectory
            dentists={dentists}
            onSelectDentist={(dentistId) => {
              setSelectedDentistFilter(dentistId);
              setActiveTab('CASES');
            }}
          />
        )}

        {activeTab === 'TEAM' && userType === 'ADMIN' && (
          <TeamList
            admins={admins}
            onOpenNewAdminModal={() => setIsNewAdminModalOpen(true)}
            onRemoveAdmin={handleRemoveAdmin}
          />
        )}

        {activeTab === 'CONFIG' && userType === 'ADMIN' && (
          <SettingsTab
            onNotifyFeedback={(title, msg) => {
              addNotification({
                targetUserType: 'ADMIN',
                title,
                message: msg,
                type: 'INFO'
              });
            }}
          />
        )}


      </main>

      {/* Modal de Detalhes do Caso com 3D Viewer e Paywall */}
      <CaseDetailsModal
        isOpen={Boolean(selectedCase)}
        onClose={() => setSelectedCase(null)}
        caseItem={selectedCase}
        onPaymentSuccess={handlePaymentSuccess}
        userType={userType}
        onAcceptCase={handleAcceptCase}
        onDeleteCase={handleDeleteCase}
        onDeliverPlanning={handleDeliverPlanning}
      />

      {/* Modal de Cadastro de Novo Caso */}
      <NewCaseModal
        isOpen={isNewCaseOpen}
        onClose={() => setIsNewCaseOpen(false)}
        dentists={dentists}
        onCreateCase={handleCreateCase}
        userType={userType}
        currentDentistId={currentDentist.id}
      />

      {/* Modal de Cadastro de Novo Administrador */}
      <NewAdminModal
        isOpen={isNewAdminModalOpen}
        onClose={() => setIsNewAdminModalOpen(false)}
        onAddAdmin={handleAddAdmin}
      />

      {/* Modal de Login / Autenticação com Firebase */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />

      {/* Modal de Meu Perfil (Editar Informações do Usuário) */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        userType={userType}
        currentAdmin={currentAdmin}
        currentDentist={currentDentist}
        firebaseUser={firebaseUser}
        onSaveAdminProfile={handleSaveAdminProfile}
        onSaveDentistProfile={handleSaveDentistProfile}
      />

      {/* Footer */}
      <footer className="border-t border-slate-200 py-5 mt-12 bg-white/80">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-slate-500 font-sans flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Implant Precision 3D • Sistema Odontológico de Alta Precisão</span>
          <span className="text-cyan-700 font-semibold">
            {userType === 'ADMIN' ? 'Painel do Administrador Geral' : 'Portal do Cliente'}
          </span>
        </div>
      </footer>

    </div>
  );
}

export default App;
