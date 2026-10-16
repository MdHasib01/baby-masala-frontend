import { FriendUser, Conversation, Message, Doctor, DoctorQuestion } from '../types';

export const INITIAL_FRIENDS: FriendUser[] = [
  {
    id: 'f1',
    name: 'ফারজানা আক্তার',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    bio: 'দুই সন্তানের জননী। রান্নাবান্না ও পুষ্টি নিয়ে ব্লগ করতে ভালো লাগে।',
    location: 'ধানমন্ডি, ঢাকা',
    mutualFriendsCount: 5,
    friendshipStatus: 'friends',
  },
  {
    id: 'f2',
    name: 'তানজিলা হক',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    bio: 'মাতৃত্বের প্রথম বছর পার করছি। সবার সাথে অভিজ্ঞতা শেয়ার করতে ভালোবাসি।',
    location: 'উত্তরা, ঢাকা',
    mutualFriendsCount: 3,
    friendshipStatus: 'friends',
  },
  {
    id: 'f3',
    name: 'সাবিহা সুলতানা',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    bio: 'নবজাতকের যত্ন ও পুষ্টি বিষয়ক তথ্য খুঁজছি।',
    location: 'গুলশান, ঢাকা',
    mutualFriendsCount: 2,
    friendshipStatus: 'request_received',
  },
  {
    id: 'f4',
    name: 'নাজনীন নাহার',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    bio: 'শিশুর ঘুম ও রুটিন নিয়ে কাজ করছি।',
    location: 'বনানী, ঢাকা',
    mutualFriendsCount: 4,
    friendshipStatus: 'none',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    participant: INITIAL_FRIENDS[0],
    lastMessage: 'আপু আপনার রেসিপিটা দারুণ ছিল!',
    lastTimestamp: '১০ মিনিট আগে',
    unreadCount: 1,
    isRequest: false,
  },
  {
    id: 'conv-2',
    participant: INITIAL_FRIENDS[1],
    lastMessage: 'আগামীকাল কি কমিউনিটি মিটআপে আসছ?',
    lastTimestamp: '২ ঘণ্টা আগে',
    unreadCount: 0,
    isRequest: false,
  },
  {
    id: 'conv-3',
    participant: INITIAL_FRIENDS[2],
    lastMessage: 'হ্যালো আপু, আপনার সাথে বন্ধু হতে চাই।',
    lastTimestamp: 'গতকাল',
    unreadCount: 1,
    isRequest: true,
  },
];

export const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    conversationId: 'conv-1',
    senderId: 'f1',
    text: 'আপু আপনার বেবি বেসিল দিয়ে খিচুড়ির রেসিপিটা দেখতে পেরে খুব ভালো লাগল।',
    timestamp: '১০ মিনিট আগে',
    status: 'read',
  },
  {
    id: 'm2',
    conversationId: 'conv-1',
    senderId: 'me',
    text: 'অসংখ্য ধন্যবাদ আপু! আপনার বাবু কেমন আছে?',
    timestamp: '৮ মিনিট আগে',
    status: 'delivered',
  },
  {
    id: 'm3',
    conversationId: 'conv-1',
    senderId: 'f1',
    text: 'আলহামদুলিল্লাহ ভালো আছে। আপু আপনার রেসিপিটা দারুণ ছিল!',
    timestamp: '৫ মিনিট আগে',
    status: 'sent',
  },
];

export const INITIAL_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'ডাঃ মোসাম্মত নাজনীন সুলতানা',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
    specialty: 'শিশু বিশেষজ্ঞ ও নবজাতক রোগ বিশেষজ্ঞ (MBBS, FCPS)',
    languages: ['বাংলা', 'English'],
    experience: '১২ বছর অভিজ্ঞতা',
    feePlaceholder: '৳ ১,০০০ (ডেমো ফি)',
    demoTimeSlots: ['সকাল ১০:০০ - ১০:৩০', 'বিকাল ৪:০০ - ৪:৩০', 'সন্ধ্যা ৭:০০ - ৭:৩০'],
    demoQualifications: 'ঢাকা মেডিকেল কলেজ ও হাসপাতাল। ফেলোশিপ ইন পিডিয়াট্রিক্স (UK)।',
    isAvailable: true,
  },
  {
    id: 'doc-2',
    name: 'ডাঃ তানভীর আহমেদ চৌধুরী',
    avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
    specialty: 'শিশুর পুষ্টি ও বিকাশ বিশেষজ্ঞ (MD, Pediatrics)',
    languages: ['বাংলা'],
    experience: '৮ বছর অভিজ্ঞতা',
    feePlaceholder: '৳ ১,২০০ (ডেমো ফি)',
    demoTimeSlots: ['সকাল ১১:০০ - ১১:৩০', 'রাত ৮:০০ - ৮:৩০'],
    demoQualifications: 'স্যার সলিমুল্লাহ মেডিকেল কলেজ। শিশুর পুষ্টি ও গ্রোথ স্পেশালিস্ট।',
    isAvailable: true,
  },
];

export const INITIAL_DOCTOR_QUESTIONS: DoctorQuestion[] = [
  {
    id: 'q-1',
    childNameOrGeneral: 'আয়ান রহমান (১০ মাস)',
    category: 'খাবার ও পুষ্টি',
    title: 'বাবুর খাবারে কি সামান্য লবণ দেওয়া যাবে?',
    detailedQuestion: 'আমার বাবুর বয়স ১০ মাস চলছে। সে সবজি খিচুড়ি খাচ্ছে। খাবারে কি সামান্য লবণ বা বেবি মসলা হার্বস দেওয়া নিরাপদ?',
    status: 'উত্তর এসেছে',
    submissionDate: '১২ মার্চ ২০২৬',
    assignedDoctorName: 'ডাঃ মোসাম্মত নাজনীন সুলতানা',
    sampleReply: '১০ মাস বয়সী শিশুর খাবারে অতিরিক্ত লবণ এড়িয়ে চলা উচিত। তবে প্রাকৃতিক হার্বস ও বেবি মসলা পরিমিত পরিমাণে ব্যবহার করতে পারেন।',
    followUpQuestions: [
      { sender: 'user', text: 'ধন্যবাদ ডাক্তার আপু। দিনে কতবার দেওয়া যাবে?', time: '৫ ঘণ্টা আগে' },
      { sender: 'doctor', text: 'দিনে ১ থেকে ২ বার সামান্য পরিমাণে দিতে পারেন।', time: '৪ ঘণ্টা আগে' }
    ],
    isPrivate: true,
  },
];
