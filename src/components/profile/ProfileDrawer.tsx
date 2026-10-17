import React, { useState, useEffect } from 'react';
import { User, Child, Order, RewardTransaction, GiftRedemption, Post, Recipe, Conversation } from '../../types';
import {
  X,
  User as UserIcon,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  Baby,
  Bookmark,
  Award,
  ShoppingBag,
  Gift,
  MapPin,
  Bell,
  Settings,
  HelpCircle,
  LogOut,
  Sparkles,
  FileText,
  AlertCircle,
  CheckCircle2,
  Users,
  MessageSquare,
  Stethoscope,
  BookOpen,
  Utensils,
  MessageSquareWarning
} from 'lucide-react';
import { AddressManagerModal } from './AddressManagerModal';
import { SettingsModal } from './SettingsModal';
import { ComplaintsModal } from './ComplaintsModal';

interface ProfileDrawerProps {
  user: User;
  onUpdateUser: (user: User) => void;
  childrenList: Child[];
  onUpdateChildren: (children: Child[]) => void;
  orders: Order[];
  rewardTx: RewardTransaction[];
  giftRedemptions: GiftRedemption[];
  posts: Post[];
  recipes: Recipe[];
  conversations: Conversation[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onNavigateTab: (tab: any) => void;
  onNavigateScreen: (screen: 'app' | 'friends' | 'messenger' | 'doctor' | 'recipes') => void;
  onOpenTimeline?: () => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  user,
  onUpdateUser,
  childrenList,
  onUpdateChildren,
  orders,
  rewardTx,
  giftRedemptions,
  posts,
  recipes,
  conversations,
  isOpen,
  onClose,
  onLogout,
  onNavigateTab,
  onNavigateScreen,
  onOpenTimeline,
}) => {
  const [supportExpanded, setSupportExpanded] = useState(false);
  const [settingsExpanded, setSettingsExpanded] = useState(false);
  const [membershipExpanded, setMembershipExpanded] = useState(true);
  const [showMorePrimary, setShowMorePrimary] = useState(false);

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showFullProfileModal, setShowFullProfileModal] = useState(false);
  const [showComplaintsModal, setShowComplaintsModal] = useState(false);

  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleActivateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (couponInput.trim().toUpperCase() === 'BABYCARE') {
      onUpdateUser({
        ...user,
        isMember: true,
        membershipExpiry: 'প্রিমিয়াম মেম্বারশিপ (ফ্রি কুপন)',
        couponUsed: 'BABYCARE',
      });
      setCouponSuccess('অভিনন্দন! আপনার প্রিমিয়াম মেম্বারশিপ সক্রিয় হয়েছে।');
      setCouponError('');
    } else {
      setCouponError('ভুল কুপন! ডেমো কুপন BABYCARE ব্যবহার করুন।');
    }
  };

  const selectedChild = childrenList[0];
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-hind">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        aria-label="Profile navigation drawer"
        className="absolute inset-y-0 left-0 max-w-[380px] w-[88%] bg-[#FAF6F0] shadow-2xl flex flex-col z-10 border-r border-[#EDD6A9] transform transition-transform duration-300 ease-out animate-in slide-in-from-left duration-200"
      >
        <div className="p-4 bg-[#56020A] text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#EDD6A9]" />
            <h2 className="text-sm font-bold tracking-tight">Baby Care মেনু</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Profile Card */}
          <div
            onClick={() => {
              onClose();
              if (onOpenTimeline) {
                onOpenTimeline();
              } else {
                setShowFullProfileModal(true);
              }
            }}
            className="bg-white p-3.5 rounded-2xl border border-[#EDD6A9] shadow-sm flex items-center justify-between cursor-pointer hover:border-[#56020A] transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#56020A] shrink-0">
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#56020A] group-hover:text-[#375013] transition-colors truncate max-w-[160px]">
                  {user.name}
                </h3>
                <p className="text-[11px] text-[#375013] font-semibold flex items-center gap-1 mt-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#D6AA4F]" />
                  {user.isMember ? 'প্রিমিয়াম মেম্বার' : 'স্ট্যান্ডার্ড অ্যাকাউন্ট'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-gray-400 group-hover:translate-x-0.5 transition-transform" />
          </div>

          {/* Shortcuts */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-gray-500 uppercase tracking-wider px-1">আপনার শর্টকাট</h4>
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              <button
                onClick={() => {
                  onClose();
                  onNavigateTab('baby');
                }}
                className="bg-white p-2.5 rounded-xl border border-[#EDD6A9] flex items-center gap-2 shrink-0 hover:border-[#56020A] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#EDD6A9]/30 flex items-center justify-center text-[#56020A]">
                  <Baby className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400">নির্বাচিত শিশু</p>
                  <p className="text-xs font-bold text-[#56020A]">{selectedChild?.name || 'আয়ান'}</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateScreen('friends');
                }}
                className="bg-white p-2.5 rounded-xl border border-[#EDD6A9] flex items-center gap-2 shrink-0 hover:border-[#56020A] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-[#375013]/10 flex items-center justify-center text-[#375013]">
                  <Users className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400">কমিউনিটি</p>
                  <p className="text-xs font-bold text-[#56020A]">ফ্রেন্ডস</p>
                </div>
              </button>

              <button
                onClick={() => {
                  onClose();
                  onNavigateScreen('doctor');
                }}
                className="bg-white p-2.5 rounded-xl border border-[#EDD6A9] flex items-center gap-2 shrink-0 hover:border-[#56020A] transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-800">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-[10px] text-gray-400">মেডিকেল</p>
                  <p className="text-xs font-bold text-[#56020A]">ডাক্তার</p>
                </div>
              </button>
            </div>
          </div>

          <div className="border-t border-[#EDD6A9]/60 my-2" />

          {/* Primary Menu + New entries */}
          <div className="space-y-1">
            <button
              onClick={() => {
                onClose();
                onNavigateScreen('friends');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors bg-[#EDD6A9]/10"
            >
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-[#56020A]" />
                <span>ফ্রেন্ডস</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateScreen('messenger');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors bg-[#EDD6A9]/10"
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-[#56020A]" />
                <span>মেসেঞ্জার</span>
              </div>
              <div className="flex items-center gap-2">
                {unreadMessagesCount > 0 && (
                  <span className="bg-[#56020A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {unreadMessagesCount}টি নতুন
                  </span>
                )}
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateScreen('doctor');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors bg-[#EDD6A9]/10"
            >
              <div className="flex items-center gap-3">
                <Stethoscope className="w-5 h-5 text-[#56020A]" />
                <span>ডাক্তারকে জিজ্ঞেস করুন</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('baby');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Baby className="w-5 h-5 text-[#375013]" />
                <span>আমার বেবি</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateTab('rewards');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Gift className="w-5 h-5 text-[#375013]" />
                <span>পয়েন্ট ও গিফট</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => {
                onClose();
                onNavigateScreen('recipes');
              }}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <Utensils className="w-5 h-5 text-[#375013]" />
                <span>রেসিপি ও টিপস</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>

            <button
              onClick={() => setShowComplaintsModal(true)}
              className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white text-xs font-bold text-[#56020A] transition-colors"
            >
              <div className="flex items-center gap-3">
                <MessageSquareWarning className="w-5 h-5 text-red-600" />
                <span>অভিযোগ ও সাপোর্ট</span>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          <div className="border-t border-[#EDD6A9]/60 my-2" />

          {/* Membership Card Group */}
          <div className="bg-gradient-to-br from-[#FAF6F0] to-[#EDD6A9]/30 p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
            <div className="flex items-center justify-between cursor-pointer" onClick={() => setMembershipExpanded(!membershipExpanded)}>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#56020A]" />
                <h4 className="text-xs font-bold text-[#56020A]">Baby Care মেম্বারশিপ</h4>
              </div>
              {membershipExpanded ? <ChevronDown className="w-4 h-4 text-gray-500" /> : <ChevronRight className="w-4 h-4 text-gray-500" />}
            </div>

            {membershipExpanded && (
              <div className="space-y-3 pt-1">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-600">মূল্য: <span className="line-through">৳ ৮,০০০</span></span>
                  <span className="font-bold text-[#375013]">ফ্রি কুপন উপলব্ধ</span>
                </div>

                {user.isMember ? (
                  <div className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" /> আপনার মেম্বারশিপ সক্রিয়
                  </div>
                ) : (
                  <form onSubmit={handleActivateCoupon} className="space-y-2">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        placeholder="BABYCARE"
                        className="flex-1 px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl uppercase font-mono font-bold"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl"
                      >
                        অ্যাক্টিভ
                      </button>
                    </div>
                    {couponError && <p className="text-[10px] text-red-600">{couponError}</p>}
                    {couponSuccess && <p className="text-[10px] text-green-700">{couponSuccess}</p>}
                  </form>
                )}
              </div>
            )}
          </div>

          {/* Footer & Logout */}
          <div className="pt-2">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 mt-3">
              <img src="/logo.png" alt="Baby Care" className="w-4 h-4 rounded-full object-cover" />
              <p className="text-[10px] text-center text-gray-400 font-medium">
                Baby Care by Baby Masala
              </p>
            </div>
          </div>
        </div>
      </aside>

      <AddressManagerModal
        user={user}
        onUpdateUser={onUpdateUser}
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />

      <ComplaintsModal isOpen={showComplaintsModal} onClose={() => setShowComplaintsModal(false)} />

      <SettingsModal
        user={user}
        onUpdateUser={onUpdateUser}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={onLogout}
      />

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
