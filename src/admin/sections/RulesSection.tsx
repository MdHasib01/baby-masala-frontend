import React from 'react';
import { Ticket, Star } from 'lucide-react';
import { Card, SectionHeader } from '../ui';

const RULES = [
  { label: 'অনুমোদিত পোস্ট', value: '২০ পয়েন্ট', note: 'সর্বোচ্চ দৈনিক ২টি' },
  { label: 'মর্নিং কমেন্ট', value: '৫ পয়েন্ট', note: 'সর্বোচ্চ দৈনিক ৫টি' },
  { label: 'যাচাইকৃত ভিডিও রিভিউ', value: '১০০ পয়েন্ট', note: '' },
  { label: 'সফল কেনাকাটা', value: 'প্রতি ১০ টাকায় ১ পয়েন্ট', note: 'ডেলিভারির পর' },
];

export const RulesSection: React.FC = () => (
  <>
    <SectionHeader title="কুপন ও পয়েন্ট রুলস" subtitle="বর্তমান কনফিগারেশন (শুধু দেখার জন্য)।" />
    <div className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-start">
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Ticket className="w-5 h-5 text-[#56020A]" />
          <h3 className="font-bold text-[#2D2327]">সক্রিয় কুপন কোড</h3>
        </div>
        <div className="flex items-center justify-between gap-3 p-4 rounded-xl bg-[#FAF6F0] border border-dashed border-[#EDD6A9]">
          <span className="font-mono font-bold text-lg text-[#56020A] tracking-wider">BABYCARE</span>
          <span className="text-sm text-green-700 font-semibold text-right">৳ ৮,০০০ মেম্বারশিপ ফ্রি</span>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 px-5 pt-5 pb-3">
          <Star className="w-5 h-5 text-[#56020A]" />
          <h3 className="font-bold text-[#2D2327]">পয়েন্ট অর্জনের রুলস</h3>
        </div>
        <ul className="divide-y divide-[#EDD6A9]/50">
          {RULES.map((r) => (
            <li key={r.label} className="px-5 py-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-[#2D2327]">{r.label}</p>
                {r.note && <p className="text-xs text-gray-500">{r.note}</p>}
              </div>
              <span className="text-sm font-bold text-[#375013] text-right">{r.value}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  </>
);
