import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, BarChart3, PieChart } from 'lucide-react';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';

interface RevenueData {
    total: number;
    month: string;
}

interface RevenueIndexProps {
    monthlyRevenue: RevenueData[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
    { title: 'Analyses Revenue', href: '/admin/revenue' },
];

export default function RevenueIndex({ monthlyRevenue }: RevenueIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analyses Revenue" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic">Analyses Revenue</h1>
                    <p className="text-sm font-bold text-muted-foreground uppercase text-zinc-500">Suivi de la performance financière globale.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="rounded-2xl border-sidebar-border/70 shadow-sm relative overflow-hidden h-48 bg-zinc-900 text-white">
                        <div className="absolute inset-0 opacity-10">
                            <PlaceholderPattern className="size-full stroke-white" />
                        </div>
                        <CardHeader>
                            <span className="text-[10px] font-black uppercase tracking-widest opacity-70">Revenu ce mois (Est.)</span>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-black italic tracking-tighter">
                                {monthlyRevenue[0]?.total.toLocaleString() || 0} <span className="text-sm uppercase opacity-70">€</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="col-span-2 rounded-2xl border-sidebar-border/70 shadow-sm bg-white dark:bg-zinc-900 border overflow-hidden p-6 relative">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black uppercase italic tracking-widest flex items-center gap-2">
                                <BarChart3 className="size-4 text-primary" /> Croissance mensuelle
                            </h3>
                        </div>
                        <div className="h-24 relative flex items-end gap-2 group">
                            {monthlyRevenue.reverse().map((data, i) => (
                                <div key={i} className="flex-1 bg-primary/20 hover:bg-primary transition-all rounded-t-lg relative group/bar" style={{ height: `${(data.total / (Math.max(...monthlyRevenue.map(d => d.total)) || 1)) * 100}%` }}>
                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap font-bold">
                                        {data.total}€
                                    </div>
                                    <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 text-[8px] font-black uppercase text-muted-foreground whitespace-nowrap">
                                        {data.month}
                                    </div>
                                </div>
                            ))}
                        </div>
                        {monthlyRevenue.length === 0 && (
                            <div className="h-24 flex items-center justify-center text-muted-foreground font-bold uppercase italic opacity-20 tracking-widest">
                                En attente de données...
                            </div>
                        )}
                    </Card>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    <Card className="rounded-2xl border-sidebar-border/70 shadow-sm p-6 bg-white dark:bg-zinc-900">
                        <h3 className="text-sm font-black uppercase italic tracking-widest mb-6">Répartition par Plan</h3>
                        <div className="flex flex-col items-center py-8">
                            <PlaceholderPattern className="size-32 rounded-full stroke-primary opacity-20" />
                            <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase italic opacity-50">Données non disponibles</p>
                        </div>
                    </Card>
                    <Card className="rounded-2xl border-sidebar-border/70 shadow-sm p-6 bg-white dark:bg-zinc-900">
                        <h3 className="text-sm font-black uppercase italic tracking-widest mb-6">Répartition par Zone</h3>
                        <div className="flex flex-col items-center py-8">
                            <PlaceholderPattern className="size-32 rounded-full stroke-primary opacity-20" />
                            <p className="mt-4 text-[10px] font-bold text-muted-foreground uppercase italic opacity-50">Données non disponibles</p>
                        </div>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
