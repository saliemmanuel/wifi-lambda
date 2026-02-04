import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Users, Shield, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface PlatformUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface UserIndexProps {
    users: {
        data: PlatformUser[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Vue d\'ensemble', href: '/admin/dashboard' },
    { title: 'Utilisateurs Système', href: '/admin/users' },
];

export default function UserIndex({ users }: UserIndexProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Utilisateurs Système" />
            <div className="flex flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black tracking-tight uppercase italic">Utilisateurs Système</h1>
                        <p className="text-sm font-bold text-muted-foreground uppercase text-zinc-500">Gérez les accès à la plateforme centrale.</p>
                    </div>
                    <Button className="font-black uppercase text-[10px] tracking-widest gap-2 h-10 rounded-xl">
                        <UserPlus className="size-3" /> Ajouter un admin
                    </Button>
                </div>

                <div className="rounded-2xl border border-sidebar-border/70 bg-white dark:bg-zinc-900 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-zinc-50 dark:bg-white/5 border-b border-sidebar-border/50">
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Utilisateur</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Rôle</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Date d'inscription</th>
                                    <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-muted-foreground whitespace-nowrap">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-sidebar-border/50">
                                {users.data.map((user) => (
                                    <tr key={user.id} className="hover:bg-zinc-50/50 dark:hover:bg-white/5 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-sidebar-border/50 shadow-sm rounded-xl">
                                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-black uppercase rounded-xl">
                                                        {user.name.substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black uppercase italic tracking-tight">{user.name}</span>
                                                    <span className="text-[10px] text-muted-foreground font-bold">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={cn(
                                                "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                user.email.endsWith('@wifi-lambda.com')
                                                    ? "bg-indigo-50 text-indigo-600 border-indigo-100"
                                                    : "bg-zinc-50 text-zinc-600 border-zinc-100"
                                            )}>
                                                {user.email.endsWith('@wifi-lambda.com') && <Shield className="size-3" />}
                                                {user.email.endsWith('@wifi-lambda.com') ? 'Super Admin' : 'Utilisateur'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-[10px] font-bold text-muted-foreground">
                                            {new Date(user.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4">
                                            <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest h-8 px-3 rounded-lg opacity-50 hover:opacity-100 italic underline">
                                                Modifier
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

import { cn } from '@/lib/utils';
