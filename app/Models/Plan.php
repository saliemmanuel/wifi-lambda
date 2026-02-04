<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Plan extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'slug',
        'price_eur',
        'price_fcfa',
        'max_tickets_per_month',
        'max_agents',
        'max_storage_gb',
        'api_access',
        'white_label',
        'is_active',
    ];

    protected $casts = [
        'price_eur' => 'decimal:2',
        'price_fcfa' => 'integer',
        'max_tickets_per_month' => 'integer',
        'max_agents' => 'integer',
        'max_storage_gb' => 'integer',
        'api_access' => 'boolean',
        'white_label' => 'boolean',
        'is_active' => 'boolean',
    ];

    public function tenants(): HasMany
    {
        return $this->hasMany(Tenant::class);
    }
}
