import React, { useCallback, useEffect, useState } from 'react';
import {
  Bot,
  ChevronsLeft,
  ExternalLink,
  FileText,
  Gift,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  MessageSquareWarning,
  Package,
  RefreshCw,
  ShoppingBag,
  Smartphone,
  Trophy,
  Workflow,
  X,
} from 'lucide-react';
import { User } from '../types';
import { AdminOverview, babyCareService } from '../services/babyCareService';
import { apiRequest, errorMessage, onUnauthorized, tokenStore } from '../services/api';
import { AiPersonasPanel } from '../components/admin/AiPersonasPanel';
import { AdminLogin, NOT_ADMIN_MESSAGE } from './AdminLogin';
import { DashboardSection } from './sections/DashboardSection';
import { PostsSection } from './sections/PostsSection';
import { OrdersSection } from './sections/OrdersSection';
import { ProductsSection } from './sections/ProductsSection';
import { ContestsSection } from './sections/ContestsSection';
import { ComplaintsSection } from './sections/ComplaintsSection';
import { RulesSection } from './sections/RulesSection';
import { AiTasksSection } from './sections/AiTasksSection';
import { bn, SectionHeader } from './ui';

export type SectionKey = 'dashboard' | 'posts' | 'orders' | 'products' | 'contests' | 'complaints' | 'ai' | 'aiTasks' | 'rules';

/** Lets a section change the loaded data after a successful API call. */
export type UpdateData = (fn: (d: AdminOverview) => AdminOverview) => void;

const NAV: { group: string; items: { key: SectionKey; label: string; icon: React.ElementType }[] }[] = [
  { group: 'ওভারভিউ', items: [{ key: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard }] },
  {
    group: 'ম্যানেজমেন্ট',
    items: [
      { key: 'posts', label: 'পোস্ট ও রিপোর্ট', icon: FileText },
      { key: 'orders', label: 'অর্ডার ও ডেলিভারি', icon: ShoppingBag },
      { key: 'products', label: 'প্রোডাক্ট', icon: Package },
      { key: 'contests', label: 'কনটেস্ট ও সাবমিশন', icon: Trophy },
      { key: 'complaints', label: 'অভিযোগ', icon: MessageSquareWarning },
    ],
  },
  {
    group: 'অন্যান্য',
    items: [
      { key: 'ai', label: 'AI ইউজার', icon: Bot },
      { key: 'aiTasks', label: 'AI টাস্ক', icon: Workflow },
      { key: 'rules', label: 'কুপন ও পয়েন্ট রুলস', icon: Gift },
    ],
  },
];
const ALL_ITEMS = NAV.flatMap((g) => g.items);

const readSection = (): SectionKey => {
  const key = window.location.hash.replace(/^#\/?/, '') as SectionKey;
  return ALL_ITEMS.some((i) => i.key === key) ? key : 'dashboard';
};

const COLLAPSE_KEY = 'babycare_admin_sidebar_collapsed';
const readCollapsed = () => {
  try {
    return localStorage.getItem(COLLAPSE_KEY) === '1';
  } catch {
    return false;
  }
};

type Session = { status: 'checking' } | { status: 'signed-out'; notice?: string } | { status: 'signed-in'; user: User };

export const AdminApp: React.FC = () => {
  const [session, setSession] = useState<Session>(() =>
    tokenStore.get() ? { status: 'checking' } : { status: 'signed-out' }
  );

  // Restore a saved admin session.
  useEffect(() => {
    onUnauthorized(() => setSession({ status: 'signed-out', notice: 'সেশনের মেয়াদ শেষ হয়েছে। আবার লগইন করুন।' }));
    if (!tokenStore.get()) return;
    apiRequest<{ user: User }>('/auth/me')
      .then(({ user }) => {
        if (user.isAdmin) return setSession({ status: 'signed-in', user });
        tokenStore.clear();
        setSession({ status: 'signed-out', notice: NOT_ADMIN_MESSAGE });
      })
      .catch((err) => setSession({ status: 'signed-out', notice: errorMessage(err) }));
  }, []);

  if (session.status === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF6F0]">
        <Loader2 className="w-8 h-8 text-[#56020A] animate-spin" />
      </div>
    );
  }
  if (session.status === 'signed-out') {
    return <AdminLogin notice={session.notice} onLogin={(user) => setSession({ status: 'signed-in', user })} />;
  }
  return (
    <Dashboard
      user={session.user}
      onLogout={() => {
        tokenStore.clear();
        setSession({ status: 'signed-out' });
      }}
    />
  );
};

const Dashboard: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const [section, setSection] = useState<SectionKey>(readSection);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      setData(await babyCareService.admin.overview());
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const onHash = () => setSection(readSection());
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);

  // Close the mobile drawer with Escape.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setDrawerOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [drawerOpen]);

  const go = (key: SectionKey) => {
    window.location.hash = `/${key}`;
    setSection(key);
    setDrawerOpen(false);
    // The home totals come from the server; refresh them after edits elsewhere.
    if (key === 'dashboard' && section !== 'dashboard') void load();
    window.scrollTo({ top: 0 });
  };

  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {
        /* ignore */
      }
      return !c;
    });
  };

  const update: UpdateData = (fn) => setData((d) => (d ? fn(d) : d));

  const badges: Partial<Record<SectionKey, number>> = data
    ? {
        posts: data.posts.filter((p) => p.reportsCount > 0 || p.status === 'pending').length,
        orders: data.orders.filter((o) => o.status === 'pending').length,
        contests: data.submissions.filter((s) => s.status === 'pending').length,
        complaints: data.complaints.filter((c) => c.status !== 'resolved').length,
      }
    : {};

  const current = ALL_ITEMS.find((i) => i.key === section)!;

  const sidebar = (mobile: boolean) => {
    const narrow = collapsed && !mobile;
    return (
      <div className="flex flex-col h-full bg-[#56020A] text-white">
        {/* Brand */}
        <div className={`flex items-center h-16 shrink-0 border-b border-white/10 ${narrow ? 'justify-center px-2' : 'px-5 gap-3'}`}>
          <img src="/logo-192.png" alt="" className="w-9 h-9 rounded-full border border-[#EDD6A9]/60 shrink-0" />
          {!narrow && (
            <div className="min-w-0 flex-1">
              <p className="font-bold leading-none">Baby Care</p>
              <p className="text-[10px] text-[#EDD6A9] tracking-wider uppercase mt-1">Admin</p>
            </div>
          )}
          {mobile && (
            <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-white/10" aria-label="বন্ধ করুন">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
          {NAV.map((g) => (
            <div key={g.group}>
              {!narrow && (
                <p className="px-3 mb-1.5 text-[10px] font-semibold uppercase tracking-wider text-[#EDD6A9]/60">{g.group}</p>
              )}
              <ul className="space-y-0.5">
                {g.items.map(({ key, label, icon: Icon }) => {
                  const active = section === key;
                  const badge = badges[key] || 0;
                  return (
                    <li key={key}>
                      <button
                        onClick={() => go(key)}
                        title={narrow ? label : undefined}
                        aria-current={active ? 'page' : undefined}
                        className={`relative w-full flex items-center gap-3 rounded-xl text-sm font-medium transition-colors ${
                          narrow ? 'justify-center p-2.5' : 'px-3 py-2.5'
                        } ${active ? 'bg-[#EDD6A9] text-[#56020A]' : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
                      >
                        <Icon className="w-[18px] h-[18px] shrink-0" />
                        {!narrow && <span className="flex-1 text-left truncate">{label}</span>}
                        {badge > 0 &&
                          (narrow ? (
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EDD6A9] ring-2 ring-[#56020A]" />
                          ) : (
                            <span
                              className={`min-w-5 h-5 px-1.5 rounded-full text-[11px] font-bold flex items-center justify-center ${
                                active ? 'bg-[#56020A] text-white' : 'bg-[#EDD6A9] text-[#56020A]'
                              }`}
                            >
                              {bn(badge)}
                            </span>
                          ))}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Links & account */}
        <div className="shrink-0 border-t border-white/10 p-3 space-y-0.5">
          {[
            { href: '/', label: 'অ্যাপ খুলুন', icon: Smartphone },
            { href: 'https://store.babymasalabd.com/admin', label: 'স্টোর অ্যাডমিন', icon: ExternalLink },
          ].map(({ href, label, icon: Icon }) => (
            <a
              key={href}
              href={href}
              target="_blank"
              rel="noreferrer"
              title={narrow ? label : undefined}
              className={`flex items-center gap-3 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
                narrow ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {!narrow && label}
            </a>
          ))}
          {!mobile && (
            <button
              onClick={toggleCollapsed}
              title={collapsed ? 'সাইডবার বড় করুন' : 'সাইডবার ছোট করুন'}
              className={`w-full flex items-center gap-3 rounded-xl text-sm text-white/70 hover:bg-white/10 hover:text-white transition-colors ${
                narrow ? 'justify-center p-2.5' : 'px-3 py-2'
              }`}
            >
              <ChevronsLeft className={`w-4 h-4 shrink-0 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
              {!narrow && 'ছোট করুন'}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:block fixed inset-y-0 left-0 z-30 transition-[width] duration-200 ${collapsed ? 'w-[76px]' : 'w-64'}`}
      >
        {sidebar(false)}
      </aside>

      {/* Mobile drawer */}
      <div className={`lg:hidden fixed inset-0 z-50 ${drawerOpen ? '' : 'pointer-events-none'}`} aria-hidden={!drawerOpen}>
        <div
          onClick={() => setDrawerOpen(false)}
          className={`absolute inset-0 bg-black/50 transition-opacity ${drawerOpen ? 'opacity-100' : 'opacity-0'}`}
        />
        <aside
          className={`absolute inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl transition-transform duration-200 ${
            drawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar(true)}
        </aside>
      </div>

      <div className={`transition-[padding] duration-200 ${collapsed ? 'lg:pl-[76px]' : 'lg:pl-64'}`}>
        {/* Top bar */}
        <header className="sticky top-0 z-20 h-16 bg-[#FAF6F0]/90 backdrop-blur border-b border-[#EDD6A9]/60 flex items-center gap-3 px-4 sm:px-6">
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden p-2 -ml-2 rounded-lg text-[#56020A] hover:bg-[#EDD6A9]/40"
            aria-label="মেনু খুলুন"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="font-bold text-[#2D2327] truncate flex-1">{current.label}</h1>
          <button
            onClick={() => void load()}
            disabled={loading}
            className="p-2 rounded-lg text-[#56020A] hover:bg-[#EDD6A9]/40 disabled:opacity-50"
            title="রিফ্রেশ"
            aria-label="রিফ্রেশ"
          >
            <RefreshCw className={`w-[18px] h-[18px] ${loading ? 'animate-spin' : ''}`} />
          </button>
          <div className="flex items-center gap-2.5 pl-3 border-l border-[#EDD6A9]">
            <div className="w-8 h-8 rounded-full bg-[#56020A] text-[#EDD6A9] flex items-center justify-center text-sm font-bold shrink-0">
              {user.name.trim().charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="hidden sm:block min-w-0 max-w-40">
              <p className="text-sm font-semibold text-[#2D2327] truncate leading-tight">{user.name}</p>
              <p className="text-[11px] text-gray-500 truncate">{user.contact}</p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-gray-500 hover:text-red-700 hover:bg-red-50"
              title="লগআউট"
              aria-label="লগআউট"
            >
              <LogOut className="w-[18px] h-[18px]" />
            </button>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {loadError && (
            <div className="mb-5 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-red-700 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
              <span>{loadError}</span>
              <button onClick={() => void load()} className="underline">
                আবার চেষ্টা করুন
              </button>
            </div>
          )}

          {section === 'ai' ? (
            <>
              <SectionHeader title="AI ইউজার" subtitle="লেবেলযুক্ত AI ইউজার তৈরি ও পরিচালনা — প্রত্যেকের নামের শেষে “(AI)” থাকে।" />
              <AiPersonasPanel />
            </>
          ) : section === 'aiTasks' ? (
            <AiTasksSection />
          ) : section === 'rules' ? (
            <RulesSection />
          ) : !data ? (
            !loadError && (
              <div className="py-24 flex justify-center">
                <Loader2 className="w-8 h-8 text-[#56020A] animate-spin" />
              </div>
            )
          ) : section === 'dashboard' ? (
            <DashboardSection data={data} user={user} onNavigate={go} />
          ) : section === 'posts' ? (
            <PostsSection posts={data.posts} update={update} />
          ) : section === 'orders' ? (
            <OrdersSection orders={data.orders} update={update} />
          ) : section === 'products' ? (
            <ProductsSection products={data.products} />
          ) : section === 'contests' ? (
            <ContestsSection contests={data.contests || []} submissions={data.submissions} update={update} />
          ) : (
            <ComplaintsSection complaints={data.complaints} update={update} />
          )}
        </main>
      </div>
    </div>
  );
};
