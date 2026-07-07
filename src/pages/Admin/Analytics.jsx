import { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  TrendingUp, Activity, DollarSign, Package, 
  Download, Loader2, CheckCircle2, XCircle, Users, Truck, X, Eye, MapPin
} from 'lucide-react';

// --- POPUP CENTRALISÉ ---
const ActionPopup = ({ isOpen, type, message }) => {
  if (!isOpen) return null;

  const config = {
    loading: { icon: Loader2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200', spin: true },
    success: { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200', spin: false },
    error: { icon: XCircle, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-200', spin: false }
  };
  const current = config[type] || config.loading;
  const Icon = current.icon;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in"></div>
      <div className={`relative z-10 flex flex-col items-center justify-center p-8 bg-white dark:bg-slate-900 border ${current.border} rounded-2xl shadow-2xl animate-scale-up max-w-sm w-full text-center`}>
        <div className={`p-4 rounded-full ${current.bg} dark:bg-slate-800 mb-4`}>
          <Icon size={40} className={`${current.color} ${current.spin ? 'animate-spin' : 'animate-bounce-short'}`} />
        </div>
        <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2">
          {type === 'loading' ? 'Opération en cours' : type === 'success' ? 'Succès !' : 'Erreur'}
        </h3>
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
};

// --- PAGE PRINCIPALE ---
export default function AdminAnalytics() {
  const [data, setData] = useState(null);
  const [popup, setPopup] = useState({ isOpen: true, type: 'loading', message: 'Analyse des données logistiques...' });
  const [detailsDrawer, setDetailsDrawer] = useState({ isOpen: false, type: null, data: null });

  const showPopup = (type, message, autoClose = true) => {
    setPopup({ isOpen: true, type, message });
    if (autoClose && type !== 'loading') {
      setTimeout(() => setPopup({ isOpen: false, type: '', message: '' }), 2500);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://flashkindelivery-back-end.onrender.com/api/admin/analytics', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setData(res.data.data);
        setPopup({ isOpen: false, type: '', message: '' });
      }
    } catch (error) {
      showPopup('error', 'Impossible de charger les statistiques.', false);
    }
  };

  useEffect(() => { fetchAnalytics(); }, []);

  const handleExportPDF = async () => {
    showPopup('loading', 'Génération du rapport PDF en cours...', false);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/reports/global', {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob' 
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Flashkin_Rapport_Global_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);

      showPopup('success', 'Rapport téléchargé avec succès !');
    } catch (error) {
      showPopup('error', 'Erreur lors de la génération du PDF.');
    }
  };

  const openDetails = (type, userData) => {
    setDetailsDrawer({ isOpen: true, type, data: userData });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED': return <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold">LIVRÉ</span>;
      case 'IN_PROGRESS': return <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded text-[10px] font-bold">EN COURS</span>;
      case 'ACCEPTED': return <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded text-[10px] font-bold">ACCEPTÉ</span>;
      case 'CANCELLED': return <span className="px-2 py-1 bg-rose-50 text-rose-600 rounded text-[10px] font-bold">ANNULÉ</span>;
      default: return <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded text-[10px] font-bold">EN ATTENTE</span>;
    }
  };

  const COLORS = ['#162d3e', '#f4c414', '#10b981', '#f43f5e', '#8b5cf6'];

  if (!data && popup.isOpen) return <ActionPopup {...popup} />;
  if (!data) return null;

  return (
    <div className="animate-fade-in space-y-6 relative pb-10">
      <ActionPopup {...popup} />

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Analytics & Reporting</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Performances, revenus et activité globale</p>
        </div>
        <button 
          onClick={handleExportPDF}
          className="flex items-center gap-2 bg-slate-900 dark:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-bold hover:bg-[#162d3e] hover:text-[#f4c414] transition-colors shadow-sm"
        >
          <Download size={18} /> Télécharger Rapport Global
        </button>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl"><DollarSign size={24} /></div>
          </div>
          <p className="text-sm font-bold text-slate-500">Chiffre d'Affaires Brut</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.metrics.totalRevenue} $</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm border-l-4 border-l-[#162d3e]">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-slate-100 dark:bg-slate-700 text-[#162d3e] dark:text-white rounded-xl"><TrendingUp size={24} /></div>
          </div>
          <p className="text-sm font-bold text-slate-500">Revenus Nets Flashkin</p>
          <h3 className="text-2xl font-black text-[#162d3e] dark:text-[#f4c414] mt-1">{data.metrics.flashkinRevenue} $</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-xl"><Activity size={24} /></div>
          </div>
          <p className="text-sm font-bold text-slate-500">Taux de Livraison</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.metrics.deliveryRate} %</h3>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl"><Package size={24} /></div>
          </div>
          <p className="text-sm font-bold text-slate-500">Total des commandes</p>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">{data.metrics.totalCommands}</h3>
        </div>
      </div>

      {/* GRAPHIQUES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white mb-6">Évolution des Revenus (CA vs Marges)</h3>
          <div className="w-full min-h-[350px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyData}>
                <defs>
                  <linearGradient id="colorCA" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f4c414" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#f4c414" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMarge" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#162d3e" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#162d3e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
                <Area type="monotone" dataKey="CA" stroke="#f4c414" fillOpacity={1} fill="url(#colorCA)" />
                <Area type="monotone" dataKey="Marge" stroke="#162d3e" fillOpacity={1} fill="url(#colorMarge)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col">
          <h3 className="font-bold text-slate-900 dark:text-white mb-2">Top Zones de Livraison</h3>
          <div className="w-full min-h-[350px] flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data.topZones} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={5} dataKey="value">
                  {data.topZones.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* CLASSEMENTS INTERACTIFS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* TOP PARTENAIRES */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <Users size={18} className="text-[#162d3e] dark:text-[#f4c414]"/>
            <h3 className="font-bold text-slate-900 dark:text-white">Top Partenaires (Volume)</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 flex-1">
            {data.topPartners.map((p, idx) => (
              <div 
                key={idx} 
                onClick={() => openDetails('PARTNER', p)}
                className="p-4 flex items-center justify-between hover:bg-blue-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-300 dark:text-slate-600 group-hover:text-blue-500">#{idx + 1}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#162d3e] dark:group-hover:text-white">{p.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">{p.orders} colis</span>
                  <Eye size={16} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP LIVREURS */}
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center gap-3">
            <Truck size={18} className="text-[#162d3e] dark:text-[#f4c414]"/>
            <h3 className="font-bold text-slate-900 dark:text-white">Livreurs performants</h3>
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50 flex-1">
            {data.topFlashmans.map((f, idx) => (
              <div 
                key={idx} 
                onClick={() => openDetails('FLASHMAN', f)}
                className="p-4 flex items-center justify-between hover:bg-emerald-50 dark:hover:bg-slate-800 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-slate-300 dark:text-slate-600 group-hover:text-emerald-500">#{idx + 1}</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200 group-hover:text-[#162d3e] dark:group-hover:text-white">{f.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-bold text-slate-500">{f.deliveries} livrés</span>
                  <Eye size={16} className="text-slate-400 group-hover:text-emerald-500 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================== */}
      {/* TIROIR DE DÉTAILS (HISTORIQUE TABLEAU)         */}
      {/* ============================================== */}
      {detailsDrawer.isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setDetailsDrawer({ isOpen: false, type: null, data: null })}></div>
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-2xl h-full relative z-10 shadow-2xl flex flex-col animate-slide-in-right border-l border-slate-200 dark:border-slate-800">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start bg-[#162d3e] text-white">
              <div>
                <p className="text-xs font-bold text-[#f4c414] uppercase tracking-widest mb-1">
                  {detailsDrawer.type === 'PARTNER' ? 'Fiche Partenaire' : 'Fiche Flashman'}
                </p>
                <h2 className="text-xl font-black">{detailsDrawer.data?.name}</h2>
              </div>
              <button onClick={() => setDetailsDrawer({ isOpen: false, type: null, data: null })} className="text-white/50 hover:text-white transition-colors">
                <X size={24}/>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50 dark:bg-slate-900/50">
              
              {/* Carte de Statistique Rapide */}
              <div className={`p-5 rounded-2xl border ${detailsDrawer.type === 'PARTNER' ? 'bg-blue-50 border-blue-100 text-blue-900' : 'bg-emerald-50 border-emerald-100 text-emerald-900'} dark:bg-slate-800 dark:border-slate-700 dark:text-white`}>
                <p className="text-sm font-bold opacity-70 mb-1">
                  {detailsDrawer.type === 'PARTNER' ? 'Volume total expédié' : 'Courses réussies'}
                </p>
                <h3 className="text-4xl font-black">
                  {detailsDrawer.type === 'PARTNER' ? detailsDrawer.data?.orders : detailsDrawer.data?.deliveries} 
                  <span className="text-base font-bold opacity-50 ml-2">colis</span>
                </h3>
              </div>

              {/* TABLEAU D'HISTORIQUE */}
              <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                  <h3 className="font-bold text-slate-900 dark:text-white">10 Dernières Commandes</h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm border-collapse">
                    <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                      <tr>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Date</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">Libellé / Colis</th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase">
                          {detailsDrawer.type === 'PARTNER' ? 'Flashman Assigné' : 'Partenaire'}
                        </th>
                        <th className="p-3 text-xs font-bold text-slate-500 uppercase text-right">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                      {detailsDrawer.data?.history?.length > 0 ? (
                        detailsDrawer.data.history.map((cmd) => (
                          <tr key={cmd.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {new Date(cmd.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}
                            </td>
                            <td className="p-3 font-medium text-slate-900 dark:text-white truncate max-w-[150px]">
                              {cmd.details || cmd.clientName}
                            </td>
                            <td className="p-3 text-slate-600 dark:text-slate-400">
                              {detailsDrawer.type === 'PARTNER' 
                                ? (cmd.flashman ? `${cmd.flashman.firstName}` : <span className="italic text-slate-400">Non assigné</span>)
                                : (cmd.partner?.storeName || cmd.partner?.firstName || 'Inconnu')
                              }
                            </td>
                            <td className="p-3 text-right">
                              {getStatusBadge(cmd.status)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" className="p-6 text-center text-slate-500 italic">Aucune commande trouvée.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}