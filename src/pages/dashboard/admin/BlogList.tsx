/**
 * BlogList.tsx
 * 
 * Interface d'administration pour lister et gérer les articles de blog.
 * Permet aux administrateurs de voir tous les articles, les filtrer,
 * les rechercher et effectuer des actions de gestion.
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CalendarIcon, Clock, User, MoreHorizontal, Plus, Search, Eye, Edit, Trash2, Star, StarOff, EyeOff, Eye as EyeIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogService, Blog, BlogCategory } from "@/services/blogService";
import { useToast } from "@/components/ui/use-toast";

const BlogList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // États pour les données
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour les filtres et la recherche
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<string>("all");
  
  // États pour les actions
  const [deletingBlogId, setDeletingBlogId] = useState<number | null>(null);
  const [updatingBlogId, setUpdatingBlogId] = useState<number | null>(null);
  
  // Chargement des données
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Charger les blogs et les catégories en parallèle
        const [blogsData, categoriesData] = await Promise.all([
          BlogService.getAllBlogs(),
          BlogService.getBlogCategories()
        ]);
        
        setBlogs(blogsData || []);
        setCategories(categoriesData || []);
        setError(null);
      } catch (err) {
        console.error("Erreur lors du chargement des données:", err);
        setError("Impossible de charger les articles. Veuillez réessayer.");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Filtrage des blogs
  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = !searchTerm || 
      blog.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.extrait?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.auteur?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === "all" || 
      blog.category_id?.toString() === selectedCategory;
    
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "published" && blog.est_publie) ||
      (statusFilter === "draft" && !blog.est_publie);
    
    const matchesFeatured = featuredFilter === "all" || 
      (featuredFilter === "featured" && blog.est_feature) ||
      (featuredFilter === "not-featured" && !blog.est_feature);
    
    return matchesSearch && matchesCategory && matchesStatus && matchesFeatured;
  });
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    if (!dateString) return "Non publié";
    return format(new Date(dateString), "d MMM yyyy", { locale: fr });
  };
  
  // Fonction pour supprimer un blog
  const handleDeleteBlog = async (blogId: number) => {
    try {
      setDeletingBlogId(blogId);
      const { error } = await BlogService.deleteBlog(blogId);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour la liste locale
      setBlogs(blogs.filter(blog => blog.id !== blogId));
      
      toast({
        title: "Succès",
        description: "L'article a été supprimé avec succès.",
      });
    } catch (error) {
      console.error("Erreur lors de la suppression:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setDeletingBlogId(null);
    }
  };
  
  // Fonction pour basculer le statut de publication
  const togglePublishStatus = async (blog: Blog) => {
    try {
      setUpdatingBlogId(blog.id);
      
      const updatedBlog = {
        titre: blog.titre,
        slug: blog.slug,
        extrait: blog.extrait,
        contenu: blog.contenu,
        category_id: blog.category_id,
        temps_lecture: blog.temps_lecture,
        auteur: blog.auteur,
        image_principale: blog.image_principale,
        image_alt: blog.image_alt,
        image_legende: blog.image_legende,
        meta_titre: blog.meta_titre,
        meta_description: blog.meta_description,
        mots_cles: blog.mots_cles,
        url_canonique: blog.url_canonique,
        og_titre: blog.og_titre,
        og_description: blog.og_description,
        og_image: blog.og_image,
        twitter_titre: blog.twitter_titre,
        twitter_description: blog.twitter_description,
        twitter_image: blog.twitter_image,
        est_publie: !blog.est_publie,
        est_feature: blog.est_feature,
        date_publication: !blog.est_publie ? new Date().toISOString() : null,
        liens_internes: blog.liens_internes
      };
      
      const { error } = await BlogService.updateBlog(blog.id, updatedBlog);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour la liste locale
      setBlogs(blogs.map(b => b.id === blog.id ? { ...b, est_publie: !b.est_publie, date_publication: updatedBlog.date_publication } : b));
      
      toast({
        title: "Succès",
        description: `L'article a été ${!blog.est_publie ? 'publié' : 'dépublié'} avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUpdatingBlogId(null);
    }
  };
  
  // Fonction pour basculer le statut "à la une"
  const toggleFeaturedStatus = async (blog: Blog) => {
    try {
      setUpdatingBlogId(blog.id);
      
      const updatedBlog = {
        titre: blog.titre,
        slug: blog.slug,
        extrait: blog.extrait,
        contenu: blog.contenu,
        category_id: blog.category_id,
        temps_lecture: blog.temps_lecture,
        auteur: blog.auteur,
        image_principale: blog.image_principale,
        image_alt: blog.image_alt,
        image_legende: blog.image_legende,
        meta_titre: blog.meta_titre,
        meta_description: blog.meta_description,
        mots_cles: blog.mots_cles,
        url_canonique: blog.url_canonique,
        og_titre: blog.og_titre,
        og_description: blog.og_description,
        og_image: blog.og_image,
        twitter_titre: blog.twitter_titre,
        twitter_description: blog.twitter_description,
        twitter_image: blog.twitter_image,
        est_publie: blog.est_publie,
        est_feature: !blog.est_feature,
        date_publication: blog.date_publication,
        liens_internes: blog.liens_internes
      };
      
      const { error } = await BlogService.updateBlog(blog.id, updatedBlog);
      
      if (error) {
        throw error;
      }
      
      // Mettre à jour la liste locale
      setBlogs(blogs.map(b => b.id === blog.id ? { ...b, est_feature: !b.est_feature } : b));
      
      toast({
        title: "Succès",
        description: `L'article a été ${!blog.est_feature ? 'mis' : 'retiré'} à la une avec succès.`,
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'article. Veuillez réessayer.",
        variant: "destructive",
      });
    } finally {
      setUpdatingBlogId(null);
    }
  };
  
  // Statistiques
  const stats = {
    total: blogs.length,
    published: blogs.filter(blog => blog.est_publie).length,
    draft: blogs.filter(blog => !blog.est_publie).length,
    featured: blogs.filter(blog => blog.est_feature && blog.est_publie).length
  };
  
  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex-1">
          {/* Le titre et la description sont maintenant gérés par le header du dashboard */}
        </div>
        <Button 
          onClick={() => navigate("/dashboard/admin/blogs/new")}
          className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" />
          Nouvel Article
        </Button>
      </div>
      
      {/* Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{stats.published}</div>
            <p className="text-xs text-muted-foreground">Publiés</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{stats.draft}</div>
            <p className="text-xs text-muted-foreground">Brouillons</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{stats.featured}</div>
            <p className="text-xs text-muted-foreground">À la une</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filtres et recherche */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher par titre, auteur ou contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Catégorie" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Toutes les catégories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id.toString()}>
                {category.nom}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={featuredFilter} onValueChange={setFeaturedFilter}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="À la une" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="featured">À la une</SelectItem>
            <SelectItem value="not-featured">Pas à la une</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {/* Liste des articles */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <Skeleton className="h-12 w-12 rounded" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Réessayer
          </Button>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            {searchTerm || selectedCategory !== "all" || statusFilter !== "all" || featuredFilter !== "all"
              ? "Aucun article ne correspond à vos critères de recherche."
              : "Aucun article trouvé. Créez votre premier article !"
            }
          </p>
          {!searchTerm && selectedCategory === "all" && statusFilter === "all" && featuredFilter === "all" && (
            <Button onClick={() => navigate("/dashboard/admin/blogs/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Créer un article
            </Button>
          )}
        </div>
      ) : (
        <>
          {/* Version Mobile - Cartes */}
          <div className="block md:hidden space-y-4">
            {filteredBlogs.map((blog) => (
              <div key={blog.id} className="border rounded-lg p-4 space-y-3">
                {/* En-tête de la carte */}
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm leading-tight line-clamp-2">{blog.titre}</h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {blog.extrait || "Aucun extrait"}
                    </p>
                  </div>
                </div>
                
                {/* Informations de l'article */}
                <div className="space-y-3">
                  {/* Ligne 1: Catégorie à gauche, Statut à droite */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {blog.blog_categories ? (
                        <Badge variant="outline" className="text-xs">{blog.blog_categories.nom}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">Aucune catégorie</span>
                      )}
                      {blog.est_feature && (
                        <Badge variant="secondary" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          À la une
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      {blog.est_publie ? (
                        <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                          Publié
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          Brouillon
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {/* Ligne 2: Temps de lecture et date */}
                  <div className="flex items-center justify-between">
                    {blog.temps_lecture && (
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3 w-3 mr-1" />
                        {blog.temps_lecture} min
                      </div>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(blog.date_creation), 'dd/MM/yyyy', { locale: fr })}
                    </span>
                  </div>
                </div>
                
                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex items-center space-x-1">
                    {/* Bouton Publier/Dépublier */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => togglePublishStatus(blog)}
                      disabled={updatingBlogId === blog.id}
                      className="h-8 w-8 p-0 hover:text-[#1EAE5A] hover:border-[#1EAE5A]"
                    >
                      {blog.est_publie ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                    </Button>
                    
                    {/* Bouton À la une */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleFeaturedStatus(blog)}
                      disabled={updatingBlogId === blog.id}
                      className="h-8 w-8 p-0 hover:text-[#d2ac21] hover:border-[#d2ac21]"
                    >
                      {blog.est_feature ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                    </Button>
                    
                    {/* Bouton Supprimer */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                          <AlertDialogDescription>
                            Êtes-vous sûr de vouloir supprimer l'article <strong>"{blog.titre}"</strong> ?
                            <br />
                            <br />
                            <strong>Cette action est irréversible.</strong>
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">
                            Annuler
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteBlog(blog.id)}
                            className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                            disabled={deletingBlogId === blog.id}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            {deletingBlogId === blog.id ? "Suppression..." : "Supprimer"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                  
                  <div className="flex items-center space-x-1">
                    {/* Bouton Voir */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/blog/${blog.slug}`)}
                      className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    {/* Bouton Modifier */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/dashboard/admin/blogs/${blog.id}`)}
                      className="h-8 w-8 p-0 hover:text-[#1EAE5A] hover:border-[#1EAE5A]"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Version Desktop - Tableau */}
          <div className="hidden md:block border rounded-lg overflow-hidden">
            <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Article</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Auteur</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBlogs.map((blog) => (
                    <TableRow key={blog.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-1">{blog.titre}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1 max-w-xs">
                            {blog.extrait || "Aucun extrait"}
                          </div>
                          <div className="flex items-center gap-2">
                            {blog.est_feature && (
                              <Badge variant="secondary" className="text-xs">
                                <Star className="h-3 w-3 mr-1" />
                                À la une
                              </Badge>
                            )}
                            {blog.temps_lecture && (
                              <div className="flex items-center text-xs text-muted-foreground">
                                <Clock className="h-3 w-3 mr-1" />
                                {blog.temps_lecture} min
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {blog.blog_categories ? (
                          <Badge variant="outline">{blog.blog_categories.nom}</Badge>
                        ) : (
                          <span className="text-muted-foreground">Aucune</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm">
                          <User className="h-4 w-4 mr-1 text-muted-foreground" />
                          {blog.auteur || "Non défini"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={blog.est_publie ? "default" : "secondary"}>
                          {blog.est_publie ? "Publié" : "Brouillon"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(blog.date_publication || blog.date_creation)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {/* Bouton Publier/Dépublier */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => togglePublishStatus(blog)}
                            disabled={updatingBlogId === blog.id}
                            title={blog.est_publie ? "Dépublier l'article" : "Publier l'article"}
                            className="h-8 w-8 p-0 hover:text-[#1EAE5A] hover:border-[#1EAE5A]"
                          >
                            {blog.est_publie ? <EyeOff className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                          </Button>
                          
                          {/* Bouton À la une */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleFeaturedStatus(blog)}
                            disabled={updatingBlogId === blog.id}
                            title={blog.est_feature ? "Retirer de la une" : "Mettre à la une"}
                            className="h-8 w-8 p-0 hover:text-[#d2ac21] hover:border-[#d2ac21]"
                          >
                            {blog.est_feature ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                          </Button>
                          
                          {/* Bouton Supprimer */}
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                title="Supprimer l'article"
                                className="h-8 w-8 p-0 hover:text-red-600 hover:border-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer l'article</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Êtes-vous sûr de vouloir supprimer l'article <strong>"{blog.titre}"</strong> ?
                                  <br />
                                  <br />
                                  <strong>Cette action est irréversible.</strong>
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="hover:bg-[#32323a] hover:text-white hover:border-[#32323a] active:bg-[#32323a] active:text-white active:border-[#32323a]">
                                  Annuler
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteBlog(blog.id)}
                                  className="bg-[#bc2d2b] hover:bg-[#a82523] text-white"
                                  disabled={deletingBlogId === blog.id}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  {deletingBlogId === blog.id ? "Suppression..." : "Supprimer"}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                          
                          {/* Bouton Voir */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => window.open(`/blog/${blog.slug}`, '_blank')}
                            title="Voir l'article"
                            className="h-8 w-8 p-0"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          
                          {/* Bouton Modifier */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/dashboard/admin/blogs/${blog.id}`)}
                            title="Modifier l'article"
                            className="h-8 w-8 p-0 hover:text-[#385aa2] hover:border-[#385aa2]"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
    </div>
  );
};

export default BlogList;
