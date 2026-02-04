<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformWithdrawalMethod extends Model
{
    protected $fillable = [
        'provider',
        'phone_number',
        'label',
        'is_default',
    ];

    public function withdrawals()
    {
        return $this->hasMany(PlatformWithdrawal::class, 'method_id');
    }
}
