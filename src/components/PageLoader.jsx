export default function PageLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <div className="relative w-24 h-24 mb-6">
        {/* Cercles tournants */}
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-flashkin-yellow border-t-flashkin-blue rounded-full animate-spin"></div>
        {/* Éclair central */}
        <div className="absolute inset-0 flex items-center justify-center animate-pulse">
          <svg className="w-10 h-10 text-flashkin-blue" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-bold text-gray-400 tracking-widest uppercase">Chargement...</h3>
    </div>
  );
}