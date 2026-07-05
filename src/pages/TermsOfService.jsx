import { Link } from 'react-router-dom';
import { ShieldCheck, User, MapPin, Bot, Wallet, AlertTriangle, ArrowLeft } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-flashkin-yellow selection:text-flashkin-dark">
      {/* En-tête simple */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-flashkin-dark hover:text-flashkin-blue transition-colors font-bold">
            <ArrowLeft size={20} /> Retour à l'accueil
          </Link>
          <div className="font-black tracking-tight uppercase text-xl">
            <span className="text-flashkin-blue">Flashkin</span>{' '}
            <span className="text-flashkin-yellow">Delivery</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-flashkin-blue px-3 py-1 rounded-full text-sm font-bold mb-4">
            <ShieldCheck size={16} /> Contrat de confiance
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Conditions d'utilisation</h1>
          <p className="text-lg text-gray-600">Dernière mise à jour : Juin 2026. Veuillez lire attentivement ces conditions avant d'utiliser la plateforme Flashkin Delivery.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
          
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <User className="text-flashkin-blue"/> 1. Compte & Responsabilités
            </h2>
            <p className="leading-relaxed mb-4">Pour garantir un écosystème sûr, chaque partenaire et livreur s'engage à :</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 marker:text-flashkin-yellow">
              <li>Fournir des informations exactes, complètes et vérifiables lors de l'inscription.</li>
              <li>Maintenir la sécurité de ses identifiants. Toute activité réalisée depuis un compte est sous la responsabilité de son titulaire.</li>
              <li><strong>Utilisation acceptable :</strong> La création de fausses commandes, l'usurpation d'identité, la fraude ou l'utilisation abusive du service entraîneront une suspension immédiate.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <MapPin className="text-flashkin-blue"/> 2. Suivi et Livraisons
            </h2>
            <p className="leading-relaxed mb-4">Le cycle d'une commande offre une transparence totale. Il se déroule comme suit :</p>
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-sm font-medium text-flashkin-dark flex flex-col sm:flex-row items-center gap-3 mb-6 justify-center text-center">
              <span className="bg-white px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">Commande créée</span>
              <span className="hidden sm:block text-flashkin-blue">→</span>
              <span className="bg-white px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">Livreur assigné</span>
              <span className="hidden sm:block text-flashkin-blue">→</span>
              <span className="bg-white px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">En route</span>
              <span className="hidden sm:block text-flashkin-blue">→</span>
              <span className="bg-green-50 text-green-700 border border-green-200 px-4 py-2 rounded-xl shadow-sm w-full sm:w-auto">Livraison validée</span>
            </div>
            <p className="leading-relaxed"><strong>Preuve de livraison :</strong> La validation requiert un horodatage et une géolocalisation pour garantir la sécurité de la transaction.</p>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <Bot className="text-flashkin-blue"/> 3. Assistant IA Flashkin
            </h2>
            <p className="leading-relaxed mb-4">Notre intelligence artificielle simplifie la création de commandes par extraction de texte brut (ex: depuis un message WhatsApp).</p>
            <div className="bg-yellow-50/50 border-l-4 border-flashkin-yellow p-4 rounded-r-xl text-yellow-900">
              <strong>Limites de responsabilité :</strong> Bien que notre IA soit performante, l'utilisateur a l'obligation stricte de vérifier les données extraites (adresse, numéro, montant) avant la validation définitive de la commande. Flashkin décline toute responsabilité en cas de livraison erronée due à une information non vérifiée.
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <Wallet className="text-flashkin-blue"/> 4. Gestion Financière (COD)
            </h2>
            <p className="leading-relaxed mb-4">Le système Cash On Delivery (paiement à la livraison) est géré via le Portefeuille Flashkin :</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700 marker:text-flashkin-yellow">
              <li>Les encaissements réalisés par le Flashman sont sécurisés et crédités sur le portefeuille virtuel du Partenaire.</li>
              <li>Les demandes de retrait sont validées manuellement par nos administrateurs pour des raisons de sécurité, généralement sous 24 à 48 heures ouvrées.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 flex items-center gap-3 mb-4 pb-2 border-b border-gray-100">
              <AlertTriangle className="text-flashkin-blue"/> 5. Litiges et Réclamations
            </h2>
            <p className="leading-relaxed">En cas de problème, un signalement doit être ouvert depuis le tableau de bord. Notre équipe d'administrateurs mènera une enquête en se basant sur les historiques GPS, les preuves de livraison et les communications internes pour résoudre le litige de manière équitable.</p>
          </section>

        </div>
      </main>
    </div>
  );
}