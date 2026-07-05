import { useState, useEffect } from 'react';
import axios from 'axios';
import { Tag, Map, ShieldCheck, ArrowRight, Info, MapPin } from 'lucide-react';
import PageLoader from '../components/PageLoader';
import { Link } from 'react-router-dom';

export default function Pricing() {
  const [zones, setZones] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchZones = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:3000/api/zones', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.data.success) {
          setZones(response.data.zones);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tarifs", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchZones();
  }, []);

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-6xl mx-auto space-y-8">
      
      {/* EN-TÊTE */}
      <div className="text-center max-w-2xl mx-auto mb-12">
        <div className="w-16 h-16 bg-flashkin-blue/10 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 text-flashkin-blue dark:text-flashkin-yellow">
          <Tag size={32} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-4">
          Transparence totale sur nos tarifs
        </h2>
        <p className="text-gray-500 dark:text-gray-400 font-medium text-lg">
          Découvrez nos zones de couverture à Kinshasa. Pas de frais cachés, vous savez exactement ce que vous payez et ce que vous encaissez.
        </p>
      </div>

      {/* LE CATALOGUE DES ZONES */}
      {zones.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:-translate-y-1 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-flashkin-blue/5 rounded-bl-full group-hover:bg-flashkin-blue/10 transition-colors"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-flashkin-blue dark:bg-gray-900 text-flashkin-yellow rounded-xl shadow-md">
                    <Map size={24} />
                  </div>
                  <h3 className="text-xl font-black text-gray-900 dark:text-white">{zone.name}</h3>
                </div>
                
                <div className="mb-6">
                  <span className="text-4xl font-black text-flashkin-blue dark:text-white">{zone.totalPrice}$</span>
                  <span className="text-gray-500 dark:text-gray-400 font-medium"> / course</span>
                </div>

                <div className="space-y-3 border-t border-gray-100 dark:border-gray-700 pt-6">
                  <p className="text-sm font-bold text-gray-900 dark:text-gray-300 flex items-center gap-2 mb-2">
                    <MapPin size={16} className="text-flashkin-yellow" /> Communes couvertes :
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {zone.communes.map((commune, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 text-xs font-bold rounded-lg border border-gray-200 dark:border-gray-700">
                        {commune}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Si l'admin n'a pas encore créé de zones */
        <div className="text-center p-12 bg-white dark:bg-gray-800 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700">
          <Map className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Catalogue en cours de mise à jour</h3>
          <p className="text-gray-500 dark:text-gray-400">Les zones de livraison seront disponibles très bientôt.</p>
        </div>
      )}

      {/* BLOC EXPLICATIF "LA MAGIE FINANCIÈRE" */}
      <div className="mt-12 bg-gradient-to-r from-flashkin-blue to-[#162d3e] rounded-3xl p-8 md:p-10 shadow-xl text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck size={200} />
        </div>
        
        <div className="relative z-10 md:w-2/3">
          <h3 className="text-2xl font-black text-flashkin-yellow mb-4 flex items-center gap-3">
            <Info size={28} /> Comment fonctionne l'encaissement ?
          </h3>
          <p className="text-blue-50 text-lg leading-relaxed mb-6 font-medium">
            Avec Flashkin, vous ne payez jamais la livraison de votre poche à l'avance. Le livreur encaisse la totalité auprès de votre client final.
          </p>
          
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold mb-3 uppercase tracking-wider text-sm text-blue-200">Exemple concret :</h4>
            <ul className="space-y-3 font-medium">
              <li className="flex justify-between items-center">
                <span>1. Prix de votre produit (à encaisser)</span>
                <span className="font-bold">50.00 $</span>
              </li>
              <li className="flex justify-between items-center">
                <span>2. Frais de livraison (ex: Zone A)</span>
                <span className="font-bold text-red-300">- 5.00 $</span>
              </li>
              <li className="flex justify-between items-center pt-3 border-t border-white/20 text-xl text-flashkin-yellow">
                <span className="font-black">Net ajouté à votre Solde</span>
                <span className="font-black">+ 45.00 $</span>
              </li>
            </ul>
          </div>

          <Link to="/dashboard/create" className="inline-flex items-center gap-2 mt-8 bg-white text-flashkin-dark font-bold px-8 py-4 rounded-xl hover:bg-gray-50 transition-colors group">
            Commencer à expédier <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

    </div>
  );
}