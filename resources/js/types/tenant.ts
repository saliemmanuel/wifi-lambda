export interface Plan {
    id: number;
    name: string;
    slug: string;
    price_eur: number;
    price_fcfa: number;
    commission_rate: number;
    vouchers_limit: number | null;
    features: string[];
}

export interface Tenant {
    id: number;
    name: string;
    slug: string;
    email: string;
    status: 'active' | 'suspended' | 'banned' | 'inactive' | 'trial' | 'pending';
    payment_mode: 'prepaid' | 'postpaid';
    ticket_price_fcfa: number;
    commission_rate: string;
    plan_id: number;
    plan?: Plan;
    trial_ends_at: string | null;
    created_at: string;
    updated_at: string;
}
