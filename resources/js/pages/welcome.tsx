import { Head, Link, usePage } from '@inertiajs/react';
import { dashboard, login, register } from '@/routes';
import type { SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, MessageSquare, Wifi, Wallet, CheckCircle2 } from 'lucide-react';

export default function Welcome({
    canRegister = true,
}: {
    canRegister?: boolean;
}) {
    const { auth } = usePage<SharedData>().props;

    return (
        <>
            <Head title="Bienvenue" />
            <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">

                {/* Background Pattern */}
                <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
                    <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>
                </div>

                {/* Navbar */}
                <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                    <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 font-bold text-xl">
                            <Wifi className="h-6 w-6 text-primary" />
                            <span>WiFi Lambda</span>
                        </div>
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Link href={dashboard()}>
                                    <Button>Dashboard</Button>
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()}>
                                        <Button variant="ghost">Connexion</Button>
                                    </Link>
                                    {canRegister && (
                                        <Link href={register()}>
                                            <Button>Commencer</Button>
                                        </Link>
                                    )}
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Hero Section */}
                <main className="flex-1">
                    <section className="py-24 sm:py-32 space-y-8 text-center px-4 relative">
                        <div className="mx-auto flex max-w-[980px] flex-col items-center gap-2">
                            <span className="inline-flex items-center rounded-lg bg-muted px-3 py-1 text-sm font-medium">
                                🎉 Maintenant disponible en version Beta
                            </span>
                            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight md:text-7xl">
                                Plateforme SaaS Multi-Tenant <br />
                                <span className="text-primary">WiFi & Ticketing</span>
                            </h1>
                            <p className="text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
                                Système complet pour revendeurs : ticketing professionnel, gestion WiFi MikroTik et paiements Mobile Money automatisés.
                            </p>
                        </div>
                        <div className="flex justify-center gap-4">
                            {canRegister && (
                                <Link href={register()}>
                                    <Button size="lg" className="h-12 px-8 text-lg">
                                        Créer un compte gratuit
                                    </Button>
                                </Link>
                            )}
                        </div>
                    </section>

                    {/* Features Grid */}
                    <section className="container mx-auto px-4 py-16">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                                        <MessageSquare className="h-6 w-6 text-blue-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <CardTitle>Ticketing Professionnel</CardTitle>
                                    <CardDescription>
                                        Support client complet avec SLA, priorités, et assignation automatique.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" /> Gestion SLA & Escalades</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" /> Réponses prédéfinies</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-blue-600 shrink-0" /> Notation satisfaction</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-600 transition-colors duration-300">
                                        <Wifi className="h-6 w-6 text-indigo-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <CardTitle>Gestion MikroTik</CardTitle>
                                    <CardDescription>
                                        Synchronisation temps réel avec vos routeurs et gestion des hotspots.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" /> Import & Sync Auto</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" /> Monitoring Sessions</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-indigo-600 shrink-0" /> Génération QR Codes</li>
                                    </ul>
                                </CardContent>
                            </Card>

                            <Card className="group hover:shadow-xl transition-all duration-300 border-2 hover:border-primary/20">
                                <CardHeader>
                                    <div className="h-12 w-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4 group-hover:bg-orange-600 transition-colors duration-300">
                                        <Wallet className="h-6 w-6 text-orange-600 group-hover:text-white transition-colors" />
                                    </div>
                                    <CardTitle>Paiements Mobiles</CardTitle>
                                    <CardDescription>
                                        Encaissez via Orange Money, MTN et Moov avec split automatique.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-3 text-sm text-muted-foreground">
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0" /> Orange, MTN, Moov</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0" /> Split 90/10 Auto</li>
                                        <li className="flex gap-2 items-start"><CheckCircle2 className="h-5 w-5 text-orange-600 shrink-0" /> Facturation Auto</li>
                                    </ul>
                                </CardContent>
                            </Card>
                        </div>
                    </section>


                    {/* Pricing Section */}
                    <section className="py-24 bg-muted/30">
                        <div className="container mx-auto px-4">
                            <div className="text-center max-w-2xl mx-auto mb-16">
                                <h2 className="text-3xl font-bold tracking-tight mb-4">Plans Tarifaires Simples</h2>
                                <p className="text-muted-foreground text-lg">
                                    Commencez gratuitement ou passez à la vitesse supérieure.
                                </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

                                {/* Free / Commission Model */}
                                <Card className="flex flex-col border-2 shadow-sm">
                                    <CardHeader>
                                        <CardTitle className="text-xl">Gratuit</CardTitle>
                                        <CardDescription>Pour démarrer sans engagement.</CardDescription>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold">0 FCFA</span>
                                            <span className="text-muted-foreground"> / mois</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        <ul className="space-y-3 text-sm flex-1 mb-6">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span className="font-medium">Commission 10% / transaction</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                <span>Utilisateurs illimités</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                <span>Paiement à l'usage</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                                <span>Support par email</span>
                                            </li>
                                        </ul>
                                        <Button className="w-full" variant="outline">Commencer Gratuitement</Button>
                                    </CardContent>
                                </Card>

                                {/* Business Plan */}
                                <Card className="flex flex-col relative border-2 border-primary bg-zinc-900 text-zinc-50 shadow-2xl scale-105 z-10">
                                    <div className="absolute top-0 right-0 p-3">
                                        <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                                            Recommandé
                                        </span>
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-xl">Business</CardTitle>
                                        <CardDescription className="text-zinc-400">Pour une croissance accélérée.</CardDescription>
                                        <div className="mt-4">
                                            <span className="text-4xl font-bold">52.000</span>
                                            <span className="text-zinc-400 text-sm"> FCFA/mois</span>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col">
                                        <ul className="space-y-3 text-sm flex-1 mb-6">
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span className="font-bold">0% commission</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span>Tickets illimités</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span>Agents illimités</span>
                                            </li>
                                            <li className="flex items-center gap-2">
                                                <CheckCircle2 className="h-4 w-4 text-primary" />
                                                <span>Marque blanche & API</span>
                                            </li>
                                        </ul>
                                        <Button className="w-full bg-white text-black hover:bg-zinc-200">Choisir Business</Button>
                                    </CardContent>
                                </Card>

                            </div>
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t py-8 mt-12 bg-muted/50">
                    <div className="container mx-auto px-4 flex flex-col sm:flex-row justify-between items-center text-muted-foreground text-sm">
                        <p>&copy; {new Date().getFullYear()} WiFi Lambda. Fait avec ❤️ au Cameroun 🇨🇲.</p>
                        <div className="flex gap-4 mt-4 sm:mt-0">
                            <Link href="#" className="hover:underline">Conditions</Link>
                            <Link href="#" className="hover:underline">Confidentialité</Link>
                            <Link href="#" className="hover:underline">Contact</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
} 
