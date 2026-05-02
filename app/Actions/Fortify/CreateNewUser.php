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

        $user = User::create([
            'name' => $input['name'],
            'email' => $input['email'],
            'password' => \Illuminate\Support\Facades\Hash::make($input['password']),
        ]);

        // Create Tenant automatically with a random hash as slug
        try {
            $tenantService = app(\App\Services\TenantService::class);
            
            // Generate a unique UUID for the slug
            do {
                $finalSlug = (string) \Illuminate\Support\Str::uuid();
            } while (\App\Models\Tenant::where('slug', $finalSlug)->exists());

            $tenantService->setupNewTenant($user, $input['name'], $finalSlug);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error("Auto-tenant creation failed for user {$user->id}: " . $e->getMessage());
            // On laisse l'utilisateur créé, mais on log l'erreur. 
            // Le dashboard redirigera vers la home s'il n'y a pas de tenant.
        }

        return $user;
    }
}
