import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Users, Sparkles, Clock } from 'lucide-react';

interface NavItem {
  label: string;
  path: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const navItems: NavItem[] = [
  { label: 'Home', path: '/dashboard', icon: Home },
  { label: 'Map', path: '/map', icon: Map },
  { label: 'Contacts', path: '/contacts', icon: Users },
  { label: 'History', path: '/history', icon: Clock },
  { label: 'Priya AI', path: '/ai-agent', icon: Sparkles },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
      <div className="max-w-lg mx-auto flex items-center justify-around py-1.5 px-2">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          const isAI = path === '/ai-agent';
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-btn flex-1 py-1 relative ${active ? (isAI ? 'text-purple-600' : 'text-pink-600') : 'text-gray-500 hover:text-gray-700'}`}
            >
              {isAI ? (
                <div className={`relative inline-flex ${active ? '' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${active ? 'bg-purple-100' : 'bg-gray-100'}`}>
                    <Icon size={18} className={active ? 'text-purple-600' : 'text-gray-400'} />
                  </div>
                  {/* AI badge */}
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full border border-white flex items-center justify-center">
                    <span className="text-white" style={{ fontSize: '5px', fontWeight: 900 }}>AI</span>
                  </span>
                </div>
              ) : (
                <Icon size={22} className={active ? 'text-pink-600' : 'text-gray-400'} />
              )}
              <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
