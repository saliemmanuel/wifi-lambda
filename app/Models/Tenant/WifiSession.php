<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WifiSession extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'voucher_id',
        'router_id',
        'session_id',
        'username',
        'mac_address',
        'ip_address',
        'started_at',
        'ended_at',
        'duration_minutes',
        'data_upload_mb',
        'data_download_mb',
        'disconnect_reason',
        'status',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_minutes' => 'integer',
        'data_upload_mb' => 'integer',
        'data_download_mb' => 'integer',
    ];

    public function voucher(): BelongsTo
    {
        return $this->belongsTo(WifiVoucher::class);
    }

    public function router(): BelongsTo
    {
        return $this->belongsTo(MikrotikRouter::class, 'router_id');
    }
}
