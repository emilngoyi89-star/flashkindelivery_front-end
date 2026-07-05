import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // État de la jauge de sécurité
  const [strength, setStrength] = useState({ score: 0, label: '', color: 'bg-gray-200', width: '0%' });
  
  const { token } = useParams();
  const navigate = useNavigate();

  // Analyseur de complexité en temps réel
  useEffect(() => {
    let score = 0;
    if (password.length >= 8) score += 1; // Longueur mini
    if (/[A-Z]/.test(password)) score += 1; // Au moins une majuscule
    if (/[0-9]/.test(password)) score += 1; // Au moins un chiffre
    if (/[^A-Za-z0-9]/.test(password)) score += 1; // Au moins un caractère spécial

    if (password.length === 0) {
      setStrength({ score: 0, label: '', color: 'bg-gray-200', width: '0%' });
    } else if (score <= 1) {
      setStrength({ score, label: 'Faible', color: 'bg-red-500', width: '33%' });
    } else if (score === 2 || score === 3) {
      setStrength({ score, label: 'Bon', color: 'bg-yellow-400', width: '66%' });
    } else {
      setStrength({ score, label: 'Très fort', color: 'bg-green-500', width: '100%' });
    }
  }, [password]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (strength.score < 2) {
      return toast.error("Le mot de passe n'est pas assez sécurisé.");
    }
    if (password !== confirmPassword) {
      return toast.error("Les mots de passe ne correspondent pas.");
    }

    setLoading(true);
    try {
      const response = await axios.put(`http://localhost:3000/api/auth/reset-password/${token}`, { password });
      if (response.data.success) {
        toast.success("Mot de passe mis à jour avec succès !");
        navigate('/login');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Le lien est invalide ou a expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 relative font-sans">
      <div className="w-full max-w-md">
        
        <div className="text-center mb-8">
          <div className="flex justify-center items-center gap-2 mb-6">
            <div className="bg-flashkin-blue p-2 rounded-xl shadow-md">
              <ShieldCheck className="w-6 h-6 text-flashkin-yellow" />
            </div>
            <h1 className="text-3xl font-black tracking-tight uppercase">
              <span className="text-flashkin-blue">Flashkin</span> <span className="text-flashkin-yellow">Delivery</span>
            </h1>
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Nouveau mot de passe</h2>
          <p className="text-gray-500 mt-2 font-medium">Créez un mot de passe sécurisé.</p>
        </div>

        <div className="bg-white rounded-[2rem] shadow-xl p-8 border border-gray-100 relative z-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Nouveau Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Nouveau mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all"
                  placeholder="••••••••"
                />
                <button 
                  type="button" onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              
              {/* Jauge de sécurité */}
              <div className="mt-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-gray-500">Niveau de sécurité</span>
                  <span className={`text-xs font-extrabold ${strength.color.replace('bg-', 'text-')}`}>{strength.label}</span>
                </div>
                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} transition-all duration-500 ease-out`} style={{ width: strength.width }}></div>
                </div>
                <ul className="text-[10px] text-gray-400 mt-3 space-y-1 font-medium">
                  <li className={password.length >= 8 ? 'text-green-500' : ''}>• 8 caractères minimum</li>
                  <li className={/[A-Z]/.test(password) ? 'text-green-500' : ''}>• Au moins une majuscule</li>
                  <li className={/[0-9]/.test(password) ? 'text-green-500' : ''}>• Au moins un chiffre</li>
                  <li className={/[^A-Za-z0-9]/.test(password) ? 'text-green-500' : ''}>• Au moins un caractère spécial (@, #, !, etc.)</li>
                </ul>
              </div>
            </div>

            {/* Confirmer Mot de passe */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">Confirmer le mot de passe</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input 
                  type={showPassword ? "text" : "password"} required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" disabled={loading}
              className="w-full bg-flashkin-dark text-white font-bold text-lg py-3.5 mt-2 rounded-xl hover:bg-opacity-90 transition-all disabled:opacity-70 flex justify-center items-center gap-2 group"
            >
              {loading ? "Validation..." : (
                <>
                  Enregistrer <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}