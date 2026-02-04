import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { MessageSquarePlus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function TicketsIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Support',
            href: '#',
        },
        {
            title: 'Tickets',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tickets" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Tickets</h1>
                        <p className="text-muted-foreground">Manage customer support requests and issues.</p>
                    </div>
                    <Button className="gap-2">
                        <MessageSquarePlus className="h-4 w-4" /> New Ticket
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search tickets..."
                            className="pl-8"
                        />
                    </div>
                    <Button variant="outline">Advanced Filters</Button>
                </div>

                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card p-4 transition-all hover:shadow-sm">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground">#TK-2026-{1000 + i}</span>
                                    <h3 className="font-semibold text-base whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px] sm:max-w-md">
                                        {i === 1 ? 'Connection dropping every 5 minutes' : 'Cannot login with my voucher'}
                                    </h3>
                                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${i === 1 ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                                        }`}>
                                        {i === 1 ? 'Urgent' : 'Medium'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <span>Created by: John Doe</span>
                                    <span>Category: Technical Issue</span>
                                    <span>2 hours ago</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 text-right">
                                <div className="hidden sm:flex flex-col items-end">
                                    <span className="text-xs font-medium text-green-600">Open</span>
                                    <span className="text-[10px] text-muted-foreground">Assigned to: Agent Smith</span>
                                </div>
                                <Button variant="ghost" size="sm">View</Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
