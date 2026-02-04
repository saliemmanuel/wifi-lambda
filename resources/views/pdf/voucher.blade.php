<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Ticket Wi-Fi - {{ $tenant_name }}</title>
    <style>
        body {
            font-family: 'Helvetica', sans-serif;
            text-align: center;
            padding: 40px;
            background: white;
            color: #1e293b;
        }
        .container {
            border: 2px dashed #94a3b8;
            padding: 40px;
            border-radius: 20px;
            max-width: 400px;
            margin: 0 auto;
        }
        .header {
            margin-bottom: 30px;
        }
        .tenant-name {
            font-size: 24px;
            font-weight: bold;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 5px;
        }
        .ticket-label {
            font-size: 14px;
            font-weight: bold;
            color: #64748b;
            letter-spacing: 2px;
        }
        .section {
            margin-top: 30px;
        }
        .label {
            font-size: 10px;
            text-transform: uppercase;
            color: #94a3b8;
            font-weight: bold;
            margin-bottom: 4px;
        }
        .value {
            font-size: 32px;
            font-weight: bold;
            color: #0f172a;
            letter-spacing: 1px;
        }
        .footer {
            margin-top: 40px;
            font-size: 12px;
            color: #94a3b8;
            border-top: 1px solid #f1f5f9;
            padding-top: 20px;
        }
        .date {
            font-size: 9px;
            margin-top: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="tenant-name">{{ $tenant_name }}</div>
            <div class="ticket-label">TICKET WI-FI</div>
        </div>

        <div class="section">
            <div class="label">Utilisateur</div>
            <div class="value">{{ $username }}</div>
        </div>

        <div class="section">
            <div class="label">Mot de passe</div>
            <div class="value">{{ $password }}</div>
        </div>

        <div class="footer">
            Conservez précieusement vos accès.<br>
            Merci de votre achat !
            <div class="date">Généré le {{ now()->format('d/m/Y H:i') }} | Réf: {{ $reference }}</div>
        </div>
    </div>
</body>
</html>
