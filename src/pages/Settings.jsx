import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { MapPin, Phone, Webhook, Zap, Palette, Save } from 'lucide-react';
import PageLoader from '../components/PageLoader';

export default function Settings() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // On stocke toutes les données ici
  const [settingsData, setSettingsData] = useState({
    defaultAddress: '', defaultPhone: '', webhookUrl: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://flashkindelivery-back-end.onrender.com/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        // On récupère TOUT, mais on ne stocke que ce qui concerne les paramètres
        const user = res.data.user;
        // On garde aussi les données du profil pour pouvoir faire la mise à jour sans les écraser
        setSettingsData(user); 
      }
    } catch (error) {
      toast.error('Erreur de chargement des paramètres');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      // On envoie tout l'objet (qui contient profil + paramètres)
      await axios.put('https://flashkindelivery-back-end.onrender.com/api/users/profile', settingsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Paramètres sauvegardés avec succès ! 🚀');
    } catch (error) {
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-4xl mx-auto pb-20 md:pb-10">
      
      {/* HEADER PARAMÈTRES */}
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Paramètres du système</h1>
        <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">Configurez vos automatisations et gagnez du temps.</p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* BLOC 1 : VALEURS PAR DÉFAUT */}
        <div className="bg-white dark:bg-[#0f1f2d] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Zap size={24} className="text-flashkin-yellow" /> Gain de temps (Autofill)
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Ces informations pré-rempliront automatiquement vos formulaires de création de commande.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><MapPin size={12}/> Commune d'expédition habituelle</label>
              <input 
                type="text" 
                value={settingsData.defaultAddress || ''} 
                onChange={(e) => setSettingsData({...settingsData, defaultAddress: e.target.value})} 
                placeholder="Ex: Gombe, Limete..." 
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" 
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 flex items-center gap-1"><Phone size={12}/> Numéro d'expédition par défaut</label>
              <input 
                type="text" 
                value={settingsData.defaultPhone || ''} 
                onChange={(e) => setSettingsData({...settingsData, defaultPhone: e.target.value})} 
                placeholder="Ex: 0820000000" 
                className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" 
              />
            </div>
          </div>
        </div>

        {/* BLOC 2 : INTÉGRATIONS & WEBHOOKS */}
        <div className="bg-gradient-to-br from-[#0a151f] to-[#1e3a8a] rounded-[2rem] p-8 shadow-lg text-white border border-blue-900/50">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-xl font-black mb-2 flex items-center gap-2">
                <Webhook size={24} className="text-blue-300" /> Intégration WhatsApp (API)
              </h2>
              <p className="text-sm text-blue-200">Connectez Flashkin à vos outils externes (ex: Whatixo) pour déclencher des messages automatiques lors de la livraison.</p>
            </div>
            <div className="bg-blue-500/20 text-blue-300 text-xs font-black px-3 py-1 rounded-full border border-blue-500/30">
              PRO
            </div>
          </div>
          
          <div>
            <label className="text-[10px] font-black text-blue-300 uppercase mb-2 block">URL du Webhook de destination</label>
            <input 
              type="url" 
              value={settingsData.webhookUrl || ''} 
              onChange={(e) => setSettingsData({...settingsData, webhookUrl: e.target.value})} 
              placeholder="https://api.whatixo.com/webhook/v1/..." 
              className="w-full p-4 bg-black/30 text-white border border-white/10 rounded-2xl focus:ring-4 focus:ring-blue-500/30 outline-none font-mono text-sm transition-all placeholder:text-gray-500" 
            />
          </div>
        </div>

        {/* BOUTON SAUVEGARDER */}
        <div className="flex justify-end pt-4">
          <button 
            type="submit" 
            disabled={isSaving} 
            className="bg-flashkin-blue text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg flex items-center gap-2"
          >
            <Save size={20} /> {isSaving ? 'Enregistrement...' : 'Sauvegarder les paramètres'}
          </button>
        </div>

      </form>
    </div>
  );
}