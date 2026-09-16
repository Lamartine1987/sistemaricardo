import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export const uploadCaseFileToStorage = async (
  file: File,
  caseCode: string,
  onProgress?: (progress: number) => void
): Promise<{ downloadUrl: string; name: string; size: string }> => {
  if (!isFirebaseConfigured || !storage) {
    // Fallback simulado se o Firebase Storage não responder
    return {
      downloadUrl: URL.createObjectURL(file),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
  }

  const sanitizedCaseCode = caseCode.replace(/[^a-zA-Z0-9-_]/g, '');
  const storageRef = ref(storage, `cases/${sanitizedCaseCode}/${Date.now()}_${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        console.warn('⚠️ [Storage] Firebase Storage inacessível ou restrito. Usando fallback de objeto local seguro:', error);
        resolve({
          downloadUrl: URL.createObjectURL(file),
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      }
    );
  });
};
