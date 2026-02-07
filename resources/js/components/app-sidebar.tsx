import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Ticket, Wifi, Settings, Users, Building2, CreditCard, TrendingUp, MapPin, ArrowRightLeft, Wallet, ChartBar } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem, SharedData } from '@/types';
import AppLogo from './app-logo';

export function AppSidebar() {
    const { tenant, auth } = usePage<SharedData>().props;
    const { url } = usePage();
    const isAdminPath = url.startsWith('/admin');

    let mainNavItems: NavItem[] = [];

    if (isAdminPath) {
        // Super Admin Navigation
        mainNavItems = [
            {
                title: 'Vue d\'ensemble',
                href: '/admin/dashboard',
                icon: LayoutGrid,
            },
            {
                title: 'Zones (Tenants)',
                href: '/admin/tenants',
                icon: Building2,
            },
            {
                title: 'Plans & Tarifs',
                href: '/admin/plans',
                icon: CreditCard,
            },
            {
                title: 'Analyses Revenue',
                href: '/admin/revenue',
                icon: TrendingUp,
            },
            {
                title: 'Retraits Plateforme',
                href: '/admin/withdrawals',
                icon: Wallet,
            },
            {
                title: 'Utilisateurs Système',
                href: '/admin/users',
                icon: Users,
            },
        ];
    } else if (tenant) {
        // Tenant Navigation
        mainNavItems = [
            {
                title: 'Store Dashboard',
                href: `/${tenant.slug}`,
                icon: LayoutGrid,
            },
            {
                title: 'Gestion des Zones',
                href: `/${tenant.slug}/zones`,
                icon: MapPin,
            },
            {
                title: 'Forfaits & Prix',
                href: `/${tenant.slug}/wifi/packages`,
                icon: CreditCard,
            },
            {
                title: 'Stock de Tickets',
                href: `/${tenant.slug}/wifi/vouchers`,
                icon: Wifi,
            },
            {
                title: 'Statistiques WiFi',
                href: `/${tenant.slug}/wifi/statistics`,
                icon: ChartBar,
            },
            {
                title: 'Transactions',
                href: `/${tenant.slug}/transactions`,
                icon: ArrowRightLeft,
            },
            {
                title: 'Retraits',
                href: `/${tenant.slug}/withdrawals`,
                icon: Wallet,
            },
            {
                title: 'Abonnement',
                href: `/${tenant.slug}/billing`,
                icon: CreditCard,
            },
        ];
    } else {
        // Default / Home Navigation
        mainNavItems = [
            {
                title: 'Dashboard',
                href: dashboard(),
                icon: LayoutGrid,
            },
        ];
    }

    // Add Admin Panel link for super admins if they are in tenant view
    // (Assuming super admins can be identified by role or email for now)
    const isSuperAdmin = auth.user?.email.endsWith('@wifi-lambda.com');

    const footerNavItems: NavItem[] = [
        ...(isSuperAdmin && !isAdminPath ? [{
            title: 'Back to Admin Panel',
            href: '/admin/dashboard',
            icon: Building2,
        }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdminPath ? '/admin/dashboard' : (tenant ? `/${tenant.slug}` : dashboard())} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>

                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
