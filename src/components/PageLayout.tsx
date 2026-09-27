import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BottomNav } from './BottomNav';

interface PageLayoutProps {
  title: string;
  children: ReactNode;
  showBack?: boolean;
  showNav?: boolean;
  headerRight?: ReactNode;
  className?: string;
  headerBg?: string;
}

export function PageLayout({
  title,
  children,
  showBack = false,
  showNav = true,
  headerRight,
  className = '',
  headerBg = 'bg-white',
}: PageLayoutProps) {
  const navigate = useNavigate();

  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col max-w-lg mx-auto ${className}`}>
      {/* Header */}
      <header className={`${headerBg} border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-30`}>
        {showBack && (
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft size={20} className="text-gray-700" />
          </button>
        )}
        <h1 className="flex-1 text-lg font-bold text-gray-900">{title}</h1>
        {headerRight}
      </header>

      {/* Content */}
      <main className={`flex-1 overflow-y-auto ${showNav ? 'pb-20' : ''}`}>
        {children}
      </main>

      {showNav && <BottomNav />}
    </div>
  );
}
