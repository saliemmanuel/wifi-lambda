import { useState } from 'react';
import { Head, usePage } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import {
    Wifi,
    Clock,
    CheckCircle2,
    Loader2,
    Smartphone,
    AlertCircle,
    History,
    Zap,
    ChevronRight,
    Ticket,
    ShieldCheck,
    Printer,
    AlertTriangle,
    Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface WifiPackage {
    id: number;
    name: string;
    description: string | null;
    price_fcfa: number;
    time_limit_display: string;
    available_count: number;
}

interface Props {
    packages: WifiPackage[];
    tenant_slug: string;
}

export default function ShopIndex({ packages, tenant_slug }: Props) {
    const { tenant } = usePage<any>().props;
    const [selectedPackage, setSelectedPackage] = useState<WifiPackage | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
    const [isCheckingStatus, setIsCheckingStatus] = useState(false);
    const [campayRef, setCampayRef] = useState<string | null>(null);
    const [purchasedVoucher, setPurchasedVoucher] = useState<{ username: string, password: string } | null>(null);

    // Recovery state
    const [recoveryRef, setRecoveryRef] = useState('');
    const [isRecovering, setIsRecovering] = useState(false);
    const [recoveryError, setRecoveryError] = useState<string | null>(null);

    const [phoneNumber, setPhoneNumber] = useState('');
    const [isInitiating, setIsInitiating] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);

    const openPaymentModal = (pkg: WifiPackage) => {
        if (pkg.available_count === 0) return;
        setSelectedPackage(pkg);
        setPaymentError(null);
        setCampayRef(null);
        setIsPaymentModalOpen(true);
    };

    const handleInitiatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsInitiating(true);

        try {
            const response = await fetch(`/${tenant_slug}/buy/initiate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                },
                body: JSON.stringify({
                    package_id: selectedPackage?.id,
                    phone_number: phoneNumber
                })
            });

            const data = await response.json();

            if (response.ok && data.campay_reference) {
                setCampayRef(data.campay_reference);
                startStatusCheck(data.campay_reference);
            } else {
                // Handle API errors (400, 500, etc.)
                alert(data.error || "Échec de l'initialisation du paiement.");
            }
        } catch (error) {
            console.error("Payment Error:", error);
            setPaymentError("Une erreur de connexion est survenue. Veuillez réessayer.");
        } finally {
            setIsInitiating(false);
        }
    };

    const startStatusCheck = async (reference: string) => {
        setIsCheckingStatus(true);
        const interval = setInterval(async () => {
            try {
                const response = await fetch(`/${tenant_slug}/buy/check-status/${reference}`);
                if (!response.ok) return; // Wait for next interval if server is down

                const result = await response.json();

                if (result.status === 'success') {
                    clearInterval(interval);
                    setIsCheckingStatus(false);
                    setPurchasedVoucher(result.voucher);
                } else if (result.status === 'failed') {
                    clearInterval(interval);
                    setIsCheckingStatus(false);
                    setPaymentError(result.message || "Le paiement a été annulé ou a échoué.");
                    setCampayRef(null); // Return to form
                }
            } catch (err) { }
        }, 5000);
        setTimeout(() => clearInterval(interval), 300000);
    };

    const handleRetrieveVoucher = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsRecovering(true);
        setRecoveryError(null);
        try {
            const response = await fetch(`/${tenant_slug}/buy/retrieve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': (document.querySelector('meta[name="csrf-token"]') as any)?.content,
                },
                body: JSON.stringify({ reference: recoveryRef })
            });
            const result = await response.json();
            if (result.status === 'success') {
                setPurchasedVoucher(result.voucher);
                setCampayRef(recoveryRef);
                setIsRetrieveModalOpen(false);
                setIsPaymentModalOpen(true);
            } else {
                setRecoveryError(result.error || "Référence introuvable.");
            }
        } catch (err) {
            setRecoveryError("Une erreur est survenue.");
        } finally {
            setIsRecovering(false);
        }
    };

    const printVoucher = () => {
        const printContent = document.getElementById('voucher-print-area');
        const windowUrl = 'about:blank';
        const uniqueName = new Date().getTime();
        const windowName = 'Print' + uniqueName;
        const printWindow = window.open(windowUrl, windowName, 'left=50000,top=50000,width=400,height=600');

        if (printWindow && printContent) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Ticket Wi-Fi - ${tenant?.name}</title>
                        <style>
                            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
                            body { font-family: 'Inter', sans-serif; text-align: center; padding: 40px; background: white; color: #0f172a; }
                            .ticket { border: 2px dashed #cbd5e1; padding: 30px; border-radius: 12px; max-width: 300px; margin: 0 auto; }
                            .tenant { font-weight: 800; text-transform: uppercase; font-size: 18px; color: #000; margin-bottom: 5px; }
                            .label { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-top: 20px; }
                            .value { font-size: 24px; font-weight: 800; color: #0f172a; margin-top: 2px; letter-spacing: 1px; }
                            .footer { margin-top: 30px; font-size: 11px; color: #94a3b8; }
                        </style>
                    </head>
                    <body>
                        <div class="ticket">
                            <div class="tenant">${tenant?.name}</div>
                            <div style="font-size: 11px; font-weight: 600; color: #64748b;">TICKET WI-FI</div>
                            
                            <div class="label">Username</div>
                            <div class="value">${purchasedVoucher?.username}</div>
                            
                            <div class="label">Password</div>
                            <div class="value">${purchasedVoucher?.password}</div>
                            
                            <div class="footer">
                                Gardez précieusement ce ticket.
                            </div>
                        </div>
                    </body>
                </html>
            `);
            printWindow.document.close();
            printWindow.focus();
            printWindow.print();
            printWindow.close();
        }
    };

    return (
        <div className="min-h-screen bg-slate-50">
            <Head title={`Boutique Wi-Fi - ${tenant?.name}`} />

            {/* Public Header */}
            <div className="bg-white border-b border-slate-200">
                <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-primary p-1.5 rounded-lg">
                            <Wifi className="h-5 w-5 text-white" />
                        </div>
                        <span className="font-black text-lg tracking-tight uppercase italic">{tenant?.name}</span>
                    </div>

                    <Dialog open={isRetrieveModalOpen} onOpenChange={setIsRetrieveModalOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="sm" className="font-bold text-slate-500 hover:text-primary rounded-xl">
                                <History className="size-4" />
                                <span>Retrouver mon ticket</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-black uppercase italic">Récupérer un ticket</DialogTitle>
                                <DialogDescription className="font-medium">
                                    Récupérez vos identifiants à l'aide de votre référence de transaction.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleRetrieveVoucher} className="space-y-4 pt-2">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase text-slate-400">Référence de Transaction</Label>
                                    <Input
                                        placeholder="Ex: MP..."
                                        className="h-11 rounded-xl font-bold"
                                        value={recoveryRef}
                                        onChange={e => setRecoveryRef(e.target.value)}
                                        required
                                    />
                                    {recoveryError && (
                                        <p className="text-xs font-bold text-red-500">{recoveryError}</p>
                                    )}
                                </div>
                                <Button className="w-full rounded-xl font-bold uppercase" disabled={isRecovering}>
                                    {isRecovering ? <Loader2 className="size-4 animate-spin" /> : "Vérifier la référence"}
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            <main className="max-w-5xl mx-auto py-12 px-6">
                <div className="mb-12 text-center max-w-2xl mx-auto">
                    <h2 className="text-4xl font-black tracking-tight text-slate-900 mb-4 uppercase italic">Forfaits Disponibles</h2>
                    <p className="text-slate-500 font-medium">Connectez-vous à notre réseau haute vitesse en quelques secondes.</p>
                </div>

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} className={cn(
                            "group border-slate-200 shadow-sm hover:shadow-md transition-all rounded-3xl bg-white overflow-hidden",
                            pkg.available_count === 0 && "opacity-60"
                        )}>
                            <CardHeader className="p-8 pb-4">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-2">
                                        <div className="bg-slate-50 p-2 rounded-xl text-primary">
                                            <Zap className="h-5 w-5" />
                                        </div>
                                        {pkg.available_count > 0 ? (
                                            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold uppercase text-[10px]">En stock</Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-red-50 text-red-600 border-none font-bold uppercase text-[10px]">Rupture</Badge>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <span className="text-3xl font-black text-slate-900 leading-none tracking-tighter">
                                            {pkg.price_fcfa.toLocaleString()} <span className="text-sm text-slate-400 font-bold italic uppercase">CFA</span>
                                        </span>
                                    </div>
                                </div>
                                <CardTitle className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{pkg.name}</CardTitle>
                                <CardDescription className="text-slate-500 font-medium mt-2 line-clamp-2">
                                    {pkg.description || "Profitez d'un accès internet illimité."}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="px-8 pb-4">
                                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 w-fit">
                                    <Clock className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm font-black text-slate-600 uppercase italic">{pkg.time_limit_display}</span>
                                </div>
                            </CardContent>
                            <CardFooter className="p-8 pt-4">
                                <Button
                                    className="w-full h-12 rounded-xl font-black uppercase text-[11px] tracking-widest transition-all active:scale-95 disabled:grayscale"
                                    disabled={pkg.available_count === 0}
                                    size="lg"
                                    onClick={() => openPaymentModal(pkg)}
                                >
                                    {pkg.available_count > 0 ? (
                                        <>Acheter maintenant <ChevronRight className="size-4 ml-1" /></>
                                    ) : (
                                        "Rupture de stock"
                                    )}
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}

                    {packages.length === 0 && (
                        <div className="col-span-full py-20 text-center bg-white rounded-[40px] border border-slate-100 flex flex-col items-center">
                            <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mb-4 text-slate-200">
                                <AlertTriangle className="h-8 w-8" />
                            </div>
                            <h4 className="text-lg font-black text-slate-900 uppercase italic mb-2">Aucun forfait disponible</h4>
                            <p className="text-xs font-bold text-slate-400 max-w-[280px] leading-relaxed">
                                Revenez plus tard pour voir nos nouvelles offres.
                            </p>
                        </div>
                    )}
                </div>

                <div className="mt-16 text-center border-t border-slate-200 pt-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Paiement 100% Sécurisé via Orange & MTN Money</p>
                </div>
            </main>

            {/* Payment Flow Modal */}
            <Dialog open={isPaymentModalOpen} onOpenChange={setIsPaymentModalOpen}>
                <DialogContent className="sm:max-w-md rounded-[32px] p-0 overflow-hidden">
                    {!purchasedVoucher ? (
                        <div className="p-8">
                            <div className="text-center mb-8">
                                <div className="h-16 w-16 bg-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-slate-200">
                                    <Smartphone className="h-8 w-8 text-white" />
                                </div>
                                <h3 className="text-2xl font-black uppercase tracking-tight italic">Paiement Mobile</h3>
                                <p className="text-slate-500 font-medium text-sm mt-1">{selectedPackage?.name} — {selectedPackage?.price_fcfa.toLocaleString()} CFA</p>
                            </div>

                            {!campayRef ? (
                                <form onSubmit={handleInitiatePayment} className="space-y-6">
                                    {paymentError && (
                                        <div className="bg-red-50 border border-red-100 p-4 rounded-xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                                            <AlertCircle className="size-5 shrink-0" />
                                            <p>{paymentError}</p>
                                        </div>
                                    )}

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase text-slate-400 ml-1 tracking-widest">Numéro Mobile Money (Cameroun)</Label>
                                        <div className="relative group">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 border-r border-slate-200 pr-3 z-10 transition-colors group-focus-within:border-primary/30">
                                                <span className="font-black text-slate-400 text-sm tracking-tight">+237</span>
                                            </div>
                                            <Input
                                                placeholder="6XXXXXXXX"
                                                className="h-14 pl-20 text-lg font-black bg-slate-50 border-slate-100 focus-visible:ring-primary/10 focus-visible:border-primary focus-visible:bg-white rounded-xl transition-all shadow-sm"
                                                value={phoneNumber}
                                                onChange={e => setPhoneNumber(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <Button
                                        className="w-full h-14 rounded-xl font-black uppercase text-[12px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.01] active:scale-[0.99] transition-all"
                                        disabled={isInitiating}
                                        size="lg"
                                    >
                                        {isInitiating ? <Loader2 className="size-5 animate-spin" /> : "Payer maintenant"}
                                    </Button>
                                    <div className="flex justify-center items-center gap-4 py-2 border-t border-slate-50 mt-4">
                                        <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 border border-slate-100 p-2 rounded-lg transition-all">
                                            <div className="h-4 w-6 bg-[#F68B1E] rounded-xs" />
                                            <span className="text-[8px] font-bold uppercase">Orange</span>
                                        </div>
                                        <div className="flex flex-col items-center gap-1 opacity-50 hover:opacity-100 border border-slate-100 p-2 rounded-lg transition-all">
                                            <div className="h-4 w-6 bg-[#FFCC00] rounded-xs" />
                                            <span className="text-[8px] font-bold uppercase">MTN</span>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="py-6 text-center space-y-6">
                                    <div className="flex justify-center">
                                        <div className="h-20 w-20 rounded-full border-4 border-primary/20 border-t-primary animate-spin flex items-center justify-center">
                                            <Smartphone className="h-8 w-8 text-primary" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <h4 className="font-bold text-xl uppercase tracking-tight">Confirmation requise</h4>
                                        <p className="text-muted-foreground px-4 text-sm font-medium">
                                            Veuillez approuver le retrait sur votre téléphone.
                                        </p>
                                    </div>

                                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 space-y-3 mx-4">
                                        <div className="flex items-center justify-center gap-2 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                                            <div className="size-4 rounded-full border border-emerald-600 flex items-center justify-center text-[10px] font-black">#</div>
                                            Code de validation
                                        </div>
                                        <div className="text-3xl font-black tracking-widest text-emerald-600">
                                            {(() => {
                                                const phone = phoneNumber;
                                                if (phone.startsWith('69') || phone.startsWith('655') || phone.startsWith('656') || phone.startsWith('657') || phone.startsWith('658') || phone.startsWith('659')) return '*150#';
                                                if (phone.startsWith('67') || phone.startsWith('68') || phone.startsWith('650') || phone.startsWith('651') || phone.startsWith('652') || phone.startsWith('653') || phone.startsWith('654')) return '*126#';
                                                return '*126# ou *150#';
                                            })()}
                                        </div>
                                        <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wide">
                                            Composez ce code si aucune notification n'apparaît.
                                        </p>
                                    </div>

                                    <div className="flex flex-col items-center gap-4">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground font-medium text-xs">
                                            <Loader2 className="h-3 w-3 animate-spin text-primary" />
                                            En attente de validation...
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            className="h-9 rounded-lg text-xs font-bold uppercase tracking-wider"
                                            onClick={() => setPaymentError("Veuillez patienter ou vérifier l'historique.")} // Placeholder or reload status
                                            disabled={true} // Auto-checking in background
                                        >
                                            Vérifier statut manuellement
                                        </Button>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest">
                                        Ref: {campayRef}
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div>
                            <div className="bg-primary p-12 text-center text-white relative">
                                <CheckCircle2 className="h-16 w-16 mx-auto mb-4" />
                                <h3 className="text-3xl font-black uppercase tracking-tight italic italic">Paiement Réussi !</h3>
                                <p className="font-bold opacity-80 uppercase text-[10px] tracking-widest mt-1">Merci de votre confiance</p>
                            </div>
                            <div className="p-8 space-y-8">
                                <div className="bg-[#FFF9EC] border border-amber-100 p-4 rounded-2xl flex items-start gap-3">
                                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                                    <p className="text-xs font-bold text-amber-800 leading-relaxed">
                                        Notez précieusement ces identifiants pour vous connecter au Wi-Fi.
                                    </p>
                                </div>

                                <div className="bg-slate-50 p-10 rounded-[32px] border-2 border-dashed border-slate-200 text-center relative" id="voucher-print-area">
                                    <div className="space-y-8">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Utilisateur</p>
                                            <p className="text-4xl font-black tracking-tight text-slate-900">{purchasedVoucher?.username}</p>
                                        </div>
                                        <div className="pt-8 border-t border-slate-200">
                                            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mb-2">Mot de passe</p>
                                            <p className="text-4xl font-black tracking-tight text-slate-900">{purchasedVoucher?.password}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-3 pt-4">
                                    <Button variant="outline" className="h-12 rounded-xl font-bold uppercase text-[11px] tracking-wider" onClick={() => window.open(`/${tenant_slug}/buy/download-pdf/${campayRef}`, '_blank')}>
                                        <Download className="size-4 mr-2" /> Télécharger en PDF
                                    </Button>
                                    <Button variant="outline" className="h-12 rounded-xl font-bold uppercase text-[11px] tracking-wider" onClick={printVoucher}>
                                        <Printer className="size-4 mr-2" /> Imprimer le ticket
                                    </Button>
                                    <Button className="h-12 rounded-xl font-bold uppercase text-[11px] tracking-wider" onClick={() => window.location.reload()}>Terminer</Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
