<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MikrotikSyncLog extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'router_id',
        'sync_type',
        'triggered_by',
        'started_at',
        'ended_at',
        'duration_seconds',
        'status',
        'active_sessions_synced',
        'new_sessions',
        'ended_sessions',
        'router_stats',
        'errors_count',
        'errors_details',
        'actions_performed',
    ];

    protected $casts = [
        'started_at' => 'datetime',
        'ended_at' => 'datetime',
        'duration_seconds' => 'integer',
        'active_sessions_synced' => 'integer',
        'new_sessions' => 'integer',
        'ended_sessions' => 'integer',
        'router_stats' => 'json',
        'errors_count' => 'integer',
        'errors_details' => 'json',
        'actions_performed' => 'json',
    ];

    public function router(): BelongsTo
    {
        return $this->belongsTo(MikrotikRouter::class, 'router_id');
    }
}
