import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/app-logo';
import { Building2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateTenant() {
    const { post, processing, errors } = useForm({});

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/setup-tenant');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <Head title="Configuration de votre Espace" />

            <div className="w-full max-w-md space-y-8 mt-[-5vh]">
                <div className="flex flex-col items-center text-center">
                    <AppLogo className="h-10 w-auto mb-6" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Félicitations !</h1>
                        <p className="text-sm text-slate-500 font-medium italic">Votre inscription a été validée avec succès.</p>
                    </div>
                </div>

                <Card className="border shadow-sm bg-white overflow-hidden">
                    <form onSubmit={submit}>
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                                <Sparkles className="h-5 w-5 text-green-600" />
                            </div>
                            <CardTitle>Espace Membre Activé</CardTitle>
                            <CardDescription>
                                Votre environnement sécurisé est prêt. Cliquez ci-dessous pour y accéder immédiatement.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 py-4">
                            {(errors as any).error && (
                                <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                    <p className="text-xs text-red-600 font-bold text-center">{(errors as any).error}</p>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="pt-4 pb-6 px-6">
                            <Button
                                type="submit"
                                className="w-full h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                disabled={processing}
                            >
                                {processing ? 'Connexion en cours...' : (
                                    <>
                                        Accéder à mon Espace <ArrowRight className="ml-2 h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">
                    Système Sécurisé &bull; Wi-Fi Lambda &copy; 2026
                </p>
            </div>
        </div>
    );
}
