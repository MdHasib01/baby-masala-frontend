import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Child,
  Post,
  Comment,
  Recipe,
  Contest,
  ContestSubmission,
  Product,
  CartItem,
  Order,
  RewardTransaction,
  GiftItem,
  GiftRedemption,
  NotificationItem,
  FriendUser,
  Conversation,
  Message,
  Doctor,
  DoctorQuestion,
  LeaderboardEntry,
} from './types';
import { babyCareService, AuthState, BootstrapData } from './services/babyCareService';
import { ApiError, UPDATING_MESSAGE, onUnauthorized } from './services/api';
import { Header } from './components/Header';
import { ProfileDrawer } from './components/profile/ProfileDrawer';
import { NotificationModal } from './components/NotificationModal';
import { AdminModal } from './components/AdminModal';
import { ChevronLeft, Loader2 } from 'lucide-react';

// Auth screens
import { WelcomeScreen } from './components/auth/WelcomeScreen';
import { LoginScreen } from './components/auth/LoginScreen';
import { SignUpScreen } from './components/auth/SignUpScreen';
import { LoginVerifyScreen } from './components/auth/LoginVerifyScreen';

// Social & Medical screens
import { FriendsScreen } from './components/social/FriendsScreen';
import { MessengerScreen } from './components/social/MessengerScreen';
import { AskDoctorScreen } from './components/doctor/AskDoctorScreen';
import { UserTimelineScreen } from './components/social/UserTimelineScreen';

// Tabs
import { CommunityTab } from './tabs/CommunityTab';
import { MyBabyTab } from './tabs/MyBabyTab';
import { RecipesTab } from './tabs/RecipesTab';
import { RewardsTab } from './tabs/RewardsTab';
import { ShopTab } from './tabs/ShopTab';
import { INITIAL_AGE_TIPS } from './data/mockData';

export type ActiveTab = 'home' | 'baby' | 'friends' | 'rewards' | 'shop';

const EMPTY_USER: User = {
  name: '',
  contact: '',
  isVerified: false,
  isMember: false,
  avatar: '',
  addresses: [],
  notificationPrefs: { push: true, sms: true, email: false, communityAlerts: true },
  privacySettings: { shareProfile: true, showChildrenInfo: true },
};

/**
 * Saves `value` to the server shortly after it stops changing. The first value
 * seen after `enabled` turns on is the one just loaded from the server, so it
 * is not sent back.
 */
function useServerSync<T>(value: T, enabled: boolean, save: (value: T) => Promise<unknown>) {
  const skipNext = useRef(true);
  const saveRef = useRef(save);
  saveRef.current = save;

  useEffect(() => {
    if (!enabled) {
      skipNext.current = true;
      return;
    }
    if (skipNext.current) {
      skipNext.current = false;
      return;
    }
    const timer = setTimeout(() => {
      saveRef.current(value).catch((err) => console.error('[sync]', err));
    }, 600);
    return () => clearTimeout(timer);
  }, [value, enabled]);
}

export default function App() {
  const [authState, setAuthState] = useState<AuthState>(babyCareService.getAuthState());
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [currentScreen, setCurrentScreen] = useState<'app' | 'messenger' | 'doctor' | 'recipes' | 'friends'>('app');

  // Loading state for the server round trip
  const [isHydrated, setIsHydrated] = useState(false);
  const [isLoading, setIsLoading] = useState(babyCareService.hasSession());
  const [loadError, setLoadError] = useState('');

  const [user, setUser] = useState<User>(EMPTY_USER);
  const [childrenList, setChildrenList] = useState<Child[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [contests, setContests] = useState<Contest[]>([]);
  const [submissions, setSubmissions] = useState<ContestSubmission[]>([]);
  const [gifts, setGifts] = useState<GiftItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [rewardTx, setRewardTx] = useState<RewardTransaction[]>([]);
  const [giftRedemptions, setGiftRedemptions] = useState<GiftRedemption[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);

  // Social & Medical state
  const [friends, setFriends] = useState<FriendUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [doctorQuestions, setDoctorQuestions] = useState<DoctorQuestion[]>([]);
  const [activeMessengerFriend, setActiveMessengerFriend] = useState<FriendUser | null>(null);
  const [activeTimelineTarget, setActiveTimelineTarget] = useState<{
    type: 'me' | 'other';
    friend?: FriendUser;
    authorName?: string;
  } | null>(null);

  // Temp auth data
  const [tempContact, setTempContact] = useState('');
  const [tempName, setTempName] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(false);

  // Modals inside main app
  const [showProfileDrawer, setShowProfileDrawer] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);

  const applyBootstrap = (data: BootstrapData) => {
    setUser(data.user);
    setChildrenList(data.children);
    setPosts(data.posts);
    setComments(data.comments);
    setRecipes(data.recipes);
    setProducts(data.products);
    setContests(data.contests);
    setSubmissions(data.submissions);
    setGifts(data.gifts);
    setOrders(data.orders);
    setRewardTx(data.rewardTx);
    setGiftRedemptions(data.giftRedemptions);
    setNotifications(data.notifications);
    setCart(data.cart);
    setLeaderboard(data.leaderboard);
    setFriends(data.friends);
    setConversations(data.conversations);
    setMessages(data.messages);
    setDoctors(data.doctors);
    setDoctorQuestions(data.doctorQuestions);
  };

  /**
   * Loads all data for the signed-in user and enters the app.
   * `silent` refreshes in place without the full-screen loader.
   */
  const loadApp = async (silent = false) => {
    if (!silent) setIsLoading(true);
    setLoadError('');
    // Pause syncing so freshly loaded data is not echoed back to the server.
    setIsHydrated(false);
    try {
      const data = await babyCareService.bootstrap();
      applyBootstrap(data);
      setIsHydrated(true);
      if (!silent) setAuthState('app');
    } catch (err) {
      if (!babyCareService.hasSession()) return;
      if (silent) {
        setIsHydrated(true);
        console.error('[reload]', err);
      } else {
        setLoadError(err instanceof ApiError && err.code === 'NETWORK' ? err.message : UPDATING_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const resetSession = () => {
    babyCareService.logout();
    setIsHydrated(false);
    setLoadError('');
    setUser(EMPTY_USER);
    setActiveTab('home');
    setCurrentScreen('app');
    setActiveTimelineTarget(null);
    setShowProfileDrawer(false);
    setShowNotifications(false);
    setShowAdmin(false);
    setAuthState('welcome');
  };

  useEffect(() => {
    onUnauthorized(resetSession);
    if (babyCareService.hasSession()) {
      loadApp();
    } else if (authState !== 'welcome' && authState !== 'signup' && authState !== 'login') {
      setAuthState('welcome');
    }
  }, []);

  useEffect(() => {
    babyCareService.setAuthState(authState);
  }, [authState]);

  // Keep the leaderboard fresh whenever the rewards tab is opened.
  useEffect(() => {
    if (!isHydrated || activeTab !== 'rewards') return;
    babyCareService
      .getLeaderboard()
      .then((res) => setLeaderboard(res.leaderboard))
      .catch((err) => console.error('[leaderboard]', err));
  }, [activeTab, isHydrated]);

  // Lists the user owns are saved to MongoDB as they change. Posts, orders,
  // points, gifts and contests go through dedicated API calls instead.
  useServerSync(user, isHydrated, babyCareService.updateProfile);
  useServerSync(cart, isHydrated, babyCareService.saveCart);
  useServerSync(childrenList, isHydrated, (items) => babyCareService.syncCollection('children', items));
  useServerSync(friends, isHydrated, (items) => babyCareService.syncCollection('friends', items));
  useServerSync(conversations, isHydrated, (items) => babyCareService.syncCollection('conversations', items));
  useServerSync(messages, isHydrated, (items) => babyCareService.syncCollection('messages', items));
  useServerSync(doctorQuestions, isHydrated, (items) => babyCareService.syncCollection('doctorQuestions', items));

  const addRewardTx = (tx: RewardTransaction | null | undefined) => {
    if (tx) setRewardTx((prev) => [tx, ...prev]);
  };

  const unreadNotificationsCount = notifications.filter((n) => !n.read).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  if (isLoading || loadError) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2D2327] font-hind flex flex-col items-center justify-center gap-4 p-6 text-center">
        {loadError ? (
          <>
            <p className="text-sm text-[#56020A] font-semibold max-w-xs">{loadError}</p>
            <div className="flex gap-2">
              <button
                onClick={() => loadApp()}
                className="px-4 py-2 rounded-xl bg-[#56020A] text-white text-xs font-bold"
              >
                আবার চেষ্টা করুন
              </button>
              <button
                onClick={resetSession}
                className="px-4 py-2 rounded-xl border border-[#EDD6A9] bg-white text-[#56020A] text-xs font-bold"
              >
                লগআউট
              </button>
            </div>
          </>
        ) : (
          <>
            <img
              src="/logo.png"
              alt="Baby Care"
              className="w-16 h-16 rounded-full object-cover shadow-md border-2 border-[#EDD6A9] animate-pulse"
            />
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-[#56020A] animate-spin" />
              <p className="text-xs text-gray-600 font-medium">লোড হচ্ছে...</p>
            </div>
          </>
        )}
      </div>
    );
  }

  if (authState === 'welcome') {
    return (
      <WelcomeScreen
        onGoToSignUp={() => setAuthState('signup')}
        onGoToLogin={() => setAuthState('login')}
      />
    );
  }

  if (authState === 'login') {
    return (
      <LoginScreen
        onBack={() => setAuthState('welcome')}
        onProceed={async (contact) => {
          await babyCareService.requestOtp({ contact, mode: 'login' });
          setTempContact(contact);
          setIsLoginMode(true);
          setAuthState('verify');
        }}
        onGoToSignUp={() => setAuthState('signup')}
      />
    );
  }

  if (authState === 'signup') {
    return (
      <SignUpScreen
        onBack={() => setAuthState('welcome')}
        onProceed={async (name, contact) => {
          await babyCareService.requestOtp({ contact, mode: 'signup', name });
          setTempName(name);
          setTempContact(contact);
          setIsLoginMode(false);
          setAuthState('verify');
        }}
      />
    );
  }

  if (authState === 'verify') {
    return (
      <LoginVerifyScreen
        contact={tempContact}
        isLoginMode={isLoginMode}
        onBack={() => setAuthState(isLoginMode ? 'login' : 'signup')}
        onVerify={async (code) => {
          await babyCareService.verifyOtp(tempContact, code);
        }}
        onVerifySuccess={() => loadApp()}
        onResend={async () => {
          await babyCareService.requestOtp(
            isLoginMode
              ? { contact: tempContact, mode: 'login' }
              : { contact: tempContact, mode: 'signup', name: tempName }
          );
        }}
        onChangeContact={() => setAuthState(isLoginMode ? 'login' : 'signup')}
      />
    );
  }

  if (currentScreen === 'recipes') {
    return (
      <div className="min-h-screen bg-[#FAF6F0] text-[#2D2327] font-hind flex flex-col">
        <header className="bg-[#56020A] text-white p-4 flex items-center justify-between sticky top-0 z-30 shadow-md">
          <div className="flex items-center gap-3">
            <button onClick={() => setCurrentScreen('app')} className="p-1 hover:bg-white/10 rounded-lg">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h1 className="text-sm font-bold">রেসিপি ও পুষ্টি টিপস</h1>
          </div>
        </header>
        <div className="flex-1">
          <RecipesTab
            recipes={recipes}
            onUpdateRecipes={setRecipes}
            products={products}
            onOpenProduct={(p) => {
              setCurrentScreen('app');
              setActiveTab('shop');
            }}
          />
        </div>
      </div>
    );
  }

  if (activeTimelineTarget) {
    return (
      <UserTimelineScreen
        currentUser={user}
        onUpdateCurrentUser={setUser}
        targetUser={activeTimelineTarget}
        friends={friends}
        onUpdateFriends={setFriends}
        posts={posts}
        onUpdatePosts={setPosts}
        onAddRewardTx={addRewardTx}
        onBack={() => setActiveTimelineTarget(null)}
        onStartChat={(friend) => {
          setActiveTimelineTarget(null);
          setActiveMessengerFriend(friend);
          setCurrentScreen('messenger');
        }}
      />
    );
  }

  if (currentScreen === 'messenger') {
    return (
      <MessengerScreen
        conversations={conversations}
        onUpdateConversations={setConversations}
        messages={messages}
        onUpdateMessages={setMessages}
        friends={friends}
        initialActiveFriend={activeMessengerFriend}
        onBack={() => {
          setActiveMessengerFriend(null);
          setCurrentScreen('app');
        }}
        onOpenTimeline={(friend) => setActiveTimelineTarget({ type: 'other', friend })}
      />
    );
  }

  if (currentScreen === 'doctor') {
    return (
      <AskDoctorScreen
        doctors={doctors}
        questions={doctorQuestions}
        onUpdateQuestions={setDoctorQuestions}
        childrenList={childrenList}
        onBack={() => setCurrentScreen('app')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#2D2327] font-hind relative flex flex-col justify-between selection:bg-[#EDD6A9] selection:text-[#56020A]">
      {/* Top Header with Sticky Top Tabs */}
      <Header
        user={user}
        onOpenProfile={() => setShowProfileDrawer(true)}
        onOpenNotifications={() => setShowNotifications(true)}
        onOpenMessenger={() => {
          setActiveMessengerFriend(null);
          setCurrentScreen('messenger');
        }}
        onOpenAdmin={() => setShowAdmin(true)}
        unreadNotificationsCount={unreadNotificationsCount}
        unreadMessagesCount={unreadMessagesCount}
        friendRequestsCount={friends.filter((f) => f.friendshipStatus === 'request_received' && !f.isBlocked).length}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        cartCount={cart.reduce((a, c) => a + c.quantity, 0)}
      />

      {/* Main Tab Content */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <CommunityTab
            posts={posts}
            onUpdatePosts={setPosts}
            comments={comments}
            onUpdateComments={setComments}
            user={user}
            onAddRewardTx={addRewardTx}
            onOpenTimeline={(name) =>
              name === user.name
                ? setActiveTimelineTarget({ type: 'me' })
                : setActiveTimelineTarget({ type: 'other', authorName: name })
            }
          />
        )}
        {activeTab === 'baby' && (
          <MyBabyTab
            childrenList={childrenList}
            onUpdateChildren={setChildrenList}
            recipes={recipes}
            ageTipsMap={INITIAL_AGE_TIPS}
            onSelectRecipe={(rec) => {
              setCurrentScreen('recipes');
            }}
            onNavigateScreen={(screen) => setCurrentScreen(screen)}
          />
        )}
        {activeTab === 'friends' && (
          <FriendsScreen
            friends={friends}
            onUpdateFriends={setFriends}
            posts={posts}
            onBack={() => setActiveTab('home')}
            onStartChat={(friend) => {
              setActiveMessengerFriend(friend);
              setCurrentScreen('messenger');
            }}
            onOpenTimeline={(friend) => setActiveTimelineTarget({ type: 'other', friend })}
          />
        )}
        {activeTab === 'rewards' && (
          <RewardsTab
            contests={contests}
            submissions={submissions}
            onUpdateSubmissions={setSubmissions}
            gifts={gifts}
            onUpdateGifts={setGifts}
            rewardTx={rewardTx}
            onAddRewardTx={addRewardTx}
            giftRedemptions={giftRedemptions}
            onAddRedemption={(red) => setGiftRedemptions((prev) => [red, ...prev])}
            leaderboard={leaderboard}
            orders={orders}
            user={user}
            onOpenTimeline={(name) =>
              name === 'me'
                ? setActiveTimelineTarget({ type: 'me' })
                : setActiveTimelineTarget({ type: 'other', authorName: name })
            }
          />
        )}
        {activeTab === 'shop' && (
          <ShopTab
            products={products}
            onUpdateProducts={setProducts}
            cart={cart}
            onUpdateCart={setCart}
            orders={orders}
            onUpdateOrders={setOrders}
            user={user}
            onAddRewardTx={addRewardTx}
          />
        )}
      </main>

      {/* Left-side Profile Drawer */}
      <ProfileDrawer
        user={user}
        onUpdateUser={setUser}
        childrenList={childrenList}
        onUpdateChildren={setChildrenList}
        orders={orders}
        rewardTx={rewardTx}
        giftRedemptions={giftRedemptions}
        posts={posts}
        recipes={recipes}
        conversations={conversations}
        isOpen={showProfileDrawer}
        onClose={() => setShowProfileDrawer(false)}
        onLogout={resetSession}
        onNavigateTab={(tab: ActiveTab) => setActiveTab(tab)}
        onNavigateScreen={(screen) => setCurrentScreen(screen)}
        onOpenTimeline={() => setActiveTimelineTarget({ type: 'me' })}
      />

      <NotificationModal
        notifications={notifications}
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
        onMarkAllAsRead={() => {
          setNotifications(notifications.map((n) => ({ ...n, read: true })));
          babyCareService.markAllNotificationsRead().catch((err) => console.error('[notifications]', err));
        }}
      />

      <AdminModal
        contests={contests}
        isOpen={showAdmin}
        onClose={() => {
          setShowAdmin(false);
          loadApp(true);
        }}
      />
    </div>
  );
}
