export interface HerbItem {
  id: string;
  name: string;
  nameBn: string;
  nameEn: string;
  origin: string;
  details: string;
  weight: string;
  price: number;
  image?: string;
}

export interface WeightOption {
  weight: string;
  label: string;
  price: number;
  compareAt: number;
}

export interface ComboData {
  id: string;
  name: string;
  shortDesc: string;
  description: string;
  price: number;
  compareAt: number;
  weight: string;
  image: string;
  badge: string;
  rating: number;
  reviewsCount: number;
  weightOptions: WeightOption[];
  benefits: string[];
  ingredients: HerbItem[];
}

export const DEFAULT_COMBO_DATA: ComboData = {
  id: '5-herbs-combo',
  name: '৫ প্রিমিয়াম হার্বস কম্বো',
  shortDesc: 'ব্যাসিল, ওরিগানো, থাইম, রোজমেরি ও সেইজ—এক চিমটিতেই বাচ্চার খাবারের নতুন প্রাকৃতিক স্বাদ।',
  description:
    'শিশুর প্রতিদিনের খিচুড়ি, স্যুপ, পিউরি বা সেদ্ধ ডিমে পাঁচটি প্রিমিয়াম হার্বস যোগ করবে মনোরম প্রাকৃতিক সুবাস। সঙ্গে ১২ মাসের বেবি কেয়ার অ্যাপ মেম্বারশিপ ও রেসিপি বুকলেট সম্পূর্ণ ফ্রি!',
  price: 1150,
  compareAt: 1650,
  weight: '৫ × ৩০ গ্রাম (মোট ১৫০ গ্রাম)',
  image: '/images/combo_bundle.jpg',
  badge: 'হট ডিল · মেগা অফার',
  rating: 5.0,
  reviewsCount: 342,
  weightOptions: [
    {
      weight: '5x30g Combo Pack',
      label: '৫টি জারের সম্পূর্ণ সেট (৩০ গ্রাম × ৫)',
      price: 1150,
      compareAt: 1650,
    },
    {
      weight: '5x60g Family Pack',
      label: 'ফ্যামিলি প্যাক (৬০ গ্রাম × ৫)',
      price: 1950,
      compareAt: 2800,
    },
  ],
  benefits: [
    'খাবারে নতুন প্রাকৃতিক সুবাস যোগ করে বাচ্চার আগ্রহ বাড়ায়',
    'পাঁচটি এসেনশিয়াল হার্বস একসঙ্গে',
    'কোনো কৃত্রিম রঙ, ফ্লেভার, লবণ বা চিনি ছাড়া ১০০% অর্গানিক',
    'প্রতিটি হার্ব আলাদা ফুড-গ্রেড এয়ারটাইট কাঁচের জারে প্যাক করা',
  ],
  ingredients: [
    {
      id: 'basil',
      name: 'ব্যাসিল',
      nameBn: 'ব্যাসিল',
      nameEn: 'Sweet Basil',
      origin: 'মৃদু মিষ্টি সুবাসের পাতা',
      details: 'খিচুড়ি, স্যুপ ও সবজি পিউরিতে পরিচিত কোমল সুবাস যোগ করে।',
      weight: '৩০ গ্রাম',
      price: 330,
      image: '/images/basil_jar.jpg',
    },
    {
      id: 'oregano',
      name: 'ওরিগানো',
      nameBn: 'ওরিগানো',
      nameEn: 'Oregano',
      origin: 'ভূমধ্যসাগরীয় সুগন্ধি পাতা',
      details: 'স্যুপ, নুডলস ও সেভরি খাবারে উষ্ণ হার্বাল স্বাদ যোগ করে।',
      weight: '৩০ গ্রাম',
      price: 330,
      image: '/images/oregano_jar.jpg',
    },
    {
      id: 'thyme',
      name: 'থাইম',
      nameBn: 'থাইম',
      nameEn: 'Thyme',
      origin: 'হালকা আর্থি সুবাসের ছোট পাতা',
      details: 'চিকেন, সবজি ও স্যুপের স্বাদে সূক্ষ্ম গভীরতা যোগ করে।',
      weight: '৩০ গ্রাম',
      price: 330,
    },
    {
      id: 'rosemary',
      name: 'রোজমেরি',
      nameBn: 'রোজমেরি',
      nameEn: 'Rosemary',
      origin: 'সতেজ সুবাসের সরু পাতা',
      details: 'আলু, চিকেন ও সবজি রান্নায় সতেজ ও স্বতন্ত্র সুবাস আনে।',
      weight: '৩০ গ্রাম',
      price: 330,
    },
    {
      id: 'sage',
      name: 'সেইজ',
      nameBn: 'সেইজ',
      nameEn: 'Sage',
      origin: 'নরম সুবাসের রুপালি-সবুজ পাতা',
      details: 'পাস্তা, সবজি ও চিকেনের সঙ্গে উষ্ণ, কোমল হার্বাল স্বাদ যোগ করে।',
      weight: '৩০ গ্রাম',
      price: 330,
    },
  ],
};

export const SINGLE_HERBS_CATALOG = [
  { id: 'basil', name: 'অর্গানিক বেবি সুইট ব্যাসিল ফ্লেক্স', weight: '৩০ গ্রাম', price: 330, image: '/images/basil_jar.jpg' },
  { id: 'oregano', name: 'অর্গানিক বেবি ওরিগানো ফ্লেক্স', weight: '৩০ গ্রাম', price: 330, image: '/images/oregano_jar.jpg' },
  { id: 'thyme', name: 'অর্গানিক বেবি থাইম ফ্লেক্স', weight: '৩০ গ্রাম', price: 330, image: '' },
  { id: 'rosemary', name: 'অর্গানিক বেবি রোজমেরি ফ্লেক্স', weight: '৩০ গ্রাম', price: 330, image: '' },
  { id: 'sage', name: 'অর্গানিক বেবি সেইজ ফ্লেক্স', weight: '৩০ গ্রাম', price: 330, image: '' },
];

export const CERTIFICATIONS = [
  'ISO Certified',
  'Halal Certified',
  '100% Vegan',
  'GMP Certified',
  'Lab Tested',
  '100% Natural',
  'BSTI',
  'HACCP',
  'BCSIR',
];

export const COMBO_FAQS = [
  {
    q: 'একটি Combo-তে কয়টি Herbs থাকবে?',
    a: '৫টি: Basil, Oregano, Thyme, Rosemary, Sage — প্রতিটি ৩০ গ্রাম করে মোট ১৫০ গ্রাম (ফ্যামিলি প্যাকে ৩০০ গ্রাম)।',
  },
  {
    q: 'Single Herbs আলাদা অর্ডার করা যাবে?',
    a: 'হ্যাঁ, অর্ডার ফর্মেই কম্বোর সাথে বা আলাদাভাবে যেকোনো হার্বস যোগ করতে পারবেন।',
  },
  {
    q: 'ডেলিভারি চার্জ কত?',
    a: 'ঢাকার ভেতরে ৳৭০, ঢাকার বাইরে ৳১১০ — প্রতি অর্ডারে একবার, জার যতগুলোই হোক।',
  },
  {
    q: 'Baby Care App সাবস্ক্রিপশন কতদিনের?',
    a: '১২ মাসের (এক বছর), মূল্য ৳৫০০০, কিন্তু এই কম্বো অর্ডারে সম্পূর্ণ ফ্রি!',
  },
  {
    q: 'প্রথম ১০০ জনের অফার কীভাবে পাব?',
    a: 'প্রথম ১০০ জন কম্বো ক্রেতার পার্সেলের সাথেই কুপন কোড থাকবে। অ্যাপ চালু হলে সেটা দিয়ে ১২ মাসের মেম্বারশিপ চালু করবেন।',
  },
  {
    q: 'হার্বস কীভাবে ব্যবহার করবেন?',
    a: 'রান্না শেষের দিকে বা পরিবেশনের আগে শিশুর খাবারে মাত্র ১ চিমটি ছড়িয়ে মিশিয়ে দিন।',
  },
  {
    q: 'কত বয়স থেকে ব্যবহার করা যায়?',
    a: 'সাধারণত ৬ মাস বয়সের পর, বাচ্চা নতুন সলিড খাবার শুরু করলে। শুরুর আগে শিশু বিশেষজ্ঞের পরামর্শ নিতে পারেন।',
  },
  {
    q: 'অর্ডার দেওয়ার পর কী হবে?',
    a: 'আমরা ফোন করে অর্ডার কনফার্ম করব, তারপর ২-৩ দিনের মধ্যে হোম ডেলিভারি পৌঁছে যাবে।',
  },
  {
    q: 'Cash on Delivery আছে?',
    a: 'হ্যাঁ, পণ্য হাতে পেয়ে ডেলিভারিম্যানের কাছে সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।',
  },
  {
    q: 'সব বাচ্চার খাবার খাওয়ার আগ্রহ কি একইভাবে বাড়বে?',
    a: 'প্রতিটি বাচ্চা আলাদা। হার্বস খাবারে নতুন প্রাকৃতিক সুবাস আনে, যা অনেক বাচ্চাকে আগ্রহী করে প্লেট খালি করতে সাহায্য করে।',
  },
];

