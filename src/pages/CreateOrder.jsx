import React, { useState, useEffect } from 'react';
import { Package, MapPin, Send, User, Phone, ListPlus, Banknote, ShieldCheck, Copy, Zap, FileText, CheckCircle2, ShoppingCart, Plus, Minus, Trash2, Box } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ActionModal from '../components/ActionModal'; // Assure-toi que le chemin est correct

export default function CreateOrder() {
  const [inputMode, setInputMode] = useState('single'); 
  const [singleOrder, setSingleOrder] = useState({
    clientName: '', clientPhone: '', commune: '', dropoff: '', details: '', amountToCollect: ''
  });
  
  const [bulkText, setBulkText] = useState('');
  const [zonesData, setZonesData] = useState([]);
  const [communesList, setCommunesList] = useState([]);
  const [deliveryFee, setDeliveryFee] = useState(5);
  const [modal, setModal] = useState({ isOpen: false, status: 'idle', message: '' });
  const [aiResults, setAiResults] = useState([]);

  // --- NOUVEAUX ÉTATS POUR LE CATALOGUE ---
  const [products, setProducts] = useState([]);
  const [packageMode, setPackageMode] = useState('catalog'); // 'catalog' ou 'manual'
  const [cart, setCart] = useState([]); // [{ product: {}, quantity: 1 }]

  // 1. CHARGEMENT DES ZONES ET DU CATALOGUE
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Charger les zones
        const zonesRes = await axios.get('http://localhost:3000/api/zones', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (zonesRes.data.success) {
          const zones = zonesRes.data.zones;
          setZonesData(zones);
          let allCommunes = [];
          zones.forEach(zone => {
            if (zone.communes && Array.isArray(zone.communes)) {
              zone.communes.forEach(item => {
                const splitted = item.split(',').map(c => c.trim()).filter(c => c !== '');
                allCommunes = [...allCommunes, ...splitted];
              });
            }
          });
          allCommunes = [...new Set(allCommunes)].sort();
          setCommunesList(allCommunes);
          if (allCommunes.length > 0) {
            setSingleOrder(prev => ({ ...prev, commune: allCommunes[0] }));
          }
        }

        // Charger le catalogue produits
        const productsRes = await axios.get('http://localhost:3000/api/products', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (productsRes.data.success) {
          setProducts(productsRes.data.products);
        }

      } catch (error) {
        console.error("Erreur lors de la récupération des données", error);
      }
    };
    fetchData();
  }, []);

  // 2. CALCUL DYNAMIQUE DU PRIX DE LIVRAISON
  useEffect(() => {
    if (singleOrder.commune && zonesData.length > 0) {
      const matchedZone = zonesData.find(zone => {
        if (!zone.communes) return false;
        return zone.communes.some(item => {
          const splitted = item.split(',').map(c => c.trim());
          return splitted.includes(singleOrder.commune);
        });
      });
      if (matchedZone) setDeliveryFee(matchedZone.totalPrice);
    }
  }, [singleOrder.commune, zonesData]);

  // --- LOGIQUE DU PANIER (CATALOGUE) ---
  const handleAddProduct = (e) => {
    const productId = e.target.value;
    if (!productId) return;
    
    const product = products.find(p => p.id === parseInt(productId) || p.id === productId);
    if (!product) return;

    const existingItem = cart.find(item => item.product.id === product.id);
    if (existingItem) {
      setCart(cart.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
    e.target.value = ""; // Reset select
  };

  const updateQuantity = (productId, delta) => {
    setCart(cart.map(item => {
      if (item.product.id === productId) {
        const newQ = item.quantity + delta;
        return newQ > 0 ? { ...item, quantity: newQ } : item;
      }
      return item;
    }));
  };

  const removeFromCart = (productId) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const cartTotal = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  const finalAmountToCollect = packageMode === 'catalog' ? cartTotal : (parseFloat(singleOrder.amountToCollect) || 0);

  // --- SOUMISSION CLASSIQUE ---
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (packageMode === 'catalog' && cart.length === 0) {
      toast.error("Veuillez sélectionner au moins un produit du catalogue.");
      return;
    }

    setModal({ isOpen: true, status: 'loading', message: 'Enregistrement de la commande...' });
    
    try {
      const token = localStorage.getItem('token'); 
      
      // Générer les détails selon le mode
      const orderDetails = packageMode === 'catalog' 
        ? cart.map(item => `${item.quantity}x ${item.product.name}`).join(', ')
        : singleOrder.details;

      const orderData = {
        clientName: singleOrder.clientName,
        clientPhone: singleOrder.clientPhone,
        clientAddress: `${singleOrder.dropoff}, ${singleOrder.commune}`,
        details: orderDetails,
        amountToCollect: finalAmountToCollect,
        deliveryFee: deliveryFee
      };

      const response = await axios.post('http://localhost:3000/api/commands', orderData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const trackingUrl = response.data.trackingUrl;
        
        setModal({ 
          isOpen: true, status: 'success', 
          message: (
            <div className="flex flex-col items-center mt-2">
              <span className="mb-3 text-gray-700 font-black text-lg">Commande enregistrée ! 🛵</span>
              <span className="text-xs text-gray-500 mb-2 font-bold uppercase tracking-wider">Lien de suivi :</span>
              <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200 w-full max-w-sm shadow-inner">
                <code className="text-xs font-bold text-flashkin-blue truncate flex-1 px-2">{trackingUrl}</code>
                <button 
                  type="button" onClick={() => { navigator.clipboard.writeText(trackingUrl); toast.success("Lien copié !"); }}
                  className="bg-flashkin-blue text-white p-2 rounded-lg hover:bg-opacity-80 transition-colors shrink-0"
                >
                  <Copy size={16} />
                </button>
              </div>
            </div>
          ) 
        });

        // Reset
        setSingleOrder(prev => ({ ...prev, clientName: '', clientPhone: '', dropoff: '', details: '', amountToCollect: '' }));
        setCart([]);
        setTimeout(() => setModal(m => ({ ...m, isOpen: false })), 6000);
      }
    } catch (error) {
      setModal({ isOpen: true, status: 'error', message: error.response?.data?.message || 'Erreur réseau.' });
      setTimeout(() => setModal(m => ({ ...m, isOpen: false })), 3000);
    }
  };

  // --- SOUMISSION EN VRAC (IA) ---
  const handleAISubmit = async (e) => {
    e.preventDefault();
    if (!bulkText.trim()) return;
    setModal({ isOpen: true, status: 'loading', message: 'Analyse et création des commandes en cours... ⚡' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:3000/api/ai/parse-order', { rawText: bulkText }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setModal({ isOpen: false, status: 'idle', message: '' });
        toast.success(`${response.data.count} commandes générées avec succès !`);
        setAiResults(response.data.commands);
        setBulkText('');
      }
    } catch (error) {
      setModal({ isOpen: true, status: 'error', message: "Le traitement a échoué. Vérifiez le format du texte." });
      setTimeout(() => setModal(m => ({ ...m, isOpen: false })), 4000);
    }
  };

  const netToReceive = finalAmountToCollect > 0 ? (finalAmountToCollect - deliveryFee) : 0;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-6">
      <ActionModal isOpen={modal.isOpen} status={modal.status} message={modal.message} />

      {/* SÉLECTION DU MODE PRINCIPAL */}
      <div className="bg-white/95 dark:bg-slate-900/95 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700 p-2 flex flex-col sm:flex-row gap-2 w-full md:w-max mx-auto backdrop-blur-sm">
        <button onClick={() => setInputMode('single')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${inputMode === 'single' ? 'bg-[#0A0F1C] text-[#EAB308] shadow-md' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <ListPlus size={20} /> Saisie Classique
        </button>
        <button onClick={() => setInputMode('bulk')} className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all ${inputMode === 'bulk' ? 'bg-[#0A0F1C] text-white shadow-md' : 'text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800'}`}>
          <Zap size={20} className={inputMode === 'bulk' ? "text-[#EAB308]" : ""} /> Saisie Multiple (Auto)
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* LA ZONE DE SAISIE */}
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          
          {inputMode === 'single' ? (
            <div className="animate-fade-in">
              <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-3">
                Expédition Rapide
              </h2>
              
              <form onSubmit={handleSingleSubmit} className="space-y-6">
                {/* LIGNE 1 : CLIENT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><User size={16} className="text-blue-500"/> Nom du client</label>
                    <input type="text" required placeholder="Ex: Marc Dubois" value={singleOrder.clientName} onChange={(e) => setSingleOrder({...singleOrder, clientName: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] focus:ring-2 focus:ring-[#0A0F1C]/10 dark:focus:ring-[#f4c414]/10 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><Phone size={16} className="text-blue-500"/> Téléphone</label>
                    <input type="tel" required placeholder="Ex: 0810000000" value={singleOrder.clientPhone} onChange={(e) => setSingleOrder({...singleOrder, clientPhone: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] focus:ring-2 focus:ring-[#0A0F1C]/10 dark:focus:ring-[#f4c414]/10 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  </div>
                </div>

                {/* LIGNE 2 : ADRESSE */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5 p-5 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="md:col-span-1">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={16} className="text-[#EAB308]"/> Commune</label>
                    <select value={singleOrder.commune} onChange={(e) => setSingleOrder({...singleOrder, commune: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] outline-none cursor-pointer text-sm text-slate-900 dark:text-slate-100">
                      {communesList.length > 0 ? communesList.map((commune, i) => <option key={i} value={commune}>{commune}</option>) : <option value="">Chargement...</option>}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2"><MapPin size={16} className="text-gray-400"/> Adresse précise</label>
                    <input type="text" required placeholder="Ex: Av. de la Paix, n°45" value={singleOrder.dropoff} onChange={(e) => setSingleOrder({...singleOrder, dropoff: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] focus:ring-2 focus:ring-[#0A0F1C]/10 dark:focus:ring-[#f4c414]/10 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  </div>
                </div>

                {/* LIGNE 3 : COLIS (CATALOGUE OU MANUEL) */}
                <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <label className="text-sm font-bold text-gray-900 flex items-center gap-2"><Package size={18} className="text-gray-400"/> Contenu du colis</label>
                    <div className="flex bg-gray-100 p-1 rounded-lg">
                      <button type="button" onClick={() => setPackageMode('catalog')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${packageMode === 'catalog' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Catalogue</button>
                      <button type="button" onClick={() => setPackageMode('manual')} className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${packageMode === 'manual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Saisie Libre</button>
                    </div>
                  </div>

                  {packageMode === 'catalog' ? (
                    <div className="space-y-4">
                      {/* Sélecteur de produit */}
                      <select onChange={handleAddProduct} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-[#0A0F1C] outline-none cursor-pointer text-sm font-medium">
                        <option value="">+ Ajouter un produit du catalogue...</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} - {p.price}$ (Stock: {p.stock})</option>
                        ))}
                      </select>

                      {/* Mini Panier */}
                      {cart.length > 0 && (
                        <div className="space-y-2 border border-gray-100 rounded-xl p-2 bg-gray-50">
                          {cart.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-3">
                                <div className="bg-gray-100 p-2 rounded-md text-gray-400"><Box size={16}/></div>
                                <div>
                                  <p className="text-sm font-bold text-gray-900">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">{item.product.price}$ / unité</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center bg-gray-100 rounded-lg border border-gray-200">
                                  <button type="button" onClick={() => updateQuantity(item.product.id, -1)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-l-lg transition-colors"><Minus size={14}/></button>
                                  <span className="px-3 text-sm font-bold">{item.quantity}</span>
                                  <button type="button" onClick={() => updateQuantity(item.product.id, 1)} className="p-1.5 text-gray-600 hover:bg-gray-200 rounded-r-lg transition-colors"><Plus size={14}/></button>
                                </div>
                                <button type="button" onClick={() => removeFromCart(item.product.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 size={18}/></button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <input type="text" required placeholder="Ex: 2 chaussures rouges" value={singleOrder.details} onChange={(e) => setSingleOrder({...singleOrder, details: e.target.value})} className="w-full px-4 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] focus:ring-2 focus:ring-[#0A0F1C]/10 dark:focus:ring-[#f4c414]/10 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                  )}
                </div>

                {/* MONTANT À ENCAISSER (Dynamique) */}
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2"><Banknote size={16} className="text-green-600"/> Montant à encaisser (COD)</label>
                  <div className="relative">
                    {packageMode === 'catalog' ? (
                      <div className="w-full pl-4 pr-10 py-3 bg-green-50 border border-green-200 text-green-800 font-black rounded-xl text-lg flex items-center">
                        Calcul automatique : {cartTotal} <span className="text-green-600 ml-1">$</span>
                      </div>
                    ) : (
                      <>
                        <input type="number" required placeholder="Ex: 45" value={singleOrder.amountToCollect} onChange={(e) => setSingleOrder({...singleOrder, amountToCollect: e.target.value})} className="w-full pl-4 pr-10 py-3 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-2xl focus:border-[#0A0F1C] dark:focus:border-[#f4c414] focus:ring-2 focus:ring-[#0A0F1C]/10 dark:focus:ring-[#f4c414]/10 outline-none transition-all text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500" />
                        <span className="absolute right-4 top-3 font-bold text-slate-400 dark:text-slate-500">$</span>
                      </>
                    )}
                  </div>
                  {packageMode === 'catalog' && cart.length > 0 && <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1"><ShieldCheck size={12}/> Montant calculé d'après votre catalogue</p>}
                </div>

                <button type="submit" className="w-full mt-4 bg-[#0A0F1C] text-white font-bold py-4 rounded-xl hover:bg-opacity-90 transition-all shadow-lg flex items-center justify-center gap-3 group">
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform text-[#EAB308]" /> Confirmer la course
                </button>
              </form>
            </div>
          ) : (
            // ... LE CODE DU MODE BULK RESTE EXACTEMENT LE MÊME QUE DANS TON FICHIER ORIGINAL ...
            <div className="animate-fade-in flex flex-col h-full">
              <div className="mb-5 rounded-2xl border border-slate-200/80 dark:border-slate-700 bg-slate-50/80 dark:bg-slate-900/70 p-4 sm:p-5 shadow-sm">
                <h2 className="text-xl sm:text-2xl font-black text-slate-800 dark:text-white mb-2 flex items-center gap-3">
                  <FileText size={24} className="text-blue-500" /> Traitement en vrac
                </h2>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
                  Collez directement vos messages WhatsApp ou listes de commandes. Le système les convertira automatiquement en courses individuelles.
                </p>
              </div>
              
              <form onSubmit={handleAISubmit} className="flex flex-col gap-4">
                <div className="relative min-h-[220px] sm:min-h-[260px]">
                  <textarea 
                    required value={bulkText} onChange={(e) => setBulkText(e.target.value)}
                    placeholder="Ex: &#10;- Jean, Gombe, 08123, 45$ (2 Gels)&#10;- Sarah, Limete, 09988, 30$ (1 Parfum)"
                    className="w-full h-full min-h-[220px] sm:min-h-[260px] p-4 sm:p-5 bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-[1.25rem] focus:bg-white dark:focus:bg-slate-900 focus:border-[#0A0F1C] dark:focus:border-[#f4c414] outline-none resize-none transition-all text-sm sm:text-[15px] font-mono text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 shadow-[0_8px_24px_rgba(15,23,42,0.04)]"
                  ></textarea>
                </div>
                <button type="submit" className="w-full bg-[#0A0F1C] text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-3">
                  <Zap size={20} className="text-[#EAB308]" /> Traiter les commandes
                </button>
              </form>

              {aiResults.length > 0 && (
                <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 animate-fade-in">
                  <div className="flex items-center justify-between mb-4 gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2"><CheckCircle2 className="text-green-500" size={20} /> Commandes créées ({aiResults.length})</h3>
                    <button type="button" onClick={() => setAiResults([])} className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 underline">Effacer</button>
                  </div>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                    {aiResults.map((cmd, index) => (
                      <div key={index} className="bg-slate-50 dark:bg-slate-900/70 p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div>
                          <p className="font-black text-sm text-slate-900 dark:text-white">{cmd.clientName}</p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1 flex-wrap"><MapPin size={12}/> {cmd.clientAddress} • <Banknote size={12}/> {cmd.amountToCollect}$</p>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(cmd.trackingUrl); toast.success(`Lien copié`); }} className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-blue-500 px-3 py-2 rounded-lg text-xs font-bold shadow-sm"><Copy size={14} /> Suivi</button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* PANNEAU DE DROITE (RÉSUMÉ) */}
        <div className="w-full lg:w-80 space-y-6">
          <div className="bg-[#0A0F1C] text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              
              {inputMode === 'single' ? (
                 <>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <p className="text-[#EAB308] font-bold text-xs uppercase tracking-widest mb-1">Livraison</p>
                      <h3 className="text-4xl font-black">{deliveryFee}$</h3>
                    </div>
                    <div className="p-2 bg-white/10 rounded-lg">
                      <ShieldCheck size={24} className="text-[#EAB308]" />
                    </div>
                  </div>

                  <div className="space-y-4 text-sm font-medium opacity-90 border-t border-white/20 pt-4">
                    <div className="flex justify-between items-center text-gray-200">
                      <span>Montant à encaisser :</span>
                      <span className="font-bold">{finalAmountToCollect > 0 ? `${finalAmountToCollect}$` : '0$'}</span>
                    </div>
                    <div className="flex justify-between items-center text-red-300">
                      <span>Frais de la course :</span>
                      <span className="font-bold">- {deliveryFee}$</span>
                    </div>
                    <div className="flex justify-between items-center pt-3 border-t border-white/20 text-lg text-[#EAB308] font-black">
                      <span>Net à percevoir :</span>
                      <span>+ {netToReceive}$</span>
                    </div>
                  </div>
                 </>
              ) : (
                <div className="py-4">
                  <p className="text-[#EAB308] font-bold text-xs uppercase tracking-widest mb-2">Automatisation</p>
                  <h3 className="text-2xl font-black mb-4 flex items-center gap-2"><Zap size={24}/> Rapide & Fiable</h3>
                  <p className="text-sm text-gray-300 mt-4 leading-relaxed border-t border-white/20 pt-4">
                    Le système identifie chaque client, adresse et montant depuis votre texte brouillon et enregistre les commandes instantanément.
                  </p>
                </div>
              )}

            </div>
            <div className="absolute -right-10 -bottom-10 opacity-5"><Package size={200} /></div>
          </div>
        </div>

      </div>
    </div>
  );
}