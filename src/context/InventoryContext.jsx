import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const InventoryContext = createContext(null);

export const InventoryProvider = ({ children }) => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const initialCheckDone = useRef(false);

  // Styled email alert logger to simulate sending low stock alert mail to owner
  const sendLowStockEmailSim = (productName, currentStock, ownerEmail) => {
    console.log(
      `%c 📬 ALERTA DE STOCK BAJO ENVIADA POR CORREO %c\n` +
      `De: %c ClosetPro AI System <alerts@closetpro.ai> %c\n` +
      `Para: %c ${ownerEmail} (Propietario de la Tienda) %c\n` +
      `Asunto: %c Alerta de stock bajo - ClosetPro AI %c\n\n` +
      `Cuerpo del mensaje:\n` +
      `El producto "${productName}" tiene solo ${currentStock} unidades disponibles.\n` +
      `--------------------------------------------------`,
      'background: #f43f5e; color: white; font-weight: bold; padding: 4px 8px; border-radius: 4px;',
      '',
      'color: #6366f1; font-weight: bold;', '',
      'color: #a855f7; font-weight: bold;', '',
      'color: #f43f5e; font-weight: bold;', '',
      'color: #cbd5e1;'
    );
  };

  const createLowStockNotification = async (product, currentStock) => {
    if (!user) return;
    try {
      const title = `⚠️ Stock bajo - ${product.name}`;
      const message = `El producto "${product.name}" tiene solo ${currentStock} unidades disponibles.`;
      
      const dbPayload = {
        user_id: user.id,
        product_id: product.id,
        title,
        message,
        type: 'low_stock',
        read: false
      };

      const { data, error } = await supabase
        .from('notifications')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;

      // Update local state
      setNotifications(prev => [data, ...prev]);

      // Trigger simulated email alert
      sendLowStockEmailSim(product.name, currentStock, user.email);
    } catch (err) {
      console.error('[InventoryContext] Failed to create low stock notification:', err);
    }
  };

  const markNotificationAsRead = async (notificationId) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, read: true } : n
      ));
    } catch (err) {
      console.error('[InventoryContext] Failed to mark notification as read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!user) return;
    try {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 0) return;

      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', user.id)
        .eq('read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error('[InventoryContext] Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!user) return;
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update local state instantly
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('[InventoryContext] Failed to delete notification:', err);
      throw err;
    }
  };

  // Load products and sales log when authenticated user status changes
  useEffect(() => {
    if (!user) {
      setProducts([]);
      setSales([]);
      setNotifications([]);
      initialCheckDone.current = false;
      setLoading(false);
      return;
    }

    const fetchInventoryData = async () => {
      setLoading(true);
      try {
        // 1. Fetch real products from Supabase 'productos' table belonging ONLY to current user
        const { data: prodData, error: prodError } = await supabase
          .from('productos')
          .select('*')
          .eq('user_id', user.id)
          .order('nombre', { ascending: true });

        if (prodError) throw prodError;

        // Map database fields to the frontend structure, ensuring zero breakage
        const mappedProducts = (prodData || []).map(p => ({
          id: p.id,
          name: p.nombre,
          category: p.categoria || 'Camisetas',
          price: p.precio || 0,
          stock: p.stock || 0,
          salesCount: p.ventas || 0,
          created_at: p.created_at,
          
          // Fallback properties for dashboard and other charts
          cost: Math.round((p.precio || 0) * 0.4),
          minStock: 5,
          sku: `PROD-${String(p.id).slice(0, 4).toUpperCase()}`,
          brand: 'ClosetPro',
          tags: ['esencial'],
          color: 'Varios',
          season: 'Toda temporada'
        }));

        setProducts(mappedProducts);

        // 2. Load sales log directly from user-specific local storage
        const localSales = localStorage.getItem(`closetpro_inventory_sales_${user.id}`);
        setSales(localSales ? JSON.parse(localSales) : []);

        // 3. Fetch real notifications from Supabase
        const { data: notifData, error: notifError } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (notifError) throw notifError;
        setNotifications(notifData || []);

      } catch (err) {
        console.error('[InventoryContext] Failed to load inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventoryData();
  }, [user]);

  // Initial check on load for existing low stock items that have no notifications at all
  useEffect(() => {
    if (loading || !user || products.length === 0 || initialCheckDone.current) return;
    
    initialCheckDone.current = true;

    const performInitialLowStockCheck = async () => {
      for (const prod of products) {
        const minStockLimit = prod.minStock || 5;
        const isLow = (prod.stock <= 10 || prod.stock <= minStockLimit);
        
        if (isLow) {
          const exists = notifications.some(n => n.product_id === prod.id);
          if (!exists) {
            console.log('[Initial Low Stock Check] Creating alert for:', prod.name);
            await createLowStockNotification(prod, prod.stock);
          }
        }
      }
    };

    performInitialLowStockCheck();
  }, [loading, products, notifications, user]);

  const addProduct = async (productData) => {
    if (!user) throw new Error('Usuario no autenticado.');
    try {
      // Map frontend fields back to Supabase 'productos' schema, attaching user_id
      const dbPayload = {
        nombre: productData.name,
        categoria: productData.category,
        precio: parseFloat(productData.price) || 0,
        stock: parseInt(productData.stock) || 0,
        ventas: parseInt(productData.salesCount) || 0,
        user_id: user.id
      };

      const { data, error } = await supabase
        .from('productos')
        .insert([dbPayload])
        .select()
        .single();

      if (error) throw error;

      const newMappedProduct = {
        id: data.id,
        name: data.nombre,
        category: data.categoria,
        price: data.precio,
        stock: data.stock,
        salesCount: data.ventas,
        created_at: data.created_at,
        cost: Math.round(data.precio * 0.4),
        minStock: 5,
        sku: `PROD-${String(data.id).slice(0, 4).toUpperCase()}`,
        brand: 'ClosetPro',
        tags: ['esencial'],
        color: 'Varios',
        season: 'Toda temporada'
      };

      setProducts(prev => [...prev, newMappedProduct].sort((a, b) => a.name.localeCompare(b.name)));
      
      // Auto check low stock for new product
      const minStockLimit = newMappedProduct.minStock || 5;
      if (newMappedProduct.stock <= 10 || newMappedProduct.stock <= minStockLimit) {
        await createLowStockNotification(newMappedProduct, newMappedProduct.stock);
      }

      return newMappedProduct;
    } catch (err) {
      console.error('[InventoryContext] Failed to add product:', err);
      throw err;
    }
  };

  const updateProduct = async (productId, updates) => {
    if (!user) throw new Error('Usuario no autenticado.');
    try {
      // Map updates to Supabase 'productos' schema if present
      const dbPayload = {};
      if (updates.name !== undefined) dbPayload.nombre = updates.name;
      if (updates.category !== undefined) dbPayload.categoria = updates.category;
      if (updates.price !== undefined) dbPayload.precio = parseFloat(updates.price);
      if (updates.stock !== undefined) dbPayload.stock = parseInt(updates.stock);
      if (updates.salesCount !== undefined) dbPayload.ventas = parseInt(updates.salesCount);

      // Handle direct updates with DB column names too
      if (updates.nombre !== undefined) dbPayload.nombre = updates.nombre;
      if (updates.categoria !== undefined) dbPayload.categoria = updates.categoria;
      if (updates.precio !== undefined) dbPayload.precio = parseFloat(updates.precio);
      if (updates.stock !== undefined) dbPayload.stock = parseInt(updates.stock);
      if (updates.ventas !== undefined) dbPayload.ventas = parseInt(updates.ventas);

      const prevProduct = products.find(p => p.id === productId);

      // Official Supabase update syntax, scoped to the current user
      const { error } = await supabase
        .from('productos')
        .update(dbPayload)
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      // Update the local state using the sent updates to keep UI in sync automatically
      setProducts(prev => prev.map(prod => {
        if (prod.id === productId) {
          return {
            ...prod,
            name: dbPayload.nombre !== undefined ? dbPayload.nombre : prod.name,
            category: dbPayload.categoria !== undefined ? dbPayload.categoria : prod.category,
            price: dbPayload.precio !== undefined ? dbPayload.precio : prod.price,
            stock: dbPayload.stock !== undefined ? dbPayload.stock : prod.stock,
            salesCount: dbPayload.ventas !== undefined ? dbPayload.ventas : prod.salesCount
          };
        }
        return prod;
      }));

      // Lógica de Cruce de Umbral Inteligente para Stock Bajo
      if (prevProduct && dbPayload.stock !== undefined) {
        const newStock = dbPayload.stock;
        const prevStock = prevProduct.stock;
        const minStockLimit = prevProduct.minStock || 5;

        const isNewStockLow = (newStock <= 10 || newStock <= minStockLimit);
        const wasPrevStockNotLow = (prevStock > 10 && prevStock > minStockLimit);

        if (isNewStockLow && wasPrevStockNotLow) {
          console.log(`[Cruce de Umbral] Producto "${prevProduct.name}" cayó de ${prevStock} a ${newStock} unidades.`);
          await createLowStockNotification(prevProduct, newStock);
        }
      }

      return { id: productId, ...updates };
    } catch (err) {
      console.error('[InventoryContext] Failed to update product:', err);
      throw err;
    }
  };

  const deleteProduct = async (productId) => {
    if (!user) throw new Error('Usuario no autenticado.');
    try {
      const { error } = await supabase
        .from('productos')
        .delete()
        .eq('id', productId)
        .eq('user_id', user.id);

      if (error) throw error;

      setProducts(prev => prev.filter(prod => prod.id !== productId));
    } catch (err) {
      console.error('[InventoryContext] Failed to delete product:', err);
      throw err;
    }
  };

  const recordSale = async (soldItems, paymentMethod = 'Tarjeta') => {
    if (!user) throw new Error('Usuario no autenticado.');
    let totalSale = 0;
    const resolvedItems = soldItems.map(sItem => {
      const match = products.find(p => p.id === sItem.productId);
      if (!match) throw new Error('Product not found: ' + sItem.productId);
      
      totalSale += match.price * sItem.quantity;
      return {
        productId: sItem.productId,
        quantity: sItem.quantity,
        price: match.price
      };
    });

    const newSaleLog = {
      id: 'sale-' + Math.random().toString(36).substr(2, 9),
      date: new Date().toISOString().split('T')[0],
      items: resolvedItems,
      total: totalSale,
      paymentMethod
    };

    try {
      setSales(prev => [newSaleLog, ...prev]);

      for (const sItem of soldItems) {
        const product = products.find(p => p.id === sItem.productId);
        if (product) {
          const newStock = Math.max(0, product.stock - sItem.quantity);
          const newSalesCount = (product.salesCount || 0) + sItem.quantity;
          await updateProduct(sItem.productId, { 
            stock: newStock, 
            salesCount: newSalesCount 
          });
        }
      }

      const salesKey = `closetpro_inventory_sales_${user.id}`;
      const localSales = localStorage.getItem(salesKey);
      const salesArr = localSales ? JSON.parse(localSales) : [];
      localStorage.setItem(salesKey, JSON.stringify([newSaleLog, ...salesArr]));

      return newSaleLog;
    } catch (err) {
      console.error('[InventoryContext] Failed to record store sale transaction:', err);
      throw err;
    }
  };

  return (
    <InventoryContext.Provider value={{
      products,
      sales,
      notifications,
      loading,
      addProduct,
      updateProduct,
      deleteProduct,
      recordSale,
      markNotificationAsRead,
      markAllNotificationsAsRead,
      deleteNotification
    }}>
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = () => {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
