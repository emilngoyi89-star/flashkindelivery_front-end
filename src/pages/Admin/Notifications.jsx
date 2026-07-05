import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, AlertTriangle, UserPlus, Banknote, ShieldAlert, 
  ChevronRight, Filter, Loader2, CheckCircle2, PhoneCall
} from 'lucide-react';

export default function AdminNotifications() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, INCIDENT, CASHOUT, NEW_USER
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/admin/notifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAlerts(res.data.alerts);
      }
    } catch (error) {
      console.error("Erreur de chargement des notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  // Formatage relatif du temps (ex: "Il y a 5 min")
  const timeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    if (seconds < 60) return "À l'instant";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `Il y a ${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Il y a ${hours}h`;
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Config des icônes et couleurs par type d'alerte
  const getTypeConfig = (type) => {
    switch(type) {
      case 'INCIDENT': return { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100', border: 'border-rose-200' };
      case 'LITIGE': return { icon: ShieldAlert, color: 'text-orange-600', bg: 'bg-orange-100', border: 'border-orange-200' };
      case 'CASHOUT': return { icon: Banknote, color: 'text-emerald-600', bg: 'bg-emerald-100', border: 'border-emerald-200' };
      case 'NEW_USER': return { icon: UserPlus, color: 'text-blue-600', bg: 'bg-blue-100', border: 'border-blue-200' };
      default: return { icon: Bell, color: 'text-slate-600', bg: 'bg-slate-100', border: 'border-slate-200' };
    }
  };

  // Filtrage des données
  const filteredAlerts = filter === 'ALL' ? alerts : alerts.filter(a => a.type === filter || (filter === 'URGENT' && ['INCIDENT', 'LITIGE'].includes(a.type)));

  return (
    <div className="animate-fade-in space-y-6 max-w-5xl mx-auto pb-10">
      
      {/* HEADER & FILTRES */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-3">
            Centre de Notifications 
            <span className="bg-rose-500 text-white text-xs px-2 py-1 rounded-full animate-pulse">{alerts.length}</span>
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez les urgences, retraits et inscriptions</p>
        </div>

        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
          <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'ALL' ? 'bg-[#162d3e] text-[#f4c414]' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Toutes</button>
          <button onClick={() => setFilter('URGENT')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex items-center gap-2 ${filter === 'URGENT' ? 'bg-rose-100 text-rose-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}><AlertTriangle size={16}/> Urgences</button>
          <button onClick={() => setFilter('CASHOUT')} className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors ${filter === 'CASHOUT' ? 'bg-emerald-100 text-emerald-700' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}>Finance</button>
        </div>
      </div>

      {/* LISTE DES NOTIFICATIONS */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Loader2 className="animate-spin text-[#162d3e] mb-4" size={32} />
            <p className="text-slate-500 font-bold">Synchronisation avec le radar...</p>
          </div>
        ) : filteredAlerts.length === 0 ? (
          <div className="p-16 text-center">
            <CheckCircle2 size={48} className="mx-auto text-emerald-500 mb-4 opacity-50" />
            <h3 className="text-lg font-black text-slate-900 dark:text-white">Tout est calme</h3>
            <p className="text-sm text-slate-500 mt-1">Aucune notification à traiter pour le moment.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {filteredAlerts.map((alert) => {
              const { icon: Icon, color, bg, border } = getTypeConfig(alert.type);
              
              return (
                <div key={alert.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex flex-col md:flex-row gap-4 items-start md:items-center group">
                  
                  {/* Icône */}
                  <div className={`p-3 rounded-xl border ${bg} ${border} ${color} shrink-0`}>
                    <Icon size={24} />
                  </div>

                  {/* Contenu */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className={`font-bold ${alert.type === 'INCIDENT' ? 'text-rose-600' : 'text-slate-900 dark:text-white'}`}>
                        {alert.title}
                      </h3>
                      <span className="text-xs font-bold text-slate-400 dark:text-slate-500">{timeAgo(alert.date)}</span>
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300">{alert.message}</p>
                    
                    {/* Affichage du numéro si c'est une urgence */}
                    {['INCIDENT', 'LITIGE'].includes(alert.type) && alert.contact && (
                      <div className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                        <PhoneCall size={12} /> Contacter : {alert.contact}
                      </div>
                    )}
                  </div>

                  {/* Bouton d'action rapide */}
                  <button 
                    onClick={() => navigate(alert.actionLink)}
                    className="w-full md:w-auto mt-3 md:mt-0 px-5 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-300 hover:border-[#162d3e] hover:text-[#162d3e] dark:hover:border-[#f4c414] dark:hover:text-[#f4c414] transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    Traiter l'alerte <ChevronRight size={16} />
                  </button>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}