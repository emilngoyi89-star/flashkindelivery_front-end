import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, PlusSquare, Package, MapPin, 
  Wallet, User, Tag, Settings, LogOut, Bell, Sun, 
  Moon, Menu, X, Search, HelpCircle, Cpu
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [loadingText, setLoadingText] = useState('Chargement...');
  const [showDashboard, setShowDashboard] = useState(false);
  
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationMenuOpen, setIsNotificationMenuOpen] = useState(false);

  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setIsNotificationMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const texts = [
      'Chargement...',
      'Préparation de votre espace...',
      'Chargement de votre dashboard...'
    ];
    let i = 0;
    
    const interval = setInterval(() => {
      i++;
      if (i < texts.length) setLoadingText(texts[i]);
    }, 800);

    const timeout = setTimeout(() => {
      setIsLoading(false);
      setTimeout(() => setShowDashboard(true), 50); 
    }, 2400);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    toast.success('Déconnexion réussie');
    navigate('/login');
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Créer commande', icon: PlusSquare, path: '/dashboard/create' },
    { name: 'Historique', icon: Package, path: '/dashboard/history' },
    { name: 'Tarification', icon: Tag, path: '/dashboard/pricing' },
    { name: 'Suivi livraisons', icon: MapPin, path: '/dashboard/tracking' },
    { name: 'Solde & Balance', icon: Wallet, path: '/dashboard/balance' },
    { name: 'Profil', icon: User, path: '/dashboard/profile' },
  ];

  const notifications = [
    { id: 1, title: 'Nouvelle commande', desc: 'Commande #FLK-123 validée', time: 'Il y a 5 min', unread: true, icon: Package, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { id: 2, title: 'Paiement reçu', desc: 'Votre solde a été crédité de 25$', time: 'Il y a 1h', unread: true, icon: Wallet, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/30' },
    { id: 3, title: 'Mise à jour Flashkin', desc: 'Nouvelles capacités IA actives', time: 'Hier', unread: false, icon: Cpu, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/30' },
  ];

  const getInitials = () => {
    if (!user || (!user.firstName && !user.lastName)) return "PA";
    const first = user.firstName ? user.firstName.charAt(0).toUpperCase() : "";
    const last = user.lastName ? user.lastName.charAt(0).toUpperCase() : "";
    return `${first}${last}`;
  };

  // --- LOADER ---
  if (isLoading) {
    return (
      <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#fafafa] text-gray-900'} transition-colors duration-500`}>
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-black text-flashkin-blue dark:text-white tracking-tight flex items-center gap-2 mb-8 drop-shadow-sm">
            Flashkin <span className="text-flashkin-yellow text-xl bg-flashkin-blue/10 px-2 py-1 rounded-lg">PRO</span>
          </h1>
          <div className="flex gap-2.5 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-flashkin-blue dark:bg-flashkin-yellow animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-2.5 h-2.5 rounded-full bg-flashkin-blue dark:bg-flashkin-yellow animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-2.5 h-2.5 rounded-full bg-flashkin-blue dark:bg-flashkin-yellow animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <p className="text-sm font-medium text-gray-500 dark:text-slate-400 animate-pulse">
            {loadingText}
          </p>
        </div>
      </div>
    );
  }

  // --- RENDU DU DASHBOARD ---
  // Remplacement du noir pur par bg-slate-900 (Gris très foncé, plus doux et premium)
  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-[#f8fafc] text-gray-900'} transition-colors duration-300 font-sans`}>
      
      {/* SIDEBAR */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 ${darkMode ? 'bg-slate-800 border-slate-700/50' : 'bg-white border-gray-200'} border-r shadow-sm transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        
        {/* LOGO AREA */}
        <div className="h-20 flex flex-col justify-center px-6 border-b border-transparent">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-black text-flashkin-blue dark:text-white tracking-tight flex items-center gap-2">
              Flashkin <span className="text-flashkin-yellow text-[10px] font-bold bg-flashkin-blue/10 dark:bg-flashkin-yellow/10 dark:text-flashkin-yellow px-1.5 py-0.5 rounded uppercase tracking-wider">PRO</span>
            </h1>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-md">
              <X size={20} />
            </button>
          </div>
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 dark:text-slate-400 font-semibold mt-1">
            Delivery Management
          </p>
        </div>

        {/* NAVIGATION */}
        <div className="flex flex-col justify-between h-[calc(100vh-5rem)] p-4">
          <nav className="space-y-1.5 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.path === '/dashboard'}
                onClick={() => setIsSidebarOpen(false)}
                className={({ isActive }) => 
                  `group relative flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${
                    isActive 
                    ? 'bg-flashkin-blue text-white shadow-md shadow-flashkin-blue/20 dark:shadow-none' 
                    : 'text-gray-600 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700/50 hover:text-gray-900 dark:hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-flashkin-yellow rounded-r-md"></div>
                    )}
                    <item.icon size={18} className={`transition-transform duration-200 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                    {item.name}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* OVERLAY MOBILE */}
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-gray-900/50 dark:bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden transition-opacity" onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* CONTENU PRINCIPAL */}
      <div className={`flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-700 ease-out transform ${showDashboard ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        
        {/* HEADER TOPBAR */}
        <header className={`h-20 flex items-center justify-between px-6 lg:px-10 ${darkMode ? 'bg-slate-800/90 border-slate-700/50' : 'bg-white/80 border-gray-200'} border-b backdrop-blur-md sticky top-0 z-30 transition-colors duration-300`}>
          
          <div className="flex items-center gap-4 flex-1">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg transition-colors">
              <Menu size={20} />
            </button>
            
            <div className="hidden md:block">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">
                Bonjour, {user?.firstName || 'Partenaire'} 👋
              </h2>
              <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">Gérez vos expéditions et suivez vos performances.</p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            
            {/* SEARCH BAR AVEC BON CONTRASTE */}
            <div className={`hidden lg:flex items-center gap-2 px-4 py-2 rounded-full border transition-all duration-300 w-64 xl:w-80 shadow-inner dark:shadow-none 
              ${darkMode 
                ? 'bg-slate-900 border-slate-700 focus-within:border-flashkin-blue/50 text-white' 
                : 'bg-gray-100 border-transparent focus-within:border-flashkin-blue/30 focus-within:bg-white text-gray-900'
              }`}>
              <Search size={16} className={darkMode ? 'text-slate-400' : 'text-gray-400'} />
              <input 
                type="text" 
                placeholder="Rechercher..." 
                className="bg-transparent border-none outline-none w-full text-sm placeholder-gray-400 dark:placeholder-slate-500 text-inherit" 
              />
              <div className="hidden xl:flex items-center justify-center px-1.5 py-0.5 rounded text-[10px] font-medium border text-gray-400 border-gray-200 dark:text-slate-400 dark:border-slate-700">⌘K</div>
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>

            {/* DARK MODE TOGGLE */}
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:scale-105">
              {darkMode ? <Sun size={18} className="text-flashkin-yellow" /> : <Moon size={18} />}
            </button>
            
            {/* BOUTON PARAMÈTRES (Sorti du menu) */}
            <button onClick={() => navigate('/dashboard/settings')} className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:scale-105 hidden sm:block">
              <Settings size={18} />
            </button>
            
            {/* NOTIFICATIONS DROPDOWN */}
            <div className="relative" ref={notifRef}>
              <button 
                onClick={() => setIsNotificationMenuOpen(!isNotificationMenuOpen)} 
                className="p-2 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-700 rounded-full transition-all duration-200 hover:scale-105 relative"
              >
                <Bell size={18} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-800"></span>
              </button>

              <div className={`absolute right-0 mt-3 w-80 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border overflow-hidden transition-all duration-200 origin-top-right ${isNotificationMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-gray-100'} flex justify-between items-center`}>
                  <h3 className="text-sm font-bold">Notifications</h3>
                  <span className="text-[10px] bg-flashkin-blue text-white px-2 py-0.5 rounded-full">2 non lues</span>
                </div>
                <div className="max-h-72 overflow-y-auto custom-scrollbar">
                  {notifications.map((notif) => (
                    <div key={notif.id} className={`px-4 py-3 border-b last:border-0 ${darkMode ? 'border-slate-700 hover:bg-slate-700/50' : 'border-gray-50 hover:bg-gray-50'} transition-colors cursor-pointer flex gap-3 relative`}>
                      {notif.unread && <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-flashkin-blue rounded-full"></span>}
                      <div className={`w-8 h-8 rounded-full ${notif.bg} flex items-center justify-center shrink-0 ${notif.color}`}>
                        <notif.icon size={14} />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-slate-100">{notif.title}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{notif.desc}</p>
                        <p className="text-[10px] text-gray-400 mt-1">{notif.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* BOUTON DÉCONNEXION (Sorti du menu) */}
            <button onClick={handleLogout} title="Se déconnecter" className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-full transition-all duration-200 hover:scale-105 hidden sm:block">
              <LogOut size={18} />
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-slate-700 mx-1 hidden sm:block"></div>
            
            {/* AVATAR & USER MENU */}
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="h-9 w-9 rounded-full bg-gradient-to-tr from-flashkin-blue to-blue-500 flex items-center justify-center text-white text-sm font-bold cursor-pointer shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105 ring-2 ring-transparent focus:ring-flashkin-blue/50 overflow-hidden"
              >
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
                ) : (
                  getInitials()
                )}
              </button>

              <div className={`absolute right-0 mt-3 w-56 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'} rounded-2xl shadow-xl border overflow-hidden transition-all duration-200 origin-top-right ${isProfileMenuOpen ? 'scale-100 opacity-100 visible' : 'scale-95 opacity-0 invisible'}`}>
                
                <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700 bg-slate-900/50' : 'border-gray-100 bg-gray-50/50'}`}>
                  <p className="text-sm font-bold text-gray-900 dark:text-white truncate">{user?.firstName} {user?.lastName}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 truncate">{user?.email || 'partenaire@flashkin.com'}</p>
                </div>
                
                <div className="p-1.5">
                  <NavLink to="/dashboard/profile" onClick={() => setIsProfileMenuOpen(false)} className={`flex items-center gap-2 px-3 py-2 text-sm rounded-xl ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}>
                    <User size={16} /> Mon profil
                  </NavLink>
                  <button className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl ${darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-gray-700 hover:bg-gray-100'} transition-colors`}>
                    <HelpCircle size={16} /> Centre d'aide
                  </button>
                </div>
                
                {/* On garde un fallback pour mobile au cas où les icones de la topbar sont cachées en petit écran */}
                <div className={`p-1.5 border-t sm:hidden ${darkMode ? 'border-slate-700' : 'border-gray-100'}`}>
                  <button onClick={handleLogout} className={`w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium`}>
                    <LogOut size={16} /> Déconnexion
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ESPACE DYNAMIQUE */}
        <main className="flex-1 p-6 lg:p-10 overflow-x-hidden relative">
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-flashkin-blue/5 dark:bg-flashkin-blue/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="relative z-10">
            <Outlet />
          </div>
        </main>

      </div>
    </div>
  );
}