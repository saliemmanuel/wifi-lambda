<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Payment extends Model
{
    use HasFactory;

    protected $fillable = [
        'tenant_id',
        'payment_type',
        'subscription_id',
        'amount_eur',
        'ticket_id',
        'client_user_id',
        'amount_fcfa',
        'platform_commission_fcfa',
        'reseller_amount_fcfa',
        'campay_transaction_id',
        'campay_reference',
        'campay_code',
        'campay_status',
        'payment_method',
        'phone_number',
        'status',
        'paid_at',
        'meta',
    ];

    protected $casts = [
        'amount_eur' => 'decimal:2',
        'amount_fcfa' => 'integer',
        'platform_commission_fcfa' => 'integer',
        'reseller_amount_fcfa' => 'integer',
        'paid_at' => 'datetime',
        'meta' => 'array',
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function subscription(): BelongsTo
    {
        return $this->belongsTo(Subscription::class);
    }

    public function invoice(): HasOne
    {
        return $this->hasOne(Invoice::class);
    }
}
