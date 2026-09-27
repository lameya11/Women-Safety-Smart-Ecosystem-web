import { useNavigate, useLocation } from 'react-router-dom';
import { Home, Map, Users, Clock, User } from 'lucide-react';

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
  { label: 'Profile', path: '/settings', icon: User },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 safe-area-bottom">
      <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-2">
        {navItems.map(({ label, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              onClick={() => navigate(path)}
              className={`nav-btn flex-1 py-1 ${active ? 'text-pink-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Icon size={22} className={active ? 'text-pink-600' : 'text-gray-400'} />
              <span className={`text-xs ${active ? 'font-semibold' : ''}`}>{label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
