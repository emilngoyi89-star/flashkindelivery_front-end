import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Map, Plus, Edit2, CheckCircle2, XCircle, X, Trash2 } from 'lucide-react';

export default function AdminCatalogue() {
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoneDrawer, setZoneDrawer] = useState({ isOpen: false, data: null });

  const fetchZones = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/admin/zones', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setZones(res.data.zones);
      }
    } catch (error) {
      toast.error("Erreur de chargement du catalogue.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchZones(); }, []);

  const handleSaveZone = async (e) => {
    e.preventDefault();
    const form = new FormData(e.target);
    const zoneData = {
      id: zoneDrawer.data?.id,
      name: form.get('name'),
      communes: form.get('communes').split(',').map(c => c.trim()),
      totalPrice: form.get('totalPrice'),
      agencyMargin: form.get('agencyMargin'),
      isActive: form.get('isActive') === 'on'
    };

    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/admin/zones', zoneData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Catalogue mis à jour !");
      setZoneDrawer({ isOpen: false, data: null });
      fetchZones();
    } catch (error) {
      toast.error("Erreur lors de la sauvegarde de la zone.");
    }
  };

  // --- NOUVEAU : FONCTION DE SUPPRESSION ---
  const handleDeleteZone = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette zone de livraison ?")) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/admin/zones/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Zone supprimée avec succès !");
      fetchZones(); 
    } catch (error) {
      toast.error("Erreur lors de la suppression de la zone.");
    }
  };

  return (
    <div className="animate-fade-in space-y-6 relative">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Catalogue & Zones</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Gérez la tarification de vos zones de livraison</p>
        </div>
        <button 
          onClick={() => setZoneDrawer({ isOpen: true, data: null })}
          className="flex items-center gap-2 bg-[#162d3e] text-[#f4c414] px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#1a3549] transition-colors shadow-sm"
        >
          <Plus size={18} /> Ajouter une zone
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nom de la Zone</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Communes incluses</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Prix Client</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Marge Agence</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Statut</th>
                <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
              {loading ? (
                <tr><td colSpan="6" className="p-8 text-center text-slate-500">Chargement...</td></tr>
              ) : zones.length === 0 ? (
                <tr><td colSpan="6" className="p-16 text-center text-slate-500"><Map size={32} className="mx-auto mb-3 opacity-50"/>Aucune zone configurée.</td></tr>
              ) : zones.map((zone) => (
                <tr key={zone.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 font-bold text-slate-900 dark:text-white">{zone.name}</td>
                  <td className="p-4 text-sm text-slate-500 dark:text-slate-400 truncate max-w-xs">{zone.communes.join(', ')}</td>
                  <td className="p-4 text-right font-black text-[#162d3e] dark:text-[#f4c414]">{zone.totalPrice.toFixed(2)} $</td>
                  <td className="p-4 text-right font-bold text-emerald-600 dark:text-emerald-400">{zone.agencyMargin.toFixed(2)} $</td>
                  <td className="p-4 text-center">
                    {zone.isActive ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2 py-1 rounded text-xs font-bold"><CheckCircle2 size={12}/> Actif</span> : <span className="inline-flex items-center gap-1 bg-rose-50 text-rose-600 px-2 py-1 rounded text-xs font-bold"><XCircle size={12}/> Inactif</span>}
                  </td>
                  <td className="p-4 text-right">
                    {/* NOUVEAU : Double bouton Modifier et Supprimer */}
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setZoneDrawer({ isOpen: true, data: zone })} className="p-2 text-slate-400 hover:text-[#162d3e] dark:hover:text-[#f4c414] bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors" title="Modifier">
                        <Edit2 size={16} />
                      </button>
                      <button onClick={() => handleDeleteZone(zone.id)} className="p-2 text-slate-400 hover:text-rose-600 bg-rose-50 dark:bg-rose-900/10 rounded-lg transition-colors" title="Supprimer">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DRAWER EDITION DE ZONE */}
      {zoneDrawer.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setZoneDrawer({ isOpen: false, data: null })}></div>
          <div className="relative z-10 w-full max-w-2xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col animate-fade-in">
            
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-[#162d3e] text-white">
              <h2 className="text-lg font-black">{zoneDrawer.data ? 'Modifier la zone' : 'Nouvelle Zone'}</h2>
              <button onClick={() => setZoneDrawer({ isOpen: false, data: null })} className="text-white/60 hover:text-white transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handleSaveZone} className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Nom de la Zone</label>
                <input name="name" defaultValue={zoneDrawer.data?.name} required placeholder="Ex: Gombe & Environs" className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#162d3e] dark:focus:border-[#f4c414] outline-none transition-all" />
              </div>
              
              <div>
                <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Communes (Séparées par virgules)</label>
                <textarea name="communes" defaultValue={zoneDrawer.data?.communes?.join(', ')} required placeholder="Gombe, Kintambo, Lingwala..." className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-[#162d3e] dark:focus:border-[#f4c414] outline-none transition-all resize-none" rows="4"></textarea>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Prix Client ($)</label>
                  <input name="totalPrice" type="number" step="0.5" defaultValue={zoneDrawer.data?.totalPrice} required placeholder="5.0" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#162d3e] dark:focus:border-[#f4c414] transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 uppercase block mb-2">Marge Agence ($)</label>
                  <input name="agencyMargin" type="number" step="0.5" defaultValue={zoneDrawer.data?.agencyMargin} required placeholder="2.0" className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-[#162d3e] dark:focus:border-[#f4c414] transition-all" />
                </div>
              </div>

              <div className="flex items-center gap-3 bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30">
                <input type="checkbox" name="isActive" id="isActive" defaultChecked={zoneDrawer.data ? zoneDrawer.data.isActive : true} className="w-5 h-5 accent-blue-600 rounded cursor-pointer" />
                <label htmlFor="isActive" className="text-sm font-bold text-blue-900 dark:text-blue-300 cursor-pointer">Zone active et visible au catalogue</label>
              </div>

              <button type="submit" className="w-full py-3.5 bg-[#162d3e] text-[#f4c414] font-bold rounded-xl hover:bg-[#1a3549] transition-colors shadow-lg mt-6">
                Enregistrer la zone
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}