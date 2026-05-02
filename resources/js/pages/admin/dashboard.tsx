import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { 
    Users, 
    CreditCard, 
    TrendingUp, 
    ArrowUpRight, 
    Clock, 
    ShieldCheck, 
    Zap,
    LayoutDashboard,
    Wallet,
    Globe
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';
import type { BreadcrumbItem } from '@/types';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AdminDashboardProps {
    stats: {
        totalTenants: number;
        activeSubscriptions: number;
        totalRevenue: number;
        platformRevenue: number;
        resellerRevenue: number;
        totalWithdrawnByResellers: number;
        newTenantsThisMonth: number;
    };
    recentTenants: any[];
    charts?: {
        revenue: {
            labels: string[];
            data: number[];
        };
        plans?: {
            name: string;
            value: number;
        }[];
    };
    recentTransactions?: any[];
    recentWithdrawals?: any[];
}

export default function AdminDashboard({ stats, recentTenants, charts, recentTransactions, recentWithdrawals }: AdminDashboardProps) {
    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '/admin/dashboard' },
        { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
    ];

    const revenueLabels = charts?.revenue?.labels || [];
    const revenueDataPoints = charts?.revenue?.data || [];
    const chartData = revenueLabels.map((label, index) => ({
        name: label,
        revenue: revenueDataPoints[index] || 0
    }));

    const planColors = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ZAWIFI Admin | Dashboard Premium" />

            <div className="flex flex-col gap-8 p-6 md:p-8 bg-slate-50/30 dark:bg-transparent min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none">
                                <Globe className="h-6 w-6 text-white" />
                            </div>
                            Administration Centrale
                        </h1>
                        <p className="text-muted-foreground font-medium mt-1">Surveillance globale de l'écosystème WiFi SaaS.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="px-4 py-2 bg-indigo-600/10 border border-indigo-600/20 rounded-full flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Temps Réel</span>
                        </div>
                    </div>
                </div>

                {/* Stat Cards Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {/* Zones Card */}
                    <div className="relative group overflow-hidden rounded-[2rem] border border-border/50 bg-card p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Users className="h-24 w-24" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-indigo-500/10 rounded-2xl">
                                    <Users className="h-6 w-6 text-indigo-600" />
                                </div>
                                <Badge variant="secondary" className="bg-indigo-500/10 text-indigo-600 border-none font-bold text-[10px]">
                                    +{stats.newTenantsThisMonth} NEW
                                </Badge>
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zones Totales</p>
                                <h3 className="text-3xl font-black tracking-tight text-foreground mt-1">{stats.totalTenants}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Subscriptions Card */}
                    <div className="relative group overflow-hidden rounded-[2rem] border border-border/50 bg-card p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <ShieldCheck className="h-24 w-24" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="flex items-center justify-between">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl">
                                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Abonnements Actifs</p>
                                <h3 className="text-3xl font-black tracking-tight text-foreground mt-1">{stats.activeSubscriptions}</h3>
                            </div>
                        </div>
                    </div>

                    {/* Revenue Card (Indigo Gradient) */}
                    <div className="relative group overflow-hidden rounded-[2rem] border-none bg-indigo-600 p-7 shadow-lg shadow-indigo-200 dark:shadow-none transition-all hover:shadow-2xl hover:-translate-y-1">
                        <div className="absolute -bottom-6 -right-6 p-4 opacity-20">
                            <Zap className="h-40 w-40 text-white" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md w-fit">
                                <TrendingUp className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-white/70">Mon Revenu Net</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black tracking-tight text-white">{(stats.platformRevenue || 0).toLocaleString()}</h3>
                                    <span className="text-[10px] font-black text-white/70 uppercase">FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reseller Revenue Card */}
                    <div className="relative group overflow-hidden rounded-[2rem] border border-border/50 bg-card p-7 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Wallet className="h-24 w-24" />
                        </div>
                        <div className="relative z-10 flex flex-col gap-5">
                            <div className="p-3 bg-amber-500/10 rounded-2xl w-fit">
                                <Wallet className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Solde des Zones</p>
                                <div className="flex items-baseline gap-2 mt-1">
                                    <h3 className="text-3xl font-black tracking-tight text-foreground">{(stats.resellerRevenue || 0).toLocaleString()}</h3>
                                    <span className="text-[10px] font-black text-muted-foreground uppercase">FCFA</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts & Lists Grid */}
                <div className="grid gap-8 lg:grid-cols-7">
                    {/* Main Chart Section */}
                    <div className="lg:col-span-4 rounded-[2.5rem] border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-border/30 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black uppercase tracking-tight italic text-foreground leading-none">Croissance Commission</h3>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2">Performance plateforme des 7 derniers jours</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Gain Net Admin</span>
                            </div>
                        </div>
                        <div className="p-8 flex-1 min-h-[350px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888815" />
                                    <XAxis 
                                        dataKey="name" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}}
                                        dy={15}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{fontSize: 10, fontWeight: 800, fill: '#64748b'}}
                                    />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '24px', border: '1px solid hsl(var(--border))', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                        labelStyle={{ fontWeight: 900, fontSize: '12px', color: 'hsl(var(--foreground))' }}
                                        itemStyle={{ fontWeight: 700, fontSize: '11px', color: '#6366f1' }}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="revenue" 
                                        stroke="#6366f1" 
                                        strokeWidth={4}
                                        fillOpacity={1} 
                                        fill="url(#colorRevenue)" 
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Transactions List */}
                    <div className="lg:col-span-3 rounded-[2.5rem] border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-border/30 flex items-center justify-between">
                            <h3 className="text-xl font-black uppercase tracking-tight italic text-foreground">Flux de Ventes</h3>
                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:bg-indigo-50">Tout Voir</Button>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[450px]">
                            {recentTransactions && recentTransactions.length > 0 ? (
                                recentTransactions.map((tx, i) => (
                                    <div key={i} className="flex items-center justify-between p-6 border-b border-border/20 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground uppercase italic leading-none">{tx.tenant?.name || 'Inconnu'}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                                                    {new Date(tx.created_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} • {tx.method || 'Momo'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">+{tx.amount_fcfa.toLocaleString()} <span className="text-[9px] opacity-40">CFA</span></p>
                                            <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mt-0.5">Gain: {tx.platform_net_amount} CFA</p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-12 text-center opacity-30 italic font-bold text-xs uppercase tracking-widest">Aucun mouvement</div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="grid gap-8 lg:grid-cols-2">
                    {/* New Partners Section */}
                    <div className="rounded-[2.5rem] border border-border/50 bg-card shadow-sm overflow-hidden">
                        <div className="p-8 border-b border-border/30">
                            <h3 className="text-xl font-black uppercase tracking-tight italic text-foreground">Nouveaux Partenaires</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground border-b border-border/30">
                                    <tr>
                                        <th className="px-8 py-5">Identité de la Zone</th>
                                        <th className="px-8 py-5">Plan Utilisé</th>
                                        <th className="px-8 py-5 text-right">Inscription</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/20">
                                    {recentTenants.map((tenant) => (
                                        <tr key={tenant.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all group">
                                            <td className="px-8 py-6">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-foreground uppercase italic group-hover:text-indigo-600 transition-colors leading-none">{tenant.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-mono mt-1 opacity-70">/{tenant.slug}</span>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-3 py-0.5 border-indigo-500/20 text-indigo-600 bg-indigo-500/5 h-6">
                                                    {tenant.plan?.name || 'Free'}
                                                </Badge>
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                    {new Date(tenant.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Zone Withdrawals Section */}
                    <div className="rounded-[2.5rem] border border-border/50 bg-card shadow-sm overflow-hidden flex flex-col">
                        <div className="p-8 border-b border-border/30">
                            <h3 className="text-xl font-black uppercase tracking-tight italic text-foreground">Demandes de Retraits Zones</h3>
                        </div>
                        <div className="flex-1 overflow-auto max-h-[500px]">
                            {recentWithdrawals && recentWithdrawals.length > 0 ? (
                                recentWithdrawals.map((w, i) => (
                                    <div key={i} className="flex items-center justify-between p-8 border-b border-border/20 last:border-0 hover:bg-slate-50 dark:hover:bg-white/5 transition-all group">
                                        <div className="flex items-center gap-5">
                                            <div className="p-4 bg-amber-500/10 rounded-2xl group-hover:bg-amber-500 group-hover:text-white transition-all">
                                                <Wallet className="h-5 w-5 text-amber-600 group-hover:text-white" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-foreground uppercase italic leading-none">{w.tenant_name}</p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-tighter">
                                                    {w.method?.phone_number} • {w.method?.label || 'Momo'}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-black text-foreground">-{w.amount.toLocaleString()} <span className="text-[9px] opacity-40">CFA</span></p>
                                            <Badge className={cn(
                                                "text-[9px] uppercase font-black tracking-widest mt-1 px-2 h-5 border-none",
                                                w.status === 'completed' ? "bg-emerald-500/10 text-emerald-600" : "bg-amber-500/10 text-amber-600"
                                            )} variant="outline">
                                                {w.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-20 text-center opacity-30 italic font-black text-xs uppercase tracking-[0.2em]">Aucun Retrait</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
