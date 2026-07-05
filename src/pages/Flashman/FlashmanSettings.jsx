import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  User, Phone, Camera, Bell, Globe, Lock,
  LifeBuoy, LogOut, Save, ChevronRight, Loader2, ShieldCheck, X, AlertTriangle, CheckCircle
} from 'lucide-react';
import axios from 'axios';

export default function FlashmanSettings() {
  const { user, logout, updateUser } = useAuth(); 
  const fileInputRef = useRef(null);

  const getInitials = (firstName, lastName) => {
    const first = firstName?.charAt(0) || '';
    const last = lastName?.charAt(0) || '';
    return (first + last || 'F').toUpperCase();
  };

  // États de chargement
  const [isLoading, setIsLoading] = useState(false);
  const [isAiProcessing, setIsAiProcessing] = useState(false);

  // Fenêtres modales
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [aiReportResult, setAiReportResult] = useState(null);

  // Données de formulaires
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    avatarUrl: ''
  });

  const [popup, setPopup] = useState({ isOpen: false, type: 'success', message: '' });

  const showPopup = (message, type = 'success') => {
    setPopup({ isOpen: true, type, message });
    window.clearTimeout(window.flashmanSettingsPopupTimer);
    window.flashmanSettingsPopupTimer = window.setTimeout(() => {
      setPopup((current) => ({ ...current, isOpen: false }));
    }, 3800);
  };

  // 👇 SYNCHRONISATION PARFAITE : Met à jour les données dès que le contexte Auth est prêt
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
        avatarUrl: user.avatarUrl || ''
      });
    }
  }, [user]);

  useEffect(() => {
    if (profileData.avatarUrl) {
      updateUser({
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone,
        avatarUrl: profileData.avatarUrl
      });
    }
  }, [profileData.avatarUrl]);

  const [passwordData, setPasswordData] = useState({ oldPassword: '', newPassword: '' });
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState('Français');

  // Système d'urgence IA (Questionnaire à étapes)
  const [emergencyStep, setEmergencyStep] = useState(0); 
  const [selectedCategory, setSelectedCategory] = useState('');
  const [currentAnswers, setCurrentAnswers] = useState([]);

  // Questions dynamiques de l'IA
  const emergencyQuestions = {
    'Accident / Panne': [
      "Où vous situez-vous exactement (Commune / Avenue / Référence) ?",
      "La moto est-elle immobilisée ou capable de rouler ?",
      "Y a-t-il des blessés ou des dégâts corporels ?",
      "Avez-vous le colis du client sécurisé avec vous ?"
    ],
    'Agression / Vol': [
      "Êtes-vous actuellement en lieu sûr ou toujours en danger ?",
      "Que vous a-t-on dérobé (Moto, Colis, Recettes de la journée) ?",
      "Pouvez-vous identifier des témoins ou une patrouille de police proche ?",
      "Avez-vous besoin d'une assistance médicale immédiate ?"
    ],
    'Problème Client / COD': [
      "Quel est le numéro de référence de la commande concernée ?",
      "Le client refuse-t-il de payer le produit ou les frais de livraison ?",
      "Le client profère-t-il des menaces ou bloque-t-il le colis ?",
      "Avez-vous tenté de joindre le partenaire expéditeur ?"
    ]
  };

  // --- TRAITEMENT DE L'AVATAR EN BASE64 ---
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        return showPopup("L'image est trop lourde (Max 2 Mo).", 'error');
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData({ ...profileData, avatarUrl: reader.result });
        showPopup("Photo chargée ! Cliquez sur Enregistrer pour la fixer.", 'success');
      };
      reader.readAsDataURL(file);
    }
  };

  // --- SAUVEGARDE DU PROFIL ---
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/users/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        updateUser({
          firstName: profileData.firstName,
          lastName: profileData.lastName,
          phone: profileData.phone,
          avatarUrl: profileData.avatarUrl
        });
        showPopup("Profil et photo enregistrés définitivement ! 📸", 'success');
      }
    } catch (error) {
      showPopup("Erreur lors de la sauvegarde du profil.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- MODIFICATION DU MOT DE PASSE ---
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!passwordData.oldPassword || !passwordData.newPassword) return showPopup("Remplissez tous les champs.", 'error');
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.put('http://localhost:3000/api/users/change-password', passwordData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        showPopup(response.data.message || "Mot de passe modifié avec succès.", 'success');
        setPasswordData({ oldPassword: '', newPassword: '' });
      }
    } catch (error) {
      showPopup(error.response?.data?.message || "Échec de modification.", 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // --- FLUX DE L'INTERCOM D'URGENCE IA ---
  const startEmergencyWorkflow = (category) => {
    setSelectedCategory(category);
    setEmergencyStep(1);
    setCurrentAnswers([]);
  };

  const handleAnswerSubmit = (answerText) => {
    const currentQuestions = emergencyQuestions[selectedCategory];
    const newAnswers = [...currentAnswers, { question: currentQuestions[emergencyStep - 1], answer: answerText }];
    setCurrentAnswers(newAnswers);

    if (emergencyStep < currentQuestions.length) {
      setEmergencyStep(emergencyStep + 1);
    } else {
      submitEmergencyToAi(newAnswers);
    }
  };

  const submitEmergencyToAi = async (finalAnswers) => {
    setIsAiProcessing(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/ai/emergency', {
        category: selectedCategory,
        responses: finalAnswers
      }, { headers: { Authorization: `Bearer ${token}` } });

      if (response.data.success) {
        setAiReportResult(response.data.summary);
      }
    } catch (error) {
      showPopup("Erreur de transmission réseau.", 'error');
    } finally {
      setIsAiProcessing(false);
    }
  };

  const closeEmergencyModal = () => {
    setIsAiModalOpen(false);
    setEmergencyStep(0);
    setAiReportResult(null);
  };

  return (
    <>
      {popup.isOpen && (
        <div className="fixed inset-x-0 top-6 z-50 flex justify-center px-4 pointer-events-none">
          <div className={`pointer-events-auto max-w-sm w-full rounded-3xl border px-5 py-4 shadow-2xl transition-all ${popup.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-900 dark:bg-emerald-900/90 dark:border-emerald-700 dark:text-emerald-100' : 'bg-rose-50 border-rose-200 text-rose-900 dark:bg-rose-900/90 dark:border-rose-700 dark:text-rose-100'}`}>
            <div className="flex items-center gap-3">
              {popup.type === 'success' ? <CheckCircle className="text-emerald-500 dark:text-emerald-200" size={20} /> : <AlertTriangle className="text-rose-500 dark:text-rose-200" size={20} />}
              <p className="text-sm font-semibold leading-tight">{popup.message}</p>
            </div>
          </div>
        </div>
      )}
      <div className="animate-fade-in w-full max-w-2xl mx-auto p-4 md:p-8 space-y-6 pb-24 font-sans text-gray-800 dark:text-gray-100">
      
      {/* CARD COMPLEMENTAIRE : AVATAR PERSISTANT */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-24 bg-flashkin-dark"></div>
        
        <div className="relative mt-8 mb-4">
          <div className="w-24 h-24 rounded-full border-4 border-white dark:border-gray-800 bg-gray-200 dark:bg-gray-700 overflow-hidden shadow-lg relative group flex items-center justify-center">
            {profileData.avatarUrl ? (
              <img src={profileData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-flashkin-blue text-white text-3xl font-bold">
                {getInitials(profileData.firstName, profileData.lastName)}
              </div>
            )}
            <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
              <Camera className="text-white" size={24} />
            </div>
            <input type="file" ref={fileInputRef} onChange={handleImageChange} accept="image/*" className="hidden" />
          </div>
        </div>

        <h2 className="text-2xl font-black text-gray-900 dark:text-white">{profileData.firstName} {profileData.lastName}</h2>
        <div className="flex items-center gap-1.5 text-sm font-bold text-[#7eba3d] mt-1 bg-[#7eba3d]/10 px-3 py-1 rounded-full">
          <ShieldCheck size={16} /> Flashman Enregistré
        </div>
      </div>

      {/* FORMULAIRE 1 : COMPTE & COORDONNÉES */}
      <form onSubmit={handleSaveProfile} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><User size={18} className="text-flashkin-blue" /> Éditer l'identité</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <input type="text" value={profileData.firstName} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium" placeholder="Prénom" />
          <input type="text" value={profileData.lastName} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium" placeholder="Nom" />
        </div>
        <div className="relative">
          <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full pl-11 p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" placeholder="Numéro de contact" />
        </div>
        <button type="submit" disabled={isLoading} className="w-full bg-flashkin-blue text-white font-bold py-3.5 rounded-xl text-xs shadow-md flex justify-center items-center gap-2">
          {isLoading ? <Loader2 className="animate-spin" size={16} /> : <><Save size={16} /> ENREGISTRER MON PROFIL</>}
        </button>
      </form>

      {/* FORMULAIRE 2 : SÉCURITÉ DU MOT DE PASSE */}
      <form onSubmit={handlePasswordChange} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Lock size={18} className="text-flashkin-blue" /> Sécurité du compte</h3>
        <input type="password" value={passwordData.oldPassword} onChange={(e) => setPasswordData({...passwordData, oldPassword: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" placeholder="Ancien mot de passe" />
        <input type="password" value={passwordData.newPassword} onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} className="w-full p-3.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl text-sm" placeholder="Nouveau mot de passe" />
        <button type="submit" disabled={isLoading} className="w-full bg-flashkin-dark text-flashkin-yellow font-bold py-3.5 rounded-xl text-xs shadow-md">
          MODIFIER MON MOT DE PASSE
        </button>
      </form>

      {/* PRÉFÉRENCES & MULTI-LANGUE REEL */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 space-y-4 relative">
        <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2"><Globe size={18} className="text-flashkin-blue" /> Préférences de l'application</h3>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-[#7eba3d]" />
            <span className="text-sm font-semibold">Alertes de nouvelles courses (Radar)</span>
          </div>
          <button onClick={() => { setNotificationsEnabled(!notificationsEnabled); showPopup(notificationsEnabled ? "Alertes sonores coupées" : "Alertes instantanées actives 🔔", 'success'); }} className={`w-10 h-5 rounded-full p-0.5 transition-colors ${notificationsEnabled ? 'bg-[#7eba3d]' : 'bg-gray-300'}`}>
            <div className={`bg-white w-4 h-4 rounded-full shadow transform transition-transform ${notificationsEnabled ? 'translate-x-5' : 'translate-x-0'}`}></div>
          </button>
        </div>

        {/* MENU DEROULANT INTERACTIF DE LANGUE */}
        <div className="relative">
          <div onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
            <div className="flex items-center gap-3"><Globe size={18} className="text-blue-500" /><span className="text-sm font-semibold">Langue d'affichage</span></div>
            <span className="text-sm font-bold text-gray-500 flex items-center gap-1">{language} <ChevronRight size={14} className={`transform transition-transform ${isLangDropdownOpen ? 'rotate-90' : ''}`} /></span>
          </div>
          {isLangDropdownOpen && (
            <div className="absolute right-0 left-0 mt-2 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl z-40 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {['Français', 'English', 'Lingala'].map(lang => (
                <div key={lang} onClick={() => { setLanguage(lang); setIsLangDropdownOpen(false); showPopup(`Application configurée en : ${lang}`, 'success'); }} className="p-3 text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
                  {lang}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* BOUTONS ACTIONS RAPIDES FIELD SUPPORT */}
      <div className="space-y-3">
        <button type="button" onClick={() => setIsAiModalOpen(true)} className="w-full bg-red-50 hover:bg-red-100 border border-red-100 text-red-600 font-bold py-4 rounded-2xl flex justify-between items-center px-5 shadow-sm">
          <div className="flex items-center gap-3"><LifeBuoy size={20} /> <span className="text-sm">Assistance & Urgence IA (Terrain)</span></div>
          <ChevronRight size={18} />
        </button>
        <button type="button" onClick={logout} className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-bold py-4 rounded-2xl flex justify-center items-center gap-2 text-sm">
          <LogOut size={16} /> SE DÉCONNECTER
        </button>
      </div>

      {/* =========================================
          MODAL INTERACTIF : INTERCOM URGENCE IA
          ========================================= */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-3xl shadow-2xl p-6 flex flex-col max-h-[85vh]">
            <div className="flex justify-between items-center border-b pb-3 mb-4">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2"><AlertTriangle className="text-red-500" /> Cellule de Crise IA</h3>
              <button onClick={closeEmergencyModal} className="text-gray-400"><X size={20} /></button>
            </div>

            <div className="overflow-y-auto flex-1 pr-1">
              {emergencyStep === 0 && !aiReportResult && (
                // ÉTAPE 0 : CHOIX DE LA CATÉGORIE
                <div className="space-y-4">
                  <p className="text-sm text-gray-500">Sélectionnez la nature de l'incident. L'IA va vous guider à travers quelques questions pour analyser l'urgence.</p>
                  {['Accident / Panne', 'Agression / Vol', 'Problème Client / COD'].map(cat => (
                    <button key={cat} onClick={() => startEmergencyWorkflow(cat)} className="w-full p-4 border border-gray-100 dark:border-gray-800 rounded-xl font-bold text-left hover:border-red-400 hover:bg-red-50/10 transition-all flex justify-between items-center text-sm">
                      {cat} <ChevronRight size={16} className="text-gray-400" />
                    </button>
                  ))}
                </div>
              )}

              {emergencyStep > 0 && !aiReportResult && (
                // ÉTAPES INTERMÉDIAIRES : LA ZONE DE TEXTE AU LIEU DES BOUTONS OUI/NON 👇
                <div className="space-y-5">
                  <div className="flex justify-between items-center text-xs text-gray-400 font-bold uppercase">
                    <span>Situation : {selectedCategory}</span>
                    <span>Question {emergencyStep} / {emergencyQuestions[selectedCategory].length}</span>
                  </div>
                  
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <p className="font-bold text-gray-900 dark:text-white text-sm leading-relaxed">{emergencyQuestions[selectedCategory][emergencyStep - 1]}</p>
                  </div>

                  {isAiProcessing ? (
                    <div className="flex flex-col items-center py-8 gap-3">
                      <Loader2 className="animate-spin text-red-500" size={32} />
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">L'IA rédige le rapport d'incident...</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <textarea 
                        id="emergency-answer"
                        rows="3"
                        placeholder="Tapez votre réponse ici..." 
                        onKeyDown={(e) => { 
                          if(e.key === 'Enter' && !e.shiftKey && e.target.value.trim()) { 
                            e.preventDefault();
                            handleAnswerSubmit(e.target.value); 
                            e.target.value = ''; 
                          } 
                        }} 
                        className="w-full p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none" 
                      />
                      <button 
                        onClick={() => {
                          const input = document.getElementById('emergency-answer');
                          if(input.value.trim()) {
                            handleAnswerSubmit(input.value);
                            input.value = '';
                          } else {
                            showPopup("Veuillez écrire une réponse.", 'error');
                          }
                        }}
                        className="w-full bg-flashkin-dark text-flashkin-yellow font-bold py-3.5 rounded-xl text-xs flex justify-center items-center shadow-md hover:bg-black transition-colors"
                      >
                        VALIDER LA RÉPONSE <ChevronRight size={16} className="ml-1" />
                      </button>
                    </div>
                  )}
                </div>
              )}

              {aiReportResult && (
                // ÉTAPE FINALE : AFFICHAGE DU DIAGNOSTIC DE L'IA
                <div className="space-y-4">
                  <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-500"><CheckCircle size={28} /></div>
                  <h4 className="font-bold text-center text-sm text-gray-900 dark:text-white">Rapport analysé et transmis !</h4>
                  
                  <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-xs overflow-x-auto whitespace-pre-wrap max-h-[250px] border border-gray-800 leading-relaxed">
                    {aiReportResult}
                  </div>
                  
                  <p className="text-xs text-center text-gray-500">L'alerte a été transmise à Landry Emil (CEO fl/Logistique) par protocole automatisé.</p>
                  
                  <button onClick={closeEmergencyModal} className="w-full bg-flashkin-dark text-flashkin-yellow font-bold py-3 rounded-xl text-xs">
                    FERMER LA CELLULE DE CRISE
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
    </>
  );
}