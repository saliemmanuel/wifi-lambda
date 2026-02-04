import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export default function VouchersIndex() {
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Wi-Fi Management',
            href: '#',
        },
        {
            title: 'Vouchers',
            href: '#',
        },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Wi-Fi Vouchers" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Vouchers</h1>
                        <p className="text-muted-foreground">Manage and generate Wi-Fi access codes.</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> Generate Vouchers
                    </Button>
                </div>

                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search by username or MAC..."
                            className="pl-8"
                        />
                    </div>
                    <Button variant="outline">Filters</Button>
                </div>

                <div className="rounded-xl border border-border bg-card">
                    <div className="p-0 overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="border-b bg-muted/50">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium">Username</th>
                                    <th className="px-4 py-3 text-left font-medium">Package</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-left font-medium">Created At</th>
                                    <th className="px-4 py-3 text-right font-medium">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="border-b transition-colors hover:bg-muted/50 last:border-0">
                                        <td className="px-4 py-3 font-mono">VF-{8000 + i}</td>
                                        <td className="px-4 py-3">Mini 1H</td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800 dark:bg-green-900/30 dark:text-green-400">
                                                Available
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">2026-02-03</td>
                                        <td className="px-4 py-3 text-right">
                                            <Button variant="ghost" size="sm">Print</Button>
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
