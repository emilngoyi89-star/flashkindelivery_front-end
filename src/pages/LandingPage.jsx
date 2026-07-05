import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring, useTransform } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Zap, ChevronRight, Package, ArrowRight, 
  MessageSquare, Bot, MapPin, Phone, CheckCircle2,
  Navigation, Clock, Wallet, Activity, ArrowDownRight, 
  ShieldAlert, Headset, Star, Quote, ShoppingBag, ChevronDown,
  X, Search, ArrowUp
} from 'lucide-react';

const LandingPage = () => {
  const [showSplash, setShowSplash] = useState(true);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [trackingCode, setTrackingCode] = useState('');
  const [activeFaq, setActiveFaq] = useState(null);
  
  const navigate = useNavigate();

  // --- BARRE DE PROGRESSION ---
  const { scrollYProgress } = useScroll();
  const invertedProgress = useTransform(scrollYProgress, [0, 1], [1, 0]);
  const scaleX = useSpring(invertedProgress, { stiffness: 100, damping: 30 });

  // --- RETOUR EN HAUT ---
  useEffect(() => {
    const handleScroll = () => setShowBackToTop(window.scrollY > 500);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  // --- SPLASH SCREEN ---
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);
    return () => clearTimeout(timer);
  }, []);

  // --- ACTION DE SUIVI ---
  const handleTrackingSubmit = (e) => {
    e.preventDefault();
    if (trackingCode.trim()) {
      setIsTrackModalOpen(false);
      navigate(`/track/${trackingCode.trim().toUpperCase()}`);
    }
  };

  // --- DONNÉES FAQ ---
  const faqData = [
    {
      q: "Comment fonctionne l'extraction des commandes par l'IA ?",
      a: "C'est ultra simple. Vous copiez le texte brut envoyé par vos clients sur WhatsApp ou les commandes provenant de Shopify, vous le collez dans votre espace partenaire (création des commandes multiples), et le système Flashkin Delivery extrait instantanément le nom, le numéro de téléphone, l'adresse de livraison et le montant à percevoir pour créer les commandes (courses) en 1 seconde."
    },
    {
      q: "Mes clients ont-ils besoin d'un compte pour suivre leur colis ?",
      a: "Non, absolument pas. Dès qu'une commande est créée, un lien de suivi unique et public (ex: track/FLK-XYZ) est généré. Vous pouvez l'envoyer à votre client par WhatsApp ou SMS. Il pourra suivre la position GPS du Flashman en temps réel sans inscription."
    },
    {
      q: "Comment et quand puis-je retirer l'argent collecté ?",
      a: "Dès que le Flashman livre le colis et perçoit le montant, votre portefeuille Flashkin est instantanément crédité. Vous pouvez demander un retrait vers vos comptes Mobile Money (Orange Money, Airtel Money, M-Pesa) à tout moment de la journée."
    },
    {
      q: "Que se passe-t-il en cas de problème ou de litige lors d'une livraison ?",
      a: "Flashkin intègre un système de signalement en temps réel. Si un colis rencontre une anomalie, vous déclarez le litige en un clic. Notre Control Tower (support client) prend immédiatement le relais pour contacter le livreur et sécuriser votre commande."
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A0F1C] text-slate-50 font-sans selection:bg-yellow-500/30 overflow-x-hidden">
      
      {/* BARRE DE PROGRESSION */}
      <motion.div style={{ scaleX, transformOrigin: "left" }} className="fixed top-0 left-0 right-0 h-1 bg-yellow-500 z-[101]" />

      {/* SPLASH SCREEN */}
      <AnimatePresence>
        {showSplash && (
          <motion.div initial={{ opacity: 1 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.8, ease: "easeInOut" }} className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A0F1C]">
            <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }} className="relative">
              <Zap size={64} className="text-yellow-500 relative z-10" />
              <div className="absolute inset-0 bg-yellow-500 blur-[40px] opacity-40 animate-pulse" />
            </motion.div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }} className="mt-6 text-2xl font-bold tracking-widest text-white">FLASHKIN</motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
          
          {/* NAVBAR */}
          <nav className="fixed top-0 w-full z-50 bg-[#0A0F1C]/70 backdrop-blur-xl border-b border-white/10 mt-1">
            <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                <Zap className="text-yellow-500" size={28} />
                <span className="text-xl font-bold tracking-tight text-white">Flashkin</span>
              </div>
              <div className="flex items-center gap-6">
                <button onClick={() => navigate('/login')} className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Se connecter</button>
                <button onClick={() => navigate('/register')} className="px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-[#0A0F1C] text-sm font-semibold rounded-full transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:-translate-y-0.5">
                  <span className="hidden sm:inline">Commencer</span> <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </nav>

          {/* HERO SECTION */}
          <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden min-h-screen flex items-center">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] opacity-50 pointer-events-none" />
            
            <motion.div animate={{ y: [0, -10, 0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} className="hidden lg:flex absolute top-40 left-20 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl items-center gap-3 shadow-2xl">
              <div className="bg-green-500/20 p-2 rounded-full"><CheckCircle2 className="text-green-500" size={20}/></div>
              <div><p className="text-sm font-bold text-white">Commande livrée</p><p className="text-xs text-slate-400">Il y a 2 min • Gombe</p></div>
            </motion.div>

            <motion.div animate={{ y: [0, 15, 0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }} className="hidden lg:flex absolute bottom-40 right-20 bg-white/5 border border-white/10 backdrop-blur-md p-4 rounded-2xl items-center gap-3 shadow-2xl">
              <div className="bg-yellow-500/20 p-2 rounded-full"><Zap className="text-yellow-500" size={20}/></div>
              <div><p className="text-sm font-bold text-white">Livreur assigné</p><p className="text-xs text-slate-400">En route vers le magasin</p></div>
            </motion.div>

            <div className="max-w-7xl mx-auto px-6 relative z-10 w-full">
              <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mb-8 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-slate-300 backdrop-blur-sm">
                  <span className="flex h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></span>
                  La livraison assistée par IA
                </motion.div>
                <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="text-5xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1]">
                  La livraison rapide qui <br className="hidden lg:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">propulse votre activité</span>
                </motion.h1>
                <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-8 text-lg lg:text-xl text-slate-400 max-w-2xl leading-relaxed">
                  Concentrez-vous sur l'acquisition clients. Flashkin s'occupe de vos livraisons sans stress, avec un suivi temps réel pour chaque action.
                </motion.p>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-10 flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                  <button onClick={() => navigate('/register')} className="px-8 py-4 bg-white text-[#0A0F1C] hover:bg-slate-200 font-bold rounded-full transition-all flex items-center justify-center gap-2 shadow-lg">Créer un compte <ArrowRight size={18} /></button>
                  <button onClick={() => setIsTrackModalOpen(true)} className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium rounded-full transition-all flex items-center justify-center gap-2 backdrop-blur-sm"><Package size={18} /> Suivre un colis</button>
                </motion.div>
                <div className="mt-6 max-w-2xl mx-auto text-center rounded-3xl border border-yellow-500/20 bg-yellow-500/5 px-6 py-4 text-sm text-slate-200 sm:text-base">
                  <p className="font-semibold text-yellow-200">Note : Flashkin est actuellement en version bêta.</p>
                  <p className="mt-2 text-slate-300">Certaines fonctionnalités peuvent ne pas fonctionner parfaitement pendant cette phase de test. Vos recommandations et avis sont précieux : <a href="mailto:Flashkindelivrary@gmail.com" className="font-semibold text-white hover:text-yellow-300">Flashkindelivrary@gmail.com</a>.</p>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION IA FLASHKIN */}
          <section className="py-24 bg-[#0F172A] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">La magie du système Flashkin Delivery</h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Collez simplement vos messages WhatsApp ou les commandes reçues via Shopify sur la création de commandes multiples sur votre espace partenaire. Notre IA extrait les informations, crée les courses instantanément et les livreurs sont assignés rapidement.</p>
              </div>
              <div className="flex flex-col lg:flex-row items-center gap-12 max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="flex-1 bg-[#0A0F1C] p-6 rounded-3xl border border-white/10 w-full shadow-2xl relative overflow-hidden">
                  <div className="flex items-center gap-3 mb-4 text-slate-400 border-b border-white/10 pb-4">
                    <MessageSquare size={20} /> <span className="text-sm font-medium">Texte brut copié</span>
                  </div>
                  <p className="text-slate-300 font-mono text-sm leading-relaxed">"Bonjour Flashkin, livraison pour Kevin à Gombe, montant 25$, téléphone 099999999"</p>
                  <motion.div animate={{ top: ['0%', '100%', '0%'] }} transition={{ duration: 3, repeat: Infinity, ease: "linear" }} className="absolute left-0 right-0 h-1 bg-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.5)] z-10" />
                </motion.div>
                <div className="hidden lg:flex flex-col items-center text-yellow-500">
                  <Bot size={40} className="animate-pulse mb-2" />
                  <ArrowRight size={24} />
                </div>
                <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 }} className="flex-1 bg-gradient-to-br from-white/10 to-white/5 p-6 rounded-3xl border border-white/10 w-full backdrop-blur-xl">
                  <div className="flex items-center gap-3 mb-6 text-yellow-500 border-b border-white/10 pb-4">
                    <Zap size={20} /> <span className="text-sm font-bold text-white">Commande Générée</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 bg-[#0A0F1C]/50 p-3 rounded-xl border border-white/5">
                      <div className="bg-blue-500/20 p-2 rounded-lg"><Phone size={16} className="text-blue-400"/></div>
                      <div><p className="text-xs text-slate-400">Client</p><p className="text-sm font-medium text-white">Kevin - 099999999</p></div>
                    </div>
                    <div className="flex items-center gap-4 bg-[#0A0F1C]/50 p-3 rounded-xl border border-white/5">
                      <div className="bg-red-500/20 p-2 rounded-lg"><MapPin size={16} className="text-red-400"/></div>
                      <div><p className="text-xs text-slate-400">Destination</p><p className="text-sm font-medium text-white">Gombe, Kinshasa</p></div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* SUIVI TEMPS RÉEL */}
          <section className="py-24 bg-[#0A0F1C] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row items-center gap-16">
                
                <div className="flex-1">
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Suivi GPS <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">au mètre près</span></h2>
                  <p className="text-slate-400 text-lg mb-10">Ne perdez plus jamais la trace d'un colis. Vous et vos clients êtes notifiés à chaque étape, en temps réel.</p>
                  
                  <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-yellow-500 before:via-white/10 before:to-transparent">
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0F1C] bg-yellow-500 text-[#0A0F1C] shadow-[0_0_15px_rgba(234,179,8,0.5)] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><Package size={18} /></div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div className="flex justify-between mb-1"><h3 className="font-bold text-white">Commande créée</h3><span className="text-xs text-yellow-500">10:42</span></div>
                        <p className="text-sm text-slate-400">Validée par l'IA Flashkin</p>
                      </div>
                    </div>
                    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-[#0A0F1C] bg-yellow-500 text-[#0A0F1C] shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"><Zap size={18} /></div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-sm">
                        <div className="flex justify-between mb-1"><h3 className="font-bold text-white">Flashman en route</h3><span className="text-xs text-yellow-500">10:45</span></div>
                        <p className="text-sm text-slate-400">Arrive au point de collecte</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Simulation de carte UI interactive */}
                <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="flex-1 w-full bg-[#0F172A] rounded-[2rem] border border-white/10 p-4 shadow-2xl relative overflow-hidden h-[350px] md:h-[450px]">
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
                  
                  <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <path d="M 15 85 C 40 85 40 15 85 15" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="1" strokeDasharray="3 3" />
                    <motion.path d="M 15 85 C 40 85 40 15 85 15" fill="none" stroke="#EAB308" strokeWidth="1.5" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 4, repeat: Infinity, ease: "linear" }} />
                  </svg>

                  <div className="absolute bottom-[10%] left-[10%] bg-white p-2 rounded-full shadow-lg z-10"><Package size={18} className="text-[#0A0F1C]"/></div>
                  <div className="absolute top-[10%] right-[10%] bg-green-500 p-2 rounded-full shadow-lg z-10"><MapPin size={18} className="text-white"/></div>

                  <motion.div 
                    animate={{ left: ['15%', '85%'], top: ['85%', '15%'] }} 
                    transition={{ duration: 4, repeat: Infinity, ease: "linear" }} 
                    className="absolute bg-yellow-500 p-2 rounded-full shadow-[0_0_20px_rgba(234,179,8,0.6)] z-20 -translate-x-1/2 -translate-y-1/2"
                  >
                    <Navigation size={18} className="text-[#0A0F1C] rotate-45"/>
                  </motion.div>

                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-[#0A0F1C]/80 backdrop-blur-md border border-white/10 p-3 md:p-4 rounded-2xl z-30">
                    <p className="text-[10px] md:text-xs text-slate-400 mb-1 flex items-center gap-2"><Clock size={12}/> Temps estimé</p>
                    <p className="text-lg md:text-xl font-bold text-white">12 min</p>
                  </div>
                </motion.div>

              </div>
            </div>
          </section>

          {/* GESTION FINANCIÈRE */}
          <section className="py-24 bg-[#0F172A] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="flex flex-col lg:flex-row-reverse items-center gap-16">
                <div className="flex-1">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-sm font-medium text-blue-400 mb-6">
                    <Wallet size={16} /> Portefeuille intégré
                  </div>
                  <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Vos finances, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">sous contrôle total</span></h2>
                  <p className="text-slate-400 text-lg mb-8">Suivez vos revenus cumulés, vos commissions, et demandez des retraits instantanés vers Mobile Money. Une transparence absolue.</p>
                </div>
                <motion.div initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="flex-1 w-full bg-[#0A0F1C] rounded-[2rem] border border-white/10 p-6 md:p-8 shadow-2xl relative">
                  <div className="bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-6 mb-6">
                    <div className="flex justify-between items-start mb-2"><p className="text-slate-400 font-medium">Solde disponible</p><Activity className="text-yellow-500" size={20} /></div>
                    <h3 className="text-4xl font-extrabold text-white mb-4">$ 1,245.50</h3>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                      <div className="flex items-center gap-3"><div className="bg-green-500/20 p-2 rounded-lg"><ArrowDownRight size={16} className="text-green-500"/></div><div><p className="text-sm text-white font-medium">Livraison #FLK-89A</p><p className="text-xs text-slate-400">Aujourd'hui, 14:30</p></div></div>
                      <span className="text-sm font-bold text-green-400">+$ 12.00</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* LOGOS PARTENAIRES */}
          <section className="py-12 bg-[#0A0F1C] border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 text-center">
              <p className="text-sm font-medium text-slate-500 mb-8 uppercase tracking-widest">Ils nous font confiance pour leurs livraisons</p>
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="flex items-center gap-2 text-xl font-bold text-white"><ShoppingBag className="text-green-400"/> Clark Bioshop</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white"><Zap className="text-blue-400"/> Jweb Bioshop</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white"><Package className="text-purple-400"/> Pocket Life</div>
                <div className="flex items-center gap-2 text-xl font-bold text-white"><Star className="text-yellow-400"/> Bio Life</div>
              </div>
            </div>
          </section>

          {/* SIGNALEMENT & SUPPORT */}
          <section className="py-24 bg-[#0F172A] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Un problème ? <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">On gère.</span></h2>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">Une livraison en retard ou un litige ? Notre système de signalement intégré vous permet d'être pris en charge immédiatement par notre équipe.</p>
              </div>

              <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="bg-[#0A0F1C] border border-white/10 p-8 rounded-3xl text-center relative group hover:border-yellow-500/50 transition-colors">
                  <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><ShieldAlert size={32}/></div>
                  <h3 className="text-xl font-bold text-white mb-3">1. Signalement</h3>
                  <p className="text-slate-400 text-sm">Déclarez une anomalie en un clic directement depuis la commande concernée.</p>
                </motion.div>
                
                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-[#0A0F1C] border border-white/10 p-8 rounded-3xl text-center relative group hover:border-yellow-500/50 transition-colors">
                  <div className="w-16 h-16 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><Headset size={32}/></div>
                  <h3 className="text-xl font-bold text-white mb-3">2. Prise en charge</h3>
                  <p className="text-slate-400 text-sm">Notre équipe d'assistance analyse la situation et contacte le livreur en temps réel.</p>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-[#0A0F1C] border border-white/10 p-8 rounded-3xl text-center relative group hover:border-yellow-500/50 transition-colors">
                  <div className="w-16 h-16 bg-green-500/10 text-green-500 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform"><CheckCircle2 size={32}/></div>
                  <h3 className="text-xl font-bold text-white mb-3">3. Résolution</h3>
                  <p className="text-slate-400 text-sm">Le litige est résolu et la commande est sécurisée. Vous êtes notifié de l'issue.</p>
                </motion.div>
              </div>
            </div>
          </section>

          {/* TÉMOIGNAGES CLIENTS */}
          <section className="py-24 bg-[#0A0F1C] relative overflow-hidden border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
              <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-16">Ce que disent nos <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-yellow-200">partenaires</span></h2>
              
              <div className="grid md:grid-cols-3 gap-8">
                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                  <Quote className="text-yellow-500/40 mb-6" size={40} />
                  <p className="text-slate-300 mb-8 leading-relaxed">"Depuis que nous utilisons Flashkin, nos délais de livraison ont été divisés par deux. L'intégration WhatsApp avec l'IA est une pure merveille pour notre équipe."</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-xl">C</div>
                    <div><h4 className="font-bold text-white">Gérant</h4><p className="text-xs text-slate-400">Clark Bioshop</p></div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                  <Quote className="text-yellow-500/40 mb-6" size={40} />
                  <p className="text-slate-300 mb-8 leading-relaxed">"Le suivi financier nous a permis de voir clair dans nos revenus de livraison. Les retraits sont rapides et le support est toujours réactif en cas de pépin."</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-xl">B</div>
                    <div><h4 className="font-bold text-white">Directrice</h4><p className="text-xs text-slate-400">Bio Life</p></div>
                  </div>
                </motion.div>

                <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.4 }} className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-sm">
                  <Quote className="text-yellow-500/40 mb-6" size={40} />
                  <p className="text-slate-300 mb-8 leading-relaxed">"La fiabilité des livreurs (Flashman) est impressionnante. Le fait que nos clients puissent suivre leur commande en direct a considérablement réduit nos appels au service client."</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">P</div>
                    <div><h4 className="font-bold text-white">Fondateur</h4><p className="text-xs text-slate-400">Pocket Life</p></div>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* --- SECTION FAQ INTERACTIVE --- */}
          <section className="py-24 bg-[#0F172A] relative overflow-hidden border-t border-white/5">
            <div className="max-w-4xl mx-auto px-6">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Questions fréquentes</h2>
                <p className="text-slate-400 text-lg">Tout ce que vous devez savoir sur l'écosystème Flashkin.</p>
              </div>

              <div className="space-y-4">
                {faqData.map((faq, index) => (
                  <div key={index} className="bg-[#0A0F1C] border border-white/10 rounded-2xl overflow-hidden transition-all">
                    <button onClick={() => setActiveFaq(activeFaq === index ? null : index)} className="w-full p-6 text-left flex items-center justify-between gap-4 text-white font-semibold text-lg hover:bg-white/5 transition-colors">
                      <span>{faq.q}</span>
                      <ChevronDown size={20} className={`text-yellow-500 transition-transform duration-300 ${activeFaq === index ? 'rotate-180' : ''}`} />
                    </button>
                    <AnimatePresence initial={false}>
                      {activeFaq === index && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="border-t border-white/5 bg-white/[0.01]">
                          <p className="p-6 text-slate-400 text-sm leading-relaxed">{faq.a}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* --- FOOTER --- */}
          <footer className="bg-[#0A0F1C] border-t border-white/10 pt-16 pb-8 text-slate-400 text-sm">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-xl font-bold text-white">
                  <Zap className="text-yellow-500" size={24} /> Flashkin
                </div>
                <p className="text-slate-400 leading-relaxed">La plateforme logistique basée à Kinshasa bientôt partout en RDC nouvelle génération propulsée par intelligence artificielle. Pour la rapidité de vos livraisons, traçabilité et sécurité.</p>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Solutions</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/register" className="hover:text-yellow-500 transition-colors">Espace Partenaire</Link></li>
                  <li><Link to="/register" className="hover:text-yellow-500 transition-colors">Devenir Flashman</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Support & Sécurité</h4>
                <ul className="space-y-2.5">
                  <li><Link to="/" className="hover:text-yellow-500 transition-colors">Centre d'aide</Link></li>
                  <li><Link to="/" className="hover:text-yellow-500 transition-colors">Signaler un abus</Link></li>
                  <li><Link to="/" className="hover:text-yellow-500 transition-colors">Control Tower Live</Link></li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-white font-semibold mb-4 uppercase tracking-wider text-xs">Contact</h4>
                <p className="text-slate-400 mb-2">Kinshasa, RDC</p>
                <p className="text-white font-medium">support@flashkin.com</p>
              </div>
            </div>
            
            <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
              <p>© {new Date().getFullYear()} Flashkin Delivery. Tous droits réservés.</p>
              <div className="flex gap-6">
                <Link to="cgu" className="hover:text-white transition-colors">CGU & Mentions Légales</Link>
                <Link to="privacy" className="hover:text-white transition-colors">Confidentialité</Link>
              </div>
            </div>
          </footer>

        </motion.div>
      )}

      {/* --- MODAL INTERACTIF : SUIVRE UN COLIS --- */}
      <AnimatePresence>
        {isTrackModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsTrackModalOpen(false)} className="absolute inset-0 bg-black/60 backdrop-blur-md" />
            
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 20 }} transition={{ type: 'spring', duration: 0.5 }} className="bg-[#0F172A] border border-white/10 rounded-[2.5rem] w-full max-w-md p-8 relative z-10 shadow-2xl overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
              
              <button onClick={() => setIsTrackModalOpen(false)} className="absolute top-5 right-5 p-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-slate-400 hover:text-white transition-all"><X size={18} /></button>
              
              <div className="text-center mb-6 mt-2">
                <div className="w-14 h-14 bg-yellow-500/10 text-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-4"><Package size={28}/></div>
                <h3 className="text-xl font-bold text-white mb-2">Suivi de colis public</h3>
                <p className="text-slate-400 text-sm">Veuillez coller le code de tracking Flashkin fourni par le partenaire marchand.</p>
              </div>

              <form onSubmit={handleTrackingSubmit} className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                  <input type="text" placeholder="Ex: FLK-X78R2A" value={trackingCode} onChange={(e) => setTrackingCode(e.target.value)} className="w-full bg-[#0A0F1C] border border-white/10 focus:border-yellow-500/50 outline-none rounded-xl py-4 pl-12 pr-4 text-white font-mono font-bold tracking-wider placeholder:font-sans placeholder:font-normal placeholder:text-slate-600 transition-all uppercase" required autoFocus />
                </div>
                
                <button type="submit" className="w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-[#0A0F1C] font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(234,179,8,0.2)]">Suivre le colis <ArrowRight size={18}/></button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* BOUTON RETOUR EN HAUT */}
      <AnimatePresence>
        {showBackToTop && (
          <motion.button initial={{ opacity: 0, scale: 0.5, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.5, y: 20 }} onClick={scrollToTop} className="fixed bottom-8 right-8 z-50 p-3 bg-white/10 hover:bg-white/20 border border-white/20 backdrop-blur-md text-white rounded-full shadow-2xl transition-all"><ArrowUp size={24} /></motion.button>
        )}
      </AnimatePresence>

    </div>
  );
};

export default LandingPage;