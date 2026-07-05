import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Search, Package, MapPin, 
  Phone, Calendar, CheckCircle, Clock, 
  Truck, XCircle, ArrowUpRight, Edit2, Trash2, X, Copy,
  UserX, Star // Nouveaux icônes pour Révocation et Notation
} from 'lucide-react';
import PageLoader from '../components/PageLoader';

export default function Historique() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  const [editingOrder, setEditingOrder] = useState(null);
  const [editForm, setEditForm] = useState({ clientName: '', clientPhone: '', clientAddress: '', details: '', amountToCollect: '' });

  // ⭐️ ÉTATS POUR L'ÉVALUATION (NOTATION)
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('token');
      // J'ai supposé que ta route renvoie command.flashman, on l'utilise pour afficher son nom
      const response = await axios.get('http://localhost:3000/api/commands', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.commands);
      }
    } catch (error) {
      toast.error("Erreur lors de la récupération de l'historique");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDelete = async (id, status) => {
    if (status === 'DELIVERED') {
      toast.error("Impossible de supprimer une commande déjà livrée.");
      return;
    }
    if (window.confirm("Voulez-vous vraiment supprimer cette commande ? Cette action est irréversible.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/commands/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Commande supprimée avec succès !");
        setOrders(orders.filter(order => order.id !== id));
      } catch (error) {
        toast.error("Erreur lors de la suppression.");
      }
    }
  };

  // --- 🔴 FONCTION : RÉVOQUER UN LIVREUR ---
  const handleRevoke = async (id) => {
    if (window.confirm("Voulez-vous vraiment retirer cette course à ce livreur ? Elle sera remise sur le radar public et le livreur sera pénalisé.")) {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.put(`http://localhost:3000/api/commands/${id}/revoke`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.success) {
          toast.success("Livreur révoqué ! La course est de retour sur le radar.");
          fetchOrders(); // Actualiser la liste
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la révocation.");
      }
    }
  };

  // --- ⭐️ FONCTION : SOUMETTRE L'ÉVALUATION ---
  const submitReview = async (e) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`http://localhost:3000/api/reviews/${reviewOrder.id}`, {
        rating,
        comment: reviewComment
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        toast.success("Merci ! Votre évaluation a été enregistrée.");
        setReviewOrder(null);
        setRating(5);
        setReviewComment('');
        fetchOrders(); // Mettre à jour l'état (pour cacher le bouton de notation)
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de l'évaluation.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleForceDelivery = async (id) => {
    if (window.confirm("Simuler la livraison ? Cela va transférer l'argent sur votre solde.")) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/commands/${id}/deliver`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success("Colis livré ! L'argent est sur votre compte.");
        fetchOrders(); 
      } catch (error) {
        toast.error(error.response?.data?.message || "Erreur lors de la livraison");
      }
    }
  };

  const openEditModal = (order) => {
    if (order.status === 'DELIVERED') {
      toast.error("Vous ne pouvez plus modifier une commande livrée.");
      return;
    }
    setEditingOrder(order);
    setEditForm({
      clientName: order.clientName,
      clientPhone: order.clientPhone,
      clientAddress: order.clientAddress,
      details: order.details || '',
      amountToCollect: order.amountToCollect
    });
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const payload = { ...editForm, amountToCollect: parseFloat(editForm.amountToCollect) };
      await axios.put(`http://localhost:3000/api/commands/${editingOrder.id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Commande mise à jour !");
      setEditingOrder(null);
      fetchOrders();
    } catch (error) {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const filteredOrders = orders.filter(order => {
    if (filterStatus !== 'ALL' && order.status !== filterStatus) return false;
    const searchLower = searchTerm.toLowerCase();
    return (
      (order.clientName && order.clientName.toLowerCase().includes(searchLower)) ||
      (order.clientPhone && order.clientPhone.includes(searchLower)) ||
      (order.clientAddress && order.clientAddress.toLowerCase().includes(searchLower))
    );
  });

  const totalDelivered = filteredOrders.filter(o => o.status === 'DELIVERED').length;
  const netGenerated = filteredOrders
    .filter(o => o.status === 'DELIVERED')
    .reduce((total, o) => total + ((o.amountToCollect || 0) - (o.price || 0)), 0);

  const formatDate = (dateString) => {
    const options = { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  const StatusBadge = ({ status }) => {
    const config = {
      RECEIVED: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "En attente", icon: Clock },
      ACCEPTED: { color: "bg-blue-100 text-blue-800 border-blue-200", label: "En route", icon: Truck },
      DELIVERED: { color: "bg-green-100 text-green-800 border-green-200", label: "Livré", icon: CheckCircle },
      CANCELLED: { color: "bg-red-100 text-red-800 border-red-200", label: "Annulé", icon: XCircle },
    };
    const { color, label, icon: Icon } = config[status] || config.RECEIVED;
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border whitespace-nowrap ${color}`}>
        <Icon size={14} /> {label}
      </span>
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-6 relative">
      
      {/* 1. EN-TÊTE & RÉSUMÉ */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">Historique des courses</h2>
          <p className="text-gray-500 font-medium mt-1">Suivez l'état de vos expéditions et vos revenus.</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="pr-4 border-r border-gray-100">
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Livrées</p>
            <p className="text-xl font-black text-gray-900">{totalDelivered}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Net Généré</p>
            <p className="text-xl font-black text-green-500 flex items-center gap-1"><ArrowUpRight size={20} /> {netGenerated.toFixed(2)}$</p>
          </div>
        </div>
      </div>

      {/* 2. RECHERCHE ET FILTRES */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex flex-col md:flex-row gap-4 justify-between items-center z-10 relative">
        <div className="relative w-full md:w-96">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Search className="h-5 w-5 text-gray-400" /></div>
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-flashkin-blue outline-none transition-all text-sm font-medium" />
        </div>
        <div className="flex gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {['ALL', 'RECEIVED', 'ACCEPTED', 'DELIVERED'].map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all ${filterStatus === status ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-50 text-gray-600 border border-gray-200'}`}>
              {status === 'ALL' ? 'Toutes' : status === 'RECEIVED' ? 'En attente' : status === 'ACCEPTED' ? 'En route' : 'Livrées'}
            </button>
          ))}
        </div>
      </div>

      {/* 3. LISTE DES COMMANDES (mobile cards + desktop table) */}
          <div className="space-y-4">
            {/* Mobile cards */}
            <div className="sm:hidden">
              {filteredOrders.length > 0 ? (
                <div className="space-y-3 px-2">
                  {filteredOrders.map((order) => (
                    <div key={order.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-700 rounded-2xl p-4 shadow-sm">
                      <div className="flex items-start justify-between">
                        <div>
                          <StatusBadge status={order.status} />
                          <p className="text-sm font-black text-gray-900 dark:text-slate-100 mt-2">{order.clientName}</p>
                          <p className="text-xs text-gray-500 dark:text-slate-400 truncate max-w-xs">{order.clientAddress}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-green-600">{(order.amountToCollect || 0) > 0 ? `${order.amountToCollect}$` : '-'}</p>
                          <div className="mt-3 flex items-center gap-2 justify-end">
                            {order.trackingCode && <button onClick={() => {navigator.clipboard.writeText(`http://localhost:5173/track/${order.trackingCode}`); toast.success("Lien de suivi copié !");}} className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100"><Copy size={16} /></button>}
                            <button onClick={() => openEditModal(order)} className="p-2 rounded-lg text-blue-600 bg-blue-50 hover:bg-blue-100"><Edit2 size={16} /></button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center text-gray-500">Aucune commande trouvée</div>
              )}
            </div>

            {/* Desktop table */}
            <div className="hidden sm:block bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                <th className="p-5 font-bold">Date & Statut</th>
                <th className="p-5 font-bold">Client & Destination</th>
                <th className="p-5 font-bold text-right">Détails Financiers</th>
                <th className="p-5 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => {
                  const amount = order.amountToCollect || 0;
                  const fee = order.price || 0;
                  const net = amount - fee;
                  const isLocked = order.status === 'DELIVERED' || order.status === 'CANCELLED';

                  return (
                    <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                      
                      <td className="p-5 align-top">
                        <div className="flex flex-col items-start gap-2">
                          <StatusBadge status={order.status} />
                          <span className="text-xs font-medium text-gray-500 flex items-center gap-1.5 mt-1"><Calendar size={12} /> {formatDate(order.createdAt)}</span>
                        </div>
                      </td>

                      <td className="p-5 align-top">
                        <p className="font-black text-gray-900 dark:text-slate-100 text-sm mb-1">{order.clientName}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-center gap-1.5 mb-1"><Phone size={12} /> {order.clientPhone}</p>
                        <p className="text-xs text-gray-500 dark:text-slate-400 flex items-start gap-1.5 mb-1 max-w-[250px]"><MapPin size={12} className="shrink-0 mt-0.5" /> {order.clientAddress}</p>
                        
                        {/* 🚀 AFFICHAGE DU NOM DU LIVREUR (Si assigné) */}
                        {(order.status === 'ACCEPTED' || order.status === 'DELIVERED') && order.flashman && (
                          <div className="mt-2 inline-flex items-center gap-1 bg-blue-50 text-flashkin-blue px-2 py-0.5 rounded text-[10px] font-bold">
                            <Truck size={10} /> Livré par: {order.flashman.firstName} {order.flashman.lastName}
                          </div>
                        )}
                      </td>

                      <td className="p-5 align-top text-right">
                        <div className="flex flex-col items-end gap-1">
                          <div className="flex items-center justify-between w-32 text-xs text-gray-500 font-medium"><span>À encaisser :</span><span>{amount > 0 ? `${amount}$` : '-'}</span></div>
                          <div className="flex items-center justify-between w-32 text-xs text-red-400 font-medium"><span>Livraison :</span><span>- {fee}$</span></div>
                          <div className="flex items-center justify-between w-32 text-sm font-black text-gray-900 pt-1 border-t mt-1"><span>Net :</span><span className="text-flashkin-blue">{net > 0 ? `+${net}$` : `${net}$`}</span></div>
                        </div>
                      </td>

                      <td className="p-5 align-middle text-center">
                        <div className="flex flex-wrap items-center justify-center gap-2">
                          
                          {/* LIEN DE SUIVI */}
                          {order.trackingCode && (
                            <button 
                              onClick={() => {
                                navigator.clipboard.writeText(`http://localhost:5173/track/${order.trackingCode}`);
                                toast.success("Lien de suivi copié !");
                              }}
                              className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                              title="Copier le lien pour le client"
                            >
                              <Copy size={16} />
                            </button>
                          )}
                    
                          {/* BOUTON MODIFIER */}
                          <button 
                            onClick={() => openEditModal(order)} disabled={isLocked}
                            className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed hidden' : 'text-blue-600 bg-blue-50 hover:bg-blue-100'}`} title="Modifier"
                          >
                            <Edit2 size={16} />
                          </button>

                          {/* 🔴 BOUTON RÉVOQUER (Visible uniquement si ACCEPTED) */}
                          {order.status === 'ACCEPTED' && (
                            <button 
                              onClick={() => handleRevoke(order.id)}
                              className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors" 
                              title="Révoquer le livreur pour inactivité"
                            >
                              <UserX size={16} />
                            </button>
                          )}

                          {/* ⭐️ BOUTON ÉVALUER (Visible si DELIVERED et pas encore évalué) */}
                          {order.status === 'DELIVERED' && !order.review && (
                            <button 
                              onClick={() => setReviewOrder(order)}
                              className="p-2 rounded-lg text-yellow-500 bg-yellow-50 hover:bg-yellow-100 transition-colors border border-yellow-200" 
                              title="Évaluer la prestation du livreur"
                            >
                              <Star size={16} className="fill-yellow-500" />
                            </button>
                          )}

                          {/* BOUTON SUPPRIMER */}
                          <button 
                            onClick={() => handleDelete(order.id, order.status)} disabled={isLocked}
                            className={`p-2 rounded-lg transition-colors ${isLocked ? 'text-gray-300 bg-gray-50 cursor-not-allowed hidden' : 'text-red-600 bg-red-50 hover:bg-red-100'}`} title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>

                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-12 text-center">
                    <Search size={32} className="mx-auto text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-2">Aucune commande trouvée</h3>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      </div>

      {/* =========================================
          MODAL DE MODIFICATION CLASSIQUE
          ========================================= */}
      {editingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden animate-scale-up border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
              <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Modifier la commande</h3>
              <button onClick={() => setEditingOrder(null)} className="text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleUpdateSubmit} className="p-6 space-y-4">
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 block">Nom du client</label>
                <input type="text" value={editForm.clientName} onChange={e => setEditForm({...editForm, clientName: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-flashkin-blue dark:focus:ring-offset-slate-800 text-slate-900 dark:text-white" required />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 block">Téléphone</label>
                <input type="text" value={editForm.clientPhone} onChange={e => setEditForm({...editForm, clientPhone: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-flashkin-blue text-slate-900 dark:text-white" required />
              </div>
              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 block">Adresse complète</label>
                <input type="text" value={editForm.clientAddress} onChange={e => setEditForm({...editForm, clientAddress: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-flashkin-blue text-slate-900 dark:text-white" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 block">Détails colis</label>
                  <input type="text" value={editForm.details} onChange={e => setEditForm({...editForm, details: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-flashkin-blue text-slate-900 dark:text-white" />
                </div>
                <div>
                  <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-1 block">À encaisser ($)</label>
                  <input type="number" value={editForm.amountToCollect} onChange={e => setEditForm({...editForm, amountToCollect: e.target.value})} className="w-full px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-green-500 text-slate-900 dark:text-white" required />
                </div>
              </div>
              <button type="submit" className="w-full mt-2 bg-flashkin-blue text-white font-bold py-3 rounded-xl hover:bg-opacity-90">Enregistrer les modifications</button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL ⭐️ : ÉVALUATION DU LIVREUR
          ========================================= */}
      {reviewOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-700">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-800">
              <div>
                <h3 className="text-xl font-black text-gray-900 dark:text-slate-100">Évaluer la prestation</h3>
                <p className="text-xs text-gray-500 dark:text-slate-400 mt-1">Livreur : {reviewOrder.flashman?.firstName || 'Inconnu'}</p>
              </div>
              <button onClick={() => setReviewOrder(null)} className="text-gray-400 hover:text-gray-600 dark:text-slate-300 dark:hover:text-white bg-gray-100 dark:bg-transparent p-2 rounded-full"><X size={18} /></button>
            </div>
            
            <form onSubmit={submitReview} className="p-6 space-y-6">
              
              <div className="flex flex-col items-center justify-center gap-2">
                <p className="text-sm font-bold text-gray-700 dark:text-slate-200">Note globale</p>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star} 
                      type="button"
                      onClick={() => setRating(star)}
                      className="focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star 
                        size={36} 
                        className={star <= rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"} 
                      />
                    </button>
                  ))}
                </div>
                <p className="text-xs font-bold text-flashkin-blue mt-2">
                  {rating === 1 ? 'Très mauvais' : rating === 2 ? 'Médiocre' : rating === 3 ? 'Correct' : rating === 4 ? 'Très bien' : 'Excellent !'}
                </p>
              </div>

              <div>
                <label className="text-sm font-bold text-gray-700 dark:text-slate-200 mb-2 block">Commentaire (Facultatif)</label>
                <textarea 
                  value={reviewComment} 
                  onChange={e => setReviewComment(e.target.value)} 
                  placeholder="Ex: Livreur très rapide et courtois..."
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-yellow-400 resize-none text-sm text-slate-900 dark:text-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmittingReview}
                className="w-full bg-flashkin-dark text-flashkin-yellow font-bold py-4 rounded-xl hover:bg-black transition-all shadow-md flex justify-center items-center gap-2"
              >
                {isSubmittingReview ? "ENVOI..." : "PUBLIER MON AVIS"}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}