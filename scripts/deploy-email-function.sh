#!/bin/bash

# Script de déploiement de la fonction d'envoi d'emails
# Usage: ./scripts/deploy-email-function.sh

echo "🚀 Déploiement de la fonction d'envoi d'emails..."

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Installez-le d'abord."
    echo "   npm install -g supabase"
    exit 1
fi

# Vérifier que l'utilisateur est connecté
if ! supabase status &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Supabase. Connectez-vous d'abord."
    echo "   supabase login"
    exit 1
fi

# Configurer les secrets SMTP
echo "🔧 Configuration des secrets SMTP..."
supabase secrets set SMTP_HOST=mail.ledevellopeur.tn
supabase secrets set SMTP_PORT=465
supabase secrets set SMTP_USER=test@ledevellopeur.tn
supabase secrets set SMTP_PASSWORD=e)1q6n3{u@#g

if [ $? -eq 0 ]; then
    echo "✅ Secrets SMTP configurés avec succès !"
else
    echo "❌ Erreur lors de la configuration des secrets"
    exit 1
fi

# Déployer la fonction
echo "📦 Déploiement de la fonction send-email..."
supabase functions deploy send-email

if [ $? -eq 0 ]; then
    echo "✅ Fonction déployée avec succès !"
    echo ""
    echo "🧪 Testez l'envoi d'emails via l'interface d'administration !"
    echo "   Accédez à /dashboard/admin/email"
else
    echo "❌ Erreur lors du déploiement de la fonction"
    exit 1
fi
