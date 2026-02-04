<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CannedResponse extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'title',
        'shortcut',
        'content',
        'category_id',
        'usage_count',
    ];

    protected $casts = [
        'usage_count' => 'integer',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }
}
