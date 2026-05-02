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
    X,
    Target,
    Tag
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

            <div className="max-w-6xl mx-auto p-6 md:p-10 space-y-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Retraits</h1>
                        <p className="text-slate-500 text-sm font-medium">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
                    </div>

                    <Card className="bg-white border-slate-200/60 shadow-sm rounded-3xl min-w-[280px]">
                        <CardContent className="p-6 flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Solde Disponible</p>
                                <div className="flex items-baseline gap-1.5">
                                    <span className="text-3xl font-bold text-slate-900">
                                        {new Intl.NumberFormat().format(balance)}
                                    </span>
                                    <span className="text-xs font-bold text-slate-400 uppercase">FCFA</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium mt-1">Volume global : --- FCFA</p>
                            </div>
                            <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                                <Target size={20} />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-blue-50/30 border-blue-100 text-slate-600 relative py-5 px-6 rounded-3xl shadow-sm border-l-4 border-l-blue-400">
                        <Info className="h-5 w-5 text-blue-500" />
                        <div className="flex-1 pr-8">
                            <AlertTitle className="text-[11px] font-bold uppercase tracking-widest text-blue-600 mb-1">Information sur les retraits</AlertTitle>
                            <AlertDescription className="text-sm font-medium leading-relaxed opacity-80">
                                Les numéros de téléphone affichés ci-dessous sont ceux utilisés pour vos retraits. Vous pouvez configurer jusqu'à 02 numéros.
                            </AlertDescription>
                        </div>
                        <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => setShowAlert(false)}
                            className="absolute right-3 top-3 h-8 w-8 rounded-full hover:bg-blue-100/50 transition-colors"
                        >
                            <X className="h-4 w-4 opacity-40" />
                        </Button>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Section: Methods and Form */}
                    <div className="lg:col-span-8 space-y-12">
                        
                        {/* Section: My Numbers */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                    <Phone size={16} />
                                    Vos numéros de retrait
                                </h2>
                                <Button 
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl px-6 font-bold h-10 shadow-sm"
                                >
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter un numéro
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-slate-200 shadow-sm rounded-3xl overflow-hidden animate-in fade-in duration-300">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="p-8 space-y-6">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Tag size={14} />
                                                        <Label className="text-[11px] font-bold uppercase tracking-widest">Numéro de téléphone</Label>
                                                    </div>
                                                    <Input 
                                                        value={methodData.phone_number}
                                                        onChange={e => setMethodData('phone_number', e.target.value)}
                                                        className="rounded-xl h-12 border-slate-200 bg-slate-50/30 focus:ring-blue-500 px-4 font-semibold"
                                                        placeholder="Ex: 6XXXXXXXX"
                                                        required
                                                    />
                                                    <p className="text-[10px] text-slate-400 font-medium ml-1">Numéro Mobile Money (Orange ou MTN).</p>
                                                    {methodErrors.phone_number && <p className="text-xs text-red-500 font-bold ml-1">{methodErrors.phone_number}</p>}
                                                </div>
                                                <div className="space-y-3">
                                                    <div className="flex items-center gap-2 text-slate-500">
                                                        <Tag size={14} />
                                                        <Label className="text-[11px] font-bold uppercase tracking-widest">Libellé</Label>
                                                    </div>
                                                    <Input 
                                                        value={methodData.label}
                                                        onChange={e => setMethodData('label', e.target.value)}
                                                        className="rounded-xl h-12 border-slate-200 bg-slate-50/30 focus:ring-blue-500 px-4 font-semibold"
                                                        placeholder="Ex: Orange Principal"
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="px-8 pb-8 pt-0 flex justify-end gap-3">
                                            <Button type="button" variant="ghost" onClick={() => setIsAddingMethod(false)} className="font-bold">Annuler</Button>
                                            <Button type="submit" disabled={processingMethod} className="bg-slate-900 text-white rounded-xl px-8 font-bold h-11">Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {methods.map((method) => (
                                    <Card key={method.id} className="rounded-3xl border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                                        <div className="p-7 space-y-4">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1.5">
                                                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-slate-400">
                                                        {method.label || 'COMPTE 1'}
                                                    </p>
                                                    <div className="flex items-center gap-2.5">
                                                        <Phone className="h-5 w-5 text-slate-300" />
                                                        <span className="text-xl font-bold text-slate-900 tabular-nums">{method.phone_number}</span>
                                                    </div>
                                                </div>
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDeleteMethod(method.id)}
                                                    className="text-slate-300 hover:text-red-500 h-8 w-8 rounded-full"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                            <div className="flex justify-between items-center pt-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">OM / MOMO</span>
                                                {method.is_default && (
                                                    <Badge className="bg-blue-50 text-blue-600 border-none font-bold text-[9px] uppercase tracking-widest px-3 h-6 rounded-full">
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
                        <Card className="rounded-[2rem] border-slate-200 shadow-sm overflow-hidden bg-white">
                            <CardHeader className="p-8 pb-4 border-none">
                                <CardTitle className="text-xl font-bold text-slate-900">Demande de Retrait</CardTitle>
                                <CardDescription className="font-medium text-slate-500">Indiquez le montant à retirer sur le compte sélectionné.</CardDescription>
                            </CardHeader>
                            <form onSubmit={handleInitiateWithdrawal}>
                                <CardContent className="p-8 space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-slate-500 ml-1">
                                                <Tag size={14} />
                                                <Label className="text-[11px] font-bold uppercase tracking-widest">Montant (FCFA)</Label>
                                            </div>
                                            <div className="relative">
                                                <Input 
                                                    type="number"
                                                    value={withdrawalData.amount}
                                                    onChange={e => setWithdrawalData('amount', e.target.value)}
                                                    placeholder="CFA Min: 100"
                                                    className="h-14 rounded-xl text-lg font-bold border-slate-200 bg-slate-50/30 focus:ring-blue-500 pl-4 pr-12 shadow-sm"
                                                    required
                                                />
                                                <span className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-[10px] text-slate-400 uppercase">CFA</span>
                                            </div>
                                            <div className="flex justify-between px-1">
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MIN: 100 CFA</span>
                                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MAX: {balance.toLocaleString()} CFA</span>
                                            </div>
                                            {withdrawalErrors.amount && <p className="text-xs text-red-500 font-bold">{withdrawalErrors.amount}</p>}
                                        </div>

                                        <div className="space-y-3">
                                            <div className="flex items-center gap-2 text-slate-500 ml-1">
                                                <Target size={14} />
                                                <Label className="text-[11px] font-bold uppercase tracking-widest">Vers le numéro</Label>
                                            </div>
                                            <Select 
                                                value={withdrawalData.method_id} 
                                                onValueChange={(val) => setWithdrawalData('method_id', val)}
                                            >
                                                <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-slate-50/30 text-sm font-bold px-4 shadow-sm">
                                                    <SelectValue placeholder="Choisir un compte" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-200 shadow-xl">
                                                    {methods.map(m => (
                                                        <SelectItem key={m.id} value={m.id.toString()} className="rounded-xl font-semibold py-3">
                                                            {m.phone_number} {m.label ? `(${m.label})` : '(Principal)'}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="p-5 bg-amber-50/30 border border-amber-100 rounded-2xl flex items-start gap-4">
                                        <div className="p-2 bg-amber-100/50 rounded-xl text-amber-600">
                                            <Info size={16} />
                                        </div>
                                        <p className="text-[12px] font-medium text-slate-600 leading-relaxed">
                                            Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon les services.
                                        </p>
                                    </div>
                                </CardContent>
                                <CardFooter className="p-8 pt-0">
                                    <Button 
                                        disabled={processingWithdrawal || !withdrawalData.amount || Number(withdrawalData.amount) > balance}
                                        className="w-full h-14 rounded-2xl bg-slate-400 hover:bg-slate-500 text-white font-bold text-lg transition-all"
                                    >
                                        {processingWithdrawal ? 'Traitement...' : 'Initier le retrait maintenant'}
                                        <ArrowUpRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </CardFooter>
                            </form>
                        </Card>
                    </div>

                    {/* Right Section: History */}
                    <div className="lg:col-span-4 space-y-6">
                        <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                            <HistoryIcon size={14} />
                            Historique
                        </h2>

                        <div className="space-y-4">
                            {history.map((item) => (
                                <Card key={item.id} className="rounded-2xl border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden bg-white">
                                    <CardContent className="p-5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Badge className={cn(
                                                "font-bold text-[9px] uppercase tracking-widest px-2.5 h-6 border-none rounded-md",
                                                item.status === 'completed' ? "bg-emerald-50 text-emerald-600" :
                                                item.status === 'processing' ? "bg-blue-50 text-blue-600" :
                                                "bg-red-50 text-red-600"
                                            )}>
                                                {item.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1.5" />}
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <div className="flex items-baseline gap-1">
                                                    <span className="text-xl font-bold text-slate-900">{item.amount.toLocaleString()}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase">FCFA</span>
                                                </div>
                                                <p className="text-[9px] font-medium text-slate-400">
                                                    Ref: {item.reference.slice(0, 10)}...
                                                </p>
                                            </div>
                                            <span className="text-[10px] font-bold text-slate-400 italic">
                                                *{item.method?.phone_number?.slice(-4)}
                                            </span>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {history.length === 0 && (
                                <div className="py-20 text-center space-y-3 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
                                    <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                        <HistoryIcon className="h-6 w-6 text-slate-200" />
                                    </div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Aucun historique</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
