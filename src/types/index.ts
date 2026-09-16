export type CaseStatus = 
  | 'ANALYSIS' // Em Análise
  | 'PENDING_APPROVAL' // Planejamento Pronto (Aguardando Aprovação e Pagamento)
  | 'APPROVED_PAID' // Aprovado e Pago (Arquivos Liberados)
  | 'IN_PRODUCTION' // Guia em Impressão 3D
  | 'COMPLETED'; // Concluído / Enviado

export type PriorityLevel = 'NORMAL' | 'URGENT';

export type SurgicalGuideType = 'DENTO_SUPORTADA' | 'MUCO_SUPORTADA' | 'OSSEO_SUPORTADA';

export type AdminRole = 'SUPER_ADMIN' | 'CAD_PLANNER' | 'OPERATOR';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  roleTitle: string;
  active: boolean;
  createdAt: string;
}

export type UserType = 'ADMIN' | 'CLIENT';

export interface Dentist {
  id: string;
  name: string;
  cro: string; // Conselho Regional de Odontologia
  clinicName: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  casesCount: number;
  totalSpent: number;
}

export interface ImplantSite {
  toothNumber: number; // FDI standard (ex: 16, 21, 36, 46)
  implantBrand: string; // Ex: Neodent, Straumann, SIN
  implantDiameter: number; // Ex: 3.75mm
  implantLength: number; // Ex: 11.5mm
  boneDensity?: string; // D1, D2, D3, D4
}

export interface CaseFile {
  id: string;
  name: string;
  type: 'SCAN_PRE' | 'SCAN_OPP' | 'BITE' | 'TOMOGRAPHY' | 'GUIDE_STL' | 'REPORT_PDF';
  size: string;
  uploadedAt: string;
  downloadUrl: string;
  isLocked: boolean; // Locked behind Paywall until APPROVED_PAID
}

export interface PaymentDetails {
  id: string;
  amount: number; // Ex: 280.00 BRL
  pixCode: string;
  pixQrCodeUrl: string;
  status: 'PENDING' | 'PAID' | 'REFUNDED';
  paidAt?: string;
  receiptUrl?: string;
}

export interface DentalCase {
  id: string;
  caseCode: string; // Ex: #IMP-2026-089
  patientName: string;
  patientIdentifier: string; // ID interno ou iniciais
  dentistId: string;
  dentistName: string;
  dentistCro: string;
  dentistPhone: string;
  status: CaseStatus;
  priority: PriorityLevel;
  createdAt: string;
  dueDate: string;
  implantSites: ImplantSite[];
  surgicalGuideType: 'DENTO_SUPORTADA' | 'MUCO_SUPORTADA' | 'OSSEO_SUPORTADA';
  notes?: string;
  clinicalPreviewVideoUrl?: string;
  files: CaseFile[];
  payment: PaymentDetails;
  model3DUrl?: string;
}

export interface ViewerLayers {
  showJaw: boolean;
  showImplants: boolean;
  showGuide: boolean;
  showNerves: boolean;
  jawTransparency: number; // 0 (solid) to 1 (invisible)
  guideTransparency: number;
  wireframe: boolean;
}
