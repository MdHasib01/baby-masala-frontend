import React, { useState } from 'react';
import { Award, CalendarDays, Check, X } from 'lucide-react';
import { Contest, ContestSubmission } from '../../types';
import { babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import type { UpdateData } from '../AdminApp';
import { bn, Card, EmptyState, FilterTabs, Pill, SectionHeader } from '../ui';

const SUB_STATUS: Record<ContestSubmission['status'], { label: string; style: string }> = {
  pending: { label: 'অপেক্ষমাণ', style: 'bg-amber-50 text-amber-800' },
  approved: { label: 'অনুমোদিত', style: 'bg-green-50 text-green-700' },
  rejected: { label: 'বাতিল', style: 'bg-gray-100 text-gray-600' },
};

const isVideo = (url: string) => /^data:video\/|\.(mp4|webm|mov|m4v)(\?|$)/i.test(url) || url.includes('/video/upload/');

type Filter = 'all' | ContestSubmission['status'];

export const ContestsSection: React.FC<{
  contests: Contest[];
  submissions: ContestSubmission[];
  update: UpdateData;
}> = ({ contests, submissions, update }) => {
  const [filter, setFilter] = useState<Filter>('pending');
  const [busy, setBusy] = useState<string | null>(null);
  const contestTitle = (id: string) => contests.find((c) => c.id === id)?.title || 'কনটেস্ট';

  const setStatus = async (sub: ContestSubmission, status: ContestSubmission['status']) => {
    setBusy(sub.id);
    try {
      const res = await babyCareService.admin.updateSubmission(sub.id, status);
      update((d) => ({
        ...d,
        submissions: d.submissions.map((s) => (s.id === sub.id ? { ...s, ...res.submission } : s)),
      }));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const shown = submissions.filter((s) => filter === 'all' || s.status === filter);

  return (
    <>
      <SectionHeader title="কনটেস্ট ও সাবমিশন" subtitle="চলমান কনটেস্ট ও ইউজারদের জমা দেওয়া এন্ট্রি।" />

      {contests.length > 0 && (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 mb-8">
          {contests.map((c) => (
            <Card key={c.id} className="p-5 flex flex-col">
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-[#2D2327]">{c.title}</h3>
                <Pill className={c.status === 'active' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'}>
                  {c.status === 'active' ? 'চলমান' : 'শেষ'}
                </Pill>
              </div>
              <p className="text-sm text-gray-600 line-clamp-3 flex-1">{c.description}</p>
              <div className="mt-4 pt-3 border-t border-[#EDD6A9]/50 space-y-1.5 text-xs text-gray-600">
                <p className="flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-[#375013]" />
                  <span className="font-semibold text-[#375013]">{c.prize}</span>
                </p>
                {(c.startDate || c.endDate) && (
                  <p className="flex items-center gap-1.5">
                    <CalendarDays className="w-3.5 h-3.5 text-gray-400" />
                    {c.startDate} – {c.endDate}
                  </p>
                )}
                <p className="text-gray-500">{bn(submissions.filter((s) => s.contestId === c.id).length)}টি সাবমিশন</p>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="font-bold text-[#2D2327]">সাবমিশন</h3>
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'pending', label: 'অপেক্ষমাণ', count: submissions.filter((s) => s.status === 'pending').length },
            { value: 'approved', label: 'অনুমোদিত', count: submissions.filter((s) => s.status === 'approved').length },
            { value: 'rejected', label: 'বাতিল', count: submissions.filter((s) => s.status === 'rejected').length },
            { value: 'all', label: 'সব', count: submissions.length },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState text="এই তালিকায় কোনো সাবমিশন নেই।" />
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {shown.map((s) => (
            <Card key={s.id} className={`overflow-hidden flex flex-col ${busy === s.id ? 'opacity-60' : ''}`}>
              {s.mediaUrl &&
                (isVideo(s.mediaUrl) ? (
                  <video src={s.mediaUrl} controls preload="metadata" className="w-full aspect-video bg-black" />
                ) : (
                  <a href={s.mediaUrl} target="_blank" rel="noreferrer">
                    <img src={s.mediaUrl} alt="" loading="lazy" className="w-full aspect-video object-cover bg-[#FAF6F0]" />
                  </a>
                ))}
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-[#2D2327] truncate">{s.userName}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {contestTitle(s.contestId)} · {s.createdAt}
                    </p>
                  </div>
                  <Pill className={SUB_STATUS[s.status].style}>{SUB_STATUS[s.status].label}</Pill>
                </div>
                <p className="text-sm text-gray-700 mt-2 line-clamp-4 flex-1 whitespace-pre-line">{s.description}</p>
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => setStatus(s, 'approved')}
                    disabled={busy !== null || s.status === 'approved'}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-lg bg-[#375013] text-white hover:bg-[#2c400f] disabled:opacity-40"
                  >
                    <Check className="w-4 h-4" /> অনুমোদন
                  </button>
                  <button
                    onClick={() => setStatus(s, 'rejected')}
                    disabled={busy !== null || s.status === 'rejected'}
                    className="flex-1 inline-flex items-center justify-center gap-1 py-2 text-xs font-bold rounded-lg border border-red-200 text-red-700 hover:bg-red-50 disabled:opacity-40"
                  >
                    <X className="w-4 h-4" /> বাতিল
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
