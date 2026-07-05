import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Wallet, ArrowDownLeft, ArrowUpRight, Clock, CheckCircle, 
  Download, FileText, X, Loader2, Edit3, Trash2, Info, ChevronRight, Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import PageLoader from '../../components/PageLoader';

export default function FlashmanWallet() {
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('TRANSACTIONS'); 
  const [actionLoading, setActionLoading] = useState(null);

  // États des données
  const [walletData, setWalletData] = useState({ balance: 0, totalEarned: 0, transactions: [], withdrawals: [] });

  // Gestion des fenêtres modales
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [receiptPromptId, setReceiptPromptId] = useState(null); 
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState(null);

  // Formulaires
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('M-PESA');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState(''); // 👈 NOUVEAU : État pour le mot de passe
  const [isEditing, setIsEditing] = useState(false);

  const fetchWalletData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/wallet', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setWalletData(response.data.data);
    } catch (error) {
      toast.error("Échec de synchronisation comptable.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWalletData(); }, []);

  const downloadReceiptPDF = async (withdrawalId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios({
        url: `http://localhost:3000/api/wallet/withdraw/${withdrawalId}/pdf`,
        method: 'GET',
        responseType: 'blob',
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Flashkin_Recu_Retrait_${withdrawalId.slice(-6).toUpperCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      toast.error("Erreur d'impression du document.");
    }
  };

  const handleWithdrawSubmit = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawAmount) > walletData.balance) return toast.error("Solde insuffisant.");
    if (!password) return toast.error("Le mot de passe est requis.");

    // Demande de confirmation visuelle avant de frapper l'API
    if (!window.confirm("Êtes-vous sûr de vouloir valider cette requête de retrait ?")) return;

    setActionLoading('SUBMIT_WITHDRAW');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/wallet/withdraw', {
        amount: withdrawAmount, 
        method: paymentMethod, 
        phone: phoneNumber,
        password: password // 👈 NOUVEAU : Envoi du mot de passe au backend
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        setIsWithdrawModalOpen(false);
        setReceiptPromptId(response.data.withdrawalId);
        setWithdrawAmount('');
        setPhoneNumber('');
        setPassword(''); // On vide le mot de passe après succès
        fetchWalletData();
      }
    } catch (error) {
      // 🔴 GESTION DE L'ERREUR DE SÉCURITÉ
      const errorMessage = error.response?.data?.message || "Erreur de traitement.";
      toast.error(errorMessage, { duration: 5000 });
      setPassword(''); // On vide le champ pour le forcer à retaper
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateWithdrawal = async () => {
    setActionLoading('UPDATE_WITHDRAW');
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/wallet/withdraw/${selectedWithdrawal.id}`, {
        method: paymentMethod, phone: phoneNumber
      }, { headers: { Authorization: `Bearer ${token}` } });
      
      toast.success("Coordonnées de virement modifiées !");
      setSelectedWithdrawal(null);
      setIsEditing(false);
      fetchWalletData();
    } catch (error) {
      toast.error("Modification impossible.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelWithdrawal = async (id) => {
    if (!window.confirm("Voulez-vous vraiment annuler ce retrait ? Votre solde sera recrédité.")) return;
    setActionLoading('CANCEL_WITHDRAW');
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/wallet/withdraw/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Retrait annulé, fonds restitués !");
      setSelectedWithdrawal(null);
      fetchWalletData();
    } catch (error) {
      toast.error("Action impossible.");
    } finally {
      setActionLoading(null);
    }
  };

  const openModifyView = (withdraw) => {
    setPaymentMethod(withdraw.method);
    setPhoneNumber(withdraw.phone || '');
    setIsEditing(true);
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 font-sans text-gray-800 dark:text-gray-100">
      
      {/* SECTION FINTECH SOLDE */}
      <div className="bg-flashkin-dark rounded-3xl p-6 shadow-xl relative overflow-hidden text-white">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#7eba3d] opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex justify-between items-start mb-6">
          <div>
            <p className="text-sm text-gray-400 font-semibold tracking-wider uppercase mb-1">Solde Disponible</p>
            <h2 className="text-4xl font-black">{walletData.balance.toFixed(2)} <span className="text-[#7eba3d]">$</span></h2>
          </div>
          <div className="bg-white/10 p-3 rounded-2xl"><Wallet size={24} className="text-flashkin-yellow" /></div>
        </div>
        <div className="relative z-10 grid grid-cols-2 gap-4 border-t border-white/10 pt-5">
          <div>
            <p className="text-xs text-gray-400 font-medium">Gains totaux générés</p>
            <p className="font-bold text-lg">{walletData.totalEarned.toFixed(2)} $</p>
          </div>
          <div className="flex justify-end items-center">
            <button onClick={() => setIsWithdrawModalOpen(true)} className="bg-[#7eba3d] text-white font-bold py-2.5 px-5 rounded-xl hover:bg-[#6a9e33] transition-colors text-sm shadow-md">
              Retirer des fonds
            </button>
          </div>
        </div>
      </div>

      {/* TABS COMPTABLES */}
      <div className="flex p-1 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm sticky top-2 z-30">
        <button onClick={() => setActiveTab('TRANSACTIONS')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'TRANSACTIONS' ? 'bg-flashkin-blue text-white' : 'text-gray-500'}`}>
          Courses & Flux
        </button>
        <button onClick={() => setActiveTab('RETRAITS')} className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${activeTab === 'RETRAITS' ? 'bg-flashkin-blue text-white' : 'text-gray-500'}`}>
          Mes Retraits
        </button>
      </div>

      {/* COURSES & FLUX */}
      {activeTab === 'TRANSACTIONS' && (
        <div className="space-y-3">
          {walletData.transactions.map((trx) => (
            <div key={trx.id} onClick={() => setSelectedTransaction(trx)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 flex items-center justify-between shadow-sm cursor-pointer hover:scale-[1.01] transition-transform">
              <div className="flex items-center gap-4">
                <div className={`p-2.5 rounded-xl ${trx.type === 'CREDIT' ? 'bg-[#7eba3d]/10 text-[#7eba3d]' : 'bg-red-50 text-red-500 dark:bg-red-900/20'}`}>
                  {trx.type === 'CREDIT' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white text-sm max-w-[190px] truncate">{trx.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(trx.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`font-bold text-sm ${trx.type === 'CREDIT' ? 'text-[#7eba3d]' : 'text-gray-500'}`}>
                  {trx.type === 'CREDIT' ? '+' : '-'}{trx.amount.toFixed(2)} $
                </span>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* INTERACTIVE WITHDRAWALS */}
      {activeTab === 'RETRAITS' && (
        <div className="space-y-3">
          {walletData.withdrawals.map((w) => (
            <div key={w.id} onClick={() => !isEditing && setSelectedWithdrawal(w)} className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm flex justify-between items-center cursor-pointer hover:border-gray-300 transition-colors">
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 dark:bg-gray-700 p-2.5 rounded-xl text-gray-400"><FileText size={20} /></div>
                <div>
                  <p className="font-semibold text-sm text-gray-900 dark:text-white">Retrait via {w.method}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{new Date(w.createdAt).toLocaleDateString('fr-FR')}</p>
                </div>
              </div>
              <div className="text-right flex items-center gap-4">
                <div>
                  <p className="font-bold text-sm text-gray-900 dark:text-white">{w.amount.toFixed(2)} $</p>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full block mt-1 ${w.status === 'PENDING' ? 'bg-amber-50 text-amber-600' : w.status === 'REJECTED' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {w.status === 'PENDING' ? 'En attente' : w.status === 'REJECTED' ? 'Refusé' : 'Validé'}
                  </span>
                </div>
                <ChevronRight size={14} className="text-gray-300" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =========================================
          MODAL 1 : DEMANDE DE RETRAIT INITIALE (SÉCURISÉE)
          ========================================= */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-3 border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Demande de décaissement</h3>
              <button onClick={() => { setIsWithdrawModalOpen(false); setPassword(''); }} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Montant ($)</label>
                <input type="number" step="0.01" required value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-bold" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Opérateur</label>
                <div className="grid grid-cols-2 gap-2">
                  {['M-PESA', 'AIRTEL', 'ORANGE', 'AFRIMONEY'].map(m => (
                    <button type="button" key={m} onClick={() => setPaymentMethod(m)} className={`py-2.5 text-xs font-bold rounded-xl border transition-all ${paymentMethod === m ? 'border-[#7eba3d] bg-[#7eba3d]/5 text-[#7eba3d]' : 'border-gray-200 dark:border-gray-700 text-gray-500'}`}>{m}</button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Numéro de téléphone destinataire</label>
                <input type="text" required value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} placeholder="Ex: +24381..." className="w-full p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl" />
              </div>

              {/* 👇 NOUVEAU : CHAMP DE SÉCURITÉ */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <label className="block text-xs font-bold text-red-500 uppercase tracking-wide mb-1 flex items-center gap-1">
                  <Lock size={12} /> Mot de passe de sécurité
                </label>
                <input 
                  type="password" 
                  required 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="Tapez votre mot de passe pour valider" 
                  className="w-full p-3.5 bg-red-50/50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-xl text-sm focus:ring-2 focus:ring-red-400 outline-none" 
                />
              </div>
              
              <button type="submit" disabled={actionLoading === 'SUBMIT_WITHDRAW'} className="w-full bg-[#7eba3d] text-white font-bold py-3.5 rounded-xl hover:bg-[#6a9e33] transition-colors flex justify-center items-center shadow-md mt-2">
                {actionLoading === 'SUBMIT_WITHDRAW' ? <Loader2 className="animate-spin" size={18} /> : 'CONFIRMER LA TRANSACTION'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 2 : DOUBLE PROMPT IMPRESSION IMMÉDIATE
          ========================================= */}
      {receiptPromptId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-sm rounded-3xl p-6 text-center space-y-4 shadow-2xl border border-gray-100 dark:border-gray-800">
            <div className="w-14 h-14 bg-[#7eba3d]/10 text-[#7eba3d] rounded-full flex items-center justify-center mx-auto"><CheckCircle size={32} /></div>
            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Demande enregistrée !</h3>
            <p className="text-sm text-gray-500 leading-relaxed">Souhaitez-vous générer et télécharger instantanément votre reçu officiel de demande de paiement ?</p>
            <div className="flex gap-3 pt-2">
              <button onClick={() => setReceiptPromptId(null)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 font-bold rounded-xl text-sm">Plus tard</button>
              <button onClick={() => { downloadReceiptPDF(receiptPromptId); setReceiptPromptId(null); }} className="flex-1 py-3 bg-flashkin-blue text-white font-bold rounded-xl text-sm flex justify-center items-center gap-1.5 shadow-md">
                <Download size={16} /> OUI, LE REÇU
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 3 : TIROIR DÉTAILS GAIN COURSE
          ========================================= */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-gray-800">
              <h4 className="font-bold text-base flex items-center gap-2 text-gray-900 dark:text-white"><Info size={18} className="text-gray-400" /> Détails opérationnels</h4>
              <button onClick={() => setSelectedTransaction(null)} className="text-gray-400 bg-gray-50 dark:bg-gray-800 p-1.5 rounded-full"><X size={16} /></button>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-3">
              <div className="flex justify-between text-xs text-gray-500"><span>Date comptable</span><span className="font-medium text-gray-800 dark:text-gray-200">{new Date(selectedTransaction.createdAt).toLocaleString('fr-FR')}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>Référence interne</span><span className="font-mono font-bold text-gray-900 dark:text-white">{selectedTransaction.id.slice(0, 8).toUpperCase()}</span></div>
              <div className="flex justify-between text-xs text-gray-500"><span>Type d'opération</span><span className={`font-bold ${selectedTransaction.type === 'CREDIT' ? 'text-[#7eba3d]' : 'text-red-500'}`}>{selectedTransaction.type === 'CREDIT' ? 'ENTRÉE (Gain)' : 'SORTIE (Débit)'}</span></div>
              <div className="border-t pt-2 mt-2 border-gray-200 dark:border-gray-700">
                <p className="text-xs font-bold text-gray-400 uppercase mb-1">Libellé d'écriture</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{selectedTransaction.description}</p>
              </div>
            </div>
            <div className="flex justify-between items-center bg-gray-900 text-white p-4 rounded-2xl">
              <span className="text-xs text-gray-400 font-bold">VALEUR DE L'ÉCRITURE :</span>
              <span className="font-black text-lg text-flashkin-yellow">{selectedTransaction.amount.toFixed(2)} $</span>
            </div>
          </div>
        </div>
      )}

      {/* =========================================
          MODAL 4 : PANEL INTERACTIF DE RETRAIT (MODIF / ANNULER)
          ========================================= */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-center border-b pb-2 border-gray-100 dark:border-gray-800">
              <h3 className="font-bold text-base text-gray-900 dark:text-white">Gestion de la demande</h3>
              <button onClick={() => { setSelectedWithdrawal(null); setIsEditing(false); }} className="text-gray-400"><X size={18} /></button>
            </div>

            {!isEditing ? (
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-2xl space-y-2.5">
                  <div className="flex justify-between text-xs text-gray-500"><span>Montant bloqué</span><span className="font-bold text-gray-900 dark:text-white">{selectedWithdrawal.amount.toFixed(2)} $</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Canal de versement</span><span className="font-semibold text-gray-800 dark:text-gray-200">{selectedWithdrawal.method}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Numéro associé</span><span className="font-mono text-gray-800 dark:text-gray-200">{selectedWithdrawal.phone || 'Non spécifié'}</span></div>
                  <div className="flex justify-between text-xs text-gray-500"><span>Statut comptable</span><span className="font-bold text-amber-500 uppercase">{selectedWithdrawal.status}</span></div>
                </div>

                {selectedWithdrawal.status === 'PENDING' ? (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <button onClick={() => handleCancelWithdrawal(selectedWithdrawal.id)} disabled={actionLoading === 'CANCEL_WITHDRAW'} className="py-3 border border-red-200 text-red-500 font-bold rounded-xl text-xs flex justify-center items-center gap-1 hover:bg-red-50 transition-colors">
                      <Trash2 size={14} /> ANNULER LA DEMANDE
                    </button>
                    <button onClick={() => openModifyView(selectedWithdrawal)} className="py-3 bg-gray-900 text-white font-bold rounded-xl text-xs flex justify-center items-center gap-1 transition-colors">
                      <Edit3 size={14} /> MODIFIER LES COORDONNÉES
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { downloadReceiptPDF(selectedWithdrawal.id); setSelectedWithdrawal(null); }} className="w-full bg-flashkin-blue text-white font-bold py-3 rounded-xl text-xs flex justify-center items-center gap-2 shadow-md">
                    <Download size={14} /> TÉLÉCHARGER LE REÇU OFFICIEL (PDF)
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Changer d'opérateur</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['M-PESA', 'AIRTEL', 'ORANGE', 'AFRIMONEY'].map(m => (
                      <button type="button" key={m} onClick={() => setPaymentMethod(m)} className={`py-2 text-xs font-bold rounded-xl border ${paymentMethod === m ? 'border-[#7eba3d] bg-[#7eba3d]/5 text-[#7eba3d]' : 'border-gray-200 dark:border-gray-700 text-gray-400'}`}>{m}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-1">Nouveau numéro de réception</label>
                  <input type="text" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full p-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl font-mono text-sm" />
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={() => setIsEditing(false)} className="flex-1 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 font-bold rounded-xl text-xs">Retour</button>
                  <button onClick={handleUpdateWithdrawal} disabled={actionLoading === 'UPDATE_WITHDRAW'} className="flex-1 bg-[#7eba3d] text-white font-bold rounded-xl text-xs flex justify-center items-center shadow-md">
                    {actionLoading === 'UPDATE_WITHDRAW' ? <Loader2 className="animate-spin" size={14} /> : 'ENREGISTRER'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}