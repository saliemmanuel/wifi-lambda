import { useState, useEffect } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, ShieldCheck, Zap, Smartphone, Loader2, AlertCircle, Hash } from 'lucide-react';
import { Tenant, Plan } from '@/types/tenant';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Props {
    tenant: Tenant;
    plans: Plan[];
}

export default function BillingIndex({ tenant, plans }: Props) {
    const { flash } = usePage().props as any;
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [campayRef, setCampayRef] = useState<string | null>(null);
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'pending' | 'success' | 'failed'>('idle');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Paramètres', href: '#' },
        { title: 'Abonnement & Facturation', href: `/${tenant.slug}/billing` },
    ];

    const { data, setData, post, processing, errors, reset } = useForm({
        plan_id: null as number | null,
        phone_number: '',
    });

    const openPaymentModal = (plan: Plan) => {
        setSelectedPlan(plan);
        setData('plan_id', plan.id);
        setPaymentStatus('idle');
        setCampayRef(null);
        setIsPaymentModalOpen(true);
    };

    const handleInitiatePayment = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenant.slug}/billing/initiate`, {
            onSuccess: (page: any) => {
                const ref = page.props.flash?.campay_reference;
                if (ref) {
                    setCampayRef(ref);
                    setPaymentStatus('pending');
                    startStatusCheck(ref);
                }
            }
        });
    };

    const startStatusCheck = async (reference: string) => {
        setIsCheckingStatus(true);
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/${tenant.slug}/billing/check-status/${reference}`);
                const result = await response.json();

                if (result.status === 'success') {
                    clearInterval(interval);
                    setIsCheckingStatus(false);
                    setPaymentStatus('success');

                    // Small delay before reload to let user see success message
                    setTimeout(() => {
                        window.location.reload();
                    }, 3000);
                } else if (result.status === 'failed') {
                    clearInterval(interval);
                    setIsCheckingStatus(false);
                    setPaymentStatus('failed');
                }
            } catch (err) {
                console.error("Status check failed", err);
            }
        }, 5000);

        setTimeout(() => {
            clearInterval(interval);
            setIsCheckingStatus(false);
        }, 300000);
    };

    const getUssdCode = () => {
        const phone = data.phone_number;
        if (phone.startsWith('69') || phone.startsWith('655')) return '*150#';
        if (phone.startsWith('67') || phone.startsWith('68') || phone.startsWith('650')) return '*126#';
        return '*126# ou *150#';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Abonnement" />

            <div className="flex flex-col gap-8 p-6 max-w-5xl mx-auto">
                <div className="flex flex-col gap-2 text-center md:text-left">
                    <h1 className="text-3xl font-bold tracking-tight">Votre Abonnement</h1>
                    <p className="text-muted-foreground text-lg">Gérez votre plan et passez à la vitesse supérieure quand vous le souhaitez.</p>
                </div>

                {/* Current Plan Summary */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                            <ShieldCheck className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Plan Actuel</p>
                            <h3 className="text-2xl font-bold">{tenant.plan?.name}</h3>
                        </div>
                    </div>
                </div>

                {/* Plans Comparison */}
                <div className="grid md:grid-cols-2 gap-8 mt-4">
                    {plans.map((plan) => {
                        const isCurrent = tenant.plan_id === plan.id;
                        const isBusiness = plan.slug === 'business';

                        return (
                            <Card key={plan.id} className={cn(
                                "relative flex flex-col transition-all duration-300 shadow-sm",
                                isBusiness ? "border-primary shadow-lg scale-105 z-10" : "border-border",
                                isCurrent && "opacity-80"
                            )}>
                                {isBusiness && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full uppercase tracking-widest">
                                        Recommandé
                                    </div>
                                )}
                                <CardHeader>
                                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                                    <CardDescription>
                                        {plan.slug === 'free' ? 'Idéal pour tester nos services.' : 'Pour les professionnels exigeants.'}
                                    </CardDescription>
                                    <div className="mt-4">
                                        <span className="text-4xl font-extrabold">{plan.price_fcfa.toLocaleString()} FCFA</span>
                                        <span className="text-muted-foreground"> / mois</span>
                                    </div>
                                </CardHeader>
                                <CardContent className="flex-1">
                                    <ul className="space-y-4">
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className={cn("h-5 w-5 mt-0.5", isBusiness ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-sm font-medium">
                                                {plan.commission_rate > 0
                                                    ? `Commission de ${plan.commission_rate}% sur vos ventes`
                                                    : "0% de commission sur vos ventes"}
                                            </span>
                                        </li>
                                        <li className="flex items-start gap-3">
                                            <CheckCircle2 className={cn("h-5 w-5 mt-0.5", isBusiness ? "text-primary" : "text-muted-foreground")} />
                                            <span className="text-sm">Tickets & Support Illimités</span>
                                        </li>
                                        {isBusiness && (
                                            <>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" />
                                                    <span className="text-sm font-semibold">Marque Blanche (Support Client)</span>
                                                </li>
                                                <li className="flex items-start gap-3">
                                                    <CheckCircle2 className="h-5 w-5 mt-0.5 text-primary" />
                                                    <span className="text-sm font-semibold">Accès complet à l'API</span>
                                                </li>
                                            </>
                                        )}
                                    </ul>
                                </CardContent>
                                <CardFooter>
                                    {isCurrent ? (
                                        <Button className="w-full py-6" disabled variant="outline">Plan Actuel</Button>
                                    ) : (
                                        <Button
                                            className={cn("w-full py-6 text-lg transition-all", isBusiness && "bg-primary hover:bg-primary/90")}
                                            onClick={() => openPaymentModal(plan)}
                                            disabled={processing}
                                        >
                                            {plan.price_fcfa > 0 ? 'Passer à Business' : 'Choisir ce plan'}
                                        </Button>
                                    )}
                                </CardFooter>
                            </Card>
                        );
                    })}
                </div>



                {/* Payment Dialog */}
                <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>Paiement Mobile Money </DialogTitle>
                            <DialogDescription>
                                Réglez vos frais d'abonnement pour activer le plan {selectedPlan?.name}.
                            </DialogDescription>
                        </DialogHeader>

                        {!campayRef ? (
                            <form onSubmit={handleInitiatePayment} className="space-y-6 pt-4">
                                <div className="space-y-2">
                                    <Label htmlFor="phone">Numéro Mobile Money (MTN ou Orange)</Label>
                                    <div className="relative">
                                        <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="phone"
                                            placeholder="6XXXXXXXX"
                                            className="pl-10 h-12"
                                            value={data.phone_number}
                                            onChange={e => setData('phone_number', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <p className="text-xs text-muted-foreground">Entrez votre numéro sans l'indicatif pays (ex: 677000000).</p>
                                    {(errors as any).error && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="h-4 w-4" /> {(errors as any).error}</p>}
                                </div>

                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Total à payer</span>
                                        <span className="font-bold">
                                            {selectedPlan?.price_fcfa.toLocaleString()} FCFA
                                        </span>
                                    </div>
                                </div>

                                <Button className="w-full h-12 text-lg" disabled={processing}>
                                    {processing ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : null}
                                    Payer maintenant
                                </Button>
                            </form>
                        ) : paymentStatus === 'success' ? (
                            <div className="py-10 text-center space-y-6 animate-in fade-in zoom-in duration-300">
                                <div className="flex justify-center">
                                    <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center">
                                        <CheckCircle2 className="h-12 w-12 text-green-600" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-2xl text-green-700">Paiement Réussi !</h4>
                                    <p className="text-muted-foreground">
                                        Votre abonnement au plan <strong>{selectedPlan?.name}</strong> est maintenant actif.
                                    </p>
                                </div>
                                <p className="text-sm text-muted-foreground animate-pulse">
                                    Redirection en cours...
                                </p>
                            </div>
                        ) : paymentStatus === 'failed' ? (
                            <div className="py-10 text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center">
                                        <AlertCircle className="h-10 w-10 text-red-600" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xl text-red-700">Échec du paiement</h4>
                                    <p className="text-muted-foreground">
                                        La transaction a été annulée ou a échoué.
                                    </p>
                                </div>
                                <Button
                                    className="w-full"
                                    onClick={() => {
                                        setCampayRef(null);
                                        setPaymentStatus('idle');
                                    }}
                                >
                                    Réessayer
                                </Button>
                            </div>
                        ) : (
                            <div className="py-6 text-center space-y-6">
                                <div className="flex justify-center">
                                    <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin flex items-center justify-center">
                                        <Smartphone className="h-8 w-8 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-xl">Confirmation requise</h4>
                                    <p className="text-muted-foreground px-4">
                                        Veuillez approuver le retrait sur votre téléphone.
                                    </p>
                                </div>

                                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 mx-4">
                                    <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold uppercase tracking-wider text-sm">
                                        <Hash className="h-4 w-4" />
                                        Code de validation
                                    </div>
                                    <div className="text-4xl font-black tracking-[0.2em] text-emerald-600">
                                        {getUssdCode()}
                                    </div>
                                    <p className="text-xs text-emerald-600 font-medium">
                                        Composez ce code si aucune notification n'apparaît.
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-4">
                                    <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium">
                                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                        En attente de validation...
                                    </div>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={() => startStatusCheck(campayRef)}
                                        disabled={isCheckingStatus}
                                    >
                                        Vérifier statut manuellement
                                    </Button>
                                </div>
                                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                                    Ref: {campayRef}
                                </p>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </AppLayout>
    );
}
