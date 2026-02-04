<?php

namespace App\Models;

use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Tenant extends Model
{
    use HasFactory;

    protected $fillable = [
        'owner_id',
        'name',
        'slug',
        'email',
        'database_name',
        'status',
        'payment_mode',
        'ticket_price_fcfa',
        'campay_wallet_id',
        'commission_rate',
        'plan_id',
        'api_key',
        'wifi_zone_name',
        'expected_users',
        'referral_source',
        'onboarding_completed_at',
        'trial_ends_at',
        'suspended_at',
        'banned_at',
    ];

    protected $casts = [
        'ticket_price_fcfa' => 'integer',
        'commission_rate' => 'decimal:2',
        'trial_ends_at' => 'datetime',
        'suspended_at' => 'datetime',
        'banned_at' => 'datetime',
        'onboarding_completed_at' => 'datetime',
    ];

    public function plan()
    {
        return $this->belongsTo(\App\Models\Plan::class);
    }

    public function activeSubscription()
    {
        return $this->hasOne(Subscription::class)->where('status', 'active');
    }

    public function subscriptions()
    {
        return $this->hasMany(Subscription::class);
    }

    public function payments()
    {
        return $this->hasMany(Payment::class);
    }

    /**
     * Get the route key for the model.
     */
    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
