import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
            <Head title="Gestion des Retraits" />

            <div className="max-w-5xl mx-auto space-y-6 p-4">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">Retraits</h1>
                        <p className="text-muted-foreground">Gérez vos revenus et retirez vos fonds en toute sécurité.</p>
                    </div>

                    <Card className="bg-primary text-primary-foreground min-w-[240px] relative overflow-hidden">
                        <div className="absolute right-[-10px] top-[-10px] opacity-10 rotate-12">
                            <Wallet size={80} />
                        </div>
                        <CardHeader className="pb-2">
                            <CardDescription className="text-primary-foreground/70 font-medium uppercase tracking-wider text-[10px]">
                                Solde Disponible
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <span className="text-3xl font-bold tracking-tight">
                                    {new Intl.NumberFormat().format(balance)}
                                </span>
                                <span className="text-sm font-medium opacity-80 uppercase">FCFA</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-blue-50 border-blue-200 text-blue-800 relative">
                        <Info className="h-4 w-4" />
                        <div className="pr-8">
                            <AlertTitle className="font-bold">Information sur les retraits</AlertTitle>
                            <AlertDescription>
                                Les numéros de téléphone affichés ci-dessous sont ceux utilisés pour vos retraits. Vous pouvez configurer jusqu'à 02 numéros de retrait.
                            </AlertDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 absolute right-2 top-2 hover:bg-blue-100/50"
                            onClick={() => setShowAlert(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </Alert>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Methods & Withdrawal Form */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Withdrawal Methods Section */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-semibold flex items-center gap-2">
                                    <Phone className="h-5 w-5 text-muted-foreground" />
                                    Vos numéros de retrait
                                </h2>
                                {methods.length < 2 && (
                                    <Button
                                        variant="default"
                                        onClick={() => setIsAddingMethod(!isAddingMethod)}
                                        className="gap-2"
                                    >
                                        <Plus className="h-4 w-4" />
                                        Ajouter un numéro
                                    </Button>
                                )}
                            </div>

                            {isAddingMethod && (
                                <Card>
                                    <form onSubmit={handleAddMethod}>
                                        <CardHeader>
                                            <CardTitle>Nouveau numéro</CardTitle>
                                            <CardDescription>Ajoutez un compte Mobile Money pour vos retraits.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label htmlFor="phone">Numéro Mobile Money</Label>
                                                    <Input
                                                        id="phone"
                                                        placeholder="Ex: 237..."
                                                        value={methodData.phone_number}
                                                        onChange={e => setMethodData('phone_number', e.target.value)}
                                                        required
                                                    />
                                                    {methodErrors.phone_number && <p className="text-xs text-destructive font-medium">{methodErrors.phone_number}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="label">Libellé (Optionnel)</Label>
                                                    <Input
                                                        id="label"
                                                        placeholder="Ex: Compte Principal"
                                                        value={methodData.label}
                                                        onChange={e => setMethodData('label', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2">
                                            <Button type="button" variant="outline" onClick={() => setIsAddingMethod(false)}>Annuler</Button>
                                            <Button type="submit" disabled={processingMethod}>Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {methods.map((method, idx) => (
                                    <Card key={method.id} className="relative group overflow-hidden">
                                        <div className="absolute top-2 right-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteMethod(method.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <CardHeader className="pb-2">
                                            <CardDescription className="text-[10px] uppercase font-bold tracking-wider">
                                                Compte {idx + 1}
                                            </CardDescription>
                                            <CardTitle className="text-lg flex items-center gap-2">
                                                <Phone className="h-4 w-4 text-primary" />
                                                {method.phone_number}
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-muted-foreground">{method.label || 'Mobile Money'}</p>
                                                {method.is_default && (
                                                    <span className="text-[10px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase">Par défaut</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {methods.length === 0 && !isAddingMethod && (
                                    <div className="col-span-full py-12 text-center bg-muted/30 rounded-lg border-2 border-dashed">
                                        <p className="text-muted-foreground font-medium text-sm">Aucun numéro enregistré</p>
                                        <Button
                                            variant="outline"
                                            className="mt-4"
                                            onClick={() => setIsAddingMethod(true)}
                                        >
                                            Ajouter mon premier numéro
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Withdrawal Initiation Section */}
                        {methods.length > 0 && (
                            <Card className="border-primary/20 overflow-hidden">
                                <CardHeader className="bg-muted/30">
                                    <CardTitle>Demande de Retrait</CardTitle>
                                    <CardDescription>Indiquez le montant à retirer sur le compte sélectionné.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleInitiateWithdrawal}>
                                    <CardContent className="pt-6 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label htmlFor="amount">Montant (FCFA)</Label>
                                                <div className="relative">
                                                    <Input
                                                        id="amount"
                                                        type="number"
                                                        placeholder="Min: 100"
                                                        className="pl-12 text-lg font-bold"
                                                        value={withdrawalData.amount}
                                                        onChange={e => setWithdrawalData('amount', e.target.value)}
                                                        required
                                                    />
                                                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">CFA</span>
                                                </div>
                                                {withdrawalErrors.amount && <p className="text-xs text-destructive font-bold">{withdrawalErrors.amount}</p>}
                                                <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                                    <span>Min: 100 CFA</span>
                                                    <span>Max: {balance.toLocaleString()} CFA</span>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="method">Vers le numéro</Label>
                                                <Select
                                                    value={withdrawalData.method_id?.toString()}
                                                    onValueChange={(val) => setWithdrawalData('method_id', val)}
                                                >
                                                    <SelectTrigger id="method">
                                                        <SelectValue placeholder="Choisir un compte" />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {methods.map(m => (
                                                            <SelectItem key={m.id} value={m.id.toString()}>
                                                                {m.phone_number} ({m.label || 'Mobile Money'})
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                {withdrawalErrors.method_id && <p className="text-xs text-destructive font-bold">{withdrawalErrors.method_id}</p>}
                                            </div>
                                        </div>

                                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-200 flex items-start gap-3">
                                            <Info className="h-4 w-4 text-amber-700 mt-0.5" />
                                            <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                                                Les retraits sont généralement traités instantanément. Dans certains cas, cela peut prendre jusqu'à 24h selon les services.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="bg-muted/10 border-t pt-6 pb-6">
                                        <Button
                                            type="submit"
                                            disabled={processingWithdrawal || !withdrawalData.amount || Number(withdrawalData.amount) > balance}
                                            className="w-full gap-2"
                                            size="lg"
                                        >
                                            {processingWithdrawal ? 'Initialisation...' : 'Initier le retrait maintenant'}
                                            <ArrowUpRight className="h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: History */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <HistoryIcon className="h-5 w-5 text-muted-foreground" />
                            Historique
                        </h2>

                        <div className="space-y-3">
                            {history.map((item) => (
                                <Card key={item.id} className="shadow-none">
                                    <div className="p-4 flex flex-col gap-3">
                                        <div className="flex items-center justify-between">
                                            <span className={cn(
                                                "px-2 py-0.5 rounded text-[10px] font-bold uppercase border flex items-center gap-1.5",
                                                getStatusColor(item.status)
                                            )}>
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </span>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-base font-bold">
                                                    {new Intl.NumberFormat().format(item.amount)} <span className="text-[10px]">CFA</span>
                                                </p>
                                                <p className="text-[10px] text-muted-foreground">
                                                    Ref: {item.reference.slice(0, 8)}...
                                                </p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[10px] items-center italic text-muted-foreground">
                                                    *{item.method?.phone_number.slice(-4)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {history.length === 0 && (
                                <div className="py-12 text-center bg-muted/20 rounded-lg border-2 border-dashed">
                                    <HistoryIcon className="h-8 w-8 mx-auto text-muted-foreground opacity-20" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mt-2">Aucun retrait</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
