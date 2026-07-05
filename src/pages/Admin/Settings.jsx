import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
  Zap, ToggleLeft, ToggleRight, Save, Loader2, Info, 
  Wallet, Monitor, Mail, ShieldCheck, PaintBucket
} from 'lucide-react';

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState('cron');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Initialisation avec toutes les clés système (les valeurs par défaut seront écrasées par la BDD)
  const [settings, setSettings] = useState({ 
    // CRON
    CRON_WAKEUP_ACTIVE: 'false', 
    CRON_WAKEUP_MESSAGE: '',
    CRON_WAKEUP_INTERVAL: '10',
    // FINANCE
    DEFAULT_DELIVERY_FEE: '5.0',
    FLASHKIN_COMMISSION: '3.0',
    FLASHMAN_COMMISSION: '2.0',
    // PLATEFORME & BRANDING
    PLATFORM_NAME: 'Flashkin Delivery',
    MAINTENANCE_MODE: 'false',
    BRAND_COLOR: '#162d3e',
    // EMAILS
    SYSTEM_EMAIL_SENDER: 'no-reply@flashkin.com',
    EMAIL_WELCOME_SUBJECT: 'Bienvenue chez Flashkin !',
    // SÉCURITÉ & PERMISSIONS
    ALLOW_PARTNER_REGISTRATION: 'true',
    AUTO_APPROVE_DRIVERS: 'false'
  });

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (error) {
      toast.error("Erreur de chargement des paramètres.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSettings(); }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/admin/settings', { settings }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success("Paramètres système sauvegardés !");
    } catch (error) {
      toast.error("Échec de la sauvegarde.");
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({ ...prev, [key]: prev[key] === 'true' ? 'false' : 'true' }));
  };

  if (loading) return <div className="p-8 text-center"><Loader2 className="animate-spin mx-auto text-[#162d3e]" /></div>;

  const tabs = [
    { id: 'cron', label: 'Relances & Cron', icon: Zap },
    { id: 'finance', label: 'Frais & Commissions', icon: Wallet },
    { id: 'platform', label: 'Plateforme & Branding', icon: Monitor },
    { id: 'email', label: 'Emails Système', icon: Mail },
    { id: 'security', label: 'Rôles & Permissions', icon: ShieldCheck },
  ];

  return (
    <div className="animate-fade-in space-y-6 max-w-6xl mx-auto pb-10 relative">
      
      {/* HEADER AVEC BOUTON DE SAUVEGARDE GLOBAL */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 bg-[#F8FAFC]/90 dark:bg-slate-900/90 backdrop-blur-md z-10 py-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Paramètres Généraux</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Configuration centrale de l'infrastructure</p>
        </div>
        <button 
          onClick={handleSaveSettings}
          disabled={saving}
          className="flex items-center gap-2 bg-[#162d3e] text-[#f4c414] px-6 py-3 rounded-xl text-sm font-bold hover:bg-[#1a3549] transition-colors shadow-lg disabled:opacity-50"
        >
          {saving ? <Loader2 size={18} className="animate-spin"/> : <Save size={18}/>} 
          Appliquer les modifications
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* SIDEBAR DES ONGLETS */}
        <div className="w-full md:w-64 shrink-0 space-y-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-sm ${
                  isActive 
                    ? 'bg-white dark:bg-slate-800 text-[#162d3e] dark:text-[#f4c414] shadow-sm border border-slate-200 dark:border-slate-700' 
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300 border border-transparent'
                }`}
              >
                <Icon size={18} /> {tab.label}
              </button>
            )
          })}
        </div>

        {/* CONTENU DES ONGLETS */}
        <div className="flex-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden min-h-[500px]">
          
          {/* 1. ONGLET CRON (Existant) */}
          {activeTab === 'cron' && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-lg"><Zap size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Moteur de Relance (Cron)</h2>
                  <p className="text-sm text-slate-500">Réveil automatique des livreurs via WhatsApp.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">Activation du Radar de Relance</h3>
                  <p className="text-sm text-slate-500 mt-1">Le système vérifiera les courses abandonnées selon la fréquence.</p>
                </div>
                <button onClick={() => toggleSetting('CRON_WAKEUP_ACTIVE')} className={`transition-colors ${settings.CRON_WAKEUP_ACTIVE === 'true' ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {settings.CRON_WAKEUP_ACTIVE === 'true' ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                </button>
              </div>

              <div className={`${settings.CRON_WAKEUP_ACTIVE !== 'true' ? 'opacity-50 pointer-events-none' : ''} transition-opacity space-y-6`}>
                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-2">Fréquence de relance</label>
                  <select value={settings.CRON_WAKEUP_INTERVAL} onChange={(e) => updateSetting('CRON_WAKEUP_INTERVAL', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold text-slate-700 dark:text-slate-200 focus:border-[#162d3e] dark:focus:border-[#f4c414] outline-none">
                    <option value="2">Toutes les 2 minutes</option>
                    <option value="5">Toutes les 5 minutes</option>
                    <option value="10">Toutes les 10 minutes (Recommandé)</option>
                    <option value="30">Toutes les 30 minutes</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-900 dark:text-white block mb-2">Message de relance WhatsApp</label>
                  <textarea value={settings.CRON_WAKEUP_MESSAGE} onChange={(e) => updateSetting('CRON_WAKEUP_MESSAGE', e.target.value)} placeholder="Debout {{name}} ! Il y a {{count}} commande(s)..." className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-4 text-sm focus:border-[#162d3e] outline-none dark:text-white resize-none" rows="4"></textarea>
                  <p className="text-xs text-slate-500 mt-2">Variables : <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{"{{name}}"}</code> et <code className="bg-slate-100 dark:bg-slate-700 px-1 rounded">{"{{count}}"}</code></p>
                </div>
              </div>
            </div>
          )}

          {/* 2. ONGLET FINANCE */}
          {activeTab === 'finance' && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-lg"><Wallet size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Frais & Commissions standards</h2>
                  <p className="text-sm text-slate-500">Ces valeurs sont appliquées par défaut aux nouvelles zones.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white">Frais de livraison client ($)</label>
                  <input type="number" step="0.5" value={settings.DEFAULT_DELIVERY_FEE} onChange={(e) => updateSetting('DEFAULT_DELIVERY_FEE', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold focus:border-[#162d3e] outline-none dark:text-white" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="space-y-2">
                  <label className="font-bold text-[#162d3e] dark:text-[#f4c414]">Marge Flashkin ($)</label>
                  <input type="number" step="0.5" value={settings.FLASHKIN_COMMISSION} onChange={(e) => updateSetting('FLASHKIN_COMMISSION', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-3.5 text-sm font-bold outline-none dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-emerald-600">Part Livreur ($)</label>
                  <input type="number" step="0.5" value={settings.FLASHMAN_COMMISSION} onChange={(e) => updateSetting('FLASHMAN_COMMISSION', e.target.value)} className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl p-3.5 text-sm font-bold outline-none dark:text-white" />
                </div>
              </div>
            </div>
          )}

          {/* 3. ONGLET PLATEFORME & BRANDING */}
          {activeTab === 'platform' && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-lg"><PaintBucket size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Identité de la plateforme</h2>
                  <p className="text-sm text-slate-500">Gérez le nom, les couleurs et l'état de l'application.</p>
                </div>
              </div>

              <div className="flex items-center justify-between p-5 border border-rose-200 dark:border-rose-900/50 rounded-xl bg-rose-50 dark:bg-rose-900/10">
                <div>
                  <h3 className="font-bold text-rose-700 dark:text-rose-400">Mode Maintenance</h3>
                  <p className="text-sm text-rose-600/80 mt-1">Coupe l'accès aux partenaires et livreurs (Sauf Admin).</p>
                </div>
                <button onClick={() => toggleSetting('MAINTENANCE_MODE')} className={`transition-colors ${settings.MAINTENANCE_MODE === 'true' ? 'text-rose-600' : 'text-rose-300'}`}>
                  {settings.MAINTENANCE_MODE === 'true' ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white">Nom de la Plateforme</label>
                  <input type="text" value={settings.PLATFORM_NAME} onChange={(e) => updateSetting('PLATFORM_NAME', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold focus:border-[#162d3e] outline-none dark:text-white" />
                </div>
                <div className="space-y-2">
                  <label className="font-bold text-slate-900 dark:text-white">Couleur Primaire (HEX)</label>
                  <div className="flex gap-3">
                    <input type="color" value={settings.BRAND_COLOR} onChange={(e) => updateSetting('BRAND_COLOR', e.target.value)} className="h-12 w-12 rounded-xl cursor-pointer bg-transparent" />
                    <input type="text" value={settings.BRAND_COLOR} onChange={(e) => updateSetting('BRAND_COLOR', e.target.value)} className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold outline-none dark:text-white" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. ONGLET EMAILS SYSTÈME */}
          {activeTab === 'email' && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-lg"><Mail size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Configurations Email</h2>
                  <p className="text-sm text-slate-500">Adresse d'expédition et modèles par défaut.</p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-900 dark:text-white">Adresse d'expédition (Sender)</label>
                <input type="email" value={settings.SYSTEM_EMAIL_SENDER} onChange={(e) => updateSetting('SYSTEM_EMAIL_SENDER', e.target.value)} className="w-full md:w-1/2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold focus:border-[#162d3e] outline-none dark:text-white" />
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-900 dark:text-white">Sujet de l'email de bienvenue</label>
                <input type="text" value={settings.EMAIL_WELCOME_SUBJECT} onChange={(e) => updateSetting('EMAIL_WELCOME_SUBJECT', e.target.value)} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3.5 text-sm font-bold outline-none dark:text-white" />
              </div>
            </div>
          )}

          {/* 5. ONGLET SÉCURITÉ & PERMISSIONS */}
          {activeTab === 'security' && (
            <div className="p-8 space-y-8 animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-100 dark:border-slate-700">
                <div className="p-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg"><ShieldCheck size={24} /></div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 dark:text-white">Rôles & Permissions</h2>
                  <p className="text-sm text-slate-500">Contrôlez les accès à votre infrastructure.</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Inscription publique des partenaires</h3>
                    <p className="text-sm text-slate-500 mt-1">Autoriser les clients à créer un compte depuis la page d'accueil.</p>
                  </div>
                  <button onClick={() => toggleSetting('ALLOW_PARTNER_REGISTRATION')} className={`transition-colors ${settings.ALLOW_PARTNER_REGISTRATION === 'true' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {settings.ALLOW_PARTNER_REGISTRATION === 'true' ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                  </button>
                </div>

                <div className="flex items-center justify-between p-5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900">
                  <div>
                    <h3 className="font-bold text-slate-900 dark:text-white">Validation automatique des livreurs</h3>
                    <p className="text-sm text-slate-500 mt-1">Les livreurs peuvent opérer immédiatement sans validation admin.</p>
                  </div>
                  <button onClick={() => toggleSetting('AUTO_APPROVE_DRIVERS')} className={`transition-colors ${settings.AUTO_APPROVE_DRIVERS === 'true' ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {settings.AUTO_APPROVE_DRIVERS === 'true' ? <ToggleRight size={48} /> : <ToggleLeft size={48} />}
                  </button>
                </div>
              </div>
              
            </div>
          )}

        </div>
      </div>
    </div>
  );
}