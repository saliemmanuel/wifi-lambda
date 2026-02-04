import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AppLogo from '@/components/app-logo';
import { Building2, ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CreateTenant() {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
    });

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
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Prêt à lancer votre Wi-Fi ?</h1>
                        <p className="text-sm text-slate-500 font-medium italic">Configurez votre espace et commencez à générer des revenus.</p>
                    </div>
                </div>

                <Card className="border shadow-sm bg-white overflow-hidden">
                    <form onSubmit={submit}>
                        <CardHeader className="pb-4">
                            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center mb-2">
                                <Building2 className="h-5 w-5 text-indigo-600" />
                            </div>
                            <CardTitle>Nouvel Établissement</CardTitle>
                            <CardDescription>
                                Entrez simplement le nom de votre commerce. Nous nous occupons du reste.
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-bold text-slate-700">Nom de l'Établissement</Label>
                                <Input
                                    id="name"
                                    placeholder="Ex: Hôtel Splendid, Café de la Gare..."
                                    className="h-12 text-base rounded-xl border-slate-200"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    required
                                    autoFocus
                                />
                                {errors.name && <p className="text-xs text-red-500 font-bold">{errors.name}</p>}
                            </div>



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
                                disabled={processing || !data.name.trim()}
                            >
                                {processing ? 'Initialisation...' : (
                                    <>
                                        Lancer ma Zone Wi-Fi <ArrowRight className="ml-2 h-4 w-4" />
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
