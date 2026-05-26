import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { useInventory } from '../context/InventoryContext';
import { Plus, X, Search, Trash2, Edit3, SlidersHorizontal, AlertTriangle, ArrowUpDown, Tag, ShoppingBag, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCOP } from '../utils/format';
import GlassCard from '../components/GlassCard';
import { motion, AnimatePresence } from 'framer-motion';

export const InventoryPage = () => {
  const { products, loading, addProduct, updateProduct, deleteProduct } = useInventory();
  const location = useLocation();
  const [highlightedProductId, setHighlightedProductId] = useState(null);

  // Search and Filter states
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStockStatus, setSelectedStockStatus] = useState('All'); // All, Low, Normal

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Detect highlight product state from navigation (low stock clickable notification)
  useEffect(() => {
    if (location.state?.highlightProductId && products.length > 0) {
      const prodId = location.state.highlightProductId;
      setHighlightedProductId(prodId);

      // Reset search and filters to ensure the highlighted product is in the list
      setSearch('');
      setSelectedCategory('All');
      setSelectedStockStatus('All');

      // Calculate which page this product will be located on
      const index = products.findIndex(p => p.id === prodId);
      if (index !== -1) {
        const calculatedPage = Math.floor(index / itemsPerPage) + 1;
        setCurrentPage(calculatedPage);
      }

      // Scroll to product row smoothly once pagination and filters complete rendering
      setTimeout(() => {
        const element = document.getElementById(`product-row-${prodId}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 400);

      // Clear glow/highlight after 4 seconds
      const timer = setTimeout(() => {
        setHighlightedProductId(null);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [location.state, products, itemsPerPage]);

  // Modals state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [successToast, setSuccessToast] = useState('');

  // Form states for Create/Edit
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Camisetas');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [salesCount, setSalesCount] = useState('0');
  const [formError, setFormError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Realistic Clothing Store Categories
  const categories = [
    'Camisetas',
    'Camisas',
    'Pantalones',
    'Jeans',
    'Hoodies',
    'Chaquetas',
    'Zapatos',
    'Accesorios',
    'Oversize',
    'Deportiva'
  ];

  // Handle open create modal
  const handleOpenCreateModal = () => {
    setName('');
    setCategory('Camisetas');
    setPrice('');
    setStock('');
    setSalesCount('0');
    setFormError('');
    setCreateModalOpen(true);
  };

  // Handle open edit modal
  const handleOpenEditModal = (product) => {
    setEditingProduct(product);
    setName(product.name || '');
    setCategory(product.category || 'Camisetas');
    setPrice(product.price ? String(product.price) : '');
    setStock(product.stock ? String(product.stock) : '');
    setSalesCount(product.salesCount ? String(product.salesCount) : '0');
    setFormError('');
    setEditModalOpen(true);
  };

  // Handle Add Product Submit
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !price || !stock) {
      setFormError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (parseFloat(price) < 0 || parseInt(stock) < 0 || parseInt(salesCount) < 0) {
      setFormError('Los valores numéricos no pueden ser negativos.');
      return;
    }

    setActionLoading(true);
    try {
      await addProduct({
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        salesCount: parseInt(salesCount) || 0
      });
      setCreateModalOpen(false);
      setSuccessToast('¡Producto registrado con éxito!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error al guardar el producto.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Edit Product Submit
  const handleEditProduct = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name || !price || !stock) {
      setFormError('Por favor, completa todos los campos requeridos.');
      return;
    }

    if (parseFloat(price) < 0 || parseInt(stock) < 0 || parseInt(salesCount) < 0) {
      setFormError('Los valores numéricos no pueden ser negativos.');
      return;
    }

    setActionLoading(true);
    try {
      await updateProduct(editingProduct.id, {
        name,
        category,
        price: parseFloat(price),
        stock: parseInt(stock),
        salesCount: parseInt(salesCount) || 0
      });
      setEditModalOpen(false);
      setSuccessToast('¡Producto actualizado con éxito!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Error al actualizar el producto.');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Delete Confirmation Trigger
  const triggerDeleteConfirm = (product) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  // Perform actual Supabase Deletion
  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    
    setActionLoading(true);
    try {
      await deleteProduct(productToDelete.id);
      setDeleteConfirmOpen(false);
      setProductToDelete(null);
      setSuccessToast('¡Producto eliminado con éxito!');
      setTimeout(() => setSuccessToast(''), 3000);
    } catch (err) {
      console.error(err);
      alert('Error al eliminar el producto. Por favor inténtalo de nuevo.');
    } finally {
      setActionLoading(false);
    }
  };

  // Reset pagination on search or filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory, selectedStockStatus]);

  // Filter products logic
  const filteredProducts = products.filter(prod => {
    const matchesSearch = 
      (prod.name || '').toLowerCase().includes(search.toLowerCase()) || 
      (prod.category || '').toLowerCase().includes(search.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || prod.category === selectedCategory;
    
    let matchesStock = true;
    if (selectedStockStatus === 'Low') {
      matchesStock = prod.stock <= 5; // Alert limit is 5 units
    } else if (selectedStockStatus === 'Normal') {
      matchesStock = prod.stock > 5;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Pagination calculations
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage));
  
  // Ensure current page is valid (e.g. after a deletion or filter shrink)
  const activePage = Math.min(currentPage, totalPages);
  
  // Auto-correct page if current page exceeds total pages (e.g. after deletion)
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const indexOfLastItem = activePage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  // Sliding window pagination array generator
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 7;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (activePage <= 4) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (activePage >= totalPages - 3) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(activePage - 1);
        pages.push(activePage);
        pages.push(activePage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="space-y-8 relative">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-3xl text-white">Inventario de Productos</h2>
          <p className="text-slate-400 text-sm">Gestiona, añade y edita en tiempo real tu catálogo almacenado en Supabase.</p>
        </div>
        <button
          onClick={handleOpenCreateModal}
          className="glow-btn inline-flex items-center gap-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold px-4.5 py-3 rounded-xl text-sm transition-all duration-200 shadow-md shadow-indigo-600/10 cursor-pointer"
        >
          <Plus className="h-4.5 w-4.5" /> Registrar Producto
        </button>
      </div>

      {/* FILTER CONTROLS BAR */}
      <GlassCard className="p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-2.5 h-4.5 w-4.5 text-slate-500" />
          <input
            type="text"
            placeholder="Buscar por nombre o categoría..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm glass-input rounded-xl text-white"
          />
        </div>
        
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-wider shrink-0">
            <SlidersHorizontal className="h-4 w-4" /> Filtros
          </div>

          {/* Category Filter dropdown */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="glass-input text-xs sm:text-sm py-2 px-3.5 rounded-xl cursor-pointer text-white"
          >
            <option value="All" className="bg-slate-950">Todas las Categorías</option>
            {categories.map(cat => (
              <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
            ))}
          </select>

          {/* Stock Filter dropdown */}
          <select
            value={selectedStockStatus}
            onChange={(e) => setSelectedStockStatus(e.target.value)}
            className="glass-input text-xs sm:text-sm py-2 px-3.5 rounded-xl cursor-pointer text-white"
          >
            <option value="All" className="bg-slate-950">Todos los Estados</option>
            <option value="Low" className="bg-slate-950">Stock Crítico (≤ 5 u.)</option>
            <option value="Normal" className="bg-slate-950">Stock Saludable (&gt; 5 u.)</option>
          </select>
        </div>
      </GlassCard>

      {/* LOADING STATE */}
      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center glass-panel rounded-2xl border border-white/5">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500/20 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      ) : (
        <>
          {/* RESPONSIVE TABLE VIEW */}
          {filteredProducts.length > 0 ? (
            <>
              <div className="glass-panel rounded-2xl overflow-hidden border border-white/5 shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-slate-400 text-xs font-semibold uppercase tracking-wider">
                      <th className="py-4.5 px-6">Detalles del Producto</th>
                      <th className="py-4.5 px-6">Categoría</th>
                      <th className="py-4.5 px-6 text-right">Precio de Venta</th>
                      <th className="py-4.5 px-6 text-center">Stock</th>
                      <th className="py-4.5 px-6 text-center">Ventas</th>
                      <th className="py-4.5 px-6 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                    {currentProducts.map((item) => {
                      const isLowStock = item.stock <= 5;
                      const isHighlighted = item.id === highlightedProductId;
                      return (
                        <tr 
                          key={item.id}
                          id={`product-row-${item.id}`}
                          className={`transition-all duration-500 group ${
                            isHighlighted 
                              ? 'bg-rose-500/10 border-y-2 border-rose-500 shadow-[inset_0_0_15px_rgba(244,63,94,0.15)] animate-pulse' 
                              : 'hover:bg-white/[0.01]'
                          }`}
                        >
                          {/* Main info (Title + SKU) */}
                          <td className="py-4 px-6">
                            <div className="truncate max-w-xs sm:max-w-sm md:max-w-md">
                              <span className="font-semibold text-white block truncate">{item.name}</span>
                              <span className="text-[10px] text-slate-500 block uppercase mt-0.5 font-mono">ID: {item.id}</span>
                            </div>
                          </td>

                          {/* Category Badge */}
                          <td className="py-4 px-6">
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 shadow-sm">
                              <Tag className="h-3 w-3" /> {item.category}
                            </span>
                          </td>

                          {/* Retail Price */}
                          <td className="py-4 px-6 text-right font-semibold text-white font-mono">
                            {formatCOP(item.price)}
                          </td>

                          {/* Stock quantity and health */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {isLowStock ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold bg-rose-500/10 border border-rose-500/20 text-rose-400 animate-pulse">
                                  <AlertTriangle className="h-3.5 w-3.5" /> {item.stock} u.
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                                  {item.stock} u.
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Units Sold */}
                          <td className="py-4 px-6 text-center font-mono text-slate-400">
                            {item.salesCount || 0}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-4 px-6 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleOpenEditModal(item)}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/5 hover:border-indigo-500/40 text-slate-400 hover:text-indigo-400 backdrop-blur-md transition-all shadow-sm cursor-pointer hover:scale-105"
                                title="Editar Producto"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => triggerDeleteConfirm(item)}
                                className="p-2 rounded-xl bg-slate-950/80 border border-white/5 hover:border-rose-500/40 text-slate-400 hover:text-rose-400 backdrop-blur-md transition-all shadow-sm cursor-pointer hover:scale-105"
                                title="Eliminar Producto"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* PAGINATION CONTROL BAR */}
            {totalItems > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 px-2 py-4 border-t border-white/5">
                {/* Entries Info */}
                <div className="text-xs text-slate-400 font-medium">
                  Mostrando <span className="font-semibold text-white">{totalItems === 0 ? 0 : indexOfFirstItem + 1}</span> a{' '}
                  <span className="font-semibold text-white">
                    {Math.min(indexOfLastItem, totalItems)}
                  </span>{' '}
                  de <span className="font-semibold text-white">{totalItems}</span> productos
                </div>
                
                {/* Pagination controls */}
                <div className="flex items-center gap-2 max-w-full">
                  {/* Previous button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={activePage === 1}
                    className="px-2.5 py-2 sm:px-4 rounded-xl text-xs font-semibold border border-white/5 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-sm hover:border-purple-500/20"
                    title="Página Anterior"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Anterior</span>
                  </button>
                  
                  {/* Page numbers */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar max-w-[140px] min-[360px]:max-w-[200px] min-[440px]:max-w-[300px] sm:max-w-none px-0.5 py-1">
                    {getPageNumbers().map((pageNum, idx) => {
                      if (pageNum === '...') {
                        return (
                          <span
                            key={`ellipsis-${idx}`}
                            className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-slate-500 font-bold select-none text-sm"
                          >
                            ...
                          </span>
                        );
                      }
                      
                      const isActive = pageNum === activePage;
                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl text-xs font-semibold flex items-center justify-center shrink-0 transition-all duration-200 ease-out hover:scale-105 active:scale-95 cursor-pointer ${
                            isActive
                              ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/25 font-bold scale-105 border-0'
                              : 'border border-white/5 bg-slate-900/60 hover:bg-slate-800 hover:border-purple-500/20 text-slate-300 hover:text-white'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Next button */}
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={activePage === totalPages}
                    className="px-2.5 py-2 sm:px-4 rounded-xl text-xs font-semibold border border-white/5 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white transition-all duration-200 active:scale-95 disabled:opacity-30 disabled:hover:bg-slate-900/60 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-sm hover:border-purple-500/20"
                    title="Página Siguiente"
                  >
                    <span className="hidden sm:inline">Siguiente</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
            </>
          ) : (
            /* EMPTY STATE */
            <div className="text-center py-20 glass-panel rounded-2xl border border-white/5 flex flex-col items-center justify-center">
              <div className="inline-flex p-4.5 rounded-full bg-slate-900 border border-white/5 text-slate-500 mb-4.5 shadow-inner">
                <SlidersHorizontal className="h-8 w-8" />
              </div>
              <h3 className="text-white font-semibold text-lg">No se encontraron productos</h3>
              <p className="text-slate-400 text-sm mt-1 max-w-sm mx-auto">
                No hay prendas registradas en el catálogo de Supabase que cumplan los filtros actuales. Haz clic en "Registrar Producto" para añadir uno.
              </p>
            </div>
          )}
        </>
      )}

      {/* --- CREATE / REGISTER PRODUCT MODAL --- */}
      <AnimatePresence>
        {createModalOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setCreateModalOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Slide Drawer Box */}
            <motion.div
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 right-0 w-full max-w-lg bg-slate-950 border-l border-white/10 z-50 p-6 overflow-y-auto flex flex-col justify-between"
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-white/5">
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">Registrar Producto</h3>
                    <p className="text-slate-400 text-xs mt-0.5">Ingresa una nueva prenda directamente a la tabla 'productos' de Supabase</p>
                  </div>
                  <button 
                    onClick={() => setCreateModalOpen(false)}
                    className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleAddProduct} className="space-y-4">
                  {formError && (
                    <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                      {formError}
                    </div>
                  )}

                  {/* Name */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Nombre del Producto *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Sudadera Oversize Negra"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-sm text-white"
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Category dropdown */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Categoría *</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-sm text-white cursor-pointer"
                      disabled={actionLoading}
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat} className="bg-slate-950">{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Precio de Venta ($) *</label>
                    <input
                      type="number"
                      required
                      step="1"
                      placeholder="39000"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-sm text-white font-mono"
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Stock */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Stock Disponible *</label>
                    <input
                      type="number"
                      required
                      placeholder="15"
                      value={stock}
                      onChange={(e) => setStock(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-sm text-white font-mono"
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Initial Sales */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Unidades Vendidas Iniciales</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={salesCount}
                      onChange={(e) => setSalesCount(e.target.value)}
                      className="w-full glass-input p-3 rounded-xl text-sm text-white font-mono"
                      disabled={actionLoading}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-4 pt-6 border-t border-white/5">
                    <button
                      type="button"
                      onClick={() => setCreateModalOpen(false)}
                      className="w-1/2 py-3 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all text-slate-300 cursor-pointer"
                      disabled={actionLoading}
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="w-1/2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                      disabled={actionLoading}
                    >
                      {actionLoading ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Confirmar Registro'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* --- EDIT PRODUCT MODAL --- */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {editModalOpen && (
            <>
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                onClick={() => setEditModalOpen(false)}
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999]"
              />
              {/* Centered Modal Card Wrapper */}
              <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
                {/* Center Modal Box */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-[#0f172a] border border-white/10 rounded-[24px] shadow-2xl p-6 sm:p-8 w-full max-w-2xl text-slate-100 flex flex-col relative z-[10000] overflow-hidden"
                >
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-4 border-b border-white/5">
                      <div>
                        <h3 className="font-display font-bold text-xl text-white">Editar Producto</h3>
                        <p className="text-slate-400 text-xs mt-0.5">Modifica los detalles del producto en tu tabla de Supabase</p>
                      </div>
                      <button 
                        onClick={() => setEditModalOpen(false)}
                        className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>

                    <form onSubmit={handleEditProduct} className="space-y-4">
                      {formError && (
                        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs rounded-xl font-medium">
                          {formError}
                        </div>
                      )}

                      {/* Name */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Nombre del Producto *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej. Vestido Plisado Esmeralda"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-[#1e293b] text-white border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none p-3 rounded-xl text-sm transition-all"
                          disabled={actionLoading}
                        />
                      </div>

                      {/* Category dropdown */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Categoría *</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-[#1e293b] text-white border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none p-3 rounded-xl text-sm cursor-pointer transition-all"
                          disabled={actionLoading}
                        >
                          {categories.map(cat => (
                            <option key={cat} value={cat} className="bg-[#0f172a] text-white">{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Price */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Precio de Venta ($) *</label>
                        <input
                          type="number"
                          required
                          step="1"
                          placeholder="59000"
                          value={price}
                          onChange={(e) => setPrice(e.target.value)}
                          className="w-full bg-[#1e293b] text-white border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none p-3 rounded-xl text-sm font-mono transition-all"
                          disabled={actionLoading}
                        />
                      </div>

                      {/* Stock */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Stock Disponible *</label>
                        <input
                          type="number"
                          required
                          placeholder="20"
                          value={stock}
                          onChange={(e) => setStock(e.target.value)}
                          className="w-full bg-[#1e293b] text-white border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none p-3 rounded-xl text-sm font-mono transition-all"
                          disabled={actionLoading}
                        />
                      </div>

                      {/* Sales */}
                      <div>
                        <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-1.5">Unidades Vendidas</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={salesCount}
                          onChange={(e) => setSalesCount(e.target.value)}
                          className="w-full bg-[#1e293b] text-white border border-slate-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/30 focus:outline-none p-3 rounded-xl text-sm font-mono transition-all"
                          disabled={actionLoading}
                        />
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-4 pt-6 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setEditModalOpen(false)}
                          className="w-1/2 py-3 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all text-slate-300 cursor-pointer"
                          disabled={actionLoading}
                        >
                          Cancelar
                        </button>
                        <button
                          type="submit"
                          className="w-1/2 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all duration-200 shadow-md shadow-purple-600/10 hover:shadow-purple-500/20 active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            'Guardar Cambios'
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </div>
            </>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteConfirmOpen && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirmOpen(false)}
              className="fixed inset-0 bg-black/60 z-50 backdrop-blur-sm"
            />
            {/* Center Modal Box */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md glass-panel bg-slate-950 border border-white/10 rounded-2xl p-6 shadow-2xl space-y-6"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 shrink-0">
                    <AlertTriangle className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-display font-bold text-lg text-white">¿Eliminar Producto?</h3>
                    <p className="text-slate-400 text-sm">
                      ¿Estás seguro de que deseas eliminar permanentemente <strong className="text-white">"{productToDelete?.name}"</strong>?
                    </p>
                    <p className="text-slate-500 text-xs mt-1 leading-relaxed">
                      Esta acción no se puede deshacer y eliminará definitivamente el producto de tu inventario de Supabase.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setDeleteConfirmOpen(false)}
                    className="w-1/2 py-2.5 rounded-xl text-sm font-semibold border border-white/10 hover:bg-white/5 transition-all text-slate-300 cursor-pointer"
                    disabled={actionLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmDelete}
                    className="w-1/2 py-2.5 rounded-xl text-sm font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-all shadow-md shadow-rose-600/10 flex items-center justify-center gap-1.5 cursor-pointer"
                    disabled={actionLoading}
                  >
                    {actionLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      'Sí, eliminar'
                    )}
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* SUCCESS TOAST NOTIFICATION */}
      <AnimatePresence>
        {successToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 p-4 bg-emerald-500/90 text-white font-semibold rounded-2xl shadow-xl shadow-emerald-500/20 backdrop-blur-md flex items-center gap-2 border border-emerald-400/20"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">✓</div>
            <span>{successToast}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default InventoryPage;
