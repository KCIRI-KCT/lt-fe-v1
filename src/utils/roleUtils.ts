import type { UserRole } from '../types';

/**
 * Normalizes user role / designation string to standard UserRole values:
 * 'admin' | 'project_manager' | 'site_supervisor' | 'site_engineer' | 'safety_manager' | 'safety_officer'
 */
export const normalizeRole = (roleStr?: string, designationStr?: string): UserRole => {
  const clean = `${roleStr || ''} ${designationStr || ''}`.toLowerCase().replace(/[\s_-]+/g, '');
  if (clean.includes('admin')) return 'admin';
  if (clean.includes('projectmanager') || clean.includes('projectdirector')) return 'project_manager';
  if (clean.includes('sitesupervisor') || clean.includes('supervisor')) return 'site_supervisor';
  if (clean.includes('safetymanager')) return 'safety_manager';
  if (clean.includes('safetyofficer') || clean.includes('safetyengineer') || clean.includes('safety')) return 'safety_officer';
  if (clean.includes('siteengineer') || clean.includes('engineer')) return 'site_engineer';
  return 'site_engineer';
};
