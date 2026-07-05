import { CheckCircle2, XCircle } from 'lucide-react';

export default function ActionModal({ isOpen, status, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center flex flex-col items-center transform transition-all scale-100 animate-scale-up">
        
        {/* État : CHARGEMENT */}
        {status === 'loading' && (
          <div className="relative w-20 h-20 mb-6">
            {/* Le cercle qui tourne aux couleurs Flashkin */}
            <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-flashkin-yellow border-t-flashkin-blue rounded-full animate-spin"></div>
            {/* Le petit éclair au centre */}
            <div className="absolute inset-0 flex items-center justify-center animate-pulse">
              <svg className="w-8 h-8 text-flashkin-blue" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}

        {/* État : SUCCÈS */}
        {status === 'success' && (
          <div className="mb-6 animate-bounce-short">
            <CheckCircle2 className="w-20 h-20 text-green-500" />
          </div>
        )}

        {/* État : ERREUR */}
        {status === 'error' && (
          <div className="mb-6 animate-shake">
            <XCircle className="w-20 h-20 text-red-500" />
          </div>
        )}

        <h3 className="text-xl font-black text-gray-900 mb-2">
          {status === 'loading' ? 'Traitement en cours...' : status === 'success' ? 'Succès !' : 'Oups...'}
        </h3>
        <p className="text-gray-500 font-medium">{message}</p>
      </div>
    </div>
  );
}