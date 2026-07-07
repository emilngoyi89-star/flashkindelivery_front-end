import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  MapPin, Package, Navigation, Loader2, ChevronRight, 
  User, Phone, Zap, TrendingUp, Target, Award, X, Star, AlertTriangle, CheckCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import PageLoader from '../../components/PageLoader';

export default function FlashmanHome() {
  const { user } = useAuth();
  const [availableOrders, setAvailableOrders] = useState([]);
  
  // 👇 MISE À JOUR : Ajout des états de notation et d'annulation
  const [stats, setStats] = useState({ 
    todayDeliveries: 0, 
    todayEarnings: 0, 
    totalDeliveries: 0,
    averageRating: 5.0,
    totalCancelled: 0 
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isAccepting, setIsAccepting] = useState(false);
  const [notification, setNotification] = useState({ isOpen: false, type: 'success', message: '' });

  useEffect(() => {
    if (!notification.isOpen) return;
    const timer = window.setTimeout(() => setNotification((prev) => ({ ...prev, isOpen: false })), 5000);
    return () => window.clearTimeout(timer);
  }, [notification.isOpen]);

  const showNotification = (message, type = 'success') => {
    setNotification({ isOpen: true, type, message });
  };

  // Charger les statistiques ET le radar en parallèle
  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      const [statsRes, radarRes] = await Promise.all([
        axios.get('https://flashkindelivery-back-end.onrender.com/api/drivers/stats', { headers: { Authorization: `Bearer ${token}` } }),
        axios.get('https://flashkindelivery-back-end.onrender.com/api/commands/available', { headers: { Authorization: `Bearer ${token}` } })
      ]);

      if (statsRes.data.success) setStats(statsRes.data.stats);
      if (radarRes.data.success) setAvailableOrders(radarRes.data.commands);
      
    } catch (error) {
      showNotification("Erreur de connexion au serveur.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleAcceptOrder = async (orderId) => {
    setIsAccepting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://flashkindelivery-back-end.onrender.com/api/commands/${orderId}/accept`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        showNotification("Course acceptée ! Retrouvez-la dans 'Mes Courses'.", 'success');
        setAvailableOrders(prev => prev.filter(order => order.id !== orderId));
        setSelectedOrder(null);
      }
    } catch (error) {
      showNotification(error.response?.data?.message || "Erreur lors de l'acceptation.", 'error');
    } finally {
      setIsAccepting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  // Sécurisation de la note moyenne au cas où elle ne serait pas encore chargée
  const ratingValue = stats.averageRating || 5.0;

  return (
    <div className="animate-fade-in w-full max-w-2xl mx-auto p-4 md:p-8 space-y-8 pb-24 font-sans text-gray-800 dark:text-gray-100">
      {notification.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/55 backdrop-blur-sm px-4 py-8 pointer-events-none">
          <div className={`pointer-events-auto w-full max-w-md rounded-[1.75rem] border p-6 shadow-2xl transition-all ${notification.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-950 dark:border-emerald-500/30 dark:bg-emerald-950/95 dark:text-emerald-100' : 'border-rose-200 bg-rose-50 text-rose-950 dark:border-rose-500/30 dark:bg-rose-950/95 dark:text-rose-100'}`}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {notification.type === 'success' ? <CheckCircle size={26} className="text-emerald-500 dark:text-emerald-300" /> : <AlertTriangle size={26} className="text-rose-500 dark:text-rose-300" />}
              </div>
              <div className="flex-1">
                <p className="font-black text-[11px] uppercase tracking-[0.3em]">{notification.type === 'success' ? 'Succès' : 'Erreur'}</p>
                <p className="mt-2 text-sm leading-6">{notification.message}</p>
              </div>
              <button onClick={() => setNotification((prev) => ({ ...prev, isOpen: false }))} className="rounded-full p-1.5 text-current opacity-70 transition-colors hover:bg-black/5 hover:opacity-100 dark:hover:bg-white/10">
                <X size={18} />
              </button>
            </div>
            <div className="mt-5 flex justify-end">
              <button onClick={() => setNotification((prev) => ({ ...prev, isOpen: false }))} className="rounded-xl bg-white/80 px-4 py-2 text-sm font-bold shadow-sm transition-all hover:bg-white dark:bg-slate-800/80 dark:hover:bg-slate-800">
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* =========================================
          SECTION 1 : DASHBOARD PERFORMANCES
          ========================================= */}
      <div className="space-y-4">
        <div className="flex justify-between items-end mb-2">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Bonjour, {user?.firstName} 👋</h1>
            <p className="text-sm text-gray-500">Prêt pour vos livraisons du jour ?</p>
          </div>
          <div className="bg-[#7eba3d]/10 p-2.5 rounded-full">
            <Zap size={24} className="text-[#7eba3d] fill-[#7eba3d]" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-flashkin-dark text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-10"><TrendingUp size={80} /></div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Gains du jour</p>
            <h3 className="text-3xl font-black text-flashkin-yellow">{stats.todayEarnings.toFixed(2)} $</h3>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm relative overflow-hidden">
            <div className="absolute -right-4 -top-4 opacity-[0.03] text-gray-900 dark:text-white"><Target size={80} /></div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Courses (Auj.)</p>
            <h3 className="text-3xl font-black text-gray-900 dark:text-white">{stats.todayDeliveries}</h3>
          </div>
        </div>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-xl text-blue-600"><Award size={20} /></div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">Badge d'Expérience</p>
              <p className="text-xs text-gray-500">{stats.totalDeliveries} livraisons au total depuis vos débuts.</p>
            </div>
          </div>
        </div>

        {/* =========================================
            SECTION NOUVELLE : RÉPUTATION DU LIVREUR
            ========================================= */}
        <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-5 rounded-3xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Votre Réputation Globale</p>
            <div className="flex items-center gap-2">
              <h3 className="text-3xl font-black text-gray-900 dark:text-white">{ratingValue.toFixed(1)}</h3>
              <div className="flex text-yellow-400">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} size={20} className={star <= Math.round(ratingValue) ? "fill-yellow-400" : "text-gray-200 fill-gray-200"} />
                ))}
              </div>
            </div>
            
            {/* Message d'encouragement ou d'alerte dynamique */}
            {ratingValue >= 4.5 ? (
              <p className="text-xs font-bold text-green-500 mt-1">Excellent ! Vous êtes prioritaire sur le radar.</p>
            ) : ratingValue >= 3.5 ? (
              <p className="text-xs font-bold text-amber-500 mt-1">Correct. Améliorez votre service pour être prioritaire.</p>
            ) : (
              <p className="text-xs font-bold text-red-500 mt-1 flex items-center gap-1"><AlertTriangle size={12} /> Risque de suspension du compte.</p>
            )}
          </div>

          <div className="bg-red-50 dark:bg-red-900/10 p-3 rounded-2xl border border-red-100 dark:border-red-900/30 w-full md:w-auto text-center md:text-left">
            <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-0.5">Courses Révoquées</p>
            <p className="text-xl font-black text-red-600">{stats.totalCancelled}</p>
          </div>
        </div>

      </div>

      {/* =========================================
          SECTION 2 : RADAR DE LA VILLE
          ========================================= */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            Radar en direct
          </h2>
          <span className="text-xs font-bold bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-gray-600 dark:text-gray-300">
            {availableOrders.length} attente(s)
          </span>
        </div>

        <div className="space-y-4">
          {availableOrders.length > 0 ? (
            availableOrders.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedOrder(order)}
                className="bg-white dark:bg-gray-800 rounded-3xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 cursor-pointer hover:shadow-md hover:border-flashkin-blue transition-all group"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-flashkin-blue/10 p-3 rounded-2xl text-flashkin-blue group-hover:bg-flashkin-blue group-hover:text-white transition-colors">
                      <Package size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm">{order.partner?.storeName || 'Boutique'}</h4>
                      <p className="text-xs text-gray-500 font-medium">Réf: {order.id.slice(-6).toUpperCase()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-green-500">+{order.price} $</p>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">Gain</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-2xl">
                  <MapPin size={16} className="text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {order.clientAddress}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-200 dark:border-gray-700">
              <div className="relative mx-auto w-16 h-16 mb-4 flex items-center justify-center">
                <div className="absolute inset-0 bg-flashkin-blue/10 rounded-full animate-ping"></div>
                <Navigation size={32} className="text-flashkin-blue relative z-10" />
              </div>
              <p className="text-gray-900 dark:text-white font-bold text-lg mb-1">Radar silencieux</p>
              <p className="text-gray-500 text-sm max-w-[200px] mx-auto">Aucune commande n'est actuellement en attente d'assignation.</p>
            </div>
          )}
        </div>
      </div>

      {/* =========================================
          MODAL "VOIR PLUS" (DÉTAILS COMMANDE)
          ========================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg md:rounded-3xl rounded-t-3xl rounded-b-none shadow-2xl flex flex-col max-h-[90vh]">
            
            <div className="w-full flex justify-center pt-3 pb-2 md:hidden bg-flashkin-dark rounded-t-3xl">
              <div className="w-12 h-1.5 bg-white/30 rounded-full"></div>
            </div>

            <div className="bg-flashkin-dark p-4 md:p-5 flex justify-between items-center text-white shrink-0">
              <h3 className="font-semibold text-base text-white flex items-center gap-2">
                <Navigation size={18} className="text-flashkin-yellow" /> Bordereau d'expédition
              </h3>
              <button onClick={() => !isAccepting && setSelectedOrder(null)} className="text-gray-400 hover:text-white bg-white/10 p-1.5 rounded-full transition-colors" disabled={isAccepting}>
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto pb-safe">
              <div className="flex justify-between items-center pb-5 border-b border-gray-100 dark:border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Expéditeur</p>
                  <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    <Package size={16} className="text-flashkin-blue dark:text-gray-400" /> 
                    {selectedOrder.partner?.storeName || selectedOrder.partner?.firstName}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Gain Livraison</p>
                  <p className="font-bold text-xl text-[#7eba3d]">+{selectedOrder.price} $</p>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Informations de livraison</p>
                <div className="bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-2xl p-4 space-y-4">
                  <div className="flex items-start gap-3">
                    <User size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedOrder.clientName}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white">{selectedOrder.clientPhone}</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <MapPin size={16} className="text-gray-400 mt-0.5 shrink-0" />
                    <p className="font-medium text-sm text-gray-900 dark:text-white leading-relaxed">{selectedOrder.clientAddress}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <div>
                  <p className="text-xs text-flashkin-blue dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">À encaisser (COD)</p>
                  <p className="font-bold text-xl text-flashkin-dark dark:text-white">{selectedOrder.amountToCollect} $</p>
                </div>
                <div className="text-right max-w-[140px]">
                  <p className="text-xs text-flashkin-blue dark:text-blue-400 font-semibold uppercase tracking-wider mb-1">Articles</p>
                  <p className="font-medium text-sm text-flashkin-dark dark:text-white truncate">{selectedOrder.details}</p>
                </div>
              </div>

              <button 
                onClick={() => handleAcceptOrder(selectedOrder.id)}
                disabled={isAccepting}
                className="motion-safe:animate-[wiggle_0.22s_ease-in-out_infinite] relative overflow-hidden w-full bg-gradient-to-r from-[#0b4b77] via-[#135c9d] to-[#1f77b8] text-white font-bold py-4 rounded-[1.5rem] hover:shadow-[0_20px_50px_rgba(14,165,233,0.35)] transition-all duration-300 transform hover:-translate-y-0.5 flex justify-center items-center gap-3 shadow-2xl disabled:opacity-80 shrink-0"
              >
                {isAccepting ? (
                  <><Loader2 className="animate-spin" size={20} /> Acceptation...</>
                ) : (
                  <>ACCEPTER LA COURSE <ChevronRight size={20} className="text-flashkin-yellow" /></>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}