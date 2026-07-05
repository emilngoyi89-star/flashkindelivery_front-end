import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, Wallet, Package, 
  Map, BarChart3, Bell, Settings, LogOut, 
  Search, Menu, X, ShieldAlert, Sun, Moon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // NOUVEAUX STATES : Notifications et Déconnexion
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutProgress, setLogoutProgress] = useState(0);

  // --- RÉCUPÉRATION DU NOMBRE DE NOTIFICATIONS ---
  useEffect(() => {
    const fetchUnreadCount = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await axios.get('http://localhost:3000/api/admin/notifications', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setUnreadCount(res.data.unreadCount);
        }
      } catch (error) {
        console.error("Erreur de chargement des notifications", error);
      }
    };

    fetchUnreadCount();
    // Rafraîchissement automatique toutes les 2 minutes pour avoir la cloche à jour
    const intervalId = setInterval(fetchUnreadCount, 120000);
    return () => clearInterval(intervalId);
  }, []);

  // --- GESTION DU THEME DARK/LIGHT ---
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // --- DÉCONNEXION AVEC PROGRESS BAR ANIMÉE ---
  const handleLogout = () => {
    setIsLoggingOut(true);
    let progress = 0;
    
    // Animation de la barre de progression
    const timer = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(timer);
        setTimeout(() => {
          logout();
          navigate('/login');
        }, 300); // Petit délai pour voir les 100%
      }
      setLogoutProgress(progress);
    }, 100);
  };

  const menuItems = [
    { path: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard Global' },
    { path: '/admin/users', icon: Users, label: 'User Management' },
    { path: '/admin/finance', icon: Wallet, label: 'Finance & Transactions' },
    { path: '/admin/commands', icon: Package, label: 'Command Center' },
    { path: '/admin/catalog', icon: Map, label: 'Catalogue & Zones' },
    { path: '/admin/analytics', icon: BarChart3, label: 'Analytics & Reporting' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-900 flex font-sans">
      
      {/* --- OVERLAY DE DÉCONNEXION (PROGRESS BAR) --- */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fade-in transition-opacity">
          <div className="w-64 md:w-80 space-y-6 text-center">
            <LogOut size={48} className="mx-auto text-rose-500 animate-bounce-short" />
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white mb-1">Déconnexion sécurisée</h2>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Fermeture de la session en cours...</p>
            </div>
            
            {/* La Barre de progression */}
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden relative shadow-inner">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-400 to-rose-600 rounded-full transition-all duration-100 ease-out"
                style={{ width: `${logoutProgress}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* --- SIDEBAR --- */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#162d3e] text-white flex flex-col transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="h-20 flex items-center px-8 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-[#f4c414] p-2 rounded-xl">
              <ShieldAlert size={24} className="text-[#162d3e] fill-[#162d3e]" />
            </div>
            <div>
              <h1 className="font-black text-xl tracking-wide">FLASHKIN</h1>
              <p className="text-[10px] text-blue-200 uppercase tracking-widest font-bold">Control Tower</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1 custom-scrollbar">
          <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Menu Principal</p>
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium
                ${isActive 
                  ? 'bg-white/10 text-[#f4c414] shadow-inner' 
                  : 'text-slate-300 hover:bg-white/5 hover:text-white'}
              `}
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        <header className="h-20 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-8 shrink-0 z-30 sticky top-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu size={24} />
            </button>
            
            <div className="hidden md:flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl px-4 py-2.5 w-96 border border-transparent focus-within:border-[#f4c414] focus-within:bg-white dark:focus-within:bg-slate-900 transition-all shadow-sm">
              <Search size={18} className="text-slate-400" />
              <input 
                type="text" 
                placeholder="Rechercher un tracking, partenaire, ID..." 
                className="bg-transparent border-none outline-none w-full pl-3 text-sm font-medium text-slate-700 dark:text-slate-200 placeholder-slate-400"
              />
              <div className="flex items-center gap-1">
                <kbd className="hidden lg:inline-flex items-center justify-center px-2 py-1 text-[10px] font-bold text-slate-500 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded shadow-sm">⌘K</kbd>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {/* THÈME */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#f4c414] dark:hover:text-[#f4c414] transition-colors"
              title="Changer le thème"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* PARAMÈTRES (Déplacé ici) */}
            <button 
              onClick={() => navigate('/admin/settings')}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#162d3e] dark:hover:text-[#f4c414] transition-colors"
              title="Paramètres système"
            >
              <Settings size={20} />
            </button>

            {/* NOTIFICATIONS (Déplacé ici avec Cloche Dynamique) */}
            <button 
              onClick={() => navigate('/admin/notifications')}
              className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-[#162d3e] dark:hover:text-[#f4c414] transition-colors"
              title="Notifications"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-black text-white shadow-sm border-2 border-white dark:border-slate-800 animate-pulse">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 hidden sm:block mx-1"></div>

            {/* INFORMATIONS UTILISATEUR */}
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.firstName || 'Admin'}</p>
              <p className="text-xs text-slate-500 font-medium">Super Administrateur</p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#162d3e] to-[#24445c] flex items-center justify-center text-white font-black shadow-md border-2 border-white dark:border-slate-700">
              {user?.firstName?.charAt(0) || 'A'}
            </div>

            {/* DÉCONNEXION (Déplacé ici) */}
            <button 
              onClick={handleLogout}
              className="ml-2 p-2 rounded-xl bg-rose-50 dark:bg-rose-900/20 text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
              title="Se déconnecter"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet /> 
          </div>
        </div>

      </main>
    </div>
  );
}