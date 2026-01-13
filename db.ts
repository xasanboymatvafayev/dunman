
import { Product, Order, PromoCode, ProductType } from './types';

const STORAGE_KEYS = {
  PRODUCTS: 'boutique_products',
  ORDERS: 'boutique_orders',
  PROMOS: 'boutique_promos',
  STATS: 'boutique_stats',
  ADMIN_PWD: 'boutique_admin_password'
};

export const db = {
  getAdminPassword: (): string => {
    const pwd = localStorage.getItem(STORAGE_KEYS.ADMIN_PWD);
    return pwd || 'netlify1'; // Default password as requested
  },
  saveAdminPassword: (newPwd: string) => {
    localStorage.setItem(STORAGE_KEYS.ADMIN_PWD, newPwd);
  },
  getProducts: (): Product[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
    return data ? JSON.parse(data) : [];
  },
  saveProduct: (product: Product) => {
    const products = db.getProducts();
    const index = products.findIndex(p => p.id === product.id);
    if (index > -1) {
      products[index] = product;
    } else {
      products.push(product);
    }
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  deleteProduct: (id: string) => {
    const products = db.getProducts().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  findProductByCode: (code: string) => {
    return db.getProducts().find(p => p.code === code);
  },
  getOrders: (): Order[] => {
    const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
    return data ? JSON.parse(data) : [];
  },
  saveOrder: (order: Order) => {
    const orders = db.getOrders();
    orders.push(order);
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    
    // Update stock logic
    const products = db.getProducts();
    order.items.forEach(item => {
      const pIndex = products.findIndex(p => p.id === item.id);
      if (pIndex > -1) {
        products[pIndex].stock -= item.quantity;
      }
    });
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  },
  confirmOrder: (orderId: string) => {
    const orders = db.getOrders();
    const order = orders.find(o => o.id === orderId);
    if (order) {
      order.status = 'CONFIRMED';
      localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
    }
  },
  getPromos: (): PromoCode[] => {
    const data = localStorage.getItem(STORAGE_KEYS.PROMOS);
    return data ? JSON.parse(data) : [];
  },
  savePromo: (promo: PromoCode) => {
    const promos = db.getPromos();
    promos.push(promo);
    localStorage.setItem(STORAGE_KEYS.PROMOS, JSON.stringify(promos));
  }
};
