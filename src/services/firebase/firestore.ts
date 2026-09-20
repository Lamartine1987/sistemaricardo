import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  onSnapshot, 
  getDocs 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './config';
import { DentalCase, Dentist, AdminUser } from '../../types';
import { AppNotification } from '../../types/notifications';

// Coleções no Firestore
const CASES_COLLECTION = 'cases';
const DENTISTS_COLLECTION = 'dentists';
const ADMINS_COLLECTION = 'admins';
const NOTIFICATIONS_COLLECTION = 'notifications';

/**
 * Popula o Firestore com dados iniciais se as coleções estiverem vazias
 */
export const seedInitialDataIfEmpty = async (
  initialCases: DentalCase[],
  initialDentists: Dentist[],
  initialAdmins: AdminUser[]
) => {
  if (!isFirebaseConfigured || !db) return;

  try {
    const casesSnapshot = await getDocs(collection(db, CASES_COLLECTION));
    if (casesSnapshot.empty) {
      console.log('🌱 [Firestore] Populando casos iniciais...');
      for (const item of initialCases) {
        await setDoc(doc(db, CASES_COLLECTION, item.id), item);
      }
    }

    const dentistsSnapshot = await getDocs(collection(db, DENTISTS_COLLECTION));
    if (dentistsSnapshot.empty) {
      console.log('🌱 [Firestore] Populando dentistas parceiros...');
      for (const item of initialDentists) {
        await setDoc(doc(db, DENTISTS_COLLECTION, item.id), item);
      }
    }

    const adminsSnapshot = await getDocs(collection(db, ADMINS_COLLECTION));
    if (adminsSnapshot.empty) {
      console.log('🌱 [Firestore] Populando administradores da equipe...');
      for (const item of initialAdmins) {
        await setDoc(doc(db, ADMINS_COLLECTION, item.id), item);
      }
    }
  } catch (error) {
    console.warn('ℹ️ [Firestore] Verifique as regras de segurança no Console do Firebase se houver restrição de leitura:', error);
  }
};

/**
 * Listener em tempo real para os casos
 */
export const subscribeToCases = (callback: (cases: DentalCase[]) => void) => {
  if (!isFirebaseConfigured || !db) return () => {};

  return onSnapshot(
    collection(db, CASES_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs
        .map(d => d.data() as DentalCase)
        .sort((a, b) => {
          const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          if (!isNaN(timeA) && !isNaN(timeB) && timeB !== timeA) {
            return timeB - timeA;
          }
          return (b.id || '').localeCompare(a.id || '');
        });

      if (items.length > 0) {
        callback(items);
      }
    },
    (error) => {
      console.warn('⚠️ [Firestore] Erro ao sincronizar casos (verifique as regras de segurança):', error);
    }
  );
};

/**
 * Listener em tempo real para dentistas parceiros
 */
export const subscribeToDentists = (callback: (dentists: Dentist[]) => void) => {
  if (!isFirebaseConfigured || !db) return () => {};

  return onSnapshot(
    collection(db, DENTISTS_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as Dentist);
      if (items.length > 0) {
        callback(items);
      }
    },
    (error) => {
      console.warn('⚠️ [Firestore] Erro ao sincronizar dentistas:', error);
    }
  );
};

/**
 * Listener em tempo real para administradores
 */
export const subscribeToAdmins = (callback: (admins: AdminUser[]) => void) => {
  if (!isFirebaseConfigured || !db) return () => {};

  return onSnapshot(
    collection(db, ADMINS_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as AdminUser);
      if (items.length > 0) {
        callback(items);
      }
    },
    (error) => {
      console.warn('⚠️ [Firestore] Erro ao sincronizar administradores:', error);
    }
  );
};

/**
 * Salva ou atualiza um caso no Firestore
 */
export const saveCaseToFirestore = async (caseItem: DentalCase) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, CASES_COLLECTION, caseItem.id), caseItem, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar caso no Firestore:', error);
  }
};

/**
 * Atualiza status e desbloqueio de pagamento de um caso no Firestore
 */
export const updateCasePaymentInFirestore = async (caseId: string, amount: number, dentistId: string) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    const caseRef = doc(db, CASES_COLLECTION, caseId);
    await updateDoc(caseRef, {
      status: 'APPROVED_PAID',
      'payment.status': 'PAID',
      'payment.paidAt': new Date().toISOString(),
      'payment.receiptUrl': `#recibo-${caseId}`
    });
  } catch (error) {
    console.error('Erro ao atualizar pagamento no Firestore:', error);
  }
};

/**
 * Salva novo administrador no Firestore
 */
export const saveAdminToFirestore = async (admin: AdminUser) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, ADMINS_COLLECTION, admin.id), admin, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar administrador no Firestore:', error);
  }
};

/**
 * Salva ou atualiza dentista parceiro no Firestore
 */
export const saveDentistToFirestore = async (dentist: Dentist) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, DENTISTS_COLLECTION, dentist.id), dentist, { merge: true });
  } catch (error) {
    console.error('Erro ao salvar dentista parceiro no Firestore:', error);
  }
};

/**
 * Exclui um caso do Firestore
 */
export const deleteCaseFromFirestore = async (caseId: string) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await deleteDoc(doc(db, CASES_COLLECTION, caseId));
  } catch (error) {
    console.error('Erro ao excluir caso do Firestore:', error);
  }
};

/**
 * Listener em tempo real para notificações
 */
export const subscribeToNotifications = (callback: (notifications: AppNotification[]) => void) => {
  if (!isFirebaseConfigured || !db) return () => {};

  return onSnapshot(
    collection(db, NOTIFICATIONS_COLLECTION),
    (snapshot) => {
      const items = snapshot.docs.map(d => d.data() as AppNotification);
      // Ordenar por data decrescente
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(items);
    },
    (error) => {
      console.warn('⚠️ [Firestore] Erro ao sincronizar notificações:', error);
    }
  );
};

/**
 * Salva uma nova notificação no Firestore
 */
export const saveNotificationToFirestore = async (notification: AppNotification) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, NOTIFICATIONS_COLLECTION, notification.id), notification);
  } catch (error) {
    console.error('Erro ao salvar notificação no Firestore:', error);
  }
};

/**
 * Marca uma notificação como lida no Firestore
 */
export const markNotificationReadInFirestore = async (notificationId: string) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notificationId), { read: true });
  } catch (error) {
    console.error('Erro ao atualizar notificação no Firestore:', error);
  }
};

/**
 * Marca todas notificações como lidas no Firestore
 */
export const markAllNotificationsReadInFirestore = async (notifications: AppNotification[]) => {
  if (!isFirebaseConfigured || !db) return;
  try {
    for (const notif of notifications) {
      if (!notif.read) {
        await updateDoc(doc(db, NOTIFICATIONS_COLLECTION, notif.id), { read: true });
      }
    }
  } catch (error) {
    console.error('Erro ao marcar notificações como lidas no Firestore:', error);
  }
};


