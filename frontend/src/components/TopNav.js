import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../App';

export default function TopNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const loc = useLocation();

  const titles = { '/':'Dashboard', '/sos':'SOS', '/contacts':'Contacts', '/reports':'Reports', '/profile':'Profile' };
  const title = titles[loc.pathname] || 'SafeGuard';

  return (
    <nav className="topnav">
      <span className="topnav-title">🛡️ {title}</span>
      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
        {user && (
          <span style={{ fontSize:'0.8rem', color:'var(--muted)' }}>
            {user.name?.split(' ')[0]}
          </span>
        )}
        <button className="btn btn-ghost" style={{ padding:'6px 12px', fontSize:'0.8rem' }}
          onClick={() => { logout(); navigate('/login'); }}>
          Logout
        </button>
      </div>
    </nav>
  );
}
