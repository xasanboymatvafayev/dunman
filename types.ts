
export enum ProductType {
  SALE = 'SALE',
  RENT = 'RENT'
}

export interface Product {
  id: string;
  code: string;
  images: string[];
  description: string;
  type: ProductType;
  size: string; // e.g., "S-M", "L"
  price: number; // For sale: total price, For rent: hourly rate
  stock: number;
  discount: number; // percentage
}

export interface CartItem extends Product {
  quantity: number;
}

export interface UserInfo {
  name: string;
  phone: string;
  location: {
    lat: number;
    lng: number;
    address?: string;
  };
}

export interface Order {
  id: string;
  items: CartItem[];
  user: UserInfo;
  type: 'DELIVERY' | 'BOOKING';
  total: number;
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  createdAt: string;
}

export interface PromoCode {
  code: string;
  discount: number;
}
