import React, { useState } from 'react';
import { Contest, ContestSubmission, GiftItem, GiftRedemption, RewardTransaction, Order, User, LeaderboardEntry } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import { Gift, Award, CheckCircle2, X, Sparkles, ChevronLeft, History, ShoppingBag } from 'lucide-react';

interface RewardsTabProps {
  contests: Contest[];
  submissions: ContestSubmission[];
  onUpdateSubmissions: React.Dispatch<React.SetStateAction<ContestSubmission[]>>;
  gifts: GiftItem[];
  onUpdateGifts: React.Dispatch<React.SetStateAction<GiftItem[]>>;
  rewardTx: RewardTransaction[];
  onAddRewardTx: (tx: RewardTransaction | null) => void;
  giftRedemptions: GiftRedemption[];
  onAddRedemption: (red: GiftRedemption) => void;
  leaderboard: LeaderboardEntry[];
  orders: Order[];
  user: User;
  onOpenTimeline?: (name: string) => void;
}

export const RewardsTab: React.FC<RewardsTabProps> = ({
  contests,
  submissions,
  onUpdateSubmissions,
  gifts,
  onUpdateGifts,
  rewardTx,
  onAddRewardTx,
  giftRedemptions,
  onAddRedemption,
  leaderboard,
  orders,
  user,
  onOpenTimeline,
}) => {
  const [internalTab, setInternalTab] = useState<'rewards' | 'contests'>('rewards');
  const [contestSubTab, setContestSubTab] = useState<'active' | 'my' | 'winners'>('active');
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);

  // Redeem catalog view state
  const [showRedeemCatalog, setShowRedeemCatalog] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  // Submission form state
  const [submissionDesc, setSubmissionDesc] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [selectedOrderId, setSelectedOrderId] = useState('');
  const [subError, setSubError] = useState('');
  const [subSuccess, setSubSuccess] = useState(false);

  // Redemption flow state inside Redeem Catalog
  const [selectedGift, setSelectedGift] = useState<GiftItem | null>(null);
  const [redemptionStep, setRedemptionStep] = useState<'details' | 'address' | 'success'>('details');
  const [deliveryAddress, setDeliveryAddress] = useState(user.addresses[0]?.details || 'রোড ৭/এ, ধানমন্ডি, ঢাকা - ১২০৯');
  const [deliveryCharge] = useState(50);
  const [redeemSuccessMsg, setRedeemSuccessMsg] = useState('');
  const [redeemError, setRedeemError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const earnedPoints = rewardTx.filter((t) => t.type === 'earn').reduce((a, b) => a + b.points, 0);
  const spentPoints = giftRedemptions.reduce((a, b) => a + b.pointsCost, 0);
  const currentBalance = earnedPoints - spentPoints;

  const deliveredOrders = orders.filter((ord) => ord.status === 'delivered');
  const hasDeliveredOrder = deliveredOrders.length > 0;

  // Leaderboard data ranked by total earned points
  const leaderboardMembers = leaderboard
    .map((entry) => (entry.isMe ? { ...entry, name: user.name, avatar: user.avatar, earned: earnedPoints } : entry))
    .sort((a, b) => b.earned - a.earned);

  const handleContestSubmit = async (e: React.FormEvent, contest: Contest) => {
    e.preventDefault();
    if (contest.eligibility === 'delivered_order' && !hasDeliveredOrder && !selectedOrderId) {
      setSubError('এই কনটেস্টে অংশগ্রহণের জন্য ডেলিভারি সম্পন্ন হওয়া অর্ডার নির্বাচন করা আবশ্যক।');
      return;
    }
    if (!submissionDesc.trim()) {
      setSubError('দয়া করে বিবরণ লিখুন।');
      return;
    }

    setIsSubmitting(true);
    setSubError('');
    try {
      // Eligibility and contest points are checked by the server.
      const res = await babyCareService.submitContestEntry(contest.id, {
        description: submissionDesc,
        mediaUrl: mediaUrl || undefined,
        orderId: selectedOrderId || undefined,
      });
      onUpdateSubmissions((prev) => [res.submission, ...prev]);
      onAddRewardTx(res.rewardTx);
    } catch (err) {
      setSubError(errorMessage(err));
      return;
    } finally {
      setIsSubmitting(false);
    }

    setSubSuccess(true);
    setSubmissionDesc('');
    setMediaUrl('');
    setTimeout(() => {
      setSubSuccess(false);
      setSelectedContest(null);
    }, 1500);
  };

  const handleRedeemGift = async () => {
    if (!selectedGift || isSubmitting) return;
    if (currentBalance < selectedGift.pointsCost) {
      setRedeemError('আপনার পর্যাপ্ত পয়েন্ট নেই!');
      return;
    }
    if (selectedGift.stock <= 0) {
      setRedeemError('এই গিফটটি বর্তমানে স্টকআউট রয়েছে।');
      return;
    }

    setIsSubmitting(true);
    setRedeemError('');
    try {
      // The server re-checks balance and stock atomically before deducting.
      const res = await babyCareService.redeemGift(selectedGift.id, deliveryAddress);
      onAddRedemption(res.redemption);
      onAddRewardTx(res.rewardTx);
      onUpdateGifts((prev) => prev.map((g) => (g.id === res.gift.id ? res.gift : g)));
      setRedeemSuccessMsg(`অভিনন্দন! ${selectedGift.name} সফলভাবে রিডিম করা হয়েছে।`);
      setRedemptionStep('success');
    } catch (err) {
      setRedeemError(errorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  // If Redeem Catalog view is active
  if (showRedeemCatalog) {
    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-3 space-y-4 font-hind">
        <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#EDD6A9] shadow-sm">
          <button
            onClick={() => {
              setShowRedeemCatalog(false);
              setSelectedGift(null);
            }}
            className="flex items-center gap-1.5 text-xs font-bold text-[#56020A] hover:opacity-80"
          >
            <ChevronLeft className="w-4 h-4" /> রিওয়ার্ডসে ফিরে যান
          </button>
          <div className="text-right">
            <span className="text-[10px] text-gray-500 block">উপলব্ধ ব্যালেন্স</span>
            <span className="text-xs font-bold text-[#56020A]">{currentBalance} পয়েন্ট</span>
          </div>
        </div>

        <div className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-4 rounded-2xl shadow-md">
          <h2 className="text-sm font-bold">রিডিম ক্যাটালগ</h2>
          <p className="text-xs text-[#EDD6A9] mt-0.5">আপনার অর্জিত পয়েন্ট দিয়ে পছন্দের প্রিমিয়াম হার্বস ও গিফট রিডিম করুন</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {gifts.map((gift) => (
            <div key={gift.id} className="bg-white rounded-2xl border border-[#EDD6A9] overflow-hidden shadow-sm flex flex-col justify-between">
              <div className="h-32 bg-gray-100 overflow-hidden relative">
                <img src={gift.image} alt={gift.name} className="w-full h-full object-cover" />
                <span className="absolute top-2 right-2 bg-[#56020A] text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                  {gift.pointsCost} পয়েন্ট
                </span>
              </div>
              <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#56020A]">{gift.name}</h4>
                  <p className="text-[11px] text-gray-500 mt-1">{gift.description}</p>
                </div>
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                  <span className={`text-[10px] font-bold ${gift.stock > 0 ? 'text-[#375013]' : 'text-red-600'}`}>
                    {gift.stock > 0 ? `স্টক: ${gift.stock}টি উপলব্ধ` : 'স্টক আউট'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGift(gift);
                      setRedemptionStep('details');
                      setRedeemSuccessMsg('');
                      setRedeemError('');
                    }}
                    disabled={currentBalance < gift.pointsCost || gift.stock <= 0}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                      currentBalance >= gift.pointsCost && gift.stock > 0
                        ? 'bg-[#375013] text-white hover:bg-[#375013]/90'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    রিডিম করুন
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Gift Detail / Redemption Flow Modal */}
        {selectedGift && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-[#56020A]">রিডিম: {selectedGift.name}</h3>
                <button onClick={() => setSelectedGift(null)} className="p-1 rounded-full hover:bg-gray-200">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {redemptionStep === 'details' && (
                <div className="space-y-3 text-xs">
                  <div className="flex gap-3 bg-white p-3 rounded-xl border border-[#EDD6A9]">
                    <img src={selectedGift.image} alt={selectedGift.name} className="w-16 h-16 rounded-lg object-cover" />
                    <div>
                      <h4 className="font-bold text-[#56020A]">{selectedGift.name}</h4>
                      <p className="text-gray-500 mt-0.5">{selectedGift.description}</p>
                      <p className="font-bold text-[#375013] mt-1">প্রয়োজনীয় পয়েন্ট: {selectedGift.pointsCost}</p>
                    </div>
                  </div>

                  <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 space-y-1">
                    <p className="font-bold text-amber-900">ডেলিভারি চার্জ (ডেমো): ৳ {deliveryCharge}</p>
                    <p className="text-amber-800 text-[10px]">পয়েন্ট দিয়ে গিফট অর্ডারের ক্ষেত্রে হোম ডেলিভারি চার্জ প্রযোজ্য।</p>
                  </div>

                  <button
                    onClick={() => setRedemptionStep('address')}
                    className="w-full py-3 bg-[#56020A] text-white font-bold rounded-xl shadow"
                  >
                    ঠিকানা নিশ্চিত করুন
                  </button>
                </div>
              )}

              {redemptionStep === 'address' && (
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-semibold text-[#56020A] mb-1">ডেলিভারি ঠিকানা</label>
                    <textarea
                      rows={3}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-[#EDD6A9] rounded-xl"
                    />
                  </div>

                  {redeemError && (
                    <p className="text-red-600 font-semibold bg-red-50 p-2 rounded-lg">{redeemError}</p>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setRedemptionStep('details')}
                      className="flex-1 py-2 bg-gray-200 text-gray-700 font-bold rounded-xl"
                    >
                      পেছনে
                    </button>
                    <button
                      onClick={handleRedeemGift}
                      disabled={isSubmitting}
                      className="flex-1 py-2 bg-[#375013] text-white font-bold rounded-xl shadow disabled:opacity-60"
                    >
                      {isSubmitting ? 'অপেক্ষা করুন...' : 'রিডিম কনফার্ম করুন'}
                    </button>
                  </div>
                </div>
              )}

              {redemptionStep === 'success' && (
                <div className="text-center space-y-3 py-4">
                  <div className="w-14 h-14 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-base font-bold text-[#56020A]">রিডেম্পশন সফল হয়েছে!</h4>
                  <p className="text-xs text-gray-600">{redeemSuccessMsg}</p>
                  <button
                    onClick={() => {
                      setSelectedGift(null);
                      setShowRedeemCatalog(false);
                    }}
                    className="w-full py-2.5 bg-[#56020A] text-white font-bold text-xs rounded-xl"
                  >
                    ঠিক আছে
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-3 space-y-4 font-hind">
      {/* Sub-navigation tabs: আমার রিওয়ার্ডস & কনটেস্ট */}
      <div className="flex bg-[#EDD6A9]/30 p-1 rounded-2xl border border-[#EDD6A9]">
        <button
          onClick={() => setInternalTab('rewards')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            internalTab === 'rewards' ? 'bg-[#56020A] text-white shadow-sm' : 'text-gray-700 hover:text-[#56020A]'
          }`}
        >
          আমার রিওয়ার্ডস
        </button>
        <button
          onClick={() => setInternalTab('contests')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
            internalTab === 'contests' ? 'bg-[#56020A] text-white shadow-sm' : 'text-gray-700 hover:text-[#56020A]'
          }`}
        >
          কনটেস্ট
        </button>
      </div>

      {internalTab === 'rewards' && (
        <div className="space-y-4">
          {/* 1. POINTS CARD with Redeem button beside available points */}
          <div className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-5 rounded-2xl shadow-md space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-[#EDD6A9]">উপলব্ধ পয়েন্ট ব্যালেন্স</p>
                <h3 className="text-3xl font-bold mt-1">{currentBalance} পয়েন্ট</h3>
              </div>
              <button
                onClick={() => setShowRedeemCatalog(true)}
                className="px-4 py-2.5 bg-[#D6AA4F] text-[#56020A] text-xs font-bold rounded-xl shadow hover:bg-[#EDD6A9] transition-colors flex items-center gap-1.5 whitespace-nowrap"
              >
                <Gift className="w-4 h-4" /> রিডিম করুন
              </button>
            </div>
            <div className="flex gap-4 pt-2 border-t border-white/20 text-xs text-[#EDD6A9]">
              <div>
                <p className="text-[10px]">মোট অর্জিত</p>
                <p className="font-bold text-white">+{earnedPoints} পয়েন্ট</p>
              </div>
              <div>
                <p className="text-[10px]">ব্যয়িত (গিফট)</p>
                <p className="font-bold text-white">-{spentPoints} পয়েন্ট</p>
              </div>
            </div>
          </div>

          {/* 2. POINT EARNING RULES (Immediately below points card) */}
          <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-2.5">
            <h3 className="text-xs font-bold text-[#56020A] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#D6AA4F]" /> পয়েন্ট পাবেন যেভাবে
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-gray-700">
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>টেক্সট বা ছবি পোস্ট</span>
                <span className="font-bold text-[#56020A]">+৫ পয়েন্ট</span>
              </li>
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>ভিডিও পোস্ট</span>
                <span className="font-bold text-[#56020A]">+১০ পয়েন্ট</span>
              </li>
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>পোস্ট রিঅ্যাকশন (লাইক)</span>
                <span className="font-bold text-[#56020A]">+২ পয়েন্ট</span>
              </li>
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>কমেন্ট</span>
                <span className="font-bold text-[#56020A]">+২ পয়েন্ট</span>
              </li>
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>শপ পার্চেস</span>
                <span className="font-bold text-[#56020A]">প্রোডাক্ট অনুযায়ী নির্দিষ্ট</span>
              </li>
              <li className="bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/50 flex items-center justify-between">
                <span>কনটেস্ট অংশগ্রহণ</span>
                <span className="font-bold text-[#56020A]">কনটেস্ট অনুযায়ী নির্দিষ্ট</span>
              </li>
            </ul>
          </div>

          {/* 3. LEADERBOARD (Directly below earning rules) */}
          <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-bold text-[#56020A] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#D6AA4F]" /> পয়েন্ট লিডারবোর্ড (সর্বমোট অর্জিত)
              </h3>
            </div>
            <div className="space-y-2">
              {leaderboardMembers.map((member, index) => {
                // Outside the top list, the server-computed rank is the real one.
                const isTrailingMe = member.isMe && index === leaderboardMembers.length - 1 && member.rank > index + 1;
                const rank = isTrailingMe ? member.rank : index + 1;
                const isTop3 = rank === 1 ? 'bg-amber-100 text-amber-900 border-amber-300' : rank <= 3 ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-[#FAF6F0] text-gray-700 border-[#EDD6A9]/50';
                return (
                  <div
                    key={member.userId}
                    onClick={() => onOpenTimeline?.(member.isMe ? 'me' : member.name)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer hover:border-[#56020A] transition-all ${
                      member.isMe ? 'bg-[#56020A]/10 border-[#56020A] font-bold' : isTop3
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${rank === 1 ? 'bg-[#D6AA4F] text-[#56020A]' : rank === 2 ? 'bg-gray-300 text-gray-800' : rank === 3 ? 'bg-amber-700 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {rank === 1 ? '১' : rank === 2 ? '২' : rank === 3 ? '৩' : rank}
                      </span>
                      <img src={member.avatar} alt={member.name} className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <p className={`text-xs ${member.isMe ? 'text-[#56020A] font-bold' : 'text-gray-800'}`}>
                          {member.name} {member.isMe && '(আপনি)'}
                        </p>
                        <p className="text-[10px] text-gray-500">র‍্যাংক #{rank}</p>
                      </div>
                    </div>
                    <span className="font-bold text-[#56020A]">{member.earned} পয়েন্ট</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Compact links for history & redemptions */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setShowHistoryModal(true)}
              className="flex-1 py-2.5 bg-white border border-[#EDD6A9] rounded-xl text-xs font-bold text-[#56020A] hover:bg-[#FAF6F0] transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <History className="w-4 h-4" /> রিডেম্পশন ও ট্রানজ্যাকশন ইতিহাস
            </button>
          </div>
        </div>
      )}

      {internalTab === 'contests' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {[
              { id: 'active', label: 'চলমান কনটেস্ট' },
              { id: 'my', label: 'আমার অংশগ্রহণ' },
              { id: 'winners', label: 'বিজয়ীগণ' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setContestSubTab(tab.id as any)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  contestSubTab === tab.id
                    ? 'bg-[#56020A] text-white shadow-sm'
                    : 'bg-white text-gray-700 border border-[#EDD6A9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {contestSubTab === 'active' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-4 rounded-2xl shadow-md">
                <h2 className="text-base font-bold">চলমান কনটেস্টসমূহ</h2>
                <p className="text-xs text-[#EDD6A9] mt-0.5">রেসিপি ও ভিডিও রিভিউ শেয়ার করে জিতে নিন আকর্ষণীয় পুরস্কার</p>
              </div>

              <div className="space-y-4">
                {contests.map((contest) => (
                  <div key={contest.id} className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="bg-[#375013]/10 text-[#375013] text-[10px] font-bold px-2 py-0.5 rounded">
                          {contest.status === 'active' ? 'চলমান' : 'সমাপ্ত'}
                        </span>
                        <h3 className="text-sm font-bold text-[#56020A] mt-1">{contest.title}</h3>
                      </div>
                      <span className="text-[11px] text-gray-500">{contest.endDate} পর্যন্ত</span>
                    </div>

                    <p className="text-xs text-gray-700">{contest.description}</p>
                    <p className="text-xs font-semibold text-[#375013]">পুরস্কার: {contest.prize}</p>

                    <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                      <span className="text-[11px] text-gray-500">
                        যোগ্যতা: {contest.eligibility === 'delivered_order' ? 'ডেলিভারি সম্পন্ন অর্ডার প্রয়োজন' : 'সকলের জন্য উন্মুক্ত'}
                      </span>
                      <button
                        onClick={() => setSelectedContest(contest)}
                        className="px-3.5 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl hover:bg-[#56020A]/90 transition-colors"
                      >
                        অংশগ্রহণ করুন (+৫০ পয়েন্ট)
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {contestSubTab === 'my' && (
            <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9] space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">আমার কনটেস্ট সাবমিশন</h3>
              {submissions.length === 0 ? (
                <p className="text-xs text-gray-500 py-4 text-center">আপনার কোনো সাবমিশন নেই।</p>
              ) : (
                <div className="space-y-2.5">
                  {submissions.map((sub) => (
                    <div key={sub.id} className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9]/50 flex justify-between items-center text-xs">
                      <div>
                        <p className="font-bold text-[#56020A]">সাবমিশন আইডি: #{sub.id}</p>
                        <p className="text-gray-600 line-clamp-1 mt-0.5">{sub.description}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{sub.createdAt}</p>
                      </div>
                      <span className="px-2.5 py-1 rounded-full font-bold text-[10px] bg-yellow-100 text-yellow-800">
                        {sub.status === 'pending' ? 'মডারেশন পেন্ডিং' : 'অনুমোদিত'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {contestSubTab === 'winners' && (
            <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9] space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">গত কনটেস্টের বিজয়ীবৃন্দ</h3>
              <div className="space-y-2.5">
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-amber-900">সেরা বেবি রেসিপি কনটেস্ট (অক্টোবর)</p>
                    <p className="text-amber-800">বিজয়ী: সুমাইয়া শারমিন (ধানমন্ডি, ঢাকা)</p>
                  </div>
                  <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full">১ম স্থান</span>
                </div>
                <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9] text-xs flex items-center justify-between">
                  <div>
                    <p className="font-bold text-[#56020A]">স্বাস্থ্যকর পুষ্টি টিপস কনটেস্ট (সেপ্টেম্বর)</p>
                    <p className="text-gray-600">বিজয়ী: ফারহানা সুলতানা (উত্তরা, ঢাকা)</p>
                  </div>
                  <span className="bg-[#EDD6A9] text-[#56020A] text-[10px] font-bold px-2 py-1 rounded-full">১ম স্থান</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Contest Submission Modal */}
      {selectedContest && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">{selectedContest.title}</h3>
              <button onClick={() => setSelectedContest(null)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => handleContestSubmit(e, selectedContest)} className="space-y-3">
              {selectedContest.eligibility === 'delivered_order' && (
                <div>
                  <label className="block text-xs font-semibold text-[#56020A] mb-1">ডেলিভারি সম্পন্ন অর্ডার নির্বাচন করুন</label>
                  <select
                    value={selectedOrderId}
                    onChange={(e) => setSelectedOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                  >
                    <option value="">-- অর্ডার সিলেক্ট করুন --</option>
                    {deliveredOrders.map((ord) => (
                      <option key={ord.id} value={ord.id}>অর্ডার #{ord.id} (৳ {ord.totalAmount})</option>
                    ))}
                  </select>
                  {!hasDeliveredOrder && (
                    <p className="text-[10px] text-red-600 mt-1">আপনার কোনো ডেলিভারি সম্পন্ন অর্ডার নেই।</p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">ভিডিও বা ছবির লিংক</label>
                <input
                  type="text"
                  value={mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">আপনার রেসিপি বা রিভিউ বিবরণ</label>
                <textarea
                  rows={4}
                  value={submissionDesc}
                  onChange={(e) => setSubmissionDesc(e.target.value)}
                  placeholder="বিস্তারিত লিখুন..."
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>

              {subError && <p className="text-xs text-red-600">{subError}</p>}
              {subSuccess && <p className="text-xs text-green-700 bg-green-50 p-2.5 rounded-xl font-bold">সাবমিশন সফল হয়েছে (+৫০ পয়েন্ট)!</p>}

              <button
                type="submit"
                className="w-full py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors"
              >
                সাবমিট করুন
              </button>
            </form>
          </div>
        </div>
      )}

      {/* History & Redemptions Modal */}
      {showHistoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">রিডেম্পশন ও ট্রানজ্যাকশন ইতিহাস</h3>
              <button onClick={() => setShowHistoryModal(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto space-y-4 flex-1 pr-1 text-xs">
              <div className="space-y-2">
                <h4 className="font-bold text-[#56020A]">আমার গিফট রিডেম্পশন</h4>
                {giftRedemptions.length === 0 ? (
                  <p className="text-gray-500 py-2">কোনো গিফট রিডিম করা হয়নি।</p>
                ) : (
                  giftRedemptions.map((red) => (
                    <div key={red.id} className="p-2.5 bg-white rounded-xl border border-[#EDD6A9]/50 flex justify-between items-center">
                      <div>
                        <p className="font-bold text-[#56020A]">{red.giftName}</p>
                        <p className="text-[10px] text-gray-500">খরচ: {red.pointsCost} পয়েন্ট</p>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        {red.status === 'pending' ? 'অনুরোধ করা হয়েছে' : red.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-2 pt-2 border-t border-[#EDD6A9]">
                <h4 className="font-bold text-[#56020A]">পয়েন্ট লেজার</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {rewardTx.map((tx) => (
                    <div key={tx.id} className="p-2.5 bg-white rounded-xl border border-[#EDD6A9]/50 flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-gray-800">{tx.description}</p>
                        <p className="text-[10px] text-gray-400">{tx.date}</p>
                      </div>
                      <span className={`font-bold ${tx.points > 0 ? 'text-[#375013]' : 'text-[#56020A]'}`}>
                        {tx.points > 0 ? `+${tx.points}` : tx.points}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHistoryModal(false)}
              className="w-full py-2.5 bg-[#56020A] text-white font-bold text-xs rounded-xl"
            >
              বন্ধ করুন
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
