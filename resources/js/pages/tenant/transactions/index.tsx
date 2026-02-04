import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
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
    status: 'pending' | 'success' | 'failed' | 'cancelled';
    attempted_at: string;
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
        const variants = {
            success: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
            pending: 'bg-amber-500/10 text-amber-600 border-amber-200',
            failed: 'bg-red-500/10 text-red-600 border-red-200',
            cancelled: 'bg-slate-500/10 text-slate-600 border-slate-200',
        };

        const labels = {
            success: 'Succès',
            pending: 'En attente',
            failed: 'Échoué',
            cancelled: 'Annulé',
        };

        return (
            <Badge variant="outline" className={cn("font-bold text-[10px] uppercase border", variants[status as keyof typeof variants])}>
                {labels[status as keyof typeof labels]}
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

            <div className="flex flex-col gap-6 p-4 lg:p-6 bg-[#F8FAFC] min-h-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Transactions</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                            {transactions.total} transaction{transactions.total > 1 ? 's' : ''} au total
                        </p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-xl shadow-slate-200/20 p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider ml-1">Recherche</Label>
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                                <Input
                                    placeholder="Référence, téléphone..."
                                    value={localFilters.search}
                                    onChange={(e) => setLocalFilters({ ...localFilters, search: e.target.value })}
                                    onKeyDown={(e) => e.key === 'Enter' && applyFilters()}
                                    className="h-12 pl-11 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold text-sm transition-all"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider ml-1">Statut du paiement</Label>
                            <Select
                                value={localFilters.status}
                                onValueChange={(value) => setLocalFilters({ ...localFilters, status: value })}
                            >
                                <SelectTrigger className="h-12 bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:border-primary focus:ring-4 focus:ring-primary/5 rounded-2xl font-bold">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-2xl border-slate-100 shadow-xl font-bold">
                                    <SelectItem value="all">Tous les statuts</SelectItem>
                                    <SelectItem value="success">Succès</SelectItem>
                                    <SelectItem value="pending">En attente</SelectItem>
                                    <SelectItem value="failed">Échoué</SelectItem>
                                    <SelectItem value="cancelled">Annulé</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2 flex flex-col">
                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider ml-1">Date début</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "h-12 justify-start text-left font-bold text-sm bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:border-primary rounded-2xl transition-all",
                                            !localFilters.date_start && "text-slate-400 font-medium"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-5 w-5 text-primary/50" />
                                        {localFilters.date_start ? (
                                            format(new Date(localFilters.date_start + 'T00:00:00'), "d MMMM yyyy", { locale: fr })
                                        ) : (
                                            <span>Date de début</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="start">
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

                        <div className="space-y-2 flex flex-col">
                            <Label className="text-[11px] font-black uppercase text-slate-400 tracking-wider ml-1">Date fin</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant={"outline"}
                                        className={cn(
                                            "h-12 justify-start text-left font-bold text-sm bg-slate-50/50 border-slate-100 hover:border-slate-200 focus:border-primary rounded-2xl transition-all",
                                            !localFilters.date_end && "text-slate-400 font-medium"
                                        )}
                                    >
                                        <CalendarIcon className="mr-3 h-5 w-5 text-primary/50" />
                                        {localFilters.date_end ? (
                                            format(new Date(localFilters.date_end + 'T00:00:00'), "d MMMM yyyy", { locale: fr })
                                        ) : (
                                            <span>Date de fin</span>
                                        )}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 border-none shadow-2xl rounded-3xl overflow-hidden" align="start">
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

                    <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-6">
                        <Button
                            variant="outline"
                            onClick={() => {
                                const reset = { status: 'all', date_start: '', date_end: '', search: '' };
                                setLocalFilters(reset);
                                router.get(`/${tenant?.slug}/transactions`, reset);
                            }}
                            className="rounded-xl font-bold"
                        >
                            Réinitialiser
                        </Button>
                        <Button
                            onClick={applyFilters}
                            size="lg"
                            className="rounded-xl font-bold px-8"
                        >
                            Appliquer les filtres
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 hover:bg-transparent bg-slate-50/50">
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Date</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Type</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Référence</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Téléphone</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider text-right">Solde</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Statut</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider text-right">Action</TableHead>
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
                                    <TableRow key={transaction.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="text-sm text-slate-600 font-medium">
                                            {formatDate(transaction.attempted_at)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="secondary" className="bg-blue-50 text-blue-600 border-none font-bold text-[10px] uppercase">
                                                Dépôt
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="font-mono text-xs font-bold text-slate-900">
                                            {transaction.reference || transaction.campay_transaction_id || '-'}
                                        </TableCell>
                                        <TableCell className="text-sm text-slate-600 font-medium">
                                            {transaction.phone_number || '-'}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <span className="text-sm font-black text-slate-900">
                                                {transaction.amount_fcfa.toLocaleString()} <span className="text-xs text-slate-400">XAF</span>
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            {getStatusBadge(transaction.status)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                size="icon"
                                                variant="ghost"
                                                className="h-8 w-8 rounded-lg"
                                                onClick={() => handleViewDetails(transaction)}
                                            >
                                                <Eye className="h-4 w-4 text-primary" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {transactions.last_page > 1 && (
                        <div className="border-t border-slate-100 p-4 flex items-center justify-between">
                            <p className="text-xs font-bold text-slate-500">
                                Page {transactions.current_page} sur {transactions.last_page}
                            </p>
                            <div className="flex gap-2">
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={transactions.current_page === 1}
                                    onClick={() => router.get(`/${tenant?.slug}/transactions?page=${transactions.current_page - 1}`, localFilters)}
                                    className="h-9 px-4 rounded-lg font-bold text-[11px]"
                                >
                                    Précédent
                                </Button>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    disabled={transactions.current_page === transactions.last_page}
                                    onClick={() => router.get(`/${tenant?.slug}/transactions?page=${transactions.current_page + 1}`, localFilters)}
                                    className="h-9 px-4 rounded-lg font-bold text-[11px]"
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
                <DialogContent className="sm:max-w-[700px] rounded-[32px] p-0 overflow-hidden border-none shadow-2xl">
                    <DialogHeader className="p-8 pb-6 border-b border-slate-100">
                        <DialogTitle className="text-2xl font-black uppercase tracking-tight">Détails de la transaction</DialogTitle>
                    </DialogHeader>

                    {isLoading ? (
                        <div className="p-12 flex items-center justify-center">
                            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : selectedTransaction && (
                        <div className="p-8 pt-6 space-y-6">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Type de la transaction :</Label>
                                    <p className="text-sm font-black text-slate-900">Dépôt</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Référence du fournisseur :</Label>
                                    <p className="text-sm font-mono font-black text-slate-900 break-all">
                                        {selectedTransaction.campay_transaction_id || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Des frais Taxe :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {(selectedTransaction.amount_fcfa * 0.15).toFixed(2)} XAF
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Référence de l'opération :</Label>
                                    <p className="text-sm font-mono font-black text-slate-900">
                                        {selectedTransaction.reference || '-'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Frais de la transaction (15%) :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {(selectedTransaction.amount_fcfa * 0.15).toFixed(2)} XAF
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Statut de la transaction :</Label>
                                    <div>{getStatusBadge(selectedTransaction.status)}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Frais SMS :</Label>
                                    <p className="text-sm font-black text-slate-900">0,00 XAF</p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Login de l'identifiant :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedVoucher?.username || 'OHarbv'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Prix net :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {(selectedTransaction.amount_fcfa * 0.85).toFixed(2)} XAF
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Mot de passe de l'identifiant :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedVoucher?.password || '5663'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Solde :</Label>
                                    <p className="text-lg font-black text-slate-900">
                                        {selectedTransaction.amount_fcfa.toLocaleString()} XAF
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Forfait de l'identifiant :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedPackage?.name || selectedTransaction?.meta?.package_name || 'MINI_1H'}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Numéro de téléphone du destinataire :</Label>
                                    <p className="text-sm font-black text-slate-900">
                                        {selectedTransaction.phone_number || '-'}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Zone de l'identifiant :</Label>
                                    <p className="text-sm font-black text-slate-900">{selectedZone?.name || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Statut de l'opération :</Label>
                                <p className="text-sm font-black text-slate-900">
                                    {selectedTransaction.status === 'success' ? 'Succès' : selectedTransaction.status}
                                </p>
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black uppercase text-slate-400">Date :</Label>
                                <p className="text-sm font-black text-slate-900">
                                    {formatDate(selectedTransaction.attempted_at)}
                                </p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
