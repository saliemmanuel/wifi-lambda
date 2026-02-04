<?php

namespace App\Http\Controllers;

use App\Models\Tenant;
use App\Models\Plan;
use App\Models\Subscription;
use App\Services\TenantService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class SetupTenantController extends Controller
{
    public function __construct(protected TenantService $tenantService)
    {
    }

    public function index()
    {
        // Check if user already has a tenant
        $tenant = Tenant::where('owner_id', auth()->id())->first();
        if ($tenant) {
            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);
        }

        return Inertia::render('setup/create-tenant');
    }

    public function store(Request $request)
    {
        // Comprehensive list of reserved keywords (Forbidden for Tenants)
        $reservedSlugs = [
            // Core Platform & Administrative
            'admin', 'administrator', 'root', 'superadmin', 'sysadmin', 'system', 'sys',
            'dashboard', 'controlpanel', 'cp', 'panel', 'main', 'master', 'god',
            'setup', 'install', 'config', 'settings', 'options', 'manage', 'manager',
            'admin-panel', 'admin-dashboard', 'administration', 'portal', 'console',
            
            // Authentication & Users
            'login', 'signin', 'logout', 'signout', 'register', 'signup', 'auth',
            'password', 'forgot-password', 'reset-password', 'change-password',
            'profile', 'user', 'users', 'me', 'account', 'email', 'verify', 'verification',
            'session', 'sessions', 'cookie', 'cookies', 'token', 'tokens',
            
            // Technical & Infrastructure
            'api', 'v1', 'v2', 'v3', 'rest', 'graphql', 'webhook', 'webhooks', 'callback',
            'www', 'web', 'mail', 'pop', 'smtp', 'ftp', 'ssh', 'git', 'svn', 'dev', 'test',
            'assets', 'css', 'js', 'images', 'img', 'static', 'public', 'storage', 'files',
            'well-known', 'manifest', 'robots.txt', 'sitemap', 'favicon', 'health', 'up',
            'ping', 'status', 'metrics', 'stats', 'analytics', 'logs', 'server', 'hosting',
            'cloud', 'database', 'db', 'sql', 'query', 'cache', 'redis', 'cdn',
            
            // E-commerce & Business
            'shop', 'buy', 'store', 'cart', 'checkout', 'pay', 'payment', 'billing', 'invoice',
            'subscription', 'plans', 'pricing', 'withdrawals', 'retraits', 'wallet', 'money',
            'onboarding', 'welcome', 'home', 'about', 'contact', 'legal', 'terms', 'privacy',
            'policy', 'help', 'support', 'faq', 'documentation', 'docs', 'manual',
            'community', 'blog', 'news', 'events', 'press', 'jobs', 'careers', 'partners',
            
            // Branding & Protected terms
            'tenant', 'tenants', 'community', 'wifi-lambda', 'lambda', 'wifi', 'hotspot', 
            'captive', 'portal', 'official', 'verified', 'google', 'facebook', 'apple', 
            'microsoft', 'amazon', 'stripe', 'paypal', 'orange', 'mtn', 'camtel',

            // Offensive, Shocking & Profanity (Multi-language)
            // Sexual / Pornographic
            'sexe', 'sex', 'porn', 'porno', 'xxx', 'ebony', 'bite', 'couille', 'penis', 'vagina',
            'pussy', 'dick', 'cock', 'vulva', 'clitoris', 'anal', 'anus', 'blowjob', 'cum',
            'ejaculation', 'orgasm', 'masturbation', 'sperm', 'vagin', 'anale', 'pipe',
            'sodomie', 'escort', 'hentai', 'milf', 'slut', 'whore', 'prostituee', 'pute',
            'salope', 'catin', 'turlute', 'gangbang', 'hardcore', 'erotic', 'erotique',
            
            // Profanity / Insults
            'merde', 'shit', 'fuck', 'putain', 'encule', 'connard', 'con', 'salope', 'bitch',
            'ass', 'asshole', 'bastard', 'crap', 'cunt', 'piss', 'motherfucker', 'fucker',
            'bollocks', 'bugger', 'bloody', 'twat', 'wanker', 'enfoire', 'petasse', 'trouduc',
            'sacamerde', 'abruti', 'cretin', 'debile', 'mongol', 'idiot', 'pqu', 'fesse',
            
            // Hate / Discrimination / Violence
            'nazi', 'hitler', 'raciste', 'racist', 'terroriste', 'terrorist', 'jihad',
            'bomb', 'bombe', 'kill', 'murder', 'dead', 'death', 'mort', 'suicide', 'blood',
            'sang', 'war', 'guerre', 'violence', 'abuse', 'rape', 'viol', 'negre', 'nigger',
            'negre', 'nigger', 'bougnoule', 'bicot', 'feuj', 'pd', 'pede', 'faggot', 'fag', 'homophobe',
            'xenophobe', 'fascist', 'communiste', 'dictator', 'dictateur',

            // International (Spanish, Portuguese, Italian, German)
            'mierda', 'pendejo', 'puta', 'puto', 'maricon', 'hijo-de-puta', 'cabron', 'joder', // Spanish
            'caralho', 'porra', 'merda', 'puta-que-pariu', 'fodasse', 'bicha', // Portuguese
            'cazzo', 'vaffanculo', 'stronzo', 'puttana', 'finocchio', 'merda', // Italian
            'scheisse', 'arschloch', 'ficken', 'schlampe', 'hurensohn', 'wichser', // German
            
            // Chinese (Pinyin transliterations for slugs)
            'cao', 'caonima', 'nima', 'shabi', 'nmsl', 'erbi', 'wangba', 'wangbadan', 
            'hundan', 'qusi', 'tiananmen', 'xjp', 'falungong' // Including highly sensitive terms
        ];

        $request->validate([
            'name' => 'required|string|min:3|max:50',
        ]);

        $name = $request->name;
        $slug = Str::slug($name);

        // 1. Check if slug is too short or empty
        if (strlen($slug) < 3) {
            return back()->withErrors(['name' => 'Le nom choisi génère un lien trop court. Veuillez choisir un nom plus explicite.']);
        }
        
        // 2. STRICT FORBIDDEN LIST CHECK
        if (in_array($slug, $reservedSlugs)) {
            return back()->withErrors(['name' => "Le nom \"$name\" est réservé par le système. Veuillez choisir un autre nom pour votre zone."]);
        }
        
        // 3. Ensure slug is unique in the database
        if (Tenant::where('slug', $slug)->exists()) {
            return back()->withErrors(['name' => "Le lien /$slug est déjà utilisé par une autre zone. Veuillez en choisir un autre."]);
        }

        try {
            $tenant = $this->tenantService->setupNewTenant(
                auth()->user(), 
                $name, 
                $slug
            );

            return redirect()->route('tenant.dashboard', ['tenant_slug' => $tenant->slug]);

        } catch (\Exception $e) {
            return back()->withErrors(['error' => 'Échec de la création de la zone : ' . $e->getMessage()]);
        }
    }
}
