import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
    Wallet,
    Plus,
    Trash2,
    Phone,
    History as HistoryIcon,
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
            const form = useForm();
            form.delete(`/admin/withdrawals/methods/${id}`);
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
            case 'completed': return <CheckCircle2 className="h-4 w-4" />;
            case 'processing': return <Clock className="h-4 w-4 animate-pulse" />;
            case 'failed': return <XCircle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Retraits Plateforme" />

            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header with Dark Balance Card */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Retraits Admin</h1>
                        <p className="text-muted-foreground text-lg font-medium">Gérez les fonds accumulés par la plateforme.</p>
                    </div>

                    <Card className="bg-[#1a1a1a] text-white border-none shadow-2xl min-w-[280px] relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={120} />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4 italic">Solde Plateforme</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tabular-nums tracking-tighter">
                                    {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                </span>
                                <span className="text-sm font-bold opacity-70">FCFA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-blue-50/50 dark:bg-blue-500/5 border-blue-200 dark:border-blue-500/20 text-blue-800 dark:text-blue-300 relative py-4 rounded-xl">
                        <Info className="h-4 w-4 text-blue-600" />
                        <div className="flex-1 pr-8">
                            <AlertTitle className="text-sm font-black uppercase tracking-wider">Configuration des retraits</AlertTitle>
                            <AlertDescription className="text-sm opacity-80 mt-1 font-medium">
                                Ces numéros sont utilisés pour les retraits de la plateforme. Vous pouvez ajouter ou gérer vos coordonnées ici.
                            </AlertDescription>
                        </div>
                        <button 
                            onClick={() => setShowAlert(false)}
                            className="absolute right-3 top-3 opacity-50 hover:opacity-100 transition-opacity"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Section: Methods and Form */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Section: Withdrawal Numbers */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    Vos numéros de retrait
                                </h2>
                                <Button 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="bg-black hover:bg-black/90 text-white rounded-xl px-6 font-bold h-10"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1">Numéro Mobile Money</Label>
                                                <Input 
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    className="rounded-xl h-12 border-none bg-white dark:bg-black/20 shadow-sm font-bold"
                                                    placeholder="Ex: 698066896"
                                                    required
                                                />
                                                {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold">{methodErrors.phone_number}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1">Libellé (Optionnel)</Label>
                                                <Input 
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    className="rounded-xl h-12 border-none bg-white dark:bg-black/20 shadow-sm font-bold"
                                                    placeholder="Ex: Compte OM Principal"
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-6 pb-6 pt-0 flex justify-end gap-3">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingMethod(false)} className="font-bold">Annuler</Button>
                                            <Button type="submit" disabled={processingMethod} className="rounded-xl font-bold px-8">Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {methods.map((method) => (
                                    <Card key={method.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden">
                                        <div className="p-6 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground italic">
                                                        {method.label || 'MOBILE MONEY'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-xl font-black tabular-nums tracking-tight">{method.phone_number}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                    className="text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">OM / MOMO</span>
                                                {method.is_default && (
                                                    <Badge className="bg-emerald-100 text-emerald-700 border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">
                                                        PAR DÉFAUT
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Section: Withdrawal Request */}
                        <Card className="rounded-2xl border-border/50 shadow-sm overflow-hidden">
                            <CardHeader className="bg-slate-50/50 dark:bg-slate-500/5 border-b border-border/50">
                                <CardTitle className="text-xl font-black">Demande de Retrait</CardTitle>
                                <CardDescription className="font-medium">Veuillez entrer le montant à retirer de la plateforme.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInitiateWithdrawal}>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-black ml-1 uppercase tracking-tighter">Montant à retirer (FCFA)</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    value={withdrawalData.amount_fcfa}
                                                    onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                    placeholder="CFA Min: 100"
                                                    min="100"
                                                    className="h-14 rounded-xl text-lg font-black border-border/60 focus:border-black transition-all pl-4 pr-12"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-muted-foreground uppercase">CFA</span>
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MIN: 100 CFA</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Disponible: {stats.availableBalanceFcfa.toLocaleString()} CFA</span>
                                            </div>
                                            {withdrawalErrors.amount_fcfa && <p className="text-xs text-red-500 font-bold">{withdrawalErrors.amount_fcfa}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-black ml-1 uppercase tracking-tighter">Vers le numéro</Label>
                                            <select 
                                                value={withdrawalData.method_id}
                                                onChange={e => setWithdrawalData('method_id', e.target.value)}
                                                className="w-full h-14 bg-background border border-border/60 rounded-xl px-4 text-sm font-bold outline-none focus:ring-2 focus:ring-black transition-all appearance-none cursor-pointer"
                                            >
                                                {methods.map(m => (
                                                    <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'Principal'})</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/20 rounded-2xl flex items-start gap-4">
                                        <div className="p-2 bg-amber-100 dark:bg-amber-500/20 rounded-full text-amber-600">
                                            <Info size={16} />
                                        </div>
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed italic">
                                            Le traitement des retraits plateforme est généralement effectué sous 24h ouvrées. Assurez-vous de la validité du numéro.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 pt-0">
                                    <Button 
                                        disabled={processingWithdrawal || !withdrawalData.amount_fcfa || Number(withdrawalData.amount_fcfa) > stats.availableBalanceFcfa}
                                        className="w-full h-14 rounded-xl bg-black hover:bg-black/90 text-white font-black text-lg transition-all group"
                                    >
                                        {processingWithdrawal ? 'Traitement...' : 'Initier le retrait'}
                                        <ArrowUpRight className="ml-2 h-5 w-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Section: History */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                            Historique
                        </h2>

                        <div className="space-y-4">
                            {withdrawals.data.map((item) => (
                                <Card key={item.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-black/20">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase tracking-widest px-2 h-6 border-none",
                                                item.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                item.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                <span className="mr-1">{getStatusIcon(item.status)}</span>
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-60">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-black tabular-nums">{item.amount_fcfa.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">CFA</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-tighter">
                                                    Ref: {item.reference}
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground italic">
                                                *{item.method?.phone_number?.slice(-4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <HistoryIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aucun historique</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
