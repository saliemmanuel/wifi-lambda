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
    CreditCard,
    ArrowRight,
    MoreHorizontal,
    Clock,
    AlertCircle
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
    method: {
        label: string;
        phone_number: string;
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

export default function WithdrawalsIndex({ withdrawals, methods, stats }: WithdrawalsIndexProps) {
    const [isAddingMethod, setIsAddingMethod] = useState(false);

    const { data: methodData, setData: setMethodData, post: postMethod, processing: processingMethod, reset: resetMethod, errors: methodErrors } = useForm({
        phone_number: '',
        label: '',
    });

    const { data: withdrawalData, setData: setWithdrawalData, post: postWithdrawal, processing: processingWithdrawal, reset: resetWithdrawal, errors: withdrawalErrors } = useForm({
        amount_fcfa: '',
        method_id: methods.find(m => m.is_default)?.id || methods[0]?.id || '',
    });

    const breadcrumbs: BreadcrumbItem[] = [
        { title: 'Home', href: '/admin/dashboard' },
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
            <Head title="Payouts | Stripe Dashboard Style" />

            <div className="max-w-7xl mx-auto px-6 py-10 space-y-12 bg-slate-50/30 min-h-screen font-sans">
                
                {/* Stripe-style Header */}
                <div className="flex flex-col md:flex-row justify-between items-end pb-8 border-b border-slate-200 gap-6">
                    <div className="space-y-1">
                        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight">Payouts</h1>
                        <p className="text-slate-500 text-sm">Manage your funds and transfer earnings to your linked accounts.</p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                         <div className="bg-white border border-slate-200 px-5 py-3 rounded-lg shadow-sm flex flex-col min-w-[200px]">
                            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Available to pay out</span>
                            <div className="flex items-baseline gap-1 mt-1">
                                <span className="text-2xl font-bold text-slate-900 tabular-nums">
                                    {new Intl.NumberFormat().format(stats.availableBalanceFcfa)}
                                </span>
                                <span className="text-sm font-medium text-slate-500">XAF</span>
                            </div>
                        </div>
                        <Button 
                            onClick={() => setIsAddingMethod(!isAddingMethod)}
                            className="bg-[#635bff] hover:bg-[#5a51e6] text-white rounded-md px-4 h-10 font-medium shadow-sm transition-all"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Add account
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    
                    {/* Left Column: Accounts & Form */}
                    <div className="lg:col-span-8 space-y-10">
                        
                        {/* Linked Accounts (Stripe List Style) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                <h3 className="text-sm font-semibold text-slate-900">Linked accounts</h3>
                            </div>
                            
                            <div className="divide-y divide-slate-100">
                                {isAddingMethod && (
                                    <div className="p-6 bg-slate-50/50 animate-in fade-in duration-300">
                                        <form onSubmit={handleAddMethod} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-700">Phone Number</Label>
                                                <Input 
                                                    className="h-9 rounded-md border-slate-200 focus:ring-[#635bff] focus:border-[#635bff]"
                                                    value={methodData.phone_number}
                                                    onChange={e => setMethodData('phone_number', e.target.value)}
                                                    placeholder="237..."
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs font-semibold text-slate-700">Account Label</Label>
                                                <div className="flex gap-2">
                                                    <Input 
                                                        className="h-9 rounded-md border-slate-200 focus:ring-[#635bff] focus:border-[#635bff]"
                                                        value={methodData.label}
                                                        onChange={e => setMethodData('label', e.target.value)}
                                                        placeholder="e.g. Primary"
                                                    />
                                                    <Button size="sm" className="bg-[#635bff] h-9 px-4 rounded-md" disabled={processingMethod}>Save</Button>
                                                </div>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {methods.length > 0 ? methods.map((method) => (
                                    <div key={method.id} className="px-6 py-5 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
                                                <Phone className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-semibold text-slate-900 tabular-nums">{method.phone_number}</span>
                                                    {method.is_default && (
                                                        <Badge variant="secondary" className="bg-blue-50 text-[#635bff] border-none text-[10px] font-semibold px-2 py-0">Default</Badge>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500 mt-0.5">{method.label || 'Mobile Money Account'}</p>
                                            </div>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )) : (
                                    <div className="p-12 text-center">
                                        <p className="text-sm text-slate-500 italic">No accounts linked yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payout Form (Stripe Card Style) */}
                        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                            <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
                                <h3 className="text-sm font-semibold text-slate-900">Initiate a payout</h3>
                                <p className="text-xs text-slate-500 mt-1">Funds will be sent to the selected account.</p>
                            </div>
                            
                            <form onSubmit={handleInitiateWithdrawal} className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-slate-700">Amount to pay out</Label>
                                        <div className="relative group">
                                            <Input 
                                                type="number"
                                                className="h-11 rounded-md border-slate-200 font-semibold text-lg focus:ring-[#635bff] focus:border-[#635bff] pr-12 transition-all"
                                                value={withdrawalData.amount_fcfa}
                                                onChange={e => setWithdrawalData('amount_fcfa', e.target.value)}
                                                required
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">XAF</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[11px] font-medium px-1">
                                            <span className="text-slate-400 uppercase tracking-wider">Min: 100 CFA</span>
                                            <button 
                                                type="button"
                                                onClick={() => setWithdrawalData('amount_fcfa', stats.availableBalanceFcfa.toString())}
                                                className="text-[#635bff] hover:underline"
                                            >
                                                Pay out all
                                            </button>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <Label className="text-xs font-semibold text-slate-700">Transfer destination</Label>
                                        <select 
                                            className="w-full h-11 bg-white border border-slate-200 rounded-md px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-[#635bff]/20 focus:border-[#635bff] transition-all appearance-none cursor-pointer"
                                            value={withdrawalData.method_id}
                                            onChange={e => setWithdrawalData('method_id', e.target.value)}
                                        >
                                            {methods.map(m => (
                                                <option key={m.id} value={m.id}>{m.phone_number} ({m.label || 'Momo'})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="p-4 rounded-lg bg-blue-50/40 border border-blue-100/50 flex items-start gap-3">
                                    <AlertCircle className="h-4 w-4 text-[#635bff] mt-0.5 shrink-0" />
                                    <p className="text-xs text-[#635bff] font-medium leading-relaxed">
                                        Transfers to mobile accounts are usually instant. Depending on your network, it may take up to 1 business day to reflect in your balance.
                                    </p>
                                </div>

                                <div className="pt-4 border-t border-slate-50 flex justify-end">
                                    <Button 
                                        type="submit"
                                        disabled={processingWithdrawal || !withdrawalData.amount_fcfa}
                                        className="bg-[#635bff] hover:bg-[#5a51e6] text-white rounded-md px-10 h-11 font-semibold shadow-sm transition-all"
                                    >
                                        {processingWithdrawal ? 'Sending funds...' : 'Create payout'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: History Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider opacity-60">Recent Activity</h3>
                        </div>

                        <div className="space-y-3">
                            {withdrawals.data.length > 0 ? withdrawals.data.map((w) => (
                                <div key={w.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:border-slate-300 transition-all cursor-default">
                                    <div className="flex justify-between items-start">
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-slate-900 tabular-nums">
                                                {w.amount_fcfa.toLocaleString()} <span className="text-[11px] font-medium text-slate-400">XAF</span>
                                            </p>
                                            <p className="text-[10px] text-slate-400 tabular-nums tracking-wide">
                                                {new Date(w.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <Badge className={cn(
                                            "text-[9px] font-bold uppercase tracking-widest px-2 h-5 border-none",
                                            w.status === 'completed' ? "bg-green-50 text-green-700" : 
                                            w.status === 'processing' ? "bg-blue-50 text-[#635bff]" : "bg-orange-50 text-orange-700"
                                        )}>
                                            {w.status === 'completed' ? 'Paid' : w.status}
                                        </Badge>
                                    </div>
                                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-500 font-medium uppercase tracking-tighter">
                                        <span>Ref: {w.reference.slice(0, 8)}...</span>
                                        <span>*{w.method?.phone_number.slice(-4)}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center bg-white rounded-xl border border-dashed border-slate-200">
                                    <Clock className="h-6 w-6 mx-auto text-slate-300 mb-2" />
                                    <p className="text-xs text-slate-400 font-medium">No payouts yet</p>
                                </div>
                            )}
                        </div>
                        
                        <Button variant="ghost" className="w-full text-xs font-semibold text-[#635bff] hover:bg-blue-50/50">
                            View all payouts
                        </Button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}