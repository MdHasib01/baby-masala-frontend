import React, { useMemo, useState } from 'react';
import { MapPin, Phone } from 'lucide-react';
import { Order } from '../../types';
import { AdminOverview, babyCareService } from '../../services/babyCareService';
import { errorMessage } from '../../services/api';
import type { UpdateData } from '../AdminApp';
import { bn, Card, EmptyState, FilterTabs, Pill, SearchInput, SectionHeader, selectClass } from '../ui';

export const ORDER_STATUS_ORDER: Order['status'][] = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export const ORDER_STATUS: Record<Order['status'], { label: string; style: string }> = {
  pending: { label: 'পেন্ডিং', style: 'bg-amber-50 text-amber-800' },
  confirmed: { label: 'নিশ্চিত', style: 'bg-blue-50 text-blue-700' },
  shipped: { label: 'শিপড', style: 'bg-indigo-50 text-indigo-700' },
  delivered: { label: 'ডেলিভারি সম্পন্ন', style: 'bg-green-50 text-green-700' },
  cancelled: { label: 'বাতিল', style: 'bg-gray-100 text-gray-600' },
};

type Filter = 'all' | Order['status'];

export const OrdersSection: React.FC<{ orders: AdminOverview['orders']; update: UpdateData }> = ({ orders, update }) => {
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter(
      (o) =>
        (filter === 'all' || o.status === filter) &&
        (!q ||
          [o.id, o.storeOrderNo, o.phone, o.shippingAddress].some((v) => v?.toLowerCase().includes(q)))
    );
  }, [orders, filter, query]);

  const setStatus = async (order: Order, status: Order['status']) => {
    if (status === 'cancelled' && !confirm('অর্ডারটি বাতিল করবেন? ইউজারের পয়েন্ট ফেরত নেওয়া হবে এবং এটি আর পরিবর্তন করা যাবে না।')) {
      return;
    }
    setSaving(order.id);
    try {
      // Points were credited at checkout; cancelling reverses them on the server.
      const res = await babyCareService.admin.updateOrderStatus(order.id, status);
      update((d) => ({ ...d, orders: d.orders.map((o) => (o.id === order.id ? { ...o, ...res.order } : o)) }));
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setSaving(null);
    }
  };

  return (
    <>
      <SectionHeader
        title="অর্ডার ও ডেলিভারি"
        subtitle="স্টোর অর্ডারের কুরিয়ার ও কনফার্মেশন স্টোর অ্যাডমিন থেকে হয়; এখানে অ্যাপের স্ট্যাটাস বদলান।"
        actions={<SearchInput value={query} onChange={setQuery} placeholder="অর্ডার নং, ফোন, ঠিকানা…" />}
      />
      <div className="mb-4">
        <FilterTabs<Filter>
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'সব', count: orders.length },
            ...ORDER_STATUS_ORDER.map((s) => ({
              value: s,
              label: ORDER_STATUS[s].label,
              count: orders.filter((o) => o.status === s).length,
            })),
          ]}
        />
      </div>

      {shown.length === 0 ? (
        <EmptyState text="কোনো অর্ডার পাওয়া যায়নি।" />
      ) : (
        <Card className="overflow-hidden">
          {/* Column headings (wide screens) */}
          <div className="hidden md:grid grid-cols-[1.2fr_2fr_0.8fr_1fr] gap-4 px-5 py-3 bg-[#FAF6F0] text-[11px] font-semibold uppercase tracking-wider text-gray-500 border-b border-[#EDD6A9]/60">
            <span>অর্ডার</span>
            <span>পণ্য ও ঠিকানা</span>
            <span className="text-right">মোট</span>
            <span>স্ট্যাটাস</span>
          </div>
          <ul className="divide-y divide-[#EDD6A9]/50">
            {shown.map((o) => (
              <li key={o.id} className="px-4 sm:px-5 py-4 grid md:grid-cols-[1.2fr_2fr_0.8fr_1fr] gap-x-4 gap-y-2 md:items-center">
                <div className="flex items-center justify-between md:block">
                  <div>
                    <p className="text-sm font-bold text-[#2D2327]">#{o.storeOrderNo || o.id}</p>
                    <p className="text-xs text-gray-500">{o.createdAt}</p>
                  </div>
                  <span className="md:hidden text-sm font-bold text-[#2D2327]">৳{bn(o.totalAmount)}</span>
                </div>
                <div className="min-w-0 text-xs text-gray-600 space-y-1">
                  <p className="text-[#2D2327] line-clamp-2">
                    {o.items.map((i) => `${i.product?.name ?? 'পণ্য'} × ${bn(i.quantity)}`).join(', ')}
                  </p>
                  <p className="flex items-start gap-1">
                    <MapPin className="w-3.5 h-3.5 mt-px shrink-0 text-gray-400" />
                    <span className="line-clamp-2">{o.shippingAddress}</span>
                  </p>
                  {o.phone && (
                    <p className="flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 shrink-0 text-gray-400" />
                      <a href={`tel:${o.phone}`} className="hover:underline">
                        {o.phone}
                      </a>
                    </p>
                  )}
                </div>
                <p className="hidden md:block text-sm font-bold text-[#2D2327] text-right">৳{bn(o.totalAmount)}</p>
                <div className="flex items-center gap-2">
                  {o.status === 'cancelled' ? (
                    <Pill className={ORDER_STATUS.cancelled.style}>{ORDER_STATUS.cancelled.label}</Pill>
                  ) : (
                    <select
                      value={o.status}
                      disabled={saving === o.id}
                      onChange={(e) => setStatus(o, e.target.value as Order['status'])}
                      className={`${selectClass} w-full md:w-auto disabled:opacity-50`}
                      aria-label="অর্ডারের স্ট্যাটাস"
                    >
                      {ORDER_STATUS_ORDER.map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS[s].label}
                          {s === 'cancelled' ? ' (পয়েন্ট রিভার্স)' : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
};
