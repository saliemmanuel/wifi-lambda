<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class WifiPackage extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'mikrotik_router_id',
        'name',
        'description',
        'slug',
        'price_fcfa',
        'time_limit_minutes',
        'time_limit_display',
        'data_limit_mb',
        'bandwidth_limit_kbps',
        'profile_name',
        'rate_limit',
    ];

    protected $casts = [
        'price_fcfa' => 'integer',
        'time_limit_minutes' => 'integer',
        'data_limit_mb' => 'integer',
        'bandwidth_limit_kbps' => 'integer',
    ];

    public function vouchers()
    {
        return $this->hasMany(WifiVoucher::class, 'package_id');
    }

    public function router()
    {
        return $this->belongsTo(MikrotikRouter::class, 'mikrotik_router_id');
    }
}
