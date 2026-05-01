import { Head } from '@inertiajs/react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Users, CreditCard, Building2, TrendingUp } from 'lucide-react';
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend
} from 'recharts';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Platform Admin',
        href: '/admin/dashboard',
    },
];

interface AdminDashboardProps {
    stats: {
        totalTenants: number;
        activeSubscriptions: number;
        totalRevenue: number;
        platformRevenue: number;
        resellerRevenue: number;
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
    // Transform chart data
    const revenueLabels = charts?.revenue?.labels || [];
    const revenueDataPoints = charts?.revenue?.data || [];
    const chartData = revenueLabels.map((label, index) => ({
        name: label,
        value: revenueDataPoints[index] || 0
    }));
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Platform Administration" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-6">
                <div className="grid auto-rows-min gap-6 md:grid-cols-4">
                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Zones Totales</span>
                            <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-xl">
                                <Building2 className="h-5 w-5 text-blue-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">{stats.totalTenants}</div>
                        <p className="text-xs font-bold text-muted-foreground">+{stats.newTenantsThisMonth} ce mois-ci</p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Abonnements Actifs</span>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                <CreditCard className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">{stats.activeSubscriptions}</div>
                        <p className="text-xs font-bold text-muted-foreground">Zones opérationnelles</p>
                    </div>
                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Mon Revenu Net</span>
                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">{(stats.platformRevenue || 0).toLocaleString()} <span className="text-sm font-bold opacity-50 uppercase">FCFA</span></div>
                        <p className="text-xs font-bold text-muted-foreground">Après déduction de 3% de frais</p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Revenu des Zones</span>
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl">
                                <TrendingUp className="h-5 w-5 text-indigo-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">{(stats.resellerRevenue || 0).toLocaleString()} <span className="text-sm font-bold opacity-50 uppercase">FCFA</span></div>
                        <p className="text-xs font-bold text-muted-foreground">Somme totale reversée aux zones</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    <div className="col-span-4 relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm p-6">
                        <h3 className="text-lg font-black uppercase tracking-tight italic mb-6 text-foreground">Croissance Revenue</h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorAdminRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        tickFormatter={(value) => `${value}`}
                                    />
                                    <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" />
                                    <Tooltip
                                        contentStyle={{ borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Commissions']}
                                        labelStyle={{ color: 'hsl(var(--muted-foreground))' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="value"
                                        stroke="#6366f1"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorAdminRevenue)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="col-span-3 relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm p-6">
                        <h3 className="text-lg font-black uppercase tracking-tight italic mb-6 text-foreground">Dernières Zones créées</h3>
                        <div className="space-y-4">
                            {recentTenants.map((tenant) => (
                                <div key={tenant.id} className="flex items-center justify-between border-b border-border/50 pb-3 last:border-0 hover:bg-slate-50/50 dark:hover:bg-white/5 p-2 rounded-xl transition-all">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-black uppercase italic tracking-tight text-foreground">{tenant.name}</span>
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase">{tenant.plan?.name || 'Gratuit'} — /{tenant.slug}</span>
                                    </div>
                                    <span className={cn(
                                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                                        tenant.status === 'active' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
                                    )}>
                                        {tenant.status === 'active' ? 'Actif' : 'Suspendu'}
                                    </span>
                                </div>
                            ))}
                            {recentTenants.length === 0 && (
                                <div className="text-center py-12 text-muted-foreground font-bold italic">
                                    Aucune zone créée pour le moment.
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Bottom Section: Plan Distribution & Recent Transactions */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
                    {/* Plan Distribution Pie Chart */}
                    <div className="col-span-3 relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm p-6">
                        <h3 className="text-lg font-black uppercase tracking-tight italic mb-6 text-foreground">Répartition par Plan</h3>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={charts?.plans || []}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {(charts?.plans || []).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${value} Zones`, 'Total']}
                                    />
                                    <Legend verticalAlign="bottom" height={36} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Recent Transactions Table */}
                    <div className="col-span-4 relative min-h-[400px] flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-black uppercase tracking-tight italic text-foreground">Dernières Transactions</h3>
                            <span className="text-xs font-bold text-muted-foreground uppercase">Revenus Plateforme</span>
                        </div>

                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-b border-border/50">
                                        <TableHead className="w-[100px] text-xs font-bold text-muted-foreground uppercase">Réf.</TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase">Zone / Tenant</TableHead>
                                        <TableHead className="text-xs font-bold text-muted-foreground uppercase">Mon Gain</TableHead>
                                        <TableHead className="text-right text-xs font-bold text-muted-foreground uppercase">Statut</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {(!recentTransactions || recentTransactions.length === 0) ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center text-xs font-medium text-muted-foreground italic">
                                                Aucune transaction récente.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        recentTransactions.map((tx) => (
                                            <TableRow key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 border-b border-border/50 last:border-0">
                                                <TableCell className="font-mono text-xs font-medium">{tx.id}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold uppercase">{tx.tenant?.name || 'Inconnu'}</span>
                                                        <span className="text-[9px] text-muted-foreground uppercase">{tx.method || 'Carte'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs font-bold">{tx.platform_net_amount} FCFA</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge variant="outline" className={cn(
                                                        "text-[9px] h-5 px-2 uppercase tracking-widest border-0",
                                                        tx.status === 'completed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" :
                                                            tx.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"
                                                    )}>
                                                        {tx.status}
                                                    </Badge>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>

                {/* Section: Recent Withdrawals */}
                <div className="relative min-h-[300px] flex-1 overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm p-6 mt-0">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-black uppercase tracking-tight italic text-foreground">Derniers Retraits des Zones</h3>
                        <div className="flex gap-4">
                            <span className="text-xs font-bold text-muted-foreground uppercase">Volume Sortant</span>
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent border-b border-border/50">
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase">Date</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase">Zone / Tenant</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase">Montant</TableHead>
                                    <TableHead className="text-xs font-bold text-muted-foreground uppercase">Méthode</TableHead>
                                    <TableHead className="text-right text-xs font-bold text-muted-foreground uppercase">Statut</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {(!recentWithdrawals || recentWithdrawals.length === 0) ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center text-xs font-medium text-muted-foreground italic">
                                            Aucun retrait récent.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    recentWithdrawals.map((w) => (
                                        <TableRow key={w.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 border-b border-border/50 last:border-0">
                                            <TableCell className="text-xs text-muted-foreground font-medium">
                                                {new Date(w.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-xs font-black uppercase italic">{w.tenant_name}</span>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold">{w.amount.toLocaleString()} FCFA</TableCell>
                                            <TableCell className="text-xs font-medium">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] uppercase">{w.method?.name || 'Mobile Money'}</span>
                                                    <span className="text-[9px] text-muted-foreground font-mono">{w.method?.phone_number}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge variant="outline" className={cn(
                                                    "text-[9px] h-5 px-2 uppercase tracking-widest border-0",
                                                    w.status === 'completed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" :
                                                        w.status === 'processing' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" :
                                                            w.status === 'pending' ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600" : "bg-red-50 dark:bg-red-500/10 text-red-600"
                                                )}>
                                                    {w.status === 'completed' ? 'Terminé' : w.status === 'processing' ? 'En cours' : w.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { cn } from '@/lib/utils';
