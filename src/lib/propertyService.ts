import { supabase } from '@/integrations/supabase/client';
import { PropertyFormData } from '@/pages/dashboard/owner/AddPropertyWizard';
import { SlugService } from './slugService';

export interface Property {
  id: string;
  title: string;
  description: string;
  slug: string; // Ajout du champ slug
  city_id: string;
  region_id: string;
  property_type_id: string;
  location: string;
  longitude: string;
  latitude: string;
  max_guests: number;
  bedrooms: number;
  bathrooms: number;
  price_per_night: number;
  min_nights: number;
  check_in_time: string;
  check_out_time: string;
  images: string[];
  amenities: string[];
  equipment_ids: string[];
  characteristic_ids: string[];
  smoking_allowed: boolean;
  pets_allowed: boolean;
  parties_allowed: boolean;
  children_allowed: boolean;
  status: 'pending_payment' | 'pending_approval' | 'active' | 'inactive';
  is_public: boolean;
  created_at: string;
  updated_at: string;
  // Champs ajoutés pour l'affichage
  property_type?: string;
  city_name?: string;
  region_name?: string;
  owner_name?: string;
  owner_avatar_url?: string;
  owner_languages?: string[];
}

export interface PropertyStatusInfo {
  status: string;
  button_text: string;
  button_action: string;
  can_edit: boolean;
}

/**
 * Service pour gérer les propriétés
 */
export class PropertyService {
  /**
   * Uploader les images d'une propriété
   */
  static async uploadPropertyImages(propertyId: string, imageFiles: File[]): Promise<string[]> {
    try {
      const uploadedUrls: string[] = [];
      
      for (let i = 0; i < imageFiles.length; i++) {
        const file = imageFiles[i];
        
        // Valider le fichier
        if (!file.type.startsWith('image/')) {
          throw new Error(`Le fichier ${file.name} n'est pas une image valide`);
        }
        
        if (file.size > 10 * 1024 * 1024) { // 10MB
          throw new Error(`Le fichier ${file.name} est trop volumineux (max 10MB)`);
        }
        
        // Générer un nom de fichier unique
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${i}.${fileExt}`;
        const filePath = `${propertyId}/${fileName}`;
        
        // Upload vers Supabase Storage
        const { data, error } = await supabase.storage
          .from('property-images')
          .upload(filePath, file);
        
        if (error) {
          console.error(`Erreur upload image ${i + 1}:`, error);
          throw new Error(`Erreur lors de l'upload de l'image ${i + 1}: ${error.message}`);
        }
        
        // Récupérer l'URL publique
        const { data: urlData } = supabase.storage
          .from('property-images')
          .getPublicUrl(filePath);
        
        uploadedUrls.push(urlData.publicUrl);
      }
      
      return uploadedUrls;
    } catch (error) {
      console.error('Erreur dans PropertyService.uploadPropertyImages:', error);
      throw error;
    }
  }

  /**
   * Supprimer les images d'une propriété
   */
  static async deletePropertyImages(propertyId: string): Promise<void> {
    try {
      const { error } = await supabase.storage
        .from('property-images')
        .remove([`${propertyId}/`]);
      
      if (error) {
        console.error('Erreur lors de la suppression des images:', error);
        // Ne pas lever d'erreur car ce n'est pas critique
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.deletePropertyImages:', error);
      // Ne pas lever d'erreur car ce n'est pas critique
    }
  }

  /**
   * Supprimer des images spécifiques d'une propriété
   */
  static async deleteSpecificImages(propertyId: string, imageUrls: string[]): Promise<void> {
    try {
      if (imageUrls.length === 0) return;
      
      // Extraire les noms de fichiers des URLs
      const filePaths = imageUrls.map(url => {
        // Extraire le nom du fichier depuis l'URL
        const urlParts = url.split('/');
        const fileName = urlParts[urlParts.length - 1];
        return `${propertyId}/${fileName}`;
      });
      
      const { error } = await supabase.storage
        .from('property-images')
        .remove(filePaths);
      
      if (error) {
        console.error('Erreur lors de la suppression des images spécifiques:', error);
        // Ne pas lever d'erreur car ce n'est pas critique
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.deleteSpecificImages:', error);
      // Ne pas lever d'erreur car ce n'est pas critique
    }
  }

  /**
   * Créer une nouvelle propriété avec validation complète
   */
  static async createProperty(formData: PropertyFormData): Promise<Property> {
    let propertyId: string | null = null;
    
    try {
      // Vérifier l'unicité du titre AVANT création
      const isTitleAvailable = await this.checkTitleAvailability(formData.name);
      if (!isTitleAvailable) {
        throw new Error('Ce nom de propriété existe déjà. Veuillez choisir un autre nom.');
      }

      // Valider les contraintes de base de données
      if (formData.name.trim().length < 5) {
        throw new Error('Le nom doit contenir au moins 5 caractères');
      }
      
      if (formData.description.trim().length < 20) {
        throw new Error('La description doit contenir au moins 20 caractères');
      }
      
      if (formData.maxGuests < 1 || formData.maxGuests > 50) {
        throw new Error('Le nombre d\'invités doit être entre 1 et 50');
      }
      
      if (formData.bedrooms < 1 || formData.bedrooms > 20) {
        throw new Error('Le nombre de chambres doit être entre 1 et 20');
      }
      
      if (formData.bathrooms < 1 || formData.bathrooms > 20) {
        throw new Error('Le nombre de salles de bain doit être entre 1 et 20');
      }
      
      if (formData.basePrice < 10) {
        throw new Error('Le prix doit être supérieur à 10 DT');
      }
      
      if (formData.minNights < 1 || formData.minNights > 365) {
        throw new Error('Le nombre de nuits minimum doit être entre 1 et 365');
      }

      // Validation obligatoire des coordonnées GPS
      if (!formData.longitude || formData.longitude.trim() === '') {
        throw new Error('La longitude est obligatoire');
      }
      
      if (!formData.latitude || formData.latitude.trim() === '') {
        throw new Error('La latitude est obligatoire');
      }

      // Validation du format des coordonnées
      const longitudeRegex = /^-?[0-9]+\.?[0-9]*$/;
      if (!longitudeRegex.test(formData.longitude)) {
        throw new Error('Format de longitude invalide. Utilisez le format: -180.123456');
      }
      
      const latitudeRegex = /^-?[0-9]+\.?[0-9]*$/;
      if (!latitudeRegex.test(formData.latitude)) {
        throw new Error('Format de latitude invalide. Utilisez le format: 36.123456');
      }

      // Validation des plages de coordonnées GPS
      const longitude = parseFloat(formData.longitude);
      const latitude = parseFloat(formData.latitude);
      
      if (isNaN(longitude) || isNaN(latitude)) {
        throw new Error('Les coordonnées GPS doivent être des nombres valides');
      }
      
      if (longitude < -180 || longitude > 180) {
        throw new Error('La longitude doit être entre -180 et 180');
      }
      
      if (latitude < -90 || latitude > 90) {
        throw new Error('La latitude doit être entre -90 et 90');
      }

      // Validation de l'adresse (optionnelle)
      if (formData.address && formData.address.trim() !== '') {
        if (formData.address.trim().length < 3) {
          throw new Error('L\'adresse doit contenir au moins 3 caractères');
        }
        
        if (formData.address.length > 500) {
          throw new Error('L\'adresse ne peut pas dépasser 500 caractères');
        }
      }

      // Récupérer l'ID de l'utilisateur connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non connecté');
      }

      // 1. D'abord créer la propriété sans images
      const propertyData = {
        p_title: formData.name,
        p_description: formData.description,
        p_city_id: formData.cityId,
        p_region_id: formData.regionId,
        p_property_type_id: formData.propertyTypeId,
        p_address: formData.address,
        p_longitude: formData.longitude || '',
        p_latitude: formData.latitude || '',
        p_max_guests: formData.maxGuests,
        p_bedrooms: formData.bedrooms,
        p_bathrooms: formData.bathrooms,
        p_price_per_night: formData.basePrice,
        p_min_nights: formData.minNights,
        p_check_in_time: formData.checkInTime,
        p_check_out_time: formData.checkOutTime,
        p_images: [], // Images vides pour l'instant
        p_equipment_ids: formData.equipmentIds,
        p_characteristic_ids: formData.characteristicIds,
        p_smoking_allowed: formData.smokingAllowed,
        p_pets_allowed: formData.petsAllowed,
        p_parties_allowed: formData.partiesAllowed,
        p_children_allowed: formData.childrenAllowed,
        p_owner_id: user.id
      };

      // Appeler la fonction create_property
      const { data, error } = await supabase.rpc('create_property', propertyData);

      if (error) {
        console.error('Erreur lors de la création de la propriété:', error);
        throw new Error(`Erreur lors de la création: ${error.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée par la fonction create_property');
      }

      propertyId = data;

      // 2. Uploader les images si elles existent
      let imageUrls: string[] = [];
      if (formData.photos && formData.photos.length > 0) {
        try {
          imageUrls = await this.uploadPropertyImages(propertyId, formData.photos);
          
          // 3. Mettre à jour la propriété avec les URLs des images
          const { error: updateError } = await supabase
            .from('properties')
            .update({ images: imageUrls })
            .eq('id', propertyId);
          
          if (updateError) {
            console.error('Erreur lors de la mise à jour des images:', updateError);
            // Supprimer les images uploadées en cas d'erreur
            await this.deletePropertyImages(propertyId);
            throw new Error(`Erreur lors de la mise à jour des images: ${updateError.message}`);
          }
        } catch (uploadError) {
          console.error('Erreur lors de l\'upload des images:', uploadError);
          // Supprimer la propriété créée en cas d'erreur d'upload
          await supabase.from('properties').delete().eq('id', propertyId);
          throw uploadError;
        }
      }

      // Récupérer la propriété créée avec les images
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la propriété:', fetchError);
        // Supprimer les images en cas d'erreur
        if (imageUrls.length > 0) {
          await this.deletePropertyImages(propertyId);
        }
        throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
      }

      return property;
    } catch (error) {
      console.error('Erreur dans PropertyService.createProperty:', error);
      
      // Nettoyage en cas d'erreur
      if (propertyId) {
        try {
          await this.deletePropertyImages(propertyId);
          await supabase.from('properties').delete().eq('id', propertyId);
        } catch (cleanupError) {
          console.error('Erreur lors du nettoyage:', cleanupError);
        }
      }
      
      throw error;
    }
  }

  /**
   * Mettre à jour le statut d'une propriété
   */
  static async updatePropertyStatus(
    propertyId: string, 
    newStatus: string, 
    adminId?: string
  ): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_property_status', {
        property_uuid: propertyId,
        new_status: newStatus,
        admin_id: adminId || null
      });

      if (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.updatePropertyStatus:', error);
      throw error;
    }
  }

  /**
   * Obtenir les informations de statut d'une propriété
   */
  static async getPropertyStatusInfo(propertyId: string): Promise<PropertyStatusInfo> {
    try {
      const { data, error } = await supabase.rpc('get_property_status_info', {
        property_uuid: propertyId
      });

      if (error) {
        console.error('Erreur lors de la récupération du statut:', error);
        throw new Error(`Erreur lors de la récupération: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur dans PropertyService.getPropertyStatusInfo:', error);
      throw error;
    }
  }

  /**
   * Récupérer les propriétés d'un propriétaire
   */
  static async getOwnerProperties(): Promise<Property[]> {
    try {
      // Récupérer l'utilisateur actuel
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('Erreur d\'authentification:', authError);
        throw new Error('Utilisateur non authentifié');
      }

      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_types!inner(name),
          cities!inner(name),
          regions!inner(name)
        `)
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des propriétés:', error);
        throw new Error(`Erreur lors de la récupération: ${error.message}`);
      }

      // Enrichir les données avec les noms des relations
      const enrichedData = data?.map(property => ({
        ...property,
        property_type: property.property_types?.name,
        city_name: property.cities?.name,
        region_name: property.regions?.name,
      })) || [];

      return enrichedData;
    } catch (error) {
      console.error('Erreur dans PropertyService.getOwnerProperties:', error);
      throw error;
    }
  }

  /**
   * Récupérer les propriétés publiques (pour les visiteurs)
   */
  static async getPublicProperties(): Promise<Property[]> {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('status', 'active')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors de la récupération des propriétés publiques:', error);
        throw new Error(`Erreur lors de la récupération: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error('Erreur dans PropertyService.getPublicProperties:', error);
      throw error;
    }
  }

  /**
   * Vérifier si une propriété est visible
   */
  static async isPropertyVisible(propertyId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('is_property_visible', {
        property_uuid: propertyId
      });

      if (error) {
        console.error('Erreur lors de la vérification de visibilité:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Erreur dans PropertyService.isPropertyVisible:', error);
      return false;
    }
  }

  /**
   * Mettre à jour une propriété existante
   */
  static async updateProperty(propertyId: string, formData: PropertyFormData, finalImageUrls?: string[]): Promise<Property> {
    try {
      // Vérifier si l'utilisateur actuel est admin
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Utilisateur non authentifié');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      const isAdmin = profile?.role === 'admin';

      // Vérifier l'unicité du titre AVANT modification (en excluant la propriété actuelle)
      const isTitleAvailable = await this.checkTitleAvailability(formData.name, propertyId);
      if (!isTitleAvailable) {
        throw new Error('Ce nom de propriété existe déjà. Veuillez choisir un autre nom.');
      }

      // Valider les contraintes de base de données
      if (formData.name.trim().length < 5) {
        throw new Error('Le nom doit contenir au moins 5 caractères');
      }
      
      if (formData.description.trim().length < 20) {
        throw new Error('La description doit contenir au moins 20 caractères');
      }
      
      if (formData.maxGuests < 1 || formData.maxGuests > 50) {
        throw new Error('Le nombre d\'invités doit être entre 1 et 50');
      }
      
      if (formData.bedrooms < 1 || formData.bedrooms > 20) {
        throw new Error('Le nombre de chambres doit être entre 1 et 20');
      }
      
      if (formData.bathrooms < 1 || formData.bathrooms > 20) {
        throw new Error('Le nombre de salles de bain doit être entre 1 et 20');
      }
      
      if (formData.basePrice < 10) {
        throw new Error('Le prix doit être supérieur à 10 DT');
      }
      
      if (formData.minNights < 1 || formData.minNights > 365) {
        throw new Error('Le nombre de nuits minimum doit être entre 1 et 365');
      }

      // Validation obligatoire des coordonnées GPS
      if (!formData.longitude || formData.longitude.trim() === '') {
        throw new Error('La longitude est obligatoire');
      }
      
      if (!formData.latitude || formData.latitude.trim() === '') {
        throw new Error('La latitude est obligatoire');
      }

      // Validation du format des coordonnées
      const longitudeRegex = /^-?[0-9]+\.?[0-9]*$/;
      if (!longitudeRegex.test(formData.longitude)) {
        throw new Error('Format de longitude invalide. Utilisez le format: -180.123456');
      }
      
      const latitudeRegex = /^-?[0-9]+\.?[0-9]*$/;
      if (!latitudeRegex.test(formData.latitude)) {
        throw new Error('Format de latitude invalide. Utilisez le format: 36.123456');
      }

      // Validation des plages de coordonnées GPS
      const longitude = parseFloat(formData.longitude);
      const latitude = parseFloat(formData.latitude);
      
      if (isNaN(longitude) || isNaN(latitude)) {
        throw new Error('Les coordonnées GPS doivent être des nombres valides');
      }
      
      if (longitude < -180 || longitude > 180) {
        throw new Error('La longitude doit être entre -180 et 180');
      }
      
      if (latitude < -90 || latitude > 90) {
        throw new Error('La latitude doit être entre -90 et 90');
      }

      // Validation de l'adresse (optionnelle)
      if (formData.address && formData.address.trim() !== '') {
        if (formData.address.trim().length < 3) {
          throw new Error('L\'adresse doit contenir au moins 3 caractères');
        }
        
        if (formData.address.length > 500) {
          throw new Error('L\'adresse ne peut pas dépasser 500 caractères');
        }
      }

      // 1. Mettre à jour les données de base de la propriété
      const propertyData = {
        p_title: formData.name,
        p_description: formData.description,
        p_city_id: formData.cityId,
        p_region_id: formData.regionId,
        p_property_type_id: formData.propertyTypeId,
        p_address: formData.address,
        p_longitude: formData.longitude || '',
        p_latitude: formData.latitude || '',
        p_max_guests: formData.maxGuests,
        p_bedrooms: formData.bedrooms,
        p_bathrooms: formData.bathrooms,
        p_price_per_night: formData.basePrice,
        p_min_nights: formData.minNights,
        p_check_in_time: formData.checkInTime,
        p_check_out_time: formData.checkOutTime,
        p_equipment_ids: formData.equipmentIds,
        p_characteristic_ids: formData.characteristicIds,
        p_smoking_allowed: formData.smokingAllowed,
        p_pets_allowed: formData.petsAllowed,
        p_parties_allowed: formData.partiesAllowed,
        p_children_allowed: formData.childrenAllowed,
        // Ajouter l'owner_id pour les admins
        ...(isAdmin && formData.ownerId && { p_owner_id: formData.ownerId })
      };

      // Appeler la fonction appropriée selon le rôle
      const rpcFunction = isAdmin ? 'update_property_admin' : 'update_property';
      const { data, error } = await supabase.rpc(rpcFunction, {
        property_uuid: propertyId,
        ...propertyData
      });

      if (error) {
        console.error('Erreur lors de la mise à jour de la propriété:', error);
        throw new Error(`Erreur lors de la mise à jour: ${error.message}`);
      }

      if (!data) {
        throw new Error('Aucune donnée retournée par la fonction update_property');
      }

      // 2. Gérer la synchronisation complète des images
      try {
        let finalImages: string[] = [];
        
        // Récupérer les images actuelles pour identifier celles à supprimer
        const { data: currentProperty } = await supabase
          .from('properties')
          .select('images')
          .eq('id', propertyId)
          .single();
        
        const currentImages = currentProperty?.images || [];
        
        if (finalImageUrls && finalImageUrls.length > 0) {
          // Mode édition : utiliser les images finales (existantes restantes)
          finalImages = [...finalImageUrls];
        }
        
        // Ajouter les nouvelles images si il y en a
        if (formData.photos && formData.photos.length > 0) {
          const newImageUrls = await this.uploadPropertyImages(propertyId, formData.photos);
          finalImages = [...finalImages, ...newImageUrls];
        }
        
        // Vérifier la contrainte de nombre d'images
        if (finalImages.length < 5) {
          throw new Error('Minimum 5 images requis. Ajoutez plus d\'images ou gardez les existantes.');
        }
        
        if (finalImages.length > 20) {
          throw new Error('Maximum 20 images autorisées. Supprimez quelques images.');
        }
        
        // Identifier les images supprimées pour les supprimer du storage
        const imagesToDelete = currentImages.filter(img => !finalImages.includes(img));
        if (imagesToDelete.length > 0) {
          await this.deleteSpecificImages(propertyId, imagesToDelete);
        }
        
        // Mettre à jour la propriété avec la liste finale des images
        const { error: updateError } = await supabase
          .from('properties')
          .update({ images: finalImages })
          .eq('id', propertyId);
        
        if (updateError) {
          console.error('Erreur lors de la mise à jour des images:', updateError);
          throw new Error(`Erreur lors de la mise à jour des images: ${updateError.message}`);
        }
      } catch (imageError) {
        console.error('Erreur lors de la gestion des images:', imageError);
        throw imageError;
      }

      // Récupérer la propriété mise à jour
      const { data: property, error: fetchError } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (fetchError) {
        console.error('Erreur lors de la récupération de la propriété:', fetchError);
        throw new Error(`Erreur lors de la récupération: ${fetchError.message}`);
      }

      return property;
    } catch (error) {
      console.error('Erreur dans PropertyService.updateProperty:', error);
      throw error;
    }
  }

  /**
   * Récupérer une propriété par son ID
   */
  static async getPropertyById(propertyId: string): Promise<Property> {
    try {
      // Récupérer les données de base de la propriété
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', propertyId)
        .single();

      if (error) {
        console.error('Erreur lors de la récupération de la propriété:', error);
        throw new Error(`Erreur lors de la récupération: ${error.message}`);
      }

      if (!data) {
        throw new Error('Propriété non trouvée');
      }

      // Récupérer les informations des relations séparément
      let propertyType = 'Type non spécifié';
      let cityName = 'Ville non spécifiée';
      let regionName = 'Région non spécifiée';
      let ownerName = 'Propriétaire';

      // Récupérer le type de propriété
      if (data.property_type_id) {
        try {
          const { data: typeData } = await supabase
            .from('property_types')
            .select('name')
            .eq('id', data.property_type_id)
            .single();
          if (typeData?.name) {
            propertyType = typeData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer la ville
      if (data.city_id) {
        try {
          const { data: cityData } = await supabase
            .from('cities')
            .select('name')
            .eq('id', data.city_id)
            .single();
          if (cityData?.name) {
            cityName = cityData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer la région
      if (data.region_id) {
        try {
          const { data: regionData } = await supabase
            .from('regions')
            .select('name')
            .eq('id', data.region_id)
            .single();
          if (regionData?.name) {
            regionName = regionData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer les caractéristiques de la propriété
      let characteristicIds: string[] = [];
      try {
        const { data: characteristicsData } = await supabase
          .from('property_characteristic_assignments')
          .select('characteristic_id')
          .eq('property_id', propertyId);
        
        if (characteristicsData) {
          characteristicIds = characteristicsData.map(item => item.characteristic_id);
        }
      } catch (e) {

      }

      // Récupérer les informations du propriétaire
      // owner_id dans properties fait référence à profiles.user_id, pas profiles.id
      const ownerUserId = data.owner_id;
      let ownerAvatarUrl = '';
      let ownerLanguages: string[] = [];
      
      if (ownerUserId) {
        try {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, spoken_languages')
            .eq('user_id', ownerUserId)
            .single();
            
          
          if (ownerError) {

          } else if (ownerData?.full_name) {
            ownerName = ownerData.full_name;
          }
          if (ownerData?.avatar_url) {
            ownerAvatarUrl = ownerData.avatar_url;
          }
          if (ownerData?.spoken_languages) {
            ownerLanguages = ownerData.spoken_languages;
          }
        } catch (e) {

        }
      }

      // Construire la localisation
      let location = 'Localisation non spécifiée';
      if (cityName !== 'Ville non spécifiée' && regionName !== 'Région non spécifiée') {
        location = `${cityName}, ${regionName}`;
      } else if (data.location) {
        location = data.location;
      }

      // Transformer les données pour inclure les noms des relations
      const property = {
        ...data,
        property_type: propertyType,
        city_name: cityName,
        region_name: regionName,
        location: location,
        owner_name: ownerName,
        owner_avatar_url: ownerAvatarUrl,
        owner_languages: ownerLanguages,
        characteristic_ids: characteristicIds
      };


      return property;
    } catch (error) {
      console.error('Erreur dans PropertyService.getPropertyById:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un titre de propriété existe déjà
   */
  static async checkTitleAvailability(title: string, excludeId?: string): Promise<boolean> {
    try {
      if (!title || title.trim().length < 3) {
        return true; // Considérer comme disponible si trop court
      }

      const trimmedTitle = title.trim();

      if (excludeId) {
        // Pour l'édition : vérifier s'il existe d'autres propriétés avec ce titre
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .eq('title', trimmedTitle)
          .neq('id', excludeId)
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification du titre:', error);
          throw error;
        }

        // Si aucun résultat, le titre est disponible
        return data?.length === 0;
      } else {
        // Pour la création : vérifier si le titre existe déjà
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .eq('title', trimmedTitle)
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification du titre:', error);
          throw error;
        }

        // Si aucun résultat, le titre est disponible
        return data?.length === 0;
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.checkTitleAvailability:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un slug existe déjà
   */
  static async checkSlugAvailability(slug: string, excludeId?: string): Promise<boolean> {
    try {
      if (!slug || slug.trim().length < 3) {
        return true; // Considérer comme disponible si trop court
      }

      const trimmedSlug = slug.trim();

      if (excludeId) {
        // Pour l'édition : vérifier s'il existe d'autres propriétés avec ce slug
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .eq('slug', trimmedSlug)
          .neq('id', excludeId)
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification du slug:', error);
          throw error;
        }

        // Si aucun résultat, le slug est disponible
        return data?.length === 0;
      } else {
        // Pour la création : vérifier si le slug existe déjà
        const { data, error } = await supabase
          .from('properties')
          .select('id')
          .eq('slug', trimmedSlug)
          .limit(1);

        if (error) {
          console.error('Erreur lors de la vérification du slug:', error);
          throw error;
        }

        // Si aucun résultat, le slug est disponible
        return data?.length === 0;
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.checkSlugAvailability:', error);
      throw error;
    }
  }

  /**
   * Générer un slug unique pour une propriété
   */
  static async generateUniquePropertySlug(
    propertyType: string,
    city: string,
    title: string,
    region?: string | null,
    excludeId?: string
  ): Promise<string> {
    try {
      // Générer le slug de base avec la région
      const baseSlug = SlugService.generatePropertySlug(propertyType, city, title, region);
      
      // Vérifier l'unicité et générer un slug unique si nécessaire
      const uniqueSlug = await SlugService.generateUniqueSlug(
        baseSlug,
        (slug) => this.checkSlugAvailability(slug, excludeId)
      );

      return uniqueSlug;
    } catch (error) {
      console.error('Erreur lors de la génération du slug unique:', error);
      throw error;
    }
  }

  /**
   * Récupérer une propriété par son slug
   */
  static async getPropertyBySlug(slug: string): Promise<Property | null> {
    try {
      if (!slug || slug.trim().length < 3) {
        throw new Error('Slug invalide');
      }

      // Récupérer les données de base de la propriété
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('slug', slug.trim())
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Aucun résultat trouvé
          return null;
        }
        console.error('Erreur lors de la récupération de la propriété par slug:', error);
        throw error;
      }

      if (!data) {
        return null;
      }

      // Récupérer les informations des relations séparément (même logique que getPropertyById)
      let propertyType = 'Type non spécifié';
      let cityName = 'Ville non spécifiée';
      let regionName = 'Région non spécifiée';
      let ownerName = 'Propriétaire';

      // Récupérer le type de propriété
      if (data.property_type_id) {
        try {
          const { data: typeData } = await supabase
            .from('property_types')
            .select('name')
            .eq('id', data.property_type_id)
            .single();
          if (typeData?.name) {
            propertyType = typeData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer la ville
      if (data.city_id) {
        try {
          const { data: cityData } = await supabase
            .from('cities')
            .select('name')
            .eq('id', data.city_id)
            .single();
          if (cityData?.name) {
            cityName = cityData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer la région
      if (data.region_id) {
        try {
          const { data: regionData } = await supabase
            .from('regions')
            .select('name')
            .eq('id', data.region_id)
            .single();
          if (regionData?.name) {
            regionName = regionData.name;
          }
        } catch (e) {

        }
      }

      // Récupérer les caractéristiques de la propriété
      let characteristicIds: string[] = [];
      try {
        const { data: characteristicsData } = await supabase
          .from('property_characteristic_assignments')
          .select('characteristic_id')
          .eq('property_id', data.id);
        
        if (characteristicsData) {
          characteristicIds = characteristicsData.map(item => item.characteristic_id);
        }
      } catch (e) {

      }

      // Récupérer les informations du propriétaire
      const ownerUserId = data.owner_id;
      let ownerAvatarUrl = '';
      let ownerLanguages: string[] = [];
      
      if (ownerUserId) {
        try {
          const { data: ownerData, error: ownerError } = await supabase
            .from('profiles')
            .select('full_name, avatar_url, spoken_languages')
            .eq('user_id', ownerUserId)
            .single();
            
          if (ownerError) {

          } else if (ownerData?.full_name) {
            ownerName = ownerData.full_name;
          }
          if (ownerData?.avatar_url) {
            ownerAvatarUrl = ownerData.avatar_url;
          }
          if (ownerData?.spoken_languages) {
            ownerLanguages = ownerData.spoken_languages;
          }
        } catch (e) {

        }
      }

      // Construire la localisation
      let location = 'Localisation non spécifiée';
      if (cityName !== 'Ville non spécifiée' && regionName !== 'Région non spécifiée') {
        location = `${cityName}, ${regionName}`;
      } else if (data.location) {
        location = data.location;
      }

      // Transformer les données pour inclure les noms des relations
      const property: Property = {
        ...data,
        property_type: propertyType,
        city_name: cityName,
        region_name: regionName,
        location: location,
        owner_name: ownerName,
        owner_avatar_url: ownerAvatarUrl,
        owner_languages: ownerLanguages,
        characteristic_ids: characteristicIds
      };

      return property;
    } catch (error) {
      console.error('Erreur dans PropertyService.getPropertyBySlug:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour le slug d'une propriété
   */
  static async updatePropertySlug(propertyId: string, newSlug: string): Promise<void> {
    try {
      // Valider le slug
      const validation = SlugService.validateSlug(newSlug);
      if (!validation.isValid) {
        throw new Error(`Slug invalide: ${validation.errors.join(', ')}`);
      }

      // Vérifier l'unicité
      const isAvailable = await this.checkSlugAvailability(newSlug, propertyId);
      if (!isAvailable) {
        throw new Error('Ce slug existe déjà. Veuillez choisir un autre slug.');
      }

      // Mettre à jour le slug
      const { error } = await supabase
        .from('properties')
        .update({ slug: newSlug })
        .eq('id', propertyId);

      if (error) {
        console.error('Erreur lors de la mise à jour du slug:', error);
        throw error;
      }
    } catch (error) {
      console.error('Erreur dans PropertyService.updatePropertySlug:', error);
      throw error;
    }
  }

  /**
   * Générer des suggestions de slugs pour une propriété
   */
  static async generateSlugSuggestions(
    propertyType: string,
    city: string,
    title: string,
    region?: string | null,
    count: number = 3
  ): Promise<string[]> {
    try {
      const suggestions = SlugService.generateSlugSuggestions(propertyType, city, title, region, count);
      
      // Vérifier la disponibilité de chaque suggestion
      const availableSuggestions: string[] = [];
      
      for (const suggestion of suggestions) {
        const isAvailable = await this.checkSlugAvailability(suggestion);
        if (isAvailable) {
          availableSuggestions.push(suggestion);
        }
      }

      return availableSuggestions;
    } catch (error) {
      console.error('Erreur lors de la génération des suggestions de slug:', error);
      throw error;
    }
  }
}
