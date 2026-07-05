import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'; 
import ActionModal from '../components/ActionModal';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); 
  
  const [step, setStep] = useState(1);
  const [tempToken, setTempToken] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const otpRefs = useRef([]);

  const [modal, setModal] = useState({ isOpen: false, status: 'idle', message: '' });
  
  const navigate = useNavigate();
  const { login } = useAuth();

  // 🔄 ÉCOUTEUR D'URL POUR LE BOUTON DU EMAIL
  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = queryParams.get('token');
    const emailFromUrl = queryParams.get('email');

    if (tokenFromUrl) {
      setTempToken(tokenFromUrl);
      if (emailFromUrl) setEmail(emailFromUrl);
      setStep(2); // Bascule automatiquement sur la saisie de l'OTP
    }
  }, []);

  // ÉTAPE 1 : IDENTIFIANTS
  const handleLogin = async (e) => {
    e.preventDefault();
    setModal({ isOpen: true, status: 'loading', message: 'Authentification en cours...' });

    try {
      const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });

      if (response.data.requiresOtp) {
        setTempToken(response.data.tempToken);
        setStep(2);
        setModal({ isOpen: true, status: 'success', message: 'Veuillez saisir le code reçu par mail.' });
        setTimeout(() => setModal({ ...modal, isOpen: false }), 2000);
      } else if (response.data.success) {
        const token = response.data.token;
        setModal({ isOpen: true, status: 'success', message: 'Connexion réussie ! Bienvenue.' });
        login(token);
        const decodedPayload = JSON.parse(atob(token.split('.')[1]));
        setTimeout(() => {
          if (decodedPayload.role === 'ADMIN') navigate('/admin');
          else if (decodedPayload.role === 'FLASHMAN') navigate('/flashman');
          else navigate('/dashboard'); 
        }, 1500);
      }
    } catch (err) {
      setModal({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Identifiants incorrects.' });
      setTimeout(() => setModal({ ...modal, isOpen: false }), 2500);
    }
  };

  // ÉTAPE 2 : VALIDATION OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const code = otp.join('');
    
    if (code.length < 6) {
      setModal({ isOpen: true, status: 'error', message: 'Veuillez saisir les 6 chiffres.' });
      setTimeout(() => setModal({ ...modal, isOpen: false }), 2500);
      return;
    }

    setModal({ isOpen: true, status: 'loading', message: 'Vérification du code...' });

    try {
      const response = await axios.post('http://localhost:3000/api/auth/verify-otp', {
        tempToken,
        otpCode: code
      });

      if (response.data.success) {
        const token = response.data.token;
        setModal({ isOpen: true, status: 'success', message: 'Connexion approuvée !' });
        login(token);
        const decodedPayload = JSON.parse(atob(token.split('.')[1]));
        setTimeout(() => {
          if (decodedPayload.role === 'ADMIN') navigate('/admin');
          else if (decodedPayload.role === 'FLASHMAN') navigate('/flashman');
          else navigate('/dashboard'); 
        }, 1500);
      }
    } catch (err) {
      setModal({ isOpen: true, status: 'error', message: err.response?.data?.message || 'Code incorrect ou expiré.' });
      setTimeout(() => setModal({ ...modal, isOpen: false }), 2500);
    }
  };

  const handleOtpChange = (index, value) => {
    if (isNaN(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value !== '' && index < 5) otpRefs.current[index + 1].focus();
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1].focus();
    }
  };

  const handleGoogleLogin = () => {
    toast.custom((t) => (
      <div
        style={{ transform: t.visible ? 'translateX(0)' : 'translateX(24px)', opacity: t.visible ? 1 : 0, transition: 'all 220ms ease-out' }}
        className="min-w-[320px] rounded-[28px] border border-slate-200/70 bg-white/95 p-4 shadow-[0_28px_70px_rgba(15,23,42,0.14)] backdrop-blur-xl"
      >
        <div className="flex gap-3 items-start">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-gradient-to-br from-slate-900 via-blue-700 to-cyan-500 text-white shadow-lg">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3.5v17" /><path d="M6 8.5l6-5 6 5" /><path d="M6 15.5l6 5 6-5" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-slate-900">Authentification Google</p>
            <p className="text-sm leading-6 text-slate-600">Bientôt disponible sur votre espace Flashkin.</p>
          </div>
        </div>
      </div>
    ), { duration: 4200 });
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative font-sans overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-flashkin-blue via-blue-50 to-flashkin-yellow opacity-90"></div>
      <div className="fixed top-0 left-0 w-96 h-96 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      <div className="fixed bottom-0 right-0 w-96 h-96 bg-flashkin-yellow rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>
      
      <ActionModal isOpen={modal.isOpen} status={modal.status} message={modal.message} />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fadeInDown">
          <div className="flex justify-center items-center gap-3 mb-6 animate-float-3d group cursor-default">
            <div className="bg-white p-3 rounded-2xl shadow-[0_20px_40px_rgba(36,68,92,0.3)] transition-all duration-300 border-b-[5px] border-r-[3px] border-blue-900 group-hover:scale-110">
              <svg className="w-7 h-7 text-flashkin-blue drop-shadow-md" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h1 className="text-4xl font-black tracking-tight uppercase">
              <span className="text-white" style={{ textShadow: '3px 3px 0px rgba(36,68,92,0.4)' }}>Flashkin</span>{' '}
              <span className="text-flashkin-yellow" style={{ textShadow: '3px 3px 0px rgba(36,68,92,0.3)' }}>Delivery</span>
            </h1>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight drop-shadow-lg">
            {step === 1 ? 'Se connecter' : 'Vérification de sécurité'}
          </h2>
          <p className="text-white text-opacity-80 mt-2 text-sm font-medium">
            {step === 1 ? 'Accédez à votre compte Flashkin' : 'Un code d\'accès temporaire est requis'}
          </p>
        </div>

        <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-[2.5rem] shadow-2xl p-8 border border-white border-opacity-50 relative z-10 animate-fadeInUp">
          
          {step === 1 ? (
            <>
              <button type="button" onClick={handleGoogleLogin} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 border-2 border-gray-200 rounded-xl bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-yellow-50 hover:border-flashkin-blue transition-all duration-300 font-bold text-gray-700 shadow-lg hover:shadow-xl transform hover:scale-105 mb-7">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                <span>Continuer avec Google</span>
              </button>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t-2 border-gray-200"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500 font-bold text-xs tracking-widest uppercase">Ou par e-mail</span></div>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2.5">Adresse e-mail</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Mail className="h-5 w-5 text-flashkin-blue" /></div>
                    <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue focus:border-flashkin-blue transition-all duration-300 font-medium text-gray-800 placeholder-gray-400" placeholder="vous@exemple.com" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <label className="block text-sm font-bold text-gray-800">Mot de passe</label>
                    <Link to="/forgot-password" className="text-sm font-bold text-flashkin-blue hover:underline">Mot de passe oublié ?</Link>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none"><Lock className="h-5 w-5 text-flashkin-blue" /></div>
                    <input type={showPassword ? "text" : "password"} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-12 pr-12 py-3.5 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue focus:border-flashkin-blue transition-all duration-300 font-medium text-gray-800 placeholder-gray-400" placeholder="••••••••" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-flashkin-blue focus:outline-none">
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <button type="submit" disabled={modal.status === 'loading'} className="w-full bg-gradient-to-r from-flashkin-blue to-flashkin-dark text-white font-bold text-lg py-3.5 mt-8 rounded-xl hover:from-flashkin-dark hover:to-blue-900 transition-all duration-300 flex justify-center items-center gap-2 group shadow-lg hover:shadow-xl transform hover:scale-105">
                  Se connecter <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-6 animate-fadeInUp">
              <div className="text-center mb-6">
                <div className="mx-auto w-16 h-16 bg-blue-50 text-flashkin-blue rounded-full flex items-center justify-center mb-4 border-2 border-blue-100">
                  <Lock className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Saisissez votre code</h3>
                <p className="text-sm text-gray-500 mt-2 leading-relaxed">
                  Un code de validation a été envoyé à <strong>{email}</strong>.
                </p>
              </div>

              <div className="flex justify-between gap-2 mb-8">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    type="text"
                    maxLength="1"
                    ref={(el) => (otpRefs.current[index] = el)}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 sm:w-14 sm:h-16 text-center text-2xl font-black text-gray-800 bg-gray-50 border-2 border-gray-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-flashkin-blue focus:border-flashkin-blue transition-all"
                  />
                ))}
              </div>

              <button type="submit" disabled={modal.status === 'loading'} className="w-full bg-gradient-to-r from-flashkin-yellow to-yellow-500 text-flashkin-blue font-black text-lg py-3.5 rounded-xl hover:from-yellow-500 hover:to-yellow-600 transition-all flex justify-center items-center gap-2 group shadow-lg hover:shadow-xl transform hover:scale-105">
                Vérifier le code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button type="button" onClick={() => setStep(1)} className="w-full mt-4 text-sm font-bold text-gray-400 hover:text-gray-600 transition-colors">
                ← Retour au formulaire
              </button>
            </form>
          )}
        </div>

        {step === 1 && (
          <p className="mt-8 text-center text-sm font-medium animate-fadeInUp" style={{ animationDelay: '0.4s' }}>
            <span className="text-white drop-shadow-sm">Vous n'avez pas de compte ? </span><Link to="/register" className="font-bold text-white hover:text-flashkin-yellow transition-all hover:underline drop-shadow-md">Inscrivez-vous gratuitement</Link>
          </p>
        )}
      </div>
    </div>
  );
}