# Fonction d'envoi d'emails - Location Vacance

Cette Edge Function permet d'envoyer des emails via un serveur SMTP personnalisé.

## Configuration

### Variables d'environnement requises

```bash
SMTP_HOST=mail.ledevellopeur.tn
SMTP_PORT=465
SMTP_USER=test@ledevellopeur.tn
SMTP_PASSWORD=e)1q6n3{u@#g
```

### Configuration des secrets Supabase

```bash
supabase secrets set SMTP_HOST=mail.ledevellopeur.tn
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=test@ledevellopeur.tn
supabase secrets set SMTP_PASSWORD=e)1q6n3{u@#g
```

## Utilisation

### Endpoint
```
POST https://[PROJECT_REF].supabase.co/functions/v1/send-email
```

### Headers
```
Content-Type: application/json
Authorization: Bearer [SUPABASE_ANON_KEY]
```

### Body
```json
{
  "to": "destinataire@email.com",
  "subject": "Sujet de l'email",
  "message": "Contenu du message",
  "isTest": false
}
```

### Réponse de succès
```json
{
  "success": true,
  "message": "Email envoyé avec succès",
  "to": "destinataire@email.com",
  "subject": "Sujet de l'email",
  "isTest": false
}
```

### Réponse d'erreur
```json
{
  "error": "Message d'erreur détaillé",
  "details": "Détails techniques de l'erreur"
}
```

## Déploiement

```bash
supabase functions deploy send-email
```

## Logs

```bash
supabase functions logs send-email
supabase functions logs send-email --follow
```
