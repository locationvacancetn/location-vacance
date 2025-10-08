/**
 * BlogManagement.tsx
 * 
 * Interface d'administration pour la création et gestion de blogs optimisés SEO.
 * Permet aux administrateurs de créer, éditer et gérer des articles de blog
 * avec tous les éléments nécessaires pour un bon référencement.
 */

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Loader2, X, Plus } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { BlogService, BlogCategory, BlogFaqInput, BlogImageInput } from "@/services/blogService";
import { useToast } from "@/components/ui/use-toast";
import { v4 as uuidv4 } from 'uuid';
import slugify from 'slugify';
import { supabase } from "@/integrations/supabase/client";
import { AIBlogService } from "@/lib/aiBlogService";
import { AIGenerateButton } from "@/components/ui/ai-generate-button";

// Interface pour les images supplémentaires
interface AdditionalImage {
  id: string;
  url: string;
  alt?: string;
}

// Interface pour les erreurs Supabase
interface SupabaseError {
  error?: string;
  message?: string;
  statusCode?: number;
  stack?: string;
  [key: string]: unknown;
}

const BlogManagement: React.FC = () => {
  // Récupérer l'ID du blog depuis les paramètres de l'URL ou de la query string
  const params = useParams<{ id?: string }>();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryId = searchParams.get('id');
  
  // Priorité aux paramètres de l'URL (nouvelle structure), puis à la query string (ancienne)
  const id = params.id || queryId || undefined;
  
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const additionalImagesRef = useRef<HTMLInputElement>(null);
  const [additionalImages, setAdditionalImages] = useState<AdditionalImage[]>([]);

  // États du formulaire
  const [title, setTitle] = useState<string>("");
  const [excerpt, setExcerpt] = useState<string>("");
  const [blogContent, setBlogContent] = useState<string>("");
  const [slug, setSlug] = useState<string>("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [readTime, setReadTime] = useState<string>("5");
  const [authorName, setAuthorName] = useState<string>("Équipe Location Vacance");
  const [metaTitle, setMetaTitle] = useState<string>("");
  const [metaDescription, setMetaDescription] = useState<string>("");
  const [mainKeywords, setMainKeywords] = useState<string>("");
  const [canonicalUrl, setCanonicalUrl] = useState<string>("");
  const [internalLinks, setInternalLinks] = useState<string>("");
  const [mainImageUrl, setMainImageUrl] = useState<string>("");
  const [mainImageAlt, setMainImageAlt] = useState<string>("");
  const [mainImageCaption, setMainImageCaption] = useState<string>("");
  const [publishDate, setPublishDate] = useState<Date | undefined>(new Date());
  const [isPublished, setIsPublished] = useState(false);
  const [isFeatured, setIsFeatured] = useState(false);
  const [activeTab, setActiveTab] = useState("content");
  
  // État pour les tags
  const [tagsInput, setTagsInput] = useState<string>("");
  
  // État pour les FAQs
  const [faqs, setFaqs] = useState<Array<{question: string, answer: string, id: string}>>([
    { question: "", answer: "", id: uuidv4() }
  ]);
  
  // État pour gérer le chargement
  const [loading, setLoading] = useState<boolean>(false);
  const [loadingData, setLoadingData] = useState<boolean>(id ? true : false);
  
  // État pour la génération IA
  const [aiGenerating, setAiGenerating] = useState<boolean>(false);
  
  // État pour les catégories
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  // Chargement des catégories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await BlogService.getBlogCategories();
        setCategories(categories);
      } catch (error) {
        console.error("Erreur lors du chargement des catégories:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les catégories",
          variant: "destructive",
        });
      }
    };
    
    loadCategories();
  }, [toast]);
  
  // Générer un slug à partir du titre
  useEffect(() => {
    if (title && !id) {
      const generatedSlug = slugify(title, {
        lower: true,
        strict: true,
        remove: /[*+~.()'"!:@]/g
      });
      setSlug(generatedSlug);
      
      // Proposer un meta-titre s'il est vide
      if (!metaTitle) {
        setMetaTitle(title);
      }
    }
  }, [title, id, metaTitle]);
  
  // Fonction pour générer l'extrait avec IA
  const generateExcerptWithAI = async () => {
    if (!title.trim()) {
      toast({
        title: "Erreur",
        description: "Veuillez d'abord saisir un titre pour générer l'extrait.",
        variant: "destructive"
      });
      return;
    }

    setAiGenerating(true);
    try {
      const response = await AIBlogService.generateExcerpt({ title });
      
      if (response.success) {
        setExcerpt(response.content);
        toast({
          title: "Succès",
          description: "Extrait généré avec succès !",
          variant: "default"
        });
      } else {
        toast({
          title: "Erreur",
          description: response.error || "Erreur lors de la génération de l'extrait.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors de la génération de l'extrait.",
        variant: "destructive"
      });
    } finally {
      setAiGenerating(false);
    }
  };
  
  // Fonction pour traiter les tags saisis et les convertir en IDs
  const processTagsInput = async (tagsText: string): Promise<number[]> => {
    if (!tagsText.trim()) return [];
    
    const tagNames = tagsText.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
    const tagIds: number[] = [];
    
    for (const tagName of tagNames) {
      try {
        // Vérifier si le tag existe déjà
        const { data: existingTag } = await supabase
          .from('blog_tags')
          .select('id')
          .eq('nom', tagName)
          .single();
        
        if (existingTag) {
          tagIds.push(existingTag.id);
        } else {
          // Créer un nouveau tag
          const { data: newTag, error } = await supabase
            .from('blog_tags')
            .insert({ 
              nom: tagName, 
              slug: tagName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')
            })
            .select('id')
            .single();
          
          if (newTag && !error) {
            tagIds.push(newTag.id);
          } else {
            console.error('Erreur lors de la création du tag:', tagName, error);
          }
        }
      } catch (error) {
        console.error('Erreur lors du traitement du tag:', tagName, error);
      }
    }
    
    return tagIds;
  };
  
  // Fonction pour convertir les liens internes JSON en format lisible
  const formatInternalLinksForDisplay = (linksData: any): string => {
    if (!linksData) return "";
    
    try {
      // Si c'est déjà une chaîne, essayer de la parser
      let parsedLinks = linksData;
      if (typeof linksData === 'string') {
        parsedLinks = JSON.parse(linksData);
      }
      
      // Si c'est un tableau simple (format actuel)
      if (Array.isArray(parsedLinks)) {
        return parsedLinks.map(link => {
          if (typeof link === 'string') {
            return link;
          } else if (link && typeof link === 'object') {
            // Pour le format actuel avec "text" comme URL
            if (link.text && !link.url) {
              return link.text;
            }
            // Pour le format structuré avec titre et URL
            return `${link.titre || link.text || ''} | ${link.url || link.text || ''}`;
          }
          return '';
        }).filter(link => link.trim()).join(', ');
      }
      
      // Si c'est un objet structuré (format futur)
      if (typeof parsedLinks === 'object') {
        const result: string[] = [];
        Object.entries(parsedLinks).forEach(([section, links]) => {
          if (Array.isArray(links)) {
            links.forEach((link: any) => {
              if (link && typeof link === 'object') {
                result.push(`${link.titre || ''} | ${link.url || ''}`);
              }
            });
          }
        });
        return result.join(', ');
      }
      
      return "";
    } catch (error) {
      console.error("Erreur lors du formatage des liens internes:", error);
      return "";
    }
  };
  
  // Charger les données du blog en mode édition
  useEffect(() => {
    const loadBlogData = async () => {
      if (!id) return;
      
      try {
        setLoadingData(true);

        const blog = await BlogService.getBlogById(parseInt(id));
        
        // Remplir les états avec les données du blog
        setTitle(blog.titre || "");
        setExcerpt(blog.extrait || "");
        setBlogContent(blog.contenu || "");
        setSlug(blog.slug || "");
        setCategoryId(blog.category_id ? blog.category_id.toString() : "");
        setReadTime(blog.temps_lecture ? blog.temps_lecture.toString() : "5");
        setAuthorName(blog.auteur || "");
        setMetaTitle(blog.meta_titre || "");
        setMetaDescription(blog.meta_description || "");
        setMainKeywords(blog.mots_cles || "");
        setCanonicalUrl(blog.url_canonique || "");
        setInternalLinks(formatInternalLinksForDisplay(blog.liens_internes));
        setMainImageUrl(blog.image_principale || "");
        setMainImageAlt(blog.image_alt || "");
        setMainImageCaption(blog.image_legende || "");
        setIsPublished(blog.est_publie);
        setIsFeatured(blog.est_feature);
        
        if (blog.date_publication) {
          setPublishDate(new Date(blog.date_publication));
        }
        
        // Charger les FAQs
        if (blog.blog_faqs && blog.blog_faqs.length > 0) {
          setFaqs(blog.blog_faqs.map(faq => ({
            question: faq.question,
            answer: faq.reponse,
            id: uuidv4()
          })));
        }

        // Charger les images supplémentaires
        if (blog.blog_images && blog.blog_images.length > 0) {

          setAdditionalImages(blog.blog_images.map(image => ({
            id: image.id.toString(),
            url: image.url,
            alt: image.alt_text || ""
          })));
        }

        // Charger les tags existants
        if (blog.blog_tags && blog.blog_tags.length > 0) {
          setTagsInput(blog.blog_tags.map(tag => tag.nom).join(', '));
        } else {
          setTagsInput("");
        }
      } catch (error) {
        console.error("Erreur lors du chargement du blog:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données du blog",
          variant: "destructive",
        });
      } finally {
        setLoadingData(false);
      }
    };
    
    loadBlogData();
  }, [id, toast]);
  
  // Pour ajouter une nouvelle FAQ
  const addFaq = () => {
    setFaqs([...faqs, { question: "", answer: "", id: uuidv4() }]);
  };
  
  // Pour mettre à jour une FAQ existante
  const updateFaq = (index: number, field: "question" | "answer", value: string) => {
    const updatedFaqs = [...faqs];
    updatedFaqs[index][field] = value;
    setFaqs(updatedFaqs);
  };
  
  // Pour supprimer une FAQ
  const removeFaq = (index: number) => {
    const updatedFaqs = [...faqs];
    updatedFaqs.splice(index, 1);
    setFaqs(updatedFaqs);
  };

  // Fonction de validation du formulaire
  const validateForm = () => {
    if (!title) {
      toast({
        title: "Erreur",
        description: "Le titre est obligatoire",
        variant: "destructive",
      });
      setActiveTab("content");
      return false;
    }
    
    if (!blogContent) {
      toast({
        title: "Erreur",
        description: "Le contenu de l'article est obligatoire",
        variant: "destructive",
      });
      setActiveTab("content");
      return false;
    }
    
    if (!slug) {
      toast({
        title: "Erreur",
        description: "Le slug (URL) est obligatoire",
        variant: "destructive",
      });
      setActiveTab("seo");
      return false;
    }
    
    return true;
  };

  // Fonction de sauvegarde du blog
  const saveBlog = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Vérifier d'abord si le slug existe déjà
      const slugExists = await BlogService.checkSlugExists(slug, id ? parseInt(id) : undefined);
      
      if (slugExists) {
        toast({
          title: "Erreur",
          description: "Ce slug est déjà utilisé par un autre article. Veuillez modifier le slug dans l'onglet SEO.",
          variant: "destructive",
        });
        
        setActiveTab("seo");
        setTimeout(() => {
          const slugInput = document.getElementById("slug");
          if (slugInput) {
            slugInput.focus();
            slugInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
            slugInput.classList.add("highlight-error");
            setTimeout(() => slugInput.classList.remove("highlight-error"), 3000);
          }
        }, 100);
        
        setLoading(false);
        return;
      }
      
      // Préparer les FAQs pour l'API
      const faqsForApi: BlogFaqInput[] = faqs
        .filter(faq => faq.question.trim() !== "" && faq.answer.trim() !== "")
        .map((faq, index) => ({
          question: faq.question,
          reponse: faq.answer,
          ordre: index
        }));
      
      // Préparer les images supplémentaires pour l'API
      const imagesForApi: BlogImageInput[] = additionalImages.map((image, index) => ({
        url: image.url,
        alt_text: image.alt || null,
        legende: null,
        ordre: index
      }));
      
      // Préparer les liens internes
      let parsedInternalLinks = [];
      try {
        if (internalLinks.trim()) {
          parsedInternalLinks = internalLinks.split(',').map(link => {
            const [text, url] = link.split('|').map(part => part.trim());
            return { text, url };
          });
        }
      } catch (e) {
        console.error("Erreur lors du parsing des liens internes:", e);
      }
      
      const blogData = {
        titre: title,
        slug: slug,
        extrait: excerpt || null,
        contenu: blogContent,
        category_id: categoryId ? parseInt(categoryId) : null,
        temps_lecture: readTime ? parseInt(readTime) : null,
        auteur: authorName || null,
        meta_titre: metaTitle || null,
        meta_description: metaDescription || null,
        mots_cles: mainKeywords || null,
        url_canonique: canonicalUrl || null,
        image_principale: mainImageUrl || null,
        image_alt: mainImageAlt || null,
        image_legende: mainImageCaption || null,
        est_publie: isPublished,
        est_feature: isFeatured,
        date_publication: isPublished && publishDate ? publishDate.toISOString() : null,
        liens_internes: parsedInternalLinks.length > 0 ? parsedInternalLinks : null,
        // Métadonnées réseaux sociaux (optionnelles)
        og_titre: null,
        og_description: null,
        og_image: null,
        twitter_titre: null,
        twitter_description: null,
        twitter_image: null
      };
      



      
      // Traiter les tags saisis
      const processedTags = await processTagsInput(tagsInput);
      
      let result;
      
      if (id) {
        // Mise à jour

        result = await BlogService.updateBlog(parseInt(id), blogData, faqsForApi, processedTags, imagesForApi);

      } else {
        // Création du blog

        result = await BlogService.createBlog(blogData, faqsForApi, processedTags, imagesForApi);

      }
      
      if (result.error) {
        console.error("Erreur détaillée lors de la sauvegarde:", result.error);
        throw new Error(result.error.message || "Erreur lors de la sauvegarde");
      }
      
      toast({
        title: "Succès",
        description: id ? "Article mis à jour avec succès" : "Article créé avec succès",
      });
      
      // Rediriger vers la liste des blogs
      navigate("/dashboard/admin/blogs");
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Une erreur est survenue lors de l'enregistrement";
      
      toast({
        title: "Erreur",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour mettre à jour une image supplémentaire
  const updateAdditionalImage = (index: number, field: 'alt', value: string) => {
    const updatedImages = [...additionalImages];
    updatedImages[index] = { ...updatedImages[index], [field]: value };
    setAdditionalImages(updatedImages);
  };

  // Fonction pour supprimer une image supplémentaire
  const removeAdditionalImage = (index: number) => {
    const updatedImages = additionalImages.filter((_, i) => i !== index);
    setAdditionalImages(updatedImages);
  };

  // Fonction pour gérer l'upload d'images supplémentaires
  const handleAdditionalImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    for (const file of Array.from(files)) {
      // Vérifier le type de fichier
      if (!file.type.includes('image/')) {
        toast({
          title: "Type de fichier non pris en charge",
          description: `Le fichier ${file.name} n'est pas une image valide.`,
          variant: "destructive",
        });
        continue;
      }
      
      // Vérifier la taille du fichier (max 2 MB)
      if (file.size > 2 * 1024 * 1024) {
        toast({
          title: "Fichier trop volumineux",
          description: `Le fichier ${file.name} dépasse la taille maximale de 2 MB.`,
          variant: "destructive",
        });
        continue;
      }
      
      try {
        // Vérifier l'authentification avant de tenter l'upload
        const { data: session } = await supabase.auth.getSession();
        if (!session?.session) {
          toast({
            title: "Authentification nécessaire",
            description: "Vous devez être connecté pour uploader des images.",
            variant: "destructive",
          });
          return;
        }
        
        // Utiliser le service StorageService pour l'upload
        const fileName = `blog-additional-${Date.now()}-${Math.random().toString(36).substring(7)}.${file.name.split('.').pop()}`;
        

        // Essayer l'upload direct avec Supabase
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('blogs')
          .upload(`blog-images/${fileName}`, file, {
            cacheControl: '3600',
            upsert: true,
            contentType: file.type
          });
          
        if (uploadError) {
          console.error('Erreur upload image supplémentaire:', uploadError);
          throw uploadError;
        }
        
        // Si réussi, récupérer l'URL
        const { data } = supabase.storage
          .from('blogs')
          .getPublicUrl(`blog-images/${fileName}`);
        
        // Ajouter l'image à la liste
        const newImage: AdditionalImage = {
          id: `temp-${Date.now()}-${Math.random().toString(36).substring(7)}`,
          url: data.publicUrl,
          alt: ""
        };
        
        setAdditionalImages(prev => [...prev, newImage]);
        
        toast({
          title: "Image téléchargée",
          description: `L'image ${file.name} a été ajoutée avec succès.`,
        });
      } catch (error: unknown) {
        console.error("Erreur détaillée lors de l'upload de l'image supplémentaire:", error);
        
        const supabaseError = error as SupabaseError;
        
        let errorMessage = "Une erreur est survenue lors du téléchargement de l'image.";
        
        if (supabaseError.message && typeof supabaseError.message === 'string' && supabaseError.message.includes("row-level security policy")) {
          errorMessage = "Erreur de permission: vérifiez que votre compte a les droits d'upload sur le bucket 'blogs'.";
        } else if (supabaseError.message && typeof supabaseError.message === 'string' && supabaseError.message.includes("Authentification requise")) {
          errorMessage = "Session expirée. Veuillez vous reconnecter.";
        }
        
        toast({
          title: "Erreur d'upload",
          description: errorMessage,
          variant: "destructive",
        });
      }
    }
    
    // Réinitialiser l'input
    if (additionalImagesRef.current) {
      additionalImagesRef.current.value = '';
    }
  };

  // Fonction pour gérer l'upload d'images
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !files[0]) return;
    
    const file = files[0];
    
    // Vérifier le type de fichier
    if (!file.type.includes('image/')) {
      toast({
        title: "Type de fichier non pris en charge",
        description: "Veuillez sélectionner une image (JPG, PNG, GIF, etc.)",
        variant: "destructive",
      });
      return;
    }
    
    // Vérifier la taille du fichier (max 2 MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 2 MB",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Vérifier l'authentification avant de tenter l'upload
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        toast({
          title: "Authentification nécessaire",
          description: "Vous devez être connecté pour uploader des images.",
          variant: "destructive",
        });
        return;
      }
      
      // Utiliser le service StorageService pour l'upload (avec un nom de fichier plus simple)
      const fileName = `blog-${Date.now()}.${file.name.split('.').pop()}`;
      

      // Essayer l'upload direct avec Supabase
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('blogs')
        .upload(`blog-images/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type
        });
        
      if (uploadError) {
        console.error('Erreur upload direct:', uploadError);
        throw uploadError;
      }
      
      // Si réussi, récupérer l'URL
      const { data } = supabase.storage
        .from('blogs')
        .getPublicUrl(`blog-images/${fileName}`);
      
      // Mettre à jour l'état avec l'URL de l'image
      setMainImageUrl(data.publicUrl);
      
      toast({
        title: "Image téléchargée",
        description: "L'image a été téléchargée avec succès.",
      });
    } catch (error: unknown) {
      console.error("Erreur détaillée lors de l'upload de l'image:", error);
      
      const supabaseError = error as SupabaseError;
      
      let errorMessage = "Une erreur est survenue lors du téléchargement de l'image.";
      
      if (supabaseError.message && typeof supabaseError.message === 'string' && supabaseError.message.includes("row-level security policy")) {
        errorMessage = "Erreur de permission: vérifiez que votre compte a les droits d'upload sur le bucket 'blogs'.";
      } else if (supabaseError.message && typeof supabaseError.message === 'string' && supabaseError.message.includes("Authentification requise")) {
        errorMessage = "Session expirée. Veuillez vous reconnecter.";
      }
      
      toast({
        title: "Erreur d'upload",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  if (loadingData) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Chargement de l'article...</span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <Tabs defaultValue="content" className="space-y-6" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-col sm:flex-row w-full max-w-3xl h-auto sm:h-10">
          <TabsTrigger value="content" className="w-full sm:flex-1 text-sm">Contenu</TabsTrigger>
          <TabsTrigger value="seo" className="w-full sm:flex-1 text-sm">SEO</TabsTrigger>
          <TabsTrigger value="media" className="w-full sm:flex-1 text-sm">Médias</TabsTrigger>
          <TabsTrigger value="schema" className="w-full sm:flex-1 text-sm">Schema & FAQ</TabsTrigger>
          <TabsTrigger value="settings" className="w-full sm:flex-1 text-sm">Paramètres</TabsTrigger>
        </TabsList>
        
         {/* Onglet Contenu Principal */}
         <TabsContent value="content" className="space-y-4">
           <div className="hidden sm:block">
             <Card>
               <CardHeader>
                 <CardTitle>Contenu de l'article</CardTitle>
                 <CardDescription>
                   Créez le contenu principal de votre article de blog
                 </CardDescription>
               </CardHeader>
               <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="title">Titre de l'article (H1)</Label>
                 <Input 
                   id="title" 
                   placeholder="Titre principal de l'article..." 
                   value={title}
                   onChange={(e) => setTitle(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Le titre doit être accrocheur, inclure le mot-clé principal et faire idéalement 50-60 caractères.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <div className="flex items-center justify-between">
                   <Label htmlFor="excerpt">Extrait</Label>
                   <AIGenerateButton
                     onGenerate={generateExcerptWithAI}
                     loading={aiGenerating}
                     disabled={!title.trim()}
                     size="sm"
                   >
                     Générer
                   </AIGenerateButton>
                 </div>
                 <Textarea 
                   id="excerpt" 
                   placeholder="Bref résumé de l'article..." 
                   className="resize-none h-20"
                   value={excerpt}
                   onChange={(e) => setExcerpt(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Un résumé engageant de 150-160 caractères maximum (optimisé SEO) qui incite à la lecture.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label>Contenu principal</Label>
                 <Textarea 
                   placeholder="Rédigez votre article ici... Structurez votre contenu avec des titres, des listes et intégrez vos mots-clés naturellement."
                   className="min-h-[400px]"
                   value={blogContent}
                   onChange={(e) => setBlogContent(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Structurez votre contenu avec des sous-titres (H2, H3) et intégrez vos mots-clés naturellement.
                 </p>
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <Label htmlFor="category">Catégorie</Label>
                   <Select value={categoryId} onValueChange={setCategoryId}>
                     <SelectTrigger>
                       <SelectValue placeholder="Sélectionner une catégorie" />
                     </SelectTrigger>
                     <SelectContent>
                       {categories.map((category) => (
                         <SelectItem key={category.id} value={category.id.toString()}>
                           {category.nom}
                         </SelectItem>
                       ))}
                     </SelectContent>
                   </Select>
                 </div>
                 
                 <div className="space-y-2">
                   <Label htmlFor="readTime">Temps de lecture (minutes)</Label>
                   <Input 
                     id="readTime" 
                     type="number" 
                     min="1" 
                     max="60" 
                     placeholder="5"
                     value={readTime}
                     onChange={(e) => setReadTime(e.target.value)}
                   />
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="authorName">Nom de l'auteur</Label>
                 <Input 
                   id="authorName" 
                   placeholder="Nom de l'auteur..." 
                   value={authorName}
                   onChange={(e) => setAuthorName(e.target.value)}
                   readOnly
                   className="bg-gray-50"
                 />
                 <p className="text-xs text-muted-foreground">
                   L'auteur est fixé sur "Équipe Location Vacance" pour maintenir la cohérence de la marque.
                 </p>
               </div>
             </CardContent>
           </Card>
           </div>
           <div className="sm:hidden space-y-4">
             <div>
               <h3 className="text-lg font-semibold">Contenu de l'article</h3>
               <p className="text-sm text-muted-foreground">
                 Créez le contenu principal de votre article de blog
               </p>
             </div>
             <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Titre de l'article (H1)</Label>
                <Input 
                  id="title" 
                  placeholder="Titre principal de l'article..." 
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Le titre doit être accrocheur, inclure le mot-clé principal et faire idéalement 50-60 caractères.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="excerpt">Extrait</Label>
                  <AIGenerateButton
                    onGenerate={generateExcerptWithAI}
                    loading={aiGenerating}
                    disabled={!title.trim()}
                    size="sm"
                  >
                    Générer
                  </AIGenerateButton>
                </div>
                <Textarea 
                  id="excerpt" 
                  placeholder="Bref résumé de l'article..." 
                  className="resize-none h-20"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Un résumé engageant de 150-160 caractères maximum (optimisé SEO) qui incite à la lecture.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label>Contenu principal</Label>
                <Textarea 
                  placeholder="Rédigez votre article ici... Structurez votre contenu avec des titres, des listes et intégrez vos mots-clés naturellement."
                  className="min-h-[400px]"
                  value={blogContent}
                  onChange={(e) => setBlogContent(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Structurez votre contenu avec des sous-titres (H2, H3) et intégrez vos mots-clés naturellement.
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Catégorie</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.nom}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="readTime">Temps de lecture (minutes)</Label>
                  <Input 
                    id="readTime" 
                    type="number" 
                    min="1" 
                    max="60" 
                    placeholder="5"
                    value={readTime}
                    onChange={(e) => setReadTime(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="authorName">Nom de l'auteur</Label>
                <Input 
                  id="authorName" 
                  placeholder="Nom de l'auteur..." 
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  readOnly
                  className="bg-gray-50"
                />
                <p className="text-xs text-muted-foreground">
                  L'auteur est fixé sur "Équipe Location Vacance" pour maintenir la cohérence de la marque.
                </p>
              </div>
             </div>
           </div>
        </TabsContent>
        
        {/* Onglet SEO */}
        <TabsContent value="seo" className="space-y-4">
          <div className="hidden sm:block">
            <Card>
              <CardHeader>
                <CardTitle>Optimisation SEO</CardTitle>
                <CardDescription>
                  Optimisez votre article pour les moteurs de recherche
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="slug">Slug (URL)</Label>
                 <Input 
                   id="slug" 
                   placeholder="url-de-votre-article"
                   value={slug}
                   onChange={(e) => setSlug(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   L'URL doit être courte, descriptive et contenir le mot-clé principal.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="metaTitle">Meta Titre</Label>
                 <Input 
                   id="metaTitle" 
                   placeholder="Titre pour les moteurs de recherche..."
                   value={metaTitle}
                   onChange={(e) => setMetaTitle(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Titre optimisé pour les résultats de recherche (55-60 caractères max).
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="metaDescription">Meta Description</Label>
                 <Textarea 
                   id="metaDescription" 
                   placeholder="Description pour les moteurs de recherche..." 
                   className="resize-none h-20"
                   value={metaDescription}
                   onChange={(e) => setMetaDescription(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Description concise qui apparaîtra dans les résultats de recherche (150-160 caractères).
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="mainKeywords">Mots-clés principaux</Label>
                 <Input 
                   id="mainKeywords" 
                   placeholder="mot-clé1, mot-clé2, mot-clé3"
                   value={mainKeywords}
                   onChange={(e) => setMainKeywords(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   3-5 mots-clés séparés par des virgules que vous ciblez dans cet article.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="canonicalUrl">URL Canonique (optionnel)</Label>
                 <Input 
                   id="canonicalUrl" 
                   placeholder="https://..."
                   value={canonicalUrl}
                   onChange={(e) => setCanonicalUrl(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   À utiliser uniquement si ce contenu existe ailleurs pour éviter le duplicate content.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="internalLinks">Liens internes suggérés</Label>
                 <Textarea 
                   id="internalLinks" 
                   placeholder="Titre page 1 | /url1, Titre page 2 | /url2" 
                   className="resize-none h-20"
                   value={internalLinks}
                   onChange={(e) => setInternalLinks(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Listez les pages internes à lier dans votre contenu (format: "Texte du lien | URL").
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="tags">Tags</Label>
                 <Input 
                   id="tags" 
                   placeholder="tag1, tag2, tag3" 
                   value={tagsInput}
                   onChange={(e) => setTagsInput(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Saisissez vos tags séparés par des virgules. Les nouveaux tags seront créés automatiquement.
                 </p>
               </div>
             </CardContent>
           </Card>
           </div>
           <div className="sm:hidden space-y-4">
             <div>
               <h3 className="text-lg font-semibold">Optimisation SEO</h3>
               <p className="text-sm text-muted-foreground">
                 Optimisez votre article pour les moteurs de recherche
               </p>
             </div>
             <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input 
                  id="slug" 
                  placeholder="url-de-votre-article"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  L'URL doit être courte, descriptive et contenir le mot-clé principal.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaTitle">Meta Titre</Label>
                <Input 
                  id="metaTitle" 
                  placeholder="Titre pour les moteurs de recherche..."
                  value={metaTitle}
                  onChange={(e) => setMetaTitle(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Titre optimisé pour les résultats de recherche (55-60 caractères max).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="metaDescription">Meta Description</Label>
                <Textarea 
                  id="metaDescription" 
                  placeholder="Description pour les moteurs de recherche..." 
                  className="resize-none h-20"
                  value={metaDescription}
                  onChange={(e) => setMetaDescription(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Description concise qui apparaîtra dans les résultats de recherche (150-160 caractères).
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mainKeywords">Mots-clés principaux</Label>
                <Input 
                  id="mainKeywords" 
                  placeholder="mot-clé1, mot-clé2, mot-clé3"
                  value={mainKeywords}
                  onChange={(e) => setMainKeywords(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  3-5 mots-clés séparés par des virgules que vous ciblez dans cet article.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="canonicalUrl">URL Canonique (optionnel)</Label>
                <Input 
                  id="canonicalUrl" 
                  placeholder="https://..."
                  value={canonicalUrl}
                  onChange={(e) => setCanonicalUrl(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  À utiliser uniquement si ce contenu existe ailleurs pour éviter le duplicate content.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="internalLinks">Liens internes suggérés</Label>
                <Textarea 
                  id="internalLinks" 
                  placeholder="Titre page 1 | /url1, Titre page 2 | /url2" 
                  className="resize-none h-20"
                  value={internalLinks}
                  onChange={(e) => setInternalLinks(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Listez les pages internes à lier dans votre contenu (format: "Texte du lien | URL").
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="tags-mobile">Tags</Label>
                <Input 
                  id="tags-mobile" 
                  placeholder="tag1, tag2, tag3" 
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Saisissez vos tags séparés par des virgules. Les nouveaux tags seront créés automatiquement.
                </p>
              </div>
            </div>
          </div>
        </TabsContent>
        
        {/* Onglet Médias */}
        <TabsContent value="media" className="space-y-4">
          <div className="hidden sm:block">
            <Card>
              <CardHeader>
                <CardTitle>Médias et images</CardTitle>
                <CardDescription>
                  Ajoutez des médias optimisés pour votre article
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
               <div className="space-y-2">
                 <Label htmlFor="mainImage">Image principale</Label>
                 <Input 
                   id="mainImageUrl" 
                   placeholder="URL de l'image principale"
                   value={mainImageUrl}
                   onChange={(e) => setMainImageUrl(e.target.value)}
                 />
                 <div className="grid grid-cols-1 gap-4 mt-2">
                   <div 
                     className="border border-dashed rounded-md p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                     onClick={() => fileInputRef.current?.click()}
                   >
                     <input
                       type="file"
                       ref={fileInputRef}
                       className="hidden"
                       accept="image/*"
                       onChange={handleImageUpload}
                     />
                     <p>Cliquez ou glissez-déposez pour ajouter une image</p>
                     <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou WEBP. 1200x630px recommandé.</p>
                   </div>
                 </div>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="mainImageAlt">Texte alternatif (alt)</Label>
                 <Input 
                   id="mainImageAlt" 
                   placeholder="Description de l'image..."
                   value={mainImageAlt}
                   onChange={(e) => setMainImageAlt(e.target.value)}
                 />
                 <p className="text-xs text-muted-foreground">
                   Décrivez précisément l'image en incluant le mot-clé principal si pertinent.
                 </p>
               </div>
               
               <div className="space-y-2">
                 <Label htmlFor="imageCaption">Légende de l'image (optionnel)</Label>
                 <Input 
                   id="imageCaption" 
                   placeholder="Légende sous l'image..."
                   value={mainImageCaption}
                   onChange={(e) => setMainImageCaption(e.target.value)}
                 />
               </div>
               
               {/* Section Images supplémentaires */}
               <div className="space-y-4 mt-8">
                 <div className="flex items-center justify-between">
                   <Label className="text-base font-medium">Images supplémentaires</Label>
                   <Button 
                     type="button"
                     variant="outline" 
                     size="sm"
                     onClick={() => additionalImagesRef.current?.click()}
                   >
                     <Plus className="mr-2 h-4 w-4" />
                     Ajouter une image
                   </Button>
                 </div>
                 
                 <input
                   type="file"
                   ref={additionalImagesRef}
                   className="hidden"
                   accept="image/*"
                   multiple
                   onChange={handleAdditionalImageUpload}
                 />
                 
                 {additionalImages.length > 0 ? (
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {additionalImages.map((image, index) => (
                       <div key={image.id} className="border rounded-lg p-4 space-y-3">
                         <div className="relative aspect-video w-full">
                           <img 
                             src={image.url} 
                             alt={image.alt || `Image ${index + 1}`}
                             className="w-full h-full object-cover rounded"
                           />
                         </div>
                         <div className="space-y-2">
                           <Input
                             placeholder="Texte alternatif..."
                             value={image.alt || ""}
                             onChange={(e) => updateAdditionalImage(index, 'alt', e.target.value)}
                           />
                           <div className="flex justify-between items-center">
                             <span className="text-sm text-muted-foreground">
                               Image {index + 1}
                             </span>
                             <Button
                               type="button"
                               variant="outline"
                               size="sm"
                               onClick={() => removeAdditionalImage(index)}
                               className="text-red-600 hover:text-red-700"
                             >
                               <X className="h-4 w-4" />
                             </Button>
                           </div>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                     <p className="text-muted-foreground mb-2">Aucune image supplémentaire</p>
                     <p className="text-sm text-muted-foreground">
                       Ajoutez des images pour enrichir votre article
                     </p>
                   </div>
                 )}
               </div>
             </CardContent>
           </Card>
           </div>
           <div className="sm:hidden space-y-4">
             <div>
               <h3 className="text-lg font-semibold">Médias et images</h3>
               <p className="text-sm text-muted-foreground">
                 Ajoutez des médias optimisés pour votre article
               </p>
             </div>
             <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mainImage">Image principale</Label>
                <Input 
                  id="mainImageUrl" 
                  placeholder="URL de l'image principale"
                  value={mainImageUrl}
                  onChange={(e) => setMainImageUrl(e.target.value)}
                />
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div 
                    className="border border-dashed rounded-md p-10 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <p>Cliquez ou glissez-déposez pour ajouter une image</p>
                    <p className="text-xs text-muted-foreground mt-2">PNG, JPG ou WEBP. 1200x630px recommandé.</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mainImageAlt">Texte alternatif (alt)</Label>
                <Input 
                  id="mainImageAlt" 
                  placeholder="Description de l'image..."
                  value={mainImageAlt}
                  onChange={(e) => setMainImageAlt(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Décrivez précisément l'image en incluant le mot-clé principal si pertinent.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="imageCaption">Légende de l'image (optionnel)</Label>
                <Input 
                  id="imageCaption" 
                  placeholder="Légende sous l'image..."
                  value={mainImageCaption}
                  onChange={(e) => setMainImageCaption(e.target.value)}
                />
              </div>
              
              {/* Section Images supplémentaires */}
              <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-medium">Images supplémentaires</Label>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="sm"
                    onClick={() => additionalImagesRef.current?.click()}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Ajouter une image
                  </Button>
                </div>
                
                <input
                  type="file"
                  ref={additionalImagesRef}
                  className="hidden"
                  accept="image/*"
                  multiple
                  onChange={handleAdditionalImageUpload}
                />
                
                {additionalImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {additionalImages.map((image, index) => (
                      <div key={image.id} className="border rounded-lg p-4 space-y-3">
                        <div className="relative aspect-video w-full">
                          <img 
                            src={image.url} 
                            alt={image.alt || `Image ${index + 1}`}
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                        <div className="space-y-2">
                          <Input
                            placeholder="Texte alternatif..."
                            value={image.alt || ""}
                            onChange={(e) => updateAdditionalImage(index, 'alt', e.target.value)}
                          />
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-muted-foreground">
                              Image {index + 1}
                            </span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeAdditionalImage(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-muted-foreground mb-2">Aucune image supplémentaire</p>
                    <p className="text-sm text-muted-foreground">
                      Ajoutez des images pour enrichir votre article
                    </p>
                  </div>
                )}
              </div>
             </div>
           </div>
        </TabsContent>
        
        {/* Onglet Schema et FAQ */}
        <TabsContent value="schema" className="space-y-4">
          <div className="hidden sm:block">
            <Card>
              <CardHeader>
                <CardTitle>FAQ et Schema.org</CardTitle>
                <CardDescription>
                  Ajoutez une section FAQ pour améliorer la visibilité dans Google
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
               <div>
                 <p className="text-sm mb-4">
                   Les FAQ sont fortement recommandées par Google et peuvent apparaître directement dans les résultats de recherche.
                 </p>
                 
                 <div className="space-y-6 mb-4">
                   {faqs.map((faq, index) => (
                     <div key={faq.id} className="border rounded-md p-4 space-y-3">
                       <div className="flex justify-between items-start">
                         <Label htmlFor={`faq-question-${index}`} className="text-base font-medium">
                           Question {index + 1}
                         </Label>
                         <Button 
                           variant="ghost" 
                           size="sm" 
                           onClick={() => removeFaq(index)}
                           className="h-8 px-2 text-muted-foreground"
                           disabled={faqs.length === 1}
                         >
                           Supprimer
                         </Button>
                       </div>
                       
                       <Input 
                         id={`faq-question-${index}`} 
                         value={faq.question}
                         onChange={(e) => updateFaq(index, "question", e.target.value)}
                         placeholder="Question fréquemment posée...?"
                       />
                       
                       <Textarea 
                         id={`faq-answer-${index}`}
                         value={faq.answer}
                         onChange={(e) => updateFaq(index, "answer", e.target.value)}
                         placeholder="Réponse à cette question..."
                         className="resize-none h-24"
                       />
                     </div>
                   ))}
                 </div>
                 
                 <Button onClick={addFaq} variant="outline" className="w-full">
                   + Ajouter une question
                 </Button>
               </div>
             </CardContent>
           </Card>
           </div>
           <div className="sm:hidden space-y-4">
             <div>
               <h3 className="text-lg font-semibold">FAQ et Schema.org</h3>
               <p className="text-sm text-muted-foreground">
                 Ajoutez une section FAQ pour améliorer la visibilité dans Google
               </p>
             </div>
             <div className="space-y-4">
              <div>
                <p className="text-sm mb-4">
                  Les FAQ sont fortement recommandées par Google et peuvent apparaître directement dans les résultats de recherche.
                </p>
                
                <div className="space-y-6 mb-4">
                  {faqs.map((faq, index) => (
                    <div key={faq.id} className="border rounded-md p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <Label htmlFor={`faq-question-${index}`} className="text-base font-medium">
                          Question {index + 1}
                        </Label>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => removeFaq(index)}
                          className="h-8 px-2 text-muted-foreground"
                          disabled={faqs.length === 1}
                        >
                          Supprimer
                        </Button>
                      </div>
                      
                      <Input 
                        id={`faq-question-${index}`} 
                        value={faq.question}
                        onChange={(e) => updateFaq(index, "question", e.target.value)}
                        placeholder="Question fréquemment posée...?"
                      />
                      
                      <Textarea 
                        id={`faq-answer-${index}`}
                        value={faq.answer}
                        onChange={(e) => updateFaq(index, "answer", e.target.value)}
                        placeholder="Réponse à cette question..."
                        className="resize-none h-24"
                      />
                    </div>
                  ))}
                </div>
                
                <Button onClick={addFaq} variant="outline" className="w-full">
                  + Ajouter une question
                </Button>
              </div>
             </div>
           </div>
        </TabsContent>

        {/* Onglet Paramètres */}
        <TabsContent value="settings" className="space-y-4">
          <div className="hidden sm:block">
            <Card>
              <CardHeader>
                <CardTitle>Configuration de publication</CardTitle>
                <CardDescription>
                  Gérez les paramètres de publication et de visibilité
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="publishSwitch">Publier l'article</Label>
                     <Switch
                       id="publishSwitch"
                       checked={isPublished}
                       onCheckedChange={setIsPublished}
                     />
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Active ou désactive la visibilité de l'article sur le site.
                   </p>
                 </div>
                 
                 <div className="space-y-2">
                   <div className="flex items-center justify-between">
                     <Label htmlFor="featuredSwitch">Article à la une</Label>
                     <Switch
                       id="featuredSwitch"
                       checked={isFeatured}
                       onCheckedChange={setIsFeatured}
                     />
                   </div>
                   <p className="text-xs text-muted-foreground">
                     Met en avant l'article sur la page du blog.
                   </p>
                 </div>
               </div>
               
               <div className="mt-4 space-y-2">
                 <Label>Date de publication</Label>
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant={"outline"}
                       className={cn(
                         "w-full justify-start text-left font-normal",
                         !publishDate && "text-muted-foreground"
                       )}
                     >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       {publishDate ? format(publishDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <Calendar
                       mode="single"
                       selected={publishDate}
                       onSelect={setPublishDate}
                       initialFocus
                     />
                   </PopoverContent>
                 </Popover>
               </div>
             </CardContent>
           </Card>
           </div>
           <div className="sm:hidden space-y-4">
             <div>
               <h3 className="text-lg font-semibold">Configuration de publication</h3>
               <p className="text-sm text-muted-foreground">
                 Gérez les paramètres de publication et de visibilité
               </p>
             </div>
             <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="publishSwitch">Publier l'article</Label>
                    <Switch
                      id="publishSwitch"
                      checked={isPublished}
                      onCheckedChange={setIsPublished}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Active ou désactive la visibilité de l'article sur le site.
                  </p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="featuredSwitch">Article à la une</Label>
                    <Switch
                      id="featuredSwitch"
                      checked={isFeatured}
                      onCheckedChange={setIsFeatured}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Met en avant l'article sur la page du blog.
                  </p>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                <Label>Date de publication</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !publishDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {publishDate ? format(publishDate, "PPP", { locale: fr }) : "Sélectionner une date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={publishDate}
                      onSelect={setPublishDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
             </div>
           </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex flex-col sm:flex-row justify-end mt-6 gap-2">
        <Button 
          variant="outline" 
          onClick={() => navigate("/dashboard/admin/blogs")}
          disabled={loading}
          className="w-full sm:w-auto"
        >
          Annuler
        </Button>
        <Button 
          className="bg-primary hover:bg-primary/90 text-white w-full sm:w-auto"
          onClick={saveBlog}
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {id ? "Mise à jour..." : "Publication..."}
            </>
          ) : (
            id ? "Mettre à jour l'article" : "Publier l'article"
          )}
        </Button>
      </div>
    </div>
  );
};

export default BlogManagement;
