#!/bin/bash

# Script pour déployer les Edge Functions Google Analytics

echo "🚀 Déploiement des Edge Functions Google Analytics..."

# Vérifier que Supabase CLI est installé
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI n'est pas installé. Installez-le d'abord."
    exit 1
fi

# Se connecter à Supabase (si pas déjà fait)
echo "🔐 Connexion à Supabase..."
supabase login

# Lier le projet (si pas déjà fait)
echo "🔗 Liaison du projet..."
supabase link

# Déployer les Edge Functions
echo "📦 Déploiement de analytics-token..."
supabase functions deploy analytics-token

echo "📦 Déploiement de analytics-data..."
supabase functions deploy analytics-data

echo "✅ Déploiement terminé !"
echo ""
echo "🔧 Configuration des variables d'environnement :"
echo "1. Allez dans votre dashboard Supabase"
echo "2. Settings > Edge Functions"
echo "3. Ajoutez la variable : GOOGLE_ANALYTICS_PRIVATE_KEY"
echo "4. Collez votre clé privée du fichier JSON téléchargé"
echo ""
echo "🎯 Votre dashboard analytics est maintenant prêt !"
