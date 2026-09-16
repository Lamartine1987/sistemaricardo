import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('Firebase não configurado');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    throw error;
  }
};

export const loginWithEmail = async (email: string, pass: string): Promise<FirebaseUser | null> => {
  if (!isFirebaseConfigured || !auth) return null;
  try {
    const result = await signInWithEmailAndPassword(auth, email, pass);
    return result.user;
  } catch (error: any) {
    console.error('Erro ao fazer login com e-mail:', error);
    throw error;
  }
};

export const registerWithEmail = async (
  email: string, 
  pass: string, 
  displayName?: string
): Promise<FirebaseUser | null> => {
  if (!isFirebaseConfigured || !auth) return null;
  try {
    const result = await createUserWithEmailAndPassword(auth, email, pass);
    if (result.user && displayName) {
      await updateProfile(result.user, { displayName });
    }
    return result.user;
  } catch (error: any) {
    console.error('Erro ao registrar com e-mail:', error);
    throw error;
  }
};

export const logoutFirebase = async (): Promise<void> => {
  if (!auth) return;
  await signOut(auth);
};

export const subscribeToAuth = (callback: (user: FirebaseUser | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

export const updateCurrentUserProfile = async (displayName: string): Promise<void> => {
  if (!isFirebaseConfigured || !auth?.currentUser) return;
  try {
    await updateProfile(auth.currentUser, { displayName });
  } catch (error) {
    console.error('Erro ao atualizar perfil no Firebase Auth:', error);
    throw error;
  }
};

