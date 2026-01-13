
import { Product, Order, PromoCode, ProductType } from './types';

// DIQQAT: Railway'da backend'ni deploy qilganingizdan keyin ushbu URL'ni o'zgartiring
const API_URL = 'https://sizning-backend-manzilingiz.railway.app'; 

export const db = {
  getAdminPassword: () => localStorage.getItem('boutique_admin_password') || 'netlify1',
  saveAdminPassword: (pwd: string) => localStorage.setItem('boutique_admin_password', pwd),

  // Mahsulotlarni olish
  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch(`${API_URL}/products`);
      return await res.json();
    } catch (e) {
      // Server ulanmagan bo'lsa localStorage'dan vaqtinchalik foydalanish
      const data = localStorage.getItem('boutique_products');
      return data ? JSON.parse(data) : [];
    }
  },

  saveProduct: async (product: Product) => {
    try {
      await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
    } catch (e) {
      const products = JSON.parse(localStorage.getItem('boutique_products') || '[]');
      products.push(product);
      localStorage.setItem('boutique_products', JSON.stringify(products));
    }
  },

  deleteProduct: async (id: string) => {
    try {
      await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' });
    } catch (e) {
      const products = JSON.parse(localStorage.getItem('boutique_products') || '[]').filter((p: any) => p.id !== id);
      localStorage.setItem('boutique_products', JSON.stringify(products));
    }
  },

  saveOrder: async (order: Order) => {
    try {
      await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
    } catch (e) {
      const orders = JSON.parse(localStorage.getItem('boutique_orders') || '[]');
      orders.push(order);
      localStorage.setItem('boutique_orders', JSON.stringify(orders));
    }
  },

  getOrders: async (): Promise<Order[]> => {
    try {
      const res = await fetch(`${API_URL}/orders`);
      return await res.json();
    } catch (e) {
      const data = localStorage.getItem('boutique_orders');
      return data ? JSON.parse(data) : [];
    }
  },

  getPromos: (): PromoCode[] => {
    const data = localStorage.getItem('boutique_promos');
    return data ? JSON.parse(data) : [];
  },
  
  savePromo: (promo: PromoCode) => {
    const promos = db.getPromos();
    promos.push(promo);
    localStorage.setItem('boutique_promos', JSON.stringify(promos));
  }
};
