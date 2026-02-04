import { Head, Link } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldAlert, Home, ArrowLeft, Lock } from 'lucide-react';
import AppLogo from '@/components/app-logo';

interface Props {
    status: number;
    message?: string;
}

export default function Error({ status, message }: Props) {
    const title = {
        503: '503: Service Indisponible',
        500: '500: Erreur Serveur',
        404: '404: Page Introuvable',
        403: '403: Accès Refusé',
    }[status] || `Erreur ${status}`;

    const description = {
        503: 'Désolé, nous effectuons une maintenance. Revenez bientôt.',
        500: 'Oups, quelque chose s\'est mal passé de notre côté.',
        404: 'Désolé, la page que vous recherchez n\'existe pas.',
        403: message || 'Vous n\'êtes pas autorisé à accéder à cet espace.',
    }[status] || 'Une erreur inattendue est survenue.';

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
            <Head title={title} />

            <div className="w-full max-w-md space-y-8 text-center">
                <div className="flex justify-center mb-4">
                    <AppLogo className="h-12 w-auto" />
                </div>

                <Card className="border-slate-200/60 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
                                {status === 403 ? (
                                    <Lock className="h-8 w-8 text-red-500" />
                                ) : (
                                    <ShieldAlert className="h-8 w-8 text-red-500" />
                                )}
                            </div>
                        </div>
                        <CardTitle className="text-2xl font-black text-slate-900">{title}</CardTitle>
                    </CardHeader>

                    <CardContent>
                        <p className="text-slate-500 font-medium leading-relaxed">
                            {description}
                        </p>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-3 pb-8 px-8">
                        <Button
                            asChild
                            className="w-full h-12 rounded-xl font-bold shadow-lg shadow-primary/20"
                        >
                            <Link href="/">
                                <Home className="mr-2 h-4 w-4" /> Retour à l'accueil
                            </Link>
                        </Button>

                        <Button
                            variant="ghost"
                            className="w-full text-slate-400 font-bold hover:text-slate-600"
                            onClick={() => window.history.back()}
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" /> Page précédente
                        </Button>
                    </CardFooter>
                </Card>

                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    Sécurité Wi-Fi Lambda &bull; 2026
                </p>
            </div>
        </div>
    );
}
