import React, { useState } from 'react';
import { User } from '../../types';
import { X, Bell, Lock, LogOut, Check } from 'lucide-react';

interface SettingsModalProps {
  user: User;
  onUpdateUser: (user: User) => void;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  user,
  onUpdateUser,
  isOpen,
  onClose,
  onLogout,
}) => {
  const [push, setPush] = useState(user.notificationPrefs.push);
  const [communityAlerts, setCommunityAlerts] = useState(user.notificationPrefs.communityAlerts);
  const [showChildrenInfo, setShowChildrenInfo] = useState(user.privacySettings.showChildrenInfo);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      notificationPrefs: {
        ...user.notificationPrefs,
        push,
        communityAlerts,
      },
      privacySettings: {
        ...user.privacySettings,
        showChildrenInfo,
      },
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#EDD6A9]" />
            <h3 className="text-sm font-bold">সেটিংস ও প্রাইভেসি</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 shadow-sm">
            <h4 className="font-bold text-[#56020A]">নোটিফিকেশন পছন্দ</h4>
            <div className="flex items-center justify-between">
              <span>পুশ নোটিফিকেশন ও অ্যালার্ট</span>
              <input
                type="checkbox"
                checked={push}
                onChange={(e) => setPush(e.target.checked)}
                className="accent-[#56020A] w-4 h-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <span>কমিউনিটি কমেন্ট ও কনটেস্ট আপডেট</span>
              <input
                type="checkbox"
                checked={communityAlerts}
                onChange={(e) => setCommunityAlerts(e.target.checked)}
                className="accent-[#56020A] w-4 h-4"
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 shadow-sm">
            <h4 className="font-bold text-[#56020A]">প্রাইভেসি ও গোপনীয়তা</h4>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-800">শিশুর জন্মতারিখ ও এলার্জি গোপনীয় রাখা</p>
                <p className="text-[10px] text-gray-500">বাইরে প্রদর্শিত হবে না (ডিফল্টভাবে সুরক্ষিত)</p>
              </div>
              <input
                type="checkbox"
                checked={!showChildrenInfo}
                onChange={(e) => setShowChildrenInfo(!e.target.checked)}
                className="accent-[#56020A] w-4 h-4"
              />
            </div>
          </div>

          {savedSuccess && (
            <div className="p-2.5 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-1">
              <Check className="w-4 h-4" /> সেটিংস সফলভাবে সংরক্ষিত হয়েছে!
            </div>
          )}

          <button
            type="submit"
            className="w-full py-2.5 bg-[#56020A] text-white font-bold rounded-xl shadow"
          >
            পরিবর্তন সেভ করুন
          </button>

          <div className="pt-2 border-t border-gray-200">
            <button
              type="button"
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>লগ আউট / অ্যাকাউন্ট পরিবর্তন</span>
            </button>
          </div>
        </form>
      </div>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-60 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 text-center space-y-4 border border-[#EDD6A9]">
            <h4 className="font-bold text-[#56020A] text-base">লগআউট করবেন?</h4>
            <p className="text-xs text-gray-600">আবার লগইন করে আপনার অ্যাকাউন্টে ফিরতে পারবেন।</p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl text-xs"
              >
                বাতিল
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onClose();
                  onLogout();
                }}
                className="flex-1 py-2 bg-red-600 text-white font-bold rounded-xl text-xs"
              >
                লগআউট
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
