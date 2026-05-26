import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useInventory } from '../context/InventoryContext';
import { 
  Shirt, 
  LayoutDashboard, 
  Sparkles, 
  FolderHeart, 
  BarChart3, 
  LogOut, 
  Menu, 
  X, 
  ChevronLeft, 
  ChevronRight, 
  User,
  Bell,
  Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification } = useInventory();
  
  const getFirstName = () => {
    const fullName = user?.metadata?.fullName;
    if (!fullName) return 'Propietario';
    const first = fullName.trim().split(/\s+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1);
  };
  const location = useLocation();
  const navigate = useNavigate();
  
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const notificationsDropdownRef = useRef(null);
  const notificationsTriggerRef = useRef(null);
  const dropdownRef = useRef(null);

  // Click outside to close notification dropdown safely (Stripe/Linear style)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationsDropdownRef.current &&
        !notificationsDropdownRef.current.contains(event.target) &&
        notificationsTriggerRef.current &&
        !notificationsTriggerRef.current.contains(event.target)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Click outside to close profile dropdown cleanly (ref-based click-outside pattern)
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setProfileDropdownOpen(false);
      }
    }

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  const handleNotificationClick = (notif) => {
    if (notif.product_id) {
      if (!notif.read) {
        markNotificationAsRead(notif.id);
      }
      setNotificationsOpen(false);
      navigate('/inventory', { state: { highlightProductId: notif.product_id } });
    }
  };

  const unreadNotifications = (notifications || []).filter(n => !n.read);
  const unreadCount = unreadNotifications.length;

  // Visible menu items translated to Spanish
  const menuItems = [
    { name: 'Panel de Control', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventario', path: '/inventory', icon: FolderHeart },
    { name: 'Análisis de Ventas', path: '/analytics', icon: BarChart3 },
    { name: 'Asistente AI', path: '/assistant', icon: Sparkles }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const getPageTitle = () => {
    const active = menuItems.find(item => item.path === location.pathname);
    return active ? active.name : 'ClosetPro AI';
  };

  return (
    <div 
      className="min-h-screen bg-slate-950 text-slate-100 flex overflow-hidden"
      style={{ '--sidebar-width': sidebarCollapsed ? '80px' : '260px' }}
    >
      {/* Background glow effects */}
      <div className="bg-glow-sphere w-[400px] h-[400px] bg-indigo-500/10 top-[10%] right-[10%] animate-pulse-slow"></div>
      <div className="bg-glow-sphere w-[400px] h-[400px] bg-purple-500/10 bottom-[20%] left-[20%] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>

      {/* --- DESKTOP SIDEBAR --- */}
      <motion.aside 
        animate={{ width: sidebarCollapsed ? 80 : 260 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="hidden md:flex flex-col justify-between border-r border-white/5 bg-slate-900/40 backdrop-blur-xl fixed top-0 left-0 h-screen z-30 shrink-0"
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-white/5 relative transition-all duration-300 ${
          sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4'
        }`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white shadow-md flex items-center justify-center shrink-0">
              <Shirt className="h-5 w-5 shrink-0" />
            </div>
            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.span 
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="font-display font-bold text-lg tracking-tight text-white whitespace-nowrap overflow-hidden block"
                >
                  ClosetPro <span className="text-indigo-400">AI</span>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={`p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white transition-all duration-200 ${
              sidebarCollapsed 
                ? 'absolute -right-3 top-5 z-40 bg-slate-900 border border-white/10 rounded-full shadow-lg shadow-black/50 hover:scale-110 flex items-center justify-center' 
                : 'relative'
            }`}
          >
            {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto no-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center rounded-xl text-sm font-medium transition-all duration-200 border ${
                  isActive 
                    ? 'bg-indigo-600/15 text-indigo-300 border-indigo-500/20 shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5 border-transparent'
                } ${
                  sidebarCollapsed 
                    ? 'justify-center p-2.5' 
                    : 'gap-3 px-3 py-2.5'
                }`}
              >
                <Icon className={`h-5 w-5 shrink-0 transition-colors duration-200 ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <AnimatePresence initial={false}>
                  {!sidebarCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="whitespace-nowrap overflow-hidden"
                    >
                      {item.name}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className={`p-3 border-t border-white/5 transition-all duration-300 ${
          sidebarCollapsed ? 'flex justify-center' : ''
        }`}>
          <button 
            onClick={handleLogout}
            className={`flex items-center rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent transition-all duration-200 ${
              sidebarCollapsed 
                ? 'justify-center p-2.5 w-full' 
                : 'gap-3 w-full px-3 py-2.5'
            }`}
          >
            <LogOut className="h-5 w-5 shrink-0 text-slate-400 transition-colors duration-200" />
            <AnimatePresence initial={false}>
              {!sidebarCollapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.2 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  Cerrar Sesión
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* --- MOBILE SIDEBAR DRAWER --- */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 bg-black z-40 md:hidden"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-72 bg-slate-900 border-r border-white/5 z-50 flex flex-col p-4 md:hidden"
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="bg-gradient-to-tr from-indigo-500 to-purple-500 p-2 rounded-xl text-white">
                    <Shirt className="h-5 w-5" />
                  </div>
                  <span className="font-display font-bold text-lg text-white">ClosetPro AI</span>
                </div>
                <button 
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-lg border border-white/5 hover:bg-white/5 text-slate-400 hover:text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex-1 py-6 space-y-1.5">
                {menuItems.map((item) => {
                  const isActive = location.pathname === item.path;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
                        isActive 
                          ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/20 shadow-inner' 
                          : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={handleLogout}
                  className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-sm font-medium text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="flex-1 flex flex-col min-h-screen relative z-10 md:ml-[var(--sidebar-width)] transition-[margin] duration-300 ease-in-out overflow-x-hidden">
        
        {/* Top Header */}
        <header className="h-16 border-b border-white/5 bg-slate-950/40 backdrop-blur-md flex items-center justify-between px-4 sm:px-6 z-20">
          <div className="flex items-center gap-3">
            {/* Mobile menu trigger */}
            <button 
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-2 rounded-lg border border-white/5 text-slate-400 hover:text-white hover:bg-white/5"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="font-display font-semibold text-lg text-white hidden sm:block">
              {getPageTitle()}
            </h1>
          </div>

          {/* Right Header Panel */}
          <div className="flex items-center gap-4">
            
            {/* Notification Bell */}
            <div className="relative">
              <button 
                ref={notificationsTriggerRef}
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl border border-white/5 text-slate-400 hover:text-white hover:bg-white/5 relative flex items-center justify-center transition-all duration-200"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 bg-rose-500 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-slate-950 animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              <AnimatePresence>
                {notificationsOpen && (
                  <>
                    <motion.div
                      ref={notificationsDropdownRef}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-80 bg-slate-900 border border-white/10 rounded-2xl p-4 shadow-xl z-40"
                    >
                      <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/5">
                        <h3 className="font-semibold text-sm text-white">Notificaciones</h3>
                        {unreadCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
                          >
                            Marcar todo leído
                          </button>
                        )}
                      </div>

                      <div className="max-h-[300px] overflow-y-auto space-y-2.5 no-scrollbar pr-0.5">
                        {notifications.length === 0 ? (
                          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                            <div className="w-10 h-10 rounded-full bg-slate-800/60 flex items-center justify-center text-slate-500 mb-2">
                              <Bell className="h-5 w-5 text-slate-500" />
                            </div>
                            <p className="text-xs text-slate-300 font-medium">Sin notificaciones</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">Tu stock está al día y bajo control.</p>
                          </div>
                        ) : (
                          <div className="space-y-2 relative overflow-hidden">
                            <AnimatePresence initial={false}>
                              {notifications.map((notif) => (
                                <motion.div 
                                  key={notif.id}
                                  layout="position"
                                  initial={{ 
                                    opacity: 0, 
                                    x: -10, 
                                    scale: 0.98
                                  }}
                                  animate={{ 
                                    opacity: 1, 
                                    x: 0, 
                                    scale: 1
                                  }}
                                  exit={{ 
                                    opacity: 0, 
                                    x: 10, 
                                    scale: 0.98,
                                    height: 0,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    paddingTop: 0,
                                    paddingBottom: 0,
                                    borderWidth: 0
                                  }}
                                  transition={{
                                    layout: {
                                      type: "tween",
                                      duration: 0.18,
                                      ease: "easeOut"
                                    },
                                    opacity: { duration: 0.16, ease: "easeOut" },
                                    x: { duration: 0.16, ease: "easeOut" },
                                    scale: { duration: 0.16, ease: "easeOut" },
                                    height: { duration: 0.16, ease: "easeOut" }
                                  }}
                                  onClick={() => handleNotificationClick(notif)}
                                  className={`p-2.5 rounded-xl border transition-all duration-200 cursor-pointer ${
                                    notif.read 
                                      ? 'bg-slate-950/40 border-white/5 text-slate-500/80 hover:bg-slate-900/60' 
                                      : 'bg-indigo-500/5 border-indigo-500/20 text-slate-200 hover:bg-indigo-500/10'
                                  } group relative flex flex-col gap-0.5 overflow-hidden [will-change:transform,opacity]`}
                                >
                                  <div className="flex items-start justify-between gap-2">
                                    <p className="font-medium text-xs text-white truncate max-w-[170px]">{notif.title}</p>
                                    <div className="flex items-center gap-1 shrink-0">
                                      {!notif.read && (
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            markNotificationAsRead(notif.id);
                                          }}
                                          className="text-[9px] text-indigo-400 hover:text-indigo-300 opacity-0 group-hover:opacity-100 transition-opacity font-medium px-1.5 py-0.5 rounded hover:bg-white/5"
                                          title="Marcar como leído"
                                        >
                                          Marcar leído
                                        </button>
                                      )}
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteNotification(notif.id);
                                        }}
                                        className="p-1 rounded-lg bg-slate-950 hover:bg-rose-500/15 border border-white/5 hover:border-rose-500/30 text-slate-500 hover:text-rose-400 transition-all duration-200 opacity-0 group-hover:opacity-100"
                                        title="Eliminar notificación"
                                      >
                                        <Trash2 className="h-3.5 w-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                  <p className="text-[10px] leading-relaxed text-slate-400">{notif.message}</p>
                                  <span className="text-[9px] text-slate-500 mt-1 block">
                                    {new Date(notif.created_at).toLocaleDateString('es-CO', {
                                      hour: '2-digit',
                                      minute: '2-digit'
                                    })}
                                  </span>
                                </motion.div>
                              ))}
                            </AnimatePresence>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* User Profile */}
            <div ref={dropdownRef} className="relative">
              <button 
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-xl border border-white/5 hover:bg-white/5 text-left focus:outline-none"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                  {user?.metadata?.fullName?.charAt(0) || <User className="h-4 w-4" />}
                </div>
                <div className="hidden lg:block">
                  <p className="text-xs font-semibold text-white leading-tight">
                    Hola {getFirstName()}
                  </p>
                  <p className="text-[10px] text-slate-400 leading-none">
                    {user?.email || 'demo@closetpro.ai'}
                  </p>
                </div>
              </button>

              {/* Profile Dropdown */}
              <AnimatePresence>
                {profileDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.96 }}
                    transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute right-0 mt-2.5 w-64 bg-slate-900/95 border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] z-50 backdrop-blur-xl overflow-hidden font-sans"
                  >
                    {/* HEADER */}
                    <div className="relative flex items-center gap-3 p-4 pb-3.5 border-b border-white/5">
                      {/* Avatar */}
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ring-2 ring-white/10 shadow-indigo-500/10">
                        {user?.metadata?.fullName?.charAt(0) || <User className="h-4.5 w-4.5" />}
                      </div>
                      {/* Name and Email */}
                      <div className="min-w-0 flex-1 pr-6">
                        <p className="text-sm font-semibold text-white truncate leading-snug tracking-tight">
                          {user?.metadata?.fullName || 'Propietario Demo'}
                        </p>
                        <p className="text-xs text-slate-400 truncate leading-none mt-0.5 font-normal">
                          {user?.email || 'demo@closetpro.ai'}
                        </p>
                      </div>
                      {/* Close Button X - TOP RIGHT */}
                      <button 
                        type="button"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="absolute top-3 right-3 p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer opacity-70 hover:opacity-100"
                        title="Cerrar menú"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    {/* BODY */}
                    <div className="p-4 border-b border-white/5 space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 block">
                        Conectado como
                      </span>
                      <span className="text-xs font-medium text-indigo-300 truncate block font-mono select-all bg-indigo-500/5 px-2.5 py-1.5 rounded-lg border border-indigo-500/10">
                        {user?.email || 'demo@closetpro.ai'}
                      </span>
                    </div>

                    {/* FOOTER */}
                    <div className="p-2 bg-slate-950/20">
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-white hover:bg-rose-500/10 border border-transparent transition-all duration-200 flex items-center justify-between group cursor-pointer"
                      >
                        <span>Cerrar Sesión</span>
                        <LogOut className="h-3.5 w-3.5 text-rose-400/80 group-hover:text-white transition-colors shrink-0" />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

          </div>
        </header>

        {/* Dashboard Pages Content viewport */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
