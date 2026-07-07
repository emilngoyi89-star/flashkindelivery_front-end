import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Search, Filter, MoreVertical, ShieldCheck, 
  UserX, CheckCircle, Clock, Package,
  Plus, Download, Eye, Ban, Trash2, X
} from 'lucide-react';

export default function AdminUsers() {
  const [activeTab, setActiveTab] = useState('PARTNER');
  const [searchQuery, setSearchQuery] = useState('');
  
  // States de données et UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openActionId, setOpenActionId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 1. CHARGEMENT DES DONNÉES
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get('https://flashkindelivery-back-end.onrender.com/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (data.success) {
        setUsers(data.users);
      }
    } catch (error) {
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 2. ACTIONS API (SUSPENDRE & SUPPRIMER)
  const handleToggleStatus = async (user) => {
    try {
      const newStatus = user.status === 'ACTIVE' ? false : true;
      const token = localStorage.getItem('token');
      
      await axios.patch(`https://flashkindelivery-back-end.onrender.com/api/admin/users/${user.id}/status`,
        { isActive: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`Le compte de ${user.name} a été ${newStatus ? 'réactivé' : 'suspendu'}.`);
      setOpenActionId(null);
      fetchUsers(); // Rafraîchit la liste
      
      // Si la modale est ouverte, on met à jour son statut visuel
      if (selectedUser && selectedUser.id === user.id) {
        setSelectedUser({ ...selectedUser, status: newStatus ? 'ACTIVE' : 'SUSPENDED' });
      }
    } catch (error) {
      toast.error('Erreur lors de la modification du statut.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`https://flashkindelivery-back-end.onrender.com/api/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Utilisateur supprimé avec succès.");
      setOpenActionId(null);
      setIsModalOpen(false);
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur lors de la suppression.');
    }
  };

  // 3. EXPORT CSV
  const handleExportCSV = () => {
    if (users.length === 0) return toast.error("Aucune donnée à exporter.");
    
    const headers = ["ID,Nom,Email,Téléphone,Role,Statut,Commandes,Date Inscription\n"];
    const rows = users.map(u => 
      `${u.id},"${u.name}","${u.email}","${u.phone}",${u.role},${u.status},${u.orders},"${u.date}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + headers + rows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Flashkin_Users_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    toast.success("Export terminé !");
  };

  // 4. FILTRAGE LOCAL & KPIs
  const filteredUsers = users.filter(u => 
    u.role === activeTab && 
    (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;

  const handleOpenProfile = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
    setOpenActionId(null);
  };

  return (
    <div className="animate-fade-in space-y-6 relative">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Utilisateurs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez vos Partenaires et Flashmans</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm">
            <Download size={16} /> Export
          </button>
          <button onClick={() => toast("L'ajout manuel sera disponible dans la v2", { icon: '🚧' })} className="flex items-center gap-2 px-4 py-2 bg-[#162d3e] text-[#f4c414] rounded-lg text-sm font-bold hover:bg-[#1a3549] transition-colors shadow-sm">
            <Plus size={16} /> Ajouter
          </button>
        </div>
      </div>

      {/* MINI-KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 rounded-lg"><ShieldCheck size={20} /></div>
          <div><p className="text-xs text-slate-500 font-bold uppercase">Actifs</p><p className="text-xl font-black dark:text-white">{activeCount}</p></div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4 shadow-sm">
          <div className="p-3 bg-rose-100 dark:bg-rose-900/30 text-rose-600 rounded-lg"><UserX size={20} /></div>
          <div><p className="text-xs text-slate-500 font-bold uppercase">Suspendus</p><p className="text-xl font-black dark:text-white">{suspendedCount}</p></div>
        </div>
      </div>

      {/* TABS & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="flex w-full md:w-auto bg-slate-100 dark:bg-slate-900 p-1 rounded-lg">
          <button onClick={() => setActiveTab('PARTNER')} className={`flex-1 px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'PARTNER' ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm' : 'text-slate-500'}`}>Partenaires</button>
          <button onClick={() => setActiveTab('FLASHMAN')} className={`flex-1 px-6 py-2 text-sm font-bold rounded-md transition-all ${activeTab === 'FLASHMAN' ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm' : 'text-slate-500'}`}>Flashmans</button>
        </div>

        <div className="flex w-full md:w-auto gap-2 px-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" placeholder="Rechercher un email, nom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full md:w-64 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm rounded-lg pl-10 pr-4 py-2 focus:border-[#f4c414] outline-none dark:text-white"
          />
        </div>
      </div>

      {/* DATA GRID */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-visible">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Utilisateur</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Contact</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">Statut</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase">{activeTab === 'PARTNER' ? 'Revenus' : 'Note'}</th>
              <th className="p-4 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
            {loading ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Chargement...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan="5" className="p-8 text-center text-slate-500">Aucun utilisateur trouvé.</td></tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3 cursor-pointer" onClick={() => handleOpenProfile(user)}>
                      <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold dark:text-white border border-slate-200 dark:border-slate-600 shrink-0">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white hover:text-blue-600 transition-colors truncate max-w-[150px] md:max-w-xs">{user.name}</p>
                        <p className="text-xs text-slate-500 truncate max-w-[150px] md:max-w-xs">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4"><p className="text-sm text-slate-700 dark:text-slate-300">{user.phone}</p><p className="text-xs text-slate-500">{user.date}</p></td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${user.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20' : 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-500/10 dark:border-rose-500/20'}`}>
                      {user.status === 'ACTIVE' ? <CheckCircle size={12}/> : <UserX size={12}/>} {user.status}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold dark:text-white flex items-center gap-1"><Package size={14} className="text-slate-400" /> {user.orders}</span>
                      {activeTab === 'PARTNER' ? <span className="text-xs text-emerald-600 font-bold">{user.revenue}$</span> : <span className="text-xs font-bold text-amber-500">⭐ {user.rating}</span>}
                    </div>
                  </td>
                  <td className="p-4 text-right relative">
                    <button onClick={() => setOpenActionId(openActionId === user.id ? null : user.id)} className="p-2 text-slate-400 hover:text-[#162d3e] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                      <MoreVertical size={18} />
                    </button>
                    {openActionId === user.id && (
                      <div className="absolute right-10 top-10 w-48 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden text-left">
                        <button onClick={() => handleOpenProfile(user)} className="w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"><Eye size={16} /> Voir le profil</button>
                        <div className="h-px bg-slate-200 dark:bg-slate-700 my-1"></div>
                        <button onClick={() => handleToggleStatus(user)} className={`w-full px-4 py-2 text-sm flex items-center gap-2 ${user.status === 'ACTIVE' ? 'text-amber-600 hover:bg-amber-50' : 'text-emerald-600 hover:bg-emerald-50'}`}>
                          {user.status === 'ACTIVE' ? <><Ban size={16} /> Suspendre</> : <><CheckCircle size={16} /> Réactiver</>}
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="w-full px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30 flex items-center gap-2"><Trash2 size={16} /> Supprimer</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* POP-UP (MODAL) DU PROFIL UTILISATEUR - RESPONSIVE MOBILE */}
      {isModalOpen && selectedUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}></div>
          
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl relative z-10 overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[90vh] animate-slide-up">
            
            <div className="bg-[#162d3e] p-5 sm:p-6 text-white flex justify-between items-start shrink-0">
              <div className="flex gap-4 items-center">
                <div className="h-14 w-14 sm:h-16 sm:w-16 bg-[#f4c414] text-[#162d3e] rounded-xl flex items-center justify-center text-xl sm:text-2xl font-black shadow-inner shrink-0">
                  {selectedUser.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-black truncate max-w-[180px] sm:max-w-[250px]">{selectedUser.name}</h2>
                  <p className="text-xs sm:text-sm text-blue-200 font-medium">{selectedUser.role === 'PARTNER' ? 'Partenaire E-commerce' : 'Livreur Flashman'}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-white/50 hover:text-white bg-white/10 hover:bg-white/20 p-2 rounded-lg shrink-0">
                <X size={20} />
              </button>
            </div>

            <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar">
              
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Informations de contact</h3>
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 space-y-3 text-sm">
                  <p className="flex justify-between items-center"><span className="text-slate-500">Email</span> <span className="font-bold dark:text-white truncate max-w-[150px] sm:max-w-full text-right">{selectedUser.email}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500">Téléphone</span> <span className="font-bold dark:text-white text-right">{selectedUser.phone}</span></p>
                  <p className="flex justify-between items-center"><span className="text-slate-500">Inscription</span> <span className="font-bold dark:text-white text-right">{selectedUser.date}</span></p>
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Performances Globales</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 font-bold mb-1">Courses réalisées</p>
                    <p className="text-2xl font-black text-blue-600 dark:text-blue-400">{selectedUser.orders}</p>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 text-center">
                    <p className="text-xs text-slate-500 font-bold mb-1">{selectedUser.role === 'PARTNER' ? 'Chiffre généré' : 'Note Moyenne'}</p>
                    <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                      {selectedUser.role === 'PARTNER' ? `${selectedUser.revenue}$` : `${selectedUser.rating}/5`}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={() => {
                    handleToggleStatus(selectedUser);
                    setIsModalOpen(false);
                  }} 
                  className={`w-full px-4 py-3 font-bold rounded-lg border transition-colors ${selectedUser.status === 'ACTIVE' ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100' : 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'}`}
                >
                  {selectedUser.status === 'ACTIVE' ? 'Suspendre ce compte' : 'Réactiver ce compte'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}