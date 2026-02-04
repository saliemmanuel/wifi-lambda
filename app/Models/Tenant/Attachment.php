<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'ticket_id',
        'message_id',
        'uploaded_by',
        'filename',
        'original_filename',
        'mime_type',
        'file_size',
        'file_path',
    ];

    protected $casts = [
        'file_size' => 'integer',
    ];

    public function ticket(): BelongsTo
    {
        return $this->belongsTo(Ticket::class);
    }

    public function message(): BelongsTo
    {
        return $this->belongsTo(TicketMessage::class);
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
