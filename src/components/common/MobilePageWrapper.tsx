import type { ReactNode } from 'react';

interface MobilePageWrapperProps {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * MobilePageWrapper - Reusable wrapper for consistent mobile and desktop padding
 *
 * Provides responsive padding:
 * - Mobile (xs-sm): px-3 py-3
 * - Tablet (md): px-md-4 py-3
 * - Desktop (lg+): px-lg-4 py-4
 *
 * Usage:
 * <MobilePageWrapper>
 *   <YourPageContent />
 * </MobilePageWrapper>
 */
export const MobilePageWrapper = ({ children, className = '', style }: MobilePageWrapperProps) => {
  return (
    <div
      className={`container-fluid px-3 px-md-4 px-lg-4 py-3 py-lg-4 ${className}`}
      style={{
        minHeight: 'calc(100vh - 72px)',
        background: 'var(--admin-bg, #f5f7fb)',
        fontFamily: '"Inter", "Segoe UI", sans-serif',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default MobilePageWrapper;