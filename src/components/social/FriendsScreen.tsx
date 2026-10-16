import React, { useState } from 'react';
import { FriendUser, Post } from '../../types';
import { ArrowLeft, Search, UserPlus, UserCheck, UserX, MessageSquare, ShieldAlert, Check, X } from 'lucide-react';
import { PublicProfileModal } from './PublicProfileModal';

interface FriendsScreenProps {
  friends: FriendUser[];
  onUpdateFriends: (friends: FriendUser[]) => void;
  posts: Post[];
  onBack: () => void;
  onStartChat: (friend: FriendUser) => void;
  onOpenTimeline?: (friend: FriendUser) => void;
}

export const FriendsScreen: React.FC<FriendsScreenProps> = ({
  friends,
  onUpdateFriends,
  posts,
  onBack,
  onStartChat,
  onOpenTimeline,
}) => {
  const [activeTab, setActiveTab] = useState<'friends' | 'requests' | 'search'>('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<FriendUser | null>(null);

  const myFriends = friends.filter((f) => f.friendshipStatus === 'friends');
  const requestsReceived = friends.filter((f) => f.friendshipStatus === 'request_received');
  const otherMothers = friends.filter((f) => f.friendshipStatus === 'none' || f.friendshipStatus === 'request_sent');

  const searchResults = friends.filter((f) =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleUpdateStatus = (id: string, status: FriendUser['friendshipStatus']) => {
    onUpdateFriends(
      friends.map((f) => (f.id === id ? { ...f, friendshipStatus: status } : f))
    );
  };

  const handleUnfriend = (id: string, name: string) => {
    if (window.confirm(`আপনি কি নিশ্চিতভাবে ${name}-কে আনফ্রেন্ড করতে চান?`)) {
      handleUpdateStatus(id, 'none');
    }
  };

  const handleBlock = (id: string, name: string) => {
    if (window.confirm(`আপনি কি ${name}-কে ব্লক করতে চান?`)) {
      onUpdateFriends(
        friends.map((f) => (f.id === id ? { ...f, isBlocked: true, friendshipStatus: 'none' } : f))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col pb-20 font-hind selection:bg-[#EDD6A9] selection:text-[#56020A]">
      {/* Top Bar */}
      <div className="bg-[#56020A] text-white p-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1 rounded-full hover:bg-white/10 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold">মায়েদের কমিউনিটি ও ফ্রেন্ডস</h1>
        </div>
      </div>

      {/* Internal Tabs */}
      <div className="bg-white border-b border-[#EDD6A9] px-4 pt-2 flex gap-4 text-xs font-bold text-[#56020A]">
        <button
          onClick={() => setActiveTab('friends')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'friends' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
          }`}
        >
          আমার ফ্রেন্ডস ({myFriends.length})
        </button>
        <button
          onClick={() => setActiveTab('requests')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'requests' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
          }`}
        >
          ফ্রেন্ড রিকোয়েস্ট ({requestsReceived.length})
        </button>
        <button
          onClick={() => setActiveTab('search')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'search' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
          }`}
        >
          মায়েদের খুঁজুন
        </button>
      </div>

      <div className="p-4 max-w-xl mx-auto w-full space-y-4">
        {activeTab === 'search' && (
          <div className="relative">
            <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="নাম বা এলাকা দিয়ে মায়েরা খুঁজুন..."
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#56020A]"
            />
          </div>
        )}

        <div className="space-y-3">
          {(activeTab === 'friends' ? myFriends : activeTab === 'requests' ? requestsReceived : searchResults).map((friend) => (
            <div key={friend.id} className="bg-white p-4 rounded-2xl border border-[#EDD6A9]/60 shadow-sm flex items-center justify-between">
              <div
                onClick={() => {
                  if (onOpenTimeline) {
                    onOpenTimeline(friend);
                  } else {
                    setSelectedProfile(friend);
                  }
                }}
                className="flex items-center gap-3 cursor-pointer flex-1"
              >
                <img src={friend.avatar} alt={friend.name} className="w-12 h-12 rounded-full object-cover border border-[#EDD6A9]" />
                <div>
                  <h3 className="text-sm font-bold text-[#56020A]">{friend.name}</h3>
                  <p className="text-[11px] text-gray-500">{friend.location}</p>
                  <p className="text-[10px] text-[#375013] mt-0.5">{friend.mutualFriendsCount} মিউচুয়াল ফ্রেন্ড</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {friend.friendshipStatus === 'friends' && (
                  <>
                    <button
                      onClick={() => onStartChat(friend)}
                      className="p-2 bg-[#56020A] text-white rounded-xl text-xs font-bold hover:bg-[#56020A]/90"
                      title="মেসেজ পাঠান"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleUnfriend(friend.id, friend.name)}
                      className="p-2 bg-gray-100 text-gray-600 rounded-xl text-xs hover:bg-red-50 hover:text-red-600"
                      title="আনফ্রেন্ড"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  </>
                )}

                {friend.friendshipStatus === 'request_received' && (
                  <>
                    <button
                      onClick={() => handleUpdateStatus(friend.id, 'friends')}
                      className="px-3 py-1.5 bg-[#375013] text-white rounded-xl text-xs font-bold"
                    >
                      গ্রহণ করুন
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(friend.id, 'none')}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      বাতিল
                    </button>
                  </>
                )}

                {friend.friendshipStatus === 'none' && (
                  <button
                    onClick={() => handleUpdateStatus(friend.id, 'request_sent')}
                    className="px-3.5 py-1.5 bg-[#56020A] text-white rounded-xl text-xs font-bold flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" /> রিকোয়েস্ট পাঠান
                  </button>
                )}

                {friend.friendshipStatus === 'request_sent' && (
                  <button
                    onClick={() => handleUpdateStatus(friend.id, 'none')}
                    className="px-3.5 py-1.5 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                  >
                    রিকোয়েস্ট পাঠানো হয়েছে
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {selectedProfile && (
        <PublicProfileModal
          friend={selectedProfile}
          posts={posts}
          isOpen={!!selectedProfile}
          onClose={() => setSelectedProfile(null)}
          onStartChat={onStartChat}
        />
      )}
    </div>
  );
};
