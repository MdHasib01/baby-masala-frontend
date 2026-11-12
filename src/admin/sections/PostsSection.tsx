import React, { useMemo, useState } from 'react';
import { AlertTriangle, Bot, Heart, MessageCircle, Trash2 } from 'lucide-react';
import { Post } from '../../types';
import { AdminOverview, babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import type { UpdateData } from '../AdminApp';
import { bn, Card, EmptyState, FilterTabs, Pill, SearchInput, SectionHeader, selectClass } from '../ui';

const POST_STATUS: Record<Post['status'], { label: string; style: string }> = {
  approved: { label: 'অনুমোদিত', style: 'bg-green-50 text-green-700' },
  pending: { label: 'অপেক্ষমাণ', style: 'bg-amber-50 text-amber-800' },
  rejected: { label: 'বাতিল', style: 'bg-gray-100 text-gray-600' },
};

type Filter = 'all' | 'reported' | 'pending' | 'members' | 'ai';

export const PostsSection: React.FC<{ posts: AdminOverview['posts']; update: UpdateData }> = ({ posts, update }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [busy, setBusy] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return posts.filter((p) => {
      const pass =
        filter === 'all' ||
        (filter === 'reported' && p.reportsCount > 0) ||
        (filter === 'pending' && p.status === 'pending') ||
        (filter === 'members' && !p.isAi) ||
        (filter === 'ai' && p.isAi);
      return pass && (!q || p.content.toLowerCase().includes(q) || p.authorName.toLowerCase().includes(q));
    });
  }, [posts, filter, query]);

  const run = async (postId: string, action: () => Promise<void>) => {
    setBusy(postId);
    try {
      await action();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const setStatus = (p: Post, status: Post['status']) =>
    run(p.id, async () => {
      await babyCareService.admin.updatePostStatus(p.id, status);
      update((d) => ({ ...d, posts: d.posts.map((x) => (x.id === p.id ? { ...x, status } : x)) }));
    });

  const remove = (p: Post) => {
    if (!confirm('পোস্টটি ও এর সব কমেন্ট স্থায়ীভাবে ডিলিট করবেন?')) return;
    void run(p.id, async () => {
      await babyCareService.admin.deletePost(p.id);
      update((d) => ({ ...d, posts: d.posts.filter((x) => x.id !== p.id) }));
    });
  };

  const aiReply = (p: Post) =>
    run(p.id, async () => {
      await babyCareService.admin.ai.replyTo(p.id);
      update((d) => ({
        ...d,
        posts: d.posts.map((x) => (x.id === p.id ? { ...x, commentsCount: x.commentsCount + 1 } : x)),
      }));
    });

  return (
    <>
      <SectionHeader
        title="পোস্ট ও রিপোর্ট"
        subtitle="কমিউনিটি পোস্ট মডারেশন — সর্বশেষ ২০০টি পোস্ট।"
        actions={<SearchInput value={query} onChange={setQuery} placeholder="লেখা বা নাম খুঁজুন…" />}
      />
      <div className="mb-4">
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'সব', count: posts.length },
            { value: 'reported', label: 'রিপোর্টেড', count: posts.filter((p) => p.reportsCount > 0).length },
            { value: 'pending', label: 'অপেক্ষমাণ', count: posts.filter((p) => p.status === 'pending').length },
            { value: 'members', label: 'মেম্বার', count: posts.filter((p) => !p.isAi).length },
            { value: 'ai', label: 'AI', count: posts.filter((p) => p.isAi).length },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState text="কোনো পোস্ট পাওয়া যায়নি।" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2">
          {shown.map((p) => (
            <Card key={p.id} className={`p-4 flex gap-3 ${busy === p.id ? 'opacity-60' : ''}`}>
              <img
                src={p.authorAvatar}
                alt=""
                className="w-10 h-10 rounded-full object-cover bg-[#EDD6A9]/40 shrink-0"
                loading="lazy"
              />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-sm font-bold text-[#2D2327] truncate max-w-full">{p.authorName}</span>
                  {p.isAi && <Pill className="bg-[#56020A]/10 text-[#56020A]">AI</Pill>}
                  <Pill className="bg-gray-100 text-gray-600">{p.topic}</Pill>
                  {p.reportsCount > 0 && (
                    <Pill className="bg-red-50 text-red-700">
                      <AlertTriangle className="w-3 h-3" /> {bn(p.reportsCount)} রিপোর্ট
                    </Pill>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{p.createdAt}</p>
                <p className="text-sm text-gray-700 mt-2 whitespace-pre-line line-clamp-4">{p.content}</p>
                {p.mediaUrl && p.mediaType !== 'video' && (
                  <a href={p.mediaUrl} target="_blank" rel="noreferrer">
                    <img src={p.mediaUrl} alt="" loading="lazy" className="mt-2 h-28 rounded-lg object-cover border border-[#EDD6A9]/60" />
                  </a>
                )}
                <div className="mt-3 pt-3 border-t border-[#EDD6A9]/50 flex flex-wrap items-center gap-x-4 gap-y-2">
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <Heart className="w-3.5 h-3.5" /> {bn(p.likes)}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MessageCircle className="w-3.5 h-3.5" /> {bn(p.commentsCount)}
                  </span>
                  <div className="ml-auto flex items-center gap-1.5">
                    <select
                      value={p.status}
                      disabled={busy !== null}
                      onChange={(e) => setStatus(p, e.target.value as Post['status'])}
                      className={`${selectClass} ${POST_STATUS[p.status].style}`}
                      aria-label="পোস্টের স্ট্যাটাস"
                    >
                      {(Object.keys(POST_STATUS) as Post['status'][]).map((s) => (
                        <option key={s} value={s}>
                          {POST_STATUS[s].label}
                        </option>
                      ))}
                    </select>
                    {!p.isAi && (
                      <button
                        onClick={() => aiReply(p)}
                        disabled={busy !== null}
                        className="p-2 text-[#56020A] hover:bg-[#EDD6A9]/40 rounded-lg disabled:opacity-40"
                        title="AI ইউজার দিয়ে উত্তর দিন"
                        aria-label="AI ইউজার দিয়ে উত্তর দিন"
                      >
                        <Bot className={`w-4 h-4 ${busy === p.id ? 'animate-pulse' : ''}`} />
                      </button>
                    )}
                    <button
                      onClick={() => remove(p)}
                      disabled={busy !== null}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-40"
                      title="পোস্ট ডিলিট করুন"
                      aria-label="পোস্ট ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
