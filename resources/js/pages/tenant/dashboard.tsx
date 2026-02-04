import { useState, useEffect } from 'react';
import { Head, usePage, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { LayoutGrid, Ticket, Wifi, ShieldCheck, Clock, TrendingUp, Users, ArrowUpRight, CheckCircle2, Hash, Copy } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
    const { tenant } = usePage<SharedData>().props;
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tableau de Bord" />

            <div className="flex flex-col gap-8 p-6">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Bonjour, {tenant?.name || 'Administrateur'}</h1>
                        <p className="text-muted-foreground mt-1">Voici un aperçu de l'activité de votre réseau Wi-Fi.</p>
                    </div>

                    <div className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-border">
                        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Plan Actuel</span>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{tenant?.plan?.name || 'Gratuit'}</span>
                                {tenant?.plan && tenant.plan.commission_rate > 0 && (
                                    <Badge variant="outline" className="h-5 text-[10px] bg-blue-50 text-blue-700 border-blue-100">
                                        {tenant.plan.commission_rate}% Com.
                                    </Badge>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Shop URL & Share Section */}
                <Card className="border-primary/20 bg-primary/5 shadow-none overflow-hidden">
                    <CardContent className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                                <ArrowUpRight className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-sm">Votre boutique est en ligne !</h4>
                                <p className="text-xs text-muted-foreground italic">Partagez ce lien à vos clients pour qu'ils achètent leurs tickets.</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <div className="bg-white border text-sm font-mono px-3 py-2 rounded-lg flex-1 md:flex-none md:min-w-[300px] truncate">
                                {shopUrl || 'Chargement...'}
                            </div>
                            <Button
                                size="sm"
                                className="gap-2 shrink-0"
                                onClick={() => {
                                    if (shopUrl) {
                                        navigator.clipboard.writeText(shopUrl);
                                        alert('Lien copié dans le presse-papier !');
                                    }
                                }}
                            >
                                <Copy className="h-4 w-4" /> Copier
                            </Button>
                            <Link href={`/${tenant?.slug || ''}/buy`} target="_blank">
                                <Button size="sm" variant="outline" className="gap-2 shrink-0">
                                    <ArrowUpRight className="h-4 w-4" /> Voir
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="border-none shadow-sm bg-indigo-600 text-white overflow-hidden relative">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wifi className="h-16 w-16" />
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-widest text-indigo-100">Sessions Actives</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black">{stats?.active_sessions || 0}</div>
                            <div className="flex items-center gap-1 mt-2 text-indigo-200 text-xs">
                                <TrendingUp className="h-3 w-3" />
                                <span>Utilisateurs en ligne</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Revenu du Mois</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{(stats?.revenue_this_month || 0).toLocaleString()} <span className="text-sm font-medium">FCFA</span></div>
                            <div className="flex items-center gap-1 mt-2 text-green-600 text-xs font-bold">
                                <ArrowUpRight className="h-3 w-3" />
                                <span>+0% vs mois dernier</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Tickets Vendus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{stats?.sold_this_month || 0}</div>
                            <div className="flex items-center gap-1 mt-2 text-muted-foreground text-xs font-medium">
                                <CheckCircle2 className="h-3 w-3 text-primary" />
                                <span>Ce mois en cours</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-none shadow-sm bg-white overflow-hidden relative">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-medium uppercase tracking-widest text-muted-foreground">Stock Disponible</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-black text-slate-900">{stats?.vouchers_available || 0}</div>
                            <div className="flex items-center gap-1 mt-2 text-orange-600 text-xs font-bold">
                                <Link href={`/${tenant?.slug || ''}/wifi/vouchers`} className="hover:underline flex items-center gap-1">
                                    <span>Gérer le stock</span>
                                    <ArrowUpRight className="h-3 w-3" />
                                </Link>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Revenue Growth Chart */}
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Croissance Revenue</CardTitle>
                        <p className="text-xs text-muted-foreground">Évolution du chiffre d'affaires sur les 7 derniers jours.</p>
                    </CardHeader>
                    <CardContent className="h-[300px] w-full pt-0">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
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
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#64748b', fontSize: 12 }}
                                    tickFormatter={(value) => `${value}`}
                                />
                                <CartesianGrid vertical={false} stroke="#e2e8f0" strokeDasharray="3 3" />
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                    formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'Revenu']}
                                    labelStyle={{ color: '#64748b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#10b981"
                                    strokeWidth={3}
                                    fillOpacity={1}
                                    fill="url(#colorRevenue)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Main Content Grid */}
                <div className="grid gap-6 lg:grid-cols-7">
                    {/* Sales Chart Placeholder / Simple Bar Chart */}
                    <Card className="lg:col-span-4 border-none shadow-sm bg-white">
                        <CardHeader className="flex flex-row items-center justify-between pb-8">
                            <div>
                                <CardTitle className="text-lg font-bold">Ventes des 7 derniers jours</CardTitle>
                                <p className="text-xs text-muted-foreground">Volume de tickets distribués par jour.</p>
                            </div>
                        </CardHeader>
                        <CardContent className="h-[250px] w-full pt-0">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={salesChartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 10 }}
                                        dy={10}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f1f5f9' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`${value} tickets`, 'Ventes']}
                                        labelStyle={{ color: '#64748b' }}
                                    />
                                    <Bar
                                        dataKey="value"
                                        fill="#0f172a"
                                        radius={[4, 4, 0, 0]}
                                        barSize={30}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>

                    {/* Recent Vouchers */}
                    <Card className="lg:col-span-3 border-none shadow-sm bg-white">
                        <CardHeader>
                            <div className="flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">Tickets Récents</CardTitle>
                                <Link href={`/${tenant?.slug || ''}/wifi/vouchers`} className="text-xs text-primary font-bold hover:underline capitalize">Voir tout</Link>
                            </div>
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
                                                voucher.status === 'available' ? "bg-green-100 text-green-600" : "bg-blue-100 text-blue-600"
                                            )}>
                                                <Ticket className="h-5 w-5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate uppercase">{voucher.username}</p>
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
        </AppLayout>
    );
}
