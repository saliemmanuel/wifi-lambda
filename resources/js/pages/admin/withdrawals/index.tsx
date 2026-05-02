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
    Wallet,
    CreditCard
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
    const [showInfo, setShowInfo] = useState(true);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Platform Admin', href: '/admin/dashboard' },
        { title: 'Retraits', href: '/admin/withdrawals' },
    ];

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal('/admin/withdrawals/request', {
            onSuccess: () => resetWithdrawal(),
        });
    };

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        postMethod('/admin/withdrawals/methods', {
            onSuccess: () => {
                setIsAddingMethod(false);
                resetMethod();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration | Retraits" />

            <div className="flex h-full flex-1 flex-col gap-8 overflow-x-auto rounded-xl p-6">
                
                {/* Top Section: Title & Balance */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight italic text-foreground leading-none">Gestion des Retraits</h1>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-2">Pilotez les sorties de fonds de la plateforme.</p>
                    </div>

                    <div className="flex flex-col gap-2 rounded-2xl border border-border/50 p-6 shadow-sm bg-card min-w-[280px]">
                        <div className="flex items-center justify-between gap-8">
                            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Solde Disponible</span>
                            <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl">
                                <Wallet className="h-5 w-5 text-amber-600" />
                            </div>
                        </div>
                        <div className="text-3xl font-black tracking-tight text-foreground">
                            {new Intl.NumberFormat().format(stats.availableBalanceFcfa)} <span className="text-sm font-bold opacity-50 uppercase">FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Info Alert - Same style but clean */}
                {showInfo && (
                    <div className="flex items-start gap-4 rounded-2xl border border-blue-100 bg-blue-50/50 p-5 dark:border-blue-500/10 dark:bg-blue-500/5 relative">
                        <Info className="h-5 w-5 text-blue-600 mt-0.5 shrink-0" />
                        <div className="flex-1">
                            <p className="text-[11px] font-black uppercase tracking-widest text-blue-700">Information sur les retraits</p>
                            <p className="text-xs font-bold text-blue-600/80 mt-1 leading-relaxed">
                                Gérez vos comptes Mobile Money pour les retraits de commissions. Assurez-vous de la validité des numéros avant toute transaction.
                            </p>
                        </div>
                        <button onClick={() => setShowInfo(false)} className="text-blue-400 hover:text-blue-600 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Left Column: Accounts & Form */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Accounts Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-1">
                                <h2 className="text-lg font-black uppercase tracking-tight italic text-foreground">Mes Comptes</h2>
                                <Button 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="h-8 rounded-xl font-black text-[10px] uppercase tracking-widest border-indigo-500/20 text-indigo-600 hover:bg-indigo-50"
                                >
                                    <Plus className="h-3 w-3 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isAddingMethod && (
                                    <div className="flex flex-col gap-4 rounded-2xl border border-indigo-500/30 p-6 bg-indigo-50/10 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Numéro Mobile Money</Label>
                                                <Input 
                                                    className="h-10 rounded-xl font-bold border-indigo-200"
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    placeholder="237..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Nom du compte</Label>
                                                <Input 
                                                    className="h-10 rounded-xl font-bold border-indigo-200"
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    placeholder="Ex: Principal"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex justify-end gap-2 mt-2">
                                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase" onClick={() => setIsAddingMethod(false)}>Annuler</Button>
                                            <Button size="sm" className="text-[10px] font-black uppercase h-8 px-4 rounded-lg" onClick={handleAddMethod} disabled={processingMethod}>Enregistrer</Button>
                                        </div>
                                    </div>
                                )}

                                {methods.map((method) => (
                                    <div key={method.id} className="flex flex-col gap-4 rounded-2xl border border-border/50 p-6 shadow-sm bg-card transition-all hover:shadow-md group">
                                        <div className="flex items-center justify-between">
                                            <div className="flex flex-col">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{method.label || 'Mobile Money'}</span>
                                                <span className="text-xl font-black tracking-tight text-foreground mt-1 tabular-nums italic">{method.phone_number}</span>
                                            </div>
                                            <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                                                <Phone className="h-4 w-4" />
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between mt-auto">
                                            {method.is_default && (
                                                <Badge className="bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 border-none font-black text-[9px] uppercase tracking-widest px-2 h-5">
                                                    Par défaut
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Request Form Section */}
                        {methods.length > 0 && (
                            <div className="rounded-[2rem] border border-border/50 bg-card shadow-sm overflow-hidden transition-all hover:shadow-md">
                                <div className="p-8 border-b border-border/30 bg-slate-50/30">
                                    <h3 className="text-lg font-black uppercase tracking-tight italic text-foreground">Demande de Retrait</h3>
                                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Transférez vos fonds vers un compte validé.</p>
                                </div>
                                <form onSubmit={handleInitiateWithdrawal} className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Montant (FCFA)</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    className="h-12 rounded-xl font-black text-xl border-border/50 focus:border-indigo-600 transition-all pr-12"
                                                    value={withdrawalData.amount_fcfa}
                                                    onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-muted-foreground uppercase opacity-40">CFA</span>
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase">Min: 100 CFA</span>
                                                <span className="text-[9px] font-black text-indigo-600 uppercase">Disponible: {stats.availableBalanceFcfa.toLocaleString()} CFA</span>
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
                                                    <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'OM'})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50/50 border border-amber-100 dark:bg-amber-500/5 dark:border-amber-500/10 rounded-2xl p-5 flex items-start gap-4">
                                        <Info className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
                                        <p className="text-[11px] font-bold text-amber-800/80 leading-relaxed italic">
                                            Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon la saturation des réseaux Mobile Money.
                                        </p>
                                    </div>

                                    <Button 
                                        type="submit"
                                        disabled={processingWithdrawal || !withdrawalData.amount_fcfa}
                                        className="w-full h-14 bg-foreground hover:bg-slate-800 text-background rounded-2xl font-black uppercase tracking-[0.2em] italic text-sm transition-all"
                                    >
                                        {processingWithdrawal ? 'Séquence en cours...' : 'Initier le retrait'}
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
                                            <span className="text-lg font-black tracking-tight text-foreground tabular-nums italic">{w.amount_fcfa.toLocaleString()} <span className="text-[10px] opacity-40 uppercase not-italic">CFA</span></span>
                                            <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-tighter mt-1 opacity-50">Ref: {w.reference.slice(0, 10)}...</span>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[9px] font-black text-foreground italic uppercase">*{w.method?.phone_number.slice(-4)}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-20 text-center flex flex-col items-center gap-3 opacity-30">
                                    <HistoryIcon className="h-10 w-10" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Aucune archive</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}