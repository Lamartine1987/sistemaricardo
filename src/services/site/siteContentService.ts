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
      cases: Array.isArray(parsed.cases) && parsed.cases.length > 0
        ? parsed.cases.map((c: any) => {
            const def = DEFAULT_SITE_CONTENT.cases.find(d => d.id === c.id);
            return def ? { ...def, ...c } : c;
          })
        : DEFAULT_SITE_CONTENT.cases,
      services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_SITE_CONTENT.services,
      courses: Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : DEFAULT_SITE_CONTENT.courses,
      testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_SITE_CONTENT.testimonials,
      about: parsed.about ? { ...DEFAULT_SITE_CONTENT.about, ...parsed.about } : DEFAULT_SITE_CONTENT.about,
      updatedAt: typeof parsed.updatedAt === 'number' ? parsed.updatedAt : DEFAULT_SITE_CONTENT.updatedAt
    };
  } catch (e) {
    return DEFAULT_SITE_CONTENT;
  }
};

/**
 * Salva o conteúdo do site localmente e sincroniza em tempo real no Firestore
 */
export const saveStoredSiteContent = (content: SiteContentConfig): SiteContentConfig => {
  try {
    const contentWithTimestamp: SiteContentConfig = {
      ...content,
      updatedAt: Date.now()
    };
    localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(contentWithTimestamp));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('implantprecision_site_updated', { detail: contentWithTimestamp }));
    }
    saveSiteContentToFirestore(contentWithTimestamp);
    return contentWithTimestamp;
  } catch (e) {
    console.warn('ℹ️ Erro ao persistir conteúdo do site:', e);
    return content;
  }
};

/**
 * Converte um arquivo de imagem em Base64 Data URL com compressão inteligente
 * (limita a 1200px máx e comprime em JPEG 0.8 para economizar storage e acelerar o site)
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
        const maxDim = 1200;
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
          resolve(canvas.toDataURL('image/jpeg', 0.82));
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
