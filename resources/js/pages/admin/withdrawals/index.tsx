import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
    Wallet,
    Plus,
    Trash2,
    Phone,
    History,
    CheckCircle2,
    Clock,
    XCircle,
    ArrowUpRight,
    Info,
    X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { BreadcrumbItem } from '@/types';

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
        totalRevenueEur: number;
        availableBalanceFcfa: number;
        totalWithdrawnFcfa: number;
    };
}

export default function WithdrawalsIndex({ withdrawals, methods, stats }: WithdrawalsIndexProps) {
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [showAlert, setShowAlert] = useState(true);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
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
            useForm().delete(`/admin/withdrawals/methods/${id}`);
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

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle2 className="h-4 w-4 text-green-500" />;
            case 'processing': return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
            case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
            default: return <Clock className="h-4 w-4 text-slate-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-50 text-green-700 border-green-100';
            case 'processing': return 'bg-blue-50 text-blue-700 border-blue-100';
            case 'failed': return 'bg-red-50 text-red-700 border-red-100';
            default: return 'bg-slate-50 text-slate-700 border-slate-100';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retraits Plateforme" />

            <div className="max-w-5xl mx-auto space-y-8 p-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Retraits Plateforme</h1>
                        <p className="text-slate-500 font-medium">Gérez les fonds accumulés par la plateforme.</p>
                    </div>

                    <Card className="bg-primary text-primary-foreground border-none shadow-lg shadow-primary/20 overflow-hidden relative min-w-[300px]">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10">
                            <Wallet size={120} />
                        </div>
                        <CardContent className="pt-6 pb-6 px-8 relative z-10">
                            <div className="space-y-1">
                                <p className="text-xs font-bold uppercase tracking-widest opacity-80 text-primary-foreground/80">Solde Disponible</p>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-black tracking-tighter">
                                        {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                    </span>
                                    <span className="text-lg font-bold opacity-80">FCFA</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-blue-600 border-none text-white rounded-2xl p-6 relative">
                        <Info className="h-5 w-5 text-white" />
                        <X
                            className="h-4 w-4 absolute right-4 top-4 cursor-pointer opacity-70 hover:opacity-100"
                            onClick={() => setShowAlert(false)}
                        />
                        <AlertTitle className="text-lg font-bold mb-2">Numéro de retrait</AlertTitle>
                        <AlertDescription className="text-blue-50 font-medium leading-relaxed opacity-90">
                            Les numéros de téléphone affichés ici sont ceux utilisés pour les retraits de la plateforme. Vous pouvez ajouter ou supprimer des numéros selon vos besoins.
                        </AlertDescription>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Methods & Withdrawal Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Withdrawal Methods Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-primary" />
                                    Numéros de retrait
                                </h2>
                                <Button
                                    variant="default"
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="rounded-xl font-bold gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter un numéro
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-2 border-dashed border-slate-200 shadow-none bg-slate-50/50 rounded-2xl">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Numéro Mobile Money (237...)</Label>
                                                    <Input
                                                        placeholder="Ex: 695645546"
                                                        value={methodData.phone_number}
                                                        onChange={e => setMethodData('phone_number', e.target.value)}
                                                        className="h-12 rounded-xl"
                                                        required
                                                    />
                                                    {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold">{methodErrors.phone_number}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="font-bold">Libellé (Optionnel)</Label>
                                                    <Input
                                                        placeholder="Ex: Compte Principal"
                                                        value={methodData.label}
                                                        onChange={e => setMethodData('label', e.target.value)}
                                                        className="h-12 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button type="button" variant="ghost" className="rounded-xl font-bold" onClick={() => setIsAddingMethod(false)}>Annuler</Button>
                                            <Button type="submit" disabled={processingMethod} className="rounded-xl font-black">Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {methods.map((method, idx) => (
                                    <Card key={method.id} className="rounded-2xl border shadow-sm relative overflow-hidden group">
                                        <div className="absolute top-4 right-4">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteMethod(method.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardHeader className="pb-3">
                                            <p className="text-[10px] uppercase tracking-widest font-bold text-slate-400">Numéro de téléphone {idx + 1}</p>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary" />
                                                {method.phone_number}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-slate-500">{method.label || 'Mobile Money'}</p>
                                                {method.is_default && (
                                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-tight">Par défaut</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {methods.length === 0 && !isAddingMethod && (
                                    <div className="col-span-full py-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                                        <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">Aucun numéro enregistré</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4 rounded-xl font-bold"
                                            onClick={() => setIsAddingMethod(true)}
                                        >
                                            Ajouter le premier numéro
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Withdrawal Initiation Section */}
                        {methods.length > 0 && (
                            <Card className="rounded-3xl border shadow-xl bg-white overflow-hidden border-primary/10">
                                <CardHeader className="bg-slate-50/50 border-b pb-6">
                                    <CardTitle>Demande de Retrait</CardTitle>
                                    <CardDescription>Indiquez le montant à retirer de la plateforme.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleInitiateWithdrawal}>
                                    <CardContent className="pt-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-base font-bold text-slate-800">Montant (FCFA)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder="Min: 100"
                                                        className="h-14 text-xl font-black rounded-2xl pl-12 border-slate-200 focus-visible:ring-primary/20"
                                                        value={withdrawalData.amount_fcfa}
                                                        onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                        required
                                                    />
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black">CFA</span>
                                                </div>
                                                {withdrawalErrors.amount_fcfa && <p className="text-xs text-red-500 font-bold">{withdrawalErrors.amount_fcfa}</p>}
                                                <div className="flex justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1">
                                                    <span>Min: 100 CFA</span>
                                                    <span>Max: {stats.availableBalanceFcfa.toLocaleString()} CFA</span>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <Label className="text-base font-bold text-slate-800">Vers le numéro</Label>
                                                <select
                                                    className="w-full h-14 bg-white border border-slate-200 rounded-2xl px-4 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                                                    value={withdrawalData.method_id}
                                                    onChange={e => setWithdrawalData('method_id', e.target.value)}
                                                >
                                                    {methods.map(m => (
                                                        <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'Principal'})</option>
                                                    ))}
                                                </select>
                                                {withdrawalErrors.method_id && <p className="text-xs text-red-500 font-bold">{withdrawalErrors.method_id}</p>}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-yellow-50 rounded-2xl border border-yellow-100 flex items-start gap-4">
                                            <div className="p-2 bg-yellow-100 rounded-lg">
                                                <Info className="h-4 w-4 text-yellow-700" />
                                            </div>
                                            <p className="text-xs text-yellow-800 font-medium leading-relaxed">
                                                Le retrait sera traité instantanément ou dans les 24h ouvrées. Assurez-vous que le solde de la plateforme est suffisant pour couvrir cette opération.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-slate-50/30 border-t p-8">
                                        <Button
                                            type="submit"
                                            disabled={processingWithdrawal || !withdrawalData.amount_fcfa || Number(withdrawalData.amount_fcfa) > stats.availableBalanceFcfa}
                                            className="w-full h-14 rounded-2xl text-lg font-black shadow-lg shadow-primary/30 transition-all hover:scale-[1.01] active:scale-[0.99]"
                                        >
                                            {processingWithdrawal ? 'Initialisation...' : 'Initier le retrait maintenant'}
                                            <ArrowUpRight className="ml-2 h-5 w-5" />
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: History */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-bold flex items-center gap-2 px-2">
                            <History className="h-5 w-5 text-primary" />
                            Historique récent
                        </h2>

                        <div className="space-y-3">
                            {withdrawals.data.map((item) => (
                                <Card key={item.id} className="rounded-2xl border shadow-sm group hover:border-primary/20 transition-all">
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5",
                                                getStatusColor(item.status)
                                            )}>
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </span>
                                            <span className="text-[11px] font-bold text-slate-400">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-sm font-black text-slate-900">
                                                    {new Intl.NumberFormat().format(item.amount_fcfa)} FCFA
                                                </p>
                                                <p className="text-[10px] font-medium text-slate-500 mt-0.5">
                                                    Ref: {item.reference}
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">Vers</p>
                                                <p className="text-[11px] font-black text-slate-600 italic">
                                                    *{item.method?.phone_number.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-12 text-center opacity-50 space-y-2">
                                    <History className="h-12 w-12 mx-auto text-slate-200" />
                                    <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Aucun retrait</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
