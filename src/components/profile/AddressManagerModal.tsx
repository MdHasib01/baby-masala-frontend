import React, { useState } from 'react';
import { User } from '../../types';
import { X, MapPin, Plus, Trash2, Edit2, CheckCircle2 } from 'lucide-react';

interface AddressManagerModalProps {
  user: User;
  onUpdateUser: (user: User) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AddressManagerModal: React.FC<AddressManagerModalProps> = ({
  user,
  onUpdateUser,
  isOpen,
  onClose,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [phone, setPhone] = useState(user.contact || '');
  const [district, setDistrict] = useState('ঢাকা');
  const [area, setArea] = useState('');
  const [details, setDetails] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const districts = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'ময়মনসিংহ'];

  if (!isOpen) return null;

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!area.trim() || !details.trim()) {
      setErrorMsg('এলাকা ও বিস্তারিত ঠিকানা আবশ্যক।');
      return;
    }

    const fullDetails = `${area}, ${district} - ${details}`;

    let updatedAddresses = [...user.addresses];
    if (editingId) {
      updatedAddresses = updatedAddresses.map((addr) =>
        addr.id === editingId ? { ...addr, title: title || 'বাসা', details: fullDetails, phone } : addr
      );
      setEditingId(null);
    } else {
      const newAddr = {
        id: 'addr-' + Date.now(),
        title: title || 'বাসা',
        details: fullDetails,
        phone,
        isDefault: updatedAddresses.length === 0,
      };
      updatedAddresses.push(newAddr);
    }

    onUpdateUser({
      ...user,
      addresses: updatedAddresses,
    });

    setTitle('');
    setArea('');
    setDetails('');
    setErrorMsg('');
    setShowForm(false);
  };

  const handleDeleteAddress = (id: string) => {
    if (user.addresses.length <= 1) {
      alert('কমপক্ষে একটি ঠিকানা থাকা আবশ্যক।');
      return;
    }
    const updated = user.addresses.filter((a) => a.id !== id);
    onUpdateUser({ ...user, addresses: updated });
  };

  const handleSetDefault = (id: string) => {
    const updated = user.addresses.map((a) => ({
      ...a,
      isDefault: a.id === id,
    }));
    onUpdateUser({ ...user, addresses: updated });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#EDD6A9]" />
            <h3 className="text-sm font-bold">ঠিকানা ম্যানেজমেন্ট</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="flex justify-between items-center">
            <h4 className="font-bold text-[#56020A]">আপনার সেভ করা ঠিকানা ({user.addresses.length})</h4>
            <button
              onClick={() => {
                setEditingId(null);
                setTitle('');
                setArea('');
                setDetails('');
                setShowForm(!showForm);
              }}
              className="px-3 py-1.5 bg-[#375013] text-white font-bold rounded-lg hover:bg-[#375013]/90 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> নতুন ঠিকানা
            </button>
          </div>

          {showForm && (
            <form onSubmit={handleSaveAddress} className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 shadow-sm">
              <h5 className="font-bold text-[#56020A]">{editingId ? 'ঠিকানা সংশোধন' : 'নতুন ঠিকানা যোগ করুন'}</h5>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">ঠিকানার নাম (যেমন: বাসা / অফিস)</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="বাসা"
                  className="w-full px-3 py-2 border border-[#EDD6A9] rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold">জেলা</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3 py-2 border border-[#EDD6A9] rounded-lg bg-white"
                  >
                    {districts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-gray-700 mb-1 font-semibold">এলাকা</label>
                  <input
                    type="text"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="ধানমন্ডি / গুলশান"
                    className="w-full px-3 py-2 border border-[#EDD6A9] rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-gray-700 mb-1 font-semibold">বিস্তারিত ঠিকানা ও মোবাইল</label>
                <textarea
                  rows={2}
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="রোড নম্বর, বাসা নম্বর..."
                  className="w-full px-3 py-2 border border-[#EDD6A9] rounded-lg"
                />
              </div>
              {errorMsg && <p className="text-red-600">{errorMsg}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#56020A] text-white font-bold rounded-lg"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {user.addresses.map((addr) => (
              <div key={addr.id} className="bg-white p-3.5 rounded-xl border border-[#EDD6A9] flex justify-between items-start shadow-sm">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#56020A]">{addr.title}</span>
                    {addr.isDefault && (
                      <span className="bg-[#375013]/10 text-[#375013] text-[10px] font-bold px-2 py-0.5 rounded">
                        ডিফল্ট
                      </span>
                    )}
                  </div>
                  <p className="text-gray-700">{addr.details}</p>
                </div>
                <div className="flex items-center gap-1">
                  {!addr.isDefault && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      className="text-[10px] text-[#375013] font-bold underline px-1"
                    >
                      ডিফল্ট করুন
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                    title="ডিলিট"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
