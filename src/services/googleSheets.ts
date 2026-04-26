/// <reference types="vite/client" />
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface Order {
  order_id: string;
  customer_name: string;
  phone: string;
  address: string;
  city: string;
  product_name: string;
  quantity: number;
  total: number;
  status: 'Pending' | 'Completed';
  date: string;
  notes?: string;
}

export interface SiteUser {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Customer';
  joined: string;
}

export interface SiteQuery {
  id: string;
  customer_name: string;
  phone: string;
  email?: string;
  message: string;
  status: 'Open' | 'Resolved';
  date: string;
}

const initialProducts: Product[] = [
  {
    id: "p1",
    name: "Premium Pigeon Cage",
    description: "Spacious and ventilated cage designed specifically for pigeons.",
    price: 15000,
    image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?q=80&w=600&auto=format&fit=crop",
    category: "Bird Cages",
    stock: 10
  },
  {
    id: "p2",
    name: "Elite Parrot Aviary",
    description: "A large, beautiful home for your parrots with multiple perches.",
    price: 35000,
    image: "https://images.unsplash.com/photo-1603525143324-42f7c00cb75d?q=80&w=600&auto=format&fit=crop",
    category: "Bird Cages",
    stock: 5
  },
  {
    id: "p3",
    name: "Luxury Cat Condo",
    description: "Multi-level cat cage with scratching posts and sleeping areas.",
    price: 12900,
    image: "https://images.unsplash.com/photo-1548802673-38020fb237a3?q=80&w=600&auto=format&fit=crop",
    category: "Cat Cages",
    stock: 12
  },
  {
    id: "p4",
    name: "Universal Pet Feeder",
    description: "Automatic feeder suitable for various small pets.",
    price: 2500,
    image: "https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?q=80&w=600&auto=format&fit=crop",
    category: "Accessories",
    stock: 50
  }
];

const API_URL = (import.meta.env.VITE_GOOGLE_SHEETS_URL || "").trim();

const normalizeKeys = (obj: any) => {
  const normalized: any = {};
  const looseMap: Record<string, any> = {};
  for (const key in obj) {
    const normalizedKey = key.trim().toLowerCase().replace(/\s+/g, '_');
    normalized[normalizedKey] = obj[key];
    const looseKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
    looseMap[looseKey] = obj[key];
  }
  
  if (!normalized.id) {
    normalized.id = looseMap.id || looseMap.sku || looseMap.productid || looseMap.itemid || looseMap.code || "";
  }
  normalized.id = String(normalized.id);

  if (!normalized.order_id) {
    normalized.order_id = looseMap.orderid || looseMap.orderno || looseMap.id || "";
  }
  normalized.order_id = String(normalized.order_id);

  if (!normalized.name) normalized.name = looseMap.name || looseMap.productname || looseMap.title || looseMap.product || looseMap.item || looseMap.label || "";
  if (!normalized.price) normalized.price = looseMap.price || looseMap.rate || looseMap.cost || looseMap.amount || 0;
  if (!normalized.description) normalized.description = looseMap.description || looseMap.desc || looseMap.details || "";
  if (!normalized.image) normalized.image = looseMap.image || looseMap.img || looseMap.url || looseMap.picture || "";
  if (!normalized.stock) normalized.stock = looseMap.stock || looseMap.inventory || looseMap.quantity || looseMap.qty || 0;
  
  return normalized;
};

const parseNumber = (val: any): number => {
  if (val == null) return 0;
  if (typeof val === 'number') return val;
  const parsed = parseFloat(String(val).replace(/[$,Rs.\s]/g, '').replace(/,/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};

// --- Fast SWR-like Fetch Implementation ---
const getLocal = (key: string) => {
  const existing = localStorage.getItem(`gs_cache_${key}`);
  if (existing) {
    try { return JSON.parse(existing).data; } catch (e) { }
  }
  return null;
};

const setLocal = (key: string, data: any) => {
  localStorage.setItem(`gs_cache_${key}`, JSON.stringify({ data, timestamp: Date.now() }));
};

const fetchFromAPI = async (sheetName: string, localData: any) => {
  if (!API_URL) return localData;
  try {
    const response = await fetch(`${API_URL}?sheet=${sheetName}`, { method: "GET", headers: { 'Accept': 'application/json' } });
    if (!response.ok) return localData;
    const rawData = await response.json();
    let items = Array.isArray(rawData) ? rawData : (rawData?.data || []);
    if (!Array.isArray(items)) return localData;

    const data = items.map(normalizeKeys);
    let transformedData = data;
    
    if (sheetName === 'Products') {
      transformedData = data.map((item: any) => ({ ...item, price: parseNumber(item.price), stock: parseNumber(item.stock) }));
    } else if (sheetName === 'Orders') {
      transformedData = data.map((item: any) => ({ ...item, total: parseNumber(item.total), quantity: parseNumber(item.quantity) || 1 }));
    }

    setLocal(sheetName, transformedData);
    return transformedData;
  } catch (err) {
    return localData; 
  }
};

let lastWriteTime = 0;

const getWithSWR = async (sheetName: string, fallback: any[]) => {
  const local = getLocal(sheetName);
  if (local && local.length > 0) {
    if (Date.now() - lastWriteTime > 5000) {
      fetchFromAPI(sheetName, local).catch(console.error); // Trigger background sync
    }
    return local; // Return instantly
  }
  const fetched = await fetchFromAPI(sheetName, fallback);
  return fetched?.length > 0 ? fetched : fallback;
};

const postToAPI = async (data: any) => {
  if (!API_URL) return false;
  lastWriteTime = Date.now();
  try {
    await fetch(API_URL, {

      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(data)
    });
    return true;
  } catch (error) {
    return false;
  }
};

export const googleSheetsMock = {
  getProducts: async (): Promise<Product[]> => getWithSWR('Products', initialProducts),

  saveProduct: async (product: Product): Promise<void> => {
    let products = getLocal('Products') || initialProducts;
    const existingIndex = products.findIndex((p: any) => p.id === product.id);
    if (existingIndex > -1) products[existingIndex] = product;
    else products.unshift(product);
    setLocal('Products', products);
    await postToAPI({ sheet: 'Products', ...product, action: 'update' });
  },

  deleteProduct: async (id: string): Promise<void> => {
    let products = getLocal('Products') || initialProducts;
    products = products.filter((p: any) => p.id !== id);
    setLocal('Products', products);
    await postToAPI({ sheet: 'Products', action: 'delete', id });
  },

  getOrders: async (): Promise<Order[]> => getWithSWR('Orders', []),

  saveOrder: async (order: Order): Promise<void> => {
    let orders = getLocal('Orders') || [];
    const existingIndex = orders.findIndex((o: any) => o.order_id === order.order_id);
    if (existingIndex > -1) orders[existingIndex] = order;
    else orders.unshift(order);
    setLocal('Orders', orders);
    await postToAPI({ sheet: 'Orders', ...order, action: 'update' });
  },
  
  deleteOrder: async (id: string): Promise<void> => {
    let orders = getLocal('Orders') || [];
    orders = orders.filter((o: any) => o.order_id !== id);
    setLocal('Orders', orders);
    await postToAPI({ sheet: 'Orders', action: 'delete', order_id: id });
  },

  getUsers: async (): Promise<SiteUser[]> => getWithSWR('Users', []),

  saveUser: async (user: SiteUser): Promise<void> => {
    let users = getLocal('Users') || [];
    const existingIndex = users.findIndex((u: any) => u.id === user.id);
    if (existingIndex > -1) users[existingIndex] = user;
    else users.unshift(user);
    setLocal('Users', users);
    await postToAPI({ sheet: 'Users', ...user, action: 'update' });
  },

  deleteUser: async (id: string): Promise<void> => {
    let users = getLocal('Users') || [];
    users = users.filter((u: any) => u.id !== id);
    setLocal('Users', users);
    await postToAPI({ sheet: 'Users', action: 'delete', id });
  },

  getQueries: async (): Promise<SiteQuery[]> => getWithSWR('Queries', []),

  saveQuery: async (query: Omit<SiteQuery, 'id' | 'status' | 'date'>): Promise<void> => {
    let queries = getLocal('Queries') || [];
    const newQuery = { ...query, id: `q${Date.now()}`, status: 'Open', date: new Date().toISOString() };
    queries.unshift(newQuery as SiteQuery);
    setLocal('Queries', queries);
    await postToAPI({ sheet: 'Queries', ...newQuery, action: 'append' });
  },

  deleteQuery: async (id: string): Promise<void> => {
    let queries = getLocal('Queries') || [];
    queries = queries.filter((q: any) => q.id !== id);
    setLocal('Queries', queries);
    await postToAPI({ sheet: 'Queries', action: 'delete', id });
  }
};

