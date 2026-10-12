import { DentalCase, Dentist, AdminUser } from '../types';

/**
 * Administrador Principal Oficial do Projeto (Lamartine Cezar)
 */
export const INITIAL_ADMINS: AdminUser[] = [
  {
    id: 'admin-01',
    name: 'Lamartine Cezar',
    email: 'lamartinecezar3@gmail.com',
    role: 'SUPER_ADMIN',
    roleTitle: 'Administrador Geral',
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'admin-ricardo-gmail',
    name: 'Ricardo Campos',
    email: 'ricardo79nc@gmail.com',
    role: 'SUPER_ADMIN',
    roleTitle: 'Administrador Geral',
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'admin-ricardo-hotmail',
    name: 'Ricardo Campos',
    email: 'ricardo_ncampos@hotmail.com',
    role: 'SUPER_ADMIN',
    roleTitle: 'Administrador Geral',
    active: true,
    createdAt: '2026-01-01T08:00:00Z',
  }
];

/**
 * Base de Dentistas Parceiros Inicial (Limpa para início de testes reais no Firebase)
 */
export const INITIAL_DENTISTS: Dentist[] = [];

/**
 * Base de Casos Clínicos Inicial (Limpa para início de testes reais no Firebase)
 */
export const INITIAL_CASES: DentalCase[] = [];
