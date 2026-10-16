import React from 'react';
import { NotificationItem } from '../types';
import { X, Bell, CheckCircle2 } from 'lucide-react';

interface NotificationModalProps {
  notifications: NotificationItem[];
  isOpen: boolean;
  onClose: () => void;
  onMarkAllAsRead: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  notifications,
  isOpen,
  onClose,
  onMarkAllAsRead,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-start justify-end p-4 pt-16">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full shadow-2xl border border-[#EDD6A9] overflow-hidden animate-in slide-in-from-top-4 duration-200">
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-[#EDD6A9]" />
            <h3 className="text-sm font-bold">নোটিফিকেশন</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-3 bg-[#EDD6A9]/20 flex justify-between items-center text-xs">
          <span className="text-gray-600">সাম্প্রতিক আপডেটসমূহ</span>
          <button
            onClick={onMarkAllAsRead}
            className="text-[#56020A] font-semibold hover:underline"
          >
            সব পঠিত করুন
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto divide-y divide-[#EDD6A9]/40">
          {notifications.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-8">কোনো নতুন নোটিফিকেশন নেই।</p>
          ) : (
            notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 transition-colors ${notif.read ? 'bg-white' : 'bg-[#EDD6A9]/15'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4 className="text-xs font-bold text-[#56020A]">{notif.title}</h4>
                  <span className="text-[10px] text-gray-400">{notif.time}</span>
                </div>
                <p className="text-xs text-gray-700">{notif.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
