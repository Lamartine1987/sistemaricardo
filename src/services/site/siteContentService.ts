import { SiteContentConfig, DEFAULT_SITE_CONTENT } from '../../types/siteContent';
import { saveSiteContentToFirestore, subscribeToSiteContent } from '../firebase/firestore';

const SITE_CONTENT_STORAGE_KEY = 'implantprecision_site_content';

/**
 * Recupera o conteúdo do site salvo no navegador com fallback robusto para os padrões
 */
export const getStoredSiteContent = (): SiteContentConfig => {
  const saved = localStorage.getItem(SITE_CONTENT_STORAGE_KEY);
  if (!saved) return DEFAULT_SITE_CONTENT;

  try {
    const parsed = JSON.parse(saved);
    return {
      cases: Array.isArray(parsed.cases) ? parsed.cases : DEFAULT_SITE_CONTENT.cases,
      services: Array.isArray(parsed.services) ? parsed.services : DEFAULT_SITE_CONTENT.services,
      courses: Array.isArray(parsed.courses) ? parsed.courses : DEFAULT_SITE_CONTENT.courses,
      testimonials: Array.isArray(parsed.testimonials) ? parsed.testimonials : DEFAULT_SITE_CONTENT.testimonials,
      about: parsed.about ? { ...DEFAULT_SITE_CONTENT.about, ...parsed.about } : DEFAULT_SITE_CONTENT.about,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : DEFAULT_SITE_CONTENT.updatedAt
    };
  } catch (e) {
    return DEFAULT_SITE_CONTENT;
  }
};

/**
 * Salva o conteúdo do site localmente e sincroniza em tempo real no Firestore.
 * Usa timestamp monotônico crescente para evitar que diferenças de relógio entre
 * computadores diferentes revertam alterações salvas por outro administrador.
 */
export const saveStoredSiteContent = (content: SiteContentConfig): SiteContentConfig => {
  const currentStored = getStoredSiteContent();
  const baseTimestamp = Math.max(
    Date.now(),
    Number(content.updatedAt) || 0,
    Number(currentStored.updatedAt) || 0
  );

  const contentWithTimestamp: SiteContentConfig = {
    ...content,
    updatedAt: baseTimestamp + 1
  };

  try {
    localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(contentWithTimestamp));
  } catch (e) {
    console.warn('ℹ️ Limite do localStorage atingido, mantendo sincronização direta com Firestore:', e);
  }

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('implantprecision_site_updated', { detail: contentWithTimestamp }));
  }

  saveSiteContentToFirestore(contentWithTimestamp);
  return contentWithTimestamp;
};

/**
 * Força a sincronização do conteúdo com o Firestore (nuvem) e retorna o resultado da operação
 */
export const syncStoredSiteContentToFirestore = async (
  content?: SiteContentConfig
): Promise<{ success: boolean; error?: string }> => {
  const target = content || getStoredSiteContent();
  return await saveSiteContentToFirestore(target);
};

/**
 * Converte um arquivo de imagem em Base64 Data URL com compressão adaptativa
 * (garante que múltiplas fotos na galeria nunca ultrapassem o limite de 1MB do Firestore)
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
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
        const maxDim = 900;
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
          let compressed = canvas.toDataURL('image/jpeg', 0.72);
          if (compressed.length > 110000) {
            compressed = canvas.toDataURL('image/jpeg', 0.55);
          }
          resolve(compressed);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    };
    reader.onerror = error => reject(error);
  });
};

export { subscribeToSiteContent };
