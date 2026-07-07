import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { User, Store, Shield, Bell, Smartphone, Lock } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
 const [formData, setFormData] = useState({
  firstName: '', lastName: '', email: '', phone: '', storeName: '', avatarUrl: ''
});
  const [passwordData, setPasswordData] = useState({
    oldPassword: '', newPassword: '', confirmPassword: ''
  });

  const [whatsappEnabled, setWhatsappEnabled] = useState(true);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://flashkindelivery-back-end.onrender.com/api/users/profile', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        const { firstName, lastName, email, phone, storeName, avatarUrl } = res.data.user;
        const profileData = { firstName, lastName, email, phone: phone || '', storeName: storeName || '', avatarUrl: avatarUrl || '' };
        setFormData(profileData);
        updateUser(profileData);
      }
    } catch (error) {
      console.error(error); // Pour voir l'erreur exacte dans la console F12
      toast.error('Erreur de chargement du profil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://flashkindelivery-back-end.onrender.com/api/users/profile', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      updateUser({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        storeName: formData.storeName,
        avatarUrl: formData.avatarUrl
      });
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      return toast.error('Les mots de passe ne correspondent pas');
    }
    setIsSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put('https://flashkindelivery-back-end.onrender.com/api/users/password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Mot de passe sécurisé !');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Erreur');
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    if (!formData.firstName) return '...';
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto pb-20 md:pb-10">
      
      {/* HEADER PROFIL AMÉLIORÉ */}
<div className="bg-white dark:bg-[#0f1f2d] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center gap-6 mb-8 transition-colors">
  <div className="relative group">
    <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-br from-flashkin-blue to-[#1e3a8a] flex items-center justify-center text-white text-3xl font-black shadow-lg">
      {formData.avatarUrl ? (
        <img src={formData.avatarUrl} alt="Profil" className="w-full h-full object-cover" />
      ) : (
        getInitials()
      )}
    </div>
  </div>
  <div>
    <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
      {formData.firstName} {formData.lastName}
    </h1>
    <p className="text-gray-500 dark:text-gray-400 font-medium mt-1">{formData.storeName || 'Partenaire Flashkin'}</p>
  </div>
</div>
      <div className="flex flex-col md:flex-row gap-8">
        
        {/* MENU LATÉRAL */}
        <div className="w-full md:w-64 flex flex-col gap-2">
          <button 
            onClick={() => setActiveTab('general')}
            className={`p-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${activeTab === 'general' ? 'bg-flashkin-blue text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <User size={20} /> Informations
          </button>
          <button 
            onClick={() => setActiveTab('store')}
            className={`p-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${activeTab === 'store' ? 'bg-flashkin-blue text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Store size={20} /> Ma Boutique
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`p-4 rounded-2xl flex items-center gap-3 font-bold transition-all ${activeTab === 'security' ? 'bg-flashkin-blue text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
          >
            <Shield size={20} /> Sécurité
          </button>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="flex-1">
          
          {/* ONGLET 1 : INFORMATIONS */}
          {activeTab === 'general' && (
            <div className="bg-white dark:bg-[#0f1f2d] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><User size={24} className="text-flashkin-blue"/> Données Personnelles</h2>
              <form onSubmit={handleProfileUpdate} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Prénom</label>
                    <input type="text" value={formData.firstName} onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" required />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Nom</label>
                    <input type="text" value={formData.lastName} onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" required />
                  </div>
                </div>
                
                <div>
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Adresse Email (Non modifiable)</label>
                  <input type="email" value={formData.email} disabled className="w-full p-4 bg-gray-100 dark:bg-gray-900 text-gray-400 dark:text-gray-600 border-none rounded-2xl cursor-not-allowed font-semibold" />
                </div>

                <div>
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Téléphone (Contact Livreur)</label>
                  <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} placeholder="Ex: 0820000000" className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" />
                
                <div>
                  
  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">URL de la Photo de profil</label>
  <input 
    type="text" 
    value={formData.avatarUrl} 
    onChange={(e) => setFormData({...formData, avatarUrl: e.target.value})} 
    placeholder="https://lien-vers-votre-photo.jpg" 
    className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" 
  />
</div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isSaving} className="bg-flashkin-blue text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg">
                    {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ONGLET 2 : BOUTIQUE & NOTIFICATIONS */}
          {activeTab === 'store' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white dark:bg-[#0f1f2d] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 transition-colors">
                <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Store size={24} className="text-flashkin-blue"/> Identité Commerciale</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className="mb-6">
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Nom de la Marque / Boutique</label>
                    <input type="text" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} placeholder="Ex: Flashkin Express" className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" />
                    <p className="text-xs text-gray-400 mt-2">Ce nom apparaîtra sur les liens de suivi publics envoyés à vos clients.</p>
                  </div>
                  <div className="flex justify-end">
                    <button type="submit" disabled={isSaving} className="bg-flashkin-blue text-white px-8 py-4 rounded-2xl font-black hover:opacity-90 transition-opacity shadow-lg">Enregistrer</button>
                  </div>
                </form>
              </div>

              {/* SECTION SYSTÈME */}
              <div className="bg-gradient-to-br from-[#0f1f2d] to-flashkin-blue dark:from-[#0a151f] dark:to-[#1e3a8a] rounded-[2rem] p-8 text-white shadow-lg">
                <h2 className="text-xl font-black mb-6 flex items-center gap-2 text-flashkin-yellow"><Bell size={24} /> Écosystème & Notifications</h2>
                
                <div className="flex items-center justify-between p-4 bg-white/10 rounded-2xl backdrop-blur-sm border border-white/10">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366]">
                      <Smartphone size={20} />
                    </div>
                    <div>
                      <p className="font-bold">Notifications WhatsApp</p>
                      <p className="text-xs text-blue-200">Alertes temps réel (Powered by Whatixo)</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    className={`w-14 h-8 rounded-full p-1 transition-colors ${whatsappEnabled ? 'bg-[#25D366]' : 'bg-gray-600'}`}
                  >
                    <div className={`w-6 h-6 bg-white rounded-full transition-transform ${whatsappEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ONGLET 3 : SÉCURITÉ */}
          {activeTab === 'security' && (
            <div className="bg-white dark:bg-[#0f1f2d] rounded-[2rem] p-8 shadow-sm border border-gray-100 dark:border-gray-800 animate-fade-in transition-colors">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2"><Shield size={24} className="text-flashkin-blue"/> Sécurité du compte</h2>
              <form onSubmit={handlePasswordUpdate} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Mot de passe actuel</label>
                  <input type="password" required value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-50 dark:border-gray-800">
                  <div>
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Nouveau mot de passe</label>
                    <input type="password" required value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" />
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase mb-2 block">Confirmer le mot de passe</label>
                    <input type="password" required value={passwordData.confirmPassword} onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} className="w-full p-4 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-none rounded-2xl focus:ring-4 focus:ring-flashkin-blue/10 outline-none font-semibold transition-all" />
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button type="submit" disabled={isSaving} className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-2xl font-black hover:bg-black dark:hover:bg-gray-200 transition-colors shadow-lg flex items-center gap-2">
                    <Lock size={18} /> Mettre à jour
                  </button>
                </div>
              </form>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}