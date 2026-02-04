import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search, Building2, ExternalLink } from 'lucide-react';
import { Input } from '@/components/ui/input';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Platform Admin',
        href: '/admin/dashboard',
    },
    {
        title: 'Tenants',
        href: '/admin/tenants',
    },
];

import { router } from '@inertiajs/react';
import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tenant {
    id: number;
    name: string;
    slug: string;
    email: string;
    status: string;
    plan?: { name: string };
    active_subscription?: { plan: { name: string } };
    created_at: string;
}

interface TenantsIndexProps {
    tenants: {
        data: Tenant[];
        links: any[];
    };
    filters: {
        search?: string;
    };
}

export default function TenantsIndex({ tenants, filters }: TenantsIndexProps) {
    const [search, setSearch] = useState(filters.search || '');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get('/admin/tenants', { search }, { preserveState: true });
    };

    const toggleStatus = (tenant: Tenant) => {
        if (confirm(`Voulez-vous vraiment ${tenant.status === 'active' ? 'suspendre' : 'activer'} cette zone ?`)) {
            router.patch(`/admin/tenants/${tenant.slug}/toggle-status`);
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
            case 'suspended': return 'bg-amber-500/10 text-amber-600 border-amber-200';
            default: return 'bg-slate-500/10 text-slate-600 border-slate-200';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Zones" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase italic">Gestion des Zones</h1>
                        <p className="text-sm font-bold text-muted-foreground uppercase">Supervisez tous les fournisseurs de service Wi-Fi.</p>
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Rechercher par nom, email ou lien..."
                            className="pl-10 h-12 rounded-xl bg-white dark:bg-zinc-900 border-sidebar-border/70 font-bold"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </form>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {tenants.data.map((tenant) => (
                        <div key={tenant.id} className="group relative rounded-2xl border border-sidebar-border/70 bg-white dark:bg-zinc-900 p-6 shadow-sm transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground text-xl font-black uppercase italic shadow-lg shadow-primary/20">
                                        {tenant.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="font-black uppercase italic tracking-tight">{tenant.name}</h3>
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase opacity-70">/{tenant.slug}</p>
                                    </div>
                                </div>
                                <Badge variant="outline" className={cn("font-black text-[9px] uppercase tracking-widest border", getStatusVariant(tenant.status))}>
                                    {tenant.status === 'active' ? 'Actif' : 'Suspendu'}
                                </Badge>
                            </div>

                            <div className="mt-6 space-y-3">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-muted-foreground uppercase">Plan Actuel :</span>
                                    <span className="font-black uppercase tracking-tight text-primary">
                                        {tenant.active_subscription?.plan.name || tenant.plan?.name || 'Standard'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-muted-foreground uppercase">Contact :</span>
                                    <span className="font-bold truncate max-w-[150px]">{tenant.email}</span>
                                </div>
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-bold text-muted-foreground uppercase">Créée le :</span>
                                    <span className="font-bold text-slate-500">{new Date(tenant.created_at).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <div className="mt-8 flex gap-3">
                                <Button
                                    variant={tenant.status === 'active' ? "destructive" : "default"}
                                    size="sm"
                                    className="flex-1 h-10 rounded-xl font-black uppercase text-[10px] tracking-widest transition-all active:scale-95"
                                    onClick={() => toggleStatus(tenant)}
                                >
                                    {tenant.status === 'active' ? 'Suspendre' : 'Activer'}
                                </Button>
                                <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-sidebar-border/70" asChild title="Ouvrir la boutique">
                                    <a href={`/${tenant.slug}/buy`} target="_blank">
                                        <ExternalLink className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {tenants.data.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 dark:bg-white/5 rounded-3xl border-2 border-dashed border-border/50">
                        <Building2 className="h-12 w-12 text-muted-foreground mb-4 opacity-20" />
                        <p className="text-muted-foreground font-black uppercase italic tracking-widest">Aucune zone trouvée</p>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
