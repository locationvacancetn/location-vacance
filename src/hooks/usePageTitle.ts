import { useLocation } from 'react-router-dom';
import { useMemo } from 'react';

// Configuration des titres par route
const PAGE_TITLES: Record<string, string> = {
  // Dashboard principal
  '/dashboard': 'Tableau de bord',
  
  // Profils
  '/dashboard/profile': 'Mon Profil',
  
  // Gestion admin
  '/dashboard/admin/cities': 'Gestion des Villes',
  '/dashboard/admin/equipments': 'Gestion des Équipements',
  '/dashboard/admin/property-types': 'Gestion des Types de Propriétés',
  '/dashboard/users': 'Gestion des Utilisateurs',
  
  // Pages Owner
  '/dashboard/owner/add-property': 'Nouvelle propriété',
  
  // Dashboards par rôle (fallback)
  '/dashboard/admin': 'Tableau de bord Admin',
  '/dashboard/owner': 'Tableau de bord Propriétaire',
  '/dashboard/tenant': 'Tableau de bord Locataire',
  '/dashboard/advertiser': 'Tableau de bord Annonceur',
};

// Configuration des descriptions par route
const PAGE_DESCRIPTIONS: Record<string, string> = {
  '/dashboard': 'Vue d\'ensemble de votre compte',
  '/dashboard/profile': 'Gérez vos informations personnelles',
  '/dashboard/admin/cities': 'Ajoutez et modifiez les villes disponibles',
  '/dashboard/admin/equipments': 'Gérez les équipements des logements',
  '/dashboard/admin/property-types': 'Gérez les types de propriétés disponibles (villa, appartement, chalet...)',
  '/dashboard/users': 'Administrez les comptes utilisateurs',
  '/dashboard/owner/add-property': 'Créez votre annonce étape par étape',
};

export const usePageTitle = () => {
  const location = useLocation();
  
  const { title, description } = useMemo(() => {
    const pathname = location.pathname;
    
    // Chercher une correspondance exacte d'abord
    let title = PAGE_TITLES[pathname];
    let description = PAGE_DESCRIPTIONS[pathname];
    
    // Si pas de correspondance exacte, chercher par préfixe
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
  }, [location.pathname]);
  
  return { title, description };
};
