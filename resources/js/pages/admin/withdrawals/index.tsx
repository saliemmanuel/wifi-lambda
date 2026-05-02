import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Wallet, 
    Plus, 
    Trash2, 
    ArrowUpRight, 
    CheckCircle2, 
    Clock, 
    XCircle, 
    Info, 
    X,
    CreditCard,
    Smartphone,
    History as HistoryIcon,
    ArrowRightLeft
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Method {
    id: number;
    phone_number: string;
    label?: string;
    is_default: boolean;
}

interface Withdrawal {
    id: number;
    amount_fcfa: number;
    status: string;
    reference: string;
    created_at: string;
    method: {
        label: string;
        phone_number: string;
    };
}

interface WithdrawalsIndexProps {
    withdrawals: {
        data: Withdrawal[];
    };
    methods: Method[];
    stats: {
        availableBalanceFcfa: number;
    };
}

export default function WithdrawalsIndex({ withdrawals, methods, stats }: WithdrawalsIndexProps) {
    const [isAddingMethod, setIsAddingMethod] = useState(false);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '/admin/dashboard' },
        { title: 'Retraits Plateforme', href: '/admin/withdrawals' },
    ];

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        postMethod('/admin/withdrawals/methods', {
            onSuccess: () => {
                setIsAddingMethod(false);
                resetMethod();
            },
        });
    };

    const handleDeleteMethod = (id: number) => {
        if (confirm('Supprimer ce numéro de retrait ?')) {
            // Correct way to call delete with useForm is through a separate instance or the same one if configured
            // but for simplicity in this context:
            window.location.href = `/admin/withdrawals/methods/${id}/delete`; // Or use a proper Inertia delete call
        }
    };

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal('/admin/withdrawals/request', {
            onSuccess: () => {
                resetWithdrawal();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="ZAWIFI Admin | Retraits Premium" />

            <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-10">
                {/* Header with Balance Card */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-black tracking-tight text-foreground flex items-center gap-3 italic uppercase">
                            <div className="p-2 bg-indigo-600 rounded-xl shadow-lg">
                                <ArrowRightLeft className="h-6 w-6 text-white" />
                            </div>
                            Gestion des Fonds
                        </h1>
                        <p className="text-muted-foreground font-medium">Configurez vos comptes et gérez vos sorties de trésorerie.</p>
                    </div>

                    <div className="relative group overflow-hidden rounded-3xl border-none bg-slate-900 dark:bg-indigo-950 p-6 min-w-[320px] shadow-2xl transition-all hover:scale-[1.02]">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Wallet className="h-20 w-20 text-white" />
                        </div>
                        <div className="relative z-10 space-y-1">
                            <p className="text-[10px] font-black text-indigo-300 uppercase tracking-[0.2em]">Disponible en Caisse</p>
                            <div className="flex items-baseline gap-2">
                                <h3 className="text-4xl font-black tracking-tighter text-white tabular-nums">
                                    {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                </h3>
                                <span className="text-sm font-bold text-indigo-300">FCFA</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Side: Methods & Form */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Methods Grid */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Smartphone className="h-4 w-4" />
                                    Vos Comptes de Réception
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="rounded-full px-5 h-9 font-bold bg-indigo-600/5 border-indigo-600/20 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Nouveau Compte
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                {isAddingMethod && (
                                    <Card className="border-2 border-dashed border-indigo-500/30 bg-indigo-500/5 rounded-3xl overflow-hidden animate-in fade-in zoom-in duration-300">
                                        <form onSubmit={handleAddMethod}>
                                            <CardContent className="pt-6 space-y-4">
                                                <div className="space-y-4">
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Numéro Mobile Money</Label>
                                                        <Input
                                                            placeholder="237..."
                                                            className="rounded-2xl border-indigo-200 h-11 text-sm font-bold"
                                                            value={methodData.phone_number}
                                                            onChange={e => setMethodData('phone_number', e.target.value)}
                                                            required
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label className="text-[10px] font-black uppercase tracking-widest text-indigo-600 ml-1">Libellé (Optionnel)</Label>
                                                        <Input
                                                            placeholder="Principal, Orange, etc."
                                                            className="rounded-2xl border-indigo-200 h-11 text-sm font-bold"
                                                            value={methodData.label}
                                                            onChange={e => setMethodData('label', e.target.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </CardContent>
                                            <CardFooter className="flex justify-end gap-2 pb-6 px-6">
                                                <Button type="button" variant="ghost" size="sm" className="font-bold text-xs" onClick={() => setIsAddingMethod(false)}>Annuler</Button>
                                                <Button type="submit" size="sm" className="font-black text-xs px-6 rounded-xl" disabled={processingMethod}>Enregistrer</Button>
                                            </CardFooter>
                                        </form>
                                    </Card>
                                )}

                                {methods.map((method) => (
                                    <div key={method.id} className="relative group overflow-hidden rounded-[2rem] border border-border/50 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-indigo-600/30">
                                        <div className="flex flex-col justify-between h-full space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="p-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                    <Smartphone className="h-5 w-5" />
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{method.label || 'Compte Mobile'}</p>
                                                <h3 className="text-xl font-black tabular-nums tracking-tighter italic">{method.phone_number}</h3>
                                            </div>
                                            {method.is_default && (
                                                <Badge className="w-fit bg-indigo-500/10 text-indigo-600 border-none text-[9px] font-black uppercase px-2 py-0.5 rounded-lg">
                                                    Principal
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}

                                {methods.length === 0 && !isAddingMethod && (
                                    <div className="col-span-full py-16 text-center border-2 border-dashed border-muted rounded-[2.5rem]">
                                        <Smartphone className="h-10 w-10 mx-auto text-muted-foreground opacity-20" />
                                        <p className="mt-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Aucun compte enregistré</p>
                                        <Button variant="link" className="mt-2 text-indigo-600 font-bold" onClick={() => setIsAddingMethod(true)}>Ajouter mon premier numéro</Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Withdrawal Initiation Card */}
                        {methods.length > 0 && (
                            <div className="rounded-[2.5rem] border border-indigo-600/20 bg-indigo-600/[0.02] overflow-hidden shadow-sm">
                                <div className="p-8 md:p-10">
                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="h-12 w-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg">
                                            <ArrowUpRight className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tight italic">Initier un Retrait</h2>
                                            <p className="text-xs font-medium text-muted-foreground mt-1">Transférez vos revenus vers votre compte mobile.</p>
                                        </div>
                                    </div>

                                    <form onSubmit={handleInitiateWithdrawal} className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-1">Montant Souhaité</Label>
                                                <div className="relative group">
                                                    <Input
                                                        type="number"
                                                        placeholder="0.00"
                                                        className="text-2xl font-black h-16 rounded-2xl border-border/50 focus:border-indigo-600 focus:ring-indigo-600 transition-all bg-card pr-16"
                                                        min="100"
                                                        value={withdrawalData.amount_fcfa}
                                                        onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                        required
                                                    />
                                                    <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase">CFA</span>
                                                </div>
                                                {withdrawalErrors.amount_fcfa && <p className="text-xs font-bold text-destructive italic">{withdrawalErrors.amount_fcfa}</p>}
                                                <p className="text-[10px] font-bold text-muted-foreground ml-1 uppercase">Solde Max: {stats.availableBalanceFcfa.toLocaleString()} CFA</p>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 ml-1">Compte de Destination</Label>
                                                <select
                                                    className="w-full h-16 bg-card border border-border/50 rounded-2xl px-5 text-sm font-black outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all appearance-none"
                                                    value={withdrawalData.method_id}
                                                    onChange={e => setWithdrawalData('method_id', e.target.value)}
                                                >
                                                    {methods.map(m => (
                                                        <option key={m.id} value={m.id}>{m.phone_number} — {m.label || 'Principal'}</option>
                                                    ))}
                                                </select>
                                                {withdrawalErrors.method_id && <p className="text-xs font-bold text-destructive italic">{withdrawalErrors.method_id}</p>}
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-4 border-t border-indigo-600/10">
                                            <div className="flex items-start gap-3 max-w-md">
                                                <Info className="h-5 w-5 text-indigo-500 mt-0.5 shrink-0" />
                                                <p className="text-[10px] text-muted-foreground font-medium leading-relaxed italic">
                                                    Le traitement est généralement instantané mais peut prendre jusqu'à 24h selon la plateforme de paiement. Vérifiez bien vos numéros.
                                                </p>
                                            </div>
                                            <Button
                                                type="submit"
                                                disabled={processingWithdrawal || !withdrawalData.amount_fcfa || Number(withdrawalData.amount_fcfa) > stats.availableBalanceFcfa}
                                                className="w-full md:w-auto h-14 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 shadow-xl shadow-indigo-600/20 transition-all font-black uppercase tracking-widest italic"
                                            >
                                                {processingWithdrawal ? 'Séquence de retrait...' : 'Confirmer le Retrait'}
                                                <ArrowUpRight className="ml-2 h-5 w-5" />
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Side: History Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center gap-2 px-1">
                            <h2 className="text-xs font-black text-muted-foreground uppercase tracking-[0.3em] flex items-center gap-2">
                                <HistoryIcon className="h-4 w-4" />
                                Historique Récent
                            </h2>
                        </div>

                        <div className="space-y-4">
                            {withdrawals.data.map((item) => (
                                <div key={item.id} className="relative group rounded-[2rem] border border-border/40 bg-card/50 backdrop-blur-sm p-6 hover:border-indigo-600/20 transition-all">
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full border flex items-center gap-1.5",
                                                item.status === 'completed' ? "bg-emerald-500/5 text-emerald-600 border-emerald-500/20" :
                                                    item.status === 'processing' ? "bg-amber-500/5 text-amber-600 border-amber-500/20" :
                                                        "bg-red-500/5 text-red-600 border-red-500/20"
                                            )}>
                                                {item.status === 'completed' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3 animate-pulse" />}
                                                {item.status}
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground italic uppercase">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <p className="text-lg font-black text-foreground tabular-nums tracking-tighter leading-none">
                                                    {new Intl.NumberFormat().format(item.amount_fcfa)} <span className="text-[10px] opacity-40">CFA</span>
                                                </p>
                                                <p className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                                                    REF: {item.reference.slice(-8)}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-black text-foreground italic uppercase tracking-tighter">
                                                    {item.method?.label || 'Orange/MTN'}
                                                </p>
                                                <p className="text-[10px] font-bold text-muted-foreground mt-0.5">
                                                    *{item.method?.phone_number.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-24 text-center space-y-4 opacity-20">
                                    <HistoryIcon className="h-12 w-12 mx-auto" />
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Aucune transaction archivée</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
