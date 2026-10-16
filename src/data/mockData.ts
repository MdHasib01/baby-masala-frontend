import { Product, Recipe, AgeTip, Post, Comment, Contest, ContestSubmission, GiftItem, Order, RewardTransaction, GiftRedemption, NotificationItem, User, Child } from '../types';

export const INITIAL_USER: User = {
  name: 'ফাতিমা শারমিন',
  contact: '01712345678',
  isVerified: true,
  isMember: true,
  membershipExpiry: 'জীবনব্যাপী ফ্রি (ডেমো কুপন)',
  couponUsed: 'BABYCARE',
  avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
  addresses: [
    {
      id: 'addr-1',
      title: 'বাসা (ধানমন্ডি)',
      details: 'রোড ৭/এ, ধানমন্ডি, ঢাকা - ১২০৯',
      phone: '01712345678',
      isDefault: true,
    },
  ],
  notificationPrefs: {
    push: true,
    sms: false,
    email: true,
    communityAlerts: true,
  },
  privacySettings: {
    shareProfile: true,
    showChildrenInfo: false,
  },
};

export const INITIAL_CHILDREN: Child[] = [
  {
    id: 'child-1',
    name: 'আয়ান রহমান',
    dob: '2024-05-10',
    allergies: 'কোনো এলার্জি নেই',
  },
];

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'বেবি বেসিল গুঁড়া (Baby Basil 10g)',
    category: 'হার্বস ও স্পাইস',
    price: 350,
    originalPrice: 420,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
    description: 'শিশুদের খাবার সুস্বাদু ও পুষ্টিকর করতে ১০০% অর্গানিক বেবি বেসিল। কোনো কৃত্রিম রং বা প্রিজারভেটিভ নেই।',
    weight: '১০ গ্রাম',
    stock: 25,
    rating: 4.9,
    reviewsCount: 42,
  },
  {
    id: 'p2',
    name: 'ওরেগানো গুঁড়া (Oregano 10g)',
    category: 'হার্বস ও স্পাইস',
    price: 380,
    originalPrice: 450,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80',
    description: 'খাবারের ফ্লেভার বাড়াতে এবং হজমে সহায়তার জন্য প্রিমিয়াম কোয়ালিটি ওরেগানো।',
    weight: '১০ গ্রাম',
    stock: 18,
    rating: 4.8,
    reviewsCount: 38,
  },
  {
    id: 'p3',
    name: 'সেজ গুঁড়া (Sage 10g)',
    category: 'হার্বস ও স্পাইস',
    price: 400,
    originalPrice: 480,
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&auto=format&fit=crop&q=80',
    description: 'শিশুর রোগ প্রতিরোধ ক্ষমতা ও অন্ত্রের স্বাস্থ্যের জন্য উপযোগী বিশুদ্ধ সেজ হার্ব।',
    weight: '১০ গ্রাম',
    stock: 12,
    rating: 4.7,
    reviewsCount: 29,
  },
  {
    id: 'p4',
    name: 'থাইম গুঁড়া (Thyme 10g)',
    category: 'হার্বস ও স্পাইস',
    price: 370,
    originalPrice: 430,
    image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5756?w=400&auto=format&fit=crop&q=80',
    description: 'ঠান্ডা-কাশি প্রতিরোধে এবং খাবারের সুবাস বাড়াতে থাইম দারুণ কার্যকরী।',
    weight: '১০ গ্রাম',
    stock: 30,
    rating: 4.9,
    reviewsCount: 51,
  },
  {
    id: 'p5',
    name: 'রোজমেরি গুঁড়া (Rosemary 10g)',
    category: 'হার্বস ও হার্বস ও স্পাইস',
    price: 420,
    originalPrice: 500,
    image: 'https://images.unsplash.com/photo-1550989460-0adf9ea622e2?w=400&auto=format&fit=crop&q=80',
    description: 'মস্তিষ্কের বিকাশে ও পুষ্টির জন্য সেরা মানের প্রাকৃতিক রোজমেরি।',
    weight: '১০ গ্রাম',
    stock: 15,
    rating: 4.8,
    reviewsCount: 33,
  },
  {
    id: 'p6',
    name: 'মিক্সড হার্বস (Mixed Herbs 10g)',
    category: 'কম্বো প্যাক',
    price: 500,
    originalPrice: 600,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    description: 'সকল পুষ্টিকর হার্বসের চমৎকার মিশ্রণ যা খিচুড়ি ও সুপে ব্যবহার করা যায়।',
    weight: '১০ গ্রাম',
    stock: 40,
    rating: 5.0,
    reviewsCount: 88,
  },
];

export const INITIAL_RECIPES: Recipe[] = [
  {
    id: 'rec-1',
    title: 'পুষ্টিকর সবজি খিচুড়ি',
    ageGroup: '9_12m',
    ageGroupLabel: '৯-১২ মাস',
    image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    prepTime: '২৫ মিনিট',
    ingredients: ['পোলাও চাল ২ চামচ', 'মুগ ডাল ১ চামচ', 'গাজর ও মিষ্টি কুমড়া কুচি', 'এক চিমটি বেবি বেসিল গুঁড়া', 'ঘি আধা চামচ'],
    steps: [
      'চাল ও ডাল ভালোভাবে ধুয়ে ২০ মিনিট ভিজিয়ে রাখুন।',
      'পাতিলে পানি দিয়ে চাল, ডাল ও সবজি সেদ্ধ করুন।',
      'নরম হয়ে গেলে ভালো করে চটকে নিন।',
      'নামানোর আগে এক চিমটি বেবি বেসিল ও আধা চামচ ঘি মিশিয়ে দিন।'
    ],
    textureNotes: 'হালকা মাখা মাখা এবং নরম টেক্সচার',
    allergens: 'ডাল ও গ্লুটেন (সতর্ক থাকুন)',
    shopProductId: 'p1',
    saved: true,
  },
  {
    id: 'rec-2',
    title: 'নরম আলু ও মিষ্টি কুমড়ার পিউরি',
    ageGroup: '6_8m',
    ageGroupLabel: '৬-৮ মাস',
    image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=600&auto=format&fit=crop&q=80',
    prepTime: '১৫ মিনিট',
    ingredients: ['মিষ্টি কুমড়া ৫০ গ্রাম', 'আলু ৩০ গ্রাম', 'বুকের দুধ বা ফর্মুলা মিল্ক ২ চামচ'],
    steps: [
      'মিষ্টি কুমড়া ও আলু ছোট টুকরো করে সেদ্ধ করুন।',
      'সেদ্ধ সবজি পানি থেকে তুলে কাঁটা চামচ বা ব্লেন্ডারে পেস্ট করুন।',
      'প্রয়োজনে সামান্য বুকের দুধ মিশিয়ে ঘনত্ব ঠিক করুন।'
    ],
    textureNotes: 'একেবারে মসৃণ ও তরল পিউরি',
    allergens: 'কোনো এলার্জেন নেই',
    shopProductId: 'p2',
    saved: false,
  },
  {
    id: 'rec-3',
    title: 'সুস্বাদু ও স্বাস্থ্যকর চিকেন ভেজিটেবল স্যুপ',
    ageGroup: '1_2y',
    ageGroupLabel: '১-২ বছর',
    image: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=80',
    prepTime: '৩০ মিনিট',
    ingredients: ['চিকেন কিমা ৩০ গ্রাম', 'পেঁপে ও গাজর কুচি', 'এক চিমটি মিক্সড হার্বস', 'অল্প লবণ'],
    steps: [
      'চিকেন ও সবজি পানি দিয়ে সেদ্ধ করুন।',
      'সেদ্ধ হওয়া পর্যন্ত ফুটিয়ে স্টক তৈরি করুন।',
      'পরিবেশনের আগে এক চিমটি মিক্সড হার্বস ছিটিয়ে দিন।'
    ],
    textureNotes: 'ছোট টুকরোসহ হালকা স্যুপ',
    allergens: 'চিকেন প্রোটিন',
    shopProductId: 'p6',
    saved: true,
  },
  {
    id: 'rec-4',
    title: 'এক্সক্লুসিভ ওটস ও কলা স্মুদি',
    ageGroup: '2y_plus',
    ageGroupLabel: '২ বছর ও তদূর্ধ্ব',
    image: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=600&auto=format&fit=crop&q=80',
    prepTime: '১০ মিনিট',
    ingredients: ['ওটস ২ চামচ (সেদ্ধ)', 'পাকা কলা ১টি', 'দুধ ১ কাপ', 'মধু আধা চামচ'],
    steps: [
      'ওটস হালকা সেদ্ধ করে ঠান্ডা করুন।',
      'কলার সাথে দুধ ও ওটস ব্লেন্ডারে ব্লেন্ড করুন।',
      'ওপরে সামান্য দারুচিনি গুঁড়া দিয়ে পরিবেশন করুন।'
    ],
    textureNotes: 'স্মুথ ও পানীয় টেক্সচার',
    allergens: 'ল্যাকটোজ (দুধ)',
    shopProductId: 'p4',
    saved: false,
  },
];

export const INITIAL_AGE_TIPS: Record<string, AgeTip> = {
  under_6m: {
    ageGroup: 'under_6m',
    title: '৬ মাসের কম বয়সী শিশুর পরিচর্যা',
    foodChart: [
      'শুধুমাত্র মায়ের বুকের দুধ (এক্সক্লুসিভ ব্রেস্টফিডিং)।',
      'ডাক্তারের পরামর্শ ছাড়া পানি বা অন্য কোনো খাবার দেওয়া নিষেধ।'
    ],
    tips: [
      'প্রতি ২-৩ ঘণ্টা পর পর দুধ দিন।',
      'বাচ্চাকে ঢেকুর তোলা নিশ্চিত করুন।',
      'ঘর ঠান্ডা ও আরামদায়ক রাখুন।'
    ],
    medicalDisclaimer: 'নোট: এই তথ্যগুলো সাধারণ গাইডলাইন মাত্র। শিশুর যেকোনো শারীরিক সমস্যায় চিকিৎসকের পরামর্শ নিন।',
  },
  '6_8m': {
    ageGroup: '6_8m',
    title: '৬ থেকে ৮ মাসের শিশুর পুষ্টি',
    foodChart: [
      'নরম পিউরি ও চটকানো খাবার (চাল, ডাল, মিষ্টি কুমড়া, কলা, আপেল)।',
      'প্রতিদিন ২ থেকে ৩ চা চামচ দিয়ে শুরু করুন।'
    ],
    tips: [
      'নতুন খাবার দেওয়ার পর ৩ দিন পর্যবেক্ষণ করুন।',
      'চিনি বা অতিরিক্ত লবণ একদম দেবেন না।',
      'বুকের দুধের পাশাপাশি সম্পূরক খাবার চালু রাখুন।'
    ],
    medicalDisclaimer: 'নোট: এই তথ্যগুলো সাধারণ গাইডলাইন মাত্র। শিশুর যেকোনো শারীরিক সমস্যায় চিকিৎসকের পরামর্শ নিন।',
  },
  '9_12m': {
    ageGroup: '9_12m',
    title: '৯ থেকে ১২ মাসের শিশুর পুষ্টি',
    foodChart: [
      'সবজি খিচুড়ি, ডিমের কুসুম, মাছের নরম টুকরো, সুজি, পায়েস।',
      'দিন ৩-৪ বার অল্প পরিমাণে খাবার।'
    ],
    tips: [
      'শিশুকে নিজে হাতে খাবার ধরার সুযোগ দিন (ফিঙ্গার ফুড)।',
      'খাবারে বেবি মসলা হার্বস ব্যবহার করে স্বাদ বাড়ান।',
      'খাওয়ার পর পানি পানের অভ্যাস করান।'
    ],
    medicalDisclaimer: 'নোট: এই তথ্যগুলো সাধারণ গাইডলাইন মাত্র। শিশুর যেকোনো শারীরিক সমস্যায় চিকিৎসকের পরামর্শ নিন।',
  },
  '1_2y': {
    ageGroup: '1_2y',
    title: '১ থেকে ২ বছরের শিশুর পুষ্টি',
    foodChart: [
      'পরিবারের সবার খাবার (কম ঝাল ও মসলাযুক্ত), ফলমূল, ডিম, মাংসের নরম টুকরো।',
      'গরুর দুধ ও দুগ্ধজাত খাবার।'
    ],
    tips: [
      'খাবারে বৈচিত্র্য আনুন যাতে অরুচি না হয়।',
      'নিয়মিত ঘুমের রুটিন বজায় রাখুন।',
      'বাইরে খেলাধুলার সুযোগ দিন।'
    ],
    medicalDisclaimer: 'নোট: এই তথ্যগুলো সাধারণ গাইডলাইন মাত্র। শিশুর যেকোনো শারীরিক সমস্যায় চিকিৎসকের পরামর্শ নিন।',
  },
  '2y_plus': {
    ageGroup: '2y_plus',
    title: '২ বছর ও তদূর্ধ্ব শিশুর পরিচর্যা',
    foodChart: [
      'সুষম খাবার ও পুষ্টিকর টিফিন (ডিম, দুধ, সবজি, মাছ, মাংস, ডাল)।',
      'দৈনিক ৩ বেলা মূল খাবার ও ২ বেলা হালকা নাস্তা।'
    ],
    tips: [
      'খাওয়ার সময় মোবাইল বা স্ক্রিন দেওয়া থেকে বিরত থাকুন।',
      'ব্যক্তিগত পরিচ্ছন্নতা ও হাত ধোয়ার অভ্যাস শেখান।'
    ],
    medicalDisclaimer: 'নোট: এই তথ্যগুলো সাধারণ গাইডলাইন মাত্র। শিশুর যেকোনো শারীরিক সমস্যায় চিকিৎসকের পরামর্শ নিন।',
  },
};

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorName: 'সাবিহা সুলতানা',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    isVerifiedBuyer: true,
    topic: 'খাবার',
    content: 'আমার ৮ মাসের বাবুর জন্য বেবি মসলার বেবি বেসিল দিয়ে সুস্বাদু খিচুড়ি বানালাম। সে খুব আনন্দের সাথে খেয়েছে! দারুণ একটা প্রোডাক্ট।',
    mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
    mediaType: 'image',
    createdAt: '১০ মিনিট আগে',
    likes: 24,
    likedByMe: false,
    savedByMe: true,
    commentsCount: 5,
    status: 'approved',
  },
  {
    id: 'post-2',
    authorName: 'নুসরাত জাহান',
    authorAvatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    isVerifiedBuyer: false,
    topic: 'ঘুম',
    content: 'আমার দেড় বছরের বাবু রাতে ঘুমোতে একদম চায় না। আপনাদের কার কার এই অভিজ্ঞতা আছে? কোনো টিপস থাকলে শেয়ার করুন প্লিজ।',
    createdAt: '২ ঘণ্টা আগে',
    likes: 15,
    likedByMe: true,
    savedByMe: false,
    commentsCount: 8,
    status: 'approved',
  },
  {
    id: 'post-3',
    authorName: 'আয়েশা সিদ্দিকা',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    isVerifiedBuyer: true,
    topic: 'মায়ের গল্প',
    content: 'মাতৃত্বের এই যাত্রায় প্রথম প্রথম খুব ভয় হতো, এখন আল্লাহর রহমতে সব সামলে নিচ্ছি। সব মায়েরা কেমন আছেন?',
    createdAt: '৫ ঘণ্টা আগে',
    likes: 42,
    likedByMe: false,
    savedByMe: false,
    commentsCount: 12,
    status: 'approved',
  },
];

export const INITIAL_COMMENTS: Comment[] = [
  {
    id: 'comm-1',
    postId: 'post-1',
    authorName: 'ফারজানা আক্তার',
    authorAvatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    content: 'বাহ! আমিও এটা অর্ডার করব ভাবছি। রেসিপিটা একটু শেয়ার করবেন?',
    createdAt: '৮ মিনিট আগে',
    likes: 3,
  },
  {
    id: 'comm-2',
    postId: 'post-1',
    authorName: 'সাবিহা সুলতানা',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    content: 'অবশ্যই আপু! চাল ও ডালের সাথে এক চিমটি বেবি বেসিল মিশিয়ে দিলেই চমৎকার সুবাস হয়।',
    createdAt: '৫ মিনিট আগে',
    likes: 5,
  },
];

export const INITIAL_CONTESTS: Contest[] = [
  {
    id: 'cont-1',
    title: 'সেরা রান্নার ভিডিও কনটেস্ট (মার্চ ২০২৬)',
    type: 'recipe_video',
    description: 'আপনার বাবুর স্বাস্থ্যকর রান্নার ১-২ মিনিটের ভিডিও আপলোড করুন এবং জিতে নিন আকর্ষণীয় পুরস্কার!',
    eligibility: 'delivered_order',
    startDate: '১ মার্চ ২০২৬',
    endDate: '৩০ মার্চ ২০২৬',
    prize: 'বেবি মসলা কম্বো প্যাক + ১০০০ রিওয়ার্ড পয়েন্ট',
    status: 'active',
    winners: [
      { name: 'নাজনীন আকতার', prize: 'প্রথম পুরস্কার - কম্বো প্যাক' },
      { name: 'তানজিলা হক', prize: 'দ্বিতীয় পুরস্কার - ৫০০ পয়েন্ট' },
    ],
  },
  {
    id: 'cont-2',
    title: 'সৎ প্রোডাক্ট রিভিউ কনটেস্ট',
    type: 'review',
    description: 'বেবি মসলার যেকোনো প্রোডাক্ট নিয়ে আপনার সৎ অভিজ্ঞতা ভিডিও বা ছবির মাধ্যমে শেয়ার করুন।',
    eligibility: 'all',
    startDate: '১৫ মার্চ ২০২৬',
    endDate: '১৫ এপ্রিল ২০২৬',
    prize: '৫০০ টাকা শপিং ভাউচার',
    status: 'active',
  },
];

export const INITIAL_GIFTS: GiftItem[] = [
  {
    id: 'gift-1',
    name: 'বেবি বেসিল ১০ গ্রাম',
    pointsCost: 500,
    image: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=400&auto=format&fit=crop&q=80',
    stock: 20,
    description: '৫০০ পয়েন্টের বিনিময়ে সম্পূর্ণ ফ্রি ডেলিভারিতে পান বেবি বেসিল ১০ গ্রাম।',
  },
  {
    id: 'gift-2',
    name: 'ওরেগানো ১০ গ্রাম',
    pointsCost: 500,
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&auto=format&fit=crop&q=80',
    stock: 15,
    description: '৫০০ পয়েন্টের বিনিময়ে পান প্রিমিয়াম ওরেগানো হার্ব।',
  },
  {
    id: 'gift-3',
    name: 'মিক্সড হার্বস ১০ গ্রাম',
    pointsCost: 700,
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80',
    stock: 10,
    description: '৭০০ পয়েন্টের বিনিময়ে পান আমাদের বিশেষ মিক্সড হার্বস প্যাক।',
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-101',
    items: [
      { product: INITIAL_PRODUCTS[0], quantity: 1 },
      { product: INITIAL_PRODUCTS[5], quantity: 1 },
    ],
    totalAmount: 850,
    status: 'delivered',
    shippingAddress: 'রোড ৭/এ, ধানমন্ডি, ঢাকা - ১২০৯',
    createdAt: '২০ ফেব্রুয়ারি ২০২৬',
    pointsEarned: 85,
  },
];

export const INITIAL_REWARD_TX: RewardTransaction[] = [
  {
    id: 'tx-1',
    date: '২০ ফেব্রুয়ারি ২০২৬',
    description: 'সফল অর্ডার (ord-101) থেকে পয়েন্ট অর্জন',
    points: 85,
    type: 'earn',
  },
  {
    id: 'tx-2',
    date: '২৫ ফেব্রুয়ারি ২০২৬',
    description: 'কমিউনিটি পোস্ট অনুমোদন (খাবার)',
    points: 20,
    type: 'earn',
  },
];

export const INITIAL_GIFT_REDEMPTIONS: GiftRedemption[] = [];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'স্বাগতম বেবি কেয়ারে!',
    message: 'BABYCARE কুপন কোড ব্যবহার করে আপনার প্রিমিয়াম মেম্বারশিপ সফলভাবে সক্রিয় হয়েছে।',
    time: '১ দিন আগে',
    read: false,
    type: 'reward',
  },
  {
    id: 'notif-2',
    title: 'অর্ডার সফল',
    message: 'আপনার অর্ডার #ord-101 সফলভাবে ডেলিভারি হয়েছে। আপনি ৮৫ পয়েন্ট অর্জন করেছেন।',
    time: '৩ দিন আগে',
    read: true,
    type: 'order',
  },
];
