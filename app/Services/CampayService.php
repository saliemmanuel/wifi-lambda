<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class CampayService
{
    protected string $baseUrl;
    protected string $username;
    protected string $password;

    public function __construct()
    {
        $this->baseUrl = config('services.campay.base_url', 'https://www.campay.net/api');
        $this->username = config('services.campay.username');
        $this->password = config('services.campay.password');
    }

    protected function getAccessToken(): ?string
    {
        if (!$this->username || !$this->password) {
            Log::error("Campay Error: Username or Password missing in .env");
            return null;
        }

        try {
            $response = Http::post("{$this->baseUrl}/token/", [
                'username' => $this->username,
                'password' => $this->password,
            ]);

            if ($response->successful()) {
                return $response->json('token');
            }
            
            Log::error("Campay Auth Failed (400) - Check your CAMPAY_USERNAME and CAMPAY_PASSWORD. Also ensure CAMPAY_BASE_URL matches your credentials (demo vs live).", [
                'status' => $response->status(),
                'url' => "{$this->baseUrl}/token/",
                'response' => $response->json()
            ]);
        } catch (\Exception $e) {
            Log::error("Campay Auth Exception: " . $e->getMessage());
        }

        return null;
    }

    protected function formatPhoneNumber(string $phoneNumber): string
    {
        // Remove any non-digit characters
        $phoneNumber = preg_replace('/\D/', '', $phoneNumber);

        // Check if it already starts with '237'
        if (str_starts_with($phoneNumber, '237') && strlen($phoneNumber) > 9) {
            return $phoneNumber;
        }

        // Prepend '237'
        return '237' . $phoneNumber;
    }

    public function collect(array $data)
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        try {
            $response = Http::withHeaders(['Authorization' => 'Token ' . $token])->post("{$this->baseUrl}/collect/", [
                'amount' => (string) (int) $data['amount'],
                'currency' => $data['currency'] ?? 'XAF',
                'from' => $this->formatPhoneNumber($data['phone_number']),
                'description' => $data['description'],
                'external_reference' => $data['external_reference'] ?? null,
            ]);

            if (!$response->successful()) {
                Log::error("Campay Collect Failed", ['status' => $response->status(), 'body' => $response->body()]);
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Campay Collect Exception: " . $e->getMessage());
            return null;
        }
    }

    public function checkTransactionStatus(string $reference)
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        try {
            $response = Http::withHeaders(['Authorization' => 'Token ' . $token])->get("{$this->baseUrl}/transaction/{$reference}/");
            return $response->json();
        } catch (\Exception $e) {
            Log::error("Campay Status Error: " . $e->getMessage());
            return null;
        }
    }

    public function withdraw(array $data)
    {
        $token = $this->getAccessToken();
        if (!$token) return null;

        try {
            $response = Http::withHeaders(['Authorization' => 'Token ' . $token])->post("{$this->baseUrl}/withdraw/", [
                'amount' => $data['amount'],
                'currency' => $data['currency'] ?? 'XAF',
                'to' => $data['phone_number'],
                'description' => $data['description'],
                'external_reference' => $data['external_reference'] ?? null,
            ]);

            if (!$response->successful()) {
                Log::error("Campay Withdraw Failed", [
                    'status' => $response->status(), 
                    'body' => $response->body(),
                    'data' => $data
                ]);
            }

            return $response->json();
        } catch (\Exception $e) {
            Log::error("Campay Withdraw Exception: " . $e->getMessage());
            return null;
        }
    }
}
