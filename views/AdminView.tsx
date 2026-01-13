
import React, { useState, useEffect } from 'react';
import { Plus, Search, Trash2, Check, X, Camera, Lock, LogOut } from 'lucide-react';
import { db } from '../db';
import { Product, ProductType, Order } from '../types';

export const AdminView: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [activeTab, setActiveTab] = useState<'PRODUCTS' | 'ORDERS' | 'SETTINGS'>('PRODUCTS');
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [step, setStep] = useState(1);
  const [newProduct, setNewProduct] = useState<Partial<Product>>({
    code: '', images: [], description: '', type: ProductType.SALE, size: '', price: 0, stock: 1
  });

  useEffect(() => {
    if (isAuthenticated) {
      db.getProducts().then(setProducts);
      db.getOrders().then(setOrders);
    }
  }, [isAuthenticated, activeTab]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === db.getAdminPassword()) setIsAuthenticated(true);
    else alert("Xato parol!");
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewProduct(prev => ({...prev, images: [...(prev.images || []), reader.result as string].slice(0, 4)}));
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleSaveProduct = async () => {
    const product: Product = { ...newProduct as Product, id: Math.random().toString(36).substr(2, 9), discount: 0 };
    await db.saveProduct(product);
    setIsAddingProduct(false);
    setStep(1);
    setNewProduct({ code: '', images: [], description: '', type: ProductType.SALE, size: '', price: 0, stock: 1 });
    db.getProducts().then(setProducts);
  };

  if (!isAuthenticated) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-6">
      <div className="w-full max-w-sm bg-white rounded-3xl p-8">
        <Lock className="w-12 h-12 text-pink-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-center mb-6">Admin Panel</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <input type="password" placeholder="Parol" className="w-full border p-4 rounded-2xl text-center" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} />
          <button className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold">Kirish</button>
        </form>
      </div>
    </div>
  );

  return (
    <div className="p-4 bg-slate-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Boutique Admin</h1>
        <button onClick={() => setIsAuthenticated(false)} className="p-2"><LogOut className="w-5 h-5 text-slate-400" /></button>
      </div>

      <div className="flex gap-2 mb-6">
        <button onClick={() => setActiveTab('PRODUCTS')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'PRODUCTS' ? 'bg-slate-900 text-white' : 'bg-white'}`}>Kiyimlar</button>
        <button onClick={() => setActiveTab('ORDERS')} className={`px-4 py-2 rounded-xl text-xs font-bold ${activeTab === 'ORDERS' ? 'bg-slate-900 text-white' : 'bg-white'}`}>Buyurtmalar</button>
      </div>

      {activeTab === 'PRODUCTS' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input type="text" placeholder="ID qidiruv..." className="w-full border rounded-xl py-2 pl-10 pr-4 text-xs" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            <button onClick={() => setIsAddingProduct(true)} className="bg-pink-600 text-white p-2 rounded-xl"><Plus className="w-5 h-5" /></button>
          </div>

          <div className="grid gap-3">
            {products.filter(p => p.code.includes(searchQuery)).map(p => (
              <div key={p.id} className="bg-white p-3 rounded-2xl flex gap-4 items-center border">
                <img src={p.images[0]} className="w-16 h-20 object-cover rounded-xl" />
                <div className="flex-1">
                  <span className="text-[10px] font-bold text-slate-400">#{p.code}</span>
                  <h3 className="font-bold text-sm">{p.description}</h3>
                  <div className="text-[10px]">Soni: {p.stock} | Narxi: {p.price.toLocaleString()}</div>
                </div>
                <button onClick={() => { if(confirm('Ochirish?')) db.deleteProduct(p.id).then(() => db.getProducts().then(setProducts))}} className="text-red-400 p-2"><Trash2 className="w-4 h-4" /></button>
              </div>
            ))}
          </div>
        </div>
      )}

      {isAddingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
          <div className="bg-white w-full max-w-sm rounded-[40px] p-8">
            {step === 1 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center">Qadam 1: ID va Tavsif</h2>
                <input type="text" placeholder="ID (masalan: 001)" className="w-full border p-3 rounded-xl" value={newProduct.code} onChange={e => setNewProduct({...newProduct, code: e.target.value})} />
                <textarea placeholder="Tavsif" className="w-full border p-3 rounded-xl h-24" value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} />
                <button onClick={() => setStep(2)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Keyingisi</button>
              </div>
            )}
            {step === 2 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center">Qadam 2: Rasmlar</h2>
                <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="text-xs" />
                <div className="grid grid-cols-4 gap-2">
                  {newProduct.images?.map((img, i) => <img key={i} src={img} className="aspect-square object-cover rounded-lg" />)}
                </div>
                <button onClick={() => setStep(3)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold">Keyingisi</button>
              </div>
            )}
            {step === 3 && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-center">Qadam 3: Tafsilotlar</h2>
                <select className="w-full border p-3 rounded-xl" value={newProduct.type} onChange={e => setNewProduct({...newProduct, type: e.target.value as ProductType})}>
                  <option value={ProductType.SALE}>Sotiladigan</option>
                  <option value={ProductType.RENT}>Prokatga</option>
                </select>
                <input type="text" placeholder="Razmer (S-M)" className="w-full border p-3 rounded-xl" value={newProduct.size} onChange={e => setNewProduct({...newProduct, size: e.target.value})} />
                <input type="number" placeholder="Soni" className="w-full border p-3 rounded-xl" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: parseInt(e.target.value)})} />
                <input type="number" placeholder="Narxi" className="w-full border p-3 rounded-xl" value={newProduct.price || ''} onChange={e => setNewProduct({...newProduct, price: parseInt(e.target.value)})} />
                <div className="flex gap-2">
                  <button onClick={handleSaveProduct} className="flex-1 bg-pink-600 text-white py-3 rounded-xl font-bold">Tasdiqlash</button>
                  <button onClick={() => setIsAddingProduct(false)} className="px-4 border rounded-xl font-bold"><X className="w-5 h-5"/></button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
