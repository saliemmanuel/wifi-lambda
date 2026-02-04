import { Head, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CreditCard, Save } from 'lucide-react';
import { useState } from 'react';

interface Plan {
    id: number;
    name: string;
    description?: string;
    slug: string;
    price_eur: number;
    price_fcfa: number;
    max_tickets_per_month: number;
    max_agents: number;
    max_storage_gb: number;
}

interface PlansIndexProps {
    plans: Plan[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
    { title: 'Plans & Tarifs', href: '/admin/plans' },
];

export default function PlansIndex({ plans }: PlansIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Plans" />
            <div className="flex flex-col gap-6 p-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight uppercase italic">Plans & Tarifs</h1>
                    <p className="text-sm font-bold text-muted-foreground uppercase text-zinc-500">Configurez les offres de la plateforme.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {plans.map((plan) => (
                        <PlanCard key={plan.id} plan={plan} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}

function PlanCard({ plan }: { plan: Plan }) {
    const [formData, setFormData] = useState({
        name: plan.name,
        description: plan.description || '',
        price_eur: plan.price_eur,
        price_fcfa: plan.price_fcfa,
        max_tickets_per_month: plan.max_tickets_per_month,
        max_agents: plan.max_agents,
        max_storage_gb: plan.max_storage_gb,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.put(`/admin/plans/${plan.id}`, formData);
    };

    return (
        <Card className="rounded-2xl border-sidebar-border/70 overflow-hidden shadow-sm hover:shadow-md transition-all">
            <CardHeader className="bg-zinc-50/50 dark:bg-white/5 border-b border-sidebar-border/50">
                <div className="flex items-center justify-between">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <CreditCard className="size-5 text-primary" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">/{plan.slug}</span>
                </div>
                <CardTitle className="text-lg font-black uppercase italic mt-2">{plan.name}</CardTitle>
                <CardDescription className="text-[10px] font-bold uppercase">Modifier les caractéristiques du plan</CardDescription>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Nom</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={true}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Stock Max (Tickets)</Label>
                            <Input
                                type="number"
                                value={formData.max_tickets_per_month}
                                onChange={e => setFormData({ ...formData, max_tickets_per_month: parseInt(e.target.value) })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={true}
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label className="text-[10px] font-black uppercase text-zinc-400">Description</Label>
                        <Textarea
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                            className="rounded-xl font-medium text-sm min-h-[80px]"
                            disabled={true}
                            placeholder="Description courte du forfait..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Prix (€)</Label>
                            <Input
                                type="number"
                                value={formData.price_eur}
                                onChange={e => setFormData({ ...formData, price_eur: parseFloat(e.target.value) })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={plan.slug !== 'business'}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Prix (CFA)</Label>
                            <Input
                                type="number"
                                value={formData.price_fcfa}
                                onChange={e => setFormData({ ...formData, price_fcfa: parseInt(e.target.value) })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={plan.slug !== 'business'}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Agents Max</Label>
                            <Input
                                type="number"
                                value={formData.max_agents}
                                onChange={e => setFormData({ ...formData, max_agents: parseInt(e.target.value) })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={true}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <Label className="text-[10px] font-black uppercase text-zinc-400">Stockage (GB)</Label>
                            <Input
                                type="number"
                                value={formData.max_storage_gb}
                                onChange={e => setFormData({ ...formData, max_storage_gb: parseInt(e.target.value) })}
                                className="h-9 rounded-xl font-bold text-sm"
                                disabled={true}
                            />
                        </div>
                    </div>

                    {plan.slug === 'business' && (
                        <Button type="submit" className="w-full h-10 rounded-xl font-black uppercase text-[10px] tracking-widest gap-2 mt-4">
                            <Save className="size-3" /> Enregistrer les modifications
                        </Button>
                    )}
                </form>
            </CardContent>
        </Card>
    );
}
