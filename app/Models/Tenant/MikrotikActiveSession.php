<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MikrotikActiveSession extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'router_id',
        'voucher_id',
        'mikrotik_session_id',
        'username',
        'mac_address',
        'ip_address',
        'login_time',
        'uptime_seconds',
        'bytes_in',
        'bytes_out',
        'current_rate_in_kbps',
        'current_rate_out_kbps',
        'session_status',
        'last_seen_at',
        'synced_at',
    ];

    protected $casts = [
        'login_time' => 'datetime',
        'uptime_seconds' => 'integer',
        'bytes_in' => 'integer',
        'bytes_out' => 'integer',
        'current_rate_in_kbps' => 'integer',
        'current_rate_out_kbps' => 'integer',
        'last_seen_at' => 'datetime',
        'synced_at' => 'datetime',
    ];

    public function router(): BelongsTo
    {
        return $this->belongsTo(MikrotikRouter::class, 'router_id');
    }

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(WifiVoucher::class);
    }
}
