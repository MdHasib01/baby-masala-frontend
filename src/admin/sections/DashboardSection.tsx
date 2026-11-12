import React from 'react';
import { AlertTriangle, Bot, ChevronRight, FileText, MessageSquareWarning, ShoppingBag, Trophy, Users, Wallet } from 'lucide-react';
import { Order, User } from '../../types';
import { AdminOverview, AdminStats } from '../../services/babyCareService';
import { COMPLAINT_CATEGORIES } from '../../components/profile/ComplaintsModal';
import type { SectionKey } from '../AdminApp';
import { bn, Card, Pill } from '../ui';
import { ORDER_STATUS, ORDER_STATUS_ORDER } from './OrdersSection';

/** Older servers send no `stats`; fall back to counting the (capped) lists. */
function statsOf(d: AdminOverview): AdminStats {
  if (d.stats) return d.stats;
  const byStatus = Object.fromEntries(
    ORDER_STATUS_ORDER.map((s) => [s, d.orders.filter((o) => o.status === s).length])
  ) as Record<Order['status'], number>;
  return {
    users: 0,
    newUsers7d: 0,
    aiPersonas: 0,
    posts: d.posts.length,
    posts7d: 0,
    orders: d.orders.length,
    ordersByStatus: byStatus,
    revenue: d.orders.filter((o) => o.status !== 'cancelled').reduce((sum, o) => sum + o.totalAmount, 0),
    openComplaints: d.complaints.filter((c) => c.status !== 'resolved').length,
    pendingSubmissions: d.submissions.filter((s) => s.status === 'pending').length,
  };
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'শুভ সকাল' : h < 17 ? 'শুভ দুপুর' : 'শুভ সন্ধ্যা';
};

const Tile: React.FC<{
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  onClick?: () => void;
}> = ({ label, value, sub, icon: Icon, onClick }) => {
  const body = (
    <div className="flex items-start justify-between gap-3 text-left">
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-gray-500 truncate">{label}</p>
        <p className="text-2xl sm:text-3xl font-bold text-[#2D2327] mt-1.5 tracking-tight">{value}</p>
        {sub && <p className="text-[11px] sm:text-xs text-gray-500 mt-1">{sub}</p>}
      </div>
      <div className="hidden sm:flex w-10 h-10 rounded-xl bg-[#EDD6A9]/40 text-[#56020A] items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
    </div>
  );
  return (
    <Card className={onClick ? 'hover:border-[#56020A]/30 hover:shadow-md transition' : ''}>
      {onClick ? (
        <button onClick={onClick} className="w-full p-4 sm:p-5 rounded-2xl">
          {body}
        </button>
      ) : (
        <div className="p-4 sm:p-5">{body}</div>
      )}
    </Card>
  );
};

export const DashboardSection: React.FC<{
  data: AdminOverview;
  user: User;
  onNavigate: (key: SectionKey) => void;
}> = ({ data, user, onNavigate }) => {
  const s = statsOf(data);
  const hasServerStats = Boolean(data.stats);
  const maxStatus = Math.max(1, ...ORDER_STATUS_ORDER.map((k) => s.ordersByStatus[k] || 0));
  const reported = data.posts.filter((p) => p.reportsCount > 0);
  const openComplaints = data.complaints.filter((c) => c.status !== 'resolved');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-[#2D2327]">
          {greeting()}, {user.name.split(' ')[0]} 👋
        </h2>
        <p className="text-sm text-gray-500 mt-1">আজকের বেবি কেয়ার কমিউনিটির সারসংক্ষেপ।</p>
      </div>

      {/* KPI tiles */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-4">
        {hasServerStats && (
          <Tile label="মোট ইউজার" value={bn(s.users)} sub={`গত ৭ দিনে +${bn(s.newUsers7d)}`} icon={Users} />
        )}
        <Tile
          label="মোট পোস্ট"
          value={bn(s.posts)}
          sub={hasServerStats ? `গত ৭ দিনে +${bn(s.posts7d)}` : undefined}
          icon={FileText}
          onClick={() => onNavigate('posts')}
        />
        <Tile
          label="মোট অর্ডার"
          value={bn(s.orders)}
          sub={`${bn(s.ordersByStatus.pending || 0)}টি পেন্ডিং`}
          icon={ShoppingBag}
          onClick={() => onNavigate('orders')}
        />
        <Tile label="মোট বিক্রি" value={`৳${bn(s.revenue)}`} sub="বাতিল অর্ডার ছাড়া" icon={Wallet} />
        <Tile
          label="খোলা অভিযোগ"
          value={bn(s.openComplaints)}
          icon={MessageSquareWarning}
          onClick={() => onNavigate('complaints')}
        />
        <Tile
          label="পেন্ডিং সাবমিশন"
          value={bn(s.pendingSubmissions)}
          icon={Trophy}
          onClick={() => onNavigate('contests')}
        />
        {hasServerStats && (
          <Tile label="AI ইউজার" value={bn(s.aiPersonas)} icon={Bot} onClick={() => onNavigate('ai')} />
        )}
        <Tile
          label="রিপোর্টেড পোস্ট"
          value={bn(reported.length)}
          icon={AlertTriangle}
          onClick={() => onNavigate('posts')}
        />
      </div>

      <div className="grid lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Orders by status */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="font-bold text-[#2D2327]">স্ট্যাটাস অনুযায়ী অর্ডার</h3>
          <p className="text-xs text-gray-500 mb-5">সব অর্ডার, মোট {bn(s.orders)}টি</p>
          <ul className="space-y-4">
            {ORDER_STATUS_ORDER.map((k) => {
              const n = s.ordersByStatus[k] || 0;
              return (
                <li key={k} title={`${ORDER_STATUS[k].label}: ${bn(n)}`}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <span className="text-gray-700">{ORDER_STATUS[k].label}</span>
                    <span className="font-semibold text-[#2D2327]">{bn(n)}</span>
                  </div>
                  <div className="h-2 rounded-full bg-[#EDD6A9]/30 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#56020A] transition-[width] duration-500"
                      style={{ width: `${(n / maxStatus) * 100}%` }}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>

        {/* Recent orders */}
        <Card className="lg:col-span-3 overflow-hidden">
          <div className="flex items-center justify-between px-5 pt-5 pb-3">
            <h3 className="font-bold text-[#2D2327]">সাম্প্রতিক অর্ডার</h3>
            <button
              onClick={() => onNavigate('orders')}
              className="text-xs font-semibold text-[#56020A] hover:underline flex items-center"
            >
              সব দেখুন <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {data.orders.length === 0 ? (
            <p className="px-5 pb-6 text-sm text-gray-400">এখনো কোনো অর্ডার নেই।</p>
          ) : (
            <ul className="divide-y divide-[#EDD6A9]/50">
              {data.orders.slice(0, 6).map((o) => (
                <li key={o.id} className="px-5 py-3 flex items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#2D2327] truncate">#{o.storeOrderNo || o.id}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {o.createdAt} · {o.items.length}টি পণ্য
                    </p>
                  </div>
                  <Pill className={ORDER_STATUS[o.status].style}>{ORDER_STATUS[o.status].label}</Pill>
                  <span className="text-sm font-bold text-[#2D2327] w-20 text-right">৳{bn(o.totalAmount)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Needs attention */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h3 className="font-bold text-[#2D2327]">মনোযোগ দরকার</h3>
          <button
            onClick={() => onNavigate('complaints')}
            className="text-xs font-semibold text-[#56020A] hover:underline flex items-center"
          >
            অভিযোগ দেখুন <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
        {openComplaints.length === 0 && reported.length === 0 ? (
          <p className="px-5 pb-6 text-sm text-gray-400">সব ঠিক আছে — খোলা অভিযোগ বা রিপোর্টেড পোস্ট নেই। 🎉</p>
        ) : (
          <ul className="divide-y divide-[#EDD6A9]/50">
            {openComplaints.slice(0, 5).map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onNavigate('complaints')}
                  className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-[#FAF6F0]"
                >
                  <MessageSquareWarning className="w-4 h-4 text-amber-700 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#2D2327]">
                      {COMPLAINT_CATEGORIES[c.category] || c.category}{' '}
                      <span className="font-normal text-gray-500">· {c.userName}</span>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-1">{c.details}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{c.createdAt}</span>
                </button>
              </li>
            ))}
            {reported.slice(0, 5).map((p) => (
              <li key={p.id}>
                <button
                  onClick={() => onNavigate('posts')}
                  className="w-full text-left px-5 py-3 flex items-start gap-3 hover:bg-[#FAF6F0]"
                >
                  <AlertTriangle className="w-4 h-4 text-red-700 mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#2D2327]">
                      {bn(p.reportsCount)}টি রিপোর্ট <span className="font-normal text-gray-500">· {p.authorName}</span>
                    </p>
                    <p className="text-xs text-gray-600 line-clamp-1">{p.content}</p>
                  </div>
                  <span className="text-[11px] text-gray-400 whitespace-nowrap">{p.createdAt}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};
