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
      cases: Array.isArray(parsed.cases) && parsed.cases.length > 0 ? parsed.cases : DEFAULT_SITE_CONTENT.cases,
      services: Array.isArray(parsed.services) && parsed.services.length > 0 ? parsed.services : DEFAULT_SITE_CONTENT.services,
      courses: Array.isArray(parsed.courses) && parsed.courses.length > 0 ? parsed.courses : DEFAULT_SITE_CONTENT.courses,
      testimonials: Array.isArray(parsed.testimonials) && parsed.testimonials.length > 0 ? parsed.testimonials : DEFAULT_SITE_CONTENT.testimonials,
      about: parsed.about ? { ...DEFAULT_SITE_CONTENT.about, ...parsed.about } : DEFAULT_SITE_CONTENT.about
    };
  } catch (e) {
    return DEFAULT_SITE_CONTENT;
  }
};

/**
 * Salva o conteúdo do site localmente e sincroniza em tempo real no Firestore
 */
export const saveStoredSiteContent = (content: SiteContentConfig) => {
  try {
    localStorage.setItem(SITE_CONTENT_STORAGE_KEY, JSON.stringify(content));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('implantprecision_site_updated', { detail: content }));
    }
    saveSiteContentToFirestore(content);
  } catch (e) {
    console.warn('ℹ️ Erro ao persistir conteúdo do site:', e);
  }
};

/**
 * Converte um arquivo de imagem em Base64 Data URL para salvar diretamente no conteúdo
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};

export { subscribeToSiteContent };
