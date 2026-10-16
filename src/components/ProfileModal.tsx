import React, { useState } from 'react';
import { User, Child, Order, RewardTransaction, GiftRedemption, Post, Recipe } from '../types';
import { X, User as UserIcon, ShieldCheck, MapPin, Bell, Lock, LogOut, Baby, Gift, ShoppingBag, Check, Trash2, Edit2, Bookmark, Settings } from 'lucide-react';
import { AddressManagerModal } from './profile/AddressManagerModal';
import { SettingsModal } from './profile/SettingsModal';

interface ProfileModalProps {
  user: User;
  onUpdateUser: (user: User) => void;
  childrenList: Child[];
  onUpdateChildren: (children: Child[]) => void;
  orders: Order[];
  rewardTx: RewardTransaction[];
  giftRedemptions: GiftRedemption[];
  posts: Post[];
  recipes: Recipe[];
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  user,
  onUpdateUser,
  childrenList,
  onUpdateChildren,
  orders,
  rewardTx,
  giftRedemptions,
  posts,
  recipes,
  isOpen,
  onClose,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'children' | 'saved' | 'orders' | 'rewards' | 'settings'>('profile');
  const [name, setName] = useState(user.name);
  const [contact, setContact] = useState(user.contact);
  const [avatar, setAvatar] = useState(user.avatar);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sub modals
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // New/Edit child form
  const [showAddChild, setShowAddChild] = useState(false);
  const [editingChildId, setEditingChildId] = useState<string | null>(null);
  const [newChildName, setNewChildName] = useState('');
  const [newChildDob, setNewChildDob] = useState('');
  const [newChildAllergies, setNewChildAllergies] = useState('');
  const [childError, setChildError] = useState('');

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !contact.trim()) return;
    onUpdateUser({
      ...user,
      name,
      contact,
      avatar: avatar || user.avatar,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChildName.trim() || !newChildDob.trim()) {
      setChildError('শিশুর নাম ও জন্মতারিখ আবশ্যক।');
      return;
    }
    const dobDate = new Date(newChildDob);
    const today = new Date();
    if (dobDate > today) {
      setChildError('ভবিষ্যতের জন্মতারিখ গ্রহণযোগ্য নয়।');
      return;
    }

    if (editingChildId) {
      onUpdateChildren(
        childrenList.map((ch: Child) =>
          ch.id === editingChildId
            ? { ...ch, name: newChildName, dob: newChildDob, allergies: newChildAllergies }
            : ch
        )
      );
      setEditingChildId(null);
    } else {
      const newChild: Child = {
        id: 'child-' + Date.now(),
        name: newChildName,
        dob: newChildDob,
        allergies: newChildAllergies || 'কোনো এলার্জি নেই',
      };
      onUpdateChildren([...childrenList, newChild]);
    }

    setNewChildName('');
    setNewChildDob('');
    setNewChildAllergies('');
    setChildError('');
    setShowAddChild(false);
  };

  const handleEditChildClick = (ch: Child) => {
    setEditingChildId(ch.id);
    setNewChildName(ch.name);
    setNewChildDob(ch.dob);
    setNewChildAllergies(ch.allergies || '');
    setShowAddChild(true);
  };

  const handleDeleteChild = (id: string) => {
    if (childrenList.length <= 1) {
      alert('কমপক্ষে একটি শিশুর তথ্য থাকা আবশ্যক।');
      return;
    }
    onUpdateChildren(childrenList.filter((c: Child) => c.id !== id));
  };

  const savedPosts = posts.filter((p: Post) => p.savedByMe);
  const savedRecipes = recipes.filter((r: Recipe) => r.saved);

  const earnedPoints = rewardTx.filter((t: RewardTransaction) => t.type === 'earn').reduce((a: number, b: RewardTransaction) => a + b.points, 0);
  const spentPoints = giftRedemptions.reduce((a: number, b: GiftRedemption) => a + b.pointsCost, 0);
  const currentBalance = earnedPoints - spentPoints;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EDD6A9]">
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-xs text-[#EDD6A9] flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {user.isMember ? 'প্রিমিয়াম মেম্বার (ফ্রি অ্যাক্টিভেশন)' : 'স্ট্যান্ডার্ড অ্যাকাউন্ট'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-[#EDD6A9] bg-[#EDD6A9]/20 overflow-x-auto text-xs font-semibold text-[#56020A] scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'profile' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            প্রোফাইল
          </button>
          <button
            onClick={() => setActiveTab('children')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'children' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            সন্তান ({childrenList.length})
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'saved' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            সেভ করা ({savedPosts.length + savedRecipes.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'orders' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            অর্ডার ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('rewards')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'rewards' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            রিওয়ার্ডস
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'settings' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent hover:bg-white/50'
            }`}
          >
            সেটিংস
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'profile' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] shadow-sm flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#56020A]">ঠিকানা ম্যানেজমেন্ট</h3>
                  <p className="text-xs text-gray-500 mt-0.5">আপনার ডেলিভারি ঠিকানা যোগ ও সম্পাদনা করুন</p>
                </div>
                <button
                  onClick={() => setShowAddressModal(true)}
                  className="px-3 py-2 bg-[#375013] text-white text-xs font-bold rounded-xl"
                >
                  ঠিকানা দেখুন ({user.addresses.length})
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] shadow-sm">
                <h3 className="text-sm font-bold text-[#56020A] mb-3">মেম্বারশিপ স্ট্যাটাস</h3>
                <div className="flex items-center justify-between text-xs bg-[#FAF6F0] p-3 rounded-lg border border-[#EDD6A9]/50">
                  <div>
                    <p className="font-bold text-[#375013]">প্রিমিয়াম অ্যাক্টিভেশন (মূল্য: ৳ ৮,০০০)</p>
                    <p className="text-gray-600 mt-0.5">কুপন: <span className="font-mono font-bold text-[#56020A]">BABYCARE</span> (ফ্রি)</p>
                  </div>
                  <span className="bg-[#375013] text-white px-2.5 py-1 rounded-full font-bold">সক্রিয়</span>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="bg-white p-4 rounded-xl border border-[#EDD6A9] shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-[#56020A] mb-2">প্রোফাইল তথ্য সম্পাদন</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">মায়ের নাম</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#56020A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">যোগাযোগ (হোয়াটসঅ্যাপ/ইমেইল)</label>
                  <input
                    type="text"
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#56020A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">প্রোফাইল ছবি (Avatar URL)</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#56020A]"
                  />
                </div>

                {savedSuccess && (
                  <div className="text-xs text-green-700 bg-green-50 p-2 rounded flex items-center gap-1">
                    <Check className="w-4 h-4" /> সফলভাবে সংরক্ষিত হয়েছে!
                  </div>
                )}

                <button
                  type="submit"
                  className="px-4 py-2 bg-[#56020A] text-white text-xs font-semibold rounded-lg hover:bg-[#56020A]/90 transition-colors"
                >
                  সংরক্ষণ করুন
                </button>
              </form>
            </div>
          )}

          {activeTab === 'children' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-[#56020A]">সন্তানের তালিকা</h3>
                <button
                  onClick={() => {
                    setEditingChildId(null);
                    setNewChildName('');
                    setNewChildDob('');
                    setNewChildAllergies('');
                    setShowAddChild(!showAddChild);
                  }}
                  className="px-3 py-1.5 bg-[#375013] text-white text-xs font-semibold rounded-lg hover:bg-[#375013]/90"
                >
                  {showAddChild ? 'বাতিল' : '+ সন্তান যোগ করুন'}
                </button>
              </div>

              {showAddChild && (
                <form onSubmit={handleSaveChild} className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 shadow-sm">
                  <h4 className="text-xs font-bold text-[#56020A]">{editingChildId ? 'শিশুর তথ্য সংশোধন' : 'নতুন শিশুর তথ্য'}</h4>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">শিশুর নাম</label>
                    <input
                      type="text"
                      value={newChildName}
                      onChange={(e) => setNewChildName(e.target.value)}
                      placeholder="নাম লিখুন"
                      className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">জন্মতারিখ (ক্যালেন্ডার মাস অনুযায়ী)</label>
                    <input
                      type="date"
                      value={newChildDob}
                      onChange={(e) => setNewChildDob(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">এলার্জি নোট</label>
                    <input
                      type="text"
                      value={newChildAllergies}
                      onChange={(e) => setNewChildAllergies(e.target.value)}
                      placeholder="যেমন: কোনো এলার্জি নেই"
                      className="w-full px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg"
                    />
                  </div>
                  {childError && <p className="text-xs text-red-600">{childError}</p>}
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#56020A] text-white text-xs font-semibold rounded-lg"
                  >
                    সেভ করুন
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {childrenList.map((ch: Child) => {
                  const dobDate = new Date(ch.dob);
                  const today = new Date();
                  let months = (today.getFullYear() - dobDate.getFullYear()) * 12 + (today.getMonth() - dobDate.getMonth());
                  if (today.getDate() < dobDate.getDate()) months--;
                  const years = Math.floor(months / 12);
                  const remMonths = months % 12;
                  const ageStr = years > 0 ? `${years} বছর ${remMonths} মাস` : `${months} মাস`;

                  return (
                    <div key={ch.id} className="bg-white p-4 rounded-xl border border-[#EDD6A9] flex items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#EDD6A9]/40 flex items-center justify-center text-[#56020A] font-bold">
                          <Baby className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-[#56020A]">{ch.name}</h4>
                          <p className="text-xs text-gray-500">বয়স: <span className="font-semibold text-[#375013]">{ageStr}</span> (জন্ম: {ch.dob})</p>
                          <p className="text-[11px] text-gray-600 mt-0.5">এলার্জি: {ch.allergies || 'নেই'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditChildClick(ch)}
                          className="p-1.5 text-[#56020A] hover:bg-[#EDD6A9]/30 rounded-lg"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteChild(ch.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                          title="ডিলিট"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeTab === 'saved' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-[#56020A] mb-2">সেভ করা পোস্ট ({savedPosts.length})</h3>
                {savedPosts.length === 0 ? (
                  <p className="text-xs text-gray-500">কোনো পোস্ট সেভ করা হয়নি।</p>
                ) : (
                  <div className="space-y-2">
                    {savedPosts.map((p: Post) => (
                      <div key={p.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] text-xs space-y-1">
                        <span className="font-bold text-[#56020A]">{p.authorName} ({p.topic})</span>
                        <p className="text-gray-700 line-clamp-2">{p.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#56020A] mb-2">সেভ করা রেসিপি ({savedRecipes.length})</h3>
                {savedRecipes.length === 0 ? (
                  <p className="text-xs text-gray-500">কোনো রেসিপি সেভ করা হয়নি।</p>
                ) : (
                  <div className="space-y-2">
                    {savedRecipes.map((r: Recipe) => (
                      <div key={r.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] text-xs flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#56020A]">{r.title}</span>
                          <p className="text-[10px] text-gray-500">{r.ageGroupLabel} · {r.prepTime}</p>
                        </div>
                        <Bookmark className="w-4 h-4 fill-[#56020A] text-[#56020A]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">অর্ডার ইতিহাস</h3>
              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-6">কোনো অর্ডার পাওয়া যায়নি।</p>
              ) : (
                orders.map((ord: Order) => (
                  <div key={ord.id} className="bg-white p-4 rounded-xl border border-[#EDD6A9] shadow-sm space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-[#56020A]">অর্ডার আইডি: #{ord.id}</span>
                      <span className="px-2 py-0.5 bg-green-100 text-green-800 rounded font-bold">
                        {ord.status === 'delivered' ? 'ডেলিভারি সম্পন্ন' : ord.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600">তারিখ: {ord.createdAt}</p>
                    <div className="border-t border-gray-100 pt-2 text-xs space-y-1">
                      {ord.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex justify-between">
                          <span>{item.product.name} (x{item.quantity})</span>
                          <span>৳ {item.product.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100 font-bold text-xs text-[#56020A]">
                      <span>মোট: ৳ {ord.totalAmount}</span>
                      <span className="text-[#375013]">পয়েন্ট অর্জিত: +{ord.pointsEarned}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-4 rounded-xl shadow-md">
                <p className="text-xs text-[#EDD6A9]">আপনার বর্তমান রিওয়ার্ড পয়েন্ট ব্যালেন্স</p>
                <h3 className="text-2xl font-bold mt-1">{currentBalance} পয়েন্ট</h3>
                <div className="flex gap-4 mt-2 text-[11px] text-[#EDD6A9]">
                  <span>অর্জিত: +{earnedPoints}</span>
                  <span>ব্যয়িত: -{spentPoints}</span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[#56020A]">পয়েন্ট ট্রানজ্যাকশন লেজার</h4>
                {rewardTx.map((tx: RewardTransaction) => (
                  <div key={tx.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] flex justify-between items-center text-xs">
                    <div>
                      <p className="font-medium text-gray-800">{tx.description}</p>
                      <p className="text-[10px] text-gray-400">{tx.date}</p>
                    </div>
                    <span className={`font-bold ${tx.points > 0 ? 'text-[#375013]' : 'text-red-600'}`}>
                      {tx.points > 0 ? `+${tx.points}` : tx.points} পয়েন্ট
                    </span>
                  </div>
                ))}
              </div>

              {giftRedemptions.length > 0 && (
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-[#56020A]">গিফট রিডেম্পশন ইতিহাস</h4>
                  {giftRedemptions.map((gr: GiftRedemption) => (
                    <div key={gr.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] flex justify-between items-center text-xs">
                      <div>
                        <p className="font-medium text-gray-800">{gr.giftName}</p>
                        <p className="text-[10px] text-gray-400">খরচ: {gr.pointsCost} পয়েন্ট</p>
                      </div>
                      <span className="px-2 py-0.5 bg-yellow-100 text-yellow-800 rounded font-bold">
                        {gr.status === 'pending' ? 'প্রক্রিয়াধীন' : gr.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3">
                <h3 className="text-sm font-bold text-[#56020A]">সেটিংস ও প্রাইভেসি</h3>
                <button
                  onClick={() => setShowSettingsModal(true)}
                  className="w-full py-2.5 bg-[#EDD6A9]/30 hover:bg-[#EDD6A9]/60 text-[#56020A] text-xs font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <Settings className="w-4 h-4" /> সেটিংস মডাল খুলুন
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => {
                    onLogout();
                    onClose();
                  }}
                  className="w-full py-2.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>লগ আউট / অ্যাকাউন্ট পরিবর্তন</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <AddressManagerModal
        user={user}
        onUpdateUser={onUpdateUser}
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
      />

      <SettingsModal
        user={user}
        onUpdateUser={onUpdateUser}
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        onLogout={onLogout}
      />
    </div>
  );
};
