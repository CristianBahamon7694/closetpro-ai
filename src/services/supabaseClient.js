// Mock Supabase Client simulating store user authentication and inventory database operations.
// This is structured to be easily replaceable with the official @supabase/supabase-js library.

const STORAGE_KEYS = {
  USER: 'closetpro_user',
  ITEMS: 'closetpro_inventory_products',
  HISTORY: 'closetpro_inventory_sales'
};

// Initial mock products for a clothing store
const DEFAULT_PRODUCTS = [
  {
    id: 'prod-1',
    name: 'Camisa Oxford Clásica',
    category: 'Tops',
    sku: 'CAM-OXF-001',
    price: 45000,
    cost: 15000,
    stock: 42,
    minStock: 15,
    salesCount: 128,
    tags: ['formal', 'esencial', 'algodon'],
    lastRestock: '2026-05-10'
  },
  {
    id: 'prod-2',
    name: 'Pantalón de Vestir de Lana',
    category: 'Bottoms',
    sku: 'PAN-LAN-002',
    price: 85000,
    cost: 30000,
    stock: 15,
    minStock: 10,
    salesCount: 64,
    tags: ['formal', 'invierno', 'oficina'],
    lastRestock: '2026-04-18'
  },
  {
    id: 'prod-3',
    name: 'Chaqueta Denim Vintage',
    category: 'Outerwear',
    sku: 'CHA-DEN-003',
    price: 75000,
    cost: 25000,
    stock: 8,
    minStock: 10, // Under stock threshold!
    salesCount: 95,
    tags: ['casual', 'retro', 'mezclilla'],
    lastRestock: '2026-03-05'
  },
  {
    id: 'prod-4',
    name: 'Botines Chelsea de Cuero',
    category: 'Footwear',
    sku: 'BOT-CUE-004',
    price: 130000,
    cost: 50000,
    stock: 4,
    minStock: 6, // Under stock threshold!
    salesCount: 32,
    tags: ['cuero', 'elegante', 'otoño'],
    lastRestock: '2026-04-02'
  },
  {
    id: 'prod-5',
    name: 'Gabardina Impermeable Beige',
    category: 'Outerwear',
    sku: 'GAB-BEI-005',
    price: 250000,
    cost: 95000,
    stock: 3,
    minStock: 5, // Under stock threshold!
    salesCount: 18,
    tags: ['abrigo', 'premium', 'otoño'],
    lastRestock: '2026-02-14'
  },
  {
    id: 'prod-6',
    name: 'Camiseta Básica de Algodón',
    category: 'Tops',
    sku: 'CAM-BAS-006',
    price: 18000,
    cost: 5000,
    stock: 120,
    minStock: 25,
    salesCount: 340,
    tags: ['casual', 'esencial', 'algodon'],
    lastRestock: '2026-05-15'
  },
  {
    id: 'prod-7',
    name: 'Sudadera con Capucha Negra',
    category: 'Tops',
    sku: 'SUD-NEG-007',
    price: 40000,
    cost: 12000,
    stock: 35,
    minStock: 15,
    salesCount: 150,
    tags: ['casual', 'deportivo', 'abrigo'],
    lastRestock: '2026-05-01'
  }
];

// Initial mock sales history
const DEFAULT_SALES = [
  { id: 'sale-1', date: '2026-05-22', items: [{ productId: 'prod-1', quantity: 2, price: 45000 }, { productId: 'prod-6', quantity: 3, price: 18000 }], total: 144000, paymentMethod: 'Tarjeta' },
  { id: 'sale-2', date: '2026-05-20', items: [{ productId: 'prod-2', quantity: 1, price: 85000 }, { productId: 'prod-4', quantity: 1, price: 130000 }], total: 215000, paymentMethod: 'Tarjeta' },
  { id: 'sale-3', date: '2026-05-18', items: [{ productId: 'prod-7', quantity: 2, price: 40000 }], total: 80000, paymentMethod: 'Efectivo' },
  { id: 'sale-4', date: '2026-05-15', items: [{ productId: 'prod-3', quantity: 1, price: 75000 }, { productId: 'prod-6', quantity: 5, price: 18000 }], total: 165000, paymentMethod: 'Transferencia' }
];

// Helper to initialize local storage
const initializeStorage = () => {
  const currentItems = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (currentItems) {
    try {
      const parsed = JSON.parse(currentItems);
      if (parsed.length > 0 && parsed[0].price < 1000) {
        // Clear old low-range mock values to force reinitialization with COP ranges
        localStorage.removeItem(STORAGE_KEYS.ITEMS);
        localStorage.removeItem(STORAGE_KEYS.HISTORY);
      }
    } catch (e) {}
  }

  if (!localStorage.getItem(STORAGE_KEYS.ITEMS)) {
    localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem(STORAGE_KEYS.HISTORY)) {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(DEFAULT_SALES));
  }
};

initializeStorage();

export const supabase = {
  // --- AUTH SIMULATION ---
  auth: {
    signUp: async ({ email, password, options }) => {
      await new Promise(resolve => setTimeout(resolve, 800)); // simulate network latency
      const existingUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (existingUser) {
        const parsed = JSON.parse(existingUser);
        if (parsed.email === email) {
          return { data: null, error: { message: 'El usuario ya existe.' } };
        }
      }
      const user = {
        id: 'usr-' + Math.random().toString(36).substr(2, 9),
        email,
        metadata: options?.data || { fullName: 'Propietario Demo' },
        createdAt: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      return { data: { user }, error: null };
    },

    signInWithPassword: async ({ email, password }) => {
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockUser = localStorage.getItem(STORAGE_KEYS.USER);
      
      // Demo credentials
      if (email === 'demo@closetpro.ai' && password === 'password') {
        const user = {
          id: 'usr-demo123',
          email: 'demo@closetpro.ai',
          metadata: { fullName: 'Propietario ClosetPro' },
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
        return { data: { user }, error: null };
      }

      if (mockUser) {
        const parsed = JSON.parse(mockUser);
        if (parsed.email === email) {
          return { data: { user: parsed }, error: null };
        }
      }
      return { data: null, error: { message: 'Credenciales de acceso incorrectas.' } };
    },

    signOut: async () => {
      await new Promise(resolve => setTimeout(resolve, 400));
      localStorage.removeItem(STORAGE_KEYS.USER);
      return { error: null };
    },

    getUser: async () => {
      const user = localStorage.getItem(STORAGE_KEYS.USER);
      return { data: { user: user ? JSON.parse(user) : null }, error: null };
    }
  },

  // --- DATABASE SIMULATION ---
  from: (table) => {
    return {
      select: () => {
        return {
          order: (column, { ascending = true } = {}) => {
            return {
              then: async (callback) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                let data = JSON.parse(localStorage.getItem(STORAGE_KEYS[table.toUpperCase()]) || '[]');
                
                if (column) {
                  data.sort((a, b) => {
                    const valA = a[column];
                    const valB = b[column];
                    if (valA < valB) return ascending ? -1 : 1;
                    if (valA > valB) return ascending ? 1 : -1;
                    return 0;
                  });
                }
                
                return callback({ data, error: null });
              }
            };
          },
          then: async (callback) => {
            await new Promise(resolve => setTimeout(resolve, 500));
            const data = JSON.parse(localStorage.getItem(STORAGE_KEYS[table.toUpperCase()]) || '[]');
            return callback({ data, error: null });
          }
        };
      },

      insert: (records) => {
        return {
          select: () => {
            return {
              single: () => {
                return {
                  then: async (callback) => {
                    await new Promise(resolve => setTimeout(resolve, 500));
                    const currentItems = JSON.parse(localStorage.getItem(STORAGE_KEYS[table.toUpperCase()]) || '[]');
                    const newRecords = Array.isArray(records) ? records : [records];
                    const processed = newRecords.map(r => ({
                      id: table === 'items' ? 'prod-' + Math.random().toString(36).substr(2, 9) : 'sale-' + Math.random().toString(36).substr(2, 9),
                      salesCount: 0,
                      ...r
                    }));
                    
                    localStorage.setItem(STORAGE_KEYS[table.toUpperCase()], JSON.stringify([...currentItems, ...processed]));
                    return callback({ data: processed[0], error: null });
                  }
                };
              }
            };
          }
        };
      },

      update: (updates) => {
        return {
          eq: (field, value) => {
            return {
              then: async (callback) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                const currentItems = JSON.parse(localStorage.getItem(STORAGE_KEYS[table.toUpperCase()]) || '[]');
                const updatedItems = currentItems.map(item => {
                  if (item[field] === value) {
                    return { ...item, ...updates };
                  }
                  return item;
                });
                localStorage.setItem(STORAGE_KEYS[table.toUpperCase()], JSON.stringify(updatedItems));
                const match = updatedItems.find(item => item[field] === value);
                return callback({ data: match, error: null });
              }
            };
          }
        };
      },

      delete: () => {
        return {
          eq: (field, value) => {
            return {
              then: async (callback) => {
                await new Promise(resolve => setTimeout(resolve, 500));
                const currentItems = JSON.parse(localStorage.getItem(STORAGE_KEYS[table.toUpperCase()]) || '[]');
                const filtered = currentItems.filter(item => item[field] !== value);
                localStorage.setItem(STORAGE_KEYS[table.toUpperCase()], JSON.stringify(filtered));
                return callback({ error: null });
              }
            };
          }
        };
      }
    };
  }
};
