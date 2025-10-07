/**
 * blogService.ts
 * 
 * Service pour gérer les opérations CRUD sur les blogs avec Supabase.
 * Permet de créer, récupérer, mettre à jour et supprimer des articles de blog
 * ainsi que de gérer les catégories et les FAQs.
 */

import { supabase } from '@/integrations/supabase/client';
import { PostgrestError } from '@supabase/supabase-js';
import { Tables, Json } from '@/integrations/supabase/types';

// Types basés sur les types Supabase générés
export type BlogCategory = Tables<'blog_categories'>;
export type BlogFaq = Tables<'blog_faqs'>;
export type BlogTag = Tables<'blog_tags'>;
export type BlogImage = Tables<'blog_images'>;

// Type pour les blogs avec relations et gestion correcte des liens internes
export type Blog = Omit<Tables<'blogs'>, 'liens_internes'> & {
  // Liens internes avec type plus spécifique
  liens_internes: Record<string, { titre: string; url: string }[]> | string | null;
  // Relations (chargées via jointures)
  blog_categories?: BlogCategory;
  blog_faqs?: BlogFaq[];
  blog_tags?: BlogTag[];
  blog_images?: BlogImage[];
};

// Type pour la création d'un blog (sans les champs générés automatiquement)
export type BlogInput = Omit<Tables<'blogs'>, 'id' | 'date_creation' | 'date_mise_a_jour'>;

// Type pour les FAQ lors de la création
export type BlogFaqInput = Omit<BlogFaq, 'id' | 'blog_id' | 'created_at' | 'updated_at'>;

// Type pour les images supplémentaires lors de la création
export type BlogImageInput = Omit<BlogImage, 'id' | 'blog_id' | 'created_at' | 'updated_at'>;

// Classe pour gérer les opérations sur les blogs
export class BlogService {
  /**
   * Récupère tous les blogs publiés
   */
  static async getPublishedBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(id, nom, slug)
      `)
      .eq('est_publie', true)
      .order('date_publication', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupère les blogs mis en avant
   */
  static async getFeaturedBlogs(limit: number = 5) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(id, nom, slug)
      `)
      .eq('est_publie', true)
      .eq('est_feature', true)
      .order('date_publication', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupère un blog par son slug
   */
  static async getBlogBySlug(slug: string): Promise<Blog | null> {
    try {
      // Nettoyer et valider le slug
      if (!slug || typeof slug !== 'string') {
        throw new Error('Slug invalide ou manquant');
      }
      
      // Vérifier si le slug contient des caractères spéciaux problématiques
      const cleanSlug = decodeURIComponent(slug.trim());
      
      console.log('Récupération du blog avec slug:', cleanSlug);
      
      const { data, error } = await supabase
        .from('blogs')
        .select(`
          *,
          blog_categories(id, nom, slug),
          blog_faqs(id, question, reponse, ordre),
          blog_images(id, url, alt_text, legende, ordre)
        `)
        .eq('slug', cleanSlug)
        .single();
      
      if (error) {
        console.error('Erreur Supabase lors de la récupération du blog:', error);
        throw error;
      }
      
      if (!data) {
        console.log('Aucun blog trouvé avec ce slug');
        throw new Error('Blog non trouvé');
      }
      
      console.log('Blog récupéré avec succès:', data.id, data.titre);
      
      // Convertir le type Json en type plus spécifique pour liens_internes
      const blogData: Blog = {
        ...data,
        liens_internes: data.liens_internes as Record<string, { titre: string; url: string }[]> | string | null
      };
      
      // Récupérer les tags associés
      if (blogData) {
        // Trier les images par ordre
        if (blogData.blog_images) {
          blogData.blog_images.sort((a: any, b: any) => (a.ordre || 0) - (b.ordre || 0));
        }
        
        try {
          const { data: tagsData, error: tagsError } = await supabase
            .from('blog_tags_relation')
            .select(`
              blog_tags(id, nom, slug)
            `)
            .eq('blog_id', blogData.id);
          
          if (tagsError) {
            console.error('Erreur lors de la récupération des tags:', tagsError);
          } else if (tagsData) {
            blogData.blog_tags = tagsData.map(tag => tag.blog_tags);
          }
        } catch (tagErr) {
          console.error('Exception lors de la récupération des tags:', tagErr);
          // Ne pas faire échouer la requête principale si les tags échouent
        }
        
        // Vérifier si liens_internes est défini et s'il est un JSON valide
        if (blogData.liens_internes) {
          try {
            // S'il s'agit d'une chaîne, tenter de la convertir en objet
            if (typeof blogData.liens_internes === 'string') {
              blogData.liens_internes = JSON.parse(blogData.liens_internes);
            }
          } catch (e) {
            console.error('Erreur de conversion des liens internes:', e);
            blogData.liens_internes = {}; // Fournir un objet vide en cas d'erreur
          }
        } else {
          blogData.liens_internes = {}; // Initialiser à un objet vide si nul
        }
      }
      
      return blogData;
    } catch (error) {
      console.error('Exception dans getBlogBySlug:', error);
      throw error;
    }
  }

  /**
   * Récupère un blog par son ID
   */
  static async getBlogById(id: number) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(id, nom, slug),
        blog_faqs(id, question, reponse, ordre),
        blog_images(id, url, alt_text, legende, ordre)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    // Récupérer les tags associés
    if (data) {
      const { data: tagsData, error: tagsError } = await supabase
        .from('blog_tags_relation')
        .select(`
          blog_tags(id, nom, slug)
        `)
        .eq('blog_id', data.id);
      
      if (!tagsError && tagsData) {
        data.blog_tags = tagsData.map(tag => tag.blog_tags);
      }
    }
    
    return data;
  }

  /**
   * Récupère tous les blogs (admin uniquement)
   */
  static async getAllBlogs() {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(id, nom, slug)
      `)
      .order('date_creation', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Crée un nouveau blog
   */
  static async createBlog(blog: BlogInput, faqs?: BlogFaqInput[], tags?: number[], images?: BlogImageInput[]): Promise<{ data: Blog | null, error: PostgrestError | null }> {
    // Si la date de publication est définie et que le blog est publié, définir la date actuelle
    if (blog.est_publie && !blog.date_publication) {
      blog.date_publication = new Date().toISOString();
    }

    // Ne pas inclure les champs avec des valeurs par défaut
    const { date_creation, date_mise_a_jour, ...blogData } = blog;

    // Démarrer une transaction pour enregistrer le blog et ses relations
    const { data, error } = await supabase
      .from('blogs')
      .insert(blogData)
      .select()
      .single();
    
    if (error || !data) {
      return { data: null, error };
    }
    
    // Enregistrer les FAQs si fournies
    if (faqs && faqs.length > 0) {
      const faqsWithBlogId = faqs.map((faq, index) => ({
        blog_id: data.id,
        question: faq.question,
        reponse: faq.reponse,
        ordre: faq.ordre || index
      }));
      
      const { error: faqError } = await supabase
        .from('blog_faqs')
        .insert(faqsWithBlogId);
      
      if (faqError) {
        console.error("Erreur lors de l'ajout des FAQs:", faqError);
      }
    }
    
    // Enregistrer les relations avec les tags si fournis
    if (tags && tags.length > 0) {
      const tagRelations = tags.map(tagId => ({
        blog_id: data.id,
        tag_id: tagId
      }));
      
      const { error: tagError } = await supabase
        .from('blog_tags_relation')
        .insert(tagRelations);
      
      if (tagError) {
        console.error("Erreur lors de l'ajout des tags:", tagError);
      }
    }
    
    // Enregistrer les images supplémentaires si fournies
    if (images && images.length > 0) {
      const imagesWithBlogId = images.map(image => ({
        blog_id: data.id,
        url: image.url,
        alt_text: image.alt_text,
        legende: image.legende,
        ordre: image.ordre
      }));
      
      const { error: imagesError } = await supabase
        .from('blog_images')
        .insert(imagesWithBlogId);
      
      if (imagesError) {
        console.error("Erreur lors de l'ajout des images supplémentaires:", imagesError);
      }
    }
    
    return { data, error: null };
  }

  /**
   * Met à jour un blog existant
   */
  static async updateBlog(id: number, blog: Partial<BlogInput>, faqs?: BlogFaqInput[], tags?: number[], images?: BlogImageInput[]): Promise<{ data: Blog | null, error: PostgrestError | null }> {
    // Si le blog passe de non publié à publié, définir la date de publication
    if (blog.est_publie && !blog.date_publication) {
      blog.date_publication = new Date().toISOString();
    }

    // Ne pas inclure les champs avec des valeurs par défaut ou des triggers
    const { date_creation, date_mise_a_jour, ...blogData } = blog;

    const { data, error } = await supabase
      .from('blogs')
      .update(blogData)
      .eq('id', id)
      .select()
      .single();
    
    if (error || !data) {
      return { data: null, error };
    }
    
    // Mettre à jour les FAQs si fournies
    if (faqs) {
      // Supprimer les FAQs existantes
      await supabase
        .from('blog_faqs')
        .delete()
        .eq('blog_id', id);
      
      // Ajouter les nouvelles FAQs
      if (faqs.length > 0) {
        const faqsWithBlogId = faqs.map((faq, index) => ({
          blog_id: id,
          question: faq.question,
          reponse: faq.reponse,
          ordre: faq.ordre || index
        }));
        
        const { error: faqError } = await supabase
          .from('blog_faqs')
          .insert(faqsWithBlogId);
        
        if (faqError) {
          console.error("Erreur lors de la mise à jour des FAQs:", faqError);
        }
      }
    }
    
    // Mettre à jour les tags si fournis
    if (tags) {
      // Supprimer les relations existantes
      await supabase
        .from('blog_tags_relation')
        .delete()
        .eq('blog_id', id);
      
      // Ajouter les nouvelles relations
      if (tags.length > 0) {
        const tagRelations = tags.map(tagId => ({
          blog_id: id,
          tag_id: tagId
        }));
        
        const { error: tagError } = await supabase
          .from('blog_tags_relation')
          .insert(tagRelations);
        
        if (tagError) {
          console.error("Erreur lors de la mise à jour des tags:", tagError);
        }
      }
    }
    
    // Mettre à jour les images supplémentaires si fournies
    if (images) {
      // Supprimer les images existantes
      await supabase
        .from('blog_images')
        .delete()
        .eq('blog_id', id);
      
      // Ajouter les nouvelles images
      if (images.length > 0) {
        const imagesWithBlogId = images.map(image => ({
          blog_id: id,
          url: image.url,
          alt_text: image.alt_text,
          legende: image.legende,
          ordre: image.ordre
        }));
        
        const { error: imagesError } = await supabase
          .from('blog_images')
          .insert(imagesWithBlogId);
        
        if (imagesError) {
          console.error("Erreur lors de la mise à jour des images supplémentaires:", imagesError);
        }
      }
    }
    
    return { data, error: null };
  }

  /**
   * Supprime un blog et toutes ses images associées
   */
  static async deleteBlog(id: number) {
    try {
      // 1. Récupérer toutes les images associées au blog avant suppression
      const { data: blogImages, error: imagesError } = await supabase
        .from('blog_images')
        .select('url')
        .eq('blog_id', id);

      if (imagesError) {
        console.error("Erreur lors de la récupération des images:", imagesError);
        return { error: imagesError };
      }

      // 2. Récupérer l'image principale du blog
      const { data: blog, error: blogError } = await supabase
        .from('blogs')
        .select('image_principale')
        .eq('id', id)
        .single();

      if (blogError) {
        console.error("Erreur lors de la récupération du blog:", blogError);
        return { error: blogError };
      }

      // 3. Supprimer les fichiers du storage Supabase
      const filesToDelete: string[] = [];

      // Ajouter l'image principale si elle existe
      if (blog.image_principale) {
        const mainImagePath = this.extractStoragePath(blog.image_principale);
        if (mainImagePath) {
          filesToDelete.push(mainImagePath);
        }
      }

      // Ajouter les images supplémentaires
      if (blogImages && blogImages.length > 0) {
        blogImages.forEach(image => {
          const imagePath = this.extractStoragePath(image.url);
          if (imagePath) {
            filesToDelete.push(imagePath);
          }
        });
      }

      // Supprimer tous les fichiers du storage
      if (filesToDelete.length > 0) {
        const { error: storageError } = await supabase.storage
          .from('blogs')
          .remove(filesToDelete);

        if (storageError) {
          console.error("Erreur lors de la suppression des fichiers du storage:", storageError);
          // On continue quand même la suppression du blog même si les fichiers n'ont pas pu être supprimés
        }
      }

      // 4. Supprimer le blog (les FAQs, images et relations tags seront supprimées automatiquement grâce aux contraintes ON DELETE CASCADE)
      const { error } = await supabase
        .from('blogs')
        .delete()
        .eq('id', id);
      
      return { error };
    } catch (error) {
      console.error("Erreur lors de la suppression du blog:", error);
      return { error: error as PostgrestError };
    }
  }

  /**
   * Extrait le chemin du fichier depuis une URL Supabase Storage
   */
  private static extractStoragePath(url: string): string | null {
    try {
      // URL format: https://[project].supabase.co/storage/v1/object/public/blogs/blog-images/filename
      const urlParts = url.split('/storage/v1/object/public/');
      if (urlParts.length === 2) {
        const fullPath = urlParts[1]; // "blogs/blog-images/filename"
        // Retirer le nom du bucket "blogs/" pour ne garder que "blog-images/filename"
        const pathWithoutBucket = fullPath.replace(/^blogs\//, '');
        return pathWithoutBucket;
      }
      return null;
    } catch (error) {
      console.error("Erreur lors de l'extraction du chemin du fichier:", error);
      return null;
    }
  }

  /**
   * Récupère toutes les catégories de blog
   */
  static async getBlogCategories() {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('nom');
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupère tous les tags de blog
   */
  static async getBlogTags() {
    const { data, error } = await supabase
      .from('blog_tags')
      .select('*')
      .order('nom');
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupère les blogs par catégorie
   */
  static async getBlogsByCategory(categorySlug: string) {
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories!inner(id, nom, slug)
      `)
      .eq('blog_categories.slug', categorySlug)
      .eq('est_publie', true)
      .order('date_publication', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Récupère les blogs par tag
   */
  static async getBlogsByTag(tagSlug: string) {
    const { data: tagData, error: tagError } = await supabase
      .from('blog_tags')
      .select('id')
      .eq('slug', tagSlug)
      .single();
    
    if (tagError || !tagData) throw tagError;
    
    const { data, error } = await supabase
      .from('blog_tags_relation')
      .select(`
        blogs!inner(
          *,
          blog_categories(id, nom, slug)
        )
      `)
      .eq('tag_id', tagData.id)
      .eq('blogs.est_publie', true)
      .order('blogs.date_publication', { ascending: false });
    
    if (error) throw error;
    return data.map(item => item.blogs);
  }

  /**
   * Récupère les stats des blogs pour le dashboard admin
   */
  static async getBlogStats() {
    try {
      // Utiliser la fonction RPC définie dans la base de données
      const { data, error } = await supabase.rpc('get_blog_stats');
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("Erreur lors de la récupération des statistiques:", error);
      
      // Fallback manuel en cas d'erreur avec la fonction RPC
      const { count: totalCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true });

      const { count: publishedCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('est_publie', true);

      const { count: featuredCount } = await supabase
        .from('blogs')
        .select('*', { count: 'exact', head: true })
        .eq('est_feature', true);

      return {
        total: totalCount || 0,
        published: publishedCount || 0,
        featured: featuredCount || 0,
        draft: totalCount ? totalCount - (publishedCount || 0) : 0
      };
    }
  }

  /**
   * Recherche des blogs par terme de recherche
   */
  static async searchBlogs(query: string) {
    // Recherche dans le titre, l'extrait et le contenu
    const { data, error } = await supabase
      .from('blogs')
      .select(`
        *,
        blog_categories(id, nom, slug)
      `)
      .or(`titre.ilike.%${query}%, extrait.ilike.%${query}%, contenu.ilike.%${query}%`)
      .eq('est_publie', true)
      .order('date_publication', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  /**
   * Vérifie si un slug existe déjà
   * @param slug Le slug à vérifier
   * @param excludeId ID du blog à exclure de la vérification (utile pour les mises à jour)
   * @returns Un booléen indiquant si le slug existe
   */
  static async checkSlugExists(slug: string, excludeId?: number): Promise<boolean> {
    try {
      let query = supabase
        .from('blogs')
        .select('id')
        .eq('slug', slug);
      
      // Si un ID est fourni, exclure ce blog de la vérification
      if (excludeId) {
        query = query.neq('id', excludeId);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error("Erreur lors de la vérification du slug:", error);
        return false;
      }
      
      return data && data.length > 0;
    } catch (error) {
      console.error("Exception lors de la vérification du slug:", error);
      return false;
    }
  }
}

export default BlogService;
