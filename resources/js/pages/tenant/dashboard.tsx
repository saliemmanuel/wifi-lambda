import { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { LayoutGrid, Ticket, Wifi, ShieldCheck, Clock, TrendingUp, Users, ArrowUpRight, CheckCircle2, Hash, Copy, Wallet, Banknote, CreditCard, Coins, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

interface Props {
    stats: {
        vouchers_available: number;
        sold_this_month: number;
        revenue_this_month: number;
        active_sessions: number;
        balance: number;
        revenue_total: number;
        tickets_sold_total: number;
        withdrawals_total: number;
        revenue_today: number;
        tickets_sold_today: number;
    };
    charts: {
        sales: {
            labels: string[];
            data: number[];
        };
        revenue?: {
            labels: string[];
            data: number[];
        };
    };
    recent_vouchers: any[];
}

export default function TenantDashboard({ stats, charts, recent_vouchers }: Props) {
    const { tenant, auth } = usePage<SharedData>().props;
    const [shopUrl, setShopUrl] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setShopUrl(`${window.location.origin}/${tenant?.slug}/buy`);
        }
    }, [tenant?.slug]);

    // Breadcrumbs are safe with optional chaining
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Tableau de Bord',
            href: `/${tenant?.slug || ''}`,
        },
    ];

    // Sales Chart Data
    const salesDataRaw = charts?.sales?.data || [];
    const salesLabels = charts?.sales?.labels || [];
    const salesChartData = salesLabels.map((label, index) => ({
        name: label,
        value: salesDataRaw[index] || 0
    }));

    // Revenue Chart Data
    const revenueLabels = charts?.revenue?.labels || [];
    const revenueDataPoints = charts?.revenue?.data || [];
    const revenueChartData = revenueLabels.map((label, index) => ({
        name: label,
        value: revenueDataPoints[index] || 0
    }));

    const cards = [
        {
            title: "MON SOLDE DISPONIBLE",
            value: `${stats.balance.toLocaleString()} XAF`,
            subtext: "Solde actuel",
            icon: Wallet,
            color: "text-blue-500",
            bg: "bg-blue-50",
            border: "border-blue-100"
        },
        {
            title: "CHIFFRE D'AFFAIRES TOTAL",
            value: `${stats.revenue_total.toLocaleString()} XAF`,
            subtext: "Total généré",
            icon: Banknote,
            color: "text-emerald-500",
            bg: "bg-emerald-50",
            border: "border-emerald-100"
        },
        {
            title: "TOTAL DES TICKETS VENDUS",
            value: stats.tickets_sold_total,
            subtext: "Tickets vendus",
            icon: Ticket,
            color: "text-amber-500",
            bg: "bg-amber-50",
            border: "border-amber-100"
        },
        {
            title: "MONTANT TOTAL DES RETRAITS",
            value: `${stats.withdrawals_total.toLocaleString()} XAF`,
            subtext: "Total retiré",
            icon: CreditCard,
            color: "text-rose-500",
            bg: "bg-rose-50",
            border: "border-rose-100"
        },
        {
            title: "RECETTE DU JOUR",
            value: `${stats.revenue_today.toLocaleString()} XAF`,
            subtext: new Date().toLocaleDateString('fr-FR'),
            icon: Coins,
            color: "text-purple-500",
            bg: "bg-purple-50",
            border: "border-purple-100"
        },
        {
            title: "TICKETS VENDUS AUJOURD'HUI",
            value: stats.tickets_sold_today,
            subtext: new Date().toLocaleDateString('fr-FR'),
            icon: Ticket,
            color: "text-cyan-500",
            bg: "bg-cyan-50",
            border: "border-cyan-100"
        }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de Bord" />

            <div className="flex flex-col gap-8 p-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-extrabold tracking-tight">Bonjour, {auth.user.name}</h1>
                        <p className="text-muted-foreground">Gérez vos ventes et suivez vos performances en temps réel.</p>
                    </div>

                    <Card className="bg-card shadow-sm border-border/50">
                        <CardContent className="flex items-center gap-3 p-3 px-4">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Abonnement</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-bold text-foreground">{tenant?.plan?.name || 'Gratuit'}</span>
                                    {(tenant?.plan?.commission_rate ?? 0) > 0 && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] h-4 px-1 font-medium">
                                            {tenant?.plan?.commission_rate}% Com.
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Content Grid - Metric Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {cards.map((card, idx) => (
                        <Card key={idx} className="shadow-sm transition-all hover:shadow-md bg-card border-border/50 overflow-hidden relative group">
                            {/* Corner Gradient Glow */}
                            <div className={cn(
                                "absolute -top-10 -right-10 w-32 h-32 blur-3xl opacity-[0.12] group-hover:opacity-[0.20] transition-opacity pointer-events-none",
                                card.bg.replace('50', '500') // Transform bg-blue-50 to bg-blue-500 for the glow
                            )} />

                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                    {card.title}
                                </CardTitle>
                                <div className={cn("h-8 w-8 rounded-full flex items-center justify-center relative z-10", card.bg, "dark:bg-opacity-10")}>
                                    <card.icon className={cn("h-4 w-4", card.color)} />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className={cn("text-2xl font-black tabular-nums", card.color)}>{card.value}</div>
                                <p className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1 font-bold">
                                    <TrendingUp className="h-3 w-3 opacity-20" />
                                    {card.subtext}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Revenue Growth Chart */}
                <Card className="shadow-sm border-border/50 overflow-hidden relative">
                    <div className="absolute top-0 right-0 p-6 opacity-[0.03] pointer-events-none">
                        <TrendingUp size={100} />
                    </div>
                    <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-lg font-bold">Croissance Revenue</CardTitle>
                                <CardDescription>Évolution du chiffre d'affaires (7 derniers jours)</CardDescription>
                            </div>
                            <Badge variant="secondary" className="bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-none">
                                <TrendingUp className="size-3 mr-1" /> Direct
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="h-[320px] pt-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                                />
                                <CartesianGrid vertical={false} stroke="hsl(var(--border))" strokeDasharray="3 3" strokeOpacity={0.5} />
                                <Tooltip
                                    cursor={{ stroke: '#10b981', strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{
                                        borderRadius: '12px',
                                        border: '1px solid hsl(var(--border))',
                                        backgroundColor: 'hsl(var(--card))',
                                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                    }}
                                    formatter={(value: any) => [`${value.toLocaleString()} XAF`, 'Revenu']}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                    animationDuration={1500}
                                    dot={{ r: 4, fill: 'hsl(var(--background))', stroke: '#10b981', strokeWidth: 2 }}
                                    activeDot={{ r: 6, fill: '#10b981', stroke: 'hsl(var(--background))', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Sales Chart */}
                    <Card className="lg:col-span-4 shadow-sm border-border/50">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Ventes Quotidiennes</CardTitle>
                            <CardDescription>Volume de tickets distribués par jour.</CardDescription>
                        </CardHeader>
                        <CardContent className="h-[280px] pt-4">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: 500 }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'hsl(var(--muted))', opacity: 0.3 }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid hsl(var(--border))',
                                            backgroundColor: 'hsl(var(--card))',
                                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                                        }}
                                        formatter={(value: any) => [`${value} tickets`, 'Ventes']}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="hsl(var(--primary))"
                                        radius={[6, 6, 0, 0]}
                                        barSize={32}
                                        animationDuration={1500}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Vouchers */}
                    <Card className="lg:col-span-3 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0">
                            <CardTitle className="text-base font-bold">Tickets Récents</CardTitle>
                            <Link href={`/${tenant?.slug || ''}/wifi/vouchers`} className="text-xs text-primary font-bold hover:underline capitalize">Voir tout</Link>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {(!recent_vouchers || recent_vouchers.length === 0) ? (
                                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                        <Ticket className="h-8 w-8 opacity-20 mb-2" />
                                        <p className="text-sm italic">Aucun ticket pour le moment</p>
                                    </div>
                                ) : (
                                    recent_vouchers.map((voucher) => (
                                        <div key={voucher.id} className="flex items-center gap-4">
                                            <div className={cn(
                                                "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
                                                voucher.status === 'available' ? "bg-green-100 dark:bg-green-500/10 text-green-600" : "bg-blue-100 dark:bg-blue-500/10 text-blue-600"
                                            )}>
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-foreground truncate uppercase">{voucher.username}</p>
                                                <p className="text-xs text-muted-foreground truncate">{voucher.package?.name || voucher.profile_name}</p>
                                            </div>
                                            <div className="text-right">
                                                <Badge variant={voucher.status === 'available' ? 'secondary' : 'outline'} className="text-[10px] h-5 py-0">
                                                    {voucher.status}
                                                </Badge>
                                                <p className="text-[10px] text-muted-foreground mt-1 text-nowrap">{new Date(voucher.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout >
    );
}
