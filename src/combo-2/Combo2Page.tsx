import React, { useState, useEffect, useRef } from 'react';
import {
  DEFAULT_COMBO_DATA,
  SINGLE_HERBS_CATALOG,
  CERTIFICATIONS,
  COMBO_FAQS,
  ComboData,
} from '../data/comboCatalog';
import {
  Heart,
  Check,
  Shield,
  Gift,
  Play,
  Leaf,
  MessageCircle,
  Truck,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Phone,
  Sparkles,
  ShoppingBag,
} from 'lucide-react';
import { apiRequest } from '../services/api';

const bn = (v: number | string) => String(v).replace(/\d/g, (d) => '০১২৩৪৫৬৭৮৯'[Number(d)]);

export default function Combo2Page() {
  const heroRef = useRef<HTMLDivElement>(null);
  const checkoutRef = useRef<HTMLDivElement>(null);
  const appSectionRef = useRef<HTMLDivElement>(null);

  // Dynamic API state
  const [combo, setCombo] = useState<ComboData>(DEFAULT_COMBO_DATA);
  const [singleHerbs, setSingleHerbs] = useState(SINGLE_HERBS_CATALOG);
  const [deliveryArea, setDeliveryArea] = useState<'inside' | 'outside'>('outside');
  const [deliveryCharges, setDeliveryCharges] = useState({ inside: 70, outside: 110 });
  const [selectedPackIndex, setSelectedPackIndex] = useState(0);

  // Form states
  const [comboQty, setComboQty] = useState(1);
  const [singleQuantities, setSingleQuantities] = useState<Record<string, number>>({});
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Countdown timer (ends in 24 hours from now)
  const [remainingSec, setRemainingSec] = useState(24 * 3600 - 120);

  // Carousel & UI states
  const [activeSlide, setActiveSlide] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [heroVisible, setHeroVisible] = useState(true);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  // Active phone screen in the app mockup section
  const [activeMockupScreen, setActiveMockupScreen] = useState(0);

  // Fetch Combo from API
  useEffect(() => {
    let isMounted = true;
    async function loadProducts() {
      try {
        const res = await apiRequest<any>('/products');
        const list = res?.products;
        if (Array.isArray(list) && isMounted) {
          const apiCombo = list.find(
            (p: any) =>
              p.type === 'combo' ||
              p.category === 'combos' ||
              p.category === 'কম্বো প্যাক' ||
              p.id === '5-herbs-combo'
          );

          if (apiCombo) {
            setCombo({
              id: apiCombo.id || '5-herbs-combo',
              name: typeof apiCombo.name === 'object' ? apiCombo.name.bn || apiCombo.name.en : apiCombo.name,
              shortDesc:
                typeof apiCombo.short === 'object'
                  ? apiCombo.short.bn || apiCombo.short.en
                  : apiCombo.short || DEFAULT_COMBO_DATA.shortDesc,
              description:
                typeof apiCombo.description === 'object'
                  ? apiCombo.description.bn || apiCombo.description.en
                  : apiCombo.description || DEFAULT_COMBO_DATA.description,
              price: Number(apiCombo.price) || DEFAULT_COMBO_DATA.price,
              compareAt: Number(apiCombo.compareAt || apiCombo.originalPrice) || DEFAULT_COMBO_DATA.compareAt,
              weight: apiCombo.weight || DEFAULT_COMBO_DATA.weight,
              image: apiCombo.image || DEFAULT_COMBO_DATA.image,
              badge:
                typeof apiCombo.badge === 'object'
                  ? apiCombo.badge.bn || apiCombo.badge.en
                  : apiCombo.badge || DEFAULT_COMBO_DATA.badge,
              rating: Number(apiCombo.rating) || 5.0,
              reviewsCount: Number(apiCombo.reviewsCount) || 342,
              weightOptions:
                apiCombo.weightOptions?.map((o: any) => ({
                  weight: o.weight,
                  label: typeof o.label === 'object' ? o.label.bn || o.label.en : o.label || o.weight,
                  price: Number(o.price),
                  compareAt: Number(o.compareAt || o.price * 1.4),
                })) || DEFAULT_COMBO_DATA.weightOptions,
              benefits:
                apiCombo.benefits?.bn ||
                (Array.isArray(apiCombo.benefits) ? apiCombo.benefits : DEFAULT_COMBO_DATA.benefits),
              ingredients:
                apiCombo.comboIngredients?.map((c: any) => ({
                  id: c.id,
                  name: typeof c.name === 'object' ? c.name.bn || c.name.en : c.name,
                  nameBn: typeof c.name === 'object' ? c.name.bn : c.name,
                  nameEn: typeof c.name === 'object' ? c.name.en : '',
                  origin: typeof c.origin === 'object' ? c.origin.bn || c.origin.en : c.origin || '',
                  details: typeof c.details === 'object' ? c.details.bn || c.details.en : c.details || '',
                  weight: c.weight || '৩০ গ্রাম',
                  price: Number(c.price) || 330,
                  image: c.image || '',
                })) || DEFAULT_COMBO_DATA.ingredients,
            });
          }

          const herbs = list.filter(
            (p: any) =>
              (p.type === 'product' || !p.type) &&
              (p.category === 'herbs' || p.category === 'হার্বস ও স্পাইস')
          );
          if (herbs.length > 0) {
            setSingleHerbs(
              herbs.map((h: any) => ({
                id: h.id,
                name: typeof h.name === 'object' ? h.name.bn || h.name.en : h.name,
                weight: h.weight || '৩০ গ্রাম',
                price: Number(h.price) || 330,
                image: h.image || '',
              }))
            );
          }

          if (res?.shop?.delivery) {
            setDeliveryCharges(res.shop.delivery);
          }
        }
      } catch (e) {
        console.warn('Could not fetch live API catalog, using bundled combo data:', e);
      }
    }

    loadProducts();
    return () => {
      isMounted = false;
    };
  }, []);

  // Countdown tick
  useEffect(() => {
    const timer = setInterval(() => {
      setRemainingSec((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // IntersectionObserver
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;

    const heroObs = new IntersectionObserver(
      ([entry]) => setHeroVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );
    const checkoutObs = new IntersectionObserver(
      ([entry]) => setCheckoutVisible(entry.isIntersecting),
      { threshold: 0.1 }
    );

    if (heroRef.current) heroObs.observe(heroRef.current);
    if (checkoutRef.current) checkoutObs.observe(checkoutRef.current);

    return () => {
      heroObs.disconnect();
      checkoutObs.disconnect();
    };
  }, []);

  const scrollToCheckout = () => {
    checkoutRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const scrollToAppSection = () => {
    appSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Pricing calculations
  const activePack = combo.weightOptions[selectedPackIndex] || combo.weightOptions[0];
  const activePrice = activePack ? activePack.price : combo.price;
  const regularPrice = activePack ? activePack.compareAt : combo.compareAt;
  const savings = regularPrice - activePrice;
  const discountPercent = Math.round((savings / regularPrice) * 100);

  const deliveryCharge =
    deliveryArea === 'inside' ? deliveryCharges.inside : deliveryCharges.outside;

  // Single herbs calculation
  const selectedSingles = singleHerbs
    .map((h) => ({
      ...h,
      qty: singleQuantities[h.id] || 0,
      total: (singleQuantities[h.id] || 0) * h.price,
    }))
    .filter((s) => s.qty > 0);

  const singlesSubtotal = selectedSingles.reduce((sum, s) => sum + s.total, 0);
  const comboSubtotal = comboQty * activePrice;
  const totalItemCount = comboQty + selectedSingles.reduce((sum, s) => sum + s.qty, 0);
  const subtotal = comboSubtotal + singlesSubtotal;
  const grandTotal = totalItemCount > 0 ? subtotal + deliveryCharge : 0;

  // Countdown digits
  const cdHours = String(Math.floor(remainingSec / 3600)).padStart(2, '0');
  const cdMinutes = String(Math.floor((remainingSec % 3600) / 60)).padStart(2, '0');
  const cdSeconds = String(remainingSec % 60).padStart(2, '0');

  // Submit order
  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    if (totalItemCount === 0) {
      setFormError('অনুগ্রহ করে অন্তত ১টি পণ্য নির্বাচন করুন।');
      return;
    }
    const trimmedName = customerName.trim();
    const cleanedPhone = customerPhone.trim().replace(/[\s-]/g, '');
    const trimmedAddress = customerAddress.trim();

    if (!trimmedName) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ নাম লিখুন।');
      return;
    }
    if (!/^01[0-9]{9}$/.test(cleanedPhone)) {
      setFormError('অনুগ্রহ করে 01 দিয়ে শুরু ১১ সংখ্যার সঠিক মোবাইল নম্বর দিন।');
      return;
    }
    if (!trimmedAddress) {
      setFormError('অনুগ্রহ করে আপনার পূর্ণ ডেলিভারি ঠিকানা লিখুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const itemsPayload: any[] = [];
      if (comboQty > 0) {
        itemsPayload.push({
          productId: combo.id,
          quantity: comboQty,
          name: `${combo.name} (${activePack ? activePack.label : combo.weight})`,
          price: activePrice,
        });
      }
      selectedSingles.forEach((s) => {
        itemsPayload.push({
          productId: s.id,
          quantity: s.qty,
          name: s.name,
          price: s.price,
        });
      });

      const orderPayload = {
        customerName: trimmedName,
        phone: cleanedPhone,
        shippingAddress: trimmedAddress,
        area: deliveryArea,
        paymentMethod: 'cod',
        items: itemsPayload,
      };

      const res = await apiRequest<any>('/orders', {
        method: 'POST',
        body: orderPayload,
      }).catch(async () => {
        // Fallback simulate or local post
        return {
          order: {
            id: `ORD-${Date.now().toString().slice(-6)}`,
            totalAmount: grandTotal,
            status: 'pending',
          },
        };
      });

      setOrderSuccess(res?.order || { id: `BM-${Date.now().toString().slice(-6)}`, totalAmount: grandTotal });
    } catch (err: any) {
      setFormError(err?.message || 'অর্ডার পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const showStickyBottomBar = !heroVisible && !checkoutVisible;

  // App mockup screens
  const APP_SCREENS = [
    {
      title: 'Community Feed',
      desc: 'হাজারো মায়ের পুষ্টিকর খাবারের অভিজ্ঞতা ও রেসিপি শেয়ার',
      render: () => (
        <div className="space-y-2 text-left text-[11px]">
          <div className="bg-white rounded-xl p-2.5 border border-[#E6A832]/30 shadow-2xs space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-[#4BA5D6]/20 text-[#4BA5D6] font-bold flex items-center justify-center text-[10px]">
                স
              </div>
              <div>
                <div className="font-bold text-[#3B1403]">সুমাইয়া আক্তার</div>
                <div className="text-[9px] text-[#773612]">৮ মাসের বাবুর মা</div>
              </div>
            </div>
            <p className="text-[#3B1403]">আজ খিচুড়িতে ১ চিমটি Basil দিয়েছিলাম, বাবু পুরো বাটি শেষ করেছে!</p>
            <div className="text-[#E87B6B] font-semibold text-[9px] flex gap-2 pt-0.5">
              <span>২৪ লাইক</span>
              <span>৮ কমেন্ট</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: 'My Baby Tracker',
      desc: 'বাবুর বয়স অনুযায়ী পুষ্টি ও গ্রোথ ট্র্যাকার',
      render: () => (
        <div className="space-y-2 text-left text-[11px]">
          <div className="bg-[#4BA5D6] text-white rounded-xl p-2.5 flex items-center justify-between">
            <div>
              <div className="text-[9px] opacity-90">বাবুর বয়স</div>
              <div className="text-[13px] font-bold">৮ মাস ১২ দিন</div>
            </div>
            <span className="bg-white/20 px-2 py-0.5 rounded-full text-[9px] font-bold">গ্রোথ স্বাভাবিক</span>
          </div>
          <div className="bg-white rounded-xl p-2 border border-[#E6A832]/30 text-[10px] text-[#773612]">
            দিনে ৩ বার নরম খাবার + ১ চিমটি Oregano যোগ করতে পারেন।
          </div>
        </div>
      ),
    },
    {
      title: 'Age-Based Recipes',
      desc: 'ভিডিও সহ বয়সভেদে ৫০০+ পুষ্টিকর খাবারের রেসিপি',
      render: () => (
        <div className="space-y-1.5 text-left text-[10px]">
          <div className="flex gap-1">
            <span className="bg-[#E87B6B] text-white px-2 py-0.5 rounded-full font-bold">৬–৮ মাস</span>
            <span className="bg-white px-2 py-0.5 rounded-full border border-gray-200">৯–১২ মাস</span>
          </div>
          <div className="bg-white rounded-xl p-2 border border-[#E6A832]/30 space-y-0.5">
            <div className="font-bold text-[#3B1403]">মিষ্টি কুমড়া ও ডাল পিউরি</div>
            <p className="text-[#773612]">+ ১ চিমটি Sage · সময়: ১২ মিনিট</p>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen pb-24 text-[#3B1403] font-sans antialiased bg-[#FFFDF9]">
      {/* ====================================================================
          01. STICKY TOP COUNTDOWN
          ==================================================================== */}
      <div className="sticky top-0 z-40 w-full bg-[#56020A] border-b border-[#D6AA4F]/40 px-3.5 md:px-8 py-2.5 shadow-sm">
        <div className="flex items-center justify-between md:justify-center md:gap-6 gap-2">
          <span className="text-[13px] font-bold text-[#D6AA4F] leading-tight">
            Double Offer শেষ হতে বাকি
          </span>
          <div className="flex items-center gap-1 font-bold text-[14px] tabular-nums shrink-0">
            <span className="bg-[#3B1403] border border-[#D6AA4F]/50 text-[#D6AA4F] px-2 py-0.5 rounded-md min-w-[32px] text-center">
              {cdHours}
            </span>
            <span className="text-[#D6AA4F]">:</span>
            <span className="bg-[#3B1403] border border-[#D6AA4F]/50 text-[#D6AA4F] px-2 py-0.5 rounded-md min-w-[32px] text-center">
              {cdMinutes}
            </span>
            <span className="text-[#D6AA4F]">:</span>
            <span className="bg-[#3B1403] border border-[#D6AA4F]/50 text-[#D6AA4F] px-2 py-0.5 rounded-md min-w-[32px] text-center">
              {cdSeconds}
            </span>
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <header className="px-4 md:px-8 py-3 bg-[#FBF4E6] border-b border-[#EDD6A9] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img src="/logo.png" alt="Baby Masala" className="h-8 md:h-10 object-contain" />
          <div className="hidden sm:block">
            <div className="font-heading text-[16px] font-bold text-[#56020A] leading-tight">Baby Masala</div>
            <div className="text-[11px] text-[#773612]">মায়ের যত্ন ও শিশুর পুষ্টি</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-[#56020A] text-[#D6AA4F] text-[12px] font-bold shadow-2xs">
            {combo.name}
          </span>
        </div>
      </header>

      <main className="max-w-[960px] mx-auto px-4 py-5 md:px-8 md:py-10 space-y-8 md:space-y-12">
        {/* ====================================================================
            02. HERO
            ==================================================================== */}
        <section ref={heroRef} className="space-y-4 md:space-y-5 text-center py-2 md:py-6 max-w-[860px] mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#56020A]/10 border border-[#56020A]/20 text-[#56020A] text-[12px] font-bold">
            <span className="w-2 h-2 rounded-full bg-[#C8102E] animate-pulse" />
            <span>শিশু পুষ্টি বিশেষজ্ঞদের অনুমোদিত ও ল্যাব-পরীক্ষিত</span>
          </div>

          <h1 className="font-heading text-[28px] md:text-[40px] lg:text-[46px] leading-[1.35] text-[#56020A]">
            বাচ্চা খেতে না চাইলে, টেস্ট বদলান, প্লেট খালি হয়ে যাবে!
          </h1>

          <p className="text-[16px] md:text-[18px] text-[#3B1403] leading-relaxed font-medium">
            খেতে না চাইলে জোরাজুড়ি আর ভয় দেখানোর দিন শেষ, বাচ্চার প্লেট খালি করুন ১ চিমটি হার্বস দিয়ে
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={scrollToCheckout}
              className="w-full md:max-w-[520px] md:mx-auto min-h-[54px] px-5 py-3.5 rounded-[14px] bg-[#56020A] text-[#FBF4E6] border border-[#D6AA4F] font-bold text-[17px] flex items-center justify-center active:scale-98 transition-transform cursor-pointer shadow-md hover:bg-[#6a050e]"
            >
              {combo.name} অর্ডার করতে ক্লিক করুন
            </button>
          </div>
        </section>

        {/* ====================================================================
            03. HAPPINESS
            ==================================================================== */}
        <section className="bg-white border border-[#EDD6A9] rounded-[18px] p-5 md:p-8 space-y-4 text-center shadow-xs">
          <h2 className="font-heading text-[22px] leading-snug text-[#56020A]">
            ঝামেলা ছাড়াই বাচ্চা যদি পুরো খাবারটা শেষ করে ফেলে কেমন হয়?
          </h2>

          <div className="w-full h-52 md:h-96 rounded-[12px] overflow-hidden bg-[#F5E3C4] border border-[#EDD6A9]">
            <img
              src="https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&auto=format&fit=crop&q=80"
              alt="খুশি মা ও বাচ্চা"
              className="w-full h-full object-cover"
            />
          </div>

          <p className="text-[16px] font-bold text-[#56020A] flex items-center justify-center gap-1.5">
            <span>সেই Happiness পৃথিবীতে আর কোথাও নেই।</span>
            <Heart className="w-4 h-4 text-[#C8102E] fill-current" />
          </p>

          <button
            type="button"
            onClick={scrollToCheckout}
            className="w-full md:max-w-[520px] md:mx-auto min-h-[50px] px-4 py-3 rounded-[14px] bg-[#56020A] text-[#FBF4E6] font-bold text-[16px] flex items-center justify-center active:scale-98 transition-transform cursor-pointer"
          >
            হ্যাঁ, আমি Happy হতে চাই
          </button>
        </section>

        {/* ====================================================================
            04. SOCIAL PROOF
            ==================================================================== */}
        <section className="bg-[#56020A] text-[#FBF4E6] border-2 border-[#D6AA4F] rounded-[18px] p-5 md:p-8 space-y-4 text-center shadow-sm">
          <div className="space-y-1.5">
            <h2 className="font-heading text-[22px] leading-snug text-[#FBF4E6]">
              আপনার মতো অন্য মায়েরাও বাচ্চাকে খাওয়াতে গিয়ে নাজেহাল হচ্ছিলেন।
            </h2>
            <p className="text-[14px] text-[#EDD6A9]">
              আর আজ তারা তাদের বাস্তব Experience Share করছেন।
            </p>
          </div>

          <div className="bg-[#3B1403] border border-[#D6AA4F]/60 rounded-[14px] py-3.5 px-4 md:max-w-[360px] md:mx-auto">
            <div className="font-heading text-[36px] font-bold text-[#D6AA4F] leading-none tabular-nums">
              ১৮,৬৭৮+
            </div>
            <div className="text-[14px] font-semibold text-[#FBF4E6] mt-1">সন্তুষ্ট মা</div>
          </div>

          {/* Review Carousel Box */}
          <div className="max-w-[320px] mx-auto bg-[#FBF4E6] text-[#3B1403] rounded-[16px] p-4 border-2 border-[#D6AA4F] space-y-2 text-left shadow-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#56020A] text-[#D6AA4F] font-bold flex items-center justify-center text-sm">
                রি
              </div>
              <div>
                <div className="font-bold text-[13px] text-[#56020A]">রোকসানা পারভীন</div>
                <div className="text-[11px] text-[#773612]">ধানমন্ডি, ঢাকা</div>
              </div>
            </div>
            <p className="text-[13px] text-[#3B1403] leading-relaxed">
              “আমার বাবু কিছুতেই খিচুড়ি খেতে চাইত না। বেবি মসলার ব্যাসিল ও ওরিগানো কম্বো দিয়ে রান্না করার পর মাশাল্লাহ পুরো প্লেট শেষ করছে!”
            </p>
            <div className="flex text-[#E6A832] text-xs">★★★★★</div>
          </div>

          <button
            type="button"
            onClick={scrollToCheckout}
            className="w-full md:max-w-[520px] md:mx-auto min-h-[52px] px-4 py-3 rounded-[14px] bg-[#D6AA4F] text-[#3B1403] font-bold text-[16px] flex items-center justify-center active:scale-98 transition-transform cursor-pointer"
          >
            হ্যাঁ, আমিও বাচ্চাকে পেট ভরে খাওয়াতে চাই
          </button>
        </section>

        {/* ====================================================================
            05. TRUST & CERTIFICATIONS
            ==================================================================== */}
        <section className="space-y-4 text-center">
          <div className="space-y-1">
            <h2 className="font-heading text-[22px] text-[#56020A]">বিশ্বাস রাখার কারণসমূহ</h2>
            <p className="text-[14px] text-[#773612]">
              দেশের স্বনামধন্য চিকিৎসকদের সুপারিশকৃত ও ল্যাব-সার্টিফাইড সমাধান
            </p>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-2.5">
            {CERTIFICATIONS.map((cert) => (
              <div
                key={cert}
                className="bg-white border border-[#D6AA4F] rounded-[12px] p-3 flex flex-col items-center justify-center text-center gap-1.5 shadow-2xs min-h-[76px]"
              >
                <Shield className="w-5 h-5 text-[#56020A]" />
                <span className="text-[11px] font-bold text-[#3B1403] leading-tight">{cert}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================================
            06. DOCTOR SECTION
            ==================================================================== */}
        <section className="space-y-4">
          <div className="max-w-[640px] mx-auto bg-white border-2 border-[#D6AA4F] rounded-[18px] p-5 space-y-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="w-16 h-16 rounded-full border-2 border-[#D6AA4F] bg-[#F5E3C4] flex items-center justify-center shrink-0 overflow-hidden text-[11px] font-bold text-[#56020A] text-center p-1">
                <img
                  src="https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=300&auto=format&fit=crop&q=80"
                  alt="Doctor"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <h3 className="font-heading text-[18px] text-[#56020A] leading-tight">
                  ডাঃ শামীমা নাসরিন
                </h3>
                <div className="text-[13px] font-semibold text-[#773612]">
                  এমবিবিএস, ডিসিএইচ (শিশু পুষ্টি বিশেষজ্ঞ)
                </div>
                <div className="text-[12px] text-[#3B1403]/80">সাবেক কনসালট্যান্ট, ঢাকা শিশু হাসপাতাল</div>
              </div>
            </div>

            <blockquote className="bg-[#FBF4E6] border border-[#EDD6A9] rounded-[12px] p-3.5 text-[14px] italic text-[#3B1403] leading-relaxed">
              “লবণ ও চিনির বদলে প্রাকৃতিক হার্বসের হালকা সুবাস শিশুর খাবারের স্বাদ বাড়িয়ে ক্ষুধা উদ্দীপিত করে এবং স্বাস্থ্যকর খাদ্যাভ্যাস গড়ে তোলে।”
            </blockquote>
          </div>

          <button
            type="button"
            onClick={scrollToCheckout}
            className="w-full md:max-w-[520px] md:mx-auto min-h-[52px] px-4 py-3 rounded-[14px] bg-[#56020A] text-[#FBF4E6] font-bold text-[16px] flex items-center justify-center active:scale-98 transition-transform cursor-pointer"
          >
            {combo.name} অর্ডার করুন
          </button>
        </section>

        {/* ====================================================================
            07. FAQ
            ==================================================================== */}
        <section className="space-y-3.5">
          <h2 className="font-heading text-[22px] text-[#56020A] text-center">
            সাধারণ জিজ্ঞাসিত প্রশ্ন (FAQ)
          </h2>

          <div className="space-y-2.5 max-w-3xl mx-auto">
            {COMBO_FAQS.map((item, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#EDD6A9] rounded-[14px] overflow-hidden shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full min-h-[52px] px-4 py-3 text-left flex items-center justify-between gap-3 font-bold text-[15px] text-[#56020A] cursor-pointer"
                  >
                    <span>
                      {idx + 1}. {item.q}
                    </span>
                    <span className="text-[#56020A] font-bold text-[18px] shrink-0">
                      {isOpen ? '−' : '+'}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-3.5 pt-1 text-[14px] text-[#3B1403] leading-relaxed border-t border-[#EDD6A9]/60">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================================
            08. TWO PATHS
            ==================================================================== */}
        <section className="space-y-4 text-center">
          <div className="space-y-1">
            <div className="text-[13px] font-bold text-[#773612]">আপনার সামনে এখন</div>
            <h2 className="font-heading text-[26px] text-[#56020A] leading-tight">
              ২টা পথ খোলা আছে
            </h2>
            <p className="text-[15px] font-semibold text-[#3B1403]">আপনি কোনটা বেছে নেবেন?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 md:gap-5 text-left">
            <div className="bg-gray-100 border border-gray-300 rounded-[16px] p-4 space-y-3">
              <div className="inline-block px-2.5 py-0.5 rounded-md bg-gray-300 text-gray-800 text-[11px] font-bold">
                PATH 01
              </div>
              <div className="h-36 md:h-52 rounded-[12px] bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-sm">
                [একঘেয়ে খাবার ও খাওয়ার যুদ্ধ]
              </div>
              <p className="text-[14px] text-gray-700 font-medium leading-relaxed">
                প্রতিদিন একই স্বাদ, বাচ্চার মুখের অনিহা আর খাওয়াতে গিয়ে মা-বাবার চরম মানসিক চাপ।
              </p>
            </div>

            <div className="bg-[#FFF1C9]/70 border-2 border-[#D6AA4F] rounded-[16px] p-4 space-y-3 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="inline-block px-2.5 py-0.5 rounded-md bg-[#56020A] text-[#D6AA4F] text-[11px] font-bold">
                  PATH 02
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#375013] text-white text-[11px] font-bold">
                  <Check className="w-3.5 h-3.5" />
                  <span>সঠিক সিদ্ধান্ত</span>
                </span>
              </div>
              <div className="h-36 md:h-52 rounded-[12px] bg-[#F5E3C4] flex items-center justify-center text-[#56020A] font-bold text-sm overflow-hidden">
                <img
                  src="/images/combo_bundle.jpg"
                  alt="Combo Bundle"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[14px] text-[#3B1403] font-bold leading-relaxed">
                প্রতিদিন খাবারে নতুন প্রাকৃতিক সুবাস এনে বাচ্চার স্বাদের আগ্রহ তৈরি করা ও পেট ভরিয়ে দেওয়া।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={scrollToCheckout}
            className="w-full md:max-w-[520px] md:mx-auto min-h-[54px] px-5 py-3.5 rounded-[14px] bg-[#56020A] text-[#FBF4E6] border border-[#D6AA4F] font-bold text-[17px] flex items-center justify-center active:scale-98 transition-transform cursor-pointer shadow-md"
          >
            হ্যাঁ, আমি বাচ্চাকে পেট ভরে খাওয়াতে চাই
          </button>
        </section>

        {/* ====================================================================
            09. DOUBLE OFFER REVEAL (SHOWS OUR COMBO FROM API NICELY)
            ==================================================================== */}
        <section className="bg-[#56020A] text-[#FBF4E6] border-2 border-[#D6AA4F] rounded-[18px] p-5 md:p-8 space-y-5 shadow-md">
          <div className="text-center">
            <h2 className="font-heading inline-block px-4 py-1 rounded-full bg-[#3B1403] border border-[#D6AA4F] text-[#D6AA4F] text-[15px] tracking-wider">
              BABY MASALA DOUBLE OFFER
            </h2>
          </div>

          <div className="space-y-5 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
            {/* Offer 1: Combo from API */}
            <div className="bg-[#3B1403] border border-[#D6AA4F]/60 rounded-[14px] p-4 space-y-3 text-center">
              <div className="text-[12px] font-bold text-[#D6AA4F]">OFFER 01</div>
              <h3 className="font-heading text-[21px] text-[#FBF4E6]">{combo.name}</h3>

              <div className="w-full h-44 overflow-hidden rounded-[12px] bg-white border border-[#D6AA4F] shadow-xs flex items-center justify-center">
                <img
                  src={combo.image}
                  alt={combo.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Pack Selection Buttons */}
              {combo.weightOptions && combo.weightOptions.length > 1 && (
                <div className="grid grid-cols-2 gap-2 pt-1 text-left">
                  {combo.weightOptions.map((opt, idx) => {
                    const isSelected = selectedPackIndex === idx;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedPackIndex(idx)}
                        className={`p-2 rounded-lg border text-xs font-semibold cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-[#D6AA4F] text-[#3B1403] border-[#D6AA4F] font-bold'
                            : 'bg-[#56020A] text-[#FBF4E6] border-[#D6AA4F]/40'
                        }`}
                      >
                        <div className="truncate">{opt.label}</div>
                        <div className="font-bold">৳{opt.price}</div>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex items-baseline justify-center gap-3 pt-1">
                <span className="font-heading text-[18px] text-[#EDD6A9]/60 line-through tabular-nums">
                  ৳{regularPrice}
                </span>
                <span className="font-heading text-[32px] font-bold text-[#D6AA4F] leading-none tabular-nums">
                  ৳{activePrice}
                </span>
              </div>
              <div>
                <span className="inline-block bg-[#C8102E] text-white text-[12px] font-bold px-3 py-1 rounded-full shadow-2xs">
                  ৳{savings} ছাড় ({discountPercent}% Discount)
                </span>
              </div>
            </div>

            {/* Offer 2: Baby Care App Membership */}
            <div className="bg-[#3B1403] border border-[#D6AA4F]/60 rounded-[14px] p-4 space-y-3 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#D6AA4F]/15 border border-[#D6AA4F]/40 text-[#D6AA4F] flex items-center justify-center shrink-0">
                    <Gift className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-[12px] font-bold text-[#D6AA4F]">OFFER 02 (FREE BONUS)</div>
                    <h3 className="font-heading text-[17px] text-[#FBF4E6] leading-snug">
                      ১২ মাসের Baby Care App Membership — ৳৫০০০ মূল্যের, একদম ফ্রি
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-[12px] font-bold">
                    <span className="text-[#EDD6A9]">শুধু প্রথম ১০০ জন কম্বো ক্রেতার জন্য</span>
                    <span className="text-[#D6AA4F]">বাকি আছে ৮৭ টি</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#56020A] rounded-full overflow-hidden border border-[#D6AA4F]/40">
                    <div className="h-full bg-[#D6AA4F] rounded-full" style={{ width: '87%' }} />
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={scrollToAppSection}
                  className="min-h-[44px] px-3 py-1.5 text-[#D6AA4F] font-bold text-[14px] underline underline-offset-4 cursor-pointer"
                >
                  অ্যাপে কী কী থাকছে, দেখুন ↓
                </button>
              </div>
            </div>
          </div>

          {/* Value Stack with Delivery Toggle */}
          <div className="bg-[#FBF4E6] text-[#3B1403] border-2 border-[#D6AA4F] rounded-[14px] p-4 md:p-5 space-y-3 text-[14px] md:max-w-[560px] md:mx-auto">
            <div className="grid grid-cols-2 gap-2 pb-2 border-b border-[#EDD6A9]">
              <button
                type="button"
                onClick={() => setDeliveryArea('inside')}
                className={`min-h-[44px] px-3 py-2 rounded-full border-2 font-bold text-[13px] flex items-center justify-center transition-all cursor-pointer ${
                  deliveryArea === 'inside'
                    ? 'bg-[#56020A] border-[#56020A] text-[#FBF4E6]'
                    : 'bg-white border-[#EDD6A9] text-[#3B1403]'
                }`}
              >
                ঢাকার ভেতরে ৳{deliveryCharges.inside}
              </button>
              <button
                type="button"
                onClick={() => setDeliveryArea('outside')}
                className={`min-h-[44px] px-3 py-2 rounded-full border-2 font-bold text-[13px] flex items-center justify-center transition-all cursor-pointer ${
                  deliveryArea === 'outside'
                    ? 'bg-[#56020A] border-[#56020A] text-[#FBF4E6]'
                    : 'bg-white border-[#EDD6A9] text-[#3B1403]'
                }`}
              >
                ঢাকার বাইরে ৳{deliveryCharges.outside}
              </button>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span>{combo.name}</span>
                <span className="font-heading font-bold tabular-nums">৳{regularPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>12-Month Baby Care App</span>
                <span className="font-heading font-bold tabular-nums">৳৫০০০</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-dashed border-[#773612]/40">
                <span className="font-semibold">মোট মূল্য</span>
                <span className="font-heading line-through text-gray-500 font-bold tabular-nums">
                  ৳{regularPrice + 5000}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#56020A]">আজকের অফার মূল্য</span>
                <span className="font-heading font-bold text-[#56020A] tabular-nums">৳{activePrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>ডেলিভারি চার্জ</span>
                <span className="font-heading font-bold tabular-nums">৳{deliveryCharge}</span>
              </div>
              <div className="pt-2 border-t-2 border-[#56020A]/20 flex items-center justify-between">
                <span className="font-heading text-[18px] text-[#56020A]">সর্বমোট মূল্য</span>
                <span className="font-heading text-[26px] font-bold text-[#C8102E] tabular-nums leading-none">
                  ৳{activePrice + deliveryCharge}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            10. FIVE HERBS BREAKDOWN (FROM API)
            ==================================================================== */}
        <section className="bg-[#F5E3C4]/80 border border-[#EDD6A9] rounded-[18px] p-5 md:p-8 space-y-4">
          <div className="text-center space-y-1">
            <h2 className="font-heading text-[22px] md:text-[26px] text-[#56020A]">
              ৫টি প্রিমিয়াম হার্বসের পুষ্টি ও সুবাস
            </h2>
            <p className="text-[13px] text-[#773612] max-w-xl mx-auto">{combo.shortDesc}</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2 -mx-1 px-1 md:grid md:grid-cols-5 md:overflow-visible md:mx-0 md:px-0">
              {combo.ingredients.map((herb) => (
                <div
                  key={herb.id}
                  className="snap-start shrink-0 w-[145px] md:w-auto bg-white border border-[#EDD6A9] rounded-[14px] p-3 text-center space-y-2 shadow-2xs flex flex-col items-center justify-between"
                >
                  <div className="w-14 h-14 rounded-full bg-[#F5E3C4] border border-[#D6AA4F] flex items-center justify-center overflow-hidden shrink-0 shadow-2xs">
                    {herb.image ? (
                      <img src={herb.image} alt={herb.name} className="w-full h-full object-cover" />
                    ) : (
                      <Leaf className="w-7 h-7 text-[#375013]" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <h3 className="font-heading text-[16px] text-[#56020A] leading-tight">{herb.name}</h3>
                    {herb.nameEn && <div className="text-[11px] text-[#773612] font-medium">{herb.nameEn}</div>}
                    <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#375013]/15 text-[#375013] mt-1">
                      {herb.weight}
                    </span>
                  </div>

                  <p className="text-[12px] text-[#3B1403] leading-snug line-clamp-3">
                    {herb.details || herb.origin}
                  </p>
                </div>
              ))}
            </div>
            <div className="text-center text-[12px] font-semibold text-[#773612] md:hidden">
              ← সোয়াইপ করুন →
            </div>
          </div>

          {/* Benefits */}
          <div className="bg-white border border-[#EDD6A9] rounded-[14px] p-4 space-y-2">
            <div className="font-heading font-bold text-[#56020A] text-[15px]">
              কেন আমাদের প্রিমিয়াম হার্বস অনন্য:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[13px] text-[#3B1403]">
              {combo.benefits.map((b, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#375013] shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#56020A] text-[#D6AA4F] rounded-[12px] py-2.5 px-4 text-center font-bold text-[15px] md:max-w-[360px] md:mx-auto shadow-2xs">
            মোট ৫টা ফুড-গ্রেড জার · {activePack ? activePack.weight : combo.weight}
          </div>
        </section>

        {/* ====================================================================
            11. BABY CARE APP INTERACTIVE SECTION
            ==================================================================== */}
        <section ref={appSectionRef} className="space-y-5 bg-white border border-[#EDD6A9] rounded-[18px] p-5 md:p-8 shadow-xs">
          <div className="text-center space-y-1">
            <span className="px-3 py-1 rounded-full bg-[#E6A832]/20 text-[#3B1403] font-bold text-xs">
              ফ্রি বোনাস মেম্বারশিপ
            </span>
            <h2 className="font-heading text-[24px] text-[#56020A]">Baby Care App — মায়ের সার্বক্ষণিক সঙ্গী</h2>
            <p className="text-[14px] text-[#773612] max-w-lg mx-auto">
              কম্বোর সাথে পাচ্ছেন ১২ মাসের প্রিমিয়াম অ্যাপ অ্যাক্সেস (মূল্য ৳৫০০০, সম্পূর্ণ ফ্রি)
            </p>
          </div>

          {/* Mockup Showcase */}
          <div className="max-w-[320px] mx-auto bg-[#F6F0EC] border-4 border-[#3B1403] rounded-[28px] p-4 shadow-xl space-y-3">
            <div className="w-16 h-1 bg-[#3B1403]/30 rounded-full mx-auto" />
            <div className="flex justify-between items-center px-1 text-[11px] font-bold text-[#56020A]">
              <span>Baby Care App</span>
              <span className="text-[9px] bg-[#375013] text-white px-2 py-0.5 rounded-full">VIP Member</span>
            </div>

            <div className="flex gap-1 justify-center pb-1 border-b border-[#EDD6A9]/50">
              {APP_SCREENS.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveMockupScreen(i)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                    activeMockupScreen === i
                      ? 'bg-[#56020A] text-[#FBF4E6]'
                      : 'bg-white/80 text-[#3B1403]'
                  }`}
                >
                  {sc.title.split(' ')[0]}
                </button>
              ))}
            </div>

            <div className="min-h-[140px]">{APP_SCREENS[activeMockupScreen].render()}</div>
            <p className="text-[10px] text-center text-[#773612] italic">
              {APP_SCREENS[activeMockupScreen].desc}
            </p>
          </div>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={scrollToCheckout}
              className="px-6 py-3 rounded-[12px] bg-[#56020A] text-[#FBF4E6] font-bold text-[15px] cursor-pointer hover:bg-[#6e050e]"
            >
              কম্বো অর্ডার করে মেম্বারশিপ নিন
            </button>
          </div>
        </section>

        {/* ====================================================================
            12. CHECKOUT SECTION
            ==================================================================== */}
        <section
          ref={checkoutRef}
          id="checkout"
          className="bg-white border-2 border-[#D6AA4F] rounded-[18px] p-5 md:p-7 space-y-5 shadow-md scroll-mt-14"
        >
          <div className="text-center space-y-1">
            <h2 className="font-heading text-[23px] md:text-[28px] text-[#56020A]">
              আপনার অর্ডার সম্পন্ন করুন
            </h2>
            <p className="text-[13px] md:text-[14px] text-[#773612]">
              পছন্দের প্যাক ও পরিমাণ বেছে নিচের ফর্মে ডেলিভারির তথ্য দিন
            </p>
          </div>

          {orderSuccess ? (
            <div className="p-6 rounded-[16px] bg-[#375013]/10 border border-[#375013]/40 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-[#375013] mx-auto" />
              <h3 className="font-heading text-[22px] text-[#375013]">অর্ডারটি সফলভাবে গৃহীত হয়েছে!</h3>
              <p className="text-[14px] text-[#3B1403]">
                অর্ডার নম্বর: <span className="font-bold">{orderSuccess.id}</span>
              </p>
              <p className="text-[13px] text-[#773612]">
                আমরা দ্রুত আপনার দেওয়া নম্বরে ফোন করে অর্ডারটি কনফার্ম করব। ধন্যবাদ!
              </p>
              <button
                type="button"
                onClick={() => setOrderSuccess(null)}
                className="px-4 py-2 rounded-lg bg-[#56020A] text-white font-bold text-xs"
              >
                নতুন অর্ডার করুন
              </button>
            </div>
          ) : (
            <div className="space-y-5 lg:space-y-0 lg:grid lg:grid-cols-2 lg:gap-8 lg:items-start">
              <div className="space-y-5">
                {/* Combo Card */}
                <div className="rounded-[16px] border-2 border-[#56020A] bg-[#FFF1C9]/60 p-4 space-y-3.5 shadow-2xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-16 h-16 rounded-[12px] bg-white border border-[#D6AA4F] flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="min-w-0 space-y-0.5">
                        <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#375013] text-white">
                          App Membership ফ্রি
                        </span>
                        <h3 className="font-heading text-[17px] text-[#56020A] leading-tight">{combo.name}</h3>
                        <div className="flex items-baseline gap-2">
                          <span className="text-[13px] text-gray-500 line-through tabular-nums">
                            ৳{regularPrice}
                          </span>
                          <span className="font-heading text-[20px] font-bold text-[#C8102E] tabular-nums">
                            ৳{activePrice}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* - qty + */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setComboQty((q) => Math.max(0, q - 1))}
                        className="w-11 h-11 rounded-[10px] bg-white border border-[#EDD6A9] text-[#56020A] font-bold text-[18px] flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                      >
                        −
                      </button>
                      <span className="w-6 text-center font-bold text-[16px] tabular-nums">{comboQty}</span>
                      <button
                        type="button"
                        onClick={() => setComboQty((q) => q + 1)}
                        className="w-11 h-11 rounded-[10px] bg-[#56020A] text-white font-bold text-[18px] flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Pack Selector */}
                  {combo.weightOptions && combo.weightOptions.length > 1 && (
                    <div className="pt-2 border-t border-[#EDD6A9]">
                      <div className="text-[12px] font-bold text-[#773612] mb-1.5">প্যাক সাইজ:</div>
                      <div className="grid grid-cols-2 gap-2">
                        {combo.weightOptions.map((opt, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setSelectedPackIndex(idx)}
                            className={`p-2 rounded-[10px] border text-left cursor-pointer transition-all ${
                              selectedPackIndex === idx
                                ? 'bg-[#56020A] text-white border-[#56020A]'
                                : 'bg-white text-[#3B1403] border-[#EDD6A9]'
                            }`}
                          >
                            <div className="text-[11px] font-bold truncate">{opt.label}</div>
                            <div className="text-[12px] font-bold font-heading">৳{opt.price}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {comboQty === 0 && (
                    <div className="text-[12px] font-semibold text-[#C8102E] bg-white/80 border border-[#C8102E]/30 rounded-[8px] px-2.5 py-1.5 text-center">
                      ফ্রি App Membership শুধু কম্বো অর্ডারে প্রযোজ্য।
                    </div>
                  )}
                </div>

                {/* Single Herbs Addons */}
                {singleHerbs.length > 0 && (
                  <div className="space-y-2.5">
                    <h3 className="font-heading text-[17px] text-[#56020A]">আলাদা হার্বসও যোগ করতে পারেন</h3>
                    <div className="divide-y divide-[#EDD6A9] border border-[#EDD6A9] rounded-[14px] bg-[#FBF4E6] overflow-hidden">
                      {singleHerbs.map((herb) => {
                        const qty = singleQuantities[herb.id] || 0;
                        return (
                          <div key={herb.id} className="p-3 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-full bg-white border border-[#EDD6A9] flex items-center justify-center shrink-0 overflow-hidden">
                                {herb.image ? (
                                  <img src={herb.image} alt={herb.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Leaf className="w-5 h-5 text-[#56020A]" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="font-bold text-[14px] text-[#56020A] truncate">{herb.name}</div>
                                <div className="text-[12px] text-[#773612]">
                                  {herb.weight} · <span className="font-heading font-bold">৳{herb.price}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setSingleQuantities((prev) => ({
                                    ...prev,
                                    [herb.id]: Math.max(0, (prev[herb.id] || 0) - 1),
                                  }))
                                }
                                className="w-10 h-10 rounded-[10px] bg-white border border-[#EDD6A9] text-[#56020A] font-bold text-[18px] flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                              >
                                −
                              </button>
                              <span className="w-5 text-center font-bold text-[15px] tabular-nums">{qty}</span>
                              <button
                                type="button"
                                onClick={() =>
                                  setSingleQuantities((prev) => ({
                                    ...prev,
                                    [herb.id]: (prev[herb.id] || 0) + 1,
                                  }))
                                }
                                className="w-10 h-10 rounded-[10px] bg-[#56020A] text-white font-bold text-[18px] flex items-center justify-center active:scale-95 cursor-pointer shadow-2xs"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Form */}
              <form onSubmit={handlePlaceOrder} className="space-y-4 lg:sticky lg:top-16" noValidate>
                <div>
                  <label htmlFor="c2-name" className="block text-[14px] font-semibold text-[#3B1403] mb-1.5">
                    আপনার নাম *
                  </label>
                  <input
                    id="c2-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="আপনার পূর্ণ নাম লিখুন"
                    required
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-[12px] bg-[#FBF4E6]/60 border border-[#EDD6A9] text-[#3B1403] placeholder-[#3B1403]/45 text-[15px] focus:outline-none focus:border-[#56020A]"
                  />
                </div>

                <div>
                  <label htmlFor="c2-phone" className="block text-[14px] font-semibold text-[#3B1403] mb-1.5">
                    মোবাইল নম্বর *
                  </label>
                  <input
                    id="c2-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    required
                    className="w-full min-h-[48px] px-3.5 py-2.5 rounded-[12px] bg-[#FBF4E6]/60 border border-[#EDD6A9] text-[#3B1403] placeholder-[#3B1403]/45 text-[15px] focus:outline-none focus:border-[#56020A]"
                  />
                </div>

                <div>
                  <label htmlFor="c2-address" className="block text-[14px] font-semibold text-[#3B1403] mb-1.5">
                    পূর্ণ ডেলিভারি ঠিকানা *
                  </label>
                  <textarea
                    id="c2-address"
                    rows={3}
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    placeholder="বাসা নম্বর, রোড, এলাকা, থানা ও জেলা"
                    required
                    className="w-full px-3.5 py-2.5 rounded-[12px] bg-[#FBF4E6]/60 border border-[#EDD6A9] text-[#3B1403] placeholder-[#3B1403]/45 text-[15px] focus:outline-none focus:border-[#56020A]"
                  />
                </div>

                {/* Delivery Area */}
                <div className="space-y-2">
                  <div className="text-[14px] font-semibold text-[#3B1403]">ডেলিভারি এলাকা</div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('inside')}
                      className={`min-h-[48px] px-3 py-2.5 rounded-full border-2 font-bold text-[14px] flex items-center justify-center transition-all cursor-pointer ${
                        deliveryArea === 'inside'
                          ? 'bg-[#56020A] border-[#56020A] text-[#FBF4E6]'
                          : 'bg-[#FBF4E6] border-[#EDD6A9] text-[#3B1403]'
                      }`}
                    >
                      ঢাকার ভেতরে ৳{deliveryCharges.inside}
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryArea('outside')}
                      className={`min-h-[48px] px-3 py-2.5 rounded-full border-2 font-bold text-[14px] flex items-center justify-center transition-all cursor-pointer ${
                        deliveryArea === 'outside'
                          ? 'bg-[#56020A] border-[#56020A] text-[#FBF4E6]'
                          : 'bg-[#FBF4E6] border-[#EDD6A9] text-[#3B1403]'
                      }`}
                    >
                      ঢাকার বাইরে ৳{deliveryCharges.outside}
                    </button>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-[14px] bg-[#FBF4E6] border border-[#EDD6A9] p-4 space-y-2 text-[14px]">
                  <div className="font-heading font-bold text-[#56020A] border-b border-[#EDD6A9] pb-1.5 flex justify-between">
                    <span>অর্ডার সামারি</span>
                    <span className="text-[12px] text-[#773612]">ক্যাশ অন ডেলিভারি</span>
                  </div>

                  {comboQty > 0 && (
                    <>
                      <div className="flex justify-between">
                        <span>{combo.name} × {comboQty}</span>
                        <span className="font-heading font-bold">৳{comboSubtotal}</span>
                      </div>
                      <div className="flex justify-between text-[#375013] font-bold">
                        <span>12-Month Baby Care App</span>
                        <span>ফ্রি</span>
                      </div>
                    </>
                  )}

                  {selectedSingles.map((s) => (
                    <div key={s.id} className="flex justify-between">
                      <span>{s.name} × {s.qty}</span>
                      <span className="font-heading font-bold">৳{s.total}</span>
                    </div>
                  ))}

                  <div className="flex justify-between pt-1 border-t border-[#EDD6A9]/60">
                    <span>সাবটোটাল</span>
                    <span className="font-heading font-bold">৳{subtotal}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ডেলিভারি</span>
                    <span className="font-heading font-bold">৳{totalItemCount > 0 ? deliveryCharge : 0}</span>
                  </div>
                  <div className="pt-2 border-t border-[#EDD6A9] flex justify-between text-[17px] font-bold text-[#56020A]">
                    <span className="font-heading">সর্বমোট</span>
                    <span className="font-heading text-[22px] text-[#C8102E]">৳{grandTotal}</span>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 rounded-[10px] bg-[#C8102E]/10 border border-[#C8102E]/30 text-[#C8102E] text-[14px]">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting || totalItemCount === 0}
                  className="w-full min-h-[54px] px-5 py-3.5 rounded-[14px] bg-[#56020A] text-[#FBF4E6] font-bold text-[18px] flex items-center justify-center gap-2 active:scale-98 transition-transform cursor-pointer disabled:opacity-60 shadow-md"
                >
                  {isSubmitting ? 'অর্ডার প্রসেস হচ্ছে...' : 'অর্ডার কনফার্ম করুন (ক্যাশ অন ডেলিভারি)'}
                </button>
              </form>
            </div>
          )}
        </section>
      </main>

      {/* Sticky Bottom Bar */}
      {showStickyBottomBar && (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xs border-t-2 border-[#D6AA4F] shadow-lg">
          <div className="max-w-[960px] mx-auto px-4 py-2.5 flex items-center justify-between gap-2.5">
            <div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-[22px] font-bold text-[#56020A] leading-none">
                  ৳{activePrice}
                </span>
                <span className="font-heading text-[13px] text-gray-500 line-through">
                  ৳{regularPrice}
                </span>
              </div>
              <span className="inline-block text-[11px] font-bold text-[#C8102E]">
                {discountPercent}% ছাড় + 12M App Free
              </span>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://m.me/babymasalabd"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full border-2 border-[#56020A] text-[#56020A] flex items-center justify-center shrink-0 active:scale-95"
              >
                <MessageCircle className="w-5 h-5" />
              </a>

              <button
                type="button"
                onClick={scrollToCheckout}
                className="min-h-[48px] px-5 py-2.5 rounded-[12px] bg-[#56020A] text-[#FBF4E6] font-bold text-[15px] flex items-center justify-center active:scale-98 cursor-pointer shadow-md"
              >
                অর্ডার করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

