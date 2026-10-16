import React, { useState } from 'react';
import { Child, Recipe, AgeTip } from '../types';
import {
  Baby,
  Calendar,
  AlertCircle,
  Utensils,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Stethoscope,
  Plus,
  Edit2,
  Trash2,
  Bookmark,
  X,
  Clock,
  ArrowLeft,
  Moon,
  Heart,
  Sun
} from 'lucide-react';

interface MyBabyTabProps {
  childrenList: Child[];
  onUpdateChildren: (children: Child[]) => void;
  recipes: Recipe[];
  ageTipsMap: Record<string, AgeTip>;
  onSelectRecipe: (recipe: Recipe) => void;
  onNavigateScreen: (screen: 'app' | 'friends' | 'messenger' | 'doctor' | 'recipes') => void;
}

interface TipItem {
  id: string;
  category: 'খাবার' | 'ঘুম' | 'দৈনন্দিন যত্ন' | 'বিকাশ';
  title: string;
  preview: string;
  content: string;
  saved: boolean;
}

const INITIAL_TIPS: TipItem[] = [
  {
    id: 'tip-1',
    category: 'খাবার',
    title: '৬ মাসের পর প্রথম কঠিন খাবার (সলিড ফুড) শুরু করার নিয়ম',
    preview: 'শিশুর ৬ মাস পূর্ণ হওয়ার পর বুকের দুধের পাশাপাশি নরম পিউরি ও চটকানো খাবার শুরু করুন...',
    content: 'শিশুর ৬ মাস বয়স পূর্ণ হওয়ার পর মায়ের বুকের দুধের পাশাপাশি পুষ্টিকর সম্পূরক খাবার বা সলিড ফুড অত্যন্ত জরুরি। প্রথমে চালের সুজি, মিষ্টি কুমড়া সেদ্ধ বা ডালের পানি দিয়ে শুরু করতে পারেন। নতুন যেকোনো খাবার ৩ দিন পর্যন্ত একটানা খাইয়ে এলার্জি বা হজমের সমস্যা আছে কিনা তা পর্যবেক্ষণ করুন। চিনি ও লবণ এড়িয়ে চলুন।',
    saved: false,
  },
  {
    id: 'tip-2',
    category: 'ঘুম',
    title: 'শিশুর সুস্থ ঘুমের রুটিন তৈরি',
    preview: 'নিয়মিত ঘুমের সময় নির্ধারণ এবং রাতের ঘুমের পরিবেশ শান্ত রাখা শিশুর মস্তিষ্কের বিকাশে সাহায্য করে...',
    content: 'নবজাতক ও শিশুদের সুস্থ বৃদ্ধির জন্য সঠিক ঘুম অপরিহার্য। প্রতিদিন একই সময়ে ঘুমানোর অভ্যাস করান এবং ঘুমানোর আগে ঘর অন্ধকার বা মৃদু আলো রাখুন। হালকা কুসুম গরম পানিতে গোসল বা মালিশ শিশুকে শান্ত করতে এবং দ্রুত ঘুমাতে সাহায্য করে।',
    saved: true,
  },
  {
    id: 'tip-3',
    category: 'বিকাশ',
    title: 'বসা ও হামাগুড়ি দেওয়ার বয়সে শিশুর পরিচর্যা',
    preview: '৬ থেকে ৯ মাসের মধ্যে শিশুরা বসতে শেখে। এই সময়ে তাদের চারপাশের পরিবেশ নিরাপদ রাখা প্রয়োজন...',
    content: 'শিশুরা যখন হামাগুড়ি দেওয়া শুরু করে, তখন ঘরের মেঝে পরিষ্কার রাখুন এবং ধারালো বস্তু দূরে রাখুন। তাদের সাথে খেলা করুন, কথা বলুন এবং বিভিন্ন রঙের খেলনা দিয়ে দৃষ্টি আকর্ষণ করুন যা তাদের মানসিক ও শারীরিক বিকাশকে ত্বরান্বিত করে।',
    saved: false,
  },
  {
    id: 'tip-4',
    category: 'দৈনন্দিন যত্ন',
    title: 'শিশুর ত্বক ও ডায়াপার র‌্যাশ রোধে করণীয়',
    preview: 'নরম শিশুর ত্বক খুব সংবেদনশীল। নিয়মিত ডায়াপার পরিবর্তন এবং বায়ু চলাচল নিশ্চিত করুন...',
    content: 'ডায়াপার র‌্যাশ রোধ করতে প্রতি ৩-৪ ঘণ্টা পর পর ডায়াপার পরিবর্তন করুন এবং ত্বক পরিষ্কার করে ভালো মানের ময়েশ্চারাইজার বা পেট্রোলিয়াম জেলি ব্যবহার করুন। সম্ভব হলে কিছুক্ষণ ডায়াপার ছাড়া খোলা রাখুন যাতে বাতাস চলাচল করতে পারে।',
    saved: false,
  },
];

export const MyBabyTab: React.FC<MyBabyTabProps> = ({
  childrenList,
  onUpdateChildren,
  recipes,
  ageTipsMap,
  onSelectRecipe,
  onNavigateScreen,
}) => {
  const [selectedChildId, setSelectedChildId] = useState<string>(childrenList[0]?.id || '');
  const [subView, setSubView] = useState<'main' | 'foodChart' | 'tips' | 'tipDetail'>('main');
  const [selectedTip, setSelectedTip] = useState<TipItem | null>(null);
  const [tipsList, setTipsList] = useState<TipItem[]>(INITIAL_TIPS);
  const [tipCategoryFilter, setTipCategoryFilter] = useState<string>('সব');

  // Add / Edit Child Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingChild, setEditingChild] = useState<Child | null>(null);
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [photo, setPhoto] = useState('');
  const [allergies, setAllergies] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Food Chart day selector
  const [selectedDay, setSelectedDay] = useState<string>('শনিবার');
  const daysOfWeek = ['শনিবার', 'রবিবার', 'সোমবার', 'মঙ্গলবার', 'বুধবার', 'বৃহস্পতিবার', 'শুক্রবার'];

  const activeChild = childrenList.find((c) => c.id === selectedChildId) || childrenList[0];

  const getDetailedAge = (birthDateStr: string) => {
    if (!birthDateStr) return { ageStr: 'অজানা', ageGroup: '9_12m', totalMonths: 9 };
    const dobDate = new Date(birthDateStr);
    const today = new Date();
    let years = today.getFullYear() - dobDate.getFullYear();
    let months = today.getMonth() - dobDate.getMonth();
    let days = today.getDate() - dobDate.getDate();

    if (days < 0) {
      months--;
      const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      days += prevMonth.getDate();
    }
    if (months < 0) {
      years--;
      months += 12;
    }

    const totalMonths = years * 12 + months;
    let ageGroup: 'under_6m' | '6_8m' | '9_12m' | '1_2y' | '2y_plus' = '9_12m';
    if (totalMonths < 6) ageGroup = 'under_6m';
    else if (totalMonths <= 8) ageGroup = '6_8m';
    else if (totalMonths <= 12) ageGroup = '9_12m';
    else if (totalMonths <= 24) ageGroup = '1_2y';
    else ageGroup = '2y_plus';

    let ageStr = '';
    if (years > 0) ageStr += `${years} বছর `;
    if (months > 0 || years > 0) ageStr += `${months} মাস `;
    ageStr += `${days} দিন`;

    return { ageStr, ageGroup, totalMonths };
  };

  const activeAgeData = activeChild ? getDetailedAge(activeChild.dob) : { ageStr: '৯ মাস', ageGroup: '9_12m', totalMonths: 9 };
  const currentTip = ageTipsMap[activeAgeData.ageGroup] || ageTipsMap['9_12m'];

  const recommendedRecipes = activeAgeData.ageGroup === 'under_6m'
    ? []
    : recipes.filter((r) => r.ageGroup === activeAgeData.ageGroup || r.ageGroup === '9_12m').slice(0, 3);

  const handleOpenAdd = () => {
    setEditingChild(null);
    setName('');
    setDob('');
    setPhoto('');
    setAllergies('');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleOpenEdit = (child: Child) => {
    setEditingChild(child);
    setName(child.name);
    setDob(child.dob);
    setPhoto(child.photo || '');
    setAllergies(child.allergies || '');
    setErrorMsg('');
    setShowModal(true);
  };

  const handleDeleteChild = (childId: string) => {
    if (childrenList.length <= 1) {
      alert('সর্বনিম্ন একটি শিশু প্রোফাইল থাকা আবশ্যক।');
      return;
    }
    if (window.confirm('আপনি কি নিশ্চিতভাবে এই শিশুর প্রোফাইল মুছে ফেলতে চান?')) {
      const updated = childrenList.filter((c) => c.id !== childId);
      onUpdateChildren(updated);
      setSelectedChildId(updated[0].id);
    }
  };

  const handleSaveChild = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dob.trim()) {
      setErrorMsg('শিশুর নাম ও জন্মতারিখ আবশ্যক।');
      return;
    }
    const dobDate = new Date(dob);
    const today = new Date();
    if (dobDate > today) {
      setErrorMsg('ভবিষ্যতের জন্মতারিখ গ্রহণযোগ্য নয়।');
      return;
    }

    if (editingChild) {
      const updated = childrenList.map((c) =>
        c.id === editingChild.id
          ? { ...c, name, dob, photo: photo || undefined, allergies: allergies || 'কোনো এলার্জি নেই' }
          : c
      );
      onUpdateChildren(updated);
    } else {
      const newChild: Child = {
        id: 'child-' + Date.now(),
        name,
        dob,
        photo: photo || undefined,
        allergies: allergies || 'কোনো এলার্জি নেই',
      };
      onUpdateChildren([...childrenList, newChild]);
      setSelectedChildId(newChild.id);
    }

    setShowModal(false);
  };

  const handleToggleBookmarkTip = (tipId: string) => {
    setTipsList(
      tipsList.map((t) => (t.id === tipId ? { ...t, saved: !t.saved } : t))
    );
    if (selectedTip && selectedTip.id === tipId) {
      setSelectedTip({ ...selectedTip, saved: !selectedTip.saved });
    }
  };

  // ---------------- SUB-VIEW: TIP DETAIL ----------------
  if (subView === 'tipDetail' && selectedTip) {
    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4 font-hind">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSubView('tips')}
            className="p-2 bg-white rounded-full border border-[#EDD6A9] text-[#56020A] shadow-sm hover:bg-[#FAF6F0]"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="bg-[#EDD6A9] text-[#56020A] text-[10px] font-bold px-2 py-0.5 rounded-full">
              {selectedTip.category}
            </span>
            <h2 className="text-base font-bold text-[#56020A] mt-1">{selectedTip.title}</h2>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-[#EDD6A9] shadow-sm space-y-4">
          <p className="text-xs text-gray-700 leading-relaxed">{selectedTip.content}</p>
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <span className="text-[11px] text-gray-400">পেশাদার পুষ্টিবিদ ও শিশু বিশেষজ্ঞ দ্বারা পরীক্ষিত</span>
            <button
              onClick={() => handleToggleBookmarkTip(selectedTip.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
                selectedTip.saved ? 'bg-[#56020A] text-white' : 'bg-[#FAF6F0] text-[#56020A] border border-[#EDD6A9]'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${selectedTip.saved ? 'fill-white' : ''}`} />
              {selectedTip.saved ? 'সংরক্ষিত' : 'সেভ করুন'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---------------- SUB-VIEW: AGE-BASED TIPS ----------------
  if (subView === 'tips') {
    const filteredTips = tipCategoryFilter === 'সব'
      ? tipsList
      : tipsList.filter((t) => t.category === tipCategoryFilter);

    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4 font-hind">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView('main')}
              className="p-2 bg-white rounded-full border border-[#EDD6A9] text-[#56020A] shadow-sm hover:bg-[#FAF6F0]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h2 className="text-base font-bold text-[#56020A]">বয়স অনুযায়ী টিপস ও গাইডলাইন</h2>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          {['সব', 'খাবার', 'ঘুম', 'দৈনন্দিন যত্ন', 'বিকাশ'].map((cat) => (
            <button
              key={cat}
              onClick={() => setTipCategoryFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                tipCategoryFilter === cat
                  ? 'bg-[#56020A] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filteredTips.map((tip) => (
            <div
              key={tip.id}
              onClick={() => {
                setSelectedTip(tip);
                setSubView('tipDetail');
              }}
              className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm hover:border-[#56020A] cursor-pointer transition-all space-y-2 group"
            >
              <div className="flex items-center justify-between">
                <span className="bg-[#EDD6A9]/60 text-[#56020A] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {tip.category}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleBookmarkTip(tip.id);
                  }}
                  className={`p-1.5 rounded-full ${tip.saved ? 'text-[#56020A]' : 'text-gray-400 hover:text-[#56020A]'}`}
                >
                  <Bookmark className={`w-4 h-4 ${tip.saved ? 'fill-[#56020A]' : ''}`} />
                </button>
              </div>
              <h3 className="text-xs font-bold text-[#56020A] group-hover:text-[#375013] transition-colors">
                {tip.title}
              </h3>
              <p className="text-[11px] text-gray-500 line-clamp-2">{tip.preview}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ---------------- SUB-VIEW: FOOD CHART ----------------
  if (subView === 'foodChart') {
    const isUnder6M = activeAgeData.totalMonths < 6;

    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4 font-hind">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSubView('main')}
              className="p-2 bg-white rounded-full border border-[#EDD6A9] text-[#56020A] shadow-sm hover:bg-[#FAF6F0]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h2 className="text-base font-bold text-[#56020A]">খাবারের চার্ট (ডিমো)</h2>
              <p className="text-[11px] text-[#375013]">{activeChild?.name} · {activeAgeData.ageStr}</p>
            </div>
          </div>
          <button
            onClick={() => alert('সাপ্তাহিক চার্ট সফলভাবে সেভ করা হয়েছে!')}
            className="px-3 py-1.5 bg-[#375013] text-white text-xs font-bold rounded-xl shadow hover:bg-[#375013]/90 transition-colors"
          >
            চার্ট সেভ করুন
          </button>
        </div>

        {/* Day Selector */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {daysOfWeek.map((day) => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedDay === day
                  ? 'bg-[#56020A] text-white shadow-sm'
                  : 'bg-white text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        {isUnder6M ? (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-2">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto" />
            <h3 className="text-sm font-bold text-amber-900">সলিড খাবার প্রযোজ্য নয়</h3>
            <p className="text-xs text-amber-800">
              আপনার শিশুর বয়স ৬ মাসের কম ({activeAgeData.ageStr})। বিশ্ব স্বাস্থ্য সংস্থা অনুযায়ী ৬ মাসের কম বয়সী শিশুর জন্য শুধুমাত্র বুকের দুধ প্রযোজ্য।
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-[#56020A] flex items-center gap-1.5">
                  <Sun className="w-4 h-4 text-amber-600" /> সকালের নাস্তা
                </span>
                <span className="text-[10px] bg-[#EDD6A9]/40 text-[#56020A] font-semibold px-2 py-0.5 rounded-full">সকাল ৮:০০</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">চাল ও ডালের নরম সুজি / কলা চটকানো</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">পরিমাণ: ৩-৪ চা চামচ (হালকা উষ্ণ)</p>
                </div>
                <button
                  onClick={() => {
                    const rec = recipes.find(r => r.ageGroup === activeAgeData.ageGroup) || recipes[0];
                    if (rec) onSelectRecipe(rec);
                  }}
                  className="px-2.5 py-1 bg-[#56020A] text-white text-[11px] font-bold rounded-lg"
                >
                  রেসিপি দেখুন
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-[#56020A] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[#375013]" /> দুপুরের খাবার
                </span>
                <span className="text-[10px] bg-[#EDD6A9]/40 text-[#56020A] font-semibold px-2 py-0.5 rounded-full">দুপুর ১:৩০</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">সবজি খিচুড়ি (মিষ্টি কুমড়া ও মুগ ডালসহ)</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">এক চিমটি বেবি বেসিল গুঁড়াসহ</p>
                </div>
                <button
                  onClick={() => {
                    const rec = recipes[0];
                    if (rec) onSelectRecipe(rec);
                  }}
                  className="px-2.5 py-1 bg-[#56020A] text-white text-[11px] font-bold rounded-lg"
                >
                  রেসিপি দেখুন
                </button>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-bold text-[#56020A] flex items-center gap-1.5">
                  <Moon className="w-4 h-4 text-indigo-600" /> রাতের খাবার
                </span>
                <span className="text-[10px] bg-[#EDD6A9]/40 text-[#56020A] font-semibold px-2 py-0.5 rounded-full">রাত ৮:০০</span>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-gray-800">নরম মিষ্টি আলুর পিউরি বা স্যুপ</h4>
                  <p className="text-[11px] text-gray-500 mt-0.5">সহজপাচ্য ও পুষ্টিকর</p>
                </div>
                <button
                  onClick={() => {
                    const rec = recipes[1];
                    if (rec) onSelectRecipe(rec);
                  }}
                  className="px-2.5 py-1 bg-[#56020A] text-white text-[11px] font-bold rounded-lg"
                >
                  রেসিপি দেখুন
                </button>
              </div>
            </div>

            <div className="text-[10px] text-gray-500 bg-blue-50 border border-blue-200 p-3 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>নোট: এটি একটি নমুনা বা ডেমো খাবারের চার্ট। শিশুর বয়স ও রুচি অনুযায়ী পরিবর্তনশীল। প্রফেশনাল পুষ্টিবিদ দ্বারা পর্যালোচিত নয়।</span>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ---------------- MAIN VIEW: MY BABY ----------------
  if (childrenList.length === 0) {
    return (
      <div className="pb-24 max-w-xl mx-auto px-4 pt-12 text-center space-y-4 font-hind">
        <div className="w-20 h-20 bg-[#EDD6A9]/40 rounded-full flex items-center justify-center mx-auto text-[#56020A]">
          <Baby className="w-10 h-10" />
        </div>
        <h2 className="text-lg font-bold text-[#56020A]">কোনো শিশু প্রোফাইল যোগ করা হয়নি</h2>
        <p className="text-xs text-gray-500 max-w-sm mx-auto">
          আপনার সন্তানের বয়স অনুযায়ী সঠিক খাবারের চার্ট, টিপস ও রেসিপি পেতে একটি শিশু প্রোফাইল যোগ করুন।
        </p>
        <button
          onClick={handleOpenAdd}
          className="px-5 py-2.5 bg-[#56020A] text-white text-xs font-bold rounded-xl shadow-md hover:bg-[#56020A]/90 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> প্রথম শিশু যোগ করুন
        </button>

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4 text-left">
              <h3 className="text-base font-bold text-[#56020A]">সন্তান যোগ করুন</h3>
              <form onSubmit={handleSaveChild} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#56020A] mb-1">শিশুর নাম</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="নাম লিখুন"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#56020A] mb-1">জন্মতারিখ</label>
                  <input
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#56020A] mb-1">ছবির লিংক (ঐচ্ছিক)</label>
                  <input
                    type="text"
                    value={photo}
                    onChange={(e) => setPhoto(e.target.value)}
                    placeholder="https://... বা ফটো URL"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#56020A] mb-1">এলার্জি নোট</label>
                  <input
                    type="text"
                    value={allergies}
                    onChange={(e) => setAllergies(e.target.value)}
                    placeholder="যেমন: কোনো এলার্জি নেই"
                    className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                  />
                </div>
                {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl"
                  >
                    সেভ করুন
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4 font-hind">
      {/* Children Switcher & Add Action */}
      <div className="flex items-center justify-between bg-white p-3.5 rounded-2xl border border-[#EDD6A9] shadow-sm">
        <div className="flex items-center gap-2 overflow-x-auto">
          {childrenList.map((ch) => {
            const isSelected = ch.id === activeChild?.id;
            return (
              <button
                key={ch.id}
                onClick={() => setSelectedChildId(ch.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-[#56020A] text-white shadow-sm'
                    : 'bg-[#FAF6F0] text-gray-700 hover:bg-[#EDD6A9]/30 border border-[#EDD6A9]'
                }`}
              >
                <Baby className="w-4 h-4" />
                <span>{ch.name}</span>
              </button>
            );
          })}
        </div>
        <button
          onClick={handleOpenAdd}
          className="px-3 py-2 bg-[#375013] text-white text-xs font-bold rounded-xl shadow hover:bg-[#375013]/90 transition-colors whitespace-nowrap flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" /> শিশু যোগ করুন
        </button>
      </div>

      {/* Ask Doctor Banner Card */}
      <div
        onClick={() => onNavigateScreen('doctor')}
        className="bg-gradient-to-r from-[#375013] to-[#56020A] text-white p-4 rounded-2xl shadow-md flex items-center justify-between cursor-pointer hover:opacity-95 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            <Stethoscope className="w-5 h-5 text-[#EDD6A9]" />
          </div>
          <div>
            <h3 className="text-sm font-bold">ডাক্তারকে জিজ্ঞেস করুন</h3>
            <p className="text-[11px] text-[#EDD6A9]">({activeChild.name}) এর স্বাস্থ্য নিয়ে বিশেষজ্ঞের পরামর্শ নিন</p>
          </div>
        </div>
        <ChevronRight className="w-5 h-5 text-[#EDD6A9]" />
      </div>

      {/* Active Child Summary Card with Edit / Delete */}
      {activeChild && (
        <div className="bg-gradient-to-r from-[#56020A] to-[#375013] text-white p-5 rounded-2xl shadow-md relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-[#EDD6A9] bg-white shrink-0">
                {activeChild.photo ? (
                  <img src={activeChild.photo} alt={activeChild.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-[#EDD6A9] flex items-center justify-center text-[#56020A]">
                    <Baby className="w-7 h-7" />
                  </div>
                )}
              </div>
              <div>
                <span className="bg-[#EDD6A9] text-[#56020A] text-[10px] font-bold px-2.5 py-0.5 rounded-full">
                  {currentTip.title}
                </span>
                <h2 className="text-xl font-bold mt-1">{activeChild.name}</h2>
                <p className="text-xs text-[#EDD6A9] mt-0.5">বয়স: {activeAgeData.ageStr}</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleOpenEdit(activeChild)}
                className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                title="প্রোফাইল এডিট"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDeleteChild(activeChild.id)}
                className="p-2 rounded-full bg-red-600/40 hover:bg-red-600/60 text-white transition-colors"
                title="মুছে ফেলুন"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/20 text-xs text-[#EDD6A9] flex items-center justify-between">
            <span>এলার্জি নোট: {activeChild.allergies}</span>
            <span className="font-semibold">সুরক্ষিত ও গোপনীয়</span>
          </div>
        </div>
      )}

      {/* Navigation Cards: Food Chart & Age Tips */}
      <div className="grid grid-cols-2 gap-3">
        <div
          onClick={() => setSubView('foodChart')}
          className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm hover:border-[#56020A] cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#EDD6A9]/30 flex items-center justify-center text-[#56020A] group-hover:scale-105 transition-transform">
            <Utensils className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-[#56020A]">খাবারের চার্ট</h3>
          <p className="text-[10px] text-gray-500">সাপ্তাহিক রুটিন ও মিল প্ল্যান</p>
        </div>

        <div
          onClick={() => setSubView('tips')}
          className="bg-white p-4 rounded-2xl border border-[#EDD6A9] shadow-sm hover:border-[#56020A] cursor-pointer transition-all space-y-2 group"
        >
          <div className="w-10 h-10 rounded-full bg-[#375013]/10 flex items-center justify-center text-[#375013] group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="text-xs font-bold text-[#56020A]">বয়স অনুযায়ী টিপস</h3>
          <p className="text-[10px] text-gray-500">ঘুম, বিকাশ ও যত্ন গাইডলাইন</p>
        </div>
      </div>

      {/* Age-Based Food Chart & Summary */}
      <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm space-y-4">
        <div className="flex items-center gap-2 text-[#56020A]">
          <Utensils className="w-5 h-5 text-[#375013]" />
          <h3 className="text-sm font-bold">পুষ্টি গাইডলাইন ও চার্ট সারসংক্ষেপ</h3>
        </div>

        <ul className="space-y-2 text-xs text-gray-700">
          {currentTip.foodChart.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 bg-[#FAF6F0] p-2.5 rounded-xl border border-[#EDD6A9]/40">
              <CheckCircle2 className="w-4 h-4 text-[#375013] shrink-0 mt-0.5" />
              <span>{item}</span>
            </li>
          ))}
        </ul>

        <div className="border-t border-gray-100 pt-3">
          <h4 className="text-xs font-bold text-[#56020A] mb-2">আজকের গুরুত্বপূর্ণ টিপস</h4>
          <ul className="space-y-1.5 text-xs text-gray-700">
            {currentTip.tips.map((tip, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#375013]" />
                <span>{tip}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="text-[10px] text-gray-500 bg-amber-50 border border-amber-200 p-2.5 rounded-lg flex items-start gap-1.5">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>{currentTip.medicalDisclaimer}</span>
        </div>
      </div>

      {/* Recommended Recipes for Age */}
      <div className="bg-white rounded-2xl p-4 border border-[#EDD6A9] shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-[#56020A]">প্রস্তাবিত রেসিপি</h3>
          <button
            onClick={() => onNavigateScreen('recipes')}
            className="text-xs font-bold text-[#375013] hover:underline"
          >
            সব রেসিপি দেখুন →
          </button>
        </div>

        {activeAgeData.ageGroup === 'under_6m' ? (
          <p className="text-xs text-gray-500 py-3 text-center">
            ৬ মাসের কম বয়সী শিশুর জন্য শুধুমাত্র বুকের দুধ প্রযোজ্য। কোনো সলিড রেসিপি নেই।
          </p>
        ) : recommendedRecipes.length === 0 ? (
          <p className="text-xs text-gray-500 py-3 text-center">এই বয়সের জন্য কোনো রেসিপি নেই।</p>
        ) : (
          <div className="space-y-2.5">
            {recommendedRecipes.map((rec) => (
              <div
                key={rec.id}
                onClick={() => onSelectRecipe(rec)}
                className="flex items-center justify-between p-3 bg-[#FAF6F0] rounded-xl border border-[#EDD6A9]/50 hover:border-[#56020A] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <img src={rec.image} alt={rec.title} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-[#56020A]">{rec.title}</h4>
                    <p className="text-[10px] text-gray-500">প্রস্তুতি: {rec.prepTime} · {rec.ageGroupLabel}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add / Edit Child Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[#56020A]">
                {editingChild ? 'শিশু প্রোফাইল এডিট করুন' : 'নতুন সন্তান যোগ করুন'}
              </h3>
              <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            <form onSubmit={handleSaveChild} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">শিশুর নাম</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="নাম লিখুন"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">জন্মতারিখ</label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">ছবির লিংক (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="https://... বা ফটো URL"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
                {photo && (
                  <div className="mt-2 w-12 h-12 rounded-full overflow-hidden border border-[#56020A]">
                    <img src={photo} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">এলার্জি বা বিশেষ নোট</label>
                <input
                  type="text"
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  placeholder="যেমন: কোনো এলার্জি নেই"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>
              {errorMsg && <p className="text-xs text-red-600">{errorMsg}</p>}
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 bg-gray-200 text-gray-700 text-xs font-bold rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#56020A] text-white text-xs font-bold rounded-xl"
                >
                  সেভ করুন
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
