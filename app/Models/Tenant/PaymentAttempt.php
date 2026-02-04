<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentAttempt extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'reference',
        'amount',
        'ticket_id',
        'user_id',
        'amount_fcfa',
        'payment_method',
        'phone_number',
        'campay_transaction_id',
        'status',
        'meta',
        'failure_reason',
        'attempted_at',
        'completed_at',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'meta' => 'array',
        'amount_fcfa' => 'integer',
        'attempted_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
