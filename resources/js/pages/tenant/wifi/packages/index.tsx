import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Wifi, Edit2, Trash2, Wallet, Clock, MapPin, Filter, Tag, Info, Bookmark, AlignLeft, Coins, XCircle, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Zone {
    id: number;
    name: string;
}

interface WifiPackage {
    id: number;
    name: string;
    description: string | null;
    price_fcfa: number;
    profile_name: string;
    time_limit_display: string;
    time_limit_minutes: number;
    mikrotik_router_id: number | null;
    router?: Zone | null;
}

interface Props {
    packages: WifiPackage[];
    zones: Zone[];
}

export default function WifiPackagesIndex({ packages, zones }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingPackage, setEditingPackage] = useState<WifiPackage | null>(null);
    const [packageToDelete, setPackageToDelete] = useState<number | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [filterZone, setFilterZone] = useState<string>('all');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Wi-Fi Management', href: '#' },
        { title: 'Forfaits & Profils', href: `/${tenant?.slug}/wifi/packages` },
    ];

    const { data, setData, post, put, processing, errors, reset, delete: destroy, transform } = useForm({
        mikrotik_router_id: null as number | null,
        name: '',
        description: '',
        price_fcfa: 0,
        profile_name: '',
        time_limit_display: '',
        time_limit_minutes: 0,
    });

    transform((data) => ({
        ...data,
        profile_name: data.profile_name || data.name,
        // Ensure Minutes is set if not already (though handleDurationChange should handle it)
        time_limit_minutes: data.time_limit_minutes || 60,
    }));

    const parseDuration = (value: string) => {
        const regex = /(\d+)\s*([a-zA-Z]+)/;
        const match = value.match(regex);
        if (match) {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase(); // h, j, d, m
            if (unit.startsWith('h')) return amount * 60;
            if (unit.startsWith('j') || unit.startsWith('d')) return amount * 1440;
            if (unit.startsWith('m')) return amount; // minutes or months? Assume minutes for now or clarify. Usually 'm' is minutes.
        }
        return 60; // Default
    };

    const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setData(data => ({
            ...data,
            time_limit_display: val,
            time_limit_minutes: parseDuration(val)
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const options = {
            onSuccess: () => {
                setIsAddModalOpen(false);
                setEditingPackage(null);
                reset();
            }
        };

        if (editingPackage) {
            put(`/${tenant?.slug}/wifi/packages/${editingPackage.id}`, options);
        } else {
            post(`/${tenant?.slug}/wifi/packages`, options);
        }
    };

    const openEditModal = (pkg: WifiPackage) => {
        setEditingPackage(pkg);
        setData({
            mikrotik_router_id: pkg.mikrotik_router_id || (pkg.router?.id || null),
            name: pkg.name,
            description: pkg.description || '',
            price_fcfa: pkg.price_fcfa,
            profile_name: pkg.profile_name,
            time_limit_display: pkg.time_limit_display,
            time_limit_minutes: pkg.time_limit_minutes,
        });
        setIsAddModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setPackageToDelete(id);
        setIsDeleteAlertOpen(true);
    };

    const handleActualDelete = () => {
        if (packageToDelete) {
            destroy(`/${tenant?.slug}/wifi/packages/${packageToDelete}`, {
                onSuccess: () => {
                    setIsDeleteAlertOpen(false);
                    setPackageToDelete(null);
                }
            });
        }
    };

    const getIconColor = (index: number) => {
        const colors = [
            'bg-blue-50 dark:bg-blue-500/10 text-blue-500',
            'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-500',
            'bg-purple-50 dark:bg-purple-500/10 text-purple-500',
            'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500',
            'bg-orange-50 dark:bg-orange-500/10 text-orange-500',
            'bg-pink-50 dark:bg-pink-500/10 text-pink-500',
        ];
        return colors[index % colors.length];
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Forfaits Wi-Fi" />

            <div className="flex flex-col gap-4 p-3 lg:p-4 bg-background min-h-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-black tracking-tight text-foreground leading-none">Catalogue Wi-Fi</h1>
                        <p className="text-muted-foreground font-bold text-[10px] uppercase tracking-wider">Gérer les forfaits et profils</p>
                    </div>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingPackage(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Créer un nouveau tarif
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-xl">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                    <Tag className="h-5 w-5" />
                                    {editingPackage ? 'Modifier le tarif' : 'Créer un nouveau tarif'}
                                </DialogTitle>
                                <DialogDescription>
                                    Définissez les détails de votre nouveau forfait Wi-Fi.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-6 py-4">
                                <Alert className="bg-cyan-50 border-cyan-200 text-cyan-800">
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Conseil</AlertTitle>
                                    <AlertDescription>
                                        Créez des tarifs attractifs et adaptés à votre clientèle pour maximiser vos ventes.
                                    </AlertDescription>
                                </Alert>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="zone" className="flex items-center gap-2">
                                            <Wifi className="h-4 w-4 text-muted-foreground" />
                                            Zone WiFi
                                        </Label>
                                        <Select
                                            value={data.mikrotik_router_id?.toString()}
                                            onValueChange={(val) => setData('mikrotik_router_id', parseInt(val))}
                                        >
                                            <SelectTrigger id="zone">
                                                <SelectValue placeholder="Choisissez la zone WiFi" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {zones.map((zone) => (
                                                    <SelectItem key={zone.id} value={zone.id.toString()}>
                                                        {zone.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.mikrotik_router_id && <p className="text-sm text-destructive">{errors.mikrotik_router_id}</p>}
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name" className="flex items-center gap-2">
                                                <Bookmark className="h-4 w-4 text-muted-foreground" />
                                                Nom du forfait
                                            </Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={e => setData('name', e.target.value)}
                                                placeholder="Ex: 1HEURE"
                                                required
                                            />
                                            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="duration" className="flex items-center gap-2">
                                                <Clock className="h-4 w-4 text-muted-foreground" />
                                                Durée de validité
                                            </Label>
                                            <Input
                                                id="duration"
                                                value={data.time_limit_display}
                                                onChange={handleDurationChange}
                                                placeholder="Ex: 1H"
                                                required
                                            />
                                            {errors.time_limit_display && <p className="text-sm text-destructive">{errors.time_limit_display}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="flex items-center gap-2">
                                            <AlignLeft className="h-4 w-4 text-muted-foreground" />
                                            Description
                                        </Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="Ex: Internet haute vitesse illimité"
                                            className="min-h-[80px]"
                                        />
                                        {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="price" className="flex items-center gap-2">
                                            <Coins className="h-4 w-4 text-muted-foreground" />
                                            Prix (FCFA)
                                        </Label>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price_fcfa}
                                            onChange={e => setData('price_fcfa', parseInt(e.target.value))}
                                            placeholder="Ex: 500"
                                            required
                                        />
                                        {errors.price_fcfa && <p className="text-sm text-destructive">{errors.price_fcfa}</p>}
                                    </div>

                                    <DialogFooter className="pt-4">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <XCircle className="h-4 w-4 mr-2" />
                                            Annuler
                                        </Button>
                                        <Button
                                            type="submit"
                                            disabled={processing}
                                            variant="default"
                                        >
                                            <CheckCircle2 className="h-4 w-4 mr-2" />
                                            {editingPackage ? 'Modifier le tarif' : 'Créer le tarif'}
                                        </Button>
                                    </DialogFooter>
                                </form>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {packages.map((pkg, idx) => (
                        <Card key={pkg.id} className="group border border-border/50 shadow-sm hover:shadow-md transition-all rounded-xl bg-card overflow-hidden">
                            <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-lg", getIconColor(idx))}>
                                        <Wifi className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase text-muted-foreground leading-none">
                                        {pkg.profile_name}
                                    </span>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => openEditModal(pkg)}>
                                        <Edit2 className="h-3 w-3 text-slate-400" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => confirmDelete(pkg.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardHeader>

                            <CardContent className="p-3 pt-2 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                    <CardTitle className="text-lg font-black text-foreground leading-tight uppercase tracking-tight">
                                        {pkg.name}
                                    </CardTitle>
                                </div>

                                {pkg.description ? (
                                    <p className="text-muted-foreground text-[11px] font-bold leading-tight line-clamp-1 min-h-[14px]">
                                        {pkg.description}
                                    </p>
                                ) : (
                                    <div className="h-[14px]" />
                                )}

                                <div className="flex items-center justify-between bg-muted/30 border border-border/50 rounded-lg p-2.5">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] uppercase font-black text-muted-foreground tracking-wider">Prix</p>
                                        <p className="text-sm font-black text-foreground leading-none">
                                            {pkg.price_fcfa.toLocaleString()} <span className="text-[10px] text-muted-foreground">CFA</span>
                                        </p>
                                    </div>
                                    <div className="text-right space-y-0.5">
                                        <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Durée</p>
                                        <p className="text-xs font-black text-primary uppercase leading-none">
                                            {pkg.time_limit_display}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {packages.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-card rounded-xl border-2 border-dashed border-border/50">
                            <Wifi className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-500">Aucun forfait disponible.</p>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Le forfait sera définitivement supprimé de votre catalogue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleActualDelete}
                            className={buttonVariants({ variant: "destructive" })}
                        >
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout >
    );
}
