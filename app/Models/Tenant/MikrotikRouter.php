<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MikrotikRouter extends TenantModel
{
    use HasFactory;
    
    protected static function booted()
    {
        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = \Illuminate\Support\Str::slug($model->name) . '-' . \Illuminate\Support\Str::random(6);
            }
        });

        static::updating(function ($model) {
            if ($model->isDirty('name') && empty($model->slug)) {
                 $model->slug = \Illuminate\Support\Str::slug($model->name) . '-' . \Illuminate\Support\Str::random(6);
            }
        });
    }

    protected $fillable = [
        'name',
        'slug',
        'description',
        'contact',
        'router_model',
        'ip_address',
        'port',
        'api_username',
        'api_password',
        'use_ssl',
        'hotspot_server_name',
        'hotspot_interface',
        'captive_portal_url',
        'sync_enabled',
        'sync_interval_minutes',
        'last_sync_at',
        'last_sync_status',
        'total_users_created',
        'active_sessions_count',
        'cpu_load_percent',
        'memory_usage_percent',
        'uptime_seconds',
        'connection_status',
        'last_seen_at',
        'ping_latency_ms',
    ];

    protected $casts = [
        'port' => 'integer',
        'use_ssl' => 'boolean',
        'sync_enabled' => 'boolean',
        'sync_interval_minutes' => 'integer',
        'last_sync_at' => 'datetime',
        'total_users_created' => 'integer',
        'active_sessions_count' => 'integer',
        'cpu_load_percent' => 'decimal:2',
        'memory_usage_percent' => 'decimal:2',
        'uptime_seconds' => 'integer',
        'last_seen_at' => 'datetime',
        'ping_latency_ms' => 'integer',
        'api_password' => 'encrypted', // Ensure this is encrypted
    ];

    public function packages()
    {
        return $this->hasMany(\App\Models\Tenant\WifiPackage::class, 'mikrotik_router_id');
    }
}
