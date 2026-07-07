import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Send, KeyRound, Lock, LogIn, CheckCircle, Eye, EyeOff, AlertCircle, X } from 'lucide-react';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeAction, setActiveAction] = useState(null); // 'reset' ou 'skip' pour savoir quel bouton tourne

  // --- ÉTAT POUR LE POP-UP (MODAL) ---
  const [modal, setModal] = useState({ isOpen: false, type: 'success', message: '' });

  const showModal = (type, message) => {
    setModal({ isOpen: true, type, message });
  };

  const closeModal = () => {
    setModal({ ...modal, isOpen: false });
  };

  // Analyse de la force du mot de passe
  const getPasswordStrength = (password) => {
    if (!password) return { label: '', color: 'bg-gray-200', textColor: 'text-gray-400', width: '0%' };
    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[@$!%*?&_#-]/.test(password)) score++;
    if (password.length >= 12) score++;

    switch (score) {
      case 1: return { label: 'Faible', color: 'bg-red-500', textColor: 'text-red-500', width: '25%' };
      case 2:
      case 3: return { label: 'Normal', color: 'bg-amber-500', textColor: 'text-amber-500', width: '50%' };
      case 4: return { label: 'Fort', color: 'bg-flashkin-blue', textColor: 'text-flashkin-blue', width: '75%' };
      case 5: return { label: 'Très fort', color: 'bg-green-500', textColor: 'text-green-500', width: '100%' };
      default: return { label: 'Faible', color: 'bg-red-500', textColor: 'text-red-500', width: '10%' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('https://flashkindelivery-back-end.onrender.com/api/auth/forgot-password', { email });
      if (response.data.success) {
        setStep(2);
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || "Erreur lors de la demande.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (isSkippingPassword = false) => {
    if (!otp) {
      showModal('error', "Veuillez entrer le code de sécurité à 6 chiffres.");
      return;
    }

    if (!isSkippingPassword) {
      if (!newPassword) {
        showModal('error', "Veuillez saisir un mot de passe.");
        return;
      }
      if (newPassword.length < 8) {
        showModal('error', "Le mot de passe doit faire au moins 8 caractères.");
        return;
      }
      if (newPassword !== confirmPassword) {
        showModal('error', "Les mots de passe ne correspondent pas.");
        return;
      }
    }

    setLoading(true);
    setActiveAction(isSkippingPassword ? 'skip' : 'reset');

    try {
      const payload = {
        email,
        otp,
        newPassword: isSkippingPassword ? null : newPassword
      };

      const response = await axios.post('https://flashkindelivery-back-end.onrender.com/api/auth/reset-password', payload);
      
      if (response.data.success) {
        // Enregistrement de la session
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        // Affichage du pop-up de succès adapté
        const successMessage = isSkippingPassword 
          ? "Connexion réussie via le code !" 
          : "Mot de passe modifié avec succès !";
          
        showModal('success', successMessage);
        
        // Redirection forcée vers le dashboard après 2 secondes (le temps de lire le pop-up)
        setTimeout(() => {
          // Si tu utilises un AuthContext, tu devrais peut-être appeler login(response.data.user) ici
          window.location.href = '/dashboard'; // Force le rechargement de la route protégée pour éviter de retomber sur le login
        }, 2000);
      }
    } catch (err) {
      showModal('error', err.response?.data?.message || "Code invalide ou expiré.");
    } finally {
      setLoading(false);
      setActiveAction(null);
    }
  };

  // Composant Spinner réutilisable
  const Spinner = ({ color = "text-white" }) => (
    <svg className={`animate-spin h-5 w-5 ${color}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 relative font-sans">
      
      {/* --- POP-UP (MODAL) --- */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-60 backdrop-blur-sm p-4 transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl transform scale-100 transition-transform relative text-center flex flex-col items-center animate-fade-in">
            {modal.type === 'error' && (
              <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            )}
            
            {modal.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-5 shadow-inner">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
            )}
            
            <h3 className={`text-xl font-black mb-2 ${modal.type === 'success' ? 'text-gray-900' : 'text-red-600'}`}>
              {modal.type === 'success' ? 'Bienvenue !' : 'Oups !'}
            </h3>
            <p className="text-gray-600 font-medium mb-6">{modal.message}</p>
            
            {modal.type === 'error' && (
              <button onClick={closeModal} className="w-full bg-gray-100 text-gray-800 font-bold py-3 rounded-xl hover:bg-gray-200 transition-colors">
                Réessayer
              </button>
            )}
            {/* Si c'est un succès, pas besoin de bouton, ça redirige tout seul */}
          </div>
        </div>
      )}

      <div className="w-full max-w-md">
        {/* En-tête / Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="bg-flashkin-blue p-2 rounded-xl shadow-md">
              <svg className="w-6 h-6 text-flashkin-yellow" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              <span className="text-flashkin-blue">Flashkin</span> <span className="text-flashkin-yellow">Delivery</span>
            </h1>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            {step === 1 ? "Connexion Sécurisée" : "Validation du code"}
          </h2>
          <p className="text-gray-500 mt-2 font-medium">
            {step === 1 ? "Entrez votre e-mail pour recevoir un code d'accès." : `Code unique envoyé à ${email}`}
          </p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 relative z-10">
          
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Adresse e-mail</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all"
                    placeholder="vous@exemple.com"
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={loading}
                className="w-full bg-flashkin-dark text-white font-bold text-lg py-3.5 mt-2 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-70 flex justify-center items-center gap-2 group"
              >
                {loading ? <Spinner /> : <><Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /> Recevoir mon code</>}
              </button>
            </form>
          )}

          {step === 2 && (
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Code de sécurité à 6 chiffres</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <KeyRound className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type="text" required value={otp} onChange={(e) => setOtp(e.target.value)} maxLength="6"
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all font-bold tracking-widest text-center text-lg text-flashkin-dark"
                    placeholder="123456"
                  />
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 my-2"></div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Nouveau mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all text-sm"
                    placeholder="Saisir le mot de passe"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {newPassword && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <span className="text-gray-500">Sécurité :</span>
                      <span className={`${strength.textColor} uppercase tracking-wider`}>{strength.label}</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${strength.color} transition-all duration-300`} style={{ width: strength.width }}></div>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input 
                    type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-10 pr-4 py-3 bg-gray-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all text-sm ${newPassword && confirmPassword && newPassword !== confirmPassword ? 'border-red-300 focus:ring-red-400' : 'border-gray-200'}`}
                    placeholder="Répéter le mot de passe"
                  />
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <button 
                  onClick={() => handleVerifyOtp(false)} 
                  disabled={loading || !newPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  className="w-full bg-flashkin-dark text-white font-bold text-base py-3.5 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-md shadow-gray-100"
                >
                  {loading && activeAction === 'reset' ? <Spinner /> : <><CheckCircle className="w-5 h-5 text-flashkin-yellow" /> Enregistrer & me connecter</>}
                </button>

                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-gray-100"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold tracking-widest">OU</span>
                  <div className="flex-grow border-t border-gray-100"></div>
                </div>

                <button 
                  onClick={() => handleVerifyOtp(true)} 
                  disabled={loading || !otp}
                  className="w-full bg-flashkin-yellow text-flashkin-dark font-black text-base py-3.5 rounded-xl hover:bg-opacity-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-sm"
                >
                  {loading && activeAction === 'skip' ? <Spinner color="text-flashkin-dark" /> : <><LogIn className="w-5 h-5 text-flashkin-blue" /> M'identifier sans mot de passe</>}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="mt-8 text-center">
              <Link to="/login" className="text-sm font-bold text-gray-500 hover:text-flashkin-dark flex items-center justify-center gap-2 transition-colors">
                <ArrowLeft className="w-4 h-4" /> Annuler et retourner à la connexion
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}