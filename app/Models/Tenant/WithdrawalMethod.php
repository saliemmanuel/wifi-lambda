<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WithdrawalMethod extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'provider',
        'phone_number',
        'label',
        'is_default',
    ];

    protected $casts = [
        'is_default' => 'boolean',
    ];

    public function withdrawals(): HasMany
    {
        return $this->hasMany(Withdrawal::class, 'method_id');
    }
}
