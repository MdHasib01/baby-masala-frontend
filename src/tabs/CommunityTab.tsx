import React, { useState } from 'react';
import { Post, Comment, User, RewardTransaction } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Plus,
  ShieldCheck,
  Send,
  Trash2,
  Edit2,
  X,
  MoreVertical,
  Image as ImageIcon,
  Video,
  Globe,
  Lock,
  Smile,
  ThumbsUp,
  CornerDownRight,
  Copy,
  Check,
  AlertCircle,
  Utensils,
  ChevronRight
} from 'lucide-react';

interface CommunityTabProps {
  posts: Post[];
  onUpdatePosts: React.Dispatch<React.SetStateAction<Post[]>>;
  comments: Comment[];
  onUpdateComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  user: User;
  onAddRewardTx: (tx: RewardTransaction | null) => void;
  onOpenRecipes: () => void;
  onOpenTimeline?: (authorName: string) => void;
}

export const CommunityTab: React.FC<CommunityTabProps> = ({
  posts,
  onUpdatePosts,
  comments,
  onUpdateComments,
  user,
  onAddRewardTx,
  onOpenRecipes,
  onOpenTimeline,
}) => {
  const [selectedTopic, setSelectedTopic] = useState<'সব পোস্ট' | 'খাবার' | 'ঘুম' | 'বিকাশ' | 'মায়ের গল্প'>('সব পোস্ট');
  const [sortBy, setSortBy] = useState<'newest' | 'popular'>('newest');

  // Create/Edit post modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [newContent, setNewContent] = useState('');
  const [newTopic, setNewTopic] = useState<'খাবার' | 'ঘুম' | 'বিকাশ' | 'মায়ের গল্প'>('খাবার');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [audience, setAudience] = useState<'public' | 'private'>('public');
  const [formError, setFormError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(false);

  // Expanded post detail modal for full comments thread
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [commentMediaUrl, setCommentMediaUrl] = useState('');

  // Share modal state
  const [sharePost, setSharePost] = useState<Post | null>(null);
  const [shareText, setShareText] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Post menu dropdown state per post id
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Long text expansion state per post id
  const [expandedTexts, setExpandedTexts] = useState<Record<string, boolean>>({});

  // Reaction picker hover state
  const [reactionPickerPostId, setReactionPickerPostId] = useState<string | null>(null);

  const topics: ('সব পোস্ট' | 'খাবার' | 'ঘুম' | 'বিকাশ' | 'মায়ের গল্প')[] = [
    'সব পোস্ট',
    'খাবার',
    'ঘুম',
    'বিকাশ',
    'মায়ের গল্প',
  ];

  const filteredPosts = posts.filter((p) => {
    if (selectedTopic !== 'সব পোস্ট' && p.topic !== selectedTopic) return false;
    return true;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (sortBy === 'popular') {
      return b.likes + b.commentsCount - (a.likes + a.commentsCount);
    }
    // The server returns newest first and new posts are prepended, so keep that order.
    return 0;
  });

  const replacePost = (updated: Post) => {
    onUpdatePosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
    setActivePost((prev) => (prev && prev.id === updated.id ? updated : prev));
  };

  const handleReaction = async (postId: string, reactionType: string = 'like') => {
    setReactionPickerPostId(null);
    const original = posts.find((p) => p.id === postId);
    if (!original) return;

    // Optimistic toggle; the server's answer (and any points) replaces it.
    replacePost({
      ...original,
      likedByMe: !original.likedByMe,
      likes: original.likedByMe ? Math.max(0, original.likes - 1) : original.likes + 1,
    });
    try {
      const res = await babyCareService.reactToPost(postId);
      replacePost(res.post);
      onAddRewardTx(res.rewardTx);
    } catch (err) {
      replacePost(original);
      alert(errorMessage(err));
    }
  };

  const handleSavePost = async (postId: string) => {
    setMenuOpenId(null);
    try {
      const res = await babyCareService.toggleSavePost(postId);
      replacePost(res.post);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleHidePost = async (postId: string) => {
    setMenuOpenId(null);
    onUpdatePosts((prev) => prev.filter((p) => p.id !== postId));
    babyCareService.hidePost(postId).catch((err) => console.error('[hide post]', err));
  };

  const handleReportPost = async (postId: string) => {
    setMenuOpenId(null);
    try {
      await babyCareService.reportPost(postId);
      alert('পোস্টটি সফলভাবে রিপোর্ট করা হয়েছে। আমাদের টিম এটি পর্যালোচনা করবে।');
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleDeletePost = async (postId: string) => {
    setMenuOpenId(null);
    if (!window.confirm('আপনি কি নিশ্চিতভাবে এই পোস্টটি মুছে ফেলতে চান?')) return;
    try {
      await babyCareService.deletePost(postId);
      onUpdatePosts((prev) => prev.filter((p) => p.id !== postId));
      onUpdateComments((prev) => prev.filter((c) => c.postId !== postId));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleEditPostClick = (post: Post) => {
    setEditingPostId(post.id);
    setNewContent(post.content);
    setNewTopic(post.topic === 'সব পোস্ট' ? 'খাবার' : post.topic);
    setNewMediaUrl(post.mediaUrl || '');
    setShowCreateModal(true);
    setMenuOpenId(null);
  };

  const handlePublishPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) {
      setFormError('পোস্টের বিষয়বস্তু খালি রাখা যাবে না।');
      return;
    }

    setIsPublishing(true);
    setFormError('');

    try {
      const data = { content: newContent, topic: newTopic, mediaUrl: newMediaUrl || undefined };
      if (editingPostId) {
        const res = await babyCareService.updatePost(editingPostId, { ...data, mediaUrl: newMediaUrl });
        replacePost(res.post);
        setEditingPostId(null);
      } else {
        // Points (+5 text/image, +10 video) are awarded by the server.
        const res = await babyCareService.createPost(data);
        onUpdatePosts((prev) => [res.post, ...prev]);
        onAddRewardTx(res.rewardTx);
      }
    } catch (err) {
      setFormError(errorMessage(err));
      return;
    } finally {
      setIsPublishing(false);
    }

    setPublishSuccess(true);
    setTimeout(() => {
      setPublishSuccess(false);
      setNewContent('');
      setNewMediaUrl('');
      setShowCreateModal(false);
    }, 1000);
  };

  const handleAddComment = async (postId: string) => {
    const content = newCommentText.trim();
    if (!content) return;

    try {
      const res = await babyCareService.addComment(postId, content);
      onUpdateComments((prev) => [...prev, res.comment]);
      replacePost(res.post);
      onAddRewardTx(res.rewardTx);
      setNewCommentText('');
      setCommentMediaUrl('');
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleCopyLink = (postId: string) => {
    const shareUrl = `${window.location.origin}/community/post/${postId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  return (
    <div className="pb-28 max-w-2xl mx-auto px-3 sm:px-4 pt-3 space-y-4">
      {/* Recipe & Tips Quick Shortcut Banner */}
      <div
        onClick={onOpenRecipes}
        className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-3.5 rounded-2xl shadow-sm flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xs font-bold">রেসিপি ও পুষ্টি টিপস</h3>
            <p className="text-[10px] text-[#EDD6A9]">শিশুর বয়স অনুযায়ী স্বাস্থ্যকর খাবার ও রেসিপি দেখুন</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#EDD6A9]" />
      </div>

      {/* Facebook-inspired Compact Composer Box */}
      <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9]/60 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <img src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover border border-[#EDD6A9]" />
          <button
            onClick={() => {
              setEditingPostId(null);
              setNewContent('');
              setNewMediaUrl('');
              setShowCreateModal(true);
            }}
            className="flex-1 bg-[#FAF6F0] hover:bg-[#EDD6A9]/20 text-gray-500 text-left px-4 py-2.5 rounded-full text-xs font-medium border border-[#EDD6A9]/50 transition-colors"
          >
            কী শেয়ার করতে চান, {user.name.split(' ')[0]}?
          </button>
        </div>

        <div className="flex items-center justify-around pt-2 border-t border-gray-100 text-xs font-semibold text-[#56020A]">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-[#FAF6F0] transition-colors"
          >
            <ImageIcon className="w-4 h-4 text-[#375013]" /> ছবি বা ভিডিও
          </button>
          <button
            onClick={() => setSelectedTopic('খাবার')}
            className="flex items-center gap-1.5 py-1 px-3 rounded-lg hover:bg-[#FAF6F0] transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-[#D6AA4F]" /> রেসিপি টপিক
          </button>
        </div>
      </div>

      {/* Topic Filters & Feed Sorting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {topics.map((topic) => (
            <button
              key={topic}
              onClick={() => setSelectedTopic(topic)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedTopic === topic
                  ? 'bg-[#56020A] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
              }`}
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1 self-end sm:self-auto bg-white px-2.5 py-1 rounded-xl border border-[#EDD6A9] text-[11px] font-semibold text-gray-700">
          <span>সর্ট:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-transparent focus:outline-none text-[#56020A] font-bold"
          >
            <option value="newest">নতুন পোস্ট</option>
            <option value="popular">জনপ্রিয়</option>
          </select>
        </div>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center border border-[#EDD6A9] space-y-2">
            <AlertCircle className="w-8 h-8 text-gray-400 mx-auto" />
            <p className="text-xs text-gray-500">এই টপিকে বর্তমানে কোনো পোস্ট নেই। প্রথম পোস্টটি আপনি করতে পারেন!</p>
          </div>
        ) : (
          sortedPosts.map((post) => {
            const postComments = comments.filter((c) => c.postId === post.id);
            const isOwnPost = post.authorName === user.name;
            const isExpanded = expandedTexts[post.id];
            const isLongText = post.content.length > 180;

            return (
              <div key={post.id} className="bg-white rounded-2xl border border-[#EDD6A9]/60 shadow-sm overflow-hidden relative">
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between pb-2">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.authorAvatar}
                      alt={post.authorName}
                      onClick={() => onOpenTimeline?.(post.authorName)}
                      className="w-10 h-10 rounded-full object-cover border border-[#EDD6A9] cursor-pointer hover:opacity-90"
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4
                          onClick={() => onOpenTimeline?.(post.authorName)}
                          className="text-xs font-bold text-[#56020A] cursor-pointer hover:underline"
                        >
                          {post.authorName}
                        </h4>
                        {post.isVerifiedBuyer && (
                          <span className="bg-[#375013]/10 text-[#375013] text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-0.5">
                            <ShieldCheck className="w-3 h-3" /> মেম্বার
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <span>{post.createdAt}</span>
                        <span>·</span>
                        <span className="text-[#375013] font-medium">{post.topic}</span>
                        <span>·</span>
                        <Globe className="w-3 h-3 text-gray-400" />
                      </div>
                    </div>
                  </div>

                  {/* Three-dot menu */}
                  <div className="relative">
                    <button
                      onClick={() => setMenuOpenId(menuOpenId === post.id ? null : post.id)}
                      className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {menuOpenId === post.id && (
                      <div className="absolute right-0 top-8 bg-white rounded-xl shadow-xl border border-[#EDD6A9] py-1.5 w-40 z-20 text-xs font-semibold text-gray-700">
                        <button
                          onClick={() => handleSavePost(post.id)}
                          className="w-full text-left px-4 py-2 hover:bg-[#FAF6F0] flex items-center gap-2"
                        >
                          <Bookmark className="w-3.5 h-3.5" /> {post.savedByMe ? 'সেভ সরিয়ে নিন' : 'পোস্ট সেভ করুন'}
                        </button>
                        <button
                          onClick={() => handleHidePost(post.id)}
                          className="w-full text-left px-4 py-2 hover:bg-[#FAF6F0] text-gray-600"
                        >
                          ফিড থেকে লুকান
                        </button>
                        <button
                          onClick={() => handleReportPost(post.id)}
                          className="w-full text-left px-4 py-2 hover:bg-[#FAF6F0] text-red-600"
                        >
                          রিপোর্ট করুন
                        </button>
                        {isOwnPost && (
                          <>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={() => handleEditPostClick(post)}
                              className="w-full text-left px-4 py-2 hover:bg-[#FAF6F0] flex items-center gap-2 text-[#56020A]"
                            >
                              <Edit2 className="w-3.5 h-3.5" /> এডিট করুন
                            </button>
                            <button
                              onClick={() => handleDeletePost(post.id)}
                              className="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600"
                            >
                              <Trash2 className="w-3.5 h-3.5" /> ডিলিট করুন
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Post Content */}
                <div className="px-4 py-2 text-xs text-gray-800 leading-relaxed">
                  <p>
                    {isLongText && !isExpanded
                      ? `${post.content.slice(0, 160)}...`
                      : post.content}
                  </p>
                  {isLongText && (
                    <button
                      onClick={() => setExpandedTexts({ ...expandedTexts, [post.id]: !isExpanded })}
                      className="text-[#56020A] font-bold mt-1 hover:underline block"
                    >
                      {isExpanded ? 'সংক্ষিপ্ত করুন' : 'আরও দেখুন'}
                    </button>
                  )}
                </div>

                {/* Media Preview */}
                {post.mediaUrl && (
                  <div className="mt-2 bg-gray-100 max-h-80 overflow-hidden">
                    <img src={post.mediaUrl} alt="Post attachment" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Reaction Summary & Counts */}
                <div className="px-4 py-2.5 flex items-center justify-between text-[11px] text-gray-500 border-t border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="inline-flex items-center justify-center w-5 h-5 bg-[#56020A] text-white rounded-full text-[10px]">👍</span>
                    <span className="font-semibold text-gray-700">{post.likes} জন মা পছন্দ করেছেন</span>
                  </div>
                  <div className="flex gap-3">
                    <span>{post.commentsCount} কমেন্ট</span>
                    <span>·</span>
                    <span>১২ শেয়ার</span>
                  </div>
                </div>

                {/* Action Row: রিঅ্যাক্ট, কমেন্ট, শেয়ার */}
                <div className="px-2 py-1 border-t border-gray-100 grid grid-cols-3 gap-1 text-xs font-semibold text-gray-600 relative">
                  {/* Reaction Button with Picker */}
                  <div className="relative flex justify-center">
                    <button
                      onMouseEnter={() => setReactionPickerPostId(post.id)}
                      onClick={() => handleReaction(post.id)}
                      className={`w-full py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors ${
                        post.likedByMe ? 'text-[#56020A] bg-[#EDD6A9]/20 font-bold' : 'hover:bg-gray-100'
                      }`}
                    >
                      <ThumbsUp className={`w-4 h-4 ${post.likedByMe ? 'fill-[#56020A]' : ''}`} />
                      <span>{post.likedByMe ? 'পছন্দ হয়েছে' : 'রিঅ্যাক্ট'}</span>
                    </button>

                    {/* Reaction Picker on hover / long press */}
                    {reactionPickerPostId === post.id && (
                      <div
                        onMouseLeave={() => setReactionPickerPostId(null)}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white rounded-full shadow-xl border border-[#EDD6A9] px-3 py-1.5 flex items-center gap-2 z-30 animate-in fade-in zoom-in duration-150"
                      >
                        <button onClick={() => handleReaction(post.id, 'like')} className="hover:scale-125 transition-transform text-lg" title="ভালোলাগে">👍</button>
                        <button onClick={() => handleReaction(post.id, 'love')} className="hover:scale-125 transition-transform text-lg" title="ভালোবাসা">❤️</button>
                        <button onClick={() => handleReaction(post.id, 'care')} className="hover:scale-125 transition-transform text-lg" title="কেয়ার">🫂</button>
                        <button onClick={() => handleReaction(post.id, 'haha')} className="hover:scale-125 transition-transform text-lg" title="হাহা">😆</button>
                        <button onClick={() => handleReaction(post.id, 'wow')} className="hover:scale-125 transition-transform text-lg" title="বাহ">😲</button>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActivePost(post)}
                    className="py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>কমেন্ট</span>
                  </button>

                  <button
                    onClick={() => setSharePost(post)}
                    className="py-2 rounded-xl flex items-center justify-center gap-1.5 hover:bg-gray-100 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>শেয়ার</span>
                  </button>
                </div>

                {/* Preview of relevant comments */}
                {postComments.length > 0 && (
                  <div className="bg-[#FAF6F0] px-4 py-3 border-t border-gray-100 space-y-2">
                    <div className="flex items-start gap-2 text-xs">
                      <img
                        src={postComments[0].authorAvatar}
                        alt={postComments[0].authorName}
                        onClick={() => onOpenTimeline?.(postComments[0].authorName)}
                        className="w-6 h-6 rounded-full object-cover mt-0.5 cursor-pointer hover:opacity-90"
                      />
                      <div className="flex-1 bg-white p-2.5 rounded-2xl border border-[#EDD6A9]/40">
                        <span
                          onClick={() => onOpenTimeline?.(postComments[0].authorName)}
                          className="font-bold text-[#56020A] block cursor-pointer hover:underline"
                        >
                          {postComments[0].authorName}
                        </span>
                        <p className="text-gray-700 mt-0.5">{postComments[0].content}</p>
                      </div>
                    </div>

                    {postComments.length > 1 && (
                      <button
                        onClick={() => setActivePost(post)}
                        className="text-xs text-[#56020A] font-bold hover:underline pl-8 block"
                      >
                        সব কমেন্ট দেখুন ({postComments.length}টি)
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Post Detail / Comments Modal */}
      {activePost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold">{activePost.authorName}-এর পোস্ট ও কমেন্ট thread</h3>
              <button onClick={() => setActivePost(null)} className="p-1 rounded-full hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2">
                <div className="flex items-center gap-3">
                  <img src={activePost.authorAvatar} alt={activePost.authorName} className="w-9 h-9 rounded-full object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-[#56020A]">{activePost.authorName}</h4>
                    <p className="text-[10px] text-gray-400">{activePost.createdAt}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-800">{activePost.content}</p>
                {activePost.mediaUrl && (
                  <img src={activePost.mediaUrl} alt="attachment" className="rounded-lg max-h-60 w-full object-cover" />
                )}
              </div>

              {/* Comments Thread */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-[#56020A]">সকল কমেন্ট</h4>
                {comments.filter((c) => c.postId === activePost.id).length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">এখনো কোনো কমেন্ট করা হয়নি। প্রথম কমেন্টটি করুন!</p>
                ) : (
                  comments
                    .filter((c) => c.postId === activePost.id)
                    .map((comm) => (
                      <div key={comm.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9]/50 space-y-1 text-xs">
                        <div className="flex items-center justify-between">
                          <span
                            onClick={() => onOpenTimeline?.(comm.authorName)}
                            className="font-bold text-[#56020A] cursor-pointer hover:underline"
                          >
                            {comm.authorName}
                          </span>
                          <span className="text-[10px] text-gray-400">{comm.createdAt}</span>
                        </div>
                        <p className="text-gray-700">{comm.content}</p>
                      </div>
                    ))
                )}
              </div>
            </div>

            {/* Sticky comment input */}
            <div className="p-3 bg-white border-t border-[#EDD6A9] flex gap-2">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="একটি সুন্দর কমেন্ট লিখুন..."
                className="flex-1 px-3 py-2 text-xs bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-1 focus:ring-[#56020A]"
              />
              <button
                onClick={() => handleAddComment(activePost.id)}
                className="px-4 py-2 bg-[#56020A] text-white rounded-xl text-xs font-bold hover:bg-[#56020A]/90 transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {sharePost && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4 text-center">
            <h3 className="text-base font-bold text-[#56020A]">পোস্ট শেয়ার করুন</h3>
            <p className="text-xs text-gray-600">
              {sharePost.authorName}-এর পোস্টটি আপনার কমিউনিটিতে শেয়ার করুন বা লিংক কপি করুন।
            </p>

            <button
              onClick={() => {
                alert('পোস্টটি আপনার ফিডে সফলভাবে শেয়ার করা হয়েছে!');
                setSharePost(null);
              }}
              className="w-full py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow"
            >
              কমিউনিটিতে শেয়ার করুন
            </button>

            <button
              onClick={() => handleCopyLink(sharePost.id)}
              className="w-full py-3 bg-white border border-[#EDD6A9] text-[#56020A] font-bold text-xs rounded-xl flex items-center justify-center gap-2"
            >
              {copySuccess ? <Check className="w-4 h-4 text-green-700" /> : <Copy className="w-4 h-4" />}
              <span>{copySuccess ? 'লিংক কপি হয়েছে!' : 'পোস্টের লিংক কপি করুন'}</span>
            </button>

            <button
              onClick={() => setSharePost(null)}
              className="text-xs text-gray-500 underline pt-2"
            >
              বাতিল
            </button>
          </div>
        </div>
      )}

      {/* Create / Edit Post Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">
                {editingPostId ? 'পোস্ট এডিট করুন' : 'নতুন পোস্ট তৈরি করুন'}
              </h3>
              <button
                onClick={() => {
                  if (newContent.trim() && !window.confirm('আপনার অসমাপ্ত পোস্টটি বাতিল করতে চান?')) return;
                  setShowCreateModal(false);
                }}
                className="p-1 rounded-full hover:bg-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishPost} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">টপিক নির্বাচন করুন</label>
                <select
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value as any)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-lg focus:outline-none"
                >
                  <option value="খাবার">খাবার</option>
                  <option value="ঘুম">ঘুম</option>
                  <option value="বিকাশ">বিকাশ</option>
                  <option value="মায়ের গল্প">মায়ের গল্প</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">আপনার অভিজ্ঞতা লিখুন</label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="কী শেয়ার করতে চান মা?"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">ছবির লিংক (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={newMediaUrl}
                  onChange={(e) => setNewMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-lg"
                />
              </div>

              {formError && <p className="text-xs text-red-600">{formError}</p>}
              {publishSuccess && <p className="text-xs text-green-700 bg-green-50 p-2 rounded">পোস্ট সফলভাবে প্রকাশিত হয়েছে!</p>}

              <button
                type="submit"
                disabled={isPublishing}
                className="w-full py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors flex items-center justify-center gap-2"
              >
                {isPublishing ? 'প্রকাশ করা হচ্ছে...' : (editingPostId ? 'পরিবর্তন সেভ করুন' : 'পোস্ট প্রকাশ করুন (+২০ পয়েন্ট)')}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
