
import React, { useState, useEffect, useMemo } from 'react';
import { ShoppingCart, Search, Filter, X, MapPin, Phone, User, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { db } from '../db';
import { Product, ProductType, CartItem, UserInfo, Order } from '../types';

const ImageSlider = ({ images }: { images: string[] }) => {
  const [current, setCurrent] = useState(0);
  if (!images.length) return null;
  return (
    <div className="relative w-full aspect-[3/4] overflow-hidden">
      <img src={images[current]} className="w-full h-full object-cover" />
      {images.length > 1 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); setCurrent(prev => prev === 0 ? images.length - 1 : prev - 1)}} className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/50 p-1 rounded-full"><ChevronLeft className="w-4 h-4"/></button>
          <button onClick={(e) => { e.stopPropagation(); setCurrent(prev => prev === images.length - 1 ? 0 : prev + 1)}} className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/50 p-1 rounded-full"><ChevronRight className="w-4 h-4"/></button>
        </>
      )}
    </div>
  );
};

export const UserView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProductType>(ProductType.SALE);
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [userInfo, setUserInfo] = useState<UserInfo>({
    name: '',
    phone: '',
    location: { lat: 0, lng: 0 }
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await db.getProducts();
      setProducts(data);
      setLoading(false);
    };
    load();
  }, [isCartOpen, isCheckoutOpen]);

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
      } else {
        alert("Omborda boshqa qolmagan!");
      }
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const handleCheckout = async () => {
    if (!userInfo.name || !userInfo.phone) {
      alert("Ism va telefonni kiriting!");
      return;
    }

    const newOrder: Order = {
      id: Math.random().toString(36).substr(2, 9),
      items: cart,
      user: userInfo,
      type: 'DELIVERY',
      total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    await db.saveOrder(newOrder);
    alert("Buyurtma berildi! Admin botga xabar yuborildi.");
    setCart([]);
    setIsCheckoutOpen(false);
    setIsCartOpen(false);
  };

  if (loading) return <div className="flex items-center justify-center h-screen font-bold">Yuklanmoqda...</div>;

  return (
    <div className="pt-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif font-bold text-slate-800">Luxury</h1>
          <p className="text-slate-500 text-sm">Boutique</p>
        </div>
        <button onClick={() => setIsCartOpen(true)} className="relative p-3 bg-white shadow-md rounded-2xl">
          <ShoppingCart className="w-6 h-6" />
          {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{cart.length}</span>}
        </button>
      </div>

      <div className="flex gap-2 mb-6 bg-slate-100 p-1 rounded-xl">
        {Object.values(ProductType).map(t => (
          <button key={t} onClick={() => setActiveTab(t)} className={`flex-1 py-2 rounded-lg text-sm font-bold ${activeTab === t ? 'bg-white shadow' : 'text-slate-500'}`}>
            {t === ProductType.SALE ? 'Sotuv' : 'Prokat'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filteredProducts.map(p => (
          <div key={p.id} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            <ImageSlider images={p.images} />
            <div className="p-3">
              <h3 className="text-sm font-semibold truncate">{p.description}</h3>
              <p className="text-[10px] text-slate-400">ID: {p.code} | Razmer: {p.size}</p>
              <div className="text-pink-600 font-bold text-sm mt-1">{p.price.toLocaleString()} so'm</div>
              <button onClick={() => addToCart(p)} className="w-full mt-2 bg-slate-900 text-white text-[10px] py-2 rounded-xl">Savatga</button>
            </div>
          </div>
        ))}
      </div>

      {/* Cart & Checkout logic is similar but uses async db.saveOrder */}
      {isCartOpen && (
        <div className="fixed inset-0 z-[60] flex items-end justify-center">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
          <div className="relative w-full max-w-md bg-white rounded-t-[40px] p-6 h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold mb-4">Savat</h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex gap-3 bg-slate-50 p-2 rounded-xl">
                  <img src={item.images[0]} className="w-16 h-20 object-cover rounded-lg" />
                  <div className="flex-1">
                    <h4 className="text-sm font-bold">{item.description}</h4>
                    <p className="text-[10px]">{item.quantity} dona x {item.price.toLocaleString()} so'm</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setIsCheckoutOpen(true)} className="w-full bg-slate-900 text-white py-4 rounded-2xl mt-4 font-bold">Checkout</button>
          </div>
        </div>
      )}

      {isCheckoutOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={() => setIsCheckoutOpen(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[32px] p-6 shadow-2xl">
            <h2 className="text-xl font-bold mb-4 text-center">Buyurtmani tasdiqlash</h2>
            <input type="text" placeholder="Ismingiz" className="w-full border p-3 rounded-xl mb-3" value={userInfo.name} onChange={e => setUserInfo({...userInfo, name: e.target.value})} />
            <input type="tel" placeholder="Telefon" className="w-full border p-3 rounded-xl mb-3" value={userInfo.phone} onChange={e => setUserInfo({...userInfo, phone: e.target.value})} />
            <button onClick={handleCheckout} className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold">Buyurtma berish</button>
          </div>
        </div>
      )}
    </div>
  );
};
