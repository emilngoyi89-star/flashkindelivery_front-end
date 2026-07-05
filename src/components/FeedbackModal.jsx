import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function FeedbackModal({ isOpen, type, title, message, onClose }) {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 font-sans">
        {/* Fond assombri et flouté */}
        <motion.div 
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          onClick={onClose} 
          className="absolute inset-0 bg-[#0A0F1C]/70 backdrop-blur-sm"
        />
        
        {/* La boîte modale */}
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl relative z-10 overflow-hidden text-center p-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-900 transition-colors">
            <X size={20} />
          </button>

          <div className="flex justify-center mb-5">
            {isSuccess ? (
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center">
                <CheckCircle2 size={32} className="text-green-600" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-600" />
              </div>
            )}
          </div>

          <h3 className="text-xl font-black text-gray-900 mb-2">{title}</h3>
          <p className="text-sm text-gray-500 mb-8 leading-relaxed">{message}</p>

          <button 
            onClick={onClose}
            className={`w-full py-3.5 rounded-xl font-bold transition-all ${
              isSuccess 
                ? 'bg-[#0A0F1C] text-white hover:bg-gray-800 shadow-md' 
                : 'bg-red-50 text-red-600 hover:bg-red-100'
            }`}
          >
            {isSuccess ? 'Continuer' : 'J\'ai compris'}
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}