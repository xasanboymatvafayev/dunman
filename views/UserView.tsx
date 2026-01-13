
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Filter, X, MapPin, Phone, User, CheckCircle2 } from 'lucide-react';
import { db } from '../db';
import { Product, ProductType, CartItem, UserInfo, Order } from '../types';

export const UserView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductType>(ProductType.SALE);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Checkout State
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phone: '',
    location: { lat: 0, lng: 0 }
  });
  const [checkoutType, setCheckoutType] = useState<'DELIVERY' | 'BOOKING'>('DELIVERY');
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);

  useEffect(() => {
    setProducts(db.getProducts().filter(p => p.stock > 0));
  }, [isCartOpen]);

  const filteredProducts = useMemo(() => {
    return products.filter(p => 
      p.type === activeTab && 
      (p.description.toLowerCase().includes(searchQuery.toLowerCase()) || p.code.includes(searchQuery))
    );
  }, [products, activeTab, searchQuery]);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      if (existing.quantity < product.stock) {
        setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id) {
        const newQty = item.quantity + delta;
        const originalProduct = products.find(p => p.id === id);
        if (newQty > 0 && originalProduct && newQty <= originalProduct.stock) {
          return { ...item, quantity: newQty };
        }
      }
      return item;
    }));
  };

  const cartTotal = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    return subtotal * (1 - appliedDiscount / 100);
  }, [cart, appliedDiscount]);

  const handleCheckout = () => {
    if (!userInfo.name || !userInfo.phone) {
      alert("Iltimos ismingiz va telefon raqamingizni kiriting!");
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: cart,
      user: userInfo,
      type: checkoutType,
      total: cartTotal,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    db.saveOrder(newOrder);
    
    // Simulate Admin Bot Notification
    console.log("SENDING TO ADMIN BOT:", newOrder);
    alert("Buyurtmangiz qabul qilindi! Admin tez orada siz bilan bog'lanadi.");
    
    // Reset
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  const applyPromo = () => {
    const promo = db.getPromos().find(p => p.code.toLowerCase() === promoCode.toLowerCase());
    if (promo) {
      setAppliedDiscount(promo.discount);
      alert(`${promo.discount}% chegirma qo'llanildi!`);
    } else {
      alert("Promokod xato!");
    }
  };

  return (
    <div className="pt-4 px-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Luxury</h1>
          <p className="text-slate-500 text-sm">Boutique & Rental</p>
        </div>
        <button 
          onClick={() => setIsCartOpen(true)}
          className="relative p-3 bg-white shadow-md rounded-2xl text-slate-700"
        >
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
              {cart.length}
            </span>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
        <button 
          onClick={() => setActiveTab(ProductType.SALE)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === ProductType.SALE ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
        >
          Sotiladigan
        </button>
        <button 
          onClick={() => setActiveTab(ProductType.RENT)}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === ProductType.RENT ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
        >
          Prokatga
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          type="text"
          placeholder="Koylak qidirish..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
        />
      </div>

      {/* Product List */}
      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map(product => (
          <div key={product.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100 flex flex-col">
            <div className="relative aspect-[3/4] group">
              <img src={product.images[0]} alt={product.code} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-2 py-1 rounded-lg text-[10px] font-bold text-slate-800 shadow-sm">
                ID: {product.code}
              </div>
              {product.stock <= 2 && (
                <div className="absolute bottom-3 left-3 bg-orange-500 text-white px-2 py-0.5 rounded text-[9px] font-bold uppercase">
                  Faqat {product.stock} dona!
                </div>
              )}
            </div>
            <div className="p-3 flex-1 flex flex-col">
              <h3 className="text-sm font-semibold text-slate-800 line-clamp-1">{product.description}</h3>
              <p className="text-[11px] text-slate-400 mb-2">Razmer: {product.size}</p>
              <div className="mt-auto">
                <div className="text-pink-600 font-bold text-sm">
                  {product.price.toLocaleString()} so'm {product.type === ProductType.RENT && '/soat'}
                </div>
                <button 
                  onClick={() => addToCart(product)}
                  className="w-full mt-2 bg-slate-900 text-white text-[11px] py-2 rounded-xl font-medium hover:bg-slate-800 active:scale-95 transition-all"
                >
                  Savatga
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20 opacity-50">
          <Filter className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>Hozircha hech narsa topilmadi</p>
        </div>
      )}

      {/* Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[40px] shadow-2xl p-6 h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-300">
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" />
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-pink-600" /> Savat
              </h2>
              <button onClick={() => setIsCartOpen(false)} className="p-2 bg-slate-100 rounded-full text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {cart.map(item => (
                <div key={item.id} className="flex gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <img src={item.images[0]} className="w-20 h-24 object-cover rounded-xl shadow-sm" />
                  <div className="flex-1 flex flex-col py-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-semibold text-sm line-clamp-1">{item.description}</h4>
                      <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">ID: {item.code} | Razmer: {item.size}</p>
                    <div className="mt-auto flex justify-between items-center">
                      <span className="font-bold text-pink-600">{(item.price * item.quantity).toLocaleString()} so'm</span>
                      <div className="flex items-center gap-3 bg-white rounded-lg border border-slate-200 px-2">
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-slate-400 font-bold p-1">-</button>
                        <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="text-slate-400 font-bold p-1">+</button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {cart.length === 0 && <p className="text-center text-slate-400 py-10">Savatchangiz bo'sh</p>}
            </div>

            {cart.length > 0 && (
              <div className="mt-6 pt-6 border-t border-slate-100">
                <div className="flex justify-between mb-4">
                  <span className="text-slate-500">Jami:</span>
                  <span className="text-xl font-bold text-slate-800">{cartTotal.toLocaleString()} so'm</span>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg shadow-slate-900/20 active:scale-95 transition-transform"
                >
                  Buyurtma berish
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-bold mb-6 text-center">Ma'lumotlaringiz</h2>
            
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Ismingiz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  value={userInfo.name}
                  onChange={(e) => setUserInfo({...userInfo, name: e.target.value})}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="tel" 
                  placeholder="Telefon raqamingiz"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  value={userInfo.phone}
                  onChange={(e) => setUserInfo({...userInfo, phone: e.target.value})}
                />
              </div>
              
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                <MapPin className="w-5 h-5 text-pink-500" />
                <div className="flex-1">
                  <p className="text-xs font-bold">Lokatsiya</p>
                  <p className="text-[10px] text-slate-400">Hozirgi turgan joyingiz yuboriladi</p>
                </div>
                <button 
                  onClick={() => {
                    navigator.geolocation.getCurrentPosition(pos => {
                      setUserInfo({...userInfo, location: { lat: pos.coords.latitude, lng: pos.coords.longitude }});
                      alert("Lokatsiya aniqlandi!");
                    });
                  }}
                  className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md font-bold"
                >
                  Aniqlash
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button 
                  onClick={() => setCheckoutType('DELIVERY')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${checkoutType === 'DELIVERY' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  Dostavka
                </button>
                <button 
                  onClick={() => setCheckoutType('BOOKING')}
                  className={`py-2 rounded-lg text-xs font-bold transition-all ${checkoutType === 'BOOKING' ? 'bg-white shadow text-slate-800' : 'text-slate-500'}`}
                >
                  Band qilish
                </button>
              </div>

              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="Promokod"
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl py-2 px-4 text-xs focus:outline-none"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                />
                <button onClick={applyPromo} className="bg-slate-200 px-4 py-2 rounded-xl text-xs font-bold">Qo'llash</button>
              </div>
            </div>

            <div className="mt-8">
              <button 
                onClick={handleCheckout}
                className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
              >
                Tasdiqlash <CheckCircle2 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
