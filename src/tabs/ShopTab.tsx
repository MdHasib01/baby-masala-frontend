import React, { useMemo, useState } from 'react';
import { Product, CartItem, Order, User, RewardTransaction, DeliveryArea } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  X,
  CheckCircle2,
  Star,
  Truck,
  Banknote,
  Package,
  ExternalLink,
  Leaf,
  Sparkles,
  Phone,
  MapPin,
  User as UserIcon,
} from 'lucide-react';

interface ShopTabProps {
  products: Product[];
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  orders: Order[];
  onUpdateOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  user: User;
  onAddRewardTx: (tx: RewardTransaction | null) => void;
  /** Store delivery charges by area. */
  delivery: Record<DeliveryArea, number>;
}

const bn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);
const taka = (n: number) => `৳ ${bn(n.toLocaleString('en-US'))}`;
const AREA_LABEL: Record<DeliveryArea, string> = { inside: 'ঢাকার ভিতরে', outside: 'ঢাকার বাইরে' };
const STATUS_LABEL: Record<Order['status'], string> = {
  pending: 'কনফার্মের অপেক্ষায়',
  confirmed: 'নিশ্চিত',
  shipped: 'পাঠানো হয়েছে',
  delivered: 'ডেলিভারি সম্পন্ন',
  cancelled: 'বাতিল',
};
const BD_MOBILE = /^01[3-9]\d{8}$/;
const normalizePhone = (raw: string) => {
  let p = raw.replace(/[০-৯]/g, (d) => String('০১২৩৪৫৬৭৮৯'.indexOf(d))).replace(/[\s()-]/g, '');
  if (p.startsWith('+880')) p = p.slice(3);
  else if (p.startsWith('880')) p = p.slice(2);
  return p;
};

/** All packs of a listing (older servers send none: the product is its only pack). */
const packsOf = (p: Product) => (p.packs?.length ? p.packs : [p]);

export const ShopTab: React.FC<ShopTabProps> = ({
  products,
  cart,
  onUpdateCart,
  orders,
  onUpdateOrders,
  user,
  onAddRewardTx,
  delivery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [selectedPackId, setSelectedPackId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showOrders, setShowOrders] = useState(false);

  // Checkout form
  const defaultAddress = user.addresses.find((a) => a.isDefault) || user.addresses[0];
  const [customerName, setCustomerName] = useState(user.name || '');
  const [phone, setPhone] = useState(user.addresses.find((a) => a.phone)?.phone || '');
  const [area, setArea] = useState<DeliveryArea>('inside');
  const [shippingAddress, setShippingAddress] = useState(defaultAddress?.details || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const categories = useMemo(() => ['সব', ...Array.from(new Set(products.map((p) => p.category).filter(Boolean)))], [products]);

  const q = searchQuery.trim().toLowerCase();
  const filteredProducts = products.filter((p) => {
    const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q);
    const matchesCat = selectedCategory === 'সব' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const cartCount = cart.reduce((a, c) => a + c.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = cart.length > 0 ? delivery[area] : 0;
  const finalTotal = subtotal + deliveryCharge;
  const pointsPreview = cart.reduce(
    (sum, i) => sum + (i.product.pointsEarned != null ? i.product.pointsEarned * i.quantity : Math.floor((i.product.price * i.quantity) / 10)),
    0
  );

  const openProduct = (p: Product) => {
    setActiveProduct(p);
    setSelectedPackId(packsOf(p)[0].id);
    setQuantity(1);
  };

  const addToCart = (pack: Product, qty = 1) => {
    const existing = cart.find((item) => item.product.id === pack.id);
    onUpdateCart(
      existing
        ? cart.map((item) => (item.product.id === pack.id ? { ...item, quantity: Math.min(99, item.quantity + qty) } : item))
        : [...cart, { product: { ...pack, packs: undefined }, quantity: Math.min(99, qty) }]
    );
    setShowCart(true);
  };

  const changeQty = (productId: string, delta: number) => {
    onUpdateCart(
      cart
        .map((item) => {
          if (item.product.id !== productId) return item;
          const next = item.quantity + delta;
          return next > 0 ? { ...item, quantity: Math.min(99, next) } : null;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0 || isPlacingOrder) return;
    const mobile = normalizePhone(phone);
    if (!customerName.trim()) return setCheckoutError('আপনার নাম লিখুন।');
    if (!BD_MOBILE.test(mobile)) return setCheckoutError('সঠিক ১১ ডিজিটের মোবাইল নম্বর দিন (যেমন: 01712345678)।');
    if (shippingAddress.trim().length < 5) return setCheckoutError('পূর্ণ ডেলিভারি ঠিকানা লিখুন।');

    // The store prices the order; points are calculated by our server.
    setIsPlacingOrder(true);
    setCheckoutError('');
    try {
      const res = await babyCareService.placeOrder({
        cart,
        customerName: customerName.trim(),
        phone: mobile,
        area,
        shippingAddress: shippingAddress.trim(),
        notes: orderNotes.trim() || undefined,
      });
      onUpdateOrders((prev) => [res.order, ...prev]);
      onAddRewardTx(res.rewardTx);
      setOrderSuccess(res.order);
      onUpdateCart([]);
      setOrderNotes('');
      setShowCheckout(false);
    } catch (err) {
      setCheckoutError(errorMessage(err));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  const activePacks = activeProduct ? packsOf(activeProduct) : [];
  const activePack = activePacks.find((p) => p.id === selectedPackId) || activePacks[0];

  return (
    <div className="pb-24 max-w-xl md:max-w-3xl mx-auto px-4 pt-4 space-y-4 font-hind">
      {/* Store banner */}
      <div className="rounded-2xl bg-gradient-to-br from-[#56020A] to-[#375013] text-white p-4 flex items-center gap-3 shadow-sm">
        <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shrink-0">
          <Leaf className="w-6 h-6 text-[#EDD6A9]" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold leading-tight">Baby Masala অফিসিয়াল স্টোর</p>
          <p className="text-[11px] text-white/80 mt-0.5">ক্যাশ অন ডেলিভারি · সারা বাংলাদেশে ডেলিভারি · প্রতি অর্ডারে পয়েন্ট</p>
        </div>
        <button
          onClick={() => setShowOrders(true)}
          className="shrink-0 flex items-center gap-1 bg-white/15 hover:bg-white/25 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors"
        >
          <Package className="w-3.5 h-3.5" /> আমার অর্ডার
        </button>
      </div>

      {/* Search & cart */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বেসিল, খিচুড়ি মিক্স বা কম্বো খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#56020A]"
          />
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative px-4 py-2.5 bg-[#56020A] text-white rounded-2xl text-xs font-bold shadow hover:bg-[#56020A]/90 flex items-center gap-1.5 whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>কার্ট</span>
          {cartCount > 0 && (
            <span className="bg-[#D6AA4F] text-[#56020A] min-w-5 h-5 px-1 rounded-full text-[10px] font-bold flex items-center justify-center">
              {bn(cartCount)}
            </span>
          )}
        </button>
      </div>

      {/* Categories */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-[#56020A] text-white shadow-sm'
                : 'bg-white text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Products */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#EDD6A9] p-8 text-center">
          <ShoppingBag className="w-8 h-8 text-[#EDD6A9] mx-auto" />
          <p className="text-sm font-bold text-[#56020A] mt-2">শপ এই মুহূর্তে লোড হচ্ছে না</p>
          <p className="text-xs text-gray-500 mt-1">একটু পরে আবার চেষ্টা করুন।</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <p className="text-xs text-gray-500 text-center py-10">কোনো পণ্য পাওয়া যায়নি। অন্য কিছু লিখে খুঁজে দেখুন।</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
          {filteredProducts.map((p) => {
            const packs = packsOf(p);
            const minPrice = Math.min(...packs.map((x) => x.price));
            return (
              <div
                key={p.id}
                onClick={() => openProduct(p)}
                className="bg-white rounded-2xl border border-[#EDD6A9]/60 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col group"
              >
                <div className="relative aspect-square bg-[#FAF6F0] overflow-hidden">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {p.badge && (
                    <span className="absolute top-2 left-2 max-w-[85%] truncate bg-[#56020A] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                      {p.badge}
                    </span>
                  )}
                  {p.originalPrice && p.originalPrice > p.price && (
                    <span className="absolute top-2 right-2 bg-[#D6AA4F] text-[#56020A] text-[10px] font-extrabold px-1.5 py-0.5 rounded-full">
                      -{bn(Math.round((1 - p.price / p.originalPrice) * 100))}%
                    </span>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <h3 className="text-xs font-bold text-[#56020A] line-clamp-2 leading-snug">{p.name}</h3>
                  <p className="text-[10px] text-gray-500 truncate">
                    {packs.length > 1 ? `${bn(packs.length)}টি প্যাক সাইজ` : p.weight}
                  </p>
                  {p.reviewsCount > 0 && (
                    <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                      <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                      <span>
                        {bn(p.rating)} ({bn(p.reviewsCount)})
                      </span>
                    </div>
                  )}
                  <div className="mt-auto pt-1 flex items-end justify-between gap-1">
                    <div className="min-w-0">
                      <span className="text-sm font-extrabold text-[#375013]">{taka(minPrice)}</span>
                      {packs.length > 1 && <span className="text-[10px] text-gray-500"> থেকে</span>}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (packs.length > 1) openProduct(p);
                        else addToCart(packs[0], 1);
                      }}
                      className="shrink-0 px-2.5 py-1.5 bg-[#EDD6A9] text-[#56020A] rounded-xl text-[11px] font-bold hover:bg-[#D6AA4F] transition-colors"
                    >
                      {packs.length > 1 ? 'বাছুন' : '+ কার্ট'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Product detail */}
      {activeProduct && activePack && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4"
          onClick={() => setActiveProduct(null)}
        >
          <div
            className="bg-[#FAF6F0] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[92vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden animate-sheet-up sm:animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-y-auto flex-1">
              <div className="relative aspect-[4/3] bg-white">
                <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
                <button
                  onClick={() => setActiveProduct(null)}
                  className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
                  aria-label="বন্ধ করুন"
                >
                  <X className="w-5 h-5" />
                </button>
                {activeProduct.badge && (
                  <span className="absolute bottom-3 left-3 bg-[#56020A] text-white text-[11px] font-bold px-2.5 py-1 rounded-full shadow">
                    {activeProduct.badge}
                  </span>
                )}
              </div>

              <div className="p-4 sm:p-5 space-y-4 text-xs">
                <div>
                  <h2 className="text-base font-bold text-[#56020A] leading-snug">{activeProduct.name}</h2>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-[11px] text-gray-600">
                    {activeProduct.age && <span className="font-semibold text-[#375013]">{activeProduct.age}</span>}
                    {activeProduct.reviewsCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {bn(activeProduct.rating)} · {bn(activeProduct.reviewsCount)} রিভিউ
                      </span>
                    )}
                  </div>
                </div>

                {/* Pack sizes */}
                <div className="space-y-2">
                  <p className="font-bold text-[#56020A]">প্যাক সাইজ</p>
                  <div className="grid gap-2">
                    {activePacks.map((pack) => {
                      const on = pack.id === activePack.id;
                      return (
                        <button
                          key={pack.id}
                          onClick={() => setSelectedPackId(pack.id)}
                          className={`flex items-center gap-3 text-left rounded-xl border px-3 py-2.5 transition-colors ${
                            on ? 'border-[#56020A] bg-white ring-1 ring-[#56020A]' : 'border-[#EDD6A9] bg-white/60 hover:bg-white'
                          }`}
                        >
                          <span className={`w-4 h-4 rounded-full border-2 shrink-0 ${on ? 'border-[#56020A] bg-[#56020A] shadow-[inset_0_0_0_2px_white]' : 'border-gray-300'}`} />
                          <span className="flex-1 min-w-0">
                            <span className="block font-bold text-[#2D2327] truncate">{pack.packLabel || pack.weight}</span>
                            {pack.packLabel && pack.packLabel !== pack.weight && (
                              <span className="block text-[10px] text-gray-500 truncate">{pack.weight}</span>
                            )}
                          </span>
                          <span className="text-right shrink-0">
                            <span className="block font-extrabold text-[#375013]">{taka(pack.price)}</span>
                            {pack.originalPrice && (
                              <span className="block text-[10px] text-gray-400 line-through">{taka(pack.originalPrice)}</span>
                            )}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {activeProduct.description && <p className="text-gray-700 leading-relaxed">{activeProduct.description}</p>}

                {!!activeProduct.includes?.length && (
                  <div className="space-y-1.5">
                    <p className="font-bold text-[#56020A]">কম্বোতে যা আছে</p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeProduct.includes.map((name) => (
                        <span key={name} className="bg-[#375013]/10 text-[#375013] font-semibold px-2.5 py-1 rounded-full">
                          {name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {(!!activeProduct.benefits?.length || activeProduct.howToUse) && (
                  <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] space-y-2">
                    {!!activeProduct.benefits?.length && (
                      <>
                        <h4 className="font-bold text-[#56020A] flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> উপকারিতা
                        </h4>
                        <ul className="space-y-1">
                          {activeProduct.benefits.map((b) => (
                            <li key={b} className="flex gap-2 text-gray-700">
                              <CheckCircle2 className="w-3.5 h-3.5 text-[#375013] shrink-0 mt-0.5" />
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </>
                    )}
                    {activeProduct.howToUse && (
                      <>
                        <h4 className="font-bold text-[#56020A] pt-1">ব্যবহারের নিয়ম</h4>
                        <p className="text-gray-600 leading-relaxed">{activeProduct.howToUse}</p>
                      </>
                    )}
                  </div>
                )}

                {activeProduct.storeUrl && (
                  <a
                    href={activeProduct.storeUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#56020A] underline"
                  >
                    স্টোরে বিস্তারিত দেখুন <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 bg-white border-t border-[#EDD6A9] flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#FAF6F0] border border-[#EDD6A9] rounded-xl px-2 py-1.5">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-0.5 text-[#56020A]" aria-label="কমান">
                  <Minus className="w-4 h-4" />
                </button>
                <span className="font-bold text-sm w-6 text-center">{bn(quantity)}</span>
                <button onClick={() => setQuantity(Math.min(99, quantity + 1))} className="p-0.5 text-[#56020A]" aria-label="বাড়ান">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
              <button
                onClick={() => {
                  addToCart(activePack, quantity);
                  setActiveProduct(null);
                }}
                className="flex-1 py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>কার্টে যোগ করুন · {taka(activePack.price * quantity)}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart */}
      {showCart && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowCart(false)}
        >
          <div
            className="bg-[#FAF6F0] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden animate-sheet-up sm:animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#EDD6A9]" /> আপনার শপিং কার্ট
              </h3>
              <button onClick={() => setShowCart(false)} className="p-1 rounded-full hover:bg-white/10 text-white" aria-label="বন্ধ করুন">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {cart.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">কার্ট খালি রয়েছে।</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] flex items-center gap-3 shadow-sm">
                    <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-[#56020A] line-clamp-1">{item.product.name}</h4>
                      <p className="text-[10px] text-gray-500 truncate">{item.product.packLabel || item.product.weight}</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {taka(item.product.price)} × {bn(item.quantity)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button onClick={() => changeQty(item.product.id, -1)} className="p-1 bg-gray-100 rounded text-gray-700" aria-label="কমান">
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{bn(item.quantity)}</span>
                      <button onClick={() => changeQty(item.product.id, 1)} className="p-1 bg-gray-100 rounded text-gray-700" aria-label="বাড়ান">
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 bg-white border-t border-[#EDD6A9] space-y-3">
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>সাবটোটাল:</span>
                    <span className="font-semibold">{taka(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" /> ডেলিভারি চার্জ:
                    </span>
                    <span>
                      ঢাকায় {taka(delivery.inside)} · বাইরে {taka(delivery.outside)}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
                    setCheckoutError('');
                    setShowCheckout(true);
                  }}
                  className="w-full py-3 bg-[#375013] text-white font-bold text-xs rounded-xl shadow hover:bg-[#375013]/90 transition-colors"
                >
                  চেকআউট করুন
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center sm:p-4">
          <div className="bg-[#FAF6F0] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-[#EDD6A9] p-5 space-y-4 animate-sheet-up sm:animate-pop-in">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">চেকআউট</h3>
              <button onClick={() => setShowCheckout(false)} className="p-1 rounded-full hover:bg-gray-200" aria-label="বন্ধ করুন">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3" noValidate>
              <div className="grid sm:grid-cols-2 gap-3">
                <label className="block">
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#56020A] mb-1">
                    <UserIcon className="w-3.5 h-3.5" /> নাম
                  </span>
                  <input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    maxLength={120}
                    autoComplete="name"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]/30"
                  />
                </label>
                <label className="block">
                  <span className="flex items-center gap-1 text-xs font-semibold text-[#56020A] mb-1">
                    <Phone className="w-3.5 h-3.5" /> মোবাইল নম্বর
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="01XXXXXXXXX"
                    maxLength={20}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]/30"
                  />
                </label>
              </div>

              <div>
                <span className="block text-xs font-semibold text-[#56020A] mb-1">ডেলিভারি এলাকা</span>
                <div className="grid grid-cols-2 gap-2">
                  {(['inside', 'outside'] as DeliveryArea[]).map((a) => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setArea(a)}
                      className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-colors ${
                        area === a ? 'bg-[#56020A] text-white border-[#56020A]' : 'bg-white text-gray-700 border-[#EDD6A9]'
                      }`}
                    >
                      {AREA_LABEL[a]}
                      <span className={`block text-[10px] font-semibold ${area === a ? 'text-[#EDD6A9]' : 'text-gray-500'}`}>
                        ডেলিভারি {taka(delivery[a])}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="flex items-center gap-1 text-xs font-semibold text-[#56020A] mb-1">
                  <MapPin className="w-3.5 h-3.5" /> পূর্ণ ঠিকানা
                </span>
                {user.addresses.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-1.5">
                    {user.addresses.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setShippingAddress(a.details);
                          if (a.phone) setPhone(a.phone);
                        }}
                        className="px-2.5 py-1 rounded-full bg-white border border-[#EDD6A9] text-[11px] font-semibold text-gray-700 hover:border-[#56020A]"
                      >
                        {a.title || 'ঠিকানা'}
                      </button>
                    ))}
                  </div>
                )}
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  maxLength={500}
                  placeholder="বাসা/রোড নম্বর, এলাকা, থানা, জেলা"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#56020A]/30"
                />
              </div>

              <label className="block">
                <span className="block text-xs font-semibold text-[#56020A] mb-1">অর্ডার নোট (ঐচ্ছিক)</span>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  maxLength={400}
                  placeholder="যেমন: বাসায় পৌঁছে ফোন করবেন"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </label>

              <div className="flex items-center gap-2 bg-white p-3 rounded-xl border border-[#EDD6A9] text-xs text-gray-700">
                <Banknote className="w-4 h-4 text-[#375013] shrink-0" />
                <span>
                  <b>ক্যাশ অন ডেলিভারি</b> — পণ্য হাতে পেয়ে টাকা দিন। কনফার্ম করতে আমরা আপনাকে ফোন করব।
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">সাবটোটাল ({bn(cartCount)}টি পণ্য):</span>
                  <span className="font-bold">{taka(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ডেলিভারি ({AREA_LABEL[area]}):</span>
                  <span className="font-bold">{taka(deliveryCharge)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100 font-bold text-[#56020A] text-sm">
                  <span>সর্বমোট:</span>
                  <span>{taka(finalTotal)}</span>
                </div>
                {pointsPreview > 0 && (
                  <p className="text-[11px] font-semibold text-[#375013] pt-1">এই অর্ডারে আপনি +{bn(pointsPreview)} পয়েন্ট পাবেন।</p>
                )}
              </div>

              {checkoutError && <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">{checkoutError}</p>}

              <button
                type="submit"
                disabled={isPlacingOrder || cart.length === 0}
                className="w-full py-3 bg-[#56020A] text-white font-bold text-sm rounded-xl shadow hover:bg-[#56020A]/90 transition-colors disabled:opacity-60"
              >
                {isPlacingOrder ? 'অর্ডার হচ্ছে...' : `অর্ডার কনফার্ম করুন · ${taka(finalTotal)}`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* My orders */}
      {showOrders && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setShowOrders(false)}
        >
          <div
            className="bg-[#FAF6F0] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden animate-sheet-up sm:animate-pop-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 flex items-center justify-between border-b border-[#EDD6A9]">
              <h3 className="text-sm font-bold text-[#56020A] flex items-center gap-2">
                <Package className="w-5 h-5" /> আমার অর্ডার
              </h3>
              <button onClick={() => setShowOrders(false)} className="p-1 rounded-full hover:bg-gray-200" aria-label="বন্ধ করুন">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {orders.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-10">এখনো কোনো অর্ডার করেননি।</p>
              ) : (
                orders.map((o) => (
                  <div key={o.id} className="bg-white rounded-xl border border-[#EDD6A9] p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#56020A]">#{o.storeOrderNo || o.id}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'cancelled'
                            ? 'bg-red-50 text-red-600'
                            : o.status === 'delivered'
                              ? 'bg-green-50 text-green-700'
                              : 'bg-[#EDD6A9]/50 text-[#56020A]'
                        }`}
                      >
                        {STATUS_LABEL[o.status] || o.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-600 line-clamp-2">
                      {o.items.map((i) => `${i.product.name} (${i.product.packLabel || i.product.weight}) × ${bn(i.quantity)}`).join(', ')}
                    </p>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-gray-500">{o.createdAt}</span>
                      <span className="font-bold text-[#375013]">{taka(o.totalAmount)}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Order placed */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-3 text-center animate-pop-in">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#56020A]">অর্ডার গ্রহণ করা হয়েছে!</h3>
            <p className="text-xs text-gray-700">
              অর্ডার নম্বর: <span className="font-bold">#{orderSuccess.storeOrderNo || orderSuccess.id}</span>
            </p>
            <p className="text-xs text-gray-600">
              কনফার্ম করতে আমরা {orderSuccess.phone ? bn(orderSuccess.phone) : 'আপনার'} নম্বরে ফোন করব। মোট {taka(orderSuccess.totalAmount)}, ক্যাশ অন
              ডেলিভারি।
            </p>
            {orderSuccess.pointsEarned > 0 && (
              <p className="text-xs font-semibold text-[#375013]">আপনি +{bn(orderSuccess.pointsEarned)} পয়েন্ট পেয়েছেন!</p>
            )}
            <button onClick={() => setOrderSuccess(null)} className="w-full py-2.5 bg-[#56020A] text-white font-bold text-xs rounded-xl">
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
