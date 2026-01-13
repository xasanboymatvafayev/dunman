
import { Product, Order, PromoCode, ProductType } from './types';

// Railway'dagi backend manzili (Hozircha o'zingizniki bilan almashtirmasangiz ham local saqlaydi)
const API_URL = 'https://tramway.proxy.rlwy.net:51584'; 

export const db = {
  getAdminPassword: () => localStorage.getItem('boutique_admin_password') || 'netlify1',
  saveAdminPassword: (pwd: string) => localStorage.setItem('boutique_admin_password', pwd),

  getProducts: async (): Promise<Product[]> => {
    try {
      const res = await fetch(`${API_URL}/products`);
      if (!res.ok) throw new Error();
      return await res.json();
    } catch (e) {
      const data = localStorage.getItem('boutique_products');
      return data ? JSON.parse(data) : [];
    }
  },

  saveProduct: async (product: Product) => {
    try {
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product)
      });
      if (!res.ok) throw new Error();
    } catch (e) {
      const products = JSON.parse(localStorage.getItem('boutique_products') || '[]');
      const index = products.findIndex((p: any) => p.id === product.id);
      if (index > -1) products[index] = product;
      else products.push(product);
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
      
      // Local stock update
      const products = JSON.parse(localStorage.getItem('boutique_products') || '[]');
      order.items.forEach(item => {
        const p = products.find((prod: any) => prod.id === item.id);
        if (p) p.stock = Math.max(0, p.stock - item.quantity);
      });
      localStorage.setItem('boutique_products', JSON.stringify(products));
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
