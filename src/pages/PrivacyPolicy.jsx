import { Link } from 'react-router-dom';
import { LockKeyhole, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans selection:bg-flashkin-yellow selection:text-flashkin-dark">
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
            <LockKeyhole size={16} /> Protection des données
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4">Politique de confidentialité</h1>
          <p className="text-lg text-gray-600">Nous traitons vos données avec le même soin et la même sécurité que nous exigeons pour vos colis.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 md:p-12 space-y-10">
          
          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">1. Données collectées</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-flashkin-blue/30 transition-colors">
                <strong className="text-flashkin-blue text-lg block mb-3">Données personnelles</strong>
                <p className="text-gray-600">Nom, prénom, adresse e-mail, numéro de téléphone, rôle sur la plateforme (Partenaire, Flashman, Administrateur).</p>
              </div>
              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:border-flashkin-blue/30 transition-colors">
                <strong className="text-flashkin-blue text-lg block mb-3">Données d'utilisation</strong>
                <p className="text-gray-600">Localisation GPS stricte, historique des transactions, connexions de session, données traitées par l'Assistant IA.</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">2. Utilisation de vos données</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                <div>
                  <strong className="block text-gray-900 mb-1">Exécution des livraisons</strong>
                  <span className="text-gray-600">Pour permettre le routing des Flashmans, le suivi en temps réel et l'envoi de notifications (commande acceptée, livreur assigné, livraison terminée).</span>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                <div>
                  <strong className="block text-gray-900 mb-1">Sécurité & Finance</strong>
                  <span className="text-gray-600">Pour sécuriser votre portefeuille, vérifier votre identité lors des retraits et prévenir toute tentative de fraude ou d'usurpation.</span>
                </div>
              </li>
              <li className="flex items-start gap-3 bg-white p-4 rounded-xl border border-gray-50 shadow-sm">
                <CheckCircle2 size={24} className="text-green-500 shrink-0" />
                <div>
                  <strong className="block text-gray-900 mb-1">Amélioration continue</strong>
                  <span className="text-gray-600">Pour optimiser nos itinéraires, générer des statistiques globales et affiner la compréhension de notre Assistant IA.</span>
                </div>
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-6">3. Protection et Sécurité</h2>
            <p className="leading-relaxed mb-4">
              L'écosystème Flashkin utilise des protocoles de chiffrement standards pour protéger vos sessions et vos mots de passe. 
            </p>
            <p className="leading-relaxed">
              Les accès aux données sensibles sont strictement compartimentés. Par exemple, un administrateur ne peut accéder aux détails d'une transaction que dans le cadre d'une validation de retrait ou de la résolution d'un litige ouvert.
            </p>
          </section>

        </div>
      </main>
    </div>
  );
}