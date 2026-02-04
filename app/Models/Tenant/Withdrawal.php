<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Withdrawal extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'method_id',
        'amount',
        'fee',
        'status',
        'reference',
        'external_reference',
        'error_message',
        'processed_at',
    ];

    protected $casts = [
        'amount' => 'integer',
        'fee' => 'integer',
        'processed_at' => 'datetime',
    ];

    public function method(): BelongsTo
    {
        return $this->belongsTo(WithdrawalMethod::class, 'method_id');
    }
}
