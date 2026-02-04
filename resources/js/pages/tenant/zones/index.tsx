import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Plus, MapPin, Edit2, Trash2, Copy, Globe, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Zone {
    id: number;
    name: string;
    description: string | null;
    ip_address: string;
    port: number;
    api_username: string;
    hotspot_server_name: string | null;
    captive_portal_url: string | null;
    connection_status: 'online' | 'offline' | 'unreachable';
}

interface Props {
    zones: Zone[];
}

export default function ZonesIndex({ zones }: Props) {
    const { tenant } = usePage<SharedData>().props;
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingZone, setEditingZone] = useState<Zone | null>(null);
    const [zoneToDelete, setZoneToDelete] = useState<number | null>(null);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Configuration', href: '#' },
        { title: 'Zones', href: `/${tenant?.slug}/zones` },
    ];

    const { data, setData, post, put, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        description: '',
        ip_address: '',
        port: 8728,
        api_username: '',
        api_password: '',
        hotspot_server_name: '',
        hotspot_interface: '',
        captive_portal_url: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (editingZone) {
            put(`/${tenant?.slug}/zones/${editingZone.id}`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    setEditingZone(null);
                    reset();
                }
            });
        } else {
            post(`/${tenant?.slug}/zones`, {
                onSuccess: () => {
                    setIsAddModalOpen(false);
                    reset();
                },
                onError: (errors) => {
                    console.error('Validation errors:', errors);
                }
            });
        }
    };

    const openEditModal = (zone: Zone) => {
        setEditingZone(zone);
        setData({
            name: zone.name,
            description: zone.description || '',
            ip_address: zone.ip_address,
            port: zone.port,
            api_username: zone.api_username,
            api_password: '', // Don't populate password for security
            hotspot_server_name: zone.hotspot_server_name || '',
            hotspot_interface: '',
            captive_portal_url: zone.captive_portal_url || '',
        });
        setIsAddModalOpen(true);
    };

    const confirmDelete = (id: number) => {
        setZoneToDelete(id);
        setIsDeleteAlertOpen(true);
    };

    const handleActualDelete = () => {
        if (zoneToDelete) {
            destroy(`/${tenant?.slug}/zones/${zoneToDelete}`, {
                onSuccess: () => {
                    setIsDeleteAlertOpen(false);
                    setZoneToDelete(null);
                }
            });
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    const filteredZones = zones.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Zones" />

            <div className="flex flex-col gap-6 p-4 lg:p-6 bg-[#F8FAFC] min-h-full">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Zone ({zones.length})</h1>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Gérez vos points d'accès Wi-Fi</p>
                    </div>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingZone(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="h-10 px-4 rounded-xl gap-2 font-black text-[11px] uppercase tracking-wider shadow-lg shadow-primary/20">
                                <Plus className="h-4 w-4" /> Nouvelle zone
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] rounded-[24px] p-8 border-none shadow-2xl max-h-[90vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight">
                                        {editingZone ? 'Modifier la Zone' : 'Nouvelle Zone'}
                                    </DialogTitle>
                                    <DialogDescription className="font-bold text-slate-400 text-xs">
                                        Configurez les paramètres de connexion à votre routeur MikroTik
                                    </DialogDescription>
                                </DialogHeader>

                                {(errors as any).error && (
                                    <div className="bg-red-50 p-4 rounded-2xl border border-red-100 flex items-start gap-3">
                                        <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                                        <p className="text-xs font-black text-red-600 leading-tight">{(errors as any).error}</p>
                                    </div>
                                )}

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Nom de la Zone *</Label>
                                        <Input
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="Ex: MSXV_DLA"
                                            className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                            required
                                        />
                                        {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name}</p>}
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Description</Label>
                                        <Textarea
                                            value={data.description}
                                            onChange={e => setData('description', e.target.value)}
                                            placeholder="msky_dla"
                                            className="min-h-[60px] text-sm font-bold bg-slate-50 border-none rounded-xl resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="col-span-2 space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Adresse IP *</Label>
                                            <Input
                                                value={data.ip_address}
                                                onChange={e => setData('ip_address', e.target.value)}
                                                placeholder="192.168.1.1"
                                                className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                                required
                                            />
                                            {errors.ip_address && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ip_address}</p>}
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Port API</Label>
                                            <Input
                                                type="number"
                                                value={data.port}
                                                onChange={e => setData('port', parseInt(e.target.value))}
                                                className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Utilisateur API *</Label>
                                            <Input
                                                value={data.api_username}
                                                onChange={e => setData('api_username', e.target.value)}
                                                placeholder="admin"
                                                className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                                required
                                            />
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">
                                                Mot de passe {editingZone && '(laisser vide si inchangé)'}
                                            </Label>
                                            <Input
                                                type="password"
                                                value={data.api_password}
                                                onChange={e => setData('api_password', e.target.value)}
                                                placeholder="••••••"
                                                className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                                required={!editingZone}
                                            />
                                        </div>
                                    </div>

                                    <div className="border-t border-slate-100 pt-5">
                                        <div className="space-y-1.5">
                                            <Label className="text-[10px] font-black uppercase text-slate-400 ml-1">Portail Captif (URL)</Label>
                                            <Input
                                                value={data.captive_portal_url}
                                                onChange={e => setData('captive_portal_url', e.target.value)}
                                                placeholder="https://wifi-client.ticketsguru.com/location/6wkwrt8ic00k7..."
                                                className="h-12 text-sm font-bold bg-slate-50 border-none rounded-xl"
                                            />
                                            {errors.captive_portal_url && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.captive_portal_url}</p>}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter>
                                    <Button
                                        type="submit"
                                        className="w-full h-14 font-black text-xs uppercase rounded-2xl tracking-widest shadow-xl shadow-primary/20"
                                        disabled={processing}
                                    >
                                        {editingZone ? 'Enregistrer les modifications' : 'Créer la Zone'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Input
                                placeholder="Recherche"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="h-10 pl-4 bg-slate-50 border-none rounded-xl font-bold text-sm"
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader>
                            <TableRow className="border-slate-100 hover:bg-transparent">
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Nom</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Description</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider">Portail Captif</TableHead>
                                <TableHead className="font-black text-[10px] uppercase text-slate-400 tracking-wider text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredZones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="text-center py-12">
                                        <div className="flex flex-col items-center gap-3">
                                            <MapPin className="h-12 w-12 text-slate-200" />
                                            <p className="text-sm font-bold text-slate-400">Aucun enregistrement supplémentaire</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredZones.map((zone) => (
                                    <TableRow key={zone.id} className="border-slate-100 hover:bg-slate-50/50">
                                        <TableCell className="font-bold text-sm">{zone.name}</TableCell>
                                        <TableCell className="text-sm text-slate-600 font-medium">{zone.description || '-'}</TableCell>
                                        <TableCell>
                                            {zone.captive_portal_url ? (
                                                <div className="flex items-center gap-2">
                                                    <a
                                                        href={zone.captive_portal_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-xs text-primary hover:underline font-bold truncate max-w-[300px] inline-block"
                                                    >
                                                        {zone.captive_portal_url}
                                                    </a>
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-7 w-7"
                                                        onClick={() => copyToClipboard(zone.captive_portal_url!)}
                                                    >
                                                        <Copy className="h-3.5 w-3.5 text-slate-400" />
                                                    </Button>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-slate-400 font-medium">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg"
                                                    onClick={() => openEditModal(zone)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-red-500 hover:text-red-600 hover:bg-red-50"
                                                    onClick={() => confirmDelete(zone.id)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent className="rounded-[32px] max-w-[420px] p-8">
                    <AlertDialogHeader className="space-y-4">
                        <AlertDialogTitle className="text-2xl font-black uppercase text-slate-900 tracking-tight">
                            Supprimer la zone ?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-sm text-slate-500 leading-relaxed font-bold">
                            Cette action est irréversible. Tous les paramètres de connexion seront effacés.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter className="mt-8 flex gap-3">
                        <AlertDialogCancel className="flex-1 h-14 rounded-2xl border-none bg-slate-100 font-black text-[11px] uppercase mt-0">
                            Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleActualDelete}
                            className="flex-1 h-14 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-[11px] uppercase shadow-lg shadow-red-200"
                        >
                            Confirmer
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </AppLayout>
    );
}
