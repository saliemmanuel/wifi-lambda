<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Ticket extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'ticket_number',
        'client_id',
        'assigned_to',
        'category_id',
        'subject',
        'description',
        'status',
        'priority',
        'source',
        'requires_payment',
        'payment_status',
        'payment_amount_fcfa',
        'payment_id',
        'payment_method',
        'paid_at',
        'first_response_at',
        'resolved_at',
        'satisfaction_rating',
        'satisfaction_comment',
    ];

    protected $casts = [
        'requires_payment' => 'boolean',
        'payment_amount_fcfa' => 'integer',
        'paid_at' => 'datetime',
        'first_response_at' => 'datetime',
        'resolved_at' => 'datetime',
        'satisfaction_rating' => 'integer',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function assignedTo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(TicketMessage::class);
    }

    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class, 'attachable_id')->where('attachable_type', self::class);
    }
}
