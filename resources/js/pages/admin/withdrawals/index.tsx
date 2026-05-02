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
    ChevronRight,
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

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Administration', href: '/admin/dashboard' },
        { title: 'Retraits', href: '/admin/withdrawals' },
    ];

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal('/admin/withdrawals/request', {
            onSuccess: () => resetWithdrawal(),
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retraits" />

            <div className="max-w-6xl mx-auto p-6 md:p-10 bg-white min-h-screen">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start mb-10 gap-6">
                    <div>
                        <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Retraits</h1>
                        <p className="text-slate-500 mt-2 text-lg">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
                    </div>

                    {/* Black Balance Card */}
                    <div className="bg-[#1a1a1a] text-white p-8 rounded-[2rem] min-w-[300px] shadow-xl relative overflow-hidden">
                         <div className="absolute top-4 right-4 opacity-10">
                            <Wallet className="h-12 w-12" />
                        </div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Solde disponible</p>
                        <div className="flex items-baseline gap-2 mt-4">
                            <span className="text-5xl font-bold tabular-nums">{new Intl.NumberFormat().format(stats.availableBalanceFcfa)}</span>
                            <span className="text-sm font-bold text-slate-400">FCFA</span>
                        </div>
                    </div>
                </div>

                {/* Info Alert */}
                {showInfo && (
                    <div className="bg-[#eff6ff] border border-[#bfdbfe] rounded-2xl p-5 mb-10 flex items-start gap-4 relative">
                        <Info className="h-5 w-5 text-[#2563eb] mt-0.5" />
                        <div className="flex-1">
                            <h4 className="text-[#1e40af] font-bold text-sm">Information sur les retraits</h4>
                            <p className="text-[#1e40af] text-sm mt-1 opacity-80">
                                Les numéros de téléphone affichés ci-dessous sont ceux utilisés pour vos retraits. Vous pouvez configurer jusqu'à 02 numéros de retrait.
                            </p>
                        </div>
                        <button onClick={() => setShowInfo(false)} className="text-[#1e40af] opacity-50 hover:opacity-100">
                            <X className="h-4 w-4" />
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Withdrawal Methods */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                                    <Phone className="h-6 w-6 text-slate-400" />
                                    Vos numéros de retrait
                                </h2>
                                <Button className="bg-[#1a1a1a] hover:bg-slate-800 text-white rounded-full px-6 h-11 font-bold">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un numéro
                                </Button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {methods.map((method, index) => (
                                    <div key={method.id} className="border border-slate-200 rounded-[2rem] p-8 space-y-4 hover:border-slate-300 transition-all">
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Compte {index + 1}</p>
                                        <div className="flex items-center gap-3">
                                            <Phone className="h-5 w-5 text-slate-900" />
                                            <span className="text-2xl font-bold text-slate-900 tabular-nums tracking-tight">{method.phone_number}</span>
                                        </div>
                                        <div className="flex items-center justify-between pt-2">
                                            <span className="text-sm font-bold text-slate-400 uppercase">{method.label || 'OM'}</span>
                                            {method.is_default && (
                                                <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] uppercase tracking-widest px-3">
                                                    Par défaut
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Withdrawal Form */}
                        <div className="border border-slate-200 rounded-[2rem] overflow-hidden">
                            <div className="bg-slate-50/50 p-8 border-b border-slate-100">
                                <h3 className="text-xl font-bold text-slate-900">Demande de Retrait</h3>
                                <p className="text-sm text-slate-500 mt-1">Indiquez le montant à retirer sur le compte sélectionné.</p>
                            </div>
                            <form onSubmit={handleInitiateWithdrawal} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700">Montant (FCFA)</Label>
                                        <div className="relative">
                                            <Input
                                                type="number"
                                                placeholder="CFAMin: 100"
                                                className="h-14 rounded-2xl border-slate-200 text-lg font-medium focus:ring-slate-900"
                                                value={withdrawalData.amount_fcfa}
                                                onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div className="flex justify-between px-1">
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Min: 100 CFA</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">Max: {stats.availableBalanceFcfa} CFA</span>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-sm font-bold text-slate-700">Vers le numéro</Label>
                                        <select
                                            className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-5 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none appearance-none cursor-pointer"
                                            value={withdrawalData.method_id}
                                            onChange={e => setWithdrawalData('method_id', e.target.value)}
                                        >
                                            {methods.map(m => (
                                                <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'OM'})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="bg-[#fffbeb] border border-[#fef3c7] rounded-2xl p-5 flex items-start gap-4">
                                    <Info className="h-5 w-5 text-[#d97706] mt-0.5" />
                                    <p className="text-[#92400e] text-sm font-medium leading-relaxed">
                                        Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon les services.
                                    </p>
                                </div>

                                <Button
                                    disabled={processingWithdrawal || !withdrawalData.amount_fcfa}
                                    className="w-full h-16 bg-[#949494] hover:bg-slate-700 text-white rounded-2xl text-lg font-bold transition-all"
                                >
                                    Initier le retrait maintenant
                                    <ArrowUpRight className="ml-2 h-5 w-5" />
                                </Button>
                            </form>
                        </div>
                    </div>

                    {/* History Column */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                            <HistoryIcon className="h-6 w-6 text-slate-400" />
                            Historique
                        </h2>

                        <div className="space-y-6">
                            {withdrawals.data.map((w) => (
                                <div key={w.id} className="border border-slate-200 rounded-[1.5rem] p-6 space-y-4 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-center">
                                        <Badge className="bg-[#dcfce7] text-[#166534] border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1 flex items-center gap-1.5">
                                            <CheckCircle2 className="h-3 w-3" />
                                            {w.status.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs font-bold text-slate-400">
                                            {new Date(w.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-2xl font-bold text-slate-900 tabular-nums">
                                                {new Intl.NumberFormat().format(w.amount_fcfa)} <span className="text-xs font-bold text-slate-400">CFA</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 font-medium mt-1">Ref: {w.reference.slice(0, 12)}...</p>
                                        </div>
                                        <span className="text-xs font-bold text-slate-400 italic">
                                            *{w.method?.phone_number.slice(-4)}
                                        </span>
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
