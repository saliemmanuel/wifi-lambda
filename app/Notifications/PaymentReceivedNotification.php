<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class PaymentReceivedNotification extends Notification
{
    use Queueable;

    protected $payment;

    /**
     * Create a new notification instance.
     */
    public function __construct($payment)
    {
        $this->payment = $payment;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('Confirmation de Paiement - WiFi Lambda')
                    ->greeting('Bonjour ' . $notifiable->name . '!')
                    ->line('Nous avons bien reçu votre paiement de ' . number_format($this->payment->amount_fcfa) . ' FCFA.')
                    ->line('Votre abonnement a été activé avec succès.')
                    ->action('Accéder au Tableau de Bord', url('/dashboard'))
                    ->line('Merci de votre confiance !');
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'payment_id' => $this->payment->id,
            'amount' => $this->payment->amount_fcfa,
            'message' => 'Paiement de ' . number_format($this->payment->amount_fcfa) . ' FCFA reçu avec succès.',
        ];
    }
}
