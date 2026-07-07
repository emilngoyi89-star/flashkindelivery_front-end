import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { 
  Mail, Lock, Eye, EyeOff, User, Phone, Briefcase, ArrowRight, 
  ShieldCheck, X, FileText, LockKeyhole, MapPin, Wallet, Bot, AlertTriangle, CheckCircle2 
} from 'lucide-react';
import ActionModal from '../components/ActionModal';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '', role: 'PARTNER'
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [activeTab, setActiveTab] = useState('terms'); // 'terms' ou 'privacy'

  const [modal, setModal] = useState({ isOpen: false, status: 'idle', message: '' });
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!acceptTerms) {
      toast.error("Vous devez accepter les conditions générales pour continuer.");
      return;
    }

    setModal({ isOpen: true, status: 'loading', message: 'Création de votre compte...' });

    try {
      const response = await axios.post('https://flashkin-api.onrender.com/api/auth/register', formData);
      if (response.data.success) {
        setModal({ isOpen: true, status: 'success', message: response.data.message });
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      setModal({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Erreur lors de la création.' });
      setTimeout(() => setModal({ ...modal, isOpen: false }), 2500);
    }
  };

  const handleGoogleRegister = () => {
    toast.error("L'inscription Google sera bientôt disponible !");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 relative font-sans">
      
      <ActionModal isOpen={modal.isOpen} status={modal.status} message={modal.message} />

      {/* --- MODALE DES CONDITIONS & CONFIDENTIALITÉ (TRUST CENTER) --- */}
      {showTermsModal && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 md:p-6">
          <div className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm transition-opacity" onClick={() => setShowTermsModal(false)}></div>
          
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col animate-scale-up overflow-hidden">
            
            {/* Header Modale */}
            <div className="p-5 md:px-8 md:py-6 border-b border-gray-100 flex justify-between items-center bg-[#162d3e] text-white">
              <div>
                <h3 className="font-black text-xl flex items-center gap-2">
                  <ShieldCheck size={24} className="text-flashkin-yellow" /> 
                  Engagements & Politiques Flashkin
                </h3>
                <p className="text-sm text-gray-300 mt-1 hidden md:block">Veuillez lire attentivement nos conditions avant de rejoindre la plateforme.</p>
              </div>
              <button onClick={() => setShowTermsModal(false)} className="text-white/70 hover:text-white transition-colors bg-white/10 p-2 rounded-full hover:bg-white/20">
                <X size={24}/>
              </button>
            </div>

            {/* Système d'onglets */}
            <div className="flex border-b border-gray-200 bg-gray-50 px-4 md:px-8">
              <button 
                onClick={() => setActiveTab('terms')}
                className={`py-4 px-2 mr-6 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'terms' ? 'border-flashkin-blue text-flashkin-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <FileText size={18} /> Conditions d'utilisation
              </button>
              <button 
                onClick={() => setActiveTab('privacy')}
                className={`py-4 px-2 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'privacy' ? 'border-flashkin-blue text-flashkin-blue' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                <LockKeyhole size={18} /> Politique de confidentialité
              </button>
            </div>

            {/* Contenu Scrollable */}
            <div className="p-6 md:p-8 overflow-y-auto text-gray-600 space-y-8 flex-1 custom-scrollbar bg-white">
              
              {activeTab === 'terms' ? (
                <div className="space-y-6 animate-fade-in">
                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-3"><User size={20} className="text-flashkin-blue"/> 1. Votre Compte & Responsabilités</h4>
                    <p className="text-sm leading-relaxed mb-2">Pour garantir un écosystème sûr, vous vous engagez à :</p>
                    <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-600 marker:text-flashkin-blue">
                      <li>Fournir des informations exactes et vérifiables lors de votre inscription.</li>
                      <li>Maintenir la sécurité et la confidentialité de votre mot de passe. Vous êtes responsable de toute activité générée depuis votre compte.</li>
                      <li><strong>Utilisation acceptable :</strong> La création de fausses commandes, l'usurpation d'identité ou la fraude entraîneront la suspension immédiate du compte et des poursuites.</li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-3"><MapPin size={20} className="text-flashkin-blue"/> 2. Suivi et Exécution des Livraisons</h4>
                    <p className="text-sm leading-relaxed mb-3">Le système Flashkin offre une transparence totale. Le cycle d'une commande se déroule comme suit :</p>
                    <div className="bg-blue-50/50 p-4 rounded-xl text-sm font-medium text-flashkin-dark flex flex-wrap items-center gap-2 mb-4">
                      <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">Commande créée</span>
                      <ArrowRight size={16} className="text-flashkin-blue"/>
                      <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">Livreur assigné</span>
                      <ArrowRight size={16} className="text-flashkin-blue"/>
                      <span className="bg-white px-3 py-1 rounded-md shadow-sm border border-blue-100">En route</span>
                      <ArrowRight size={16} className="text-flashkin-blue"/>
                      <span className="bg-green-100 text-green-800 px-3 py-1 rounded-md shadow-sm">Livraison effectuée</span>
                    </div>
                    <p className="text-sm"><strong>Preuve de livraison :</strong> Chaque livraison validée requiert un horodatage précis et une géolocalisation pour protéger à la fois le partenaire et le Flashman.</p>
                  </section>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-3"><Bot size={20} className="text-flashkin-blue"/> 3. L'Assistant IA Flashkin</h4>
                    <p className="text-sm leading-relaxed mb-2">Notre IA est conçue pour simplifier la création de vos commandes. Vous pouvez copier-coller un texte informel (ex: <em>"Livraison pour Emil à Gombe, 099999999, 25$"</em>) et l'IA en extraira les données.</p>
                    <div className="bg-yellow-50 border-l-4 border-flashkin-yellow p-3 text-sm text-yellow-800">
                      <strong>Attention :</strong> L'utilisateur reste responsable de vérifier les données extraites par l'IA avant la validation finale de la commande.
                    </div>
                  </section>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-3"><Wallet size={20} className="text-flashkin-blue"/> 4. Gestion Financière & Portefeuille</h4>
                    <ul className="list-disc pl-5 text-sm space-y-1.5 text-gray-600 marker:text-flashkin-blue">
                      <li><strong>Encaissement :</strong> Les fonds issus du Cash on Delivery (COD) sont sécurisés et crédités virtuellement sur votre Portefeuille Flashkin.</li>
                      <li><strong>Retraits :</strong> Vous pouvez demander un retrait vers Mobile Money ou en espèces. Le traitement est validé par nos administrateurs sous 24h ouvrées.</li>
                    </ul>
                  </section>
                  
                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg flex items-center gap-2 mb-3"><AlertTriangle size={20} className="text-flashkin-blue"/> 5. Litiges</h4>
                    <p className="text-sm leading-relaxed">En cas de problème (colis endommagé, retard extrême), un signalement peut être ouvert depuis l'application. Notre équipe mènera une enquête basée sur les historiques GPS et les preuves de livraison pour définir les responsabilités.</p>
                  </section>
                </div>
              ) : (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-gray-50 p-4 rounded-xl mb-6">
                    <p className="text-sm text-gray-700">
                      Chez Flashkin Delivery, nous traitons vos données avec le même soin que vos colis. Cette politique explique exactement ce que nous collectons et pourquoi.
                    </p>
                  </div>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-3">1. Les données que nous collectons</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div className="border border-gray-100 p-4 rounded-lg bg-white shadow-sm">
                        <strong className="text-flashkin-blue block mb-2">Informations personnelles</strong>
                        Nom, adresse e-mail, numéro de téléphone, rôle (Partenaire ou Flashman).
                      </div>
                      <div className="border border-gray-100 p-4 rounded-lg bg-white shadow-sm">
                        <strong className="text-flashkin-blue block mb-2">Données opérationnelles</strong>
                        Localisation GPS (pour le suivi et les preuves de livraison), historique des commandes, données de l'appareil (connexions).
                      </div>
                    </div>
                  </section>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-3">2. Pourquoi collectons-nous ces données ?</h4>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Exécution des services :</strong> Pour que les livreurs trouvent vos clients et que vous puissiez suivre vos colis en temps réel.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Sécurité & Finance :</strong> Pour vérifier l'identité lors des demandes de retrait de votre portefeuille et éviter les fraudes.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 size={18} className="text-green-500 shrink-0 mt-0.5" />
                        <span><strong>Amélioration via l'IA :</strong> Les données de commande nous aident à entraîner l'Assistant IA pour le rendre plus précis dans la reconnaissance d'adresses.</span>
                      </li>
                    </ul>
                  </section>

                  <section>
                    <h4 className="font-extrabold text-gray-900 text-lg mb-3">3. Protection et Sécurité</h4>
                    <p className="text-sm leading-relaxed">
                      Toutes vos données de session et vos mots de passe sont <strong>chiffrés</strong>. L'accès à vos informations financières (Portefeuille) est soumis à des vérifications strictes. Nos administrateurs n'ont accès qu'aux données strictement nécessaires à la résolution des litiges et à la validation des transactions.
                    </p>
                  </section>
                </div>
              )}

            </div>

            {/* Footer de la modale avec bouton d'action */}
            <div className="p-4 md:p-6 border-t border-gray-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] z-20">
              <p className="text-xs text-gray-500 text-center sm:text-left">
                En cliquant sur "J'accepte", vous validez les Conditions et la Politique de confidentialité.
              </p>
              <button 
                onClick={() => { 
                  setAcceptTerms(true); 
                  setShowTermsModal(false); 
                  toast.success("Conditions acceptées !");
                }} 
                className="w-full sm:w-auto bg-flashkin-blue text-white px-8 py-3 rounded-xl font-bold hover:bg-[#1a3549] transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                J'ai lu et j'accepte <CheckCircle2 size={18} />
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- RESTE DU FORMULAIRE D'INSCRIPTION (Inchangé visuellement, mais connecté au state) --- */}
      <div className="w-full max-w-lg">
        {/* En-tête / Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-3 mb-6 animate-float-3d group cursor-default">
            <div className="bg-flashkin-blue p-3 rounded-2xl shadow-[0_10px_20px_rgba(36,68,92,0.4)] transition-all duration-300 border-b-[5px] border-r-[3px] border-[#162d3e]">
              <svg className="w-7 h-7 text-flashkin-yellow drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              <span className="text-flashkin-blue" style={{ textShadow: '2px 2px 0px rgba(36,68,92,0.2)' }}>Flashkin</span>{' '}
              <span className="text-flashkin-yellow" style={{ textShadow: '2px 2px 0px rgba(244,196,20,0.4)' }}>Delivery</span>
            </h1>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Créer un compte</h2>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 relative z-10">
          
          <button type="button" onClick={handleGoogleRegister} className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 rounded-xl bg-white hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-flashkin-blue mb-6 font-medium text-gray-700">
            <svg className="w-5 h-5" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" /><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" /><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" /><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" /></svg>
            S'inscrire avec Google
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-400 font-bold text-xs tracking-widest uppercase">Ou par e-mail</span></div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Prénom</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><User className="h-5 w-5 text-gray-400" /></div>
                  <input type="text" required onChange={(e) => setFormData({...formData, firstName: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all" placeholder="Emily" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nom</label>
                <input type="text" required onChange={(e) => setFormData({...formData, lastName: e.target.value})} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all" placeholder="Mibanga" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Adresse e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-gray-400" /></div>
                  <input type="email" required onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all" placeholder="vous@exemple.com" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Téléphone</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Phone className="h-5 w-5 text-gray-400" /></div>
                  <input type="tel" required onChange={(e) => setFormData({...formData, phone: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all" placeholder="0810000000" />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Je suis un...</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Briefcase className="h-5 w-5 text-gray-400" /></div>
                <select onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all appearance-none cursor-pointer">
                  <option value="PARTNER">Client / E-Commerçant (Je veux faire livrer)</option>
                  <option value="FLASHMAN">Livreur Flashman (Je veux travailler)</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Mot de passe sécurisé</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-gray-400" /></div>
                <input type={showPassword ? "text" : "password"} required onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all" placeholder="••••••••" minLength="6" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* CASE À COCHER MISE À JOUR */}
            <div className="flex items-start gap-3 mt-4 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms} 
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-flashkin-blue bg-white border-gray-300 rounded focus:ring-flashkin-blue cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 cursor-pointer flex-1">
                J'ai lu et j'accepte les <button type="button" onClick={() => setShowTermsModal(true)} className="text-flashkin-blue font-extrabold hover:underline">Conditions d'utilisation et la Politique de confidentialité</button> de Flashkin Delivery.
              </label>
            </div>

            {/* Le bouton est désactivé si la case n'est pas cochée */}
            <button type="submit" disabled={modal.status === 'loading' || !acceptTerms} className="w-full bg-flashkin-dark text-white font-bold text-lg py-3.5 mt-4 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 group">
              Créer mon compte <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-gray-600 font-medium">
          Déjà un compte ? <Link to="/login" className="font-bold text-flashkin-blue hover:underline hover:text-flashkin-dark transition-colors">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}