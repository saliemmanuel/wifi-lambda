import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Phone, 
    History as HistoryIcon, 
    Plus, 
    Info, 
    X, 
    CheckCircle2, 
    ArrowUpRight,
    Wallet
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
    amount: number;
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
    balance: number;
    tenant: any;
}

export default function WithdrawalsIndex({ withdrawals, methods, balance, tenant }: WithdrawalsIndexProps) {
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [showInfo, setShowInfo] = useState(true);

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: route('tenant.dashboard', { tenant_slug: tenant.slug }) },
        { title: 'Retraits', href: '#' },
    ];

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal(route('tenant.withdrawals.store', { tenant_slug: tenant.slug }), {
            onSuccess: () => resetWithdrawal(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mes Retraits" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                
                {/* Top Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight italic text-foreground leading-none">Mes Retraits</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Récupérez vos gains de vente WiFi.</p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card min-w-[280px]">
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Solde Retirable</span>
                            <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-xl">
                                <Wallet className="h-5 w-5 text-emerald-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">
                            {new Intl.NumberFormat().format(balance)} <span className="text-sm font-bold opacity-50 uppercase">FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                {showInfo && (
                    <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-500/10 dark:bg-blue-500/5 relative">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">Consignes de retrait</p>
                            <p className="text-xs font-bold text-blue-600/80 mt-1 leading-relaxed">
                                Les fonds sont transférés vers vos comptes Mobile Money configurés. Assurez-vous que les numéros sont actifs.
                            </p>
                        </div>
                        <button onClick={() => setShowInfo(false)} className="text-blue-400 hover:text-blue-600 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Accounts Grid */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-black uppercase tracking-tight italic text-foreground">Mes Numéros</h2>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    className="h-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-indigo-500/20 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {methods.map((method) => (
                                    <div key={method.id} className="flex flex-col gap-4 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{method.label || 'Compte'}</span>
                                                <span className="text-xl font-black tracking-tight text-foreground mt-1 tabular-nums italic">{method.phone_number}</span>
                                            </div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            {method.is_default && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-2 h-5">
                                                    Principal
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Request Form */}
                        {methods.length > 0 && (
                            <div className="rounded-[2rem] border border-border/50 bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-8 border-b border-border/30 bg-slate-50/30">
                                    <h3 className="text-lg font-black uppercase tracking-tight italic text-foreground">Initier un Retrait</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Indiquez le montant à retirer.</p>
                                </div>
                                <form onSubmit={handleInitiateWithdrawal} className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Montant souhaité</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    className="h-12 rounded-xl font-black text-xl border-border/50 focus:border-indigo-600 transition-all pr-12"
                                                    value={withdrawalData.amount}
                                                    onChange={e => setWithdrawalData('amount', e.target.value)}
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase opacity-40">CFA</span>
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase">Min: 100 CFA</span>
                                                <span className="text-[9px] font-black text-emerald-600 uppercase">Max: {balance.toLocaleString()} CFA</span>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Vers le numéro</Label>
                                            <select 
                                                className="w-full h-12 bg-background border border-border/50 rounded-xl px-4 text-xs font-black uppercase italic outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 transition-all appearance-none cursor-pointer"
                                                value={withdrawalData.method_id}
                                                onChange={e => setWithdrawalData('method_id', e.target.value)}
                                            >
                                                {methods.map(m => (
                                                    <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'Momo'})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={processingWithdrawal || !withdrawalData.amount}
                                        className="w-full h-14 bg-foreground hover:bg-slate-800 text-background rounded-2xl font-black uppercase tracking-[0.2em] italic text-sm transition-all"
                                    >
                                        {processingWithdrawal ? 'Séquence en cours...' : 'Confirmer le retrait'}
                                        <ArrowUpRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>

                    {/* Right Column: History */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between px-1">
                            <h2 className="text-lg font-black uppercase tracking-tight italic text-foreground">Historique</h2>
                            <HistoryIcon className="h-4 w-4 text-muted-foreground opacity-30" />
                        </div>

                        <div className="space-y-4">
                            {withdrawals.data.map((w) => (
                                <div key={w.id} className="flex flex-col gap-4 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md group">
                                    <div className="flex justify-between items-center">
                                        <Badge className={cn(
                                            "text-[9px] font-black uppercase tracking-widest px-2 h-5 border-none",
                                            w.status === 'completed' ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600" : 
                                            w.status === 'processing' ? "bg-blue-50 dark:bg-blue-500/10 text-blue-600" : "bg-amber-50 dark:bg-amber-500/10 text-amber-600"
                                        )}>
                                            {w.status}
                                        </Badge>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase">
                                            {new Date(w.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div className="flex flex-col">
                                            <span className="text-lg font-black tracking-tight text-foreground tabular-nums italic">{w.amount.toLocaleString()} <span className="text-[10px] opacity-40 uppercase not-italic">CFA</span></span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-foreground italic uppercase">*{w.method?.phone_number.slice(-4)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}