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
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
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
        method_id: methods.find(m => m.is_default)?.id?.toString() || methods[0]?.id?.toString() || '',
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
                        <p className="text-muted-foreground text-lg font-medium opacity-80">Gérez les fonds accumulés par la plateforme.</p>
                    </div>

                    <Card className="bg-[#0f0f0f] text-white border-none shadow-2xl min-w-[300px] relative overflow-hidden group rounded-[2rem]">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Wallet size={140} />
                        </div>
                        <CardContent className="p-8 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-6 italic">Solde de la Plateforme</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tabular-nums tracking-tighter">
                                    {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                </span>
                                <span className="text-sm font-bold opacity-50 uppercase">FCFA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-slate-100/50 dark:bg-slate-900/50 border-slate-200/50 dark:border-slate-800 text-slate-900 dark:text-slate-100 relative py-5 px-6 rounded-3xl border-l-4 border-l-black dark:border-l-white shadow-sm">
                        <Info className="h-5 w-5 text-black dark:text-white" />
                        <div className="flex-1 pr-8">
                            <AlertTitle className="text-sm font-black uppercase tracking-widest mb-1">Configuration des retraits</AlertTitle>
                            <AlertDescription className="text-sm opacity-70 font-medium leading-relaxed italic">
                                Ces numéros sont utilisés pour les retraits de la plateforme. Vous pouvez ajouter ou gérer vos coordonnées ici.
                            </AlertDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowAlert(false)}
                            className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-slate-200/50 transition-colors"
                        >
                            <X className="h-4 w-4 opacity-40" />
                        </Button>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Section: Methods and Form */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Section: Withdrawal Numbers */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black flex items-center gap-3 italic">
                                    <span className="p-2 bg-black text-white rounded-xl shadow-lg">
                                        <Phone className="h-5 w-5" />
                                    </span>
                                    Numéros de retrait
                                </h2>
                                <Button 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="bg-black hover:bg-slate-800 text-white rounded-xl px-6 font-black h-11 shadow-xl shadow-black/10 transition-all active:scale-95"
                                >
                                    <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                                    Nouveau
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-2 border-dashed border-slate-200 bg-slate-50/50 rounded-[2rem] overflow-hidden animate-in fade-in slide-in-from-top-4 duration-500">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60 italic">Numéro (ex: 6XXXXXXXX)</Label>
                                                <Input 
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    className="rounded-2xl h-14 border-none bg-white dark:bg-black/20 shadow-inner px-6 font-bold text-lg focus:ring-2 focus:ring-black"
                                                    placeholder="237..."
                                                    required
                                                />
                                                {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold ml-2">{methodErrors.phone_number}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-60 italic">Libellé (ex: Admin OM)</Label>
                                                <Input 
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    className="rounded-2xl h-14 border-none bg-white dark:bg-black/20 shadow-inner px-6 font-bold text-lg focus:ring-2 focus:ring-black"
                                                    placeholder="Compte Principal"
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-8 pb-8 pt-0 flex justify-end gap-3">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingMethod(false)} className="font-black rounded-xl h-12 px-6">Annuler</Button>
                                            <Button type="submit" disabled={processingMethod} className="rounded-xl font-black h-12 px-10 bg-black text-white hover:bg-slate-800 shadow-xl">Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {methods.map((method) => (
                                    <Card key={method.id} className="rounded-[2.5rem] border-border/40 shadow-sm hover:shadow-2xl transition-all group overflow-hidden bg-white dark:bg-slate-900/50">
                                        <div className="p-8 space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-2">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground italic opacity-40">
                                                        {method.label || 'COMPTE PLATEFORME'}
                                                    </p>
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-12 w-12 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-black group-hover:text-white transition-all duration-300">
                                                            <Phone size={22} />
                                                        </div>
                                                        <span className="text-2xl font-black tabular-nums tracking-tighter">{method.phone_number}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                    className="text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors h-10 w-10"
                                                >
                                                    <Trash2 size={20} />
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-30 italic">MOBILE MONEY</span>
                                                {method.is_default && (
                                                    <Badge className="bg-black text-white dark:bg-white dark:text-black border-none font-black text-[9px] uppercase tracking-widest px-5 h-7 rounded-full">
                                                        DÉFAUT
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Section: Withdrawal Request */}
                        <Card className="rounded-[3rem] border-border/40 shadow-2xl overflow-hidden bg-white dark:bg-slate-900/50">
                            <CardHeader className="p-10 pb-0 border-none">
                                <CardTitle className="text-3xl font-black italic uppercase tracking-tight">Demande de Retrait</CardTitle>
                                <CardDescription className="font-bold text-lg opacity-50 italic">Veuillez entrer le montant à retirer de la plateforme.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInitiateWithdrawal}>
                                <CardContent className="p-12 space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70 italic">Montant à retirer (FCFA)</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    value={withdrawalData.amount_fcfa}
                                                    onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                    placeholder="CFA Min: 100"
                                                    min="100"
                                                    className="h-20 rounded-[1.5rem] text-3xl font-black border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:ring-black transition-all pl-8 pr-20 shadow-inner"
                                                    required
                                                />
                                                <span className="absolute right-8 top-1/2 -translate-y-1/2 font-black text-xs text-muted-foreground uppercase opacity-40">FCFA</span>
                                            </div>
                                            <div className="flex justify-between px-3">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-30">MIN: 100</span>
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.25em] opacity-30 italic">Dispo: {stats.availableBalanceFcfa.toLocaleString()}</span>
                                            </div>
                                            {withdrawalErrors.amount_fcfa && <p className="text-xs text-red-500 font-bold ml-3">{withdrawalErrors.amount_fcfa}</p>}
                                        </div>

                                        <div className="space-y-4">
                                            <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70 italic">Vers le numéro</Label>
                                            <Select 
                                                value={withdrawalData.method_id} 
                                                onValueChange={(val) => setWithdrawalData('method_id', val)}
                                            >
                                                <SelectTrigger className="h-20 rounded-[1.5rem] border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-xl font-black px-8 shadow-inner focus:ring-black transition-all">
                                                    <SelectValue placeholder="Compte de destination" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                                    {methods.map(m => (
                                                        <SelectItem key={m.id} value={m.id.toString()} className="rounded-xl font-black py-4 px-6 text-lg tracking-tight">
                                                            {m.phone_number} {m.label ? `(${m.label})` : '(Principal)'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-7 bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-[2rem] flex items-start gap-6">
                                        <div className="p-4 bg-white dark:bg-slate-800 rounded-2xl text-black dark:text-white shadow-sm ring-1 ring-black/5">
                                            <Info size={24} />
                                        </div>
                                        <p className="text-sm font-bold text-slate-800 dark:text-slate-300 leading-relaxed italic opacity-80">
                                            Le traitement des retraits plateforme est généralement effectué sous 24h ouvrées. Assurez-vous que le numéro de téléphone lié au compte Mobile Money est actif et capable de recevoir des fonds.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-12 pt-0">
                                    <Button 
                                        disabled={processingWithdrawal || !withdrawalData.amount_fcfa || Number(withdrawalData.amount_fcfa) > stats.availableBalanceFcfa}
                                        className="w-full h-20 rounded-[1.5rem] bg-black hover:bg-slate-900 text-white font-black text-2xl transition-all group shadow-2xl shadow-black/20 active:scale-[0.97]"
                                    >
                                        {processingWithdrawal ? 'Traitement...' : 'Effectuer le retrait'}
                                        <ArrowUpRight className="ml-4 h-8 w-8 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform stroke-[3]" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Section: History */}
                    <div className="lg:col-span-4 space-y-8">
                        <h2 className="text-2xl font-black flex items-center gap-3 italic">
                            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <HistoryIcon className="h-5 w-5 text-slate-400" />
                            </span>
                            Historique
                        </h2>

                        <div className="space-y-6">
                            {withdrawals.data.map((item) => (
                                <Card key={item.id} className="rounded-[2.5rem] border-border/30 shadow-md hover:shadow-xl transition-all overflow-hidden border-l-[8px] border-l-black dark:border-l-white bg-white dark:bg-slate-900/40">
                                    <CardContent className="p-7 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase tracking-[0.2em] px-4 h-7 border-none rounded-full",
                                                item.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                item.status === 'pending' ? "bg-amber-100 text-amber-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                <span className="mr-2 opacity-50">{getStatusIcon(item.status)}</span>
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 italic tracking-wider">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-2">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-3xl font-black tabular-nums tracking-tighter text-black dark:text-white">{item.amount_fcfa.toLocaleString()}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40">CFA</span>
                                                </div>
                                                <p className="text-[9px] font-black text-muted-foreground opacity-20 uppercase tracking-widest">
                                                    ID: {item.reference}
                                                </p>
                                            </div>
                                            <span className="text-sm font-black text-muted-foreground italic opacity-30">
                                                *{item.method?.phone_number?.slice(-4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-28 text-center space-y-6 bg-slate-50/40 dark:bg-slate-900/20 rounded-[4rem] border-4 border-dotted border-slate-100 dark:border-slate-800">
                                    <div className="h-20 w-20 bg-white dark:bg-slate-800 rounded-[2rem] flex items-center justify-center mx-auto shadow-sm">
                                        <HistoryIcon className="h-10 w-10 text-slate-100 dark:text-slate-800" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-300 dark:text-slate-800 italic">Vide</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
