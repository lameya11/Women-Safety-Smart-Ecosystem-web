import { useState } from 'react';
import { Plus, Edit2, Trash2, Star, Phone, User } from 'lucide-react';
import { PageLayout } from '../components/PageLayout';
import { useSafety } from '../context/SafetyContext';
import type { TrustedContact } from '../types';

interface ContactFormData {
  name: string;
  phone: string;
  relationship: string;
  isEmergency: boolean;
}

const RELATIONSHIPS = ['Parent', 'Sibling', 'Spouse/Partner', 'Friend', 'Colleague', 'Other'];

function ContactModal({
  initial,
  onSave,
  onClose,
}: {
  initial?: Partial<ContactFormData>;
  onSave: (d: ContactFormData) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<ContactFormData>({
    name: initial?.name ?? '',
    phone: initial?.phone ?? '',
    relationship: initial?.relationship ?? 'Friend',
    isEmergency: initial?.isEmergency ?? false,
  });
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  const validate = () => {
    const errs: Partial<ContactFormData> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\+?[\d\s\-()]{7,15}$/.test(form.phone)) errs.phone = 'Enter a valid phone number';
    return errs;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave(form);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-white rounded-t-3xl w-full max-w-lg p-6 pb-8 slide-up"
        onClick={e => e.stopPropagation()}
      >
        <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
        <h3 className="text-xl font-bold text-gray-900 mb-5">
          {initial?.name ? 'Edit Contact' : 'Add Contact'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Full Name *</label>
            <input
              className="input-field"
              placeholder="Contact name"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Phone Number *</label>
            <input
              className="input-field"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            />
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-600 mb-1 block">Relationship</label>
            <select
              className="input-field"
              value={form.relationship}
              onChange={e => setForm(p => ({ ...p, relationship: e.target.value }))}
            >
              {RELATIONSHIPS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <label className="flex items-center gap-3 cursor-pointer p-3 bg-red-50 rounded-xl border border-red-100">
            <input
              type="checkbox"
              className="w-4 h-4 accent-red-600"
              checked={form.isEmergency}
              onChange={e => setForm(p => ({ ...p, isEmergency: e.target.checked }))}
            />
            <div>
              <p className="text-sm font-semibold text-red-700">Primary Emergency Contact</p>
              <p className="text-xs text-red-500">This contact is alerted first during SOS</p>
            </div>
          </label>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" className="btn-primary flex-1">Save Contact</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact } = useSafety();
  const [showModal, setShowModal] = useState(false);
  const [editTarget, setEditTarget] = useState<TrustedContact | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSave = (data: ContactFormData) => {
    if (editTarget) {
      updateContact(editTarget.id, data);
    } else {
      addContact(data);
    }
    setShowModal(false);
    setEditTarget(null);
  };

  const handleDelete = (id: string) => {
    deleteContact(id);
    setDeleteConfirm(null);
  };

  return (
    <PageLayout
      title="Trusted Contacts"
      showNav
      headerRight={
        <button
          onClick={() => { setEditTarget(null); setShowModal(true); }}
          className="flex items-center gap-1.5 btn-primary py-2 px-3 text-sm"
        >
          <Plus size={16} />
          Add
        </button>
      }
    >
      <div className="p-4">
        {contacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mb-4">
              <Users size={36} className="text-pink-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-700">No Contacts Yet</h3>
            <p className="text-gray-500 text-sm mt-2 max-w-xs">
              Add trusted contacts who will be alerted during an SOS event.
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mt-5 flex items-center gap-2"
            >
              <Plus size={16} />
              Add First Contact
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {contacts.map(contact => (
              <div key={contact.id} className="card">
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${contact.isEmergency ? 'bg-red-100' : 'bg-pink-100'}`}>
                    <User size={22} className={contact.isEmergency ? 'text-red-500' : 'text-pink-500'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-gray-900 truncate">{contact.name}</p>
                      {contact.isEmergency && (
                        <Star size={12} className="text-red-500 fill-red-500 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                      <Phone size={12} />
                      {contact.phone}
                    </p>
                    <span className="inline-block text-xs bg-pink-50 text-pink-600 border border-pink-100 px-2 py-0.5 rounded-full mt-1">
                      {contact.relationship}
                    </span>
                    {contact.isEmergency && (
                      <span className="inline-block text-xs bg-red-50 text-red-600 border border-red-100 px-2 py-0.5 rounded-full mt-1 ml-1">
                        Emergency
                      </span>
                    )}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => { setEditTarget(contact); setShowModal(true); }}
                      className="p-2 rounded-lg hover:bg-blue-50 text-blue-500 transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(contact.id)}
                      className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Contact Modal */}
      {showModal && (
        <ContactModal
          initial={editTarget ?? undefined}
          onSave={handleSave}
          onClose={() => { setShowModal(false); setEditTarget(null); }}
        />
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-6">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Contact?</h3>
            <p className="text-gray-600 text-sm mb-5">This action cannot be undone.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1">Delete</button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

// Fix missing import
function Users({ size, className }: { size?: number; className?: string }) {
  return (
    <svg width={size ?? 24} height={size ?? 24} className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}
