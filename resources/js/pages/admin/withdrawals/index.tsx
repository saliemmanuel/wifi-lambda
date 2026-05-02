import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
    Phone, 
    History as HistoryIcon, 
    Plus, 
    Info, 
    X, 
    CheckCircle2, 
    ArrowUpRight,
    Wallet,
    ArrowRight,
    Clock,
    AlertCircle,
    ExternalLink,
    Search
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { BreadcrumbItem } from '@/types';

interface Method {
    id: number;
    phone_number: string;
    label?: string;
    is_default: boolean;
}

interface Withdrawal {
    id: number;
    amount_fcfa: number;
    status: string;
    reference: string;
    created_at: string;
    method?: {
        label?: string;
        phone_number?: string;
    };
}

interface WithdrawalsIndexProps {
    withdrawals: {
        data: Withdrawal[];
    };
    methods: Method[];
    stats: {
        availableBalanceFcfa: number;
    };
}

export default function WithdrawalsIndex({ withdrawals = { data: [] }, methods = [], stats = { availableBalanceFcfa: 0 } }: WithdrawalsIndexProps) {
    const [isAddingMethod, setIsAddingMethod] = useState(false);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods?.find(m => m.is_default)?.id || methods?.[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Dashboard', href: '/admin/dashboard' },
        { title: 'Payouts', href: '/admin/withdrawals' },
    ];

    const handleInitiateWithdrawal = (e: React.FormEvent) => {
        e.preventDefault();
        postWithdrawal('/admin/withdrawals/request', {
            onSuccess: () => resetWithdrawal(),
        });
    };

    const handleAddMethod = (e: React.FormEvent) => {
        e.preventDefault();
        postMethod('/admin/withdrawals/methods', {
            onSuccess: () => {
                setIsAddingMethod(false);
                resetMethod();
            },
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Admin — Payouts" />

            <div className="max-w-[1200px] mx-auto px-6 py-12 space-y-12 bg-white min-h-screen font-sans">
                
                {/* Vercel Style Header */}
                <div className="flex flex-col md:flex-row justify-between items-start border-b border-gray-100 pb-10 gap-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                            <Wallet className="h-3 w-3" />
                            <span>Platform Treasury</span>
                        </div>
                        <h1 className="text-4xl font-bold tracking-tighter text-black">Payouts</h1>
                        <p className="text-gray-500 text-[15px] font-medium tracking-tight">Manage and withdraw your platform revenue securely.</p>
                    </div>
                    
                    <div className="flex flex-col items-end gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] mb-1">Available to withdraw</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold tracking-tighter tabular-nums text-black">
                                    {new Intl.NumberFormat().format(stats?.availableBalanceFcfa || 0)}
                                </span>
                                <span className="text-sm font-bold text-gray-400 uppercase">XAF</span>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setIsAddingMethod(!isAddingMethod)}
                            className="bg-black hover:bg-[#111] text-white rounded-md px-6 h-10 font-bold transition-all text-xs uppercase tracking-widest"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Connect Account
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Left Column: Accounts & Form */}
                    <div className="lg:col-span-7 space-y-12">
                        
                        {/* Connected Accounts Section */}
                        <div className="space-y-6">
                            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em] px-1">Linked Mobile Methods</h2>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {isAddingMethod && (
                                    <div className="border border-gray-200 rounded-lg p-6 space-y-4 bg-gray-50/50 animate-in fade-in duration-200">
                                        <div className="space-y-3">
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Phone Number</Label>
                                                <Input 
                                                    className="h-10 rounded-md border-gray-200 focus:ring-black focus:border-black text-sm font-bold"
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    placeholder="237..."
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Label</Label>
                                                <Input 
                                                    className="h-10 rounded-md border-gray-200 focus:ring-black focus:border-black text-sm font-bold"
                                                    value={methodData.label}
                                                    onChange={e => setMethodData('label', e.target.value)}
                                                    placeholder="Account name"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="sm" variant="outline" className="flex-1 text-[10px] font-bold uppercase" onClick={() => setIsAddingMethod(false)}>Cancel</Button>
                                            <Button size="sm" className="flex-1 bg-black text-white text-[10px] font-bold uppercase h-9" onClick={handleAddMethod} disabled={processingMethod}>Save</Button>
                                        </div>
                                    </div>
                                )}

                                {methods?.map((method) => (
                                    <div key={method.id} className="group relative border border-gray-200 rounded-lg p-6 hover:border-black transition-colors bg-white">
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="p-2 bg-gray-50 rounded-md">
                                                <Phone className="h-4 w-4 text-black" />
                                            </div>
                                            {method.is_default && (
                                                <Badge className="bg-black text-white border-none text-[9px] font-bold uppercase tracking-tighter px-2 h-5">Default</Badge>
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-black tabular-nums tracking-tight">{method.phone_number}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{method.label || 'Mobile Account'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Payout Request Form */}
                        <div className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <div className="px-8 py-6 border-b border-gray-100 bg-gray-50/30">
                                <h3 className="text-sm font-bold text-black uppercase tracking-widest">Request a Payout</h3>
                                <p className="text-[11px] text-gray-500 mt-1 font-medium">Select an account and specify the amount to withdraw.</p>
                            </div>
                            
                            <form onSubmit={handleInitiateWithdrawal} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Amount (XAF)</Label>
                                        <div className="relative group">
                                            <Input 
                                                type="number"
                                                className="h-12 rounded-md border-gray-200 font-mono text-base font-bold focus:ring-black focus:border-black pr-14 transition-all"
                                                value={withdrawalData.amount_fcfa}
                                                onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-gray-300">XAF</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[9px] font-bold px-1">
                                            <span className="text-gray-300 uppercase tracking-widest">Minimum 100 CFA</span>
                                            <button 
                                                type="button"
                                                onClick={() => setWithdrawalData('amount_fcfa', (stats?.availableBalanceFcfa || 0).toString())}
                                                className="text-black hover:underline underline-offset-4 decoration-gray-300 uppercase tracking-tighter"
                                            >
                                                Withdraw Max
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">Destination Account</Label>
                                        <select 
                                            className="w-full h-12 bg-white border border-gray-200 rounded-md px-4 text-[11px] font-bold uppercase tracking-tight outline-none focus:ring-1 focus:ring-black focus:border-black transition-all appearance-none cursor-pointer"
                                            value={withdrawalData.method_id}
                                            onChange={e => setWithdrawalData('method_id', e.target.value)}
                                        >
                                            {methods?.map(m => (
                                                <option key={m.id} value={m.id}>{m.phone_number} — {m.label || 'Momo'}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg border border-gray-100 bg-gray-50/50 flex items-start gap-3">
                                    <AlertCircle className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                                    <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
                                        Payouts are processed immediately. Verification and network delays may occur.
                                    </p>
                                </div>

                                <div className="pt-6 border-t border-gray-100 flex justify-end">
                                    <Button 
                                        type="submit"
                                        disabled={processingWithdrawal || !withdrawalData.amount_fcfa}
                                        className="bg-black hover:bg-[#111] text-white rounded-md px-12 h-12 font-bold shadow-lg shadow-black/10 transition-all uppercase text-[11px] tracking-[0.3em]"
                                    >
                                        {processingWithdrawal ? 'Wait...' : 'Confirm Payout'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: History List */}
                    <div className="lg:col-span-5 space-y-6">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 px-1">
                            <h3 className="text-xs font-bold text-black uppercase tracking-[0.3em]">Activity</h3>
                            <ExternalLink className="h-3 w-3 text-gray-300" />
                        </div>

                        <div className="space-y-4">
                            {withdrawals?.data?.length > 0 ? withdrawals.data.map((w) => (
                                <div key={w.id} className="group border border-gray-200 rounded-lg p-5 hover:bg-gray-50/50 transition-all">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className={cn(
                                                "h-2 w-2 rounded-full",
                                                w.status === 'completed' ? "bg-green-500" : 
                                                w.status === 'processing' ? "bg-blue-500 animate-pulse" : "bg-red-500"
                                            )} />
                                            <p className="text-sm font-bold text-black tabular-nums tracking-tight">
                                                {w.amount_fcfa?.toLocaleString()} <span className="text-[10px] font-medium text-gray-400 uppercase">XAF</span>
                                            </p>
                                        </div>
                                        <span className="text-[10px] font-bold text-gray-400 uppercase tabular-nums">
                                            {new Date(w.created_at).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="text-[8px] font-mono border-gray-200 text-gray-400 uppercase tracking-tighter">
                                                {w.reference?.slice(0, 8)}
                                            </Badge>
                                            <span className="text-[9px] font-bold text-gray-300 uppercase italic">/ {w.method?.label || 'out'}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-gray-300">*{w.method?.phone_number?.slice(-4)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="py-24 text-center border border-dashed border-gray-100 rounded-lg">
                                    <p className="text-[10px] text-gray-300 font-bold uppercase tracking-[0.4em]">Empty</p>
                                </div>
                            )}
                        </div>
                        
                        <Button variant="outline" className="w-full h-10 border-gray-100 text-[10px] font-bold text-gray-400 hover:bg-gray-50 hover:text-black uppercase tracking-[0.3em]">
                            Full History
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}