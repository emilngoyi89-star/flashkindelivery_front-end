import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, MapPin, Package, Clock, 
  CheckCircle2, XCircle, Truck, 
  Phone, Eye, RefreshCw, X, Loader2, User
} from 'lucide-react';

export default function AdminCommands() {
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [commands, setCommands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCommand, setSelectedCommand] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  // NOUVEAU : State pour la modale de réassignation
  const [reassignModal, setReassignModal] = useState({ isOpen: false, flashmans: [], loading: false });

  const fetchCommands = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://flashkindelivery-back-end.onrender.com/api/admin/commands', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setCommands(res.data.commands);
      }
    } catch (error) {
      toast.error('Erreur lors de la synchronisation du radar.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCommands();
    const interval = setInterval(fetchCommands, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleForceCancel = async (id) => {
    if (!window.confirm("Action critique : Voulez-vous vraiment forcer l'annulation de cette course ?")) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://flashkindelivery-back-end.onrender.com/api/admin/commands/${id}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Course annulée avec succès.");
      setSelectedCommand(prev => ({ ...prev, status: 'CANCELLED' }));
      fetchCommands();
    } catch (error) {
      toast.error("Échec de l'annulation.");
    } finally {
      setActionLoading(false);
    }
  };

  // NOUVEAU : Ouvrir la modale et charger les Flashmans
  const openReassignModal = async () => {
    setReassignModal({ isOpen: true, flashmans: [], loading: true });
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://flashkindelivery-back-end.onrender.com/api/admin/flashmans/active', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReassignModal({ isOpen: true, flashmans: res.data.flashmans, loading: false });
      }
    } catch (error) {
      toast.error("Impossible de charger la liste des livreurs.");
      setReassignModal({ isOpen: false, flashmans: [], loading: false });
    }
  };

  // NOUVEAU : Confirmer la réassignation
  const confirmReassign = async (flashmanId) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`https://flashkindelivery-back-end.onrender.com/api/admin/commands/${selectedCommand.id}/reassign`, { flashmanId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Le colis a été réassigné avec succès !");
      setReassignModal({ isOpen: false, flashmans: [], loading: false });
      setSelectedCommand(null); // Ferme le drawer
      fetchCommands(); // Rafraîchit le radar
    } catch (error) {
      toast.error("Échec de la réassignation.");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredCommands = commands.filter(c => {
    const matchesTab = activeTab === 'ALL' || c.status === activeTab;
    const query = searchQuery.toLowerCase();
    const matchesSearch = c.tracking.toLowerCase().includes(query) || 
                          c.client.toLowerCase().includes(query) ||
                          c.partner.toLowerCase().includes(query);
    return matchesTab && matchesSearch;
  });

  const getStatusUI = (status) => {
    switch(status) {
      case 'RECEIVED': return { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-500/10', border: 'border-amber-200', label: 'En attente' };
      case 'IN_PROGRESS': return { icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-500/10', border: 'border-blue-200', label: 'En transit' };
      case 'DELIVERED': return { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-500/10', border: 'border-emerald-200', label: 'Livré' };
      case 'CANCELLED': return { icon: XCircle, color: 'text-rose-600', bg: 'bg-rose-50 dark:bg-rose-500/10', border: 'border-rose-200', label: 'Annulé' };
      default: return { icon: Package, color: 'text-slate-600', bg: 'bg-slate-50 dark:bg-slate-800', border: 'border-slate-200', label: status };
    }
  };

  return (
    <div className="animate-fade-in space-y-6 relative">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Command Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Radar logistique en temps réel</p>
        </div>

        <div className="w-full md:w-96 relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#f4c414]" />
          </div>
          <input 
            type="text" 
            placeholder="Rechercher code, client ou partenaire..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-sm rounded-xl pl-11 pr-4 py-3 focus:border-[#162d3e] dark:focus:border-[#f4c414] focus:outline-none transition-all shadow-sm group-hover:shadow-md"
          />
        </div>
      </div>

      {/* TABS */}
      <div className="flex overflow-x-auto custom-scrollbar gap-2 pb-2">
        {['ALL', 'RECEIVED', 'IN_PROGRESS', 'DELIVERED', 'CANCELLED'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-bold rounded-lg whitespace-nowrap transition-colors border ${
              activeTab === tab 
                ? 'bg-[#162d3e] text-[#f4c414] border-[#162d3e]' 
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
            }`}
          >
            {tab === 'ALL' ? 'Toutes les courses' : getStatusUI(tab).label}
          </button>
        ))}
      </div>

      {/* DATA GRID: mobile cards + desktop table */}
      <div className="space-y-4">
        {/* Mobile list (cards) */}
        <div className="sm:hidden">
          {loading ? (
            <div className="p-6 text-center">
              <Loader2 size={28} className="animate-spin mx-auto text-[#162d3e] dark:text-[#f4c414] mb-3" />
              <p className="text-slate-500">Balayage du radar en cours...</p>
            </div>
          ) : filteredCommands.length === 0 ? (
            <div className="p-6 text-center text-slate-500">Aucune commande trouvée.</div>
          ) : (
            <div className="space-y-3 px-2">
              {filteredCommands.map((cmd) => {
                const StatusIcon = getStatusUI(cmd.status).icon;
                return (
                  <div key={cmd.id} className="bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl p-4 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-black text-sm text-[#162d3e] dark:text-[#f4c414]">{cmd.tracking}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{cmd.partner}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-bold ${getStatusUI(cmd.status).bg} ${getStatusUI(cmd.status).color} ${getStatusUI(cmd.status).border}`}>
                          <StatusIcon size={12} />
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{cmd.client}</p>
                        <p className="text-xs text-slate-500 truncate max-w-xs">{cmd.address}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => setSelectedCommand(cmd)} className="px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold">Détails</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden sm:block bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tracking & Partenaire</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Destination</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Livreur assigné</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Statut</th>
                  <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center">
                      <Loader2 size={32} className="animate-spin mx-auto text-[#162d3e] dark:text-[#f4c414] mb-4" />
                      <p className="text-slate-500 font-medium">Balayage du radar en cours...</p>
                    </td>
                  </tr>
                ) : filteredCommands.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-slate-500">Aucune commande trouvée.</td>
                  </tr>
                ) : (
                  filteredCommands.map((cmd) => {
                    const StatusIcon = getStatusUI(cmd.status).icon;
                    return (
                      <tr key={cmd.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                        <td className="p-4">
                          <div>
                            <p className="text-sm font-black text-[#162d3e] dark:text-[#f4c414]">{cmd.tracking}</p>
                            <p className="text-xs text-slate-500 font-medium mt-0.5 truncate max-w-[150px]">{cmd.partner}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-start gap-2">
                            <MapPin size={14} className="text-slate-400 mt-0.5 shrink-0" />
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{cmd.client}</p>
                              <p className="text-xs text-slate-500 truncate max-w-[150px]">{cmd.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          {cmd.flashman ? (
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs shrink-0">
                                {cmd.flashman.charAt(0)}
                              </div>
                              <span className="text-sm font-bold dark:text-slate-200">{cmd.flashman}</span>
                            </div>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md">Non assigné</span>
                          )}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusUI(cmd.status).bg} ${getStatusUI(cmd.status).color} ${getStatusUI(cmd.status).border}`}>
                            <StatusIcon size={12} /> {getStatusUI(cmd.status).label}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => setSelectedCommand(cmd)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600 font-bold text-xs rounded-lg transition-colors"
                          >
                            <Eye size={14} /> Détails
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* DRAWER DE DÉTAILS */}
      {selectedCommand && !reassignModal.isOpen && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCommand(null)}></div>
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] relative z-10 shadow-2xl flex flex-col overflow-hidden rounded-[1.5rem] animate-fade-in border border-slate-200 dark:border-slate-800">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-white dark:bg-slate-900">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Détails de la course</p>
                <h2 className="text-xl font-black text-[#162d3e] dark:text-[#f4c414]">{selectedCommand.tracking}</h2>
              </div>
              <button onClick={() => setSelectedCommand(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 font-bold mb-1">Partenaire</p>
                  <p className="text-sm font-black dark:text-white truncate">{selectedCommand.partner}</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                  <p className="text-xs text-slate-500 font-bold mb-1">À Encaisser (COD)</p>
                  <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">{selectedCommand.cod} $</p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Destination</h3>
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-start gap-3">
                  <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg shrink-0"><MapPin size={18}/></div>
                  <div>
                    <p className="font-bold text-sm dark:text-white">{selectedCommand.client}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{selectedCommand.address}</p>
                    <p className="text-xs font-mono font-bold text-slate-600 dark:text-slate-300 mt-2 flex items-center gap-1"><Phone size={12}/> {selectedCommand.phone}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Timeline</h3>
                <div className="relative pl-4 space-y-6">
                  <div className="absolute left-[23px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-700"></div>

                  <div className="relative flex items-start gap-4">
                    <div className="h-4 w-4 rounded-full bg-emerald-500 border-4 border-white dark:border-slate-900 relative z-10 shrink-0 mt-1"></div>
                    <div>
                      <p className="text-sm font-bold dark:text-white">Commande créée</p>
                      <p className="text-xs text-slate-500">{selectedCommand.date}</p>
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className={`h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 relative z-10 shrink-0 mt-1 ${selectedCommand.flashman ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                    <div>
                      <p className={`text-sm font-bold ${selectedCommand.flashman ? 'dark:text-white' : 'text-slate-400'}`}>Assignée au Flashman</p>
                      {selectedCommand.flashman && <p className="text-xs text-slate-500">Pris en charge par {selectedCommand.flashman}</p>}
                    </div>
                  </div>

                  <div className="relative flex items-start gap-4">
                    <div className={`h-4 w-4 rounded-full border-4 border-white dark:border-slate-900 relative z-10 shrink-0 mt-1 
                      ${selectedCommand.status === 'DELIVERED' ? 'bg-emerald-500' : 
                        selectedCommand.status === 'CANCELLED' ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-600'}`}
                    ></div>
                    <div>
                      <p className={`text-sm font-bold 
                        ${selectedCommand.status === 'DELIVERED' ? 'text-emerald-600' : 
                          selectedCommand.status === 'CANCELLED' ? 'text-rose-600' : 'text-slate-400'}`}
                      >
                        {selectedCommand.status === 'DELIVERED' ? 'Livré au client' : 
                         selectedCommand.status === 'CANCELLED' ? 'Annulé' : 'Livraison en cours'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 space-y-2">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-2 mb-2">Actions d'urgence (God Mode)</p>
              
              {selectedCommand.status !== 'DELIVERED' && selectedCommand.status !== 'CANCELLED' && (
                <>
                  <button onClick={openReassignModal} disabled={actionLoading} className="w-full flex items-center justify-between px-4 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:border-blue-500 hover:text-blue-600 transition-colors disabled:opacity-50">
                    <span className="flex items-center gap-2"><RefreshCw size={16}/> Réassigner le colis</span>
                  </button>
                  <button onClick={() => handleForceCancel(selectedCommand.id)} disabled={actionLoading} className="w-full flex items-center justify-between px-4 py-3 bg-rose-50 dark:bg-rose-900/10 border border-rose-200 dark:border-rose-900/30 text-rose-600 font-bold rounded-xl hover:bg-rose-100 transition-colors disabled:opacity-50">
                    <span className="flex items-center gap-2">{actionLoading ? <Loader2 size={16} className="animate-spin" /> : <XCircle size={16}/>} Forcer l'annulation</span>
                  </button>
                </>
              )}
              {(selectedCommand.status === 'DELIVERED' || selectedCommand.status === 'CANCELLED') && (
                <div className={`px-4 py-3 border rounded-xl text-sm font-bold text-center flex items-center justify-center gap-2 ${selectedCommand.status === 'DELIVERED' ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-900/10 dark:text-emerald-400' : 'bg-slate-100 border-slate-200 text-slate-500 dark:bg-slate-800 dark:border-slate-700'}`}>
                  {selectedCommand.status === 'DELIVERED' ? <><CheckCircle2 size={18}/> Course clôturée</> : <><XCircle size={18}/> Course annulée</>}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* NOUVEAU : MODALE DE RÉASSIGNATION */}
      {/* ========================================================= */}
      {reassignModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !actionLoading && setReassignModal({ isOpen: false, flashmans: [], loading: false })}></div>
          
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full relative z-20 flex flex-col max-h-[80vh] overflow-hidden animate-slide-up border border-slate-200 dark:border-slate-700">
            
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-[#162d3e] text-white flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-[#f4c414]">Sélectionner un Flashman</h3>
                <p className="text-xs text-slate-300">Pour le colis {selectedCommand?.tracking}</p>
              </div>
              <button onClick={() => setReassignModal({ isOpen: false, flashmans: [], loading: false })} className="text-white/50 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-slate-50 dark:bg-slate-900/50 custom-scrollbar">
              {reassignModal.loading ? (
                <div className="flex flex-col items-center justify-center py-10">
                  <Loader2 size={32} className="animate-spin text-[#162d3e] dark:text-[#f4c414] mb-4" />
                  <p className="text-sm text-slate-500">Recherche des livreurs actifs...</p>
                </div>
              ) : reassignModal.flashmans.length === 0 ? (
                <div className="text-center py-10 text-slate-500">
                  <User size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-bold">Aucun livreur disponible</p>
                </div>
              ) : (
                reassignModal.flashmans.map(flashman => (
                  <button 
                    key={flashman.id}
                    onClick={() => confirmReassign(flashman.id)}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-between p-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-[#f4c414] dark:hover:border-[#f4c414] transition-all text-left disabled:opacity-50 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                        {flashman.firstName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#162d3e] dark:group-hover:text-[#f4c414] transition-colors">
                          {flashman.firstName} {flashman.lastName}
                        </p>
                        <p className="text-xs text-slate-500 font-mono">{flashman.phone || 'Pas de numéro'}</p>
                      </div>
                    </div>
                    {actionLoading ? <Loader2 size={16} className="animate-spin text-slate-400" /> : <RefreshCw size={16} className="text-slate-300 group-hover:text-[#f4c414] transition-colors" />}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}