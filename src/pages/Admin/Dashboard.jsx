import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Users, Wallet, Package, BarChart3, ShieldCheck, Sparkles } from 'lucide-react';

const overviewCards = [
  {
    title: 'Partenaires actifs',
    value: '138',
    description: 'Connectes sur la plateforme',
    icon: Users,
    accent: 'bg-sky-100 text-sky-600',
  },
  {
    title: 'Commandes traitees',
    value: '1 276',
    description: 'Livrees ces 24 dernieres heures',
    icon: Package,
    accent: 'bg-emerald-100 text-emerald-600',
  },
  {
    title: 'Revenus totaux',
    value: '34 520$',
    description: 'CA global estime',
    icon: Wallet,
    accent: 'bg-amber-100 text-amber-600',
  },
  {
    title: 'Alerts critiques',
    value: '9',
    description: 'Demandes a verifier',
    icon: ShieldCheck,
    accent: 'bg-rose-100 text-rose-600',
  },
];

export default function AdminDashboard() {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-8 pb-10">
      <section className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-8 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400 dark:text-slate-500">Tableau de bord admin</p>
            <h1 className="mt-3 text-3xl font-black text-slate-900 dark:text-white">Bienvenue, {user?.firstName || 'Administrateur'}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400 max-w-2xl">
              Vue globale du Control Tower Flashkin : performances, activites et priorites operationnelles.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-4 py-3 shadow-sm">
            <LayoutDashboard size={20} className="text-slate-700 dark:text-slate-200" />
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-400 dark:text-slate-500">Synchronisation</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Mise a jour en direct</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {overviewCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
              <div className={`inline-flex rounded-2xl p-3 ${card.accent}`}>
                <Icon size={20} />
              </div>
              <p className="mt-4 text-sm font-semibold uppercase tracking-[0.24em] text-slate-400 dark:text-slate-500">{card.title}</p>
              <p className="mt-3 text-3xl font-black text-slate-900 dark:text-white">{card.value}</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{card.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Priorites du jour</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Suivez les actions urgentes et les incidents a traiter.</p>
            </div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600 dark:bg-slate-800 dark:text-slate-200">
              <Sparkles size={14} /> Prioritaire
            </span>
          </div>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Verifier les alertes de conformite</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">3 incidents identifies dans les 2 dernieres heures.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Repondre aux demandes partenaires</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">15 tickets ouverts necessitent une validation.</p>
            </div>
            <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Controler la tresorerie</p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Solde global positif, reste a confirmer le flux des 24h.</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 shadow-sm">
          <h2 className="text-xl font-black text-slate-900 dark:text-white">Apercu des operations</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Statuts recents et volume d'activite de la journee.</p>

          <div className="mt-6 space-y-4">
            <div className="flex items-start gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <BarChart3 size={22} className="text-slate-700 dark:text-slate-200 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Trafic eleve</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">+18 % de commandes traitees compare a hier.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <Wallet size={22} className="text-emerald-500 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Revenus stables</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Marge nette maintenue a 27 %.</p>
              </div>
            </div>
            <div className="flex items-start gap-4 rounded-3xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-4">
              <Users size={22} className="text-sky-500 mt-1" />
              <div>
                <p className="font-semibold text-slate-900 dark:text-white">Partenaires actifs</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">138 partenaires connectes actuellement.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
