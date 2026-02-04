<?php

namespace App\Models\Tenant;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Automation extends TenantModel
{
    use HasFactory;

    protected $fillable = [
        'name',
        'trigger',
        'conditions',
        'actions',
        'is_active',
        'execution_count',
    ];

    protected $casts = [
        'conditions' => 'json',
        'actions' => 'json',
        'is_active' => 'boolean',
        'execution_count' => 'integer',
    ];
}
