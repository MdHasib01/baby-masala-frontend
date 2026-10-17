export interface Child {
  id: string;
  name: string;
  dob: string; // YYYY-MM-DD
  photo?: string;
  allergies?: string;
}

export interface User {
  id?: string;
  name: string;
  contact: string; // email or whatsapp
  contactMethod?: 'email' | 'whatsapp';
  role?: 'member' | 'admin';
  isAdmin?: boolean;
  bio?: string;
  coverPhoto?: string;
  location?: string;
  dateOfBirth?: string; // YYYY-MM-DD
  earnedPoints?: number;
  spentPoints?: number;
  isVerified: boolean;
  isMember: boolean;
  membershipExpiry?: string;
  couponUsed?: string;
  avatar: string;
  addresses: {
    id: string;
    title: string;
    details: string;
    phone: string;
    isDefault: boolean;
  }[];
  notificationPrefs: {
    push: boolean;
    sms: boolean;
    email: boolean;
    communityAlerts: boolean;
  };
  privacySettings: {
    shareProfile: boolean;
    showChildrenInfo: boolean;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
}

export interface Post {
  id: string;
  authorId?: string;
  authorName: string;
  authorAvatar: string;
  isVerifiedBuyer: boolean;
  topic: 'সব পোস্ট' | 'খাবার' | 'ঘুম' | 'বিকাশ' | 'মায়ের গল্প';
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video';
  createdAt: string;
  likes: number;
  likedByMe?: boolean;
  savedByMe?: boolean;
  commentsCount: number;
  status: 'approved' | 'pending' | 'rejected';
}

export interface Recipe {
  id: string;
  title: string;
  ageGroup: 'under_6m' | '6_8m' | '9_12m' | '1_2y' | '2y_plus';
  ageGroupLabel: string;
  image: string;
  videoUrl?: string;
  prepTime: string;
  ingredients: string[];
  steps: string[];
  textureNotes: string;
  allergens: string;
  shopProductId?: string;
  saved?: boolean;
}

export interface AgeTip {
  ageGroup: 'under_6m' | '6_8m' | '9_12m' | '1_2y' | '2y_plus';
  title: string;
  foodChart: string[];
  tips: string[];
  medicalDisclaimer: string;
}

export interface Contest {
  id: string;
  title: string;
  type: 'recipe_video' | 'review';
  description: string;
  eligibility: 'all' | 'delivered_order';
  startDate: string;
  endDate: string;
  prize: string;
  pointsReward?: number;
  status: 'active' | 'ended';
  winners?: { name: string; prize: string }[];
}

export interface ContestSubmission {
  id: string;
  contestId: string;
  userName: string;
  mediaUrl: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  orderId?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  image: string;
  description: string;
  weight: string;
  stock: number;
  rating: number;
  reviewsCount: number;
  pointsEarned?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
  pointsEarned: number;
}

export interface RewardTransaction {
  id: string;
  date: string;
  description: string;
  points: number;
  type: 'earn' | 'redeem';
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  avatar: string;
  earned: number;
  isMe: boolean;
}

export interface GiftItem {
  id: string;
  name: string;
  pointsCost: number;
  image: string;
  stock: number;
  description: string;
}

export interface GiftRedemption {
  id: string;
  giftId: string;
  giftName: string;
  pointsCost: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reward' | 'order' | 'community' | 'tip' | 'friend' | 'message' | 'doctor' | 'complaint';
}

export type ComplaintCategory = 'order' | 'product' | 'payment' | 'app' | 'community' | 'other';
export type ComplaintStatus = 'open' | 'in_progress' | 'resolved';

export interface Complaint {
  id: string;
  userId: string;
  userName: string;
  userContact: string;
  category: ComplaintCategory;
  details: string;
  attachmentUrl?: string;
  status: ComplaintStatus;
  adminReply: string;
  createdAt: string; // Bengali relative label
  updatedAt: string;
}

// Friends & Social Types
export interface FriendUser {
  id: string;
  name: string;
  avatar: string;
  bio: string;
  location: string;
  mutualFriendsCount: number;
  friendshipStatus: 'friends' | 'request_sent' | 'request_received' | 'none';
  isBlocked?: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string; // 'me' or friend id
  text: string;
  mediaUrl?: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface Conversation {
  id: string;
  participant: FriendUser;
  lastMessage: string;
  lastTimestamp: string;
  unreadCount: number;
  isRequest?: boolean;
}

// Medical Types
export interface Doctor {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  languages: string[];
  experience: string;
  feePlaceholder: string;
  demoTimeSlots: string[];
  demoQualifications: string;
  isAvailable: boolean;
}

export interface DoctorQuestion {
  id: string;
  childNameOrGeneral: string;
  category: string;
  title: string;
  detailedQuestion: string;
  attachmentUrl?: string;
  status: 'জমা হয়েছে' | 'উত্তর অপেক্ষায়' | 'উত্তর এসেছে' | 'বন্ধ হয়েছে';
  submissionDate: string;
  assignedDoctorName?: string;
  sampleReply?: string;
  followUpQuestions: { sender: 'user' | 'doctor'; text: string; time: string }[];
  isPrivate: boolean;
}
