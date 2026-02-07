import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Eye, Search, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock, ArrowUpDown } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { cn } from '@/lib/utils';

interface Transaction {
    id: number;
    reference: string;
    amount_fcfa: number;
    phone_number: string;
    campay_transaction_id: string;
    status: 'pending' | 'completed' | 'failed' | 'cancelled';
    created_at: string;
    completed_at: string | null;
    payment_method: string | null;
    failure_reason: string | null;
    meta: any;
}

interface TransactionDetail extends Transaction {
    user?: {
        name: string;
        email: string;
    };
}

interface Voucher {
    username: string;
    password: string;
    package?: {
        name: string;
    };
}

interface Props {
    transactions: {
        data: Transaction[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
    filters: {
        status: string;
        date_start: string | null;
        date_end: string | null;
        search: string | null;
    };
}

export default function TransactionsIndex({ transactions, filters }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [selectedTransaction, setSelectedTransaction] = useState<TransactionDetail | null>(null);
    const [selectedVoucher, setSelectedVoucher] = useState<Voucher | null>(null);
    const [selectedPackage, setSelectedPackage] = useState<any>(null);
    const [selectedZone, setSelectedZone] = useState<any>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [localFilters, setLocalFilters] = useState({
        status: filters.status || 'all',
        date_start: filters.date_start || '',
        date_end: filters.date_end || '',
        search: filters.search || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Gestion', href: '#' },
        { title: 'Transactions', href: `/${tenant?.slug}/transactions` },
    ];

    const handleViewDetails = async (transaction: Transaction) => {
        setIsLoading(true);
        setIsDetailModalOpen(true);

        try {
            const response = await fetch(`/${tenant?.slug}/transactions/${transaction.id}`);
            const data = await response.json();
            setSelectedTransaction(data.transaction);
            setSelectedVoucher(data.voucher);
            setSelectedPackage(data.package);
            setSelectedZone(data.zone);
        } catch (error) {
            console.error('Error fetching transaction details:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const applyFilters = () => {
        router.get(`/${tenant?.slug}/transactions`, localFilters, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const getStatusBadge = (status: string) => {
        const variants: Record<string, string> = {
            completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            pending: 'bg-amber-50 text-amber-700 border-amber-200',
            failed: 'bg-red-50 text-red-700 border-red-200',
            cancelled: 'bg-slate-50 text-slate-700 border-slate-200',
        };

        const labels: Record<string, string> = {
            completed: 'Succès',
            success: 'Succès',
            pending: 'En attente',
            failed: 'Échoué',
            cancelled: 'Annulé',
        };

        return (
            <Badge variant="outline" className={cn("font-bold text-[10px] uppercase", variants[status] || 'bg-slate-50 text-slate-700 border-slate-200')}>
                {labels[status] || status}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Transactions" />

            <div className="flex flex-col gap-6 p-4 lg:p-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
                    <p className="text-muted-foreground text-sm font-medium">
                        {transactions.total} transaction{transactions.total > 1 ? 's' : ''} au total
                    </p>
                </div>

                {/* Filters */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="search">Recherche</Label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="search"
                                    placeholder="Référence, téléphone..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="pl-9"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="status">Statut du paiement</Label>
                            <Select
                                value={localFilters.status}
                                onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
                            >
                                <SelectTrigger id="status">
                                    <SelectValue placeholder="Tous les statuts" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="success">Succès</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="failed">Échoué</SelectItem>
                                    <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label>Date début</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !localFilters.date_start && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {localFilters.date_start ? (
                                            format(new Date(localFilters.date_start + 'T00:00:00'), "d MMMM yyyy", { locale: fr })
                                        ) : (
                                            <span>Date de début</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.date_start ? new Date(localFilters.date_start + 'T00:00:00') : undefined}
                                        onSelect={(date) => setLocalFilters({ ...localFilters, date_start: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>

                        <div className="space-y-2">
                            <Label>Date fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        className={cn(
                                            "w-full justify-start text-left font-normal",
                                            !localFilters.date_end && "text-muted-foreground"
                                        )}
                                    >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {localFilters.date_end ? (
                                            format(new Date(localFilters.date_end + 'T00:00:00'), "d MMMM yyyy", { locale: fr })
                                        ) : (
                                            <span>Date de fin</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0" align="start">
                                    <Calendar
                                        mode="single"
                                        selected={localFilters.date_end ? new Date(localFilters.date_end + 'T00:00:00') : undefined}
                                        onSelect={(date) => setLocalFilters({ ...localFilters, date_end: date ? format(date, 'yyyy-MM-dd') : '' })}
                                        initialFocus
                                        locale={fr}
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t pt-6">
                        <Button
                            variant="ghost"
                            onClick={() => {
                                const reset = { status: 'all', date_start: '', date_end: '', search: '' };
                                setLocalFilters(reset);
                                router.get(`/${tenant?.slug}/transactions`, reset);
                            }}
                        >
                            Réinitialiser
                        </Button>
                        <Button onClick={applyFilters} className="px-8">
                            Appliquer les filtres
                        </Button>
                    </div>
                </Card>

                {/* Table */}
                <div className="rounded-md border">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="w-[180px]">Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Référence</TableHead>
                                <TableHead>Téléphone</TableHead>
                                <TableHead className="text-right">Montant</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <Clock className="h-12 w-12 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400">Aucune transaction trouvée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                transactions.data.map((transaction) => (
                                    <TableRow key={transaction.id}>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(transaction.created_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="font-semibold text-[10px] uppercase">
                                                Dépôt
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs">
                                            {transaction.reference || transaction.campay_transaction_id || '-'}
                                        </TableCell>
                                        <TableCell>
                                            {transaction.phone_number || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="font-bold">
                                                {transaction.amount_fcfa.toLocaleString()} <span className="text-[10px] text-muted-foreground uppercase">FCFA</span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(transaction.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                onClick={() => handleViewDetails(transaction)}
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                            <p className="text-xs font-medium text-muted-foreground">
                                Page {transactions.current_page} sur {transactions.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={transactions.current_page === 1}
                                    onClick={() => router.get(`/${tenant?.slug}/transactions?page=${transactions.current_page - 1}`, localFilters)}
                                >
                                    Précédent
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={transactions.current_page === transactions.last_page}
                                    onClick={() => router.get(`/${tenant?.slug}/transactions?page=${transactions.current_page + 1}`, localFilters)}
                                >
                                    Suivant
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[700px]">
                    <DialogHeader>
                        <DialogTitle>Détails de la transaction</DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : selectedTransaction && (
                        <div className="space-y-6 py-4">
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Type</Label>
                                        <p className="text-sm font-semibold">Dépôt</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Référence Opération</Label>
                                        <p className="text-sm font-mono break-all">{selectedTransaction.reference || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Référence Fournisseur</Label>
                                        <p className="text-sm font-mono break-all">{selectedTransaction.campay_transaction_id || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Statut</Label>
                                        <div>{getStatusBadge(selectedTransaction.status)}</div>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Identifiant (Login)</Label>
                                        <p className="text-sm font-semibold">{selectedVoucher?.username || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Mot de passe</Label>
                                        <p className="text-sm font-semibold">{selectedVoucher?.password || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Forfait</Label>
                                        <p className="text-sm font-semibold">{selectedPackage?.name || selectedTransaction?.meta?.package_name || 'N/A'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Zone</Label>
                                        <p className="text-sm font-semibold">{selectedZone?.name || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-8 border-t pt-6">
                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Destinataire</Label>
                                        <p className="text-sm font-semibold">{selectedTransaction.phone_number || '-'}</p>
                                    </div>
                                    <div className="space-y-1">
                                        <Label className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">Date</Label>
                                        <p className="text-sm font-semibold">{formatDate(selectedTransaction.created_at)}</p>
                                    </div>
                                </div>
                                <div className="space-y-2 bg-muted/30 p-4 rounded-lg">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Frais (15%)</span>
                                        <span className="font-medium">{(selectedTransaction.amount_fcfa * 0.15).toFixed(0)} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-muted-foreground">Net</span>
                                        <span className="font-medium">{(selectedTransaction.amount_fcfa * 0.85).toFixed(0)} FCFA</span>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t mt-2">
                                        <span className="font-bold text-sm">Total</span>
                                        <span className="font-black text-lg">{selectedTransaction.amount_fcfa.toLocaleString()} FCFA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
