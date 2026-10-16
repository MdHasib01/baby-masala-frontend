import React from 'react';
import { FriendUser, Post } from '../../types';
import { X, ShieldCheck, MapPin, UserPlus, MessageSquare, AlertCircle } from 'lucide-react';

interface PublicProfileModalProps {
  friend: FriendUser;
  posts: Post[];
  isOpen: boolean;
  onClose: () => void;
  onStartChat: (friend: FriendUser) => void;
}

export const PublicProfileModal: React.FC<PublicProfileModalProps> = ({
  friend,
  posts,
  isOpen,
  onClose,
  onStartChat,
}) => {
  if (!isOpen) return null;

  const friendPosts = posts.filter((p) => p.authorName === friend.name);

  return (
    <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#EDD6A9]">
              <img src={friend.avatar} alt={friend.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <h3 className="text-base font-bold">{friend.name}</h3>
              <p className="text-xs text-[#EDD6A9] flex items-center gap-1">
                <MapPin className="w-3 h-3" /> {friend.location}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2">
            <h4 className="font-bold text-[#56020A]">মায়ের পরিচিতি</h4>
            <p className="text-gray-700">{friend.bio}</p>
            <p className="text-[11px] text-gray-500">মিউচুয়াল ফ্রেন্ড: {friend.mutualFriendsCount} জন</p>

            <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-center gap-2 mt-2">
              <AlertCircle className="w-4 h-4 text-amber-700 shrink-0" />
              <span className="text-[11px] text-amber-800">গোপনীয়তা নীতি অনুযায়ী শিশুর জন্মতারিখ ও এলার্জি তথ্য এখানে প্রদর্শিত হয় না।</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onStartChat(friend);
              }}
              className="flex-1 py-2.5 bg-[#56020A] text-white font-bold rounded-xl flex items-center justify-center gap-2"
            >
              <MessageSquare className="w-4 h-4" /> মেসেজ পাঠান
            </button>
          </div>

          {/* Public Community Posts */}
          <div className="space-y-3">
            <h4 className="font-bold text-[#56020A]">কমিউনিটি পোস্টসমূহ ({friendPosts.length})</h4>
            {friendPosts.length === 0 ? (
              <p className="text-gray-500 text-center py-6">এই মায়ের কোনো প্রকাশ্য পোস্ট নেই।</p>
            ) : (
              friendPosts.map((p) => (
                <div key={p.id} className="bg-white p-3.5 rounded-xl border border-[#EDD6A9] space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-gray-400">
                    <span>{p.createdAt}</span>
                    <span className="text-[#375013] font-semibold">{p.topic}</span>
                  </div>
                  <p className="text-gray-800">{p.content}</p>
                  {p.mediaUrl && (
                    <img src={p.mediaUrl} alt="post media" className="w-full h-40 object-cover rounded-lg" />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
