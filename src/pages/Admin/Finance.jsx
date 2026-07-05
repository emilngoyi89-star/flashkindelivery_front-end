import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, 
  CheckCircle2, XCircle, AlertCircle, AlertTriangle, 
  Inbox, Loader2, Search, Filter, Eye, RefreshCw
} from 'lucide-react';

export default function AdminFinance() {
  const [activeTab, setActiveTab] = useState('PENDING'); 
  const [data, setData] = useState({ pendingWithdrawals: [], historyWithdrawals: [], recentTransactions: [] });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI States
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  // Modales (avec isProcessing pour l'animation de chargement)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, action: null, isProcessing: false });
  const [resultModal, setResultModal] = useState({ isOpen: false, type: 'info', message: '' });

  const fetchFinance = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/admin/finance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data);
      }
    } catch (error) {
      showResult('error', "Impossible de charger les données financières. Vérifiez votre connexion.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinance();
  }, []);

  const showResult = (type, message) => {
    setResultModal({ isOpen: true, type, message });
    setTimeout(() => setResultModal({ isOpen: false, type: 'info', message: '' }), 3000);
  };

  const triggerAction = (action) => {
    if (action === 'REJECT' && !rejectReason.trim()) {
      return showResult('error', "Veuillez indiquer un motif de refus comptable.");
    }
    setConfirmModal({ isOpen: true, action, isProcessing: false });
  };

  // L'UNIQUE fonction executeAction corrigée
  const executeAction = async () => {
    const action = confirmModal.action;
    
    // On bloque l'interface et on affiche les flèches qui tournent
    setConfirmModal(prev => ({ ...prev, isProcessing: true }));

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`http://localhost:3000/api/admin/finance/withdrawals/${selectedRequest.id}`, 
        { action, reason: rejectReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      showResult('success', res.data.message);
      fetchFinance(); 
    } catch (error) {
      showResult('error', error.response?.data?.message || 'Erreur critique lors du traitement financier.');
    } finally {
      // On ferme tout et on réinitialise
      setConfirmModal({ isOpen: false, action: null, isProcessing: false });
      setSelectedRequest(null);
      setRejectReason('');
    }
  };

  // ==========================================
  // MOTEUR DE RECHERCHE & FILTRAGE
  // ==========================================
  const getFilteredData = () => {
    let list = [];
    if (activeTab === 'PENDING') list = data.pendingWithdrawals;
    else if (activeTab === 'HISTORY') list = data.historyWithdrawals;
    else list = data.recentTransactions;

    if (!searchQuery) return list;

    const query = searchQuery.toLowerCase();
    return list.filter(item => {
      const userName = `${item.user?.firstName || ''} ${item.user?.lastName || ''}`.toLowerCase();
      const methodOrDesc = (item.method || item.description || '').toLowerCase();
      const amountStr = item.amount?.toString() || '';
      return userName.includes(query) || methodOrDesc.includes(query) || amountStr.includes(query);
    });
  };

  const displayData = getFilteredData();

  return (
    <div className="animate-fade-in space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Finance & Transactions</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Sas de validation et historique comptable</p>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex w-full xl:w-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button onClick={() => { setActiveTab('PENDING'); setSearchQuery(''); }} className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'PENDING' ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm relative' : 'text-slate-500'}`}>
            À Valider 
            {data.pendingWithdrawals.length > 0 && <span className="absolute top-2 right-4 h-2 w-2 bg-rose-500 rounded-full animate-pulse"></span>}
          </button>
          <button onClick={() => { setActiveTab('HISTORY'); setSearchQuery(''); }} className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'HISTORY' ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm' : 'text-slate-500'}`}>Historique</button>
          <button onClick={() => { setActiveTab('TRANSACTIONS'); setSearchQuery(''); }} className={`flex-1 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm' : 'text-slate-500'}`}>Transactions</button>
        </div>

        <div className="flex w-full xl:w-auto gap-2 px-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Rechercher par nom, montant, méthode..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full xl:w-72 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2.5 focus:border-[#162d3e] dark:focus:border-[#f4c414] outline-none dark:text-white transition-all"
          />
        </div>
      </div>

      {/* DATA GRID */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Utilisateur</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Détails / Méthode</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Montant</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              
              {loading && data.pendingWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <Loader2 size={32} className="animate-spin mb-4 text-[#162d3e] dark:text-[#f4c414]" />
                      <p className="text-sm font-medium">Synchronisation bancaire en cours...</p>
                    </div>
                  </td>
                </tr>
              ) : 
              
              displayData.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-16">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                      <div className="h-16 w-16 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-slate-100 dark:border-slate-700">
                        <Search size={28} className="text-slate-300 dark:text-slate-500" />
                      </div>
                      <p className="text-sm font-bold text-slate-500 dark:text-slate-400">Aucun résultat trouvé.</p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Essayez de modifier vos filtres de recherche.</p>
                    </div>
                  </td>
                </tr>
              ) : (

                displayData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    
                    <td className="p-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{item.user?.firstName} {item.user?.lastName}</p>
                        <p className="text-xs text-slate-500">{item.user?.role === 'PARTNER' ? 'Partenaire' : 'Flashman'}</p>
                      </div>
                    </td>

                    <td className="p-4">
                      {activeTab === 'TRANSACTIONS' ? (
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg shrink-0 ${item.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-rose-50 text-rose-600 dark:bg-rose-500/10'}`}>
                            {item.type === 'CREDIT' ? <ArrowDownRight size={14}/> : <ArrowUpRight size={14}/>}
                          </div>
                          <span className="text-sm font-medium dark:text-slate-300 truncate max-w-[200px]">{item.description}</span>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{item.method}</p>
                          <p className="text-xs font-mono text-slate-500">{item.phone}</p>
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <p className="text-sm font-black text-slate-900 dark:text-white">{item.amount.toFixed(2)} $</p>
                    </td>

                    <td className="p-4 text-center">
                      {activeTab === 'TRANSACTIONS' ? (
                        <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">Exécutée</span>
                      ) : (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border
                          ${item.status === 'PENDING' ? 'bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:border-amber-500/20' : 
                            item.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 
                            'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'}
                        `}>
                          {item.status === 'PENDING' && <Clock size={12} />}
                          {item.status === 'APPROVED' && <CheckCircle2 size={12} />}
                          {item.status === 'REJECTED' && <XCircle size={12} />}
                          {item.status}
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedRequest({ ...item, isReadOnly: activeTab !== 'PENDING' });
                          setRejectReason('');
                        }}
                        className={`flex items-center justify-center gap-2 ml-auto px-4 py-2 font-bold text-xs rounded-lg transition-colors ${
                          activeTab === 'PENDING' 
                            ? 'bg-[#162d3e] text-[#f4c414] hover:bg-[#1a3549]' 
                            : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600'
                        }`}
                      >
                        {activeTab === 'PENDING' ? 'Traiter' : <><Eye size={14} /> Voir</>}
                      </button>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 1. DRAWER D'EXAMEN / LECTURE SEULE (Côté Droit) */}
      {/* ========================================================= */}
      {selectedRequest && !confirmModal.isOpen && (
        <div className="fixed inset-0 z-[90] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={() => setSelectedRequest(null)}></div>
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-md h-full relative z-10 shadow-2xl flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-800">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900">
              <h2 className="text-lg font-black flex items-center gap-2 text-slate-900 dark:text-white">
                <Wallet size={20} className="text-[#162d3e] dark:text-[#f4c414]"/> 
                {selectedRequest.isReadOnly ? 'Détails de l\'opération' : 'Examen comptable'}
              </h2>
              <button onClick={() => setSelectedRequest(null)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"><XCircle size={24}/></button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              <div className="text-center p-8 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Montant</p>
                <p className={`text-5xl font-black tracking-tight ${selectedRequest.type === 'DEBIT' || selectedRequest.status === 'APPROVED' ? 'text-slate-900 dark:text-white' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {selectedRequest.amount.toFixed(2)} $
                </p>
                {selectedRequest.isReadOnly && (
                  <p className="text-xs text-slate-500 mt-3 font-medium">
                    Le {new Date(selectedRequest.createdAt || selectedRequest.updatedAt).toLocaleString('fr-FR')}
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Informations du profil</h3>
                <div className="space-y-4 text-sm bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <p className="flex justify-between items-center"><span className="text-slate-500">Nom complet</span> <span className="font-bold dark:text-white">{selectedRequest.user?.firstName} {selectedRequest.user?.lastName}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500">Type de compte</span> <span className="font-bold dark:text-white">{selectedRequest.user?.role}</span></p>
                  
                  {activeTab !== 'TRANSACTIONS' ? (
                    <>
                      <p className="flex justify-between items-center"><span className="text-slate-500">Méthode</span> <span className="font-bold text-[#162d3e] dark:text-[#f4c414] bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-700">{selectedRequest.method}</span></p>
                      <p className="flex justify-between items-center"><span className="text-slate-500">Contact / Numéro</span> <span className="font-mono font-bold dark:text-white">{selectedRequest.phone}</span></p>
                    </>
                  ) : (
                    <p className="flex justify-between items-start flex-col gap-1 mt-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <span className="text-slate-500 text-xs">Description :</span> 
                      <span className="font-medium dark:text-slate-300 leading-relaxed">{selectedRequest.description}</span>
                    </p>
                  )}
                </div>
              </div>

              {!selectedRequest.isReadOnly && (
                <>
                  <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex items-start gap-3">
                    <AlertCircle size={20} className="text-blue-600 shrink-0 mt-0.5" />
                    <p className="text-xs text-blue-800 dark:text-blue-300 font-medium leading-relaxed">
                      L'argent a déjà été déduit virtuellement. Procédez au transfert réel via votre application bancaire avant de cliquer sur "Valider le transfert".
                    </p>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Motif (Obligatoire en cas de refus)</label>
                    <textarea 
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Ex: Numéro M-Pesa invalide, vérification requise..."
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:border-[#162d3e] dark:focus:border-[#f4c414] focus:ring-1 focus:ring-[#162d3e] outline-none transition-all dark:text-white resize-none"
                      rows="3"
                    ></textarea>
                  </div>
                </>
              )}

            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex gap-4 bg-white dark:bg-slate-900">
              {selectedRequest.isReadOnly ? (
                <button 
                  onClick={() => setSelectedRequest(null)}
                  className="w-full px-4 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Fermer
                </button>
              ) : (
                <>
                  <button 
                    onClick={() => triggerAction('REJECT')}
                    className="flex-1 px-4 py-3.5 bg-white dark:bg-slate-900 border-2 border-rose-100 dark:border-rose-900/50 text-rose-600 font-bold rounded-xl hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                  >
                    Refuser
                  </button>
                  <button 
                    onClick={() => triggerAction('ACCEPT')}
                    className="flex-1 px-4 py-3.5 bg-[#162d3e] text-[#f4c414] font-bold rounded-xl hover:bg-[#1a3549] transition-colors shadow-lg"
                  >
                    Valider le transfert
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 2. MODALE CENTRALE DE CONFIRMATION AVEC LE LOADER UI */}
      {/* ========================================================= */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !confirmModal.isProcessing && setConfirmModal({ isOpen: false, action: null, isProcessing: false })}></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 relative z-20 animate-fade-in border border-slate-200 dark:border-slate-700 text-center min-h-[250px] flex flex-col justify-center">
            
            {confirmModal.isProcessing ? (
              <div className="flex flex-col items-center justify-center py-4 animate-fade-in">
                <RefreshCw size={48} className="animate-spin text-[#162d3e] dark:text-[#f4c414] mb-6" />
                <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">Traitement en cours...</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">Veuillez patienter pendant la validation comptable et l'envoi des notifications.</p>
              </div>
            ) : (
              <div className="animate-fade-in">
                <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${confirmModal.action === 'ACCEPT' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30'}`}>
                  <AlertTriangle size={32} />
                </div>
                
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">
                  {confirmModal.action === 'ACCEPT' ? 'Confirmer la validation' : 'Confirmer le refus'}
                </h3>
                
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
                  {confirmModal.action === 'ACCEPT' 
                    ? "Avez-vous bien effectué le transfert d'argent ? Cette action est irréversible et clôturera la demande." 
                    : "L'utilisateur sera notifié et les fonds seront recrédités sur son portefeuille Flashkin."}
                </p>
                
                <div className="flex gap-3">
                  <button 
                    onClick={() => setConfirmModal({ isOpen: false, action: null, isProcessing: false })}
                    className="flex-1 py-3 font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    Annuler
                  </button>
                  <button 
                    onClick={executeAction}
                    className={`flex-1 py-3 font-bold text-white rounded-xl transition-colors shadow-lg ${confirmModal.action === 'ACCEPT' ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30'}`}
                  >
                    Confirmer
                  </button>
                </div>
              </div>
            )}
            
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. MODALE CENTRALE DE RÉSULTAT */}
      {/* ========================================================= */}
      {resultModal.isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-sm"></div>
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 relative z-20 animate-slide-up border border-slate-200 dark:border-slate-800 flex items-center gap-4">
            <div className={`shrink-0 h-12 w-12 rounded-full flex items-center justify-center ${resultModal.type === 'error' ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
              {resultModal.type === 'error' ? <XCircle size={24} /> : <CheckCircle2 size={24} />}
            </div>
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                {resultModal.type === 'error' ? 'Erreur système' : 'Opération réussie'}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{resultModal.message}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}