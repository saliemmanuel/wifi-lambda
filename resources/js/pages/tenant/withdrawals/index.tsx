import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
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

interface WithdrawalHistory {
    id: number;
    amount: number;
    status: string;
    reference: string;
    created_at: string;
    method: Method;
}

interface Props {
    methods: Method[];
    history: WithdrawalHistory[];
    balance: number;
    [key: string]: any;
}

export default function WithdrawalsIndex({ methods, history, balance }: Props) {
    const { tenant } = (usePage() as any).props;
    const [isAddingMethod, setIsAddingMethod] = useState(false);
    const [showAlert, setShowAlert] = useState(true);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: `/${tenant.slug}` },
        { title: 'Retraits', href: `/${tenant.slug}/withdrawals` },
    ];

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        postMethod(`/${tenant.slug}/withdrawals/methods`, {
            onSuccess: () => {
                setIsAddingMethod(false);
                resetMethod();
            },
        });
    };

    const handleDeleteMethod = (id: number) => {
        if (confirm('Supprimer ce numéro de retrait ?')) {
            useForm().delete(`/${tenant.slug}/withdrawals/methods/${id}`);
        }
    };

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal(`/${tenant.slug}/withdrawals/initiate`, {
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
            <Head title="Mes Retraits" />

            <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
                {/* Header with Dark Balance Card */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black tracking-tight text-foreground">Retraits</h1>
                        <p className="text-muted-foreground text-lg">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
                    </div>

                    <Card className="bg-[#1a1a1a] text-white border-none shadow-2xl min-w-[280px] relative overflow-hidden group">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={120} />
                        </div>
                        <CardContent className="p-6 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-4">Solde Disponible</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tabular-nums tracking-tighter">
                                    {new Intl.NumberFormat().format(balance)}
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
                            <AlertTitle className="text-sm font-black uppercase tracking-wider">Information sur les retraits</AlertTitle>
                            <AlertDescription className="text-sm opacity-80 mt-1 font-medium">
                                Les numéros de téléphone affichés ci-dessous sont ceux utilisés pour vos retraits. Vous pouvez configurer jusqu'à 02 numéros de retrait.
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
                        
                        {/* Section: My Numbers */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    Vos numéros de retrait
                                </h2>
                                <Button 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="bg-black hover:bg-black/90 text-white rounded-xl px-6 font-bold"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un numéro
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-2 border-dashed border-primary/20 bg-primary/5 rounded-2xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1">Numéro (ex: 237...)</Label>
                                                <Input 
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    className="rounded-xl h-12 border-none bg-white dark:bg-black/20 shadow-sm"
                                                    required
                                                />
                                                {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold">{methodErrors.phone_number}</p>}
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1">Libellé (ex: Orange)</Label>
                                                <Input 
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    className="rounded-xl h-12 border-none bg-white dark:bg-black/20 shadow-sm"
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
                                                        {method.label || 'COMPTE 1'}
                                                    </p>
                                                    <div className="flex items-center gap-2">
                                                        <Phone className="h-4 w-4 text-muted-foreground" />
                                                        <span className="text-xl font-black tabular-nums">{method.phone_number}</span>
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
                                                <span className="text-xs font-bold text-muted-foreground uppercase opacity-60">OM</span>
                                                {method.is_default && (
                                                    <Badge className="bg-slate-100 text-slate-600 border-none font-black text-[9px] uppercase tracking-widest px-3 h-6">
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
                                <CardDescription className="font-medium">Indiquez le montant à retirer sur le compte sélectionné.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInitiateWithdrawal}>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <Label className="text-sm font-black ml-1">Montant (FCFA)</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    value={withdrawalData.amount}
                                                    onChange={e => setWithdrawalData('amount', e.target.value)}
                                                    placeholder="CFA Min: 100"
                                                    className="h-14 rounded-xl text-lg font-black border-border/60 focus:border-black transition-all pl-4 pr-12"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-black text-xs text-muted-foreground uppercase">CFA</span>
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MIN: 100 CFA</span>
                                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">MAX: {balance.toLocaleString()} CFA</span>
                                            </div>
                                            {withdrawalErrors.amount && <p className="text-xs text-red-500 font-bold">{withdrawalErrors.amount}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-sm font-black ml-1">Vers le numéro</Label>
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
                                        <p className="text-xs font-bold text-amber-800 dark:text-amber-200 leading-relaxed">
                                            Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon les services.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 pt-0">
                                    <Button 
                                        disabled={processingWithdrawal || !withdrawalData.amount || Number(withdrawalData.amount) > balance}
                                        className="w-full h-14 rounded-xl bg-slate-500 hover:bg-slate-600 text-white font-black text-lg transition-all group"
                                    >
                                        {processingWithdrawal ? 'Traitement en cours...' : 'Initier le retrait maintenant'}
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
                            {history.map((item) => (
                                <Card key={item.id} className="rounded-2xl border-border/50 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-4 border-l-emerald-500/50">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase tracking-widest px-2 h-6 border-none",
                                                item.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                item.status === 'processing' ? "bg-blue-100 text-blue-700" :
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
                                                    <span className="text-xl font-black tabular-nums">{item.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-muted-foreground">CFA</span>
                                                </div>
                                                <p className="text-[9px] font-bold text-muted-foreground opacity-50 uppercase tracking-tighter">
                                                    Ref: {item.reference.slice(0, 12)}...
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-black text-muted-foreground italic">
                                                *{item.method?.phone_number?.slice(-4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {history.length === 0 && (
                                <div className="py-20 text-center space-y-4 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200">
                                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                                        <HistoryIcon className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Aucun retrait</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
