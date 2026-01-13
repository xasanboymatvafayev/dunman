
import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Edit3, Check, X, Camera, BarChart3, Users, Gift, Settings, Lock, LogOut } from 'lucide-react';
import { db } from '../db';
import { Product, ProductType, Order, PromoCode } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const AdminView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS' | 'STATS' | 'PROMOS' | 'SETTINGS'>('PRODUCTS');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [promos, setPromos] = useState<PromoCode[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Settings State
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Add Product State
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '',
    images: [],
    description: '',
    type: ProductType.SALE,
    size: '',
    price: 0,
    stock: 1,
    discount: 0
  });
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (isAuthenticated) {
      setProducts(db.getProducts());
      setOrders(db.getOrders());
      setPromos(db.getPromos());
    }
  }, [activeTab, isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === db.getAdminPassword()) {
      setIsAuthenticated(true);
    } else {
      alert("Parol xato!");
    }
  };

  const handleChangePassword = () => {
    if (newPassword === confirmPassword && newPassword.length > 0) {
      db.saveAdminPassword(newPassword);
      alert("Parol muvaffaqiyatli o'zgartirildi!");
      setNewPassword('');
      setConfirmPassword('');
    } else {
      alert("Parollar mos kelmadi!");
    }
  };

  const handleAddProduct = () => {
    if (!newProduct.code || newProduct.images?.length === 0 || !newProduct.description) {
      alert("Hamma maydonlarni to'ldiring!");
      return;
    }
    const product: Product = {
      ...newProduct as Product,
      id: Math.random().toString(36).substr(2, 9),
    };
    db.saveProduct(product);
    setProducts(db.getProducts());
    setIsAddingProduct(false);
    setStep(1);
    setNewProduct({
      code: '',
      images: [],
      description: '',
      type: ProductType.SALE,
      size: '',
      price: 0,
      stock: 1,
      discount: 0
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const readers = Array.from(files).map(file => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      Promise.all(readers).then(results => {
        setNewProduct({...newProduct, images: [...(newProduct.images || []), ...results]});
      });
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-slate-900">
        <div className="w-full max-w-sm bg-white rounded-[40px] p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-pink-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-pink-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Admin Panel</h2>
          <p className="text-slate-400 text-sm mb-8">Kirish uchun parolni kiriting</p>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              placeholder="Parol"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-4 px-6 text-center text-lg focus:outline-none focus:ring-2 focus:ring-pink-500/20"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              autoFocus
            />
            <button 
              type="submit"
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg active:scale-95 transition-transform"
            >
              Kirish
            </button>
          </form>
        </div>
      </div>
    );
  }

  const statsData = [
    { name: 'Sotuv', value: products.filter(p => p.type === ProductType.SALE).length },
    { name: 'Prokat', value: products.filter(p => p.type === ProductType.RENT).length },
    { name: 'Buyurtma', value: orders.length }
  ];

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Admin Panel</h1>
          <p className="text-slate-400 text-xs">Boshqaruv markazi</p>
        </div>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="p-2 bg-white rounded-xl shadow-sm border border-slate-100 text-slate-400 hover:text-red-500 transition-colors"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
        {[
          { id: 'PRODUCTS', label: 'Koylaklar' },
          { id: 'ORDERS', label: 'Buyurtmalar' },
          { id: 'STATS', label: 'Statistika' },
          { id: 'PROMOS', label: 'Promokodlar' },
          { id: 'SETTINGS', label: 'Sozlamalar' },
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-none px-5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${activeTab === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-white text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="ID orqali qidirish..."
                className="w-full bg-white border border-slate-200 rounded-xl py-2 pl-10 pr-4 text-xs focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button 
              onClick={() => setIsAddingProduct(true)}
              className="bg-pink-600 text-white p-2 rounded-xl shadow-lg shadow-pink-600/20"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {products.filter(p => p.code.includes(searchQuery)).map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl flex gap-4 border border-slate-100 shadow-sm items-center">
                <img src={p.images[0]} className="w-16 h-20 object-cover rounded-xl" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">#{p.code}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${p.type === ProductType.SALE ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
                      {p.type === ProductType.SALE ? 'SOTUV' : 'PROKAT'}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-slate-800 line-clamp-1">{p.description}</h3>
                  <div className="flex gap-4 mt-2">
                    <span className="text-xs text-slate-500 font-medium">Omborda: <b>{p.stock}</b></span>
                    <span className="text-xs text-slate-500 font-medium">Razmer: <b>{p.size}</b></span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <button onClick={() => db.deleteProduct(p.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-slate-800">{order.user.name}</h4>
                  <p className="text-[10px] text-slate-400">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === 'PENDING' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                  {order.status}
                </span>
              </div>
              <div className="space-y-2 py-2 border-y border-slate-50">
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span className="text-slate-500">{item.description} (x{item.quantity})</span>
                    <span className="font-bold">{(item.price * item.quantity).toLocaleString()} so'm</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center text-sm font-bold pt-1">
                <span>Jami:</span>
                <span className="text-pink-600">{order.total.toLocaleString()} so'm</span>
              </div>
              <div className="flex gap-2 pt-2">
                <button className="flex-1 bg-slate-100 text-slate-600 py-2 rounded-xl text-xs font-bold">Xarita</button>
                {order.status === 'PENDING' && (
                  <button 
                    onClick={() => {
                      db.confirmOrder(order.id);
                      setOrders(db.getOrders());
                    }}
                    className="flex-1 bg-green-500 text-white py-2 rounded-xl text-xs font-bold"
                  >
                    Tasdiqlash
                  </button>
                )}
              </div>
            </div>
          ))}
          {orders.length === 0 && <div className="text-center py-20 text-slate-400">Hozircha buyurtmalar yo'q</div>}
        </div>
      )}

      {activeTab === 'STATS' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <Users className="w-8 h-8 text-blue-500 mb-2" />
              <p className="text-slate-400 text-[10px] font-bold uppercase">Mijozlar</p>
              <h3 className="text-2xl font-bold">128</h3>
            </div>
            <div className="bg-white p-4 rounded-3xl shadow-sm border border-slate-100">
              <BarChart3 className="w-8 h-8 text-pink-500 mb-2" />
              <p className="text-slate-400 text-[10px] font-bold uppercase">Sotuvlar</p>
              <h3 className="text-2xl font-bold">{orders.length}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-[32px] shadow-sm border border-slate-100 h-64">
            <h4 className="text-sm font-bold mb-4">Umumiy Ko'rsatkichlar</h4>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis hide />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#ec4899" radius={[10, 10, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'PROMOS' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm">
            <h4 className="text-sm font-bold mb-4">Yangi Promokod</h4>
            <div className="space-y-3">
              <input type="text" id="promo-code" placeholder="Kod (masalan: SPRING20)" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              <input type="number" id="promo-discount" placeholder="Chegirma %" className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs focus:outline-none" />
              <button 
                onClick={() => {
                  const code = (document.getElementById('promo-code') as HTMLInputElement).value;
                  const discount = parseInt((document.getElementById('promo-discount') as HTMLInputElement).value);
                  if (code && discount) {
                    db.savePromo({ code, discount });
                    setPromos(db.getPromos());
                    alert("Promokod qo'shildi!");
                  }
                }}
                className="w-full bg-slate-900 text-white py-2 rounded-xl text-xs font-bold"
              >
                Qo'shish
              </button>
            </div>
          </div>
          <div className="space-y-2">
            {promos.map((p, i) => (
              <div key={i} className="bg-white px-4 py-3 rounded-2xl flex justify-between items-center border border-slate-100">
                <div className="flex items-center gap-3">
                  <Gift className="w-5 h-5 text-orange-400" />
                  <span className="font-bold text-sm text-slate-800">{p.code}</span>
                </div>
                <span className="bg-orange-100 text-orange-600 px-3 py-1 rounded-full text-[10px] font-bold">-{p.discount}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'SETTINGS' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-slate-100 rounded-2xl text-slate-800">
                <Settings className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold">Xavfsizlik sozlamalari</h4>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Yangi parol</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Yangi parolni kiriting"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase ml-2">Parolni tasdiqlash</label>
                <input 
                  type="password" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Parolni qayta kiriting"
                />
              </div>
              <button 
                onClick={handleChangePassword}
                className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold shadow-lg mt-2"
              >
                Parolni saqlash
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm opacity-50">
            <h4 className="text-sm font-bold mb-2">Bot ma'lumotlari</h4>
            <p className="text-xs text-slate-500">Versiya: 1.0.4 (Pro)</p>
          </div>
        </div>
      )}

      {/* Add Product Modal (Multi-step) */}
      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" />
          <div className="relative w-full max-w-sm bg-white rounded-[40px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-slate-900 p-6 text-white text-center">
              <h2 className="text-xl font-bold">Yangi Koylak</h2>
              <div className="flex justify-center gap-2 mt-4">
                {[1,2,3,4].map(i => (
                  <div key={i} className={`w-2 h-2 rounded-full ${step >= i ? 'bg-pink-500' : 'bg-slate-700'}`} />
                ))}
              </div>
            </div>

            <div className="p-8">
              {step === 1 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">1-qadam: Asosiy Ma'lumot</p>
                  <input 
                    type="text" 
                    placeholder="ID (Masalan: 001)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                    value={newProduct.code}
                    onChange={(e) => setNewProduct({...newProduct, code: e.target.value})}
                  />
                  <textarea 
                    placeholder="Tavsif" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm h-24 focus:outline-none"
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({...newProduct, description: e.target.value})}
                  />
                  <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-3 rounded-2xl font-bold">Keyingisi</button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">2-qadam: Rasmlar</p>
                  <div className="grid grid-cols-3 gap-2">
                    {newProduct.images?.map((img, i) => (
                      <div key={i} className="relative aspect-square">
                        <img src={img} className="w-full h-full object-cover rounded-lg" />
                        <button 
                          onClick={() => setNewProduct({...newProduct, images: newProduct.images?.filter((_, idx) => idx !== i)})}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    {(newProduct.images?.length || 0) < 4 && (
                      <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center cursor-pointer">
                        <Camera className="w-6 h-6 text-slate-300" />
                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => setStep(1)} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold">Orqaga</button>
                    <button onClick={() => setStep(3)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold">Keyingisi</button>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">3-qadam: Turi va Razmer</p>
                  <div className="flex gap-2 p-1 bg-slate-100 rounded-2xl">
                    <button 
                      onClick={() => setNewProduct({...newProduct, type: ProductType.SALE})}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${newProduct.type === ProductType.SALE ? 'bg-white shadow' : 'text-slate-500'}`}
                    >
                      Sotuv
                    </button>
                    <button 
                      onClick={() => setNewProduct({...newProduct, type: ProductType.RENT})}
                      className={`flex-1 py-2.5 rounded-xl text-xs font-bold ${newProduct.type === ProductType.RENT ? 'bg-white shadow' : 'text-slate-500'}`}
                    >
                      Prokat
                    </button>
                  </div>
                  <input 
                    type="text" 
                    placeholder="Razmer (Masalan: S-M)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                    value={newProduct.size}
                    onChange={(e) => setNewProduct({...newProduct, size: e.target.value})}
                  />
                  <input 
                    type="number" 
                    placeholder="Soni (Zaxira)" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({...newProduct, stock: parseInt(e.target.value)})}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => setStep(2)} className="flex-1 bg-slate-100 py-3 rounded-2xl font-bold">Orqaga</button>
                    <button onClick={() => setStep(4)} className="flex-1 bg-slate-900 text-white py-3 rounded-2xl font-bold">Keyingisi</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest text-center">4-qadam: Narxi va Tasdiqlash</p>
                  <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100 mb-2">
                    <div className="flex gap-4">
                      {newProduct.images?.[0] && <img src={newProduct.images[0]} className="w-12 h-16 object-cover rounded-lg" />}
                      <div>
                        <h4 className="text-xs font-bold">ID: {newProduct.code}</h4>
                        <p className="text-[10px] text-slate-500 line-clamp-2">{newProduct.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">SO'M</span>
                    <input 
                      type="number" 
                      placeholder={newProduct.type === ProductType.SALE ? "Narxi" : "Soatlik narxi"} 
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3 px-4 text-sm focus:outline-none"
                      value={newProduct.price || ''}
                      onChange={(e) => setNewProduct({...newProduct, price: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="flex flex-col gap-2 pt-4">
                    <button onClick={handleAddProduct} className="w-full bg-pink-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-pink-600/20 flex items-center justify-center gap-2">
                      <Check className="w-5 h-5" /> Tasdiqlash va Qo'shish
                    </button>
                    <button onClick={() => { setStep(1); setIsAddingProduct(false); }} className="w-full py-2 text-xs font-bold text-slate-400">
                      Bekor qilish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
