import { useState, useCallback } from 'react';
import { Head, useForm, usePage, router, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Trash2, MoreVertical, Upload, Ticket, Search, Filter, MoreHorizontal, Download, Hash, Clock, AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { SharedData } from '@/types';
import { cn } from '@/lib/utils';

// Simple custom debounce since lodash is not installed
function debounce<T extends (...args: any[]) => any>(func: T, wait: number) {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
}

interface WifiVoucher {
    id: number;
    username: string;
    password: string;
    profile_name: string;
    time_limit: string;
    status: string;
    comment: string;
    package?: {
        name: string;
    };
    created_at: string;
}

interface WifiPackage {
    id: number;
    name: string;
    price_fcfa: number;
}

interface Props {
    vouchers: {
        data: WifiVoucher[];
        links: any[];
        total: number;
        current_page: number;
        last_page: number;
        prev_page_url: string | null;
        next_page_url: string | null;
    };
    packages: WifiPackage[];
    filters: {
        search?: string;
        status?: string;
    };
    stats_summary: {
        total: number;
        available: number;
        expired: number;
        sold: number;
    };
}

export default function VouchersIndex({ vouchers, packages, filters, stats_summary }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    // Alert Dialog state
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [voucherToDelete, setVoucherToDelete] = useState<number | null>(null);
    const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Wi-Fi Management', href: '#' },
        { title: 'Stock de Tickets', href: `/${tenant?.slug}/wifi/vouchers` },
    ];

    const { data: importData, setData: setImportData, post, processing, errors, reset } = useForm({
        file: null as File | null,
        package_id: '',
    });

    const { delete: destroy } = useForm();

    // Debounced search
    const debouncedSearch = useCallback(
        debounce((value: string) => {
            router.get(`/${tenant?.slug}/wifi/vouchers`, { search: value, status: filters.status }, { preserveState: true, replace: true });
        }, 300),
        [filters.status, tenant?.slug]
    );

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
        debouncedSearch(e.target.value);
    };

    const handleStatusFilter = (status: string) => {
        router.get(`/${tenant?.slug}/wifi/vouchers`, { search: searchValue, status }, { preserveState: true });
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenant?.slug}/wifi/vouchers/import`, {
            forceFormData: true,
            onSuccess: () => {
                setIsImportModalOpen(false);
                reset('file', 'package_id');
            }
        });
    };

    const confirmDeleteSingle = (id: number) => {
        setVoucherToDelete(id);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteSingle = () => {
        if (voucherToDelete) {
            destroy(`/${tenant?.slug}/wifi/vouchers/${voucherToDelete}`, {
                onSuccess: () => {
                    setIsDeleteDialogOpen(false);
                    setVoucherToDelete(null);
                    setSelectedIds(prev => prev.filter(id => id !== voucherToDelete));
                }
            });
        }
    };

    const confirmDeleteBulk = () => {
        setIsBulkDeleteDialogOpen(true);
    };

    const handleDeleteBulk = () => {
        router.delete(`/${tenant?.slug}/wifi/vouchers/bulk-delete`, {
            data: { ids: selectedIds },
            onSuccess: () => {
                setSelectedIds([]);
                setIsBulkDeleteDialogOpen(false);
            }
        });
    };

    const toggleSelectRow = (id: number) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === vouchers.data.length && vouchers.data.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(vouchers.data.map(v => v.id));
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case 'available': return 'secondary';
            case 'sold': return 'success';
            case 'active': return 'default';
            case 'expired': return 'destructive';
            default: return 'outline';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets Wi-Fi" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Stock de Tickets Wi-Fi</h1>
                        <p className="text-muted-foreground text-sm">Gérez et filtrez votre inventaire de tickets MikroTik.</p>
                    </div>

                    <div className="flex items-center gap-2">
                        {selectedIds.length > 0 && (
                            <Button variant="destructive" className="gap-2 shadow-sm" onClick={confirmDeleteBulk}>
                                <Trash2 className="h-4 w-4" />
                                Supprimer ({selectedIds.length})
                            </Button>
                        )}
                        <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="gap-2 bg-primary hover:bg-primary/90">
                                    <Upload className="h-4 w-4" />
                                    Importer Tickets
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <form onSubmit={handleImport}>
                                    <DialogHeader>
                                        <DialogTitle>Importer des tickets</DialogTitle>
                                        <DialogDescription>
                                            Téléchargez votre fichier CSV MikroTik standard.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="package">Forfait associé</Label>
                                            <Select
                                                value={importData.package_id.toString()}
                                                onValueChange={(value) => setImportData('package_id', value)}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Sélectionnez un forfait" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {packages.map((pkg) => (
                                                        <SelectItem key={pkg.id} value={pkg.id.toString()}>
                                                            {pkg.name} ({pkg.price_fcfa} FCFA)
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.package_id && <p className="text-xs text-destructive">{errors.package_id}</p>}
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="file">Sélectionnez le fichier CSV / TXT</Label>
                                            <div
                                                className={cn(
                                                    "border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 transition-all cursor-pointer relative",
                                                    importData.file ? "border-primary bg-primary/5 shadow-inner" : "border-muted hover:border-primary/50 hover:bg-muted/30"
                                                )}
                                                onClick={() => document.getElementById('file-input')?.click()}
                                            >
                                                <Upload className={cn("h-10 w-10 transition-colors", importData.file ? "text-primary" : "text-muted-foreground")} />
                                                <div className="text-center">
                                                    <p className="text-sm font-semibold">
                                                        {importData.file ? importData.file.name : "Cliquez pour choisir un fichier"}
                                                    </p>
                                                </div>
                                                <input
                                                    id="file-input"
                                                    type="file"
                                                    accept=".csv,.txt"
                                                    className="hidden"
                                                    onChange={(e) => setImportData('file', e.target.files?.[0] || null)}
                                                />
                                            </div>
                                            {errors.file && <p className="text-sm text-destructive font-medium flex items-center gap-1 mt-1"><AlertTriangle className="h-3 w-3" /> {errors.file}</p>}
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full" disabled={processing}>
                                            {processing ? 'Chargement...' : 'Lancer l\'importation'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="bg-white shadow-sm border-none cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all" onClick={() => handleStatusFilter('all')}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Stock Total</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black">{stats_summary.total}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm border-none cursor-pointer hover:ring-2 hover:ring-green-500/20 transition-all" onClick={() => handleStatusFilter('available')}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Disponibles</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-green-600">{stats_summary.available}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm border-none cursor-pointer hover:ring-2 hover:ring-orange-500/20 transition-all" onClick={() => handleStatusFilter('expired')}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-orange-600 uppercase tracking-wider">Expirés</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-orange-600">{stats_summary.expired}</div>
                        </CardContent>
                    </Card>
                    <Card className="bg-white shadow-sm border-none cursor-pointer hover:ring-2 hover:ring-blue-500/20 transition-all" onClick={() => handleStatusFilter('sold')}>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Vendus</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-black text-blue-600">{stats_summary.sold}</div>
                        </CardContent>
                    </Card>
                </div>

                <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
                    <div className="p-4 bg-white border-b flex flex-col md:flex-row items-center gap-4">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Rechercher par utilisateur, profil ou commentaire..."
                                className="pl-9 h-10 w-full"
                                value={searchValue}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <Badge
                                variant={!filters.status || filters.status === 'all' ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleStatusFilter('all')}
                            >
                                Tous
                            </Badge>
                            <Badge
                                variant={filters.status === 'available' ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleStatusFilter('available')}
                            >
                                Disponibles
                            </Badge>
                            <Badge
                                variant={filters.status === 'sold' ? 'default' : 'outline'}
                                className="cursor-pointer"
                                onClick={() => handleStatusFilter('sold')}
                            >
                                Vendus
                            </Badge>
                        </div>
                    </div>
                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow>
                                <TableHead className="w-[40px]">
                                    <Checkbox
                                        checked={selectedIds.length === vouchers.data.length && vouchers.data.length > 0}
                                        onCheckedChange={toggleSelectAll}
                                    />
                                </TableHead>
                                <TableHead className="font-bold">Username</TableHead>
                                <TableHead className="font-bold">Password</TableHead>
                                <TableHead className="font-bold">Profil Client</TableHead>
                                <TableHead className="font-bold">Commentaire</TableHead>
                                <TableHead className="font-bold">Statut</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {vouchers.data.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                                        <div className="flex flex-col items-center">
                                            <Ticket className="h-12 w-12 opacity-10 mb-4" />
                                            <p className="font-medium">Aucun ticket trouvé.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                vouchers.data.map((voucher) => (
                                    <TableRow key={voucher.id} className={cn("hover:bg-muted/20", selectedIds.includes(voucher.id) && "bg-primary/5")}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.includes(voucher.id)}
                                                onCheckedChange={() => toggleSelectRow(voucher.id)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-mono font-bold text-primary">{voucher.username}</TableCell>
                                        <TableCell className="font-mono">{voucher.password}</TableCell>
                                        <TableCell className="text-xs font-medium italic">{voucher.package?.name || voucher.profile_name}</TableCell>
                                        <TableCell className="max-w-[200px] truncate text-[11px] text-muted-foreground font-medium">
                                            {voucher.comment}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={getStatusVariant(voucher.status) as any} className="capitalize py-0 h-5">
                                                {voucher.status}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="text-destructive gap-2 cursor-pointer" onClick={() => confirmDeleteSingle(voucher.id)}>
                                                        <Trash2 className="h-4 w-4" />
                                                        Supprimer
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {/* Pagination */}
                    {vouchers.last_page > 1 && (
                        <div className="p-4 border-t bg-white flex items-center justify-between">
                            <p className="text-xs text-muted-foreground font-medium">
                                Affichage de {vouchers.data.length} sur {vouchers.total} tickets
                            </p>
                            <div className="flex items-center gap-2">
                                <Link
                                    href={vouchers.prev_page_url || '#'}
                                    only={['vouchers']}
                                    preserveScroll
                                    className={cn(!vouchers.prev_page_url && "pointer-events-none opacity-50")}
                                >
                                    <Button variant="outline" size="sm" className="gap-1">
                                        <ChevronLeft className="h-4 w-4" />
                                        Précédent
                                    </Button>
                                </Link>
                                <div className="text-xs font-bold px-3">
                                    Page {vouchers.current_page} / {vouchers.last_page}
                                </div>
                                <Link
                                    href={vouchers.next_page_url || '#'}
                                    only={['vouchers']}
                                    preserveScroll
                                    className={cn(!vouchers.next_page_url && "pointer-events-none opacity-50")}
                                >
                                    <Button variant="outline" size="sm" className="gap-1">
                                        Suivant
                                        <ChevronRight className="h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Premium Confirmation Dialogs */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le ticket sera définitivement supprimé de votre stock.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteSingle} className="bg-destructive hover:bg-destructive/90">
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Suppression groupée</AlertDialogTitle>
                        <AlertDialogDescription>
                            Vous êtes sur le point de supprimer <span className="font-bold text-destructive">{selectedIds.length}</span> tickets.
                            Confirmez-vous cette action ?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Annuler</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteBulk} className="bg-destructive hover:bg-destructive/90">
                            Oui, tout supprimer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
