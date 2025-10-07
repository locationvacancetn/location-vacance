import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarIcon, Clock, User, Star } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { BlogService } from "@/services/blogService";
import type { Blog as BlogType, BlogCategory } from "@/services/blogService";
import Footer from "@/components/Footer";

/**
 * Interface pour un article de blog avec sa catégorie (étendue de l'interface Blog)
 */
interface BlogWithCategory extends BlogType {
  blog_categories?: BlogCategory;
}

const Blog: React.FC = () => {
  const navigate = useNavigate();
  const [featuredBlogs, setFeaturedBlogs] = useState<BlogWithCategory[]>([]);
  const [recentBlogs, setRecentBlogs] = useState<BlogWithCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Paramètres de pagination
  const FEATURED_PER_PAGE = 3;
  const RECENT_PER_PAGE = 6;
  const [currentFeaturedPage, setCurrentFeaturedPage] = useState<number>(1);
  const [currentRecentPage, setCurrentRecentPage] = useState<number>(1);
  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        
        // Récupérer les blogs mis en avant
        const featuredData = await BlogService.getFeaturedBlogs(20); // Récupérer plus d'articles
        setFeaturedBlogs(featuredData || []);
        
        // Récupérer tous les blogs publiés
        const allBlogs = await BlogService.getPublishedBlogs();
        
        // Filtrer pour exclure les blogs déjà présents dans featuredBlogs
        const featuredIds = featuredData.map((blog: BlogWithCategory) => blog.id);
        const otherBlogs = allBlogs.filter((blog: BlogWithCategory) => !featuredIds.includes(blog.id));
        
        setRecentBlogs(otherBlogs || []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des blogs:", err);
        setError("Impossible de charger les articles. Veuillez réessayer ultérieurement.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchBlogs();
  }, []);
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return format(new Date(dateString), "d MMMM yyyy", { locale: fr });
  };

  // Calcul des pages et des articles à afficher
  const featuredPageCount = Math.ceil(featuredBlogs.length / FEATURED_PER_PAGE);
  const recentPageCount = Math.ceil(recentBlogs.length / RECENT_PER_PAGE);
  
  const featuredPaginated = featuredBlogs.slice(
    (currentFeaturedPage - 1) * FEATURED_PER_PAGE,
    currentFeaturedPage * FEATURED_PER_PAGE
  );
  
  const recentPaginated = recentBlogs.slice(
    (currentRecentPage - 1) * RECENT_PER_PAGE,
    currentRecentPage * RECENT_PER_PAGE
  );
  
  // Gestion de la navigation entre les pages
  const nextFeaturedPage = () => {
    if (currentFeaturedPage < featuredPageCount) {
      setCurrentFeaturedPage(currentFeaturedPage + 1);
    }
  };
  
  const prevFeaturedPage = () => {
    if (currentFeaturedPage > 1) {
      setCurrentFeaturedPage(currentFeaturedPage - 1);
    }
  };
  
  const nextRecentPage = () => {
    if (currentRecentPage < recentPageCount) {
      setCurrentRecentPage(currentRecentPage + 1);
    }
  };
  
  const prevRecentPage = () => {
    if (currentRecentPage > 1) {
      setCurrentRecentPage(currentRecentPage - 1);
    }
  };

  // Composant pour afficher un article à la une
  const FeaturedBlogCard = ({ blog }: { blog: BlogWithCategory }) => (
    <Card className="border-border hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="relative group">
          {/* Image principale */}
          <img 
            src={blog.image_principale || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format"} 
            alt={blog.image_alt || blog.titre} 
            className="h-40 w-full rounded-lg object-cover cursor-pointer"
            onClick={() => navigate(`/blog/${blog.slug}`)}
          />
          
          {/* Badge EN VEDETTE */}
          <Badge className="absolute left-2 top-2 rounded-full text-white px-1.5 text-[10px] flex items-center gap-0.5" style={{backgroundColor: '#BC2D2B'}}>
            <Star className="h-2.5 w-2.5" />
            EN VEDETTE
          </Badge>
          
          {/* Badge catégorie */}
          {blog.blog_categories && (
            <Badge className="absolute right-2 top-2 rounded-full text-white px-1.5 text-[10px] flex items-center gap-0.5" style={{backgroundColor: '#1EAE5A'}}>
              {blog.blog_categories.nom}
            </Badge>
          )}
        </div>
        
        <div className="mt-4 space-y-3 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {blog.auteur || "Auteur"}
            </span>
            {blog.date_publication && (
              <span className="text-xs font-medium text-muted-foreground">
                {formatDate(blog.date_publication)}
              </span>
            )}
          </div>
          
          <Link 
            to={`/blog/${blog.slug}`} 
            className="font-semibold text-base hover:text-primary transition-colors line-clamp-2"
          >
            {blog.titre}
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
            {blog.extrait}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-auto">
            <Button 
              size="sm" 
              className="bg-[#1EAE5A] text-white hover:bg-[#1EAE5A]/90"
              onClick={() => navigate(`/blog/${blog.slug}`)}
            >
              Lire l'article
            </Button>
            {blog.temps_lecture && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{blog.temps_lecture} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Composant pour afficher un article régulier
  const BlogCard = ({ blog }: { blog: BlogWithCategory }) => (
    <Card className="border-border hover:shadow-lg transition-shadow h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <div className="relative group">
          {/* Image principale */}
          <img 
            src={blog.image_principale || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format"} 
            alt={blog.image_alt || blog.titre || "Article de blog"}
            className="h-40 w-full rounded-lg object-cover cursor-pointer"
            onClick={() => navigate(`/blog/${blog.slug}`)}
          />
          
          {/* Badge catégorie */}
          {blog.blog_categories && (
            <Badge className="absolute left-2 top-2 rounded-full text-white px-1.5 text-[10px] flex items-center gap-0.5" style={{backgroundColor: '#1EAE5A'}}>
              {blog.blog_categories.nom}
            </Badge>
          )}
        </div>
        
        <div className="mt-4 space-y-3 flex flex-col flex-grow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-primary">
              {blog.auteur || "Auteur"}
            </span>
            {blog.date_publication && (
              <span className="text-xs font-medium text-muted-foreground">
                {formatDate(blog.date_publication)}
              </span>
            )}
          </div>
          
          <Link 
            to={`/blog/${blog.slug}`} 
            className="font-semibold text-base hover:text-primary transition-colors line-clamp-2"
          >
            {blog.titre}
          </Link>
          
          <p className="text-sm text-muted-foreground line-clamp-2 flex-grow">
            {blog.extrait}
          </p>
          
          <div className="flex items-center justify-between pt-2 border-t border-border/30 mt-auto">
            <Button 
              size="sm" 
              className="bg-[#1EAE5A] text-white hover:bg-[#1EAE5A]/90"
              onClick={() => navigate(`/blog/${blog.slug}`)}
            >
              Lire l'article
            </Button>
            {blog.temps_lecture && (
              <div className="flex items-center gap-1 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm font-medium">{blog.temps_lecture} min</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
  
  // Squelettes pour le chargement
  const SkeletonFeatured = () => (
    <div className="col-span-1 md:col-span-2">
      <Card className="overflow-hidden">
        <div className="relative aspect-[21/9] w-full">
          <Skeleton className="w-full h-full" />
        </div>
        <CardContent className="p-6">
          <div className="flex gap-4 mb-3">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-3/4 mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </div>
  );
  
  const SkeletonBlog = () => (
    <Card className="overflow-hidden h-full">
      <div className="relative aspect-[16/10] w-full">
        <Skeleton className="w-full h-full" />
        <div className="absolute top-3 left-3">
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
      <CardContent className="p-6">
        <div className="flex gap-4 mb-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-3" />
        <Skeleton className="h-10 w-32" />
      </CardContent>
    </Card>
  );
  
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-2 pb-24 md:pb-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-left mb-16">
            <h1 className="text-2xl md:text-3xl font-bold mb-1 text-[#173B56]">
              Notre Blog
            </h1>
            <p className="text-base text-gray-700">
              Conseils, inspirations et actualités pour des expériences de voyage inoubliables.
            </p>
          </div>
          
          {error && (
            <div className="text-center mb-8 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
              <Button variant="outline" className="mt-2" onClick={() => window.location.reload()}>
                Réessayer
              </Button>
            </div>
          )}
          
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <SkeletonBlog />
              <SkeletonBlog />
              <SkeletonBlog />
              <SkeletonBlog />
              <SkeletonBlog />
              <SkeletonBlog />
            </div>
          ) : (
            <>
              {/* Section À la une */}
              {featuredBlogs.length > 0 && (
                <div className="mb-12">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#173B56]">À la une</h2>
                    <div className="h-[1px] bg-gray-200 flex-grow ml-4"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {featuredPaginated.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                  
                  {/* Pagination pour les articles à la une */}
                  {featuredPageCount > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={prevFeaturedPage} 
                        disabled={currentFeaturedPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentFeaturedPage} sur {featuredPageCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={nextFeaturedPage} 
                        disabled={currentFeaturedPage === featuredPageCount}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {/* Section Articles récents */}
              {recentBlogs.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-[#173B56]">Articles récents</h2>
                    <div className="h-[1px] bg-gray-200 flex-grow ml-4"></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                    {recentPaginated.map((blog) => (
                      <BlogCard key={blog.id} blog={blog} />
                    ))}
                  </div>
                  
                  {/* Pagination pour les articles récents */}
                  {recentPageCount > 1 && (
                    <div className="flex justify-center items-center gap-2 mt-6">
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={prevRecentPage} 
                        disabled={currentRecentPage === 1}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span className="text-sm text-muted-foreground">
                        Page {currentRecentPage} sur {recentPageCount}
                      </span>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        onClick={nextRecentPage} 
                        disabled={currentRecentPage === recentPageCount}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Blog;
