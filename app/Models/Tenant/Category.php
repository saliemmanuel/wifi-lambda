<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'color',
        'sla_response_time',
        'sla_resolution_time',
        'parent_id',
        'is_active',
    ];

    protected $casts = [
        'sla_response_time' => 'integer',
        'sla_resolution_time' => 'integer',
        'is_active' => 'boolean',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Category::class, 'parent_id');
    }

    public function tickets(): HasMany
    {
        return $this->hasMany(Ticket::class);
    }
}
