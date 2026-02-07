import { useState, useEffect } from 'react';
import { Head, usePage, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

interface StatsData {
    label: string;
    value: number;
}

interface Props {
    zones: Array<{ id: number; name: string }>;
    years: number[];
    stats: {
        payments: StatsData[];
        tickets: StatsData[];
    };
    filters: {
        zone_id: string | null;
        year: number;
        payment_mode: 'daily' | 'monthly';
        payment_month: number;
        ticket_mode: 'daily' | 'monthly';
        ticket_month: number;
    };
}

const MONTHS = [
    { value: 1, label: 'Janvier' },
    { value: 2, label: 'Février' },
    { value: 3, label: 'Mars' },
    { value: 4, label: 'Avril' },
    { value: 5, label: 'Mai' },
    { value: 6, label: 'Juin' },
    { value: 7, label: 'Juillet' },
    { value: 8, label: 'Août' },
    { value: 9, label: 'Septembre' },
    { value: 10, label: 'Octobre' },
    { value: 11, label: 'Novembre' },
    { value: 12, label: 'Décembre' },
];

export default function WifiStatistics({ zones, years, stats, filters }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [isLoading, setIsLoading] = useState(false);

    // Local state for filters to avoid layout shifts before apply
    // Actually Inertia updates props, so we can use filters prop directly if we update via router.

    const updateFilters = (newFilters: Partial<typeof filters>) => {
        setIsLoading(true);
        router.get(
            `/${tenant?.slug}/wifi/statistics`,
            { ...filters, ...newFilters },
            {
                preserveState: true,
                preserveScroll: true,
                onFinish: () => setIsLoading(false),
            }
        );
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Mes Wifi Zone', href: '#' },
        { title: 'Statistiques des Wifis', href: `/${tenant?.slug}/wifi/statistics` },
    ];

    // Chart Colors
    const PAYMENT_COLOR = "#2dd4bf"; // Teal
    const TICKET_COLOR = "#f43f5e";  // Rose

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Statistiques Wifi" />

            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Bienvenue dans votre espace client de Ticket Wifi Zone</h1>
                    <p className="text-muted-foreground text-sm">Analysez les performances de vos zones Wi-Fi.</p>
                </div>

                {/* Global Filters */}
                <div className="flex flex-wrap items-end gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="space-y-1.5 min-w-[200px]">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Sélectionnez un wifi :</Label>
                        <Select
                            value={filters.zone_id?.toString() || 'all'}
                            onValueChange={(val) => updateFilters({ zone_id: val === 'all' ? null : val })}
                        >
                            <SelectTrigger className="bg-muted/50 border-border">
                                <SelectValue placeholder="Toutes les zones" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Toutes les zones</SelectItem>
                                {zones.map((zone) => (
                                    <SelectItem key={zone.id} value={zone.id.toString()}>
                                        {zone.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-1.5 min-w-[120px]">
                        <Label className="text-xs font-bold text-muted-foreground uppercase">Année :</Label>
                        <Select
                            value={filters.year.toString()}
                            onValueChange={(val) => updateFilters({ year: parseInt(val) })}
                        >
                            <SelectTrigger className="bg-muted/50 border-border">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={year.toString()}>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {isLoading && <Loader2 className="h-5 w-5 animate-spin text-muted-foreground mb-2" />}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Payment Statistics Chart */}
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Statistiques des paiements</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-medium text-muted-foreground">Affichage :</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={filters.payment_mode === 'daily' ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => updateFilters({ payment_mode: 'daily' })}
                                        className="text-xs h-8"
                                    >
                                        Par Jours
                                    </Button>
                                    <Button
                                        variant={filters.payment_mode === 'monthly' ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => updateFilters({ payment_mode: 'monthly' })}
                                        className="text-xs h-8"
                                    >
                                        Par Mois
                                    </Button>
                                </div>

                                {filters.payment_mode === 'daily' && (
                                    <Select
                                        value={filters.payment_month.toString()}
                                        onValueChange={(val) => updateFilters({ payment_month: parseInt(val) })}
                                    >
                                        <SelectTrigger className="h-8 w-[120px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m) => (
                                                <SelectItem key={m.value} value={m.value.toString()}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.payments} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(val) => val >= 1000 ? `${val / 1000}k` : val}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`${value.toLocaleString()} FCFA`, 'CA']}
                                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Bar dataKey="value" fill={PAYMENT_COLOR} radius={[4, 4, 0, 0]} barSize={30}>
                                            {/* Optional: Different color for specific bars if needed */}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4">
                                <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <span className="w-3 h-3 rounded-sm bg-teal-400"></span>
                                    CA ({filters.year})
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Ticket Statistics Chart */}
                    <Card className="border-border shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-bold text-foreground">Nombre de tickets vendus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-3 mb-6">
                                <span className="text-sm font-medium text-muted-foreground">Affichage :</span>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={filters.ticket_mode === 'daily' ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => updateFilters({ ticket_mode: 'daily' })}
                                        className="text-xs h-8"
                                    >
                                        Par Jours
                                    </Button>
                                    <Button
                                        variant={filters.ticket_mode === 'monthly' ? 'secondary' : 'outline'}
                                        size="sm"
                                        onClick={() => updateFilters({ ticket_mode: 'monthly' })}
                                        className="text-xs h-8"
                                    >
                                        Par Mois
                                    </Button>
                                </div>

                                {filters.ticket_mode === 'daily' && (
                                    <Select
                                        value={filters.ticket_month.toString()}
                                        onValueChange={(val) => updateFilters({ ticket_month: parseInt(val) })}
                                    >
                                        <SelectTrigger className="h-8 w-[120px] text-xs">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MONTHS.map((m) => (
                                                <SelectItem key={m.value} value={m.value.toString()}>
                                                    {m.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            </div>

                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={stats.tickets} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--muted))" />
                                        <XAxis
                                            dataKey="label"
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                            dy={10}
                                        />
                                        <YAxis
                                            tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                                            axisLine={false}
                                            tickLine={false}
                                        />
                                        <Tooltip
                                            cursor={{ fill: 'transparent' }}
                                            contentStyle={{ borderRadius: 'var(--radius)', border: 'none', backgroundColor: 'hsl(var(--card))', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value: any) => [`${value} tickets`, 'Ventes']}
                                            labelStyle={{ color: 'hsl(var(--foreground))' }}
                                        />
                                        <Bar dataKey="value" fill={TICKET_COLOR} radius={[4, 4, 0, 0]} barSize={30} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="text-center mt-4">
                                <span className="inline-flex items-center gap-2 text-xs font-bold text-muted-foreground">
                                    <span className="w-3 h-3 rounded-sm bg-rose-500"></span>
                                    Tickets vendus en {filters.ticket_mode === 'daily' ? MONTHS.find(m => m.value === filters.ticket_month)?.label : ''} {filters.year}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
