<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\Lang;

class ResetPasswordNotification extends Notification
{
    use Queueable;

    public $token;

    public function __construct($token)
    {
        $this->token = $token;
    }

    public function via($notifiable)
    {
        return ['mail'];
    }

    public function toMail($notifiable)
    {
        $url = url(route('password.reset', [
            'token' => $this->token,
            'email' => $notifiable->getEmailForPasswordReset(),
        ], false));

        return (new MailMessage)
            ->subject(Lang::get('Réinitialisation de votre mot de passe - ZAWIFI'))
            ->greeting('Bonjour !')
            ->line(Lang::get('Vous recevez cet e-mail car nous avons reçu une demande de réinitialisation de mot de passe pour votre compte.'))
            ->action(Lang::get('Réinitialiser le mot de passe'), $url)
            ->line(Lang::get('Ce lien de réinitialisation de mot de passe expirera dans :count minutes.', ['count' => config('auth.passwords.'.config('auth.defaults.passwords').'.expire')]))
            ->line(Lang::get('Si vous n\'avez pas demandé de réinitialisation de mot de passe, aucune autre action n\'est requise.'))
            ->salutation('Cordialement, L\'équipe ZAWIFI');
    }
}
