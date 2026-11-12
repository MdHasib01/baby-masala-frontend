import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { Complaint, ComplaintStatus } from '../../types';
import { babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import { COMPLAINT_STATUSES, ComplaintCard } from '../../components/profile/ComplaintsModal';
import type { UpdateData } from '../AdminApp';
import { EmptyState, FilterTabs, SectionHeader, selectClass } from '../ui';

type Filter = 'unresolved' | ComplaintStatus | 'all';

export const ComplaintsSection: React.FC<{ complaints: Complaint[]; update: UpdateData }> = ({ complaints, update }) => {
  const [filter, setFilter] = useState<Filter>('unresolved');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);

  const save = async (id: string, data: { status?: ComplaintStatus; adminReply?: string }) => {
    setBusy(id);
    try {
      const res = await babyCareService.admin.updateComplaint(id, data);
      update((d) => ({ ...d, complaints: d.complaints.map((c) => (c.id === id ? res.complaint : c)) }));
      setDrafts(({ [id]: _, ...rest }) => rest);
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(null);
    }
  };

  const shown = complaints.filter(
    (c) => filter === 'all' || (filter === 'unresolved' ? c.status !== 'resolved' : c.status === filter)
  );
  const count = (s: ComplaintStatus) => complaints.filter((c) => c.status === s).length;

  return (
    <>
      <SectionHeader title="অভিযোগ" subtitle="উত্তর বা স্ট্যাটাস বদলালে ইউজার নোটিফিকেশন পান।" />
      <div className="mb-4">
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'unresolved', label: 'অমীমাংসিত', count: complaints.length - count('resolved') },
            ...(Object.keys(COMPLAINT_STATUSES) as ComplaintStatus[]).map((s) => ({
              value: s,
              label: COMPLAINT_STATUSES[s],
              count: count(s),
            })),
            { value: 'all', label: 'সব', count: complaints.length },
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState text="এই তালিকায় কোনো অভিযোগ নেই।" />
      ) : (
        <div className="grid gap-3 xl:grid-cols-2 items-start">
          {shown.map((c) => {
            const draft = drafts[c.id] ?? c.adminReply;
            const send = () => {
              const reply = draft.trim();
              // Replying moves a fresh complaint along to "in progress".
              void save(c.id, {
                adminReply: reply,
                ...(c.status === 'open' && reply ? { status: 'in_progress' as const } : {}),
              });
            };
            return (
              <div key={c.id} className={busy === c.id ? 'opacity-60' : ''}>
                <ComplaintCard
                  complaint={c}
                  showUser
                  footer={
                    <div className="space-y-2 pt-2 border-t border-[#EDD6A9]/50">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">স্ট্যাটাস:</span>
                        <select
                          value={c.status}
                          disabled={busy !== null}
                          onChange={(e) => save(c.id, { status: e.target.value as ComplaintStatus })}
                          className={selectClass}
                        >
                          {(Object.keys(COMPLAINT_STATUSES) as ComplaintStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {COMPLAINT_STATUSES[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <textarea
                          value={draft}
                          onChange={(e) => setDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                          maxLength={1000}
                          rows={2}
                          placeholder="উত্তর লিখুন (ইউজার নোটিফিকেশনে পাবেন)"
                          className="flex-1 min-w-0 px-3 py-2 text-xs border border-[#EDD6A9] rounded-lg bg-[#FAF6F0] focus:outline-none focus:ring-2 focus:ring-[#56020A]/20 resize-y"
                        />
                        <button
                          onClick={send}
                          disabled={busy !== null || draft.trim() === c.adminReply}
                          className="self-end inline-flex items-center gap-1 px-3 py-2 bg-[#56020A] hover:bg-[#6d0812] text-white rounded-lg font-bold disabled:opacity-40"
                        >
                          <Send className="w-3.5 h-3.5" /> পাঠান
                        </button>
                      </div>
                    </div>
                  }
                />
              </div>
            );
          })}
        </div>
      )}
    </>
  );
};
