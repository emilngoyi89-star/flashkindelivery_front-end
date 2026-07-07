import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Wallet, ArrowUpRight, ArrowDownRight, Clock, 
  CheckCircle, Download, Send, Smartphone, Building2, AlertCircle 
} from 'lucide-react';
import PageLoader from '../components/PageLoader';

export default function Balance() {
  const [data, setData] = useState({ balance: 0, transactions: [], withdrawals: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [withdrawForm, setWithdrawForm] = useState({
    amount: '',
    method: 'M-PESA',
    phone: ''
  });
// TEST FONCTION A SUPPRIMER UNE FOIS LE TEST TERMINER 
const handleTestMoney = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('https://flashkindelivery-back-end.onrender.com/api/balance/test-money', {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Bip Boop ! 50$ ajoutés !");
      fetchData(); // On recharge la page instantanément
    } catch (error) {
      toast.error("Erreur du bouton magique");
    }
  };
  //FONCTION FIN TEST
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://flashkindelivery-back-end.onrender.com/api/balance', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setData(response.data);
      }
    } catch (error) {
      toast.error("Erreur de récupération du solde");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleWithdraw = async (e) => {
    e.preventDefault();
    if (parseFloat(withdrawForm.amount) > data.balance) {
      return toast.error("Solde insuffisant");
    }

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'https://flashkindelivery-back-end.onrender.com/api/balance/withdraw', 
        withdrawForm, 
        { 
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob' // Important pour recevoir le PDF
        }
      );

      // 📥 Téléchargement automatique du reçu PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Recu_Retrait_Flashkin.pdf`);
      document.body.appendChild(link);
      link.click();

      toast.success("Demande envoyée ! Reçu généré.");
      setIsModalOpen(false);
      setWithdrawForm({ amount: '', method: 'M-PESA', phone: '' });
      fetchData(); // Rafraîchir le solde
    } catch (error) {
      toast.error("Erreur lors de la demande");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6 pb-20 md:pb-10 bg-slate-50/70 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      
      {/* 💰 CARTE DE SOLDE PRINCIPALE (STYLE PREMIUM) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-flashkin-blue to-[#0f1f2d] rounded-[2.5rem] p-8 text-white shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <p className="text-blue-200 text-xs font-black uppercase tracking-[0.2em] mb-2">Solde disponible</p>
            <h2 className="text-5xl md:text-6xl font-black text-white italic">
              {data.balance.toFixed(2)}<span className="text-flashkin-yellow text-3xl ml-1">$</span>
            </h2>
          </div>
          
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full md:w-auto bg-flashkin-yellow text-flashkin-blue px-8 py-4 rounded-2xl font-black text-lg flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-lg"
          >
            <Send size={20} /> Demander un retrait
          </button>
        </div>
        {/* Décoration en arrière-plan */}
        <div className="absolute -right-10 -bottom-10 opacity-10 rotate-12">
          <Wallet size={250} />
        </div>
      </div>

      {/* 📊 GRILLE DE STATISTIQUES */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-300 rounded-xl flex items-center justify-center mb-3">
            <ArrowUpRight size={20} />
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase">Total Revenus</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {data.transactions.filter(t => t.type === 'CREDIT').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}$
          </p>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-300 rounded-xl flex items-center justify-center mb-3">
            <Clock size={20} />
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase">En attente</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {data.withdrawals.filter(w => w.status === 'PENDING').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}$
          </p>
        </div>

        <div className="hidden md:block bg-white dark:bg-slate-900 p-6 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-300 rounded-xl flex items-center justify-center mb-3">
            <CheckCircle size={20} />
          </div>
          <p className="text-gray-400 dark:text-slate-500 text-[10px] font-bold uppercase">Total Retiré</p>
          <p className="text-xl font-black text-gray-900 dark:text-white">
            {data.withdrawals.filter(w => w.status === 'APPROVED').reduce((acc, curr) => acc + curr.amount, 0).toFixed(2)}$
          </p>
        </div>
      </div>

      {/* 📑 HISTORIQUE DES OPÉRATIONS */}
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-gray-50 dark:border-slate-800 flex justify-between items-center">
          <h3 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Opérations récentes</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <tbody className="divide-y divide-gray-50">
              {data.transactions.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/60 transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-300'}`}>
                        {t.type === 'CREDIT' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white">{t.description}</p>
                        <p className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{new Date(t.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <p className={`font-black ${t.type === 'CREDIT' ? 'text-green-600 dark:text-green-300' : 'text-red-600 dark:text-red-300'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'}{t.amount.toFixed(2)}$
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🏧 MODAL DE RETRAIT (MOBILE OPTIMIZED) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm p-0 md:p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up md:animate-scale-up border border-gray-100 dark:border-slate-800">
            <div className="p-6 sm:p-8 border-b border-gray-100 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/70 flex justify-between items-center">
              <h3 className="text-xl font-black text-gray-900 dark:text-white italic">Demander un paiement</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 dark:text-slate-400 p-2"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleWithdraw} className="p-5 sm:p-8 space-y-5 sm:space-y-6">
              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mb-2 block">Montant à retirer ($)</label>
                <div className="relative">
                  <input 
                    type="number" required min="10" 
                    value={withdrawForm.amount}
                    onChange={(e) => setWithdrawForm({...withdrawForm, amount: e.target.value})}
                    placeholder="Min. 10$" 
                    className="w-full text-3xl font-black p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none transition-all text-slate-900 dark:text-white"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 dark:text-slate-500 font-black text-2xl">$</span>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mb-2 block">Mode de réception</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button" 
                    onClick={() => setWithdrawForm({...withdrawForm, method: 'M-PESA'})}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${withdrawForm.method === 'M-PESA' ? 'border-flashkin-blue bg-blue-50 dark:bg-blue-900/20 text-flashkin-blue dark:text-blue-300' : 'border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400'}`}
                  >
                    <Smartphone size={24} /> <span className="text-xs font-bold">M-PESA / Airtel</span>
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setWithdrawForm({...withdrawForm, method: 'BANK'})}
                    className={`p-4 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all ${withdrawForm.method === 'BANK' ? 'border-flashkin-blue bg-blue-50 dark:bg-blue-900/20 text-flashkin-blue dark:text-blue-300' : 'border-gray-100 dark:border-slate-700 text-gray-400 dark:text-slate-400'}`}
                  >
                    <Building2 size={24} /> <span className="text-xs font-bold">Banque</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase mb-2 block">Numéro ou Compte</label>
                <input 
                  type="text" required
                  value={withdrawForm.phone}
                  onChange={(e) => setWithdrawForm({...withdrawForm, phone: e.target.value})}
                  placeholder="Ex: 0820000000"
                  className="w-full p-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none transition-all font-bold text-slate-900 dark:text-white"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full bg-flashkin-blue text-white font-black py-5 rounded-2xl hover:opacity-90 disabled:opacity-50 transition-all shadow-xl flex items-center justify-center gap-3"
              >
                {isSubmitting ? 'Génération du reçu...' : 'Confirmer le retrait'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Composant X simple car lucide-react ne l'exporte pas toujours en "X" selon la version
const X = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);