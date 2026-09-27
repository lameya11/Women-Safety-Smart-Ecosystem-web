import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, MapPin, Smartphone, Moon, Shield, HelpCircle, Info, LogOut, User, ChevronRight, Trash2 } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useSafety } from '../context/SafetyContext';
import { storage } from '../utils/storage';

interface ToggleProps {
  value: boolean;
  onChange: (v: boolean) => void;
}
function Toggle({ value, onChange }: ToggleProps) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-12 h-6 rounded-full transition-all duration-200 relative ${value ? 'bg-pink-500' : 'bg-gray-300'}`}
      role="switch"
      aria-checked={value}
    >
      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-all duration-200 ${value ? 'left-6' : 'left-0.5'}`} />
    </button>
  );
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout, updateUser, settings, updateSettings } = useAuth();
  const { contacts, alerts } = useSafety();
  const [editName, setEditName] = useState(false);
  const [nameValue, setNameValue] = useState(user?.name ?? '');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveName = () => {
    if (nameValue.trim()) { updateUser({ name: nameValue.trim() }); }
    setEditName(false);
  };

  const handleLogout = () => { logout(); navigate('/', { replace: true }); };

  const handleDeleteAccount = () => {
    // Remove user data from storage
    if (user) {
      storage.remove(`contacts_${user.id}`);
      storage.remove(`alerts_${user.id}`);
      storage.remove(`travel_${user.id}`);
      const users = storage.get<{id:string;email:string}[]>('registered_users', []);
      storage.set('registered_users', users.filter(u => u.id !== user.id));
      const passwords = storage.get<Record<string,string>>('passwords', {});
      delete passwords[user.id];
      storage.set('passwords', passwords);
    }
    logout();
    navigate('/', { replace: true });
  };

  const sections = [
    {
      title: 'Notifications',
      items: [
        {
          label: 'Push Notifications',
          desc: 'Requires browser permission',
          icon: Bell,
          control: <Toggle value={settings.notifications} onChange={v => updateSettings({ notifications: v })} />,
        },
      ],
    },
    {
      title: 'Permissions',
      items: [
        {
          label: 'Location Access',
          desc: settings.locationSharing ? 'Location sharing enabled' : 'Not enabled — check browser settings',
          icon: MapPin,
          control: <Toggle value={settings.locationSharing} onChange={v => updateSettings({ locationSharing: v })} />,
        },
        {
          label: 'Shake Detection',
          desc: 'Uses device motion sensor (mobile)',
          icon: Smartphone,
          control: <Toggle value={settings.shakeDetection} onChange={v => updateSettings({ shakeDetection: v })} />,
        },
      ],
    },
    {
      title: 'Appearance',
      items: [
        {
          label: 'Dark Mode',
          desc: 'Toggle dark theme',
          icon: Moon,
          control: <Toggle value={settings.darkMode} onChange={v => updateSettings({ darkMode: v })} />,
        },
      ],
    },
    {
      title: 'Privacy & Security',
      items: [
        {
          label: 'Auto-SOS on Missed Check-in',
          desc: 'Trigger SOS if travel check-in missed',
          icon: Shield,
          control: <Toggle value={settings.autoSOSOnMissedCheckIn} onChange={v => updateSettings({ autoSOSOnMissedCheckIn: v })} />,
        },
      ],
    },
  ];

  return (
    <PageLayout title="Settings" showNav>
      <div className="p-4 space-y-5">
        {/* Profile */}
        <div className="card">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
              <User size={26} className="text-pink-500" />
            </div>
            <div className="flex-1 min-w-0">
              {editName ? (
                <div className="flex gap-2">
                  <input
                    className="input-field text-sm py-1.5 flex-1"
                    value={nameValue}
                    onChange={e => setNameValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSaveName()}
                    autoFocus
                  />
                  <button onClick={handleSaveName} className="btn-primary py-1.5 px-3 text-sm">Save</button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                  <button onClick={() => setEditName(true)} className="text-xs text-pink-600 font-medium hover:underline">Edit</button>
                </div>
              )}
              <p className="text-sm text-gray-500 truncate mt-0.5">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-100 text-center">
            <div className="flex-1">
              <p className="text-lg font-bold text-pink-600">{contacts.length}</p>
              <p className="text-xs text-gray-500">Contacts</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-pink-600">{alerts.filter(a => a.status === 'ACTIVE').length}</p>
              <p className="text-xs text-gray-500">Active Alerts</p>
            </div>
            <div className="flex-1">
              <p className="text-lg font-bold text-pink-600">{alerts.length}</p>
              <p className="text-xs text-gray-500">Total Events</p>
            </div>
          </div>
        </div>

        {/* Settings sections */}
        {sections.map(section => (
          <div key={section.title} className="card p-0 overflow-hidden">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 bg-gray-50 border-b border-gray-100">
              {section.title}
            </p>
            {section.items.map(({ label, desc, icon: Icon, control }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 px-4 py-3.5 ${i < section.items.length - 1 ? 'border-b border-gray-100' : ''}`}
              >
                <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
                {control}
              </div>
            ))}
          </div>
        ))}

        {/* Help & Support */}
        <div className="card p-0 overflow-hidden">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-3 bg-gray-50 border-b border-gray-100">Help & Support</p>
          {[
            { label: 'Help & Support', icon: HelpCircle, action: () => window.open('mailto:support@shesafe.app', '_blank') },
            { label: 'About SHE SAFE', icon: Info, action: () => alert('SHE SAFE v1.0.0\nWomen Safety Smart Ecosystem\nBuilt for hackathon demonstration.') },
          ].map(({ label, icon: Icon, action }, i) => (
            <button
              key={label}
              onClick={action}
              className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-gray-50 transition-colors ${i === 0 ? 'border-b border-gray-100' : ''}`}
            >
              <div className="w-9 h-9 bg-pink-50 rounded-xl flex items-center justify-center">
                <Icon size={16} className="text-pink-500" />
              </div>
              <span className="text-sm font-semibold text-gray-800 flex-1 text-left">{label}</span>
              <ChevronRight size={16} className="text-gray-400" />
            </button>
          ))}
        </div>

        {/* Demo Mode */}
        <button
          onClick={() => navigate('/demo')}
          className="card w-full text-left flex items-center gap-3 hover:shadow-md transition-shadow"
        >
          <div className="w-9 h-9 bg-purple-100 rounded-xl flex items-center justify-center">
            <span className="text-lg">🎭</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-800">Demo Mode</p>
            <p className="text-xs text-gray-500">Hackathon demo & feature simulation</p>
          </div>
          <ChevronRight size={16} className="text-gray-400" />
        </button>

        {/* Logout / Delete */}
        <div className="space-y-2 pb-4">
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full py-3.5 bg-white border border-gray-200 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-2 hover:bg-gray-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full py-3 text-red-500 text-sm font-medium flex items-center justify-center gap-1.5 hover:text-red-700"
          >
            <Trash2 size={14} />
            Delete Account & Data
          </button>
        </div>
      </div>

      {/* Logout Confirm */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Sign out?</h3>
            <p className="text-gray-600 text-sm mb-5">Your data will remain stored locally.</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleLogout} className="btn-primary flex-1">Sign Out</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-red-700 mb-2">Delete Account?</h3>
            <p className="text-gray-600 text-sm mb-1">This will permanently delete your account and all local data including:</p>
            <ul className="text-sm text-gray-500 list-disc list-inside mb-5 space-y-1">
              <li>{contacts.length} trusted contact{contacts.length !== 1 ? 's' : ''}</li>
              <li>{alerts.length} alert event{alerts.length !== 1 ? 's' : ''}</li>
              <li>All settings and preferences</li>
            </ul>
            <div className="flex gap-3">
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={handleDeleteAccount} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
