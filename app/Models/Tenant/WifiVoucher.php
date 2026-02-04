<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WifiVoucher extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'package_id',
        'hotspot_id',
        'username',
        'password',
        'qr_code_data',
        'profile_name',
        'time_limit',
        'time_limit_minutes',
        'data_limit_mb',
        'status',
        'import_status',
        'purchased_by',
        'purchased_at',
        'purchase_amount_fcfa',
        'payment_id', // Reference to Central DB
        'activated_at',
        'expires_at',
        'total_session_time_minutes',
        'data_consumed_mb',
        'remaining_time_minutes',
        'connection_count',
        'current_session_id',
        'mac_address',
        'ip_address',
        'comment',
    ];

    protected $casts = [
        'time_limit_minutes' => 'integer',
        'data_limit_mb' => 'integer',
        'purchased_at' => 'datetime',
        'purchase_amount_fcfa' => 'integer',
        'activated_at' => 'datetime',
        'expires_at' => 'datetime',
        'total_session_time_minutes' => 'integer',
        'data_consumed_mb' => 'decimal:2',
        'remaining_time_minutes' => 'integer',
        'connection_count' => 'integer',
    ];

    public function package(): BelongsTo
    {
        return $this->belongsTo(WifiPackage::class);
    }

    public function router(): BelongsTo
    {
        return $this->belongsTo(MikrotikRouter::class, 'hotspot_id');
    }

    public function purchaser(): BelongsTo
    {
        return $this->belongsTo(User::class, 'purchased_by');
    }
}
