import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
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
import { Plus, Wifi, Edit2, Trash2, Wallet, Clock, MapPin, Filter } from 'lucide-react';
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

    const { data, setData, post, put, processing, errors, reset, delete: destroy } = useForm({
        mikrotik_router_id: null as number | null,
        name: '',
        description: '',
        price_fcfa: 0,
        profile_name: '',
        time_limit_display: '',
        time_limit_minutes: 0,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingPackage) {
            put(`/${tenant?.slug}/wifi/packages/${editingPackage.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingPackage(null);
                    reset();
                }
            });
        } else {
            post(`/${tenant?.slug}/wifi/packages`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                }
            });
        }
    };

    const openEditModal = (pkg: WifiPackage) => {
        setEditingPackage(pkg);
        setData({
            mikrotik_router_id: pkg.mikrotik_router_id,
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
            'bg-blue-50 text-blue-500',
            'bg-indigo-50 text-indigo-500',
            'bg-purple-50 text-purple-500',
            'bg-emerald-50 text-emerald-500',
            'bg-orange-50 text-orange-500',
            'bg-pink-50 text-pink-500',
        ];
        return colors[index % colors.length];
    };

    const filteredPackages = filterZone === 'all'
        ? packages
        : filterZone === 'none'
            ? packages.filter(p => !p.mikrotik_router_id)
            : packages.filter(p => p.mikrotik_router_id?.toString() === filterZone);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Forfaits Wi-Fi" />

            <div className="flex flex-col gap-4 p-3 lg:p-4 bg-[#F8FAFC] min-h-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <h1 className="text-xl font-black tracking-tight text-slate-900 leading-none">Catalogue Wi-Fi</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Gérer les forfaits et profils</p>
                    </div>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingPackage(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-8 px-3 rounded-lg gap-1.5 font-bold text-[10px] uppercase tracking-wider">
                                <Plus className="h-3.5 w-3.5" /> Nouveau
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[480px] rounded-2xl p-5">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <DialogHeader>
                                    <DialogTitle className="text-lg font-black">{editingPackage ? 'Modifier' : 'Nouveau Forfait'}</DialogTitle>
                                </DialogHeader>

                                <div className="space-y-3">
                                    {zones.length > 0 && (
                                        <div className="space-y-1">
                                            <Label htmlFor="zone" className="text-[9px] font-black uppercase text-slate-400">Zone (optionnel)</Label>
                                            <Select
                                                value={data.mikrotik_router_id?.toString() || 'none'}
                                                onValueChange={(value) => setData('mikrotik_router_id', value === 'none' ? null : parseInt(value))}
                                            >
                                                <SelectTrigger className="h-9 text-sm bg-slate-50 border-none rounded-lg">
                                                    <SelectValue placeholder="Toutes les zones" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="none">Aucune zone spécifique</SelectItem>
                                                    {zones.map(zone => (
                                                        <SelectItem key={zone.id} value={zone.id.toString()}>
                                                            {zone.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}

                                    <div className="space-y-1">
                                        <Label htmlFor="name" className="text-[9px] font-black uppercase text-slate-400">Nom Commercial</Label>
                                        <Input id="name" value={data.name} onChange={e => setData('name', e.target.value)} placeholder="Ex: 1 Heure Speed" className="h-9 text-sm" required />
                                    </div>
                                    <div className="space-y-1">
                                        <Label htmlFor="description" className="text-[9px] font-black uppercase text-slate-400">Description</Label>
                                        <Textarea id="description" value={data.description} onChange={e => setData('description', e.target.value)} placeholder="Description..." className="min-h-[60px] text-sm" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="price" className="text-[9px] font-black uppercase text-slate-400">Prix (FCFA)</Label>
                                            <Input id="price" type="number" value={data.price_fcfa} onChange={e => setData('price_fcfa', parseInt(e.target.value))} className="h-9 text-sm" required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="profile" className="text-[9px] font-black uppercase text-slate-400">Profil MikroTik</Label>
                                            <Input id="profile" value={data.profile_name} onChange={e => setData('profile_name', e.target.value)} className="h-9 text-sm" required />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <Label htmlFor="time_display" className="text-[9px] font-black uppercase text-slate-400">Affichage</Label>
                                            <Input id="time_display" value={data.time_limit_display} onChange={e => setData('time_limit_display', e.target.value)} className="h-9 text-sm" required />
                                        </div>
                                        <div className="space-y-1">
                                            <Label htmlFor="minutes" className="text-[9px] font-black uppercase text-slate-400">Minutes</Label>
                                            <Input id="minutes" type="number" value={data.time_limit_minutes} onChange={e => setData('time_limit_minutes', parseInt(e.target.value))} className="h-9 text-sm" required />
                                        </div>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" className="w-full h-10 font-black text-xs uppercase" disabled={processing}>{editingPackage ? 'Enregistrer' : 'Créer'}</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {zones.length > 0 && (
                    <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4 text-slate-400" />
                        <Label className="text-[10px] font-black uppercase text-slate-400">Filtrer par zone:</Label>
                        <div className="flex gap-2 flex-wrap">
                            <Button
                                size="sm"
                                variant={filterZone === 'all' ? 'default' : 'outline'}
                                className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase"
                                onClick={() => setFilterZone('all')}
                            >
                                Toutes
                            </Button>
                            <Button
                                size="sm"
                                variant={filterZone === 'none' ? 'default' : 'outline'}
                                className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase"
                                onClick={() => setFilterZone('none')}
                            >
                                Sans zone
                            </Button>
                            {zones.map(zone => (
                                <Button
                                    key={zone.id}
                                    size="sm"
                                    variant={filterZone === zone.id.toString() ? 'default' : 'outline'}
                                    className="h-7 px-3 rounded-lg text-[10px] font-bold uppercase"
                                    onClick={() => setFilterZone(zone.id.toString())}
                                >
                                    <MapPin className="h-3 w-3 mr-1" />
                                    {zone.name}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {filteredPackages.map((pkg, idx) => (
                        <Card key={pkg.id} className="group border border-slate-200 shadow-sm hover:shadow-md transition-all rounded-xl bg-white overflow-hidden">
                            <CardHeader className="p-3 pb-0 space-y-0 flex flex-row items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={cn("p-1.5 rounded-lg", getIconColor(idx))}>
                                        <Wifi className="h-3.5 w-3.5" />
                                    </div>
                                    <span className="font-black text-[10px] uppercase text-slate-400 leading-none">
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
                                    <CardTitle className="text-lg font-black text-slate-900 leading-tight uppercase tracking-tight">
                                        {pkg.name}
                                    </CardTitle>
                                    {pkg.router && (
                                        <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold text-[9px] uppercase shrink-0">
                                            <MapPin className="h-2.5 w-2.5 mr-0.5" />
                                            {pkg.router.name}
                                        </Badge>
                                    )}
                                </div>

                                {pkg.description ? (
                                    <p className="text-slate-500 text-[11px] font-bold leading-tight line-clamp-1 min-h-[14px]">
                                        {pkg.description}
                                    </p>
                                ) : (
                                    <div className="h-[14px]" />
                                )}

                                <div className="flex items-center justify-between bg-slate-50 border border-slate-100/50 rounded-lg p-2.5">
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] uppercase font-black text-slate-400 tracking-wider">Prix</p>
                                        <p className="text-sm font-black text-slate-900 leading-none">
                                            {pkg.price_fcfa.toLocaleString()} <span className="text-[10px] text-slate-400">CFA</span>
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

                    {filteredPackages.length === 0 && (
                        <div className="col-span-full py-12 text-center bg-white rounded-xl border-2 border-dashed border-slate-100">
                            <Wifi className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                            <p className="text-xs font-bold text-slate-500">Aucun forfait disponible pour ce filtre.</p>
                        </div>
                    )}
                </div>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="rounded-[20px] max-w-[420px] p-6">
                    <AlertDialogHeader className="space-y-3">
                        <AlertDialogTitle className="text-xl font-bold text-slate-900">Êtes-vous sûr ?</AlertDialogTitle>
                        <AlertDialogDescription className="text-[14px] text-slate-500 leading-relaxed font-medium">
                            Cette action est irréversible. Le forfait sera définitivement supprimé de votre catalogue.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-6 flex items-center gap-3 sm:justify-end">
                        <AlertDialogCancel className="h-11 px-6 rounded-xl border-slate-200 font-bold text-[14px] mt-0">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleActualDelete}
                            className="h-11 px-6 bg-[#E10000] hover:bg-red-700 text-white rounded-xl font-bold text-[14px]"
                        >
                            Supprimer définitivement
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
