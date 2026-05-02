<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\User;
use Illuminate\Support\Facades\Validator;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        Validator::make($input, [
            ...$this->profileRules(),
            'password' => $this->passwordRules(),
        ])->validate();

        return \Illuminate\Support\Facades\DB::transaction(function () use ($input) {
            $user = User::create([
                'name' => $input['name'],
                'email' => $input['email'],
                'password' => \Illuminate\Support\Facades\Hash::make($input['password']),
            ]);

            // Create Tenant automatically
            $tenantService = app(\App\Services\TenantService::class);
            $slug = \Illuminate\Support\Str::slug($input['name']);
            
            // Ensure unique slug if needed (basic version)
            $finalSlug = $slug;
            $count = 1;
            while (\App\Models\Tenant::where('slug', $finalSlug)->exists()) {
                $finalSlug = $slug . '-' . $count++;
            }

            $tenantService->setupNewTenant($user, $input['name'], $finalSlug);

            return $user;
        });
    }
}
