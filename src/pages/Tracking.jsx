import { useState, useEffect } from 'react';
import axios from 'axios';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, MapPin, Truck, Package, CheckCircle, 
  Phone, User, Clock, AlertCircle, ArrowRight,
  MessageCircle, Star, Send, X, RefreshCw
} from 'lucide-react';
import PageLoader from '../components/PageLoader';

export default function Tracking() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, sender: 'FLASHMAN', text: 'Bonjour, je suis en route vers le point de récupération.', time: '10:30' }
  ]);
  const [searchParams] = useSearchParams();
  const orderIdFromUrl = searchParams.get('id');

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/commands', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.success) {
        setOrders(response.data.commands);
        if (orderIdFromUrl) {
          const foundOrder = response.data.commands.find(o => o.id === orderIdFromUrl);
          if (foundOrder) setTrackedOrder(foundOrder);
        }
      }
    } catch (error) {
      setError("Impossible de joindre le serveur. Vérifiez votre connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [orderIdFromUrl]);

  const activeOrders = orders.filter(o => o.status === 'RECEIVED' || o.status === 'ACCEPTED');

  const handleSearch = (e) => {
    const term = e.target.value;
    setSearchTerm(term);
    
    if (term.length > 2) {
      const found = orders.find(o => 
        (o.clientName && o.clientName.toLowerCase().includes(term.toLowerCase())) ||
        (o.clientPhone && o.clientPhone.includes(term))
      );
      setTrackedOrder(found || null);
    } else {
      setTrackedOrder(null);
    }
  };

  const selectOrderToTrack = (order) => {
    setTrackedOrder(order);
    setSearchTerm(order.clientName);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'PARTNER',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setChatMessages([...chatMessages, newMessage]);
    setMessageInput('');
  };

  const DeliveryTimeline = ({ status }) => {
    const steps = [
      { id: 'RECEIVED', label: 'Commande Reçue', icon: Package },
      { id: 'ACCEPTED', label: 'Livreur en route', icon: Truck },
      { id: 'DELIVERED', label: 'Colis Livré', icon: CheckCircle }
    ];

    let currentStepIndex = 0;
    if (status === 'ACCEPTED') currentStepIndex = 1;
    if (status === 'DELIVERED') currentStepIndex = 2;
    if (status === 'CANCELLED') currentStepIndex = -1;

    if (status === 'CANCELLED') {
      return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-2xl p-6 text-center">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-red-700">Cette commande a été annulée</h3>
        </div>
      );
    }

    return (
      <div className="relative py-8 overflow-hidden">
        <div className="absolute top-1/2 left-0 w-full h-1.5 bg-gray-100 dark:bg-gray-700 -translate-y-1/2 rounded-full"></div>
        <div 
          className="absolute top-1/2 left-0 h-1.5 bg-flashkin-blue -translate-y-1/2 rounded-full transition-all duration-500"
          style={{ width: `${(currentStepIndex / 2) * 100}%` }}
        ></div>

        <div className="relative flex justify-between items-center z-10">
          {steps.map((step, index) => {
            const isActive = index <= currentStepIndex;
            const isCurrent = index === currentStepIndex;
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex flex-col items-center group w-1/3">
                <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center border-4 transition-all duration-300 ${
                  isActive ? 'bg-flashkin-blue border-white text-flashkin-yellow shadow-lg' : 'bg-white border-gray-100 text-gray-300'
                } ${isCurrent ? 'scale-110 ring-4 ring-flashkin-blue/20' : ''}`}>
                  <Icon size={24} />
                </div>
                <p className={`mt-4 text-xs md:text-sm font-bold text-center ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // --- LE COMPOSANT AVATAR SÉCURISÉ ---
  const FlashmanAvatar = ({ flashman }) => {
    // 1. Sécurité : Si pas de flashman du tout
    if (!flashman) return <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gray-200" />;
    
    // 2. S'il a une photo
    if (flashman.photo) {
      return <img src={flashman.photo} alt="Livreur" className="w-12 h-12 md:w-14 md:h-14 rounded-full border-2 border-flashkin-yellow object-cover" />;
    }
    
    // 3. Extraction sécurisée des initiales (évite le WSoD si firstName est null)
    const f = flashman.firstName?.charAt(0) || "";
    const l = flashman.lastName?.charAt(0) || "";
    const initials = (f + l).toUpperCase() || "FL";
    
    return (
      <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-flashkin-blue flex items-center justify-center text-white font-black border-2 border-flashkin-yellow shadow-sm text-sm md:text-base">
        {initials}
      </div>
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-5xl mx-auto space-y-8 relative">
      
      {/* HEADER RECHERCHE */}
      <div className="bg-gradient-to-r from-flashkin-blue to-[#162d3e] rounded-3xl p-6 md:p-8 shadow-xl text-white">
        <h2 className="text-2xl md:text-3xl font-black text-flashkin-yellow mb-2">Suivi & Communication</h2>
        <div className="relative max-w-2xl mt-4 md:mt-6">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input 
            type="text" placeholder="Rechercher un client ou téléphone..." 
            value={searchTerm} onChange={handleSearch}
            className="w-full pl-12 pr-4 py-3 md:py-4 bg-white text-gray-900 rounded-2xl outline-none font-bold shadow-lg text-sm md:text-base"
          />
        </div>
      </div>

      {/* GESTION D'ERREUR SERVEUR */}
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-8 rounded-3xl text-center">
          <AlertCircle className="mx-auto text-red-500 mb-4" size={48} />
          <h3 className="text-xl font-bold text-red-800 dark:text-red-400">{error}</h3>
          <button onClick={fetchOrders} className="mt-4 flex items-center gap-2 mx-auto bg-red-100 text-red-700 px-6 py-2 rounded-xl font-bold hover:bg-red-200">
            <RefreshCw size={18} /> Réessayer
          </button>
        </div>
      )}

      {/* RÉSULTAT DU SUIVI RÉEL */}
      {trackedOrder && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden animate-scale-up">
          <div className="p-6 border-b dark:border-gray-700 flex flex-col md:flex-row justify-between md:items-center bg-gray-50 dark:bg-gray-900/50 gap-2">
            <h3 className="text-2xl font-black text-gray-900 dark:text-white">{trackedOrder.clientName}</h3>
            <p className="text-2xl font-black text-green-500">{trackedOrder.amountToCollect}$</p>
          </div>
          
          <div className="p-6">
            <DeliveryTimeline status={trackedOrder.status} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-100 dark:bg-gray-700">
            <div className="p-6 bg-white dark:bg-gray-800">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Infos Destination</h4>
              <p className="font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-2"><Phone size={16}/> {trackedOrder.clientPhone}</p>
              <p className="text-gray-500 flex items-start gap-2"><MapPin size={16} className="text-flashkin-yellow shrink-0 mt-1"/> {trackedOrder.clientAddress}</p>
            </div>

            {/* SECTION LIVREUR RÉEL SÉCURISÉE */}
            <div className="p-6 bg-white dark:bg-gray-800 border-t md:border-t-0 md:border-l dark:border-gray-700">
              <h4 className="text-xs font-bold text-gray-400 uppercase mb-4">Livreur Flashman</h4>
              {trackedOrder.flashman ? (
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-4">
                    <FlashmanAvatar flashman={trackedOrder.flashman} />
                    <div>
                      {/* Sécurité : on affiche un nom par défaut si absent */}
                      <h5 className="font-black text-lg text-gray-900 dark:text-white leading-tight">
                        {trackedOrder.flashman.firstName || 'Livreur'} {trackedOrder.flashman.lastName || ''}
                      </h5>
                      <p className="text-xs text-green-500 font-bold flex items-center gap-1 mt-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> En ligne
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Sécurité sur le remplacement du numéro */}
                    <a 
                      href={`https://wa.me/${trackedOrder.flashman.phone?.replace(/[^0-9]/g, '') || ''}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex justify-center items-center gap-2 py-3 bg-[#25D366] hover:bg-[#1ebd57] text-white font-bold rounded-xl shadow-sm transition-colors text-sm"
                    >
                      <MessageCircle size={18} /> WhatsApp
                    </a>
                    
                    <button onClick={() => setIsChatOpen(true)} className="flex justify-center items-center gap-2 py-3 bg-flashkin-blue text-white font-bold rounded-xl shadow-md hover:bg-opacity-90 text-sm">
                      <MessageCircle size={18} /> Chat
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-400">
                  <Clock size={32} className="mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">Recherche d'un livreur...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ÉTAT VIDE : SI PAS DE COMMANDES ACTIVES */}
      {!trackedOrder && activeOrders.length === 0 && !error && (
        <div className="text-center p-12 md:p-20 bg-white dark:bg-gray-800 rounded-3xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 dark:bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={40} className="text-gray-300" />
          </div>
          <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Aucun colis en transit</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-sm mx-auto text-sm md:text-base">
            Vos commandes expédiées s'afficheront ici en temps réel pour le suivi.
          </p>
        </div>
      )}

      {/* RADAR (Si commandes actives présentes) */}
      {!trackedOrder && activeOrders.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeOrders.map(order => (
            <div key={order.id} onClick={() => selectOrderToTrack(order)} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-flashkin-blue cursor-pointer group transition-all hover:shadow-md">
              <div className="flex justify-between mb-4">
                 <h4 className="font-black text-gray-900 dark:text-white truncate pr-2">{order.clientName}</h4>
                 <ArrowRight className="text-gray-300 group-hover:text-flashkin-blue transition-colors" size={20} />
              </div>
              <p className="text-sm text-gray-500 truncate mb-4"><MapPin size={14} className="inline mr-1 text-gray-400"/> {order.clientAddress}</p>
              <div className="w-full bg-gray-100 dark:bg-gray-900 h-2 rounded-full overflow-hidden">
                <div className={`h-full transition-all duration-500 bg-flashkin-blue ${order.status === 'ACCEPTED' ? 'w-2/3' : 'w-1/3'}`}></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* --- LE MODAL DE CHAT INTÉGRÉ --- */}
      {isChatOpen && trackedOrder?.flashman && (
        <div className="fixed bottom-0 right-0 md:bottom-10 md:right-10 w-full md:w-96 h-[80vh] md:h-[500px] bg-white dark:bg-gray-800 md:rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col z-50 animate-slide-up md:animate-scale-up overflow-hidden">
          
          {/* Header du Chat */}
          <div className="bg-flashkin-blue text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FlashmanAvatar flashman={trackedOrder.flashman} />
                <span className="absolute bottom-0 right-0 w-3 h-3 border-2 border-flashkin-blue rounded-full bg-green-400"></span>
              </div>
              <div>
                <h4 className="font-bold text-sm leading-none">{trackedOrder.flashman.firstName || 'Livreur'}</h4>
                <p className="text-[10px] text-blue-200 mt-1 uppercase font-bold tracking-wider">En ligne</p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          {/* Corps des messages */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50 dark:bg-gray-900 flex flex-col gap-3">
            <p className="text-center text-xs text-gray-400 font-medium mb-2 bg-white dark:bg-gray-800 py-1 px-3 rounded-full mx-auto shadow-sm border border-gray-100 dark:border-gray-700">Aujourd'hui</p>
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex flex-col ${msg.sender === 'PARTNER' ? 'items-end' : 'items-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                  msg.sender === 'PARTNER' 
                    ? 'bg-flashkin-blue text-white rounded-br-none' 
                    : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none shadow-sm'
                }`}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-gray-400 mt-1 px-1 font-medium">{msg.time}</span>
              </div>
            ))}
          </div>

          {/* Input de saisie */}
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2 pb-safe">
            <input 
              type="text" 
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Écrivez au livreur..." 
              className="flex-1 bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white rounded-full px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-flashkin-blue/50 transition-all"
            />
            <button 
              type="submit" 
              disabled={!messageInput.trim()}
              className="w-12 h-12 bg-flashkin-blue text-white rounded-full flex items-center justify-center hover:bg-opacity-90 disabled:opacity-50 transition-colors shadow-md"
            >
              <Send size={18} className="-ml-1" />
            </button>
          </form>
        </div>
      )}

    </div>
  );
}