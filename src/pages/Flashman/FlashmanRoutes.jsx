import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Phone, MessageCircle, Navigation, CheckCircle, AlertOctagon, 
  Package, DollarSign, MapPin, User, Clock, Loader2, Check, X, FileText,
  ChevronRight // 👈 CORRECTION 1 : L'icône manquante qui faisait crasher l'historique !
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageLoader from '../../components/PageLoader';

export default function FlashmanRoutes() {
  const [activeTab, setActiveTab] = useState('CURRENT');
  const [commands, setCommands] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);

  // États pour les modales
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState(null);
  const [cancelModalOrder, setCancelModalOrder] = useState(null);
  const [cancelReason, setCancelReason] = useState('Client injoignable');
  const [customReason, setCustomReason] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const endpoint = activeTab === 'CURRENT' ? 'my-routes' : 'my-history';
      const response = await axios.get(`https://flashkindelivery-back-end.onrender.com/api/commands/${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        if (activeTab === 'CURRENT') {
          setCommands(response.data.commands);
        } else {
          setHistory(response.data.commands);
        }
      }
    } catch (error) {
      toast.error("Impossible de récupérer les données.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleCall = (phone) => window.location.href = `tel:${phone}`;
  
  const handleGPS = (address) => {
    const query = encodeURIComponent(address);
    window.open(`https://www.google.com/maps/search/?api=1&query=Kinshasa+${query}`, '_blank');
  };
  
  const handleWhatsApp = (phone, clientName, storeName) => {
    const message = encodeURIComponent(`Bonjour ${clientName}, c'est le livreur Flashkin. Je suis en route avec votre commande de ${storeName}.`);
    window.open(`https://wa.me/${phone.replace('+', '')}?text=${message}`, '_blank');
  };

  const markAsDelivered = async (orderId) => {
    setActionLoading(orderId);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://flashkindelivery-back-end.onrender.com/api/commands/${orderId}/deliver`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Livraison validée !");
        setCommands(prev => prev.filter(order => order.id !== orderId));
      }
    } catch (error) {
      toast.error("Erreur lors de la validation.");
    } finally {
      setActionLoading(null);
    }
  };

  const confirmCancellation = async () => {
    if (!cancelModalOrder) return;
    setActionLoading('CANCEL');
    
    const finalReason = cancelReason === 'Autre' ? customReason : cancelReason;

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`https://flashkindelivery-back-end.onrender.com/api/commands/${cancelModalOrder.id}/cancel`, 
        { reason: finalReason }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.success) {
        toast.success("Commande annulée.");
        setCommands(prev => prev.filter(order => order.id !== cancelModalOrder.id));
        setCancelModalOrder(null);
      }
    } catch (error) {
      toast.error("Erreur lors de l'annulation.");
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 font-sans text-gray-800 dark:text-gray-100">
      
      {/* NAVIGATION */}
      <div className="sticky top-0 z-30 pt-2 pb-4 bg-flashkin-light dark:bg-flashkin-dark backdrop-blur-md">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Mes Courses</h1>
        <div className="flex p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <button onClick={() => setActiveTab('CURRENT')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'CURRENT' ? 'bg-flashkin-blue text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
            En cours ({commands.length})
          </button>
          <button onClick={() => setActiveTab('HISTORY')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'HISTORY' ? 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white shadow-md' : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'}`}>
            Historique ({history.length})
          </button>
        </div>
      </div>

      {/* ONGLET : EN COURS */}
      {activeTab === 'CURRENT' && (
        <div className="space-y-6">
          {commands.length > 0 ? (
            commands.map(order => (
              <div key={order.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="bg-flashkin-blue p-4 flex justify-between items-center text-white">
                  <div className="flex items-center gap-2">
                    <Package size={16} className="text-flashkin-yellow" />
                    <span className="font-semibold text-sm">{order.partner?.storeName || 'Boutique'}</span>
                  </div>
                  <span className="text-xs bg-white/10 px-2.5 py-1 rounded-md font-mono">{order.id.slice(-6).toUpperCase()}</span>
                </div>

                <div className="p-5">
                  <div className="flex justify-between items-center mb-5 pb-5 border-b border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Encaisser au client</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{order.amountToCollect} $</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide mb-1">Tarif Course</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{order.price} $</p>
                    </div>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex gap-3 items-center">
                      <User size={16} className="text-gray-400 shrink-0" />
                      <p className="font-medium text-sm text-gray-900 dark:text-white">{order.clientName}</p>
                    </div>
                    <div className="flex gap-3 items-start">
                      <MapPin size={16} className="text-gray-400 shrink-0 mt-0.5" />
                      <p className="font-medium text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{order.clientAddress}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <button onClick={() => handleCall(order.clientPhone)} className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-200">
                      <Phone size={14} className="text-blue-500" /> Appeler
                    </button>
                    <button onClick={() => handleWhatsApp(order.clientPhone, order.clientName, order.partner?.storeName)} className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-200">
                      <MessageCircle size={14} className="text-green-500" /> WhatsApp
                    </button>
                    <button onClick={() => handleGPS(order.clientAddress)} className="flex items-center justify-center gap-2 py-3 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 transition-colors text-xs font-semibold text-gray-700 dark:text-gray-200">
                      <Navigation size={14} className="text-orange-500" /> Guidage
                    </button>
                  </div>

                  {/* 👇 CORRECTION 2 : DEUX GROS BOUTONS ÉGaux TEXTUELS POUR L'ACTION DE TERRAIN */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <button 
                      onClick={() => setCancelModalOrder(order)}
                      className="w-full bg-red-50 hover:bg-red-100 dark:bg-red-950/20 text-red-600 dark:text-red-400 font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 text-xs border border-red-100 dark:border-red-900/30"
                    >
                      <AlertOctagon size={16} /> ANNULER LA COURSE
                    </button>
                    <button 
                      onClick={() => markAsDelivered(order.id)} 
                      disabled={actionLoading === order.id}
                      className="w-full text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 shadow-md disabled:opacity-50 text-xs"
                      style={{ backgroundColor: '#7eba3d' }} // Vert de marque Flashkin
                    >
                      {actionLoading === order.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <>
                          <CheckCircle size={16} className="text-white" /> COLIS LIVRÉ
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Package size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm font-medium">Aucun colis en attente de livraison.</p>
            </div>
          )}
        </div>
      )}

      {/* ONGLET : HISTORIQUE */}
      {activeTab === 'HISTORY' && (
        <div className="space-y-4">
          {history.length > 0 ? (
            history.map(order => (
              <div 
                key={order.id} 
                onClick={() => setSelectedHistoryOrder(order)}
                className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${order.status === 'DELIVERED' ? 'bg-[#7eba3d]/10 text-[#7eba3d]' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                    {order.status === 'DELIVERED' ? <Check size={18} /> : <AlertOctagon size={18} />}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-gray-900 dark:text-white truncate max-w-[150px]">{order.clientName}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{order.partner?.storeName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-gray-900 dark:text-white">+{order.price} $</p>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider mt-0.5 flex items-center justify-end gap-1">
                    Détails <ChevronRight size={12} />
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-24 bg-white/50 dark:bg-gray-800/30 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
              <Clock size={40} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 text-sm font-medium">L'historique est vide.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL : DÉTAILS DE L'HISTORIQUE */}
      {selectedHistoryOrder && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-0 md:p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-lg md:rounded-3xl rounded-t-3xl rounded-b-none shadow-2xl flex flex-col max-h-[90vh]">
            <div className="w-full flex justify-center pt-3 pb-2 md:hidden bg-white dark:bg-gray-900 rounded-t-3xl">
              <div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            
            <div className="px-6 py-4 flex justify-between items-center border-b border-gray-100 dark:border-gray-800 shrink-0">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <FileText size={20} className="text-gray-400" /> Fiche de livraison
              </h3>
              <button onClick={() => setSelectedHistoryOrder(null)} className="text-gray-400 hover:text-gray-700 bg-gray-100 dark:bg-gray-800 p-2 rounded-full">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Statut Dynamique Premium */}
              <div className="flex justify-center mb-2">
                {selectedHistoryOrder.status === 'DELIVERED' ? (
                  <div className="flex items-center gap-2 bg-[#7eba3d]/10 px-4 py-2 rounded-full" style={{ color: '#7eba3d' }}>
                    <CheckCircle size={20} className="text-white fill-[#7eba3d]" />
                    <span className="font-bold text-sm">Livraison terminée</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-full text-red-600">
                    <AlertOctagon size={20} />
                    <span className="font-bold text-sm">Livraison annulée</span>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Détails de la course</p>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">ID Commande</span>
                  <span className="font-mono font-bold text-gray-900 dark:text-white">{selectedHistoryOrder.id.slice(-6).toUpperCase()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Client</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedHistoryOrder.clientName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Boutique</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{selectedHistoryOrder.partner?.storeName}</span>
                </div>
                <div className="pt-2 mt-2 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Contenu / Notes de statut</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium leading-relaxed mt-2">{selectedHistoryOrder.details}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL : ANNULATION DE COMMANDE */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl shadow-2xl p-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 flex items-center gap-2">
              <AlertOctagon className="text-red-500" /> Signaler un problème
            </h3>
            <p className="text-sm text-gray-500 mb-5">Pourquoi annulez-vous la livraison pour {cancelModalOrder.clientName} ?</p>
            
            <div className="space-y-3 mb-6">
              {['Client injoignable', 'Adresse introuvable', 'Refus du colis', 'Autre'].map(reason => (
                <label key={reason} className="flex items-center gap-3 p-3 border border-gray-100 dark:border-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                  <input 
                    type="radio" 
                    name="cancelReason" 
                    value={reason}
                    checked={cancelReason === reason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-4 h-4 text-red-500 focus:ring-red-500"
                  />
                  <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">{reason}</span>
                </label>
              ))}
              
              {cancelReason === 'Autre' && (
                <input 
                  type="text" 
                  placeholder="Précisez la raison..." 
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  className="w-full mt-2 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setCancelModalOrder(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                Retour
              </button>
              <button 
                onClick={confirmCancellation} 
                disabled={actionLoading === 'CANCEL'}
                className="flex-1 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors flex justify-center items-center"
              >
                {actionLoading === 'CANCEL' ? <Loader2 className="animate-spin" size={18} /> : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}