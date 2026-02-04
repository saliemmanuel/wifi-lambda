<?php

namespace App\Models\Tenant;

trait UsesTenantConnection
{
    public function getConnectionName()
    {
        return 'tenant';
    }
}
