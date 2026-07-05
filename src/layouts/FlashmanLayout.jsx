import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { Radar, Map, Wallet, Settings, Bell, Moon, Sun, LogOut, Star, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export default function FlashmanLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationCount, setNotificationCount] = useState(3); 

  // --- LOGIQUE INITIALISATION DU THÈME ---
  useEffect(() => {
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.theme = 'light';
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.theme = 'dark';
      setIsDarkMode(true);
    }
  };

  // --- DÉCONNEXION AUTOMATISÉE AVEC TOAST DE PROGRESSION ---
  const handleLogout = () => {
    // Déclenchement du toast personnalisé avec barre de progression
    toast.custom((t) => (
      <div className={`${t.visible ? 'animate-fade-in' : 'animate-fade-out'} max-w-sm w-full bg-white dark:bg-gray-800 shadow-2xl rounded-2xl pointer-events-auto flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 transition-colors duration-300`}>
        <div className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center text-green-500">
            <CheckCircle size={24} />
          </div>
          <div className="flex-1">
            <p className="text-sm font-black text-gray-900 dark:text-white">Déconnexion réussie</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">À bientôt sur Flashkin !</p>
          </div>
        </div>
        {/* Barre de progression animée */}
        <div className="h-1 bg-flashkin-blue dark:bg-flashkin-yellow w-full origin-left animate-[flashkin-shrink_2s_linear_forwards]" />
      </div>
    ), { duration: 2000 });

    // On attend la fin de l'animation (2 secondes) avant de vider la session et de rediriger
    setTimeout(() => {
      if (logout) logout();
      localStorage.removeItem('token');
      navigate('/login');
    }, 2000);
  };

  const getInitials = (firstName, lastName) => {
    const first = firstName ? firstName.charAt(0) : '';
    const last = lastName ? lastName.charAt(0) : '';
    return (first + last).toUpperCase() || 'FL';
  };

  const navItems = [
    { name: 'Radar', path: '/flashman', icon: <Radar size={24} /> },
    { name: 'Mes Courses', path: '/flashman/routes', icon: <Map size={24} /> },
    { name: 'Portefeuille', path: '/flashman/wallet', icon: <Wallet size={24} /> },
    { name: 'Paramètres', path: '/flashman/settings', icon: <Settings size={24} /> },
  ];

  return (
    // Utilisation de bg-flashkin-light et dark:bg-flashkin-dark basés sur ton tailwind.config.js
    <div className="min-h-screen bg-flashkin-light dark:bg-flashkin-dark font-sans flex flex-col md:flex-row transition-colors duration-300">
      
      {/* 🛠️ STYLE INJECTÉ POUR L'ANIMATION DE LA BARRE DU TOAST */}
      <style>{`
        @keyframes flashkin-shrink {
          from { width: 100%; }
          to { width: 0%; }
        }
      `}</style>

      {/* 📱 TOP BAR MOBILE */}
      <header className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 sticky top-0 z-40 flex items-center justify-between shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-flashkin-dark dark:bg-flashkin-yellow text-flashkin-yellow dark:text-flashkin-dark flex items-center justify-center font-black text-sm transition-colors overflow-hidden">
            {user?.avatarUrl ? (
              <img src={user.avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
            ) : (
              getInitials(user?.firstName, user?.lastName)
            )}
          </div>
          <div>
            <h2 className="text-sm font-black text-gray-900 dark:text-white capitalize">
              {user?.firstName || 'Livreur'}
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">Flashkin Livreur</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button onClick={toggleTheme} className="text-gray-500 dark:text-gray-400 hover:text-flashkin-yellow transition-colors">
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          
          <button className="relative text-gray-500 dark:text-gray-400 hover:text-flashkin-blue transition-colors">
            <Bell size={24} />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                {notificationCount}
              </span>
            )}
          </button>

          <button onClick={handleLogout} className="text-red-500 hover:text-red-700 transition-colors ml-1">
            <LogOut size={22} />
          </button>
        </div>
      </header>

      {/* 📱 NAVIGATION MOBILE */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 z-50 pb-safe shadow-[0_-5px_15px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/flashman'}
              className={({ isActive }) =>
                `flex flex-col items-center p-2 rounded-xl transition-all ${
                  isActive 
                    ? 'text-flashkin-blue dark:text-flashkin-yellow font-black -translate-y-1' 
                    : 'text-gray-400 hover:text-gray-600 dark:text-gray-400'
                }`
              }
            >
              {item.icon}
              <span className="text-[10px] mt-1">{item.name}</span>
            </NavLink>
          ))}
        </div>
      </nav>

      {/* 💻 SIDEBAR DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen sticky top-0 transition-colors duration-300">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black text-flashkin-dark dark:text-white uppercase tracking-wider">
              Flash<span className="text-flashkin-yellow">man</span>
            </h1>
            <p className="text-xs text-gray-400 dark:text-gray-400 font-bold tracking-widest mt-1">LIVREUR</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggleTheme} className="p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-flashkin-yellow transition-colors">
              {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <button className="relative p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-gray-500 dark:text-gray-400 hover:text-flashkin-blue transition-colors">
              <Bell size={18} />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
        
        <div className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.path === '/flashman'}
              className={({ isActive }) =>
                `flex items-center gap-3 p-3 rounded-xl transition-all font-bold ${
                  isActive 
                    ? 'bg-flashkin-blue text-white dark:bg-flashkin-yellow/10 dark:text-flashkin-yellow shadow-md' 
                    : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700 dark:text-gray-400'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          ))}
        </div>

        {/* Profil & Déconnexion Desktop */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-3 rounded-2xl mb-3 transition-colors duration-300">
            <div className="w-12 h-12 rounded-xl bg-flashkin-blue dark:bg-flashkin-yellow text-white dark:text-flashkin-dark flex items-center justify-center font-black text-lg transition-colors overflow-hidden">
              {user?.avatarUrl ? (
                <img src={user.avatarUrl} alt="Photo de profil" className="h-full w-full object-cover" />
              ) : (
                getInitials(user?.firstName, user?.lastName)
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm text-gray-900 dark:text-white truncate capitalize">
                {user?.firstName} {user?.lastName}
              </p>
              <div className="flex items-center gap-1 text-xs font-bold text-yellow-600 dark:text-yellow-400 mt-0.5">
                <span>4.9</span>
                <Star size={10} className="fill-current" />
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-bold"
          >
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* 🚀 CONTENU PRINCIPAL */}
      <main className="flex-1 pb-20 md:pb-0 overflow-y-auto">
        <Outlet />
      </main>

    </div>
  );
}