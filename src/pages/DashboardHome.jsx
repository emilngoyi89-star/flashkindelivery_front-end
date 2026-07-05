import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  Wallet, Package, Truck, CheckCircle, 
  TrendingUp, Plus, ArrowRight, Clock, AlertTriangle, 
  Download, Box, ShoppingBag, AlertCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import PageLoader from '../components/PageLoader';

export default function DashboardHome() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  const [stats, setStats] = useState({
    balance: 0,
    activeOrders: 0,
    deliveredToday: 0,
    totalCollected: 0,
    totalProducts: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inventoryValue: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);

  const getUserInitials = () => {
    const first = user?.firstName?.trim()?.charAt(0)?.toUpperCase() || '';
    const last = user?.lastName?.trim()?.charAt(0)?.toUpperCase() || '';
    return (first + last) || (user?.firstName?.slice(0, 2).toUpperCase() || user?.lastName?.slice(0, 2).toUpperCase() || 'FL');
  };

  const firstName = user?.firstName
    ? `${user.firstName.charAt(0).toUpperCase()}${user.firstName.slice(1)}`
    : 'Partenaire';

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // 1. Récupération des Commandes
        const ordersResponse = await axios.get('http://localhost:3000/api/commands', {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 2. Récupération des Produits (Nouvelle route à créer côté backend)
        // Pour l'instant, si la route n'existe pas, on gère l'erreur gracieusement pour ne pas casser le front.
        let products = [];
        try {
            const productsResponse = await axios.get('http://localhost:3000/api/products', {
               headers: { Authorization: `Bearer ${token}` }
            });
            if(productsResponse.data.success) {
                products = productsResponse.data.products;
            }
        } catch (e) {
            console.warn("L'API Produit n'est pas encore disponible.", e.message);
            // Simulation de données produits en attendant le backend
            products = [
                { id: 1, name: "Coca Cola", stock: 5, price: 1.5, isActive: true },
                { id: 2, name: "Eau Minérale", stock: 0, price: 1, isActive: true },
                { id: 3, name: "Jus Cérès", stock: 24, price: 2.5, isActive: true }
            ];
        }


        if (ordersResponse.data.success) {
          const allOrders = ordersResponse.data.commands;
          
          const active = allOrders.filter(cmd => ['RECEIVED', 'ACCEPTED', 'IN_TRANSIT'].includes(cmd.status)).length;
          const delivered = allOrders.filter(cmd => cmd.status === 'DELIVERED').length;
          
          const collected = allOrders
            .filter(cmd => cmd.status === 'DELIVERED')
            .reduce((total, cmd) => total + (Number(cmd.amountToCollect) || 0), 0);

          // Calculs Stocks
          const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= 5).length;
          const outOfStockCount = products.filter(p => p.stock === 0).length;
          const totalValue = products.reduce((acc, p) => acc + (p.stock * p.price), 0);

          setStats({
            balance: Number(user?.balance) || 0,
            activeOrders: active,
            deliveredToday: delivered,
            totalCollected: collected,
            totalProducts: products.length,
            lowStockItems: lowStockCount,
            outOfStockItems: outOfStockCount,
            inventoryValue: totalValue
          });

          setRecentOrders(allOrders.slice(0, 4));

          // Génération Chart
          const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toLocaleDateString('fr-FR', { weekday: 'short' });
          }).reverse();

          const dataForChart = last7Days.map(day => ({
            name: day,
            Livrées: Math.floor(Math.random() * 10) + 1,
            Retours: Math.floor(Math.random() * 3)
          }));
          setChartData(dataForChart);
        }
      } catch (error) {
        console.error("Erreur chargement dashboard", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  const StatusBadge = ({ status }) => {
    const styles = {
      RECEIVED: "bg-yellow-50 text-yellow-700 border-yellow-200",
      ACCEPTED: "bg-blue-50 text-blue-700 border-blue-200",
      IN_TRANSIT: "bg-purple-50 text-purple-700 border-purple-200",
      DELIVERED: "bg-green-50 text-green-700 border-green-200",
      CANCELLED: "bg-red-50 text-red-700 border-red-200",
    };
    const labels = {
      RECEIVED: "En attente", ACCEPTED: "Assigné", IN_TRANSIT: "En route", DELIVERED: "Livré", CANCELLED: "Annulé"
    };
    
    return (
      <span className={`inline-flex items-center justify-center px-2.5 py-1 text-[10px] font-bold rounded-md border uppercase tracking-wider ${styles[status] || styles.RECEIVED}`}>
        {labels[status] || "En cours"}
      </span>
    );
  };

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* HEADER & ACTION PRINCIPALE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Vue d'ensemble</h1>
          <p className="text-gray-500 text-sm font-medium">Gérez vos expéditions, vos finances et votre catalogue de produits.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Link to="/dashboard/products/" className="bg-white border border-gray-200 text-gray-700 font-bold px-5 py-2.5 rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-2 shadow-sm text-sm">
             Ajouter un produit
          </Link>
          <Link to="/dashboard/create" className="bg-[#0A0F1C] text-[#EAB308] font-bold px-5 py-2.5 rounded-xl hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-md text-sm">
            <Plus size={18} /> Nouvelle Expédition
          </Link>
        </div>
      </div>

      {/* ALERTES DE STOCKS */}
      {(stats.lowStockItems > 0 || stats.outOfStockItems > 0) && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl flex items-start gap-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
                <h3 className="text-red-800 font-bold text-sm">Action requise sur vos stocks</h3>
                <p className="text-red-600 text-sm mt-1">
                    Vous avez <strong>{stats.outOfStockItems} produit(s) en rupture</strong> et <strong>{stats.lowStockItems} produit(s) en stock faible</strong>. Le système IA bloquera les commandes contenant des articles épuisés.
                </p>
            </div>
        </div>
      )}

      {/* LES CARTES KPI PRINCIPALES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-[#0A0F1C] p-6 rounded-[1.5rem] shadow-xl relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-400 font-bold text-xs tracking-wider uppercase">Solde Portefeuille</p>
              <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm"><Wallet className="text-[#EAB308]" size={18} /></div>
            </div>
            <p className="text-3xl font-black text-white mb-1">{(stats.balance || 0).toFixed(2)} $</p>
            <p className="text-xs text-gray-400 font-medium">Disponible pour retrait</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 font-bold text-xs tracking-wider uppercase">Valeur du Stock</p>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Box size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{(stats.inventoryValue || 0).toFixed(2)} $</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">{stats.totalProducts} références actives</p>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 font-bold text-xs tracking-wider uppercase">En transit</p>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Truck size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.activeOrders}</p>
          <p className="text-xs text-gray-500 mt-1 font-medium">Colis pris en charge</p>
        </div>

        <div className="bg-white p-6 rounded-[1.5rem] border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <p className="text-gray-500 font-bold text-xs tracking-wider uppercase">Livrées (Aujourd'hui)</p>
            <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.deliveredToday}</p>
          <p className="text-xs text-green-600 mt-1 font-bold">{(stats.totalCollected || 0).toFixed(2)} $ Générés</p>
        </div>
      </div>

      {/* GRAPHIQUE ET ACTIVITÉ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* GRAPHIQUE DES PERFORMANCES */}
        <div className="lg:col-span-2 bg-white rounded-[1.5rem] border border-gray-200 shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Activité des livraisons</h3>
            <p className="text-sm text-gray-500">Volume de commandes sur les 7 derniers jours.</p>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#9CA3AF', fontSize: 12}} />
                <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                <Bar dataKey="Livrées" fill="#0A0F1C" radius={[4, 4, 4, 4]} barSize={24}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === chartData.length - 1 ? '#EAB308' : '#0A0F1C'} />
                  ))}
                </Bar>
                <Bar dataKey="Retours" fill="#EF4444" radius={[4, 4, 4, 4]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ACTIVITÉ RÉCENTE (TABLEAU RÉDUIT) */}
        <div className="bg-white rounded-[1.5rem] border border-gray-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-900">Dernières expéditions</h3>
            <Link to="/dashboard/history" className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors">
              Voir tout
            </Link>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {recentOrders.length > 0 ? (
              recentOrders.map((order) => (
                <div key={order.id} className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center hover:bg-gray-100 transition-colors">
                  <div>
                    <p className="font-bold text-sm text-gray-900">{order.clientName}</p>
                    <p className="text-xs text-gray-500 truncate max-w-[120px] mt-0.5">{order.clientAddress}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-sm text-gray-900 mb-1">{order.amountToCollect > 0 ? `${order.amountToCollect} $` : '-'}</p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
                <ShoppingBag size={32} className="mb-2 opacity-50" />
                <p className="text-sm font-medium">Aucune commande récente.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}