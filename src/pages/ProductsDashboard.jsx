import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Plus, Box, Edit2, Trash2, Filter, Loader2 } from 'lucide-react';
import FeedbackModal from '../components/FeedbackModal';
import PageLoader from '../components/PageLoader';

export default function ProductsDashboard() {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // États de l'interface
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Si null = Création, sinon = Modification
  const [feedback, setFeedback] = useState({ isOpen: false, type: '', title: '', message: '' });

  // Formulaire
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '' });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/products', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setProducts(response.data.products);
      }
    } catch (error) {
      console.error("Erreur de chargement du catalogue", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Ouvrir la modale pour l'édition
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({ 
      name: product.name, 
      category: product.category, 
      price: product.price, 
      stock: product.stock 
    });
    setIsModalOpen(true);
  };

  // Fermer et réinitialiser la modale
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', stock: '' });
  };

  // Soumission du formulaire (Création OU Modification)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const token = localStorage.getItem('token');
      
      if (editingProduct) {
        // Mode UPDATE
        await axios.put(`http://localhost:3000/api/products/${editingProduct.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedback({ isOpen: true, type: 'success', title: 'Produit mis à jour', message: 'Les modifications ont bien été enregistrées.' });
      } else {
        // Mode CREATE
        await axios.post('http://localhost:3000/api/products', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setFeedback({ isOpen: true, type: 'success', title: 'Produit ajouté', message: 'Le produit a été intégré à votre catalogue avec succès.' });
      }
      
      closeModal();
      fetchProducts();
    } catch (error) {
      setFeedback({ isOpen: true, type: 'error', title: 'Échec', message: error.response?.data?.message || 'Une erreur est survenue.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchProducts();
      setFeedback({ isOpen: true, type: 'success', title: 'Produit retiré', message: 'Le produit a été désactivé de votre catalogue.' });
    } catch (error) {
      setFeedback({ isOpen: true, type: 'error', title: 'Erreur', message: 'Impossible de supprimer ce produit.' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const StockBadge = ({ stock }) => {
    if (stock === 0) return <span className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap">Rupture</span>;
    if (stock <= 5) return <span className="bg-orange-50 dark:bg-orange-900/10 text-orange-600 dark:text-orange-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap">Faible ({stock})</span>;
    return <span className="bg-green-50 dark:bg-emerald-900/10 text-green-600 dark:text-emerald-300 px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider whitespace-nowrap">Normal ({stock})</span>;
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans animate-fade-in px-4 sm:px-0 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen py-6">
      
      <FeedbackModal 
        isOpen={feedback.isOpen} type={feedback.type} title={feedback.title} message={feedback.message}
        onClose={() => setFeedback({ ...feedback, isOpen: false })} 
      />

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Catalogue Produits</h1>
          <p className="text-gray-500 text-sm font-medium">Gérez votre inventaire pour l'automatisation des commandes.</p>
        </div>
        <button 
          type="button" // Empêche le comportement de lien par défaut
          onClick={() => setIsModalOpen(true)} 
          className="w-full sm:w-auto bg-[#0A0F1C] text-[#EAB308] font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md text-sm"
        >
          <Plus size={18} /> Nouveau produit
        </button>
      </div>

      {/* BARRE DE RECHERCHE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-200 dark:border-slate-700 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500" size={18} />
          <input 
            type="text" placeholder="Rechercher un produit..." 
            value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 focus:border-gray-200 dark:focus:border-slate-600 focus:bg-white dark:focus:bg-slate-800 rounded-xl outline-none text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 transition-all"
          />
        </div>
        <button className="w-full sm:w-auto p-2.5 border border-gray-200 dark:border-slate-700 text-gray-600 dark:text-slate-300 rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
          <Filter size={18} />
        </button>
      </div>

      {/* TABLEAU DES PRODUITS (RESPONSIVE) */}
      <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-[1.5rem] shadow-sm overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 font-semibold border-b border-gray-100 dark:border-slate-700">
              <tr>
                <th className="px-4 sm:px-6 py-4">Produit</th>
                <th className="px-4 sm:px-6 py-4">Catégorie</th>
                <th className="px-4 sm:px-6 py-4">Prix</th>
                <th className="px-4 sm:px-6 py-4">Stock</th>
                <th className="px-4 sm:px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-800/70 transition-colors">
                    <td className="px-4 sm:px-6 py-4 font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-gray-400 dark:text-slate-500 shrink-0"><Box size={18} /></div>
                      <span className="truncate max-w-[120px] sm:max-w-none">{product.name}</span>
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400">{product.category}</td>
                    <td className="px-4 sm:px-6 py-4 font-black text-slate-900 dark:text-slate-100">{product.price} $</td>
                    <td className="px-4 sm:px-6 py-4"><StockBadge stock={product.stock} /></td>
                    <td className="px-4 sm:px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1 sm:gap-2">
                        <button onClick={() => openEditModal(product)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(product.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-400">
                    <Box size={32} className="mx-auto mb-3 opacity-50" />
                    <p>Aucun produit trouvé.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL AJOUT / MODIFICATION */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-[#0A0F1C]/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[1.5rem] shadow-2xl relative z-10 p-6 sm:p-8 animate-fade-in max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-700">
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100 mb-6">
              {editingProduct ? 'Modifier le produit' : 'Ajouter au catalogue'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Nom du produit</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#0A0F1C] dark:focus:border-[#f4c414] transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="Ex: Nike Air Force 1" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Catégorie</label>
                <input type="text" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#0A0F1C] dark:focus:border-[#f4c414] transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="Ex: Chaussures" />
              </div>
              
              {/* Grille responsive : 1 colonne sur mobile, 2 sur écrans plus larges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Prix ($)</label>
                  <input type="number" step="0.01" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#0A0F1C] dark:focus:border-[#f4c414] transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="0.00" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1.5">Stock</label>
                  <input type="number" required value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} className="w-full p-3 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl outline-none focus:border-[#0A0F1C] dark:focus:border-[#f4c414] transition-all text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500" placeholder="10" />
                </div>
              </div>
              
              <div className="pt-4 flex flex-col-reverse sm:flex-row gap-3">
                <button type="button" onClick={closeModal} disabled={isSubmitting} className="w-full sm:flex-1 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors">
                  Annuler
                </button>
                <button type="submit" disabled={isSubmitting} className="w-full sm:flex-1 py-3 bg-[#0A0F1C] text-white font-bold rounded-xl hover:bg-gray-800 transition-colors shadow-md flex items-center justify-center gap-2">
                  {isSubmitting ? (
                    <>
                      <Loader2 size={18} className="animate-spin" /> 
                      Patientez...
                    </>
                  ) : (
                    editingProduct ? 'Mettre à jour' : 'Enregistrer'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}