import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, User, ArrowLeft, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { BlogService, Blog } from "@/services/blogService";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import DOMPurify from 'dompurify';
import BlogSEO from "@/components/SEO/BlogSEO";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";

const BlogDetails: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [previousBlog, setPreviousBlog] = useState<{ id: number; titre: string; slug: string } | null>(null);
  const [nextBlog, setNextBlog] = useState<{ id: number; titre: string; slug: string } | null>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (!slug) {
          setError("Aucun article spécifié");
          setLoading(false);
          return;
        }

        setLoading(true);
        setPreviousBlog(null);
        setNextBlog(null);
        console.log(`Tentative de récupération de l'article avec slug: ${slug}`);
        
        // Vérifier si le slug contient des caractères spéciaux
        if (slug.includes(':')) {
          setError("L'identifiant de l'article est invalide");
          setLoading(false);
          return;
        }
        
        const blogData = await BlogService.getBlogBySlug(slug);
        
        if (!blogData) {
          setError("Article introuvable");
          setLoading(false);
          return;
        }
        
        console.log("Article récupéré avec succès:", blogData.id);
        setBlog(blogData as Blog);
        
        // Récupérer les articles précédent et suivant
        try {
          const { data: allBlogs, error: blogsError } = await supabase
            .from('blogs')
            .select('id, titre, slug, date_publication')
            .eq('est_publie', true)
            .order('date_publication', { ascending: false });
          
          if (!blogsError && allBlogs) {
            const currentIndex = allBlogs.findIndex(b => b.id === blogData.id);
            
            // Article précédent (plus récent)
            if (currentIndex > 0) {
              const prevBlog = allBlogs[currentIndex - 1];
              if (prevBlog) {
                setPreviousBlog({
                  id: prevBlog.id,
                  titre: prevBlog.titre,
                  slug: prevBlog.slug
                });
              }
            }
            
            // Article suivant (plus ancien)
            if (currentIndex < allBlogs.length - 1) {
              const nextBlogData = allBlogs[currentIndex + 1];
              if (nextBlogData) {
                setNextBlog({
                  id: nextBlogData.id,
                  titre: nextBlogData.titre,
                  slug: nextBlogData.slug
                });
              }
            }
          }
        } catch (navError) {
          console.error('Erreur lors de la récupération des articles de navigation:', navError);
        }
        
        setLoading(false);
      } catch (err: unknown) {
        console.error("Erreur lors du chargement de l'article:", err);
        
        // Message d'erreur personnalisé selon le type d'erreur
        let errorMessage = "Impossible de charger cet article.";
        
        if (err && typeof err === 'object' && 'code' in err) {
          const typedError = err as { code?: string; message?: string };
          if (typedError.code === '406') {
            errorMessage = "Format de requête non accepté par le serveur. Veuillez vérifier l'URL.";
          } else if (typedError.code === '404') {
            errorMessage = "Cet article n'existe pas ou a été supprimé.";
          } else if (typedError.message) {
            errorMessage = typedError.message;
          }
        }
        
        setError(errorMessage);
        setLoading(false);
      }
    };

    fetchBlog();
  }, [slug]);

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  // Fonction pour corriger les liens dans le contenu HTML
  const processHtmlContent = (html: string) => {
    // Nettoyer d'abord le HTML avec DOMPurify
    const cleanHtml = DOMPurify.sanitize(html);
    
    // Créer un élément div temporaire pour manipuler le HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = cleanHtml;
    
    // Corriger tous les liens
    const links = tempDiv.querySelectorAll('a');
    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href) {
        // Vérifier si c'est une URL externe (commence par http, https, ftp, etc.)
        if (!href.match(/^(https?:|ftp:|mailto:|tel:|#)/)) {
          // S'il s'agit d'un lien relatif ou d'un lien sans protocole, ajouter https://
          if (!href.startsWith('/')) {
            link.setAttribute('href', `https://${href}`);
          }
        }
      }
    });
    
    return tempDiv.innerHTML;
  };

  // Rendu pendant le chargement
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="pt-1 pb-20 md:pb-8">
          {/* Galerie d'images skeleton */}
          <div className="w-full mb-2">
            <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Layout desktop skeleton */}
              <div className="hidden md:grid md:grid-cols-2 gap-2 h-[500px]">
                <Skeleton className="w-full h-full rounded-lg" />
                <div className="grid grid-rows-2 gap-2 h-full">
                  <Skeleton className="w-full h-[248px] rounded-lg" />
                  <Skeleton className="w-full h-[248px] rounded-lg" />
                </div>
              </div>
              {/* Layout mobile skeleton */}
              <div className="md:hidden space-y-2">
                <Skeleton className="w-full h-64 rounded-lg" />
                <div className="grid grid-cols-2 gap-2">
                  <Skeleton className="w-full h-32 rounded-lg" />
                  <Skeleton className="w-full h-32 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumbs skeleton */}
            <div className="flex items-center gap-2 mb-4 mt-6">
              <Skeleton className="w-16 h-4" />
              <Skeleton className="w-2 h-4" />
              <Skeleton className="w-12 h-4" />
              <Skeleton className="w-2 h-4" />
              <Skeleton className="w-32 h-4" />
            </div>
            
            {/* Titre et extrait skeleton */}
            <Skeleton className="w-3/4 h-8 mb-2" />
            <Skeleton className="w-full h-6 mb-6" />
            
            {/* Contenu skeleton */}
            <div className="space-y-4 mb-8">
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-5/6 h-4" />
              <Skeleton className="w-full h-4" />
              <Skeleton className="w-4/5 h-4" />
            </div>
            
            {/* FAQ skeleton */}
            <div className="mt-10 space-y-4">
              <Skeleton className="w-48 h-6 mb-6" />
              <div className="space-y-4">
                <Skeleton className="w-full h-16" />
                <Skeleton className="w-full h-16" />
              </div>
            </div>
            
            {/* Mots-clés skeleton */}
            <div className="mt-12">
              <Skeleton className="w-40 h-6 mb-4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="w-16 h-6 rounded-full" />
                <Skeleton className="w-20 h-6 rounded-full" />
                <Skeleton className="w-14 h-6 rounded-full" />
              </div>
            </div>
            
            {/* Tags skeleton */}
            <div className="mt-8">
              <Skeleton className="w-16 h-6 mb-4" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="w-18 h-6 rounded-full" />
                <Skeleton className="w-22 h-6 rounded-full" />
                <Skeleton className="w-16 h-6 rounded-full" />
              </div>
            </div>
            
            {/* Liens utiles skeleton */}
            <div className="mt-10">
              <Skeleton className="w-32 h-6 mb-6" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Skeleton className="w-full h-12 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-lg" />
                <Skeleton className="w-full h-12 rounded-lg" />
              </div>
            </div>
            
            {/* Métadonnées skeleton */}
            <div className="mt-8 pt-4 border-t">
              <div className="flex justify-between items-center">
                <Skeleton className="w-24 h-4" />
                <div className="flex gap-4">
                  <Skeleton className="w-32 h-4" />
                  <Skeleton className="w-28 h-4" />
                </div>
              </div>
            </div>
            
            {/* Navigation skeleton */}
            <div className="mt-12 pt-8">
              <Skeleton className="w-48 h-10 mx-auto" />
            </div>
            
            {/* Navigation articles skeleton */}
            <div className="mt-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-md" />
                  <div>
                    <Skeleton className="w-32 h-3 mb-1" />
                    <Skeleton className="w-40 h-4" />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div>
                    <Skeleton className="w-32 h-3 mb-1" />
                    <Skeleton className="w-40 h-4" />
                  </div>
                  <Skeleton className="w-10 h-10 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    );
  }

  // Rendu en cas d'erreur
  if (error) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-grow py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Article non trouvé</h1>
            <p className="text-muted-foreground mb-6">
              {error}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mr-4"
            >
              Réessayer
            </Button>
            <Button 
              variant="outline" 
              onClick={() => navigate("/blog")}
            >
              Retour au blog
            </Button>
          </div>
        </main>
        
        {/* Footer */}
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {blog && <BlogSEO blog={blog} />}
      <Navbar />
      
      <main className="pt-1 pb-2 md:pb-0">
        {blog && (
          <div>
              {/* Galerie d'images selon le design des images fournies */}
              <div className="w-full mb-2">
                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                  {/* Layout desktop: 1 grande photo à gauche, 2 petites à droite */}
                  <div className="hidden md:grid md:grid-cols-2 gap-2 h-[500px]">
                    {/* Image principale statique (plus grande, à gauche) */}
                    <div className="relative group overflow-hidden rounded-lg">
                      {blog.image_principale ? (
                        <>
                          <img
                            src={blog.image_principale}
                            alt={`${blog.titre} - Image principale`}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        </>
                      ) : (
                        <div className="bg-gray-100 flex flex-col items-center justify-center w-full h-full">
                          <img
                            src="/logo---.svg"
                            alt="Logo"
                            className="w-16 h-16 mb-2"
                          />
                          <span className="text-gray-400 text-sm">Image principale</span>
                        </div>
                      )}
                      {/* Badge catégorie superposé */}
                      {blog.blog_categories && (
                        <Badge className="absolute top-4 left-4 bg-white text-black">
                          {blog.blog_categories.nom}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Grille d'images secondaires (2x1, à droite) */}
                    <div className="grid grid-rows-2 gap-2 h-full">
                      {blog.blog_images && blog.blog_images.length > 0 ? (
                        blog.blog_images.slice(0, 2).map((image, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg h-[248px]">
                            <img
                              src={image.url}
                              alt={`${blog.titre} ${index + 2}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))
                      ) : (
                        // Afficher 2 placeholders de fallback
                        Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg h-[248px]">
                            <div className="bg-gray-100 flex flex-col items-center justify-center w-full h-full">
                              <img
                                src="/logo---.svg"
                                alt="Logo"
                                className="w-16 h-16 mb-2"
                              />
                              <span className="text-gray-400 text-sm">Image {index + 2}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Layout mobile: 1 grande photo en haut, 2 petites en dessous */}
                  <div className="md:hidden space-y-2">
                    {/* Image principale mobile statique */}
                    <div className="relative group overflow-hidden rounded-lg">
                      {blog.image_principale ? (
                        <img
                          src={blog.image_principale}
                          alt={blog.titre}
                          className="w-full h-64 object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="bg-gray-100 flex flex-col items-center justify-center w-full h-64">
                          <img
                            src="/logo---.svg"
                            alt="Logo"
                            className="w-16 h-16 mb-2"
                          />
                          <span className="text-gray-400 text-sm">Image principale</span>
                        </div>
                      )}
                      {/* Badge catégorie superposé */}
                      {blog.blog_categories && (
                        <Badge className="absolute top-4 left-4 bg-white text-black">
                          {blog.blog_categories.nom}
                        </Badge>
                      )}
                    </div>
                    
                    {/* Grille d'images secondaires mobile */}
                    <div className="grid grid-cols-2 gap-2">
                      {blog.blog_images && blog.blog_images.length > 0 ? (
                        blog.blog_images.slice(0, 2).map((image, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg h-32">
                            <img
                              src={image.url}
                              alt={`${blog.titre} ${index + 2}`}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                          </div>
                        ))
                      ) : (
                        // Afficher 2 placeholders de fallback
                        Array.from({ length: 2 }).map((_, index) => (
                          <div key={index} className="relative group overflow-hidden rounded-lg h-32">
                            <div className="bg-gray-100 flex flex-col items-center justify-center w-full h-full">
                              <img
                                src="/logo---.svg"
                                alt="Logo"
                                className="w-16 h-16 mb-2"
                              />
                              <span className="text-gray-400 text-sm">Image {index + 2}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Card className="overflow-hidden border-none shadow-none">
                  <CardContent className="p-0">
                {/* Breadcrumbs */}
                <nav className="text-sm text-muted-foreground mb-4 mt-6">
                  <Link to="/" className="hover:text-foreground transition-colors">Accueil</Link>
                  <span className="mx-2">›</span>
                  <Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                  <span className="mx-2">›</span>
                  <span className="text-foreground font-medium">{blog.titre}</span>
                </nav>

                {/* Informations article */}
                <div className="mb-6">
                  <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#173B56]">{blog.titre}</h1>
                  
                  {/* Extrait du blog */}
                  {blog.extrait && (
                    <div className="text-lg text-gray-600 mb-6 leading-relaxed">
                      {blog.extrait}
                    </div>
                  )}
                  
                </div>
                
                {/* Contenu du blog */}
                <div 
                  className="prose prose-gray max-w-none lg:prose-lg mb-8"
                  dangerouslySetInnerHTML={{ __html: blog.contenu ? processHtmlContent(blog.contenu) : '' }}
                />
                
              
              {/* Section FAQ si disponible */}
              {blog?.blog_faqs && blog.blog_faqs.length > 0 && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold mb-6" style={{ color: 'rgb(23, 59, 86, 0.9)' }}>Questions fréquentes</h2>
                  <div className="space-y-4">
                    {blog.blog_faqs.map((faq) => (
                      <div key={faq.id}>
                        <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                        <div 
                          className="prose max-w-none text-muted-foreground"
                          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(faq.reponse) }}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              
              {/* Mots-clés principaux */}
              {blog.mots_cles && blog.mots_cles.trim() && (
                <div className="mt-12">
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(23, 59, 86, 0.9)' }}>Mots-clés principaux</h2>
                  <div className="flex flex-wrap gap-2">
                    {blog.mots_cles.split(',').map((motCle: string, index: number) => (
                      <Badge key={index} variant="secondary" className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                        <Tag className="h-3 w-3 mr-1" />
                        {motCle.trim()}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Tags de blog */}
              {blog.blog_tags && blog.blog_tags.length > 0 && (
                <div className="mt-8">
                  <h2 className="text-lg font-bold mb-4" style={{ color: 'rgb(23, 59, 86, 0.9)' }}>Tags</h2>
                  <div className="flex flex-wrap gap-2">
                    {blog.blog_tags.map((tag) => (
                      <Badge key={tag.id} className="text-white" style={{ backgroundColor: '#16a34a' }}>
                        <Tag className="h-3 w-3 mr-1" />
                        {tag.nom}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Liens internes suggérés */}
              {blog.liens_internes && (
                (Array.isArray(blog.liens_internes) && blog.liens_internes.length > 0) ||
                (typeof blog.liens_internes === 'object' && !Array.isArray(blog.liens_internes) && Object.keys(blog.liens_internes).length > 0 && Object.values(blog.liens_internes).some(links => Array.isArray(links) && links.length > 0))
              ) && (
                <div className="mt-10">
                  <h2 className="text-xl font-bold mb-6" style={{ color: 'rgb(23, 59, 86, 0.9)' }}>Liens utiles</h2>
                  <div className="space-y-4">
                    {/* Format structuré (sections avec liens) */}
                    {typeof blog.liens_internes === 'object' && !Array.isArray(blog.liens_internes) && (
                      <>
                        {Object.entries(blog.liens_internes)
                          .filter(([section, links]) => Array.isArray(links) && links.length > 0)
                          .map(([section, links]) => (
                          <div key={section} className="border border-border rounded-lg p-4">
                            <h3 className="text-lg font-semibold mb-3 text-[#173B56]">{section}</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {Array.isArray(links) && links.map((link, index) => (
                                <a
                                  key={index}
                                  href={link.url}
                                  className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  <span className="text-sm font-medium text-[#173B56] hover:text-green-600">
                                    {link.titre}
                                  </span>
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                    
                    {/* Format simple (tableau de liens) */}
                    {Array.isArray(blog.liens_internes) && blog.liens_internes.length > 0 && (
                      <div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {blog.liens_internes.map((link, index) => {
                            // Gérer les différents formats de liens
                            let url = '';
                            let titre = '';
                            
                            if (typeof link === 'string') {
                              url = link;
                              titre = link;
                            } else if (link && typeof link === 'object') {
                              // Format: {"url": "https://darjeld.com", "text": "https://vilivio.com"}
                              if (link.url && link.text) {
                                url = link.url;
                                titre = link.text;
                              }
                              // Format: {"text": "https://vilivio.com"}
                              else if (link.text && !link.url) {
                                url = link.text;
                                titre = link.text;
                              }
                              // Format: {"titre": "Mon lien", "url": "https://example.com"}
                              else {
                                url = link.url || link.text || '';
                                titre = link.titre || link.text || url;
                              }
                            }
                            
                            return (
                              <a
                                key={index}
                                href={url}
                                className="block p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Lien vers: ${url}`}
                              >
                                <span className="text-sm font-medium text-[#173B56] hover:text-green-600">
                                  {titre}
                                </span>
                              </a>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {/* Métadonnées - dernière section */}
              <div className="mt-8 pt-4 border-t">
                {/* Version mobile */}
                <div className="md:hidden space-y-2">
                  {/* Ligne 1: Date (gauche) et Temps de lecture (droite) */}
                  <div className="flex justify-between items-center text-sm text-muted-foreground">
                    {blog.date_publication && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(blog.date_publication)}</span>
                      </div>
                    )}
                    {blog.temps_lecture && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{blog.temps_lecture} min de lecture</span>
                      </div>
                    )}
                  </div>
                  {/* Ligne 2: Auteur */}
                  {blog.auteur && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      <span>{blog.auteur}</span>
                    </div>
                  )}
                </div>
                
                {/* Version desktop */}
                <div className="hidden md:flex justify-between items-center">
                  {/* Auteur à gauche */}
                  {blog.auteur && (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-4 w-4 mr-1" />
                      <span>{blog.auteur}</span>
                    </div>
                  )}
                  {/* Date et temps de lecture à droite */}
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    {blog.date_publication && (
                      <div className="flex items-center">
                        <CalendarIcon className="h-4 w-4 mr-1" />
                        <span>{formatDate(blog.date_publication)}</span>
                      </div>
                    )}
                    {blog.temps_lecture && (
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1" />
                        <span>{blog.temps_lecture} min de lecture</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Navigation */}
              <div className="mt-12 pt-8">
                <Button 
                  variant="outline" 
                  className="w-full md:w-auto bg-[#32323a] text-white hover:bg-green-600 hover:text-white border-[#32323a] hover:border-green-600"
                  onClick={() => navigate("/blog")}
                >
                  Voir tous les articles
                </Button>
              </div>
              
              {/* Navigation entre articles */}
              {(previousBlog || nextBlog) && (
                <div className="mt-4 md:mt-8">
                  <div className="flex flex-row gap-4 justify-between items-center">
                    {/* Article précédent */}
                    {previousBlog ? (
                      <Link 
                        to={`/blog/${previousBlog.slug}`}
                        className="group"
                      >
                        <div className="flex items-center gap-3">
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white px-4 py-2 bg-[#32323a] text-white hover:bg-green-600 h-10 w-10 p-0 group-hover:bg-green-600">
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <div className="text-left">
                            <div className="text-xs text-muted-foreground mb-1">Article précédent</div>
                            <div className="text-sm font-medium line-clamp-2 group-hover:text-green-600 transition-colors hidden md:block">{previousBlog.titre}</div>
                          </div>
                        </div>
                      </Link>
                    ) : (
                      <div className="flex-1"></div>
                    )}
                    
                    {/* Article suivant */}
                    {nextBlog ? (
                      <Link 
                        to={`/blog/${nextBlog.slug}`}
                        className="group"
                      >
                        <div className="flex items-center">
                          <div className="text-right">
                            <div className="text-xs text-muted-foreground mb-1">Article suivant</div>
                            <div className="text-sm font-medium line-clamp-2 group-hover:text-green-600 transition-colors hidden md:block">{nextBlog.titre}</div>
                          </div>
                          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 hover:!text-white px-4 py-2 bg-[#32323a] text-white hover:bg-green-600 h-10 w-10 p-0 ml-2 group-hover:bg-green-600">
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </Link>
                    ) : null}
                  </div>
                </div>
              )}
              
                  </CardContent>
                </Card>
              </div>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default BlogDetails;
