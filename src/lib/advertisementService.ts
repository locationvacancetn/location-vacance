/**
 * Service pour gérer les publicités
 */

import { supabase } from "@/integrations/supabase/client";

export interface AdvertisementData {
  title: string;
  description: string;
  ad_type: 'B2C' | 'B2B';
  image_url?: string;
  link_url: string;
  advertiser_id: string;
  status?: 'pending' | 'approved' | 'rejected';
}

/**
 * Service pour gérer les publicités
 */
export class AdvertisementService {
  /**
   * Uploader une image de publicité
   */
  static async uploadAdvertisementImage(
    advertiserId: string, 
    imageFile: File
  ): Promise<string> {
    try {
      // Valider le fichier
      if (!imageFile.type.startsWith('image/')) {
        throw new Error('Le fichier doit être une image valide');
      }
      
      if (imageFile.size > 5 * 1024 * 1024) { // 5MB max pour les publicités
        throw new Error('L\'image ne doit pas dépasser 5MB');
      }
      
      // Générer un nom de fichier unique
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `ad-${advertiserId}-${Date.now()}.${fileExt}`;
      const filePath = `advertisements/${fileName}`;
      
      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('advertisement-images')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Erreur upload image publicité:', error);
        
        // Messages d'erreur plus spécifiques
        if (error.message.includes('row-level security')) {
          throw new Error('Erreur de permissions. Vérifiez que vous êtes connecté et avez les droits d\'upload.');
        } else if (error.message.includes('duplicate')) {
          throw new Error('Une image avec ce nom existe déjà. Veuillez réessayer.');
        } else if (error.message.includes('size')) {
          throw new Error('L\'image est trop volumineuse. Veuillez choisir une image plus petite.');
        } else {
          throw new Error(`Erreur lors de l'upload de l'image: ${error.message}`);
        }
      }
      
      // Récupérer l'URL publique
      const { data: urlData } = supabase.storage
        .from('advertisement-images')
        .getPublicUrl(filePath);
      
      return urlData.publicUrl;
    } catch (error) {
      console.error('Erreur dans AdvertisementService.uploadAdvertisementImage:', error);
      throw error;
    }
  }

  /**
   * Supprimer une image de publicité
   */
  static async deleteAdvertisementImage(imageUrl: string): Promise<void> {
    try {
      // Extraire le nom du fichier de l'URL
      const fileName = imageUrl.split('/').pop();
      if (!fileName) {
        throw new Error('Impossible d\'extraire le nom du fichier de l\'URL');
      }
      
      const { error } = await supabase.storage
        .from('advertisement-images')
        .remove([`advertisements/${fileName}`]);
      
      if (error) {
        console.error('Erreur suppression image publicité:', error);
        throw new Error(`Erreur lors de la suppression de l'image: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur dans AdvertisementService.deleteAdvertisementImage:', error);
      throw error;
    }
  }

  /**
   * Créer une nouvelle publicité
   */
  static async createAdvertisement(data: AdvertisementData): Promise<void> {
    try {
      const { error } = await supabase
        .from('advertisements')
        .insert({
          title: data.title.trim(),
          description: data.description.trim(),
          ad_type: data.ad_type,
          image_url: data.image_url || null,
          link_url: data.link_url.trim(),
          advertiser_id: data.advertiser_id,
          status: data.status || 'pending'
        });

      if (error) {
        throw new Error(`Erreur lors de la création de la publicité: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur dans AdvertisementService.createAdvertisement:', error);
      throw error;
    }
  }

  /**
   * Remplacer l'image d'une publicité (supprime l'ancienne et upload la nouvelle)
   */
  static async replaceAdvertisementImage(
    advertisementId: string,
    newImageFile: File,
    advertiserId: string
  ): Promise<string> {
    try {
      // 1. Récupérer l'ancienne image
      const { data: advertisement, error: fetchError } = await supabase
        .from('advertisements')
        .select('image_url')
        .eq('id', advertisementId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la publicité: ${fetchError.message}`);
      }

      // 2. Supprimer l'ancienne image si elle existe et est hébergée sur Supabase
      if (advertisement?.image_url && this.isSupabaseImage(advertisement.image_url)) {
        try {
          await this.deleteAdvertisementImage(advertisement.image_url);
        } catch (deleteError) {
          console.warn("Erreur lors de la suppression de l'ancienne image:", deleteError);
          // On continue même si la suppression échoue
        }
      }

      // 3. Uploader la nouvelle image
      const newImageUrl = await this.uploadAdvertisementImage(advertiserId, newImageFile);

      // 4. Mettre à jour la publicité avec la nouvelle URL
      const { error: updateError } = await supabase
        .from('advertisements')
        .update({ image_url: newImageUrl })
        .eq('id', advertisementId);

      if (updateError) {
        // Si la mise à jour échoue, supprimer la nouvelle image
        try {
          await this.deleteAdvertisementImage(newImageUrl);
        } catch (cleanupError) {
          console.error("Erreur lors du nettoyage de la nouvelle image:", cleanupError);
        }
        throw new Error(`Erreur lors de la mise à jour de la publicité: ${updateError.message}`);
      }

      return newImageUrl;
    } catch (error) {
      console.error('Erreur dans AdvertisementService.replaceAdvertisementImage:', error);
      throw error;
    }
  }

  /**
   * Supprimer complètement une publicité (image + enregistrement)
   */
  static async deleteAdvertisement(advertisementId: string): Promise<void> {
    try {
      // 1. Récupérer l'image de la publicité
      const { data: advertisement, error: fetchError } = await supabase
        .from('advertisements')
        .select('image_url')
        .eq('id', advertisementId)
        .single();

      if (fetchError) {
        throw new Error(`Erreur lors de la récupération de la publicité: ${fetchError.message}`);
      }

      // 2. Supprimer l'image si elle existe et est hébergée sur Supabase
      if (advertisement?.image_url && this.isSupabaseImage(advertisement.image_url)) {
        try {
          await this.deleteAdvertisementImage(advertisement.image_url);
        } catch (imageError) {
          console.warn("Erreur lors de la suppression de l'image:", imageError);
          // On continue même si la suppression de l'image échoue
        }
      }

      // 3. Supprimer l'enregistrement de la base de données
      const { error: deleteError } = await supabase
        .from('advertisements')
        .delete()
        .eq('id', advertisementId);

      if (deleteError) {
        throw new Error(`Erreur lors de la suppression de la publicité: ${deleteError.message}`);
      }
    } catch (error) {
      console.error('Erreur dans AdvertisementService.deleteAdvertisement:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour une publicité (sans gestion d'image)
   */
  static async updateAdvertisement(
    advertisementId: string, 
    data: Partial<AdvertisementData>
  ): Promise<void> {
    try {
      const updateData: any = {};
      
      if (data.title !== undefined) updateData.title = data.title.trim();
      if (data.description !== undefined) updateData.description = data.description.trim();
      if (data.ad_type !== undefined) updateData.ad_type = data.ad_type;
      if (data.image_url !== undefined) updateData.image_url = data.image_url;
      if (data.link_url !== undefined) updateData.link_url = data.link_url.trim();
      if (data.status !== undefined) updateData.status = data.status;

      const { error } = await supabase
        .from('advertisements')
        .update(updateData)
        .eq('id', advertisementId);

      if (error) {
        throw new Error(`Erreur lors de la mise à jour de la publicité: ${error.message}`);
      }
    } catch (error) {
      console.error('Erreur dans AdvertisementService.updateAdvertisement:', error);
      throw error;
    }
  }

  /**
   * Vérifier si une URL est une image Supabase
   */
  private static isSupabaseImage(url: string | null): boolean {
    if (!url) return false;
    return url.includes('supabase.co/storage/v1/object/public/advertisement-images/');
  }

  /**
   * Récupérer les publicités d'un annonceur
   */
  static async getAdvertiserAdvertisements(advertiserId: string) {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select('*')
        .eq('advertiser_id', advertiserId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des publicités: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur dans AdvertisementService.getAdvertiserAdvertisements:', error);
      throw error;
    }
  }

  /**
   * Récupérer toutes les publicités approuvées
   */
  static async getApprovedAdvertisements() {
    try {
      const { data, error } = await supabase
        .from('advertisements')
        .select(`
          *,
          profiles:advertiser_id (
            company_name,
            avatar_url
          )
        `)
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(`Erreur lors de la récupération des publicités approuvées: ${error.message}`);
      }

      return data;
    } catch (error) {
      console.error('Erreur dans AdvertisementService.getApprovedAdvertisements:', error);
      throw error;
    }
  }
}
