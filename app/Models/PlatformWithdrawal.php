<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlatformWithdrawal extends Model
{
    protected $fillable = [
        'method_id',
        'amount_fcfa',
        'status',
        'reference',
        'external_reference',
        'error_message',
        'processed_at',
    ];

    public function method()
    {
        return $this->belongsTo(PlatformWithdrawalMethod::class, 'method_id');
    }
}
