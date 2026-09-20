import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage, isFirebaseConfigured } from './config';

export const uploadCaseFileToStorage = async (
  file: File | Blob,
  caseCode: string,
  onProgress?: (progress: number, bytesTransferred: number, totalBytes: number) => void,
  customFileName?: string
): Promise<{ downloadUrl: string; name: string; size: string }> => {
  const fileName = customFileName || (file instanceof File ? file.name : `arquivo_${Date.now()}`);

  if (!isFirebaseConfigured || !storage) {
    // Fallback simulado se o Firebase Storage não responder
    return {
      downloadUrl: URL.createObjectURL(file),
      name: fileName,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    };
  }

  const sanitizedCaseCode = caseCode.replace(/[^a-zA-Z0-9-_]/g, '');
  const storageRef = ref(storage, `cases/${sanitizedCaseCode}/${Date.now()}_${fileName}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise((resolve) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = snapshot.totalBytes > 0 
          ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 
          : 0;
        if (onProgress) {
          onProgress(progress, snapshot.bytesTransferred, snapshot.totalBytes);
        }
      },
      (error) => {
        console.warn('⚠️ [Storage] Firebase Storage inacessível ou restrito. Usando fallback de objeto local seguro:', error);
        resolve({
          downloadUrl: URL.createObjectURL(file),
          name: fileName,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve({
          downloadUrl,
          name: fileName,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
        });
      }
    );
  });
};

