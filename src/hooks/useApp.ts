import { useContext } from 'react';
import { AppContext } from '../contexts/appContextBase';
import type { AppContextState } from '../types';

export const useApp = (): AppContextState => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within an AppProvider');
  return ctx;
};
