import React, { useRef, useState } from 'react';
import { User, FriendUser, Post, RewardTransaction } from '../../types';
import { babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import { ImageCropModal } from '../ImageCropModal';
import {
  ArrowLeft,
  Cake,
  Edit3,
  Eye,
  ImagePlus,
  Pencil,
  MapPin,
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  ShieldAlert,
  MoreVertical,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Trash2,
  X,
  Sparkles,
  Image as ImageIcon
} from 'lucide-react';

interface UserTimelineScreenProps {
  currentUser: User;
  onUpdateCurrentUser: (user: User) => void;
  targetUser: { type: 'me' | 'other'; friend?: FriendUser; authorName?: string };
  friends: FriendUser[];
  onUpdateFriends: (friends: FriendUser[]) => void;
  posts: Post[];
  onUpdatePosts: React.Dispatch<React.SetStateAction<Post[]>>;
  onAddRewardTx?: (tx: RewardTransaction | null) => void;
  onBack: () => void;
  onStartChat: (friend: FriendUser) => void;
}

export const UserTimelineScreen: React.FC<UserTimelineScreenProps> = ({
  currentUser,
  onUpdateCurrentUser,
  targetUser,
  friends,
  onUpdateFriends,
  posts,
  onUpdatePosts,
  onAddRewardTx,
  onBack,
  onStartChat,
}) => {
  // Determine if it's 'me'
  const isMe = targetUser.type === 'me' || targetUser.friend?.name === currentUser.name || targetUser.authorName === currentUser.name;

  // Resolve friend object or construct profile details
  const resolvedFriend: FriendUser = targetUser.friend || friends.find(
    (f) => f.name === targetUser.authorName
  ) || {
    id: 'user-' + Date.now(),
    name: targetUser.authorName || currentUser.name,
    avatar: currentUser.avatar,
    bio: 'মাতৃত্বের সুন্দর যাত্রায় বেবি কেয়ার কমিউনিটির একজন সদস্য।',
    location: 'ঢাকা, বাংলাদেশ',
    mutualFriendsCount: 3,
    friendshipStatus: 'none',
  };

  const displayName = isMe ? currentUser.name : resolvedFriend.name;
  const displayAvatar = isMe ? currentUser.avatar : resolvedFriend.avatar;
  const displayBio = isMe ? ((currentUser as any).bio || 'মাতৃত্বের সুদিন ও শিশু পরিচর্যা নিয়ে আমার অভিজ্ঞতা।') : resolvedFriend.bio;
  const displayLocation = isMe ? (currentUser.location || currentUser.addresses[0]?.details || 'ঢাকা, বাংলাদেশ') : resolvedFriend.location;

  const [activeTab, setActiveTab] = useState<'posts' | 'about' | 'photos'>('posts');
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editName, setEditName] = useState(displayName);
  const [editBio, setEditBio] = useState(displayBio);
  const [editAvatar, setEditAvatar] = useState(displayAvatar);
  const [editCover, setEditCover] = useState((currentUser as any).coverPhoto || 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&auto=format&fit=crop&q=80');

  // Post composer state for 'me'
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostMedia, setNewPostMedia] = useState('');
  const [postAudience, setPostAudience] = useState<'public' | 'friends'>('public');

  // Image lightbox view
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  // Profile info + Facebook-style photo change (menu → file → crop → saved right away)
  const [editLocation, setEditLocation] = useState(currentUser.location || '');
  const [editDob, setEditDob] = useState(currentUser.dateOfBirth || '');
  const [photoMenu, setPhotoMenu] = useState<'avatar' | 'cover' | null>(null);
  const [cropTarget, setCropTarget] = useState<{ kind: 'avatar' | 'cover'; file: File } | null>(null);
  const [photoSaving, setPhotoSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pickKind = useRef<'avatar' | 'cover'>('avatar');

  const choosePhotoFile = (kind: 'avatar' | 'cover') => {
    pickKind.current = kind;
    setPhotoMenu(null);
    fileInputRef.current?.click();
  };

  const savePhoto = async (kind: 'avatar' | 'cover', dataUrl: string) => {
    setCropTarget(null);
    setPhotoSaving(true);
    try {
      // The server uploads to Cloudinary and copies the avatar onto posts & comments.
      const res = await babyCareService.updateProfile(
        kind === 'avatar' ? { ...currentUser, avatar: dataUrl } : { ...currentUser, coverPhoto: dataUrl }
      );
      onUpdateCurrentUser(res.user);
      if (kind === 'avatar') setEditAvatar(res.user.avatar);
      else setEditCover(res.user.coverPhoto || dataUrl);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setPhotoSaving(false);
    }
  };

  const coverSrc = isMe
    ? editCover
    : 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=1200&auto=format&fit=crop&q=80';

  const formatBnDate = (ymd: string) => {
    const d = new Date(ymd + 'T00:00:00');
    return isNaN(d.getTime()) ? ymd : d.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  // Filter posts belonging to this user
  const userPosts = posts.filter((p) => p.authorName === displayName);

  // Filter post photos for Photos tab
  const userPhotos = posts
    .filter((p) => p.authorName === displayName && p.mediaUrl)
    .map((p) => p.mediaUrl as string);

  // Handle friend status updates for other users
  const currentFriendRecord = friends.find((f) => f.id === resolvedFriend.id || f.name === resolvedFriend.name) || resolvedFriend;

  const handleUpdateFriendship = (newStatus: FriendUser['friendshipStatus']) => {
    const updated = friends.map((f) =>
      f.id === currentFriendRecord.id || f.name === currentFriendRecord.name
        ? { ...f, friendshipStatus: newStatus }
        : f
    );
    if (!friends.some((f) => f.id === currentFriendRecord.id)) {
      updated.push({ ...currentFriendRecord, friendshipStatus: newStatus });
    }
    onUpdateFriends(updated);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    try {
      // The server sets author details and awards the posting points.
      const res = await babyCareService.createPost({
        content: newPostContent,
        topic: 'মায়ের গল্প',
        mediaUrl: newPostMedia || undefined,
      });
      onUpdatePosts((prev) => [res.post, ...prev]);
      onAddRewardTx?.(res.rewardTx);
      setNewPostContent('');
      setNewPostMedia('');
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!window.confirm('আপনি কি এই পোস্টটি মুছে ফেলতে চান?')) return;
    try {
      await babyCareService.deletePost(postId);
      onUpdatePosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleSaveProfileEdit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateCurrentUser({
      ...currentUser,
      name: editName,
      avatar: editAvatar,
      bio: editBio,
      coverPhoto: editCover,
      location: editLocation.trim(),
      dateOfBirth: editDob,
    });
    setShowEditProfileModal(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-hind selection:bg-[#EDD6A9] selection:text-[#56020A] pb-24">
      {/* Top Header */}
      <div className="bg-[#56020A] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-1.5 rounded-full hover:bg-white/10 text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold truncate max-w-[240px] sm:max-w-md">{displayName} - এর টাইমলাইন</h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto w-full bg-white shadow-sm border-x border-[#EDD6A9] flex flex-col">
        {/* Cover Photo & Avatar Section */}
        <div className="relative">
          <div className="h-48 sm:h-64 w-full bg-[#EDD6A9]/30 relative overflow-hidden">
            <img
              src={coverSrc}
              alt="Cover"
              className="w-full h-full object-cover cursor-pointer"
              onClick={() => (isMe ? setPhotoMenu('cover') : setLightboxImg(coverSrc))}
            />
            {isMe && <PhotoEditButton title="কভার ছবি পরিবর্তন" onClick={() => setPhotoMenu('cover')} className="absolute bottom-3 right-3" />}
          </div>

          {/* Profile Avatar */}
          <div className="px-4 pb-4 border-b border-[#EDD6A9] relative flex flex-col sm:flex-row items-center sm:items-end justify-between -mt-16 sm:-mt-20 gap-4">
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="relative shrink-0">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-white">
                  <img
                    src={displayAvatar}
                    alt={displayName}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => (isMe ? setPhotoMenu('avatar') : setLightboxImg(displayAvatar))}
                  />
                </div>
                {isMe && (
                  <PhotoEditButton
                    title="প্রোফাইল ছবি পরিবর্তন"
                    onClick={() => setPhotoMenu('avatar')}
                    className="absolute bottom-1 right-1"
                  />
                )}
                {photoSaving && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                    <div className="w-7 h-7 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h2 className="text-lg sm:text-xl font-bold text-[#56020A] flex items-center justify-center sm:justify-start gap-1.5">
                  {displayName}
                  <ShieldCheck className="w-5 h-5 text-[#375013]" />
                </h2>
                <p className="text-xs text-gray-500 flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#56020A]" /> {displayLocation}
                </p>
                <p className="text-xs text-[#375013] font-semibold mt-1">
                  {isMe ? '৫ জন ফ্রেন্ড' : `${currentFriendRecord.mutualFriendsCount + 2} জন ফ্রেন্ড`}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
              {isMe ? (
                <button
                  onClick={() => setShowEditProfileModal(true)}
                  className="px-4 py-2 bg-[#56020A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-[#56020A]/90"
                >
                  <Edit3 className="w-4 h-4" /> প্রোফাইল এডিট করুন
                </button>
              ) : (
                <>
                  {currentFriendRecord.friendshipStatus === 'friends' && (
                    <>
                      <button
                        onClick={() => {
                          onStartChat(currentFriendRecord);
                        }}
                        className="px-4 py-2 bg-[#56020A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                      >
                        <MessageSquare className="w-4 h-4" /> মেসেজ
                      </button>
                      <button
                        onClick={() => handleUpdateFriendship('none')}
                        className="px-3.5 py-2 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold border border-[#EDD6A9]"
                      >
                        ফ্রেন্ডস
                      </button>
                    </>
                  )}

                  {currentFriendRecord.friendshipStatus === 'request_received' && (
                    <>
                      <button
                        onClick={() => handleUpdateFriendship('friends')}
                        className="px-4 py-2 bg-[#375013] text-white rounded-xl text-xs font-bold"
                      >
                        গ্রহণ করুন
                      </button>
                      <button
                        onClick={() => handleUpdateFriendship('none')}
                        className="px-3 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                      >
                        বাতিল
                      </button>
                    </>
                  )}

                  {currentFriendRecord.friendshipStatus === 'none' && (
                    <button
                      onClick={() => handleUpdateFriendship('request_sent')}
                      className="px-4 py-2 bg-[#56020A] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <UserPlus className="w-4 h-4" /> ফ্রেন্ড রিকোয়েস্ট পাঠান
                    </button>
                  )}

                  {currentFriendRecord.friendshipStatus === 'request_sent' && (
                    <button
                      onClick={() => handleUpdateFriendship('none')}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl text-xs font-bold"
                    >
                      রিকোয়েস্ট পাঠানো হয়েছে (বাতিল)
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Timeline Navigation Tabs */}
        <div className="bg-white border-b border-[#EDD6A9] px-4 flex gap-6 text-xs font-bold text-[#56020A] sticky top-[57px] z-20">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'posts' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
            }`}
          >
            পোস্ট ({userPosts.length})
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'about' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
            }`}
          >
            পরিচিতি
          </button>
          <button
            onClick={() => setActiveTab('photos')}
            className={`py-3 border-b-2 transition-colors ${
              activeTab === 'photos' ? 'border-[#56020A] text-[#56020A]' : 'border-transparent text-gray-500'
            }`}
          >
            ছবি ({userPhotos.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 space-y-4 bg-[#FAF6F0] flex-1">
          {/* POSTS TAB */}
          {activeTab === 'posts' && (
            <div className="space-y-4">
              {/* Post Composer for 'me' */}
              {isMe && (
                <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
                  <div className="flex items-center gap-3">
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-10 h-10 rounded-full object-cover" />
                    <input
                      type="text"
                      value={newPostContent}
                      onChange={(e) => setNewPostContent(e.target.value)}
                      placeholder="আজ আপনার মনে কী চলছে, আপু?"
                      className="flex-1 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl px-4 py-2.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#56020A]"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newPostMedia}
                        onChange={(e) => setNewPostMedia(e.target.value)}
                        placeholder="ছবির লিংক (ঐচ্ছিক)"
                        className="px-3 py-1.5 text-[11px] bg-[#FAF6F0] border border-[#EDD6A9] rounded-lg w-48 sm:w-60 focus:outline-none"
                      />
                      <select
                        value={postAudience}
                        onChange={(e: any) => setPostAudience(e.target.value)}
                        className="px-2.5 py-1.5 text-[11px] bg-[#FAF6F0] border border-[#EDD6A9] rounded-lg text-gray-700 font-semibold"
                      >
                        <option value="public">সকলের জন্য উন্মুক্ত</option>
                        <option value="friends">ফ্রেন্ডস</option>
                      </select>
                    </div>

                    <button
                      onClick={handleCreatePost}
                      disabled={!newPostContent.trim()}
                      className="px-4 py-2 bg-[#56020A] text-white rounded-xl text-xs font-bold hover:bg-[#56020A]/90 transition-colors disabled:opacity-50"
                    >
                      পোস্ট করুন
                    </button>
                  </div>
                </div>
              )}

              {/* User Posts List */}
              {userPosts.length === 0 ? (
                <div className="bg-white p-8 rounded-2xl border border-[#EDD6A9] text-center space-y-2">
                  <p className="text-gray-500 text-xs">এই টাইমলাইনে এখনো কোনো পোস্ট নেই।</p>
                </div>
              ) : (
                userPosts.map((post) => (
                  <div key={post.id} className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover" />
                        <div>
                          <h4 className="text-xs font-bold text-[#56020A]">{post.authorName}</h4>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1">
                            <span>{post.createdAt}</span> • <span className="text-[#375013] font-semibold">{post.topic}</span>
                          </p>
                        </div>
                      </div>

                      {isMe && (
                        <button
                          onClick={() => handleDeletePost(post.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                          title="পোস্ট মুছুন"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-gray-800 leading-relaxed">{post.content}</p>

                    {post.mediaUrl && (
                      <div className="rounded-xl overflow-hidden border border-[#EDD6A9]/50 max-h-72">
                        <img
                          src={post.mediaUrl}
                          alt="Post attachment"
                          className="w-full h-full object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setLightboxImg(post.mediaUrl || null)}
                        />
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 text-[11px] text-gray-500">
                      <span>❤️ {post.likes} প্রতিক্রিয়া</span>
                      <span>💬 {post.commentsCount} কমেন্ট</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ABOUT TAB */}
          {activeTab === 'about' && (
            <div className="bg-white p-5 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-4">
              <h3 className="text-sm font-bold text-[#56020A]">মায়ের পরিচিত ও বিবরণী</h3>
              <div className="space-y-3 text-xs text-gray-700">
                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9]">
                  <p className="font-bold text-[#56020A] mb-1">জীবনী / বায়ো</p>
                  <p>{displayBio}</p>
                </div>
                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9]">
                  <p className="font-bold text-[#56020A] mb-1">এলাকা</p>
                  <p>{displayLocation}</p>
                </div>
                {isMe && currentUser.dateOfBirth && (
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9]">
                    <p className="font-bold text-[#56020A] mb-1">জন্মতারিখ (শুধু আপনি দেখতে পারবেন)</p>
                    <p>{formatBnDate(currentUser.dateOfBirth)}</p>
                  </div>
                )}
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-amber-800">
                    গোপনীয়তা নীতি অনুযায়ী শিশুর জন্মতারিখ, এলার্জি তথ্য, অর্ডার হিস্ট্রি এবং ডাক্তার কনভার্সেশন টাইমলাইনে প্রদর্শিত হয় না।
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* PHOTOS TAB */}
          {activeTab === 'photos' && (
            <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">পোস্টের ছবিসমূহ ({userPhotos.length})</h3>
              {userPhotos.length === 0 ? (
                <p className="text-gray-500 text-xs py-8 text-center">এই টাইমলাইনে কোনো ছবি নেই।</p>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {userPhotos.map((photoUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setLightboxImg(photoUrl)}
                      className="aspect-square rounded-xl overflow-hidden border border-[#EDD6A9] cursor-pointer hover:opacity-90 transition-opacity"
                    >
                      <img src={photoUrl} alt="Timeline photo" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div className="fixed inset-0 z-70 bg-black/90 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxImg(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 text-white rounded-full hover:bg-white/20"
          >
            <X className="w-6 h-6" />
          </button>
          <img src={lightboxImg} alt="Enlarged view" className="max-w-full max-h-[85vh] rounded-2xl object-contain shadow-2xl" />
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfileModal && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl border border-[#EDD6A9]">
            <div className="flex justify-between items-center border-b border-[#EDD6A9] pb-3">
              <h3 className="text-sm font-bold text-[#56020A]">প্রোফাইল এডিট করুন</h3>
              <button onClick={() => setShowEditProfileModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfileEdit} className="space-y-3 text-xs">
              {/* Cover + profile picture, laid out like the timeline header */}
              <div className="relative mb-12">
                <img src={editCover} alt="Cover" className="w-full aspect-[2.6] object-cover rounded-xl" />
                <PhotoEditButton title="কভার ছবি পরিবর্তন" onClick={() => choosePhotoFile('cover')} className="absolute bottom-2 right-2" />
                <div className="absolute -bottom-10 left-3">
                  <img src={editAvatar} alt="" className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md bg-white" />
                  <PhotoEditButton title="প্রোফাইল ছবি পরিবর্তন" onClick={() => choosePhotoFile('avatar')} className="absolute bottom-0 right-0" />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">মায়ের নাম</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">সংক্ষিপ্ত বায়ো</label>
                <textarea
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">এলাকা</label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={editLocation}
                    onChange={(e) => setEditLocation(e.target.value)}
                    maxLength={120}
                    placeholder="যেমন: মিরপুর, ঢাকা"
                    className="w-full p-2.5 pl-8 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-600 font-bold mb-1">জন্মতারিখ</label>
                <div className="relative">
                  <Cake className="w-4 h-4 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={editDob}
                    onChange={(e) => setEditDob(e.target.value)}
                    max={new Date(new Date().getFullYear() - 12, 11, 31).toISOString().slice(0, 10)}
                    className="w-full p-2.5 pl-8 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">জন্মতারিখ শুধু আপনি দেখতে পারবেন।</p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditProfileModal(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#56020A] text-white rounded-xl font-bold"
                >
                  সংরক্ষণ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Facebook-style photo change: hidden picker → menu → crop */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = '';
          if (file) setCropTarget({ kind: pickKind.current, file });
        }}
      />

      {photoMenu && (
        <div className="fixed inset-0 z-[65] bg-black/50 flex items-end sm:items-center justify-center" onClick={() => setPhotoMenu(null)}>
          <div className="bg-white w-full sm:max-w-sm rounded-t-2xl sm:rounded-2xl p-2 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => {
                setLightboxImg(photoMenu === 'cover' ? coverSrc : displayAvatar);
                setPhotoMenu(null);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF6F0] text-sm font-semibold text-gray-800"
            >
              <Eye className="w-5 h-5 text-[#56020A]" />
              {photoMenu === 'cover' ? 'কভার ছবি দেখুন' : 'প্রোফাইল ছবি দেখুন'}
            </button>
            <button
              onClick={() => choosePhotoFile(photoMenu)}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-[#FAF6F0] text-sm font-semibold text-gray-800"
            >
              <ImagePlus className="w-5 h-5 text-[#56020A]" />
              {photoMenu === 'cover' ? 'নতুন কভার ছবি দিন' : 'নতুন প্রোফাইল ছবি দিন'}
            </button>
          </div>
        </div>
      )}

      {cropTarget && (
        <ImageCropModal
          file={cropTarget.file}
          aspect={cropTarget.kind === 'cover' ? 2.6 : 1}
          circle={cropTarget.kind === 'avatar'}
          outputWidth={cropTarget.kind === 'cover' ? 1280 : 500}
          title={cropTarget.kind === 'cover' ? 'কভার ছবি ঠিক করুন' : 'প্রোফাইল ছবি ঠিক করুন'}
          onCancel={() => setCropTarget(null)}
          onDone={(url) => savePhoto(cropTarget.kind, url)}
        />
      )}
    </div>
  );
};

/** Small round pencil button over a photo (Facebook-style, icon only). */
const PhotoEditButton: React.FC<{ title: string; onClick: () => void; className?: string }> = ({ title, onClick, className = '' }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={(e) => {
      e.stopPropagation();
      onClick();
    }}
    className={`w-9 h-9 rounded-full bg-[#FAF6F0] border-2 border-white shadow-md flex items-center justify-center text-[#56020A] hover:bg-[#EDD6A9] transition-colors ${className}`}
  >
    <Pencil className="w-4 h-4" />
  </button>
);
