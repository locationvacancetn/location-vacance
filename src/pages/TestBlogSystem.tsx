/**
 * TestBlogSystem.tsx
 * 
 * Page de test pour vérifier le bon fonctionnement du système de blog.
 * Permet de tester les différentes fonctionnalités sans passer par l'interface d'administration.
 */

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BlogService, Blog, BlogCategory } from "@/services/blogService";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";

const TestBlogSystem: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [testResults, setTestResults] = useState<{
    categories: boolean;
    blogs: boolean;
    featured: boolean;
    error: string | null;
  }>({
    categories: false,
    blogs: false,
    featured: false,
    error: null
  });

  const runTests = async () => {
    setLoading(true);
    setTestResults({
      categories: false,
      blogs: false,
      featured: false,
      error: null
    });

    try {
      // Test 1: Récupération des catégories
      console.log("🧪 Test 1: Récupération des catégories...");
      const categories = await BlogService.getBlogCategories();
      console.log("✅ Catégories récupérées:", categories);
      
      // Test 2: Récupération des blogs publiés
      console.log("🧪 Test 2: Récupération des blogs publiés...");
      const publishedBlogs = await BlogService.getPublishedBlogs();
      console.log("✅ Blogs publiés récupérés:", publishedBlogs);
      
      // Test 3: Récupération des blogs mis en avant
      console.log("🧪 Test 3: Récupération des blogs mis en avant...");
      const featuredBlogs = await BlogService.getFeaturedBlogs();
      console.log("✅ Blogs mis en avant récupérés:", featuredBlogs);
      
      // Test 4: Statistiques
      console.log("🧪 Test 4: Récupération des statistiques...");
      const stats = await BlogService.getBlogStats();
      console.log("✅ Statistiques récupérées:", stats);

      setTestResults({
        categories: categories && categories.length > 0,
        blogs: publishedBlogs !== null,
        featured: featuredBlogs !== null,
        error: null
      });

    } catch (error) {
      console.error("❌ Erreur lors des tests:", error);
      setTestResults(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erreur inconnue"
      }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  return (
    <div className="min-h-screen bg-background py-16">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate("/dashboard")}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour au Dashboard
          </Button>
          
          <h1 className="text-3xl font-bold text-[#173B56] mb-2">
            Test du Système de Blog
          </h1>
          <p className="text-muted-foreground">
            Vérification du bon fonctionnement des composants du système de blog
          </p>
        </div>

        <div className="grid gap-6">
          {/* Résultats des tests */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {loading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                )}
                Résultats des Tests
              </CardTitle>
              <CardDescription>
                Statut des différents composants du système de blog
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Récupération des catégories</span>
                <Badge variant={testResults.categories ? "default" : "destructive"}>
                  {testResults.categories ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> OK</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Erreur</>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Récupération des blogs publiés</span>
                <Badge variant={testResults.blogs ? "default" : "destructive"}>
                  {testResults.blogs ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> OK</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Erreur</>
                  )}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Récupération des blogs mis en avant</span>
                <Badge variant={testResults.featured ? "default" : "destructive"}>
                  {testResults.featured ? (
                    <><CheckCircle className="h-3 w-3 mr-1" /> OK</>
                  ) : (
                    <><XCircle className="h-3 w-3 mr-1" /> Erreur</>
                  )}
                </Badge>
              </div>

              {testResults.error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-800 font-medium">Erreur détectée :</p>
                  <p className="text-red-600 text-sm mt-1">{testResults.error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions de test */}
          <Card>
            <CardHeader>
              <CardTitle>Actions de Test</CardTitle>
              <CardDescription>
                Boutons pour tester manuellement les différentes fonctionnalités
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  onClick={runTests}
                  disabled={loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Test en cours...
                    </>
                  ) : (
                    "Relancer les tests"
                  )}
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate("/blog")}
                  className="w-full"
                >
                  Voir le blog public
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate("/dashboard/admin/blogs")}
                  className="w-full"
                >
                  Interface d'administration
                </Button>
                
                <Button 
                  variant="outline"
                  onClick={() => navigate("/dashboard/admin/blogs/new")}
                  className="w-full"
                >
                  Créer un nouvel article
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Informations système */}
          <Card>
            <CardHeader>
              <CardTitle>Informations Système</CardTitle>
              <CardDescription>
                Détails techniques sur l'implémentation du système de blog
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="font-medium">Base de données :</span>
                  <span>Supabase PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Tables créées :</span>
                  <span>blogs, blog_categories, blog_tags, blog_faqs, blog_images</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Service :</span>
                  <span>BlogService.ts</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Composants SEO :</span>
                  <span>BlogSEO.tsx avec Schema.org</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Interface admin :</span>
                  <span>BlogManagement.tsx, BlogList.tsx</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Pages publiques :</span>
                  <span>Blog.tsx, BlogDetails.tsx</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestBlogSystem;
