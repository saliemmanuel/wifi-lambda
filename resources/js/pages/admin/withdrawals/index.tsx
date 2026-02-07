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

            <div className="max-w-5xl mx-auto space-y-8 p-6">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight text-foreground">Retraits Plateforme</h1>
                        <p className="text-muted-foreground">Gérez les fonds accumulés par la plateforme.</p>
                    </div>

                    <Card className="bg-card border-border/50 shadow-sm min-w-[280px]">
                        <CardContent className="p-6">
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                    <Wallet className="h-6 w-6" />
                                </div>
                                <div className="space-y-0.5">
                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Solde Disponible</p>
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="text-2xl font-bold tracking-tight text-foreground">
                                            {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                        </span>
                                        <span className="text-sm font-semibold text-muted-foreground">FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Info Alert */}
                {showAlert && (
                    <Alert className="bg-muted/50 border-border/50 relative py-4">
                        <Info className="h-4 w-4" />
                        <div className="flex-1 pr-8">
                            <AlertTitle className="text-sm font-semibold">Numéro de retrait</AlertTitle>
                            <AlertDescription className="text-sm text-muted-foreground mt-1">
                                Ces numéros sont utilisés pour les retraits de la plateforme. Ajoutez ou gérez vos coordonnées bancaires/mobiles ici.
                            </AlertDescription>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 absolute right-2 top-2 text-muted-foreground hover:text-foreground"
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
                                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                    Numéros de retrait
                                </h2>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsAddingMethod(!isAddingMethod)}
                                    className="gap-2"
                                >
                                    <Plus className="h-4 w-4" />
                                    Ajouter
                                </Button>
                            </div>

                            {isAddingMethod && (
                                <Card className="border-primary/20 bg-primary/[0.02]">
                                    <form onSubmit={handleAddMethod}>
                                        <CardContent className="pt-6 space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Numéro Mobile Money</Label>
                                                    <Input
                                                        placeholder="Ex: 237695645546"
                                                        value={methodData.phone_number}
                                                        onChange={e => setMethodData('phone_number', e.target.value)}
                                                        required
                                                    />
                                                    {methodErrors.phone_number && <p className="text-xs text-destructive">{methodErrors.phone_number}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-sm font-medium">Libellé (Optionnel)</Label>
                                                    <Input
                                                        placeholder="Ex: Compte Orange Principal"
                                                        value={methodData.label}
                                                        onChange={e => setMethodData('label', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </CardContent>
                                        <CardFooter className="flex justify-end gap-2 pt-0 pb-6 pr-6">
                                            <Button type="button" variant="ghost" size="sm" onClick={() => setIsAddingMethod(false)}>Annuler</Button>
                                            <Button type="submit" size="sm" disabled={processingMethod}>Enregistrer</Button>
                                        </CardFooter>
                                    </form>
                                </Card>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {methods.map((method) => (
                                    <Card key={method.id} className="shadow-sm border-border/60 hover:border-border transition-colors group">
                                        <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">
                                                    {method.label || 'Mobile Money'}
                                                </p>
                                                <h3 className="text-lg font-semibold tabular-nums">{method.phone_number}</h3>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteMethod(method.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <div className="flex items-center justify-between mt-2">
                                                {method.is_default ? (
                                                    <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[10px] h-5 px-2">
                                                        Par défaut
                                                    </Badge>
                                                ) : <div />}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                                {methods.length === 0 && !isAddingMethod && (
                                    <div className="col-span-full py-10 text-center border-2 border-dashed border-muted rounded-xl">
                                        <p className="text-sm text-muted-foreground">Aucun numéro enregistré</p>
                                        <Button
                                            variant="link"
                                            className="mt-1"
                                            onClick={() => setIsAddingMethod(true)}
                                        >
                                            Ajouter un numéro maintenant
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Withdrawal Initiation Section */}
                        {methods.length > 0 && (
                            <Card className="shadow-sm border-border/50">
                                <CardHeader>
                                    <CardTitle className="text-lg font-bold">Demande de Retrait</CardTitle>
                                    <CardDescription>Les fonds seront transférés sur le compte sélectionné.</CardDescription>
                                </CardHeader>
                                <form onSubmit={handleInitiateWithdrawal}>
                                    <CardContent className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Montant à retirer (FCFA)</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="number"
                                                        placeholder="CFA"
                                                        className="text-lg font-semibold h-12 pr-12"
                                                        value={withdrawalData.amount_fcfa}
                                                        onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                        required
                                                    />
                                                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-xs">CFA</span>
                                                </div>
                                                {withdrawalErrors.amount_fcfa && <p className="text-xs text-destructive">{withdrawalErrors.amount_fcfa}</p>}
                                                <p className="text-[10px] text-muted-foreground">Disponible: {stats.availableBalanceFcfa.toLocaleString()} CFA</p>
                                            </div>

                                            <div className="space-y-2">
                                                <Label className="text-sm font-medium">Vers le numéro</Label>
                                                <select
                                                    className="w-full h-12 bg-background border border-input rounded-md px-3 text-sm font-medium outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-all"
                                                    value={withdrawalData.method_id}
                                                    onChange={e => setWithdrawalData('method_id', e.target.value)}
                                                >
                                                    {methods.map(m => (
                                                        <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'Principal'})</option>
                                                    ))}
                                                </select>
                                                {withdrawalErrors.method_id && <p className="text-xs text-destructive">{withdrawalErrors.method_id}</p>}
                                            </div>
                                        </div>

                                        <div className="p-4 bg-muted/30 rounded-lg border border-border/50 flex items-start gap-3">
                                            <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                                            <p className="text-xs text-muted-foreground leading-relaxed">
                                                Le traitement peut prendre jusqu'à 24h ouvrées. Assurez-vous que les informations du compte destinataire sont correctes.
                                            </p>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="pt-2 pb-6 border-t mt-4 pt-6 flex justify-end px-6">
                                        <Button
                                            type="submit"
                                            disabled={processingWithdrawal || !withdrawalData.amount_fcfa || Number(withdrawalData.amount_fcfa) > stats.availableBalanceFcfa}
                                            className="w-full md:w-auto h-11 px-8"
                                        >
                                            {processingWithdrawal ? 'Traitement...' : 'Initier le retrait'}
                                            <ArrowUpRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    </CardFooter>
                                </form>
                            </Card>
                        )}
                    </div>

                    {/* Right Column: History */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                                Historique
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {withdrawals.data.map((item) => (
                                <Card key={item.id} className="shadow-none border-border/40 hover:border-border/80 transition-all">
                                    <div className="p-4 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline" className={cn(
                                                "text-[9px] font-bold uppercase tracking-tight py-0 h-5 px-1.5 flex items-center gap-1",
                                                item.status === 'completed' ? "text-emerald-600 dark:text-emerald-400 border-emerald-500/20" :
                                                    item.status === 'processing' ? "text-amber-600 dark:text-amber-400 border-amber-500/20" :
                                                        "text-destructive border-destructive/20"
                                            )}>
                                                {getStatusIcon(item.status)}
                                                {item.status}
                                            </Badge>
                                            <span className="text-[10px] font-medium text-muted-foreground">
                                                {new Date(item.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                                            </span>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div className="space-y-0.5">
                                                <p className="text-sm font-bold text-foreground">
                                                    {new Intl.NumberFormat().format(item.amount_fcfa)} FCFA
                                                </p>
                                                <p className="text-[9px] font-medium text-muted-foreground">
                                                    {item.reference}
                                                </p>
                                            </div>
                                            <p className="text-[10px] font-semibold text-muted-foreground italic">
                                                *{item.method?.phone_number.slice(-4)}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            {withdrawals.data.length === 0 && (
                                <div className="py-20 text-center space-y-2 opacity-40">
                                    <History className="h-8 w-8 mx-auto" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Aucun retrait</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
