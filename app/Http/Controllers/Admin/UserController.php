<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        $users = User::latest()->paginate(15);
        
        return Inertia::render('admin/users/index', [
            'users' => $users
        ]);
    }
}
