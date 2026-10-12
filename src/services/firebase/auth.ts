import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  fetchSignInMethodsForEmail,
  getAdditionalUserInfo,
  updateProfile,
  signOut, 
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from './config';

const googleProvider = new GoogleAuthProvider();

export interface GoogleAuthResult {
  user: FirebaseUser;
  isNewUser: boolean;
}

export const loginWithGoogle = async (): Promise<FirebaseUser | null> => {
  const res = await loginWithGoogleDetailed();
  return res ? res.user : null;
};

export const loginWithGoogleDetailed = async (): Promise<GoogleAuthResult | null> => {
  if (!isFirebaseConfigured || !auth) {
    console.warn('Firebase não configurado');
    return null;
  }
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const info = getAdditionalUserInfo(result);
    return {
      user: result.user,
      isNewUser: Boolean(info?.isNewUser)
    };
  } catch (error: any) {
    console.error('Erro ao fazer login com Google:', error);
    throw error;
  }
};

export const checkEmailExistsInFirebaseAuth = async (email: string): Promise<boolean> => {
  if (!isFirebaseConfigured || !auth) return false;
  try {
    const methods = await fetchSignInMethodsForEmail(auth, email.trim());
    return Array.isArray(methods) && methods.length > 0;
  } catch {
    return false;
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

export const sendPasswordReset = async (email: string): Promise<void> => {
  if (!isFirebaseConfigured || !auth) return;
  try {
    await sendPasswordResetEmail(auth, email.trim());
  } catch (error: any) {
    console.error('Erro ao enviar e-mail de recuperação de senha:', error);
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

