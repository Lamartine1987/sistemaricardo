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

/**
 * Faz upload de imagem para o Firebase Storage para uso no CMS do site (casos, capa, serviços)
 * Retorna URL pública persistente do Firebase Storage (evita atingir o limite de 1MB do Firestore com Base64)
 */
export const uploadSiteImageToStorage = async (
  file: File,
  folder: string = 'site/cases',
  onProgress?: (progress: number) => void
): Promise<string> => {
  if (isFirebaseConfigured && storage) {
    try {
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-_]/g, '_');
      const storageRef = ref(storage, `${folder}/${Date.now()}_${sanitizedName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      return await new Promise<string>((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const pct = snapshot.totalBytes > 0 ? (snapshot.bytesTransferred / snapshot.totalBytes) * 100 : 0;
            if (onProgress) onProgress(pct);
          },
          (err) => {
            console.warn('⚠️ [Storage] Upload de imagem falhou no Firebase Storage, recorrendo ao fallback:', err);
            reject(err);
          },
          async () => {
            const url = await getDownloadURL(uploadTask.snapshot.ref);
            resolve(url);
          }
        );
      });
    } catch (err) {
      console.warn('⚠️ [Storage] Usando fallback adaptativo para imagem:', err);
    }
  }

  // Fallback seguro usando Data URL comprimido
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        resolve('');
        return;
      }
      const img = new Image();
      img.onload = () => {
        const maxDim = 800;
        let width = img.width;
        let height = img.height;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.65));
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = () => resolve('');
  });
};

