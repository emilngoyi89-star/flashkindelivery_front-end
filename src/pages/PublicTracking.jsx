import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Package, CheckCircle2, Truck, Clock, MapPin, AlertCircle, User, Banknote, ShoppingBag } from 'lucide-react';
import PageLoader from '../components/PageLoader';

// Coordonnées centrales par défaut (Kinshasa)
const KINSHASA_CENTER = { lat: -4.305, lng: 15.315 };

// Style minimaliste et premium pour la carte (Mode sombre)
const mapStyles = [
  { elementType: "geometry", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1e293b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#94a3b8" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#334155" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#1e293b" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0f172a" }] }
];

export default function PublicTracking() {
  const { code } = useParams();
  const [command, setCommand] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
  });

  useEffect(() => {
    const fetchTracking = async () => {
      try {
        const response = await axios.get(`/api/commands/track/${code}`);
        if (response.data.success) {
          setCommand(response.data.command);
        }
      } catch (err) {
        setError("Lien de suivi invalide ou expiré. Veuillez vérifier votre code.");
      } finally {
        setLoading(false);
      }
    };
    fetchTracking();
  }, [code]);

  if (loading) return <PageLoader />;

  if (error || !command) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#090e14] p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm text-center max-w-md w-full border border-slate-100 dark:border-slate-800">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Colis introuvable</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">{error}</p>
        </div>
      </div>
    );
  }

  const currentStep = (() => {
    switch (command.status) {
      case 'PENDING': return 1;
      case 'ACCEPTED': return 2;
      case 'IN_TRANSIT': return 3;
      case 'DELIVERED': return 4;
      default: return 1;
    }
  })();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090e14] py-12 px-4 sm:px-6 font-sans antialiased selection:bg-flashkin-blue/10">
      <div className="max-w-2xl mx-auto space-y-6">
        
        {/* HEADER BRANDING */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center p-3 bg-flashkin-blue rounded-2xl mb-4 shadow-sm">
            <Package size={28} className="text-flashkin-yellow" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">Suivi de votre colis</h1>
          <p className="text-xs font-mono mt-1.5 text-slate-500 dark:text-slate-400 bg-slate-200/60 dark:bg-slate-800 inline-block px-2.5 py-1 rounded-md">
            ID: {command.trackingCode}
          </p>
        </div>

        {/* CARTE GOOGLE MAPS */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-800 h-[320px] relative">
          {isLoaded ? (
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={KINSHASA_CENTER}
              zoom={13}
              options={{
                styles: mapStyles,
                disableDefaultUI: true,
                zoomControl: true,
              }}
            >
              <Marker position={KINSHASA_CENTER} />
            </GoogleMap>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-900/50">
              <span className="text-slate-400 text-sm font-medium animate-pulse flex items-center gap-2">
                <MapPin size={18}/> Chargement de la carte...
              </span>
            </div>
          )}
          
          <div className="absolute top-4 left-4 bg-white/80 dark:bg-slate-900/90 backdrop-blur-md px-4 py-2.5 rounded-xl shadow-sm border border-slate-200/50 dark:border-slate-700/50 max-w-[240px]">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Destination</p>
            <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate mt-0.5">{command.clientAddress}</p>
          </div>
        </div>

        {/* RÉSUMÉ CLIENT, PRODUIT ET PAIEMENT */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* 1. Info Destinataire */}
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 bg-flashkin-blue/5 dark:bg-flashkin-blue/10 rounded-xl flex items-center justify-center text-flashkin-blue shrink-0">
              <User size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Destinataire</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white capitalize truncate mt-0.5">{command.clientName}</p>
            </div>
          </div>

          {/* 2. Info Produit */}
          <div className="flex items-center gap-3.5 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6">
            <div className="w-10 h-10 bg-purple-50 dark:bg-purple-950/30 rounded-xl flex items-center justify-center text-purple-500 shrink-0">
              <ShoppingBag size={20} />
            </div>
            <div className="overflow-hidden">
              <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Produit</p>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 line-clamp-1 mt-0.5" title={command.details}>
                {command.details}
              </p>
            </div>
          </div>
          
          {/* 3. Info Paiement */}
          <div className="flex items-center gap-3.5 md:border-l md:border-slate-100 md:dark:border-slate-800 md:pl-6">
            <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
              <Banknote size={20} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-emerald-600/90 dark:text-emerald-500/90 uppercase tracking-wider">À payer</p>
              <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                {command.amountToCollect} <span className="text-sm font-medium">$</span>
              </p>
            </div>
          </div>
        </div>

        {/* TIMELINE DE LIVRAISON */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
          <div className="relative pt-2">
            {/* Ligne de fond */}
            <div className="absolute top-7 left-0 w-full h-0.5 bg-slate-100 dark:bg-slate-800 rounded-full"></div>
            {/* Ligne active */}
            <div 
              className="absolute top-7 left-0 h-0.5 bg-flashkin-blue rounded-full transition-all duration-700 ease-in-out"
              style={{ width: `${((currentStep - 1) / 3) * 100}%` }}
            ></div>

            <div className="relative flex justify-between">
              {[
                { step: 1, icon: Package, label: "Enregistré" },
                { step: 2, icon: Truck, label: "Pris en charge" },
                { step: 3, icon: Clock, label: "En route" },
                { step: 4, icon: CheckCircle2, label: "Livré" }
              ].map((item) => {
                const IconComponent = item.icon;
                const isPast = currentStep > item.step;
                const isActive = currentStep === item.step;
                
                return (
                  <div key={item.step} className="flex flex-col items-center gap-2.5 native-step">
                    <div className="relative">
                      {isActive && (
                        <span className="absolute -inset-1 rounded-full bg-flashkin-blue/20 dark:bg-flashkin-blue/30 animate-ping opacity-75"></span>
                      )}
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 relative transition-all ${
                        isPast || isActive
                          ? 'bg-flashkin-blue text-white shadow-sm shadow-blue-500/10' 
                          : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                    </div>
                    <span className={`text-[11px] font-medium tracking-tight ${
                      isActive ? 'text-flashkin-blue font-semibold' : isPast ? 'text-slate-600 dark:text-slate-400' : 'text-slate-400 dark:text-slate-500'
                    }`}>
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* INFO DU LIVREUR */}
        {command.flashman && (
          <div className="bg-slate-900 dark:bg-slate-800 text-white p-5 rounded-2xl shadow-sm flex items-center justify-between border border-transparent dark:border-slate-700/50">
            <div>
              <p className="text-[10px] font-bold text-flashkin-yellow uppercase tracking-wider">Votre coursier Flashman</p>
              <p className="text-base font-bold mt-0.5">{command.flashman.firstName} {command.flashman.lastName}</p>
            </div>
            <div className="w-11 h-11 bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
              <Truck size={20} className="text-flashkin-yellow" />
            </div>
          </div>
        )}

        {/* FOOTER */}
        <footer className="text-center pt-4 text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide">
          Propulsé par Flashkin Delivery © {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}