import React, { useMemo, useState } from 'react';
import { ExternalLink, Info } from 'lucide-react';
import { Product } from '../../types';
import { bn, Card, EmptyState, SearchInput, SectionHeader } from '../ui';

/** Read-only: products, prices and packs are managed in the Baby Masala store admin. */
export const ProductsSection: React.FC<{ products: Product[] }> = ({ products }) => {
  const [query, setQuery] = useState('');
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? products.filter((p) => p.name.toLowerCase().includes(q)) : products;
  }, [products, query]);

  return (
    <>
      <SectionHeader
        title="প্রোডাক্ট"
        subtitle={`স্টোরের ${bn(products.length)}টি পণ্য`}
        actions={<SearchInput value={query} onChange={setQuery} placeholder="পণ্য খুঁজুন…" />}
      />
      <Card className="p-4 mb-5 flex flex-col sm:flex-row sm:items-center gap-3 bg-[#EDD6A9]/25">
        <Info className="w-5 h-5 text-[#56020A] shrink-0 hidden sm:block" />
        <p className="text-sm text-gray-700 flex-1">
          শপের পণ্য, দাম ও প্যাক Baby Masala স্টোর থেকে আসে। পরিবর্তন করতে স্টোর অ্যাডমিন ব্যবহার করুন — অ্যাপের অর্ডারও সেখানে দেখা যাবে।
        </p>
        <a
          href="https://store.babymasalabd.com/admin"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-[#56020A] hover:bg-[#6d0812] text-white text-sm rounded-xl font-semibold whitespace-nowrap"
        >
          স্টোর অ্যাডমিন <ExternalLink className="w-4 h-4" />
        </a>
      </Card>

      {shown.length === 0 ? (
        <EmptyState text="কোনো পণ্য পাওয়া যায়নি।" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
          {shown.map((p) => (
            <Card key={p.id} className="overflow-hidden flex flex-col">
              <img src={p.image} alt={p.name} loading="lazy" className="aspect-square w-full object-cover bg-[#FAF6F0]" />
              <div className="p-3 flex-1 flex flex-col">
                <h4 className="text-sm font-semibold text-[#2D2327] line-clamp-2 flex-1">{p.name}</h4>
                <div className="flex items-end justify-between mt-2 gap-2">
                  <span className="font-bold text-[#375013]">৳{bn(p.price)}</span>
                  <span className="text-[11px] text-gray-500 text-right">
                    {(p.packs?.length || 1) > 1 ? `${bn(p.packs!.length)}টি প্যাক` : p.weight}
                  </span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
};
