import { useState } from 'react';
import { Head, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem, SharedData } from '@/types';
import { Button, buttonVariants } from '@/components/ui/button';
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
import { Plus, MapPin, Edit2, Trash2, Copy, Globe, AlertCircle, Wifi, Tag, FileText, Monitor, Phone, Info, List, Code, Check } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from "sonner";

interface Zone {
    id: number;
    name: string;
    slug: string | null;
    description: string | null;
    ip_address: string;
    port: number;
    api_username: string;
    hotspot_server_name: string | null;
    captive_portal_url: string | null;
    contact: string | null;
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
    const [selectedIntegrationZone, setSelectedIntegrationZone] = useState<Zone | null>(null);
    const [isIntegrationModalOpen, setIsIntegrationModalOpen] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Configuration', href: '#' },
        { title: 'Zones', href: `/${tenant?.slug}/zones` },
    ];

    const { data, setData, post, put, processing, errors, reset, delete: destroy } = useForm({
        name: '',
        description: '',
        contact: '',
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
            contact: zone.contact || '',
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
        toast.success("Lien copié !", {
            description: "Le lien de la boutique a été copié dans le presse-papier.",
            duration: 3000,
        });
    };

    const filteredZones = zones.filter(zone =>
        zone.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        zone.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getIntegrationCode = (zone: Zone) => {
        const buyUrl = `${window.location.origin}/${tenant?.slug}/buy/zone/${zone.slug || zone.id}`;
        const recoveryUrl = `${window.location.origin}/${tenant?.slug}/buy`;

        return `<style>
.wifi-button {
    display: inline-block;
    padding: 12px 24px;
    margin: 8px;
    font-weight: 600;
    text-decoration: none;
    border-radius: 50px;
    transition: all 0.3s ease;
    text-align: center;
    width: 100%;
    max-width: 300px;
}

.wifi-button-primary {
    background: linear-gradient(45deg, #e31837, #ff2d55);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(227, 24, 55, 0.2);
}

.wifi-button-secondary {
    background: linear-gradient(45deg, #28a745, #34ce57);
    color: white;
    border: none;
    box-shadow: 0 4px 15px rgba(40, 167, 69, 0.2);
}

.wifi-button:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.wifi-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    padding: 20px;
}
</style>

<div class="wifi-container">
    <a href="${buyUrl}" target="_blank" class="wifi-button wifi-button-primary">
        Acheter un Ticket WiFi
    </a>
    <a href="${recoveryUrl}" target="_blank" class="wifi-button wifi-button-secondary">
        Récupérer mon Ticket
    </a>
</div>`;
    };

    const copyIntegrationCode = (zone: Zone) => {
        const code = getIntegrationCode(zone);
        navigator.clipboard.writeText(code);
        toast.success("Code copié !", {
            description: "Le code d'intégration a été copié dans le presse-papier.",
            duration: 3000,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des Zones" />

            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold tracking-tight">Zones ({zones.length})</h1>
                        <p className="text-muted-foreground">Gérez vos points d'accès Wi-Fi et leurs configurations.</p>
                    </div>

                    <Dialog open={isAddModalOpen} onOpenChange={(open) => {
                        setIsAddModalOpen(open);
                        if (!open) {
                            setEditingZone(null);
                            reset();
                        }
                    }}>
                        <DialogTrigger asChild>
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" /> Nouvelle zone
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-3xl overflow-hidden p-0">
                            <form onSubmit={handleSubmit} className="flex flex-col">
                                <DialogHeader className="p-6 pb-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Wifi className="h-5 w-5" />
                                            </div>
                                            <DialogTitle className="text-xl font-bold">
                                                {editingZone ? 'Modifier le Wifi Zone' : 'Ajouter un nouveau Wifi Zone'}
                                            </DialogTitle>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="text-xs font-semibold gap-2"
                                            onClick={() => setIsAddModalOpen(false)}
                                        >
                                            <List className="h-4 w-4" /> Voir mes Wifi Zones
                                        </Button>
                                    </div>
                                </DialogHeader>

                                <div className="p-6 space-y-6">
                                    <Alert className="bg-muted/50 border-none shadow-sm capitalize">
                                        <Info className="h-4 w-4" />
                                        <AlertTitle className="font-bold text-sm">Important :</AlertTitle>
                                        <AlertDescription className="text-xs">
                                            Les informations que vous saisissez ici seront utilisées pour configurer et identifier votre zone WiFi. Assurez-vous de fournir des informations précises pour une meilleure gestion.
                                        </AlertDescription>
                                    </Alert>

                                    {(errors as any).error && (
                                        <Alert variant="destructive">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Erreur</AlertTitle>
                                            <AlertDescription>{(errors as any).error}</AlertDescription>
                                        </Alert>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label htmlFor="name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Tag className="h-3.5 w-3.5" /> Nom du WiFi Zone
                                                </Label>
                                                <Input
                                                    id="name"
                                                    value={data.name}
                                                    onChange={e => setData('name', e.target.value)}
                                                    placeholder="Ex: Cyber Café Central"
                                                    className="font-medium"
                                                    required
                                                />
                                                <p className="text-[10px] text-muted-foreground">Choisissez le nom correspondant à votre zone WiFi existant ou celui que vous voulez installer.</p>
                                                {errors.name && <p className="text-destructive text-[10px] font-bold">{errors.name}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="ip_address" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Monitor className="h-3.5 w-3.5" /> Adresse IP / DNS / VPN
                                                </Label>
                                                <Input
                                                    id="ip_address"
                                                    value={data.ip_address}
                                                    onChange={e => setData('ip_address', e.target.value)}
                                                    placeholder="Ex: 192.168.30.1 ou galaxie.net"
                                                    className="font-medium"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Ce champ est facultatif mais permet la connexion automatique de vos clients.</p>
                                                {errors.ip_address && <p className="text-destructive text-[10px] font-bold">{errors.ip_address}</p>}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="contact" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                    <Phone className="h-3.5 w-3.5" /> Votre contact
                                                </Label>
                                                <Input
                                                    id="contact"
                                                    value={data.contact}
                                                    onChange={e => setData('contact', e.target.value)}
                                                    placeholder="Ex: +226 70 00 00 00"
                                                    className="font-medium"
                                                />
                                                <p className="text-[10px] text-muted-foreground">Ce numéro sera utilisé par vos clients pour obtenir de l'assistance.</p>
                                                {errors.contact && <p className="text-destructive text-[10px] font-bold">{errors.contact}</p>}
                                            </div>
                                        </div>

                                        <div className="space-y-2 flex flex-col h-full">
                                            <Label htmlFor="description" className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                                                <FileText className="h-3.5 w-3.5" /> Description
                                            </Label>
                                            <Textarea
                                                id="description"
                                                value={data.description}
                                                onChange={e => setData('description', e.target.value)}
                                                placeholder="Ex: WiFi haute vitesse situé au centre-ville..."
                                                className="flex-1 min-h-[120px] md:min-h-[200px] font-medium resize-none shadow-sm"
                                            />
                                            <p className="text-[10px] text-muted-foreground">Une bonne description aide vos clients à comprendre les avantages de votre zone.</p>
                                            {errors.description && <p className="text-destructive text-[10px] font-bold">{errors.description}</p>}
                                        </div>
                                    </div>
                                </div>

                                <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row items-center justify-end gap-4">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setIsAddModalOpen(false)}
                                        className="font-bold text-xs uppercase tracking-widest"
                                    >
                                        Annuler
                                    </Button>
                                    <Button
                                        type="submit"
                                        className="px-8 font-bold text-xs uppercase tracking-widest"
                                        disabled={processing}
                                    >
                                        {editingZone ? 'Enregistrer' : 'Créer la Zone'}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="bg-card rounded-2xl border border-border shadow-sm">
                    <div className="p-4 border-b border-border/50">
                        <div className="relative">
                            <Input
                                placeholder="Rechercher une zone..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <Table>
                        <TableHeader className="bg-muted/30">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Zone</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground">Accès & Intégration</TableHead>
                                <TableHead className="font-bold text-[11px] uppercase tracking-wider text-muted-foreground text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredZones.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center py-20">
                                        <div className="flex flex-col items-center gap-3 opacity-40">
                                            <MapPin className="h-12 w-12" />
                                            <p className="text-sm font-bold uppercase tracking-widest">Aucune zone configurée</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredZones.map((zone) => (
                                    <TableRow key={zone.id} className="border-border/40 hover:bg-muted/20 transition-colors group">
                                        <TableCell className="py-4">
                                            <div className="flex flex-col gap-0.5">
                                                <span className="font-bold text-foreground text-base tracking-tight">{zone.name}</span>
                                                <span className="text-xs text-muted-foreground line-clamp-1 max-w-[400px]">
                                                    {zone.description || 'Aucune description fournie.'}
                                                </span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="py-4">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <Button
                                                    variant="secondary"
                                                    size="sm"
                                                    className="h-8 gap-2 rounded-full font-bold text-[10px] uppercase tracking-wider bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-500/10 dark:text-indigo-400 border-none px-4"
                                                    onClick={() => copyToClipboard(`${window.location.origin}/${tenant?.slug}/buy/zone/${zone.slug || zone.id}`)}
                                                >
                                                    <Copy className="h-3 w-3" />
                                                    Lien Boutique
                                                </Button>

                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="h-8 gap-2 rounded-full font-bold text-[10px] uppercase tracking-wider px-4 shadow-sm"
                                                    onClick={() => {
                                                        setSelectedIntegrationZone(zone);
                                                        setIsIntegrationModalOpen(true);
                                                    }}
                                                >
                                                    <Code className="h-3.5 w-3.5" />
                                                    Code d'intégration
                                                </Button>
                                            </div>
                                        </TableCell>

                                        <TableCell className="text-right py-4">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg"
                                                    onClick={() => openEditModal(zone)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5 text-muted-foreground" />
                                                </Button>
                                                <Button
                                                    size="icon"
                                                    variant="ghost"
                                                    className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
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
            </div >

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Supprimer la zone ?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Cette action est irréversible. Tous les paramètres de connexion seront effacés.
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
                            Confirmer la suppression
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <Dialog open={isIntegrationModalOpen} onOpenChange={setIsIntegrationModalOpen}>
                <DialogContent className="sm:max-w-3xl overflow-hidden p-0 flex flex-col max-h-[95vh]">
                    <DialogHeader className="p-6 pb-2 shrink-0">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-400">
                                <Code className="h-5 w-5" />
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-bold tracking-tight">Code d'intégration</DialogTitle>
                                <DialogDescription className="font-medium text-xs">
                                    Zone : <span className="text-foreground font-bold uppercase">{selectedIntegrationZone?.name}</span>
                                </DialogDescription>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="p-6 space-y-6 overflow-y-auto flex-1 custom-scrollbar">
                        <div className="relative group/code">
                            <div className="absolute right-3 top-3 z-10 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                <Button
                                    size="sm"
                                    variant="secondary"
                                    className="h-8 gap-2 font-bold text-[10px] uppercase tracking-widest bg-white/10 hover:bg-white/20 text-white border-none backdrop-blur-md shadow-lg"
                                    onClick={() => selectedIntegrationZone && copyIntegrationCode(selectedIntegrationZone)}
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                    Copier
                                </Button>
                            </div>
                            <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
                                <pre className="p-6 text-slate-300 text-[11px] font-mono overflow-auto max-h-[350px] leading-relaxed custom-scrollbar">
                                    {selectedIntegrationZone && getIntegrationCode(selectedIntegrationZone)}
                                </pre>
                            </div>
                        </div>

                        <Alert className="bg-amber-50/50 border-none shadow-sm">
                            <Info className="h-4 w-4 text-amber-600" />
                            <AlertTitle className="font-bold text-sm text-amber-900">Comment l'utiliser ?</AlertTitle>
                            <AlertDescription className="text-xs text-amber-800 leading-relaxed">
                                Copiez l'intégralité du code ci-dessus et insérez-le dans le corps (body) de votre page HTML. Les styles sont inclus pour garantir un affichage parfait.
                            </AlertDescription>
                        </Alert>
                    </div>

                    <DialogFooter className="p-6 bg-muted/30 border-t flex flex-row items-center justify-end gap-3 shrink-0">
                        <Button
                            variant="ghost"
                            onClick={() => setIsIntegrationModalOpen(false)}
                            className="font-bold text-xs uppercase tracking-widest px-8"
                        >
                            Fermer
                        </Button>
                        <Button
                            className="font-bold text-xs uppercase tracking-widest px-8 bg-slate-900 hover:bg-slate-800 text-white border-none shadow-lg shadow-slate-200"
                            onClick={() => selectedIntegrationZone && copyIntegrationCode(selectedIntegrationZone)}
                        >
                            <Copy className="h-3.5 w-3.5 mr-2" />
                            Copier le Code
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout >
    );
}
