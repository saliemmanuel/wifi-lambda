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
        method_id: methods.find(m => m.is_default)?.id?.toString() || methods[0]?.id?.toString() || '',
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
                        <h1 className="text-4xl font-black tracking-tight text-foreground italic uppercase">Retraits</h1>
                        <p className="text-muted-foreground text-lg font-medium opacity-80">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
                    </div>

                    <Card className="bg-[#121212] text-white border-none shadow-2xl min-w-[280px] relative overflow-hidden group rounded-3xl">
                        <div className="absolute right-[-20px] top-[-20px] opacity-10 group-hover:scale-110 transition-transform duration-500">
                            <Wallet size={120} />
                        </div>
                        <CardContent className="p-7 relative z-10">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40 mb-5 italic">Solde Disponible</p>
                            <div className="flex items-baseline gap-2">
                                <span className="text-5xl font-black tabular-nums tracking-tighter">
                                    {new Intl.NumberFormat().format(balance)}
                                </span>
                                <span className="text-sm font-bold opacity-50 uppercase">FCFA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-blue-50/40 dark:bg-blue-500/5 border-blue-200/50 dark:border-blue-500/20 text-blue-900 dark:text-blue-200 relative py-5 px-6 rounded-2xl shadow-sm border-l-4 border-l-blue-500">
                        <Info className="h-5 w-5 text-blue-600" />
                        <div className="flex-1 pr-8">
                            <AlertTitle className="text-sm font-black uppercase tracking-widest mb-1">Information sur les retraits</AlertTitle>
                            <AlertDescription className="text-sm opacity-80 font-medium leading-relaxed">
                                Les numéros de téléphone affichés ci-dessous sont ceux utilisés pour vos retraits. Vous pouvez configurer jusqu'à 02 numéros de retrait.
                            </AlertDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowAlert(false)}
                            className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-blue-100/50 transition-colors"
                        >
                            <X className="h-4 w-4 opacity-50" />
                        </Button>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    {/* Left Section: Methods and Form */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Section: My Numbers */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-black flex items-center gap-3">
                                    <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                        <Phone className="h-5 w-5 text-slate-600" />
                                    </span>
                                    Vos numéros de retrait
                                </h2>
                                <Button 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="bg-black hover:bg-slate-800 text-white rounded-xl px-6 font-black h-11 shadow-lg shadow-black/10 transition-all active:scale-95"
                                >
                                    <Plus className="h-4 w-4 mr-2 stroke-[3]" />
                                    Ajouter un numéro
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-2 border-dashed border-primary/20 bg-primary/[0.02] rounded-3xl overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Numéro (ex: 237...)</Label>
                                                <Input 
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    className="rounded-2xl h-14 border-none bg-white dark:bg-black/20 shadow-inner px-5 font-bold text-lg"
                                                    placeholder="6XXXXXXXX"
                                                    required
                                                />
                                                {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold ml-1">{methodErrors.phone_number}</p>}
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Libellé (ex: Orange)</Label>
                                                <Input 
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    className="rounded-2xl h-14 border-none bg-white dark:bg-black/20 shadow-inner px-5 font-bold text-lg"
                                                    placeholder="Mon compte principal"
                                                />
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-8 pb-8 pt-0 flex justify-end gap-3">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingMethod(false)} className="font-bold rounded-xl h-12 px-6">Annuler</Button>
                                            <Button type="submit" disabled={processingMethod} className="rounded-xl font-black h-12 px-10 shadow-lg">Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {methods.map((method) => (
                                    <Card key={method.id} className="rounded-[2rem] border-border/40 shadow-sm hover:shadow-xl transition-all group overflow-hidden bg-white dark:bg-slate-900/50">
                                        <div className="p-7 space-y-5">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground italic opacity-50">
                                                        {method.label || 'COMPTE DE RETRAIT'}
                                                    </p>
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-10 w-10 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-slate-400 group-hover:text-black dark:group-hover:text-white transition-colors">
                                                            <Phone size={18} />
                                                        </div>
                                                        <span className="text-2xl font-black tabular-nums tracking-tight">{method.phone_number}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                    className="text-muted-foreground hover:text-red-500 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors h-10 w-10"
                                                >
                                                    <Trash2 size={18} />
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center pt-2">
                                                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">MOMO / OM</span>
                                                {method.is_default && (
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none font-black text-[9px] uppercase tracking-widest px-4 h-7 rounded-full">
                                                        PRINCIPAL
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>

                        {/* Section: Withdrawal Request */}
                        <Card className="rounded-[2.5rem] border-border/40 shadow-xl overflow-hidden bg-white dark:bg-slate-900/50">
                            <CardHeader className="p-8 pb-0 border-none">
                                <CardTitle className="text-2xl font-black italic uppercase">Demande de Retrait</CardTitle>
                                <CardDescription className="font-bold text-base opacity-60 italic">Indiquez le montant à retirer sur le compte sélectionné.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInitiateWithdrawal}>
                                <CardContent className="p-10 space-y-10">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Montant (FCFA)</Label>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    value={withdrawalData.amount}
                                                    onChange={e => setWithdrawalData('amount', e.target.value)}
                                                    placeholder="Min: 100"
                                                    className="h-16 rounded-2xl text-2xl font-black border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 focus:ring-black transition-all pl-6 pr-16 shadow-inner"
                                                    required
                                                />
                                                <span className="absolute right-6 top-1/2 -translate-y-1/2 font-black text-xs text-muted-foreground uppercase opacity-50">FCFA</span>
                                            </div>
                                            <div className="flex justify-between px-2">
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">MIN: 100</span>
                                                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em] opacity-40">MAX: {balance.toLocaleString()}</span>
                                            </div>
                                            {withdrawalErrors.amount && <p className="text-xs text-red-500 font-bold ml-2">{withdrawalErrors.amount}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <Label className="text-xs font-black uppercase tracking-widest ml-1 opacity-70">Vers le numéro</Label>
                                            <Select 
                                                value={withdrawalData.method_id} 
                                                onValueChange={(val) => setWithdrawalData('method_id', val)}
                                            >
                                                <SelectTrigger className="h-16 rounded-2xl border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 text-base font-black px-6 shadow-inner focus:ring-black">
                                                    <SelectValue placeholder="Choisir un compte" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-border/40 shadow-2xl">
                                                    {methods.map(m => (
                                                        <SelectItem key={m.id} value={m.id.toString()} className="rounded-xl font-bold py-3">
                                                            {m.phone_number} {m.label ? `(${m.label})` : '(Principal)'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-6 bg-amber-50/50 dark:bg-amber-500/5 border border-amber-100 dark:border-amber-500/10 rounded-3xl flex items-start gap-5">
                                        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl text-amber-600 shadow-sm">
                                            <Info size={20} />
                                        </div>
                                        <p className="text-[13px] font-bold text-amber-900/80 dark:text-amber-200 leading-relaxed italic">
                                            Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon la saturation des services agrégateurs.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-10 pt-0">
                                    <Button 
                                        disabled={processingWithdrawal || !withdrawalData.amount || Number(withdrawalData.amount) > balance}
                                        className="w-full h-16 rounded-2xl bg-slate-500 hover:bg-slate-600 text-white font-black text-xl transition-all group shadow-xl shadow-slate-500/20 active:scale-[0.98]"
                                    >
                                        {processingWithdrawal ? 'Traitement...' : 'Initier le retrait maintenant'}
                                        <ArrowUpRight className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform stroke-[3]" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Section: History */}
                    <div className="lg:col-span-4 space-y-8">
                        <h2 className="text-2xl font-black flex items-center gap-3">
                            <span className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                                <HistoryIcon className="h-5 w-5 text-slate-600" />
                            </span>
                            Historique
                        </h2>

                        <div className="space-y-5">
                            {history.map((item) => (
                                <Card key={item.id} className="rounded-3xl border-border/30 shadow-sm hover:shadow-md transition-all overflow-hidden border-l-[6px] border-l-emerald-500/40 bg-white dark:bg-slate-900/30">
                                    <CardContent className="p-6 space-y-5">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                "font-black text-[9px] uppercase tracking-widest px-3 h-6 border-none rounded-full",
                                                item.status === 'completed' ? "bg-emerald-100 text-emerald-700" :
                                                item.status === 'processing' ? "bg-blue-100 text-blue-700" :
                                                "bg-red-100 text-red-700"
                                            )}>
                                                <span className="mr-1.5 opacity-60 scale-75">{getStatusIcon(item.status)}</span>
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-black text-muted-foreground uppercase opacity-40 italic">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-1.5">
                                                <div className="flex items-baseline gap-1.5">
                                                    <span className="text-2xl font-black tabular-nums tracking-tighter text-slate-800 dark:text-slate-100">{item.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-black text-muted-foreground uppercase opacity-50">CFA</span>
                                                </div>
                                                <p className="text-[9px] font-black text-muted-foreground opacity-30 uppercase tracking-tighter">
                                                    ID: {item.reference.slice(0, 14)}
                                                </p>
                                            </div>
                                            <span className="text-xs font-black text-muted-foreground italic opacity-50">
                                                *{item.method?.phone_number?.slice(-4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {history.length === 0 && (
                                <div className="py-24 text-center space-y-5 bg-slate-50/30 dark:bg-slate-900/20 rounded-[3rem] border-2 border-dashed border-slate-100 dark:border-slate-800">
                                    <div className="h-16 w-16 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
                                        <HistoryIcon className="h-8 w-8 text-slate-200 dark:text-slate-700" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300 dark:text-slate-700">Aucun historique</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
