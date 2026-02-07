import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart as PieChartIcon, Target, Users, Calendar } from 'lucide-react';
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
    BarChart,
    Bar,
    Legend
} from 'recharts';

interface RevenueData {
    total: number;
    date: string;
}

interface DistributionData {
    name: string;
    total: number;
}

interface RevenueIndexProps {
    dailyRevenue: RevenueData[];
    currentMonthTotal: number;
    revenueByPlan: DistributionData[];
    revenueByTenant: DistributionData[];
}

const COLORS = ['Primary', 'Emerald', 'Amber', 'Rose', 'Indigo', 'Cyan'];
const CHART_COLORS = [
    'hsl(var(--primary))',
    '#10b981', // emerald-500
    '#f59e0b', // amber-500
    '#f43f5e', // rose-500
    '#6366f1', // indigo-500
    '#06b6d4', // cyan-500
];

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
    { title: 'Analyses Revenue', href: '/admin/revenue' },
];

export default function RevenueIndex({ dailyRevenue, currentMonthTotal, revenueByPlan, revenueByTenant }: RevenueIndexProps) {
    // Explicitly cast to number to avoid string concatenation issues (like "01510")
    const totalAllTime = dailyRevenue.reduce((acc, curr) => acc + Number(curr.total || 0), 0);

    // Format date for better display (e.g. "04 Feb")
    const formattedTrendData = dailyRevenue.map(d => ({
        ...d,
        total: Number(d.total || 0), // Ensure it's a number for the charts too
        displayDate: new Date(d.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analyses Revenue" />
            <div className="max-w-7xl mx-auto space-y-8 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Analyses Revenue</h1>
                        <p className="text-muted-foreground text-sm">Vue globale de la santé financière de votre plateforme Wi-Fi.</p>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="shadow-sm border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-blue-500/20 transition-colors" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Revenu Total (30j)</CardTitle>
                            <Target className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums text-foreground">
                                {totalAllTime.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">FCFA</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">Cumul des 30 derniers jours</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-emerald-500/20 transition-colors" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Ce mois</CardTitle>
                            <TrendingUp className="h-4 w-4 text-emerald-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums text-foreground">
                                {currentMonthTotal.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">FCFA</span>
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">Mois en cours ({new Date().toLocaleDateString('fr-FR', { month: 'long' })})</p>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-amber-500/20 transition-colors" />
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Zones Actives</CardTitle>
                            <Users className="h-4 w-4 text-amber-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold tabular-nums text-foreground">
                                {revenueByTenant.length}
                            </div>
                            <p className="text-[10px] text-muted-foreground mt-1">Partenaires générant du revenu</p>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2 shadow-sm border-border/50 overflow-hidden relative group">
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-[0.05] transition-opacity">
                            <BarChart3 size={120} />
                        </div>
                        <CardHeader className="pb-0">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-bold">Évolution du Chiffre d'Affaires</CardTitle>
                                    <CardDescription>Performance réelle sur 30 jours</CardDescription>
                                </div>
                                <div className="flex items-center gap-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-widest border border-emerald-500/20">
                                    <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
                                    Données Directes
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[350px] pt-10">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={formattedTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                            <stop offset="50%" stopColor="#3b82f6" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.6} />
                                    <XAxis
                                        dataKey="displayDate"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                        interval={formattedTrendData.length > 10 ? Math.floor(formattedTrendData.length / 6) : 0}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 600 }}
                                    />
                                    <Tooltip
                                        cursor={{ stroke: '#3b82f6', strokeWidth: 2, strokeDasharray: '5 5' }}
                                        contentStyle={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                            backdropFilter: 'blur(8px)',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '16px',
                                            boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                                            padding: '16px'
                                        }}
                                        itemStyle={{ fontSize: '13px', fontWeight: 800, color: '#1e40af' }}
                                        labelStyle={{ fontSize: '11px', color: '#64748b', marginBottom: '6px', textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.05em' }}
                                        formatter={(value: any) => [`${value?.toLocaleString() || 0} FCFA`, 'Chiffre d\'Affaires']}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#3b82f6"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#colorTotal)"
                                        animationDuration={2000}
                                        dot={dailyRevenue.length < 30 ? { r: 5, fill: '#fff', stroke: '#3b82f6', strokeWidth: 3 } : false}
                                        activeDot={{ r: 8, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3 }}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-border/50 overflow-hidden">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold">Distribution par Plan</CardTitle>
                            <CardDescription>Répartition des revenus</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[350px] flex flex-col items-center justify-center relative">
                            <ResponsiveContainer width="100%" height="85%">
                                <PieChart>
                                    <Pie
                                        data={revenueByPlan}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="total"
                                        nameKey="name"
                                        stroke="none"
                                        animationBegin={200}
                                        animationDuration={1200}
                                    >
                                        {revenueByPlan.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            padding: '8px'
                                        }}
                                        formatter={(value: any) => [`${value?.toLocaleString() || 0} FCFA`, 'Revenu']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-6">
                                <span className="text-2xl font-black tracking-tighter">
                                    {totalAllTime > 1000 ? (totalAllTime / 1000).toFixed(1) + 'k' : totalAllTime}
                                </span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50 tracking-widest">Total FCFA</span>
                            </div>
                            <div className="w-full mt-2 px-6">
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    {revenueByPlan.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between gap-2 border-b border-border/40 pb-1">
                                            <div className="flex items-center gap-1.5 min-w-0">
                                                <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }} />
                                                <span className="text-[10px] font-bold text-muted-foreground truncate">{item.name}</span>
                                            </div>
                                            <span className="text-[10px] font-black">{((item.total / (totalAllTime || 1)) * 100).toFixed(0)}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid gap-6">
                    <Card className="shadow-sm border-border/50 bg-card overflow-hidden">
                        <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 pb-4">
                            <div>
                                <CardTitle className="text-lg font-bold">Top Zones de Revenu</CardTitle>
                                <CardDescription>Classement des partenaires par chiffre d'affaires cumulé.</CardDescription>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[320px] pt-8 bg-zinc-50/30 dark:bg-zinc-950/20">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart
                                    data={revenueByTenant}
                                    layout="vertical"
                                    margin={{ left: 20, right: 40, top: 0, bottom: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsl(var(--border))" strokeOpacity={0.4} />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 700 }}
                                        width={140}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--primary))', opacity: 0.05 }}
                                        contentStyle={{
                                            backgroundColor: 'hsl(var(--card))',
                                            border: '1px solid hsl(var(--border))',
                                            borderRadius: '8px',
                                            boxShadow: '0 4px 12px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: any) => [`${value?.toLocaleString() || 0} FCFA`, 'Performance']}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="hsl(var(--primary))"
                                        radius={[0, 6, 6, 0]}
                                        barSize={24}
                                        animationDuration={1800}
                                    >
                                        {revenueByTenant.map((entry, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fillOpacity={1 - (index * 0.15)}
                                                fill="hsl(var(--primary))"
                                            />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
