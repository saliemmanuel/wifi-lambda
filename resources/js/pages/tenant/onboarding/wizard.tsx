import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Gift, ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import AppLogo from '@/components/app-logo';
import { Tenant } from '@/types/tenant';

interface Props {
    tenant: Tenant;
}

export default function OnboardingWizard({ tenant }: Props) {
    const [step, setStep] = useState(1);
    const { data, setData, post, processing } = useForm({
        expected_users: '',
        referral_source: '',
    });

    const totalSteps = 2;

    const nextStep = () => {
        if (step < totalSteps) setStep(step + 1);
    };

    const prevStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/${tenant.slug}/onboarding`);
    };

    const progressValue = (step / totalSteps) * 100;

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
            <Head title="Configuration de votre Zone Wi-Fi" />

            <div className="w-full max-w-md space-y-8 mt-[-5vh]">
                <div className="flex flex-col items-center text-center">
                    <AppLogo className="h-10 w-auto mb-6" />
                    <div className="space-y-2">
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Finalisons votre installation</h1>
                        <p className="text-sm text-slate-500 font-medium">Juste quelques étapes pour personnaliser votre expérience.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between px-1">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Étape {step} sur {totalSteps}</span>
                        <span className="text-xs font-bold text-primary">{Math.round(progressValue)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-500 ease-in-out shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>
                </div>

                <Card className="border shadow-sm bg-white overflow-hidden">
                    <form onSubmit={submit}>
                        <CardHeader className="pb-4">
                            {step === 1 && (
                                <>
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <CardTitle>Capacité prévue</CardTitle>
                                    <CardDescription>Combien d'utilisateurs prévoyez-vous de servir par jour ?</CardDescription>
                                </>
                            )}
                            {step === 2 && (
                                <>
                                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-2">
                                        <Gift className="h-5 w-5 text-orange-600" />
                                    </div>
                                    <CardTitle>Une dernière chose !</CardTitle>
                                    <CardDescription>Comment avez-vous entendu parler de Wi-Fi Lambda ?</CardDescription>
                                </>
                            )}
                        </CardHeader>

                        <CardContent className="space-y-4 py-4 min-h-[220px]">
                            {/* Step 1: Capacity */}
                            {step === 1 && (
                                <div className="grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-right-4 duration-300">
                                    {[
                                        { id: '1-50', label: '1 - 50 utilisateurs' },
                                        { id: '51-200', label: '51 - 200 utilisateurs' },
                                        { id: '201-500', label: '201 - 500 utilisateurs' },
                                        { id: '500+', label: 'Plus de 500 utilisateurs' }
                                    ].map((opt) => (
                                        <div
                                            key={opt.id}
                                            onClick={() => setData('expected_users', opt.id)}
                                            className={cn(
                                                "flex items-center justify-between px-4 py-3.5 rounded-xl border cursor-pointer transition-all",
                                                data.expected_users === opt.id
                                                    ? "border-primary bg-primary/5 ring-1 ring-primary"
                                                    : "border-slate-200 hover:bg-slate-50"
                                            )}
                                        >
                                            <span className={cn(
                                                "text-sm font-bold",
                                                data.expected_users === opt.id ? "text-primary" : "text-slate-700"
                                            )}>{opt.label}</span>
                                            {data.expected_users === opt.id && <Check className="h-4 w-4 text-primary" />}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Step 2: Referral */}
                            {step === 2 && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                                    <div className="space-y-2">
                                        <Label htmlFor="referral_source" className="text-slate-700">Source</Label>
                                        <Select
                                            value={data.referral_source}
                                            onValueChange={(v: string) => setData('referral_source', v)}
                                        >
                                            <SelectTrigger className="w-full">
                                                <SelectValue placeholder="Choisir une option" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="social_media">Réseaux Sociaux (Facebook, X, LinkedIn)</SelectItem>
                                                <SelectItem value="friend">Ami ou Collègue</SelectItem>
                                                <SelectItem value="search">Moteur de recherche (Google, Bing)</SelectItem>
                                                <SelectItem value="ad">Publicité en ligne</SelectItem>
                                                <SelectItem value="other">Autre</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                                        <div className="mt-0.5">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                        </div>
                                        <p className="text-xs text-slate-500 leading-relaxed font-medium">
                                            Merci de nous aider à grandir ! Vous allez être redirigé vers votre tableau de bord dans un instant.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </CardContent>

                        <CardFooter className="flex items-center gap-3 pt-4 pb-6">
                            {step > 1 && (
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 rounded-xl"
                                    onClick={prevStep}
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" /> Retour
                                </Button>
                            )}

                            {step < totalSteps ? (
                                <Button
                                    type="button"
                                    className="flex-[2] rounded-xl font-bold"
                                    disabled={!data.expected_users}
                                    onClick={nextStep}
                                >
                                    Continuer <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    className="flex-[2] rounded-xl font-black bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    disabled={!data.referral_source || processing}
                                >
                                    {processing ? 'Chargement...' : 'Terminer l\'installation'}
                                    {!processing && <Check className="ml-2 h-4 w-4" />}
                                </Button>
                            )}
                        </CardFooter>
                    </form>
                </Card>

                <p className="text-center text-slate-400 text-xs font-medium uppercase tracking-widest opacity-60">
                    Configuration Sécurisée &bull; Wi-Fi Lambda &copy; 2026
                </p>
            </div>
        </div>
    );
}
