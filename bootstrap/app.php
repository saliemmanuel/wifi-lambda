<?php

use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->validateCsrfTokens(except: [
            'webhook/*',
        ]);
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);
        
        // Trust all proxies (essential for Docker/Nginx reverse proxy to detect HTTPS)
        $middleware->trustProxies(at: '*');

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->alias([
            'tenant' => \App\Http\Middleware\IdentifyTenant::class,
            'onboarded' => \App\Http\Middleware\EnsureOnboardingIsCompleted::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions) {
        $exceptions->respond(function ($response, $e, $request) {
            if (in_array($response->getStatusCode(), [500, 503, 404, 403])) {
                return \Inertia\Inertia::render('error', [
                    'status' => $response->getStatusCode(),
                    'message' => $response->getStatusCode() === 403 ? $e->getMessage() : null,
                ])
                ->toResponse($request)
                ->setStatusCode($response->getStatusCode());
            }

            return $response;
        });
    })->create();
