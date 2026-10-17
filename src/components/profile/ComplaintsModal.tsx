import React, { useEffect, useRef, useState } from 'react';
import { ImagePlus, Inbox, MessageSquareWarning, X } from 'lucide-react';
import { Complaint, ComplaintCategory, ComplaintStatus } from '../../types';
import { babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import { fileToDataUrl } from '../../lib/image';

export const COMPLAINT_CATEGORIES: Record<ComplaintCategory, string> = {
  order: 'অর্ডার ও ডেলিভারি',
  product: 'প্রোডাক্টের মান',
  payment: 'পেমেন্ট ও পয়েন্ট',
  app: 'অ্যাপের সমস্যা',
  community: 'কমিউনিটি / কোনো ইউজার',
  other: 'অন্যান্য',
};

export const COMPLAINT_STATUSES: Record<ComplaintStatus, string> = {
  open: 'গ্রহণ করা হয়েছে',
  in_progress: 'প্রক্রিয়াধীন',
  resolved: 'সমাধান হয়েছে',
};

const STATUS_STYLE: Record<ComplaintStatus, string> = {
  open: 'bg-amber-50 text-amber-800',
  in_progress: 'bg-blue-50 text-blue-700',
  resolved: 'bg-green-50 text-green-700',
};

/** One complaint with its status and the admin's reply. Also used by the admin panel. */
export const ComplaintCard: React.FC<{ complaint: Complaint; showUser?: boolean; footer?: React.ReactNode }> = ({
  complaint: c,
  showUser = false,
  footer,
}) => (
  <div className="bg-white p-3.5 rounded-xl border border-[#EDD6A9] space-y-2 text-xs">
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="font-bold text-[#56020A]">{COMPLAINT_CATEGORIES[c.category] || c.category}</p>
        <p className="text-[10px] text-gray-400">
          {showUser ? `${c.userName} · ${c.userContact} · ${c.createdAt}` : `#${c.id} · ${c.createdAt}`}
        </p>
      </div>
      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap ${STATUS_STYLE[c.status]}`}>
        {COMPLAINT_STATUSES[c.status]}
      </span>
    </div>
    <p className="text-gray-700 whitespace-pre-line leading-relaxed">{c.details}</p>
    {c.attachmentUrl && (
      <a href={c.attachmentUrl} target="_blank" rel="noreferrer">
        <img src={c.attachmentUrl} alt="" className="h-28 rounded-lg object-cover border border-[#EDD6A9]" />
      </a>
    )}
    {c.adminReply && (
      <div className="bg-[#EDD6A9]/30 rounded-lg p-2.5">
        <p className="text-[10px] font-bold text-[#375013] mb-0.5">অ্যাডমিনের উত্তর</p>
        <p className="text-gray-700 whitespace-pre-line">{c.adminReply}</p>
      </div>
    )}
    {footer}
  </div>
);

interface ComplaintsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** "অভিযোগ ও সাপোর্ট": the user's complaints plus a form to file a new one. */
export const ComplaintsModal: React.FC<ComplaintsModalProps> = ({ isOpen, onClose }) => {
  const [items, setItems] = useState<Complaint[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [category, setCategory] = useState<ComplaintCategory | null>(null);
  const [details, setDetails] = useState('');
  const [attachment, setAttachment] = useState('');
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    setLoadError('');
    babyCareService
      .myComplaints()
      .then((r) => setItems(r.complaints))
      .catch((e) => setLoadError(errorMessage(e)));
  }, [isOpen]);

  if (!isOpen) return null;

  const resetForm = () => {
    setCategory(null);
    setDetails('');
    setAttachment('');
    setFormError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) return setFormError('অভিযোগের ধরন নির্বাচন করুন।');
    if (details.trim().length < 10) return setFormError('সমস্যাটি একটু বিস্তারিত লিখুন (কমপক্ষে ১০ অক্ষর)।');
    setSubmitting(true);
    setFormError('');
    try {
      const res = await babyCareService.createComplaint({
        category,
        details: details.trim(),
        attachmentUrl: attachment || undefined,
      });
      setItems((prev) => [res.complaint, ...(prev || [])]);
      resetForm();
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setFormError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MessageSquareWarning className="w-5 h-5 text-[#EDD6A9]" />
            <h3 className="text-sm font-bold">অভিযোগ ও সাপোর্ট</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-3 overflow-y-auto">
          {success && (
            <p className="p-2.5 bg-green-50 border border-green-200 text-green-800 text-xs rounded-xl font-bold">
              আপনার অভিযোগ জমা হয়েছে। আমরা দ্রুত দেখব।
            </p>
          )}

          {showForm ? (
            <form onSubmit={handleSubmit} className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 text-xs">
              <div>
                <p className="font-bold text-gray-600 mb-1.5">অভিযোগের ধরন</p>
                <div className="flex flex-wrap gap-1.5">
                  {(Object.keys(COMPLAINT_CATEGORIES) as ComplaintCategory[]).map((k) => (
                    <button
                      type="button"
                      key={k}
                      onClick={() => setCategory(k)}
                      className={`px-3 py-1.5 rounded-full font-semibold border transition-colors ${
                        category === k ? 'bg-[#56020A] text-white border-[#56020A]' : 'bg-white text-gray-700 border-[#EDD6A9]'
                      }`}
                    >
                      {COMPLAINT_CATEGORIES[k]}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-bold text-gray-600 mb-1">বিস্তারিত লিখুন</p>
                <textarea
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  rows={4}
                  maxLength={2000}
                  placeholder="কী সমস্যা হয়েছে? অর্ডার নম্বর থাকলে লিখুন।"
                  className="w-full p-2.5 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl focus:outline-none resize-none"
                />
              </div>
              <div>
                <p className="font-bold text-gray-600 mb-1">স্ক্রিনশট / ছবি (ঐচ্ছিক)</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    e.target.value = '';
                    if (!file) return;
                    try {
                      setAttachment(await fileToDataUrl(file));
                    } catch (err) {
                      setFormError(errorMessage(err));
                    }
                  }}
                />
                {attachment ? (
                  <div className="flex items-center gap-2">
                    <img src={attachment} alt="" className="w-16 h-16 rounded-lg object-cover border border-[#EDD6A9]" />
                    <button type="button" onClick={() => setAttachment('')} className="text-red-600 font-semibold">
                      ছবি সরান
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex items-center gap-1.5 px-3 py-2 border border-[#EDD6A9] rounded-xl font-semibold text-[#56020A]"
                  >
                    <ImagePlus className="w-4 h-4" /> ছবি যোগ করুন
                  </button>
                )}
              </div>
              {formError && <p className="text-red-600">{formError}</p>}
              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    resetForm();
                    setShowForm(false);
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-xl font-bold"
                >
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="px-4 py-2 bg-[#56020A] text-white rounded-xl font-bold disabled:opacity-60">
                  {submitting ? 'জমা হচ্ছে...' : 'অভিযোগ জমা দিন'}
                </button>
              </div>
            </form>
          ) : (
            <>
              <p className="text-[11px] text-blue-700 bg-blue-50 p-2.5 rounded-xl">
                অর্ডার, প্রোডাক্ট, পেমেন্ট, অ্যাপ বা কমিউনিটির যেকোনো সমস্যা আমাদের জানান। অ্যাডমিন উত্তর দিলে নোটিফিকেশন পাবেন।
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="w-full py-2.5 bg-[#56020A] text-white text-xs font-bold rounded-xl"
              >
                + নতুন অভিযোগ
              </button>
            </>
          )}

          {loadError && <p className="text-xs text-red-600">{loadError}</p>}
          {items === null && !loadError ? (
            <p className="text-xs text-gray-500 text-center py-6">লোড হচ্ছে...</p>
          ) : items && items.length === 0 ? (
            <div className="text-center py-6 text-gray-400 space-y-1">
              <Inbox className="w-8 h-8 mx-auto" />
              <p className="text-xs">এখনো কোনো অভিযোগ করেননি।</p>
            </div>
          ) : (
            items?.map((c) => <ComplaintCard key={c.id} complaint={c} />)
          )}
        </div>
      </div>
    </div>
  );
};
