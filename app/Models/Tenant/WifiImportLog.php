<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WifiImportLog extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'imported_by',
        'batch_id',
        'filename',
        'import_type',
        'total_rows',
        'successful_imports',
        'failed_imports',
        'duplicate_usernames',
        'package_id',
        'import_config',
        'errors_json',
        'status',
    ];

    protected $casts = [
        'total_rows' => 'integer',
        'successful_imports' => 'integer',
        'failed_imports' => 'integer',
        'duplicate_usernames' => 'integer',
        'import_config' => 'json',
        'errors_json' => 'json',
    ];

    public function importer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'imported_by');
    }

    public function package(): BelongsTo
    {
        return $this->belongsTo(WifiPackage::class);
    }
}
