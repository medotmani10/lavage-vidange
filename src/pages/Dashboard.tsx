import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../stores/useAuthStore';
import {
  TrendingUp,
  Clock,
  CheckCircle,
  Users,
  AlertTriangle,
  DollarSign,
  ShoppingCart,
  Car,
  ArrowRight,
  Activity,
} from 'lucide-react';
import { Card } from '../components/Card';
import { Button } from '../components/Button';

interface Stats {
  daily_revenue: number;
  current_queue: number;
  completed_today: number;
  total_customers: number;
  low_stock: number;
  pending_debts: number;
}

export function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [stats, setStats] = useState<Stats>({
    daily_revenue: 0,
    current_queue: 0,
    completed_today: 0,
    total_customers: 0,
    low_stock: 0,
    pending_debts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [queueRes, customersRes, stockRes] = await Promise.all([
          supabase.from('queue_tickets').select('status, total_amount, created_at'),
          supabase.from('customers').select('id', { count: 'exact', head: true }),
          supabase.from('products').select('id', { count: 'exact', head: true })
            .lte('stock_quantity', 5),
        ]);

        const tickets: Array<{ status: string, total_amount: number | null, created_at: string | null }> = queueRes.data || [];
        const today = new Date().toISOString().split('T')[0];
        const todayTickets = tickets.filter(t => t.created_at?.startsWith(today));

        setStats({
          daily_revenue: todayTickets
            .filter(t => t.status === 'completed')
            .reduce((s, t) => s + (t.total_amount || 0), 0),
          current_queue: tickets.filter(t => ['pending', 'in_progress'].includes(t.status)).length,
          completed_today: todayTickets.filter(t => t.status === 'completed').length,
          total_customers: customersRes.count || 0,
          low_stock: stockRes.count || 0,
          pending_debts: 0,
        });
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      label: "Revenu du jour",
      value: `${stats.daily_revenue.toLocaleString()} DZD`,
      icon: DollarSign,
      iconColor: 'text-success-500',
      iconBg: 'bg-success-500/10',
      trend: '+12%',
      trendUp: true,
    },
    {
      label: "File d'attente",
      value: stats.current_queue.toString(),
      icon: Clock,
      iconColor: 'text-primary-500',
      iconBg: 'bg-primary-500/10',
      trend: 'En cours',
      trendUp: null,
    },
    {
      label: "Terminés aujourd'hui",
      value: stats.completed_today.toString(),
      icon: CheckCircle,
      iconColor: 'text-blue-500',
      iconBg: 'bg-blue-500/10',
      trend: 'Tickets',
      trendUp: null,
    },
    {
      label: "Total clients",
      value: stats.total_customers.toString(),
      icon: Users,
      iconColor: 'text-purple-500',
      iconBg: 'bg-purple-500/10',
      trend: 'Inscrits',
      trendUp: null,
    },
    {
      label: "Stock critique",
      value: stats.low_stock.toString(),
      icon: AlertTriangle,
      iconColor: 'text-warning-500',
      iconBg: 'bg-warning-500/10',
      trend: 'Produits',
      trendUp: null,
    },
    {
      label: "Revenus totaux",
      value: '0 DZD',
      icon: TrendingUp,
      iconColor: 'text-emerald-500',
      iconBg: 'bg-emerald-500/10',
      trend: 'Ce mois',
      trendUp: true,
    },
  ];

  const quickActions = [
    { label: "Nouveau ticket", icon: ShoppingCart, href: '/queue?new=true', iconBg: 'bg-primary-500/10', iconColor: 'text-primary-500', border: 'border-primary-500/20' },
    { label: "File d'attente", icon: Clock, href: '/queue', iconBg: 'bg-blue-500/10', iconColor: 'text-blue-500', border: 'border-blue-500/20' },
    { label: "Ajouter client", icon: Users, href: '/customers', iconBg: 'bg-success-500/10', iconColor: 'text-success-500', border: 'border-success-500/20' },
    { label: "Vehicles", icon: Car, href: '/vehicles', iconBg: 'bg-purple-500/10', iconColor: 'text-purple-500', border: 'border-purple-500/20' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Bonjour, <span className="text-gradient">{user?.full_name?.split(' ')[0] || 'Admin'}</span> 👋
          </h1>
          <p className="text-sm mt-1 text-[var(--text-muted)]">
            {new Date().toLocaleDateString('fr-DZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Button onClick={() => navigate('/queue?new=true')} size="md" className="shrink-0 w-full sm:w-auto">
          <ShoppingCart className="w-4 h-4" />
          Nouveau ticket
        </Button>
      </div>

      {/* ── Stats Grid ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((s) => (
          <div key={s.label} className="bg-[var(--bg-surface)] border border-[var(--border)] rounded-[var(--radius-lg)] p-5 transition-all duration-300 hover:border-[var(--border-lg)] hover:-translate-y-1 hover:shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>
            {/* Icon */}
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${s.iconBg}`}>
              <s.icon className={`w-6 h-6 ${s.iconColor}`} />
            </div>
            {/* Value */}
            {loading ? (
              <div className="h-8 w-2/3 bg-[var(--bg-panel)] animate-pulse rounded-md mb-2" />
            ) : (
              <p className="text-2xl font-bold text-white leading-tight mb-1">{s.value}</p>
            )}
            <p className="text-sm font-medium text-[var(--text-muted)]">{s.label}</p>
            {s.trend && (
              <p
                className={`text-xs mt-2 font-medium ${s.trendUp === true ? 'text-success-400' : s.trendUp === false ? 'text-danger-400' : 'text-[var(--text-muted)]'
                  }`}
              >
                {s.trendUp === true && '↑ '}{s.trendUp === false && '↓ '}{s.trend}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* ── Quick Actions + Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <Card title="Actions rapides" className="lg:col-span-1 h-full">
          <div className="grid grid-cols-2 gap-3 h-full">
            {quickActions.map((a) => (
              <button
                key={a.label}
                onClick={() => navigate(a.href)}
                className={`flex flex-col items-center justify-center gap-3 p-4 rounded-[var(--radius)] transition-all duration-200 hover:scale-[1.03] active:scale-[0.98] border ${a.border} ${a.iconBg}`}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5">
                  <a.icon className={`w-5 h-5 ${a.iconColor}`} />
                </div>
                <span className="text-sm font-semibold text-[var(--text-secondary)] text-center leading-tight">
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        </Card>

        {/* Activity */}
        <Card
          title="Activité récente"
          description="Derniers tickets de la journée"
          className="lg:col-span-2 h-full"
          action={
            <button
              onClick={() => navigate('/queue')}
              className="flex items-center gap-1 text-sm text-primary-400 hover:text-primary-300 transition-colors font-medium"
            >
              Voir tout <ArrowRight className="w-4 h-4" />
            </button>
          }
        >
          <div className="flex flex-col items-center justify-center min-h-[220px] gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center border border-dashed border-[var(--border-lg)] bg-[var(--bg-panel)]">
              <Activity className="w-8 h-8 text-[var(--text-muted)]" />
            </div>
            <p className="text-[var(--text-muted)] text-base">
              Aucune activité récente pour le moment.
            </p>
            <Button variant="outline" onClick={() => navigate('/pos')} className="mt-2 text-sm">
              <ShoppingCart className="w-4 h-4 mr-2" />
              Créer votre premier ticket
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
