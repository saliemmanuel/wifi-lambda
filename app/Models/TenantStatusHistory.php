<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TenantStatusHistory extends Model
{
    use HasFactory;

    protected $table = 'tenant_status_history';

    protected $fillable = [
        'tenant_id',
        'status',
        'reason',
        'changed_by_user_id', // Optional: if an admin changed it
    ];

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }

    public function changedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'changed_by_user_id');
    }
}
