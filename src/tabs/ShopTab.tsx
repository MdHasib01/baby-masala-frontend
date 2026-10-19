import React, { useState } from 'react';
import { Product, CartItem, Order, User, RewardTransaction } from '../types';
import { babyCareService } from '../services/babyCareService';
import { errorMessage } from '../services/api';
import { ShoppingBag, Search, Plus, Minus, X, CheckCircle2, ShieldCheck, Star, Truck, CreditCard, Banknote } from 'lucide-react';

interface ShopTabProps {
  products: Product[];
  onUpdateProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  cart: CartItem[];
  onUpdateCart: (cart: CartItem[]) => void;
  orders: Order[];
  onUpdateOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  user: User;
  onAddRewardTx: (tx: RewardTransaction | null) => void;
  selectedProductModal?: Product | null;
  onCloseModal?: () => void;
}

export const ShopTab: React.FC<ShopTabProps> = ({
  products,
  onUpdateProducts,
  cart,
  onUpdateCart,
  orders,
  onUpdateOrders,
  user,
  onAddRewardTx,
  selectedProductModal,
  onCloseModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('সব');
  const [activeProduct, setActiveProduct] = useState<Product | null>(selectedProductModal || null);
  const [quantity, setQuantity] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  
  // Checkout form state
  const [shippingAddress, setShippingAddress] = useState(user.addresses[0]?.details || '');
  const [orderNotes, setOrderNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [orderSuccess, setOrderSuccess] = useState<Order | null>(null);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  const categories = ['সব', 'হার্বস ও স্পাইস', 'কম্বো প্যাক'];

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'সব' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const totalCartAmount = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryCharge = totalCartAmount > 1000 ? 0 : 60; // Free delivery over 1000 BDT
  const finalTotal = totalCartAmount + (cart.length > 0 ? deliveryCharge : 0);

  const handleAddToCart = (product: Product, qty: number = 1) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      onUpdateCart(
        cart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + qty } : item
        )
      );
    } else {
      onUpdateCart([...cart, { product, quantity: qty }]);
    }
    setShowCart(true);
  };

  const handleUpdateCartQty = (productId: string, delta: number) => {
    onUpdateCart(
      cart
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim() || cart.length === 0 || isPlacingOrder) return;

    // Prices, stock and reward points are checked and calculated by the server.
    setIsPlacingOrder(true);
    setCheckoutError('');
    try {
      const res = await babyCareService.placeOrder({
        cart,
        shippingAddress,
        notes: orderNotes || undefined,
        paymentMethod,
      });
      onUpdateOrders((prev) => [res.order, ...prev]);
      onAddRewardTx(res.rewardTx);
      onUpdateProducts((prev) => prev.map((p) => res.products.find((u) => u.id === p.id) || p));
      setOrderSuccess(res.order);
      onUpdateCart([]);
      setShowCheckout(false);
    } catch (err) {
      setCheckoutError(errorMessage(err));
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="pb-24 max-w-xl mx-auto px-4 pt-4 space-y-4 font-hind">
      {/* Search & Cart Floating Trigger */}
      <div className="flex gap-2 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="বেবি মসলা, বেসিল বা হার্বস খুঁজুন..."
            className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#EDD6A9] rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#56020A]"
          />
        </div>
        <button
          onClick={() => setShowCart(true)}
          className="relative px-4 py-2.5 bg-[#56020A] text-white rounded-2xl text-xs font-bold shadow hover:bg-[#56020A]/90 flex items-center gap-1.5 whitespace-nowrap"
        >
          <ShoppingBag className="w-4 h-4" />
          <span>কার্ট</span>
          {cart.length > 0 && (
            <span className="bg-[#D6AA4F] text-[#56020A] w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center">
              {cart.reduce((a, c) => a + c.quantity, 0)}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Chips */}
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

      {/* Products Grid */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {filteredProducts.map((p) => (
          <div
            key={p.id}
            onClick={() => {
              setActiveProduct(p);
              setQuantity(1);
            }}
            className="bg-white rounded-2xl border border-[#EDD6A9]/60 shadow-sm overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="relative h-36 bg-gray-100 overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 bg-[#375013] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow">
                  {p.weight}
                </span>
              </div>
              <div className="p-3 space-y-1">
                <h3 className="text-xs font-bold text-[#56020A] line-clamp-1">{p.name}</h3>
                <div className="flex items-center gap-1 text-[10px] text-amber-500 font-bold">
                  <Star className="w-3 h-3 fill-amber-500" />
                  <span>{p.rating} ({p.reviewsCount} রিভিউ)</span>
                </div>
              </div>
            </div>

            <div className="p-3 pt-0 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#56020A]">৳ {p.price}</span>
                {p.originalPrice && (
                  <span className="text-[10px] text-gray-400 line-through ml-1.5">৳ {p.originalPrice}</span>
                )}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddToCart(p, 1);
                }}
                className="px-2.5 py-1.5 bg-[#EDD6A9] text-[#56020A] rounded-xl text-[11px] font-bold hover:bg-[#D6AA4F] transition-colors"
              >
                + কার্ট
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden">
            <div className="relative h-48 bg-gray-100 shrink-0">
              <img src={activeProduct.image} alt={activeProduct.name} className="w-full h-full object-cover" />
              <button
                onClick={() => setActiveProduct(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <div className="flex justify-between items-start">
                  <h2 className="text-base font-bold text-[#56020A]">{activeProduct.name}</h2>
                  <span className="bg-[#375013]/10 text-[#375013] font-bold px-2.5 py-1 rounded-full">
                    {activeProduct.weight}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg font-bold text-[#56020A]">৳ {activeProduct.price}</span>
                  {activeProduct.originalPrice && (
                    <span className="text-xs text-gray-400 line-through">৳ {activeProduct.originalPrice}</span>
                  )}
                  <span className="text-[10px] bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full ml-auto">
                    স্টকে আছে ({activeProduct.stock}টি)
                  </span>
                </div>
              </div>

              <p className="text-gray-700 leading-relaxed">{activeProduct.description}</p>

              <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] space-y-2">
                <h4 className="font-bold text-[#56020A]">উপাদান ও ব্যবহার:</h4>
                <p className="text-gray-600">১০০% প্রাকৃতিক ও অর্গানিক হার্বস। শিশুর খিচুড়ি, সুপ বা পিউরিতে সামান্য পরিমাণে ব্যবহার করুন।</p>
                <h4 className="font-bold text-[#56020A] pt-1">সংরক্ষণ পদ্ধতি:</h4>
                <p className="text-gray-600">শুকনো ও ঠান্ডা স্থানে এয়ারটাইট বয়ামে সংরক্ষণ করুন।</p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <span className="font-semibold text-gray-700">পরিমাণ:</span>
                <div className="flex items-center gap-3 bg-white border border-[#EDD6A9] rounded-xl px-3 py-1">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-[#56020A] font-bold">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="text-[#56020A] font-bold">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <button
                onClick={() => {
                  handleAddToCart(activeProduct, quantity);
                  setActiveProduct(null);
                }}
                className="w-full py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>কার্টে যোগ করুন (৳ {activeProduct.price * quantity})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cart Slide-Over / Modal */}
      {showCart && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-[#FAF6F0] rounded-t-3xl sm:rounded-2xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl border border-[#EDD6A9] overflow-hidden animate-in slide-in-from-bottom duration-200">
            <div className="bg-[#56020A] text-white p-4 flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#EDD6A9]" /> আপনার শপিং কার্ট
              </h3>
              <button onClick={() => setShowCart(false)} className="p-1 rounded-full hover:bg-white/10 text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {cart.length === 0 ? (
                <p className="text-xs text-gray-500 text-center py-12">কার্ট খালি রয়েছে।</p>
              ) : (
                cart.map((item) => (
                  <div key={item.product.id} className="bg-white p-3 rounded-xl border border-[#EDD6A9] flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <h4 className="text-xs font-bold text-[#56020A]">{item.product.name}</h4>
                        <p className="text-xs font-semibold text-gray-600">৳ {item.product.price} x {item.quantity}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleUpdateCartQty(item.product.id, -1)}
                        className="p-1 bg-gray-100 rounded text-gray-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold w-4 text-center">{item.quantity}</span>
                      <button
                        onClick={() => handleUpdateCartQty(item.product.id, 1)}
                        className="p-1 bg-gray-100 rounded text-gray-700"
                      >
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
                    <span>৳ {totalCartAmount}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>ডেলিভারি চার্জ:</span>
                    <span>{deliveryCharge === 0 ? 'ফ্রি' : `৳ ${deliveryCharge}`}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-[#56020A] pt-2 border-t border-gray-100">
                    <span>সর্বমোট প্রদেয়:</span>
                    <span>৳ {finalTotal}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowCart(false);
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

      {/* Checkout Modal */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-base font-bold text-[#56020A]">ডেমো চেকআউট ও পেমেন্ট</h3>
              <button onClick={() => setShowCheckout(false)} className="p-1 rounded-full hover:bg-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCheckoutSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">শিপিং ঠিকানা</label>
                <textarea
                  rows={3}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">অর্ডার নোট (ঐচ্ছিক)</label>
                <input
                  type="text"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  placeholder="যেমন: বাসায় পৌঁছে ফোন করবেন"
                  className="w-full px-3 py-2 text-xs bg-white border border-[#EDD6A9] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#56020A] mb-1">পেমেন্ট পদ্ধতি</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      paymentMethod === 'cod' ? 'bg-[#56020A] text-white border-[#56020A]' : 'bg-white text-gray-700 border-[#EDD6A9]'
                    }`}
                  >
                    <Banknote className="w-4 h-4" /> ক্যাশ অন ডেলিভারি
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 ${
                      paymentMethod === 'online' ? 'bg-[#56020A] text-white border-[#56020A]' : 'bg-white text-gray-700 border-[#EDD6A9]'
                    }`}
                  >
                    <CreditCard className="w-4 h-4" /> অনলাইন পেমেন্ট (ডেমো)
                  </button>
                </div>
              </div>

              <div className="bg-white p-3 rounded-xl border border-[#EDD6A9] text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">সাবটোটাল:</span>
                  <span className="font-bold">৳ {totalCartAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ডেলিভারি চার্জ:</span>
                  <span className="font-bold">{deliveryCharge === 0 ? 'ফ্রি' : `৳ ${deliveryCharge}`}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-gray-100 font-bold text-[#56020A]">
                  <span>সর্বমোট প্রদেয়:</span>
                  <span>৳ {finalTotal}</span>
                </div>
              </div>

              {checkoutError && (
                <p className="text-xs text-red-600 font-semibold bg-red-50 p-2 rounded-lg">{checkoutError}</p>
              )}

              <button
                type="submit"
                disabled={isPlacingOrder}
                className="w-full py-3 bg-[#56020A] text-white font-bold text-xs rounded-xl shadow hover:bg-[#56020A]/90 transition-colors disabled:opacity-60"
              >
                {isPlacingOrder ? 'অর্ডার হচ্ছে...' : `অর্ডার করুন (৳ ${finalTotal})`}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Success Modal */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#FAF6F0] rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-[#EDD6A9] space-y-4 text-center">
            <div className="w-12 h-12 bg-green-100 text-green-700 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-[#56020A]">অর্ডার সফল হয়েছে!</h3>
            <p className="text-xs text-gray-700">
              আপনার অর্ডার আইডি: <span className="font-bold">#{orderSuccess.id}</span>
            </p>
            <p className="text-xs font-semibold text-[#375013]">
              অর্ডার ডেলিভারির পর আপনি +{orderSuccess.pointsEarned} পয়েন্ট অর্জন করবেন!
            </p>
            <button
              onClick={() => setOrderSuccess(null)}
              className="w-full py-2.5 bg-[#56020A] text-white font-bold text-xs rounded-xl"
            >
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
