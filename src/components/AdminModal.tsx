import React, { useEffect, useState } from 'react';
import { Complaint, ComplaintStatus, Contest, ContestSubmission, Order, Post, Product } from '../types';
import { X, Shield, Package, ShoppingBag, Gift, Users, FileText, CheckCircle2, Trash2 } from 'lucide-react';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import { COMPLAINT_STATUSES, ComplaintCard } from './profile/ComplaintsModal';

interface AdminModalProps {
  contests: Contest[];
  isOpen: boolean;
  onClose: () => void;
}

/** Admin console. Loads all users' posts and orders from the admin API (admins only). */
export const AdminModal: React.FC<AdminModalProps> = ({ contests, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'posts' | 'orders' | 'products' | 'contests' | 'complaints' | 'coupons'>('posts');
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [posts, setPosts] = useState<Post[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setLoadError('');
    babyCareService.admin
      .overview()
      .then((data) => {
        setPosts(data.posts);
        setOrders(data.orders);
        setProducts(data.products);
        setSubmissions(data.submissions);
        setComplaints(data.complaints || []);
      })
      .catch((err) => setLoadError(errorMessage(err)));
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    try {
      // Points were credited at checkout; cancelling reverses them on the server.
      const res = await babyCareService.admin.updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, ...res.order } : ord)));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleUpdateStock = (productId: string, newStock: number) => {
    const stock = Math.max(0, newStock);
    setProducts((prev) => prev.map((p) => (p.id === productId ? { ...p, stock } : p)));
    babyCareService.admin.updateProduct(productId, { stock }).catch((err) => alert(errorMessage(err)));
  };

  const handleUpdateComplaint = async (complaintId: string, data: { status?: ComplaintStatus; adminReply?: string }) => {
    try {
      const res = await babyCareService.admin.updateComplaint(complaintId, data);
      setComplaints((prev) => prev.map((c) => (c.id === complaintId ? res.complaint : c)));
      setReplyDrafts(({ [complaintId]: _, ...rest }) => rest);
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await babyCareService.admin.deletePost(postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
      <div className="bg-[#FAF6F0] rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
        {/* Header */}
        <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-[#EDD6A9]" />
            <div>
              <h2 className="text-lg font-bold">ডেমো অ্যাডমিন প্যানেল</h2>
              <p className="text-xs text-[#EDD6A9]">বেবি কেয়ার ও বেবি মসলা ম্যানেজমেন্ট কনসোল</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Admin Navigation */}
        <div className="flex border-b border-[#EDD6A9] bg-[#EDD6A9]/20 overflow-x-auto text-xs font-semibold text-[#56020A] scrollbar-none">
          <button
            onClick={() => setActiveTab('posts')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'posts' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            পোস্ট ও রিপোর্ট ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'orders' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            অর্ডার ও ডেলিভারি ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'products' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            প্রোডাক্ট ও স্টক ({products.length})
          </button>
          <button
            onClick={() => setActiveTab('contests')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'contests' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            কনটেস্ট ও সাবমিশন ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'complaints' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            অভিযোগ ({complaints.filter((c) => c.status !== 'resolved').length})
          </button>
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-3 whitespace-nowrap border-b-2 transition-colors ${
              activeTab === 'coupons' ? 'border-[#56020A] bg-white text-[#56020A]' : 'border-transparent'
            }`}
          >
            কুপন ও পয়েন্ট রুলস
          </button>
        </div>

        {/* Admin Content */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {loadError && (
            <p className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 p-3 rounded-xl">{loadError}</p>
          )}
          {activeTab === 'posts' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">কমিউনিটি পোস্ট মডারেশন</h3>
              {posts.map((post) => (
                <div key={post.id} className="bg-white p-4 rounded-xl border border-[#EDD6A9] flex items-center justify-between shadow-sm">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-[#56020A]">{post.authorName}</span>
                      <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded">{post.topic}</span>
                    </div>
                    <p className="text-xs text-gray-700 line-clamp-2">{post.content}</p>
                    <p className="text-[10px] text-gray-400 mt-1">{post.createdAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-green-700 bg-green-50 px-2 py-1 rounded">অনুমোদিত</span>
                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="পোস্ট ডিলিট করুন"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">অর্ডার ও ডেলিভারি স্ট্যাটাস ম্যানেজমেন্ট</h3>
              {orders.map((ord) => (
                <div key={ord.id} className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-3 shadow-sm">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-[#56020A]">অর্ডার #{ord.id} ({ord.createdAt})</span>
                    <span className="font-bold text-[#375013]">৳ {ord.totalAmount}</span>
                  </div>
                  <p className="text-xs text-gray-600">শিপিং ঠিকানা: {ord.shippingAddress}</p>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-xs font-semibold text-gray-700">স্ট্যাটাস পরিবর্তন:</span>
                    <select
                      value={ord.status}
                      onChange={(e) => handleUpdateOrderStatus(ord.id, e.target.value as Order['status'])}
                      className="text-xs border border-[#EDD6A9] rounded-lg p-1.5 bg-white font-medium"
                    >
                      <option value="pending">পেন্ডিং</option>
                      <option value="confirmed">নিশ্চিত</option>
                      <option value="shipped">শিপড</option>
                      <option value="delivered">ডেলিভারি সম্পন্ন</option>
                      <option value="cancelled">বাতিল (পয়েন্ট রিভার্স)</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">প্রোডাক্ট ও স্টক ম্যানেজমেন্ট</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {products.map((p) => (
                  <div key={p.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-[#56020A]">{p.name}</h4>
                        <p className="text-xs text-[#375013] font-semibold">৳ {p.price}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">স্টক:</span>
                      <input
                        type="number"
                        value={p.stock}
                        onChange={(e) => handleUpdateStock(p.id, parseInt(e.target.value) || 0)}
                        className="w-16 px-2 py-1 text-xs border border-[#EDD6A9] rounded font-mono font-bold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'contests' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">কনটেস্ট ও সাবমিশন</h3>
              {contests.map((c) => (
                <div key={c.id} className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2 shadow-sm">
                  <h4 className="text-sm font-bold text-[#56020A]">{c.title}</h4>
                  <p className="text-xs text-gray-600">{c.description}</p>
                  <p className="text-xs font-semibold text-[#375013]">পুরস্কার: {c.prize}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'complaints' && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-[#56020A]">ইউজারদের অভিযোগ</h3>
              {complaints.length === 0 && <p className="text-xs text-gray-500">কোনো অভিযোগ নেই।</p>}
              {complaints.map((c) => (
                <ComplaintCard
                  key={c.id}
                  complaint={c}
                  showUser
                  footer={
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-500">স্ট্যাটাস:</span>
                        <select
                          value={c.status}
                          onChange={(e) => handleUpdateComplaint(c.id, { status: e.target.value as ComplaintStatus })}
                          className="px-2 py-1 border border-[#EDD6A9] rounded-lg bg-white font-semibold text-[#56020A]"
                        >
                          {(Object.keys(COMPLAINT_STATUSES) as ComplaintStatus[]).map((s) => (
                            <option key={s} value={s}>
                              {COMPLAINT_STATUSES[s]}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={replyDrafts[c.id] ?? c.adminReply}
                          onChange={(e) => setReplyDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                          maxLength={1000}
                          placeholder="উত্তর লিখুন (ইউজার নোটিফিকেশনে পাবেন)"
                          className="flex-1 px-2.5 py-1.5 border border-[#EDD6A9] rounded-lg bg-[#FAF6F0] focus:outline-none"
                        />
                        <button
                          onClick={() => {
                            const reply = (replyDrafts[c.id] ?? c.adminReply).trim();
                            // Replying moves a fresh complaint along to "in progress".
                            handleUpdateComplaint(c.id, {
                              adminReply: reply,
                              ...(c.status === 'open' && reply ? { status: 'in_progress' as const } : {}),
                            });
                          }}
                          className="px-3 py-1.5 bg-[#56020A] text-white rounded-lg font-bold"
                        >
                          পাঠান
                        </button>
                      </div>
                    </div>
                  }
                />
              ))}
            </div>
          )}

          {activeTab === 'coupons' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2">
                <h3 className="text-sm font-bold text-[#56020A]">সক্রিয় কুপন কোড</h3>
                <div className="flex justify-between items-center text-xs bg-[#FAF6F0] p-3 rounded-lg">
                  <span className="font-mono font-bold text-[#56020A]">BABYCARE</span>
                  <span className="text-green-700 font-bold">৳ ৮,০০০ মেম্বারশিপ ফ্রি</span>
                </div>
              </div>

              <div className="bg-white p-4 rounded-xl border border-[#EDD6A9] space-y-2">
                <h3 className="text-sm font-bold text-[#56020A]">পয়েন্ট অর্জনের রুলস (ডেমো কনফিগারেশন)</h3>
                <ul className="text-xs text-gray-700 space-y-1 list-disc list-inside">
                  <li>অনুমোদিত পোস্ট: ২০ পয়েন্ট (সর্বোচ্চ দৈনিক ২টি)</li>
                  <li>মর্নিং কমেন্ট: ৫ পয়েন্ট (সর্বোচ্চ দৈনিক ৫টি)</li>
                  <li>যাচাইকৃত ভিডিও রিভিউ: ১০০ পয়েন্ট</li>
                  <li>সফল কেনাকাটা: প্রতি ১০ টাকায় ১ পয়েন্ট (ডেলিভারির পর)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
