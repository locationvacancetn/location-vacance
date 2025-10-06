import { useLocation } from 'react-router-dom';
import { useMemo, useState, useCallback, useEffect } from 'react';

// Configuration des titres par route
const PAGE_TITLES: Record<string, string> = {
  // Routes publiques
  '/': 'Accueil',
  '/login': 'Connexion',
  '/signup': 'Inscription',
  '/test-auth': 'Test d\'authentification',
  
  // Dashboard principal
  '/dashboard': 'Tableau de bord',
  
  // Profils
  '/dashboard/profile': 'Mon Profil',
  '/dashboard/admin/profile': 'Profil Administrateur',
  '/dashboard/owner/profile': 'Profil Propriétaire',
  '/dashboard/tenant/profile': 'Profil Locataire',
  '/dashboard/advertiser/profile': 'Profil Annonceur',
  
  // Gestion admin
  '/dashboard/admin/cities': 'Gestion des Villes',
  '/dashboard/admin/equipments': 'Gestion des Équipements',
  '/dashboard/admin/characteristics': 'Gestion des Caractéristiques',
  '/dashboard/admin/property-types': 'Gestion des Types de Propriétés',
  '/dashboard/admin/users': 'Gestion des Utilisateurs',
  '/dashboard/admin/properties': 'Gestion des Propriétés',
  '/dashboard/admin/konnect': 'Configuration Konnect',
  '/dashboard/admin/email': 'Configuration Email',
  '/dashboard/admin/seo': 'Gestion SEO',
  '/dashboard/admin/subscriptions': 'Gestion des Abonnements',
  '/dashboard/admin/subscriptions/add': 'Créer un Plan d\'Abonnement',
  '/dashboard/admin/subscriptions/edit': 'Modifier un Plan d\'Abonnement',
  '/dashboard/admin/modals': 'Gestion des Modals',
  '/dashboard/admin/modals/add': 'Créer un Modal',
  '/dashboard/admin/modals/edit': 'Modifier un Modal',
  '/dashboard/admin/analytics': 'Analytics',
  '/dashboard/users': 'Gestion des Utilisateurs',
  
  // Pages Owner
  '/dashboard/add-property': 'Nouvelle propriété',
  '/dashboard/owner/add-property': 'Nouvelle propriété',
  '/dashboard/edit-property': 'Modification propriété',
  '/dashboard/owner/edit-property': 'Modification propriété',
  '/dashboard/owner/properties': 'Mes Propriétés',
  '/dashboard/calendar': 'Calendrier',
  '/dashboard/owner/calendar': 'Calendrier',
  
  // Pages Advertiser
  '/dashboard/advertiser/ads': 'Mes Publicités',
  '/dashboard/advertiser/add-advertisement': 'Créer une Publicité',
  
  // Dashboards par rôle (fallback)
  '/dashboard/admin': 'Tableau de bord Admin',
  '/dashboard/owner': 'Tableau de bord Propriétaire',
  '/dashboard/tenant': 'Tableau de bord Locataire',
  '/dashboard/advertiser': 'Tableau de bord Annonceur',
};

// Configuration des descriptions par route
const PAGE_DESCRIPTIONS: Record<string, string> = {
  // Routes publiques
  '/': 'Découvrez les meilleures locations de vacances en Tunisie',
  '/login': 'Connectez-vous à votre compte Location-vacance.tn',
  '/signup': 'Créez votre compte pour louer ou proposer des locations',
  '/test-auth': 'Page de test pour l\'authentification',
  
  '/dashboard': 'Vue d\'ensemble de votre compte',
  '/dashboard/profile': 'Gérez vos informations personnelles',
  '/dashboard/admin/profile': 'Gérez vos informations personnelles et vos privilèges administrateur',
  '/dashboard/owner/profile': 'Gérez vos informations personnelles et vos contacts pour les locataires',
  '/dashboard/tenant/profile': 'Gérez vos informations personnelles et vos préférences',
  '/dashboard/advertiser/profile': 'Gérez vos informations personnelles et professionnelles',
  '/dashboard/admin/cities': 'Ajoutez et modifiez les villes disponibles',
  '/dashboard/admin/equipments': 'Gérez les équipements des logements',
  '/dashboard/admin/characteristics': 'Gérez les caractéristiques des propriétés',
  '/dashboard/admin/property-types': 'Gérez les types de propriétés disponibles',
  '/dashboard/admin/users': 'Administrez les comptes utilisateurs et leurs rôles',
  '/dashboard/admin/properties': 'Gérez toutes les propriétés de la plateforme',
  '/dashboard/admin/konnect': 'Configurez les paramètres de l\'intégration avec le service de paiement Konnect',
  '/dashboard/admin/email': 'Gérez l\'envoi d\'emails et les paramètres SMTP',
  '/dashboard/admin/seo': 'Optimisez le référencement de vos annonces pour améliorer leur visibilité',
  '/dashboard/admin/subscriptions': 'Gérez les plans d\'abonnement pour les propriétaires et annonceurs',
  '/dashboard/admin/subscriptions/add': 'Définissez les détails du nouveau plan d\'abonnement',
  '/dashboard/admin/subscriptions/edit': 'Modifiez les détails du plan d\'abonnement existant',
  '/dashboard/admin/modals': 'Créez et gérez les modals d\'information pour vos utilisateurs',
  '/dashboard/admin/modals/add': 'Configurez votre modal avec un aperçu en temps réel',
  '/dashboard/admin/modals/edit': 'Modifiez votre modal avec un aperçu en temps réel',
  '/dashboard/admin/analytics': 'Surveillez l\'activité du site en temps réel et les performances',
  '/dashboard/users': 'Administrez les comptes utilisateurs',
  '/dashboard/add-property': 'Créez votre annonce étape par étape',
  '/dashboard/owner/add-property': 'Créez votre annonce étape par étape',
  '/dashboard/edit-property': 'Modifiez votre annonce étape par étape',
  '/dashboard/owner/edit-property': 'Modifiez votre annonce étape par étape',
  '/dashboard/owner/properties': 'Gérez vos propriétés et leurs statuts',
  '/dashboard/calendar': 'Gérez la disponibilité de vos propriétés',
  '/dashboard/owner/calendar': 'Gérez la disponibilité de vos propriétés',
  '/dashboard/advertiser/ads': 'Gérez vos campagnes publicitaires et leurs performances',
  '/dashboard/advertiser/add-advertisement': 'Créez une nouvelle campagne publicitaire pour promouvoir votre entreprise',
};

export const usePageTitle = () => {
  const location = useLocation();
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [customDescription, setCustomDescription] = useState<string | null>(null);
  
  const { title, description } = useMemo(() => {
    const pathname = location.pathname;
    
    // Si un titre personnalisé est défini, l'utiliser
    if (customTitle) {
      return { title: customTitle, description: customDescription || '' };
    }
    
    // Chercher une correspondance exacte d'abord
    let title = PAGE_TITLES[pathname];
    let description = PAGE_DESCRIPTIONS[pathname];
    
    // Gestion spéciale pour les routes dynamiques d'édition (AVANT la correspondance par préfixe)
    if (!title && pathname.includes('/edit/')) {
      if (pathname.includes('/subscriptions/edit/')) {
        title = PAGE_TITLES['/dashboard/admin/subscriptions/edit'];
        description = PAGE_DESCRIPTIONS['/dashboard/admin/subscriptions/edit'];
      } else if (pathname.includes('/modals/edit/')) {
        title = PAGE_TITLES['/dashboard/admin/modals/edit'];
        description = PAGE_DESCRIPTIONS['/dashboard/admin/modals/edit'];
      } else if (pathname.includes('/edit-property/')) {
        title = PAGE_TITLES['/dashboard/edit-property'];
        description = PAGE_DESCRIPTIONS['/dashboard/edit-property'];
      }
    }
    
    // Si pas de correspondance exacte et pas de route dynamique, chercher par préfixe
    if (!title) {
      const matchingKey = Object.keys(PAGE_TITLES).find(key => 
        pathname.startsWith(key) && key !== '/dashboard'
      );
      
      if (matchingKey) {
        title = PAGE_TITLES[matchingKey];
        description = PAGE_DESCRIPTIONS[matchingKey];
      }
    }
    
    // Fallback par défaut
    if (!title) {
      title = 'Tableau de bord';
      description = 'Vue d\'ensemble de votre compte';
    }
    
    return { title, description };
  }, [location.pathname, customTitle, customDescription]);
  
  // Mettre à jour le titre du document à chaque changement
  useEffect(() => {
    if (title) {
      document.title = `${title} - Location-vacance.tn`;
    }
  }, [title]);
  
  const setPageTitle = useCallback((newTitle: string) => {
    setCustomTitle(newTitle);
  }, []);
  
  const setPageDescription = useCallback((newDescription: string) => {
    setCustomDescription(newDescription);
  }, []);
  
  return { title, description, setPageTitle, setPageDescription };
};
