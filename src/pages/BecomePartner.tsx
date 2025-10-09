import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  CheckCircle, 
  Phone, 
  MessageCircle, 
  Target, 
  Users, 
  Star, 
  BarChart3,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  TrendingUp,
  Zap,
  Mouse,
  X,
  Check,
  Percent,
  Eye,
  MousePointer,
  Megaphone,
  Globe,
  Building
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { ROUTES } from '@/constants/routes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllSubscriptionPlans } from '@/lib/subscriptionService';

/**
 * Page "Devenir Partenaire" - Publicité ciblée pour votre audience
 * 
 * @description
 * Page marketing pour attirer les partenaires publicitaires en mettant l'accent sur
 * l'audience ciblée et les outils de gestion de campagnes.
 * 
 * @example
 * ```tsx
 * <BecomePartner />
 * ```
 */
interface SubscriptionPlanFeature {
  id: string;
  plan_id: string;
  feature_type: string;
  feature_text: string;
  sort_order: number;
  created_at?: string;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  price: number;
  price_promo: number | null;
  duration_days: number;
  grace_period_months: number | null;
  badge: string | null;
  is_active: boolean;
  sort_order: number | null;
  subtitle: string | null;
  description: string | null;
  created_at?: string;
  updated_at?: string;
  features?: SubscriptionPlanFeature[];
}

const BecomePartner: React.FC = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Récupération des plans d'abonnement actifs de type "Publicité"
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getAllSubscriptionPlans();
        if (result.success && result.plans) {
          // Filtrer uniquement les plans actifs de type "Publicité" et les trier par prix
          const activePlans = result.plans
            .filter((plan: any) => 
              plan.is_active && 
              plan.product && 
              plan.product.name === "Publicité"
            )
            .sort((a: any, b: any) => a.price - b.price);
          setPlans(activePlans);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des plans:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPlans();
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-12 md:py-20 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 items-center">
            {/* Contenu principal - Titre, sous-titre et bouton */}
            <div className="space-y-6 md:space-y-8 order-1 lg:order-1">
              <div className="space-y-4 md:space-y-6">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight" style={{ color: 'rgb(50 50 58)' }}>
                  Boostez votre visibilité avec <span className="text-green-600">une publicité ciblée</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Boostez votre entreprise avec des bannières B2B et B2C, suivez vos performances avec des analytics détaillées.
                </p>
              </div>

               <div className="flex justify-start">
                 <Button 
                   size="lg" 
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg w-full sm:w-auto"
                   asChild
                 >
                   <Link to={ROUTES.SIGNUP}>
                     Commencer maintenant
                   </Link>
                 </Button>
               </div>
            </div>

            {/* Image hero avec hints superposés */}
            <div className="relative order-2 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden">
                <img 
                  src="/kayak.jpg" 
                  alt="Tableau de bord publicitaire avec analytics" 
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Hints superposés - Responsive */}
               {/* Hint 1 - Top right */}
               <div className="absolute bg-green-600 text-white px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base top-4 right-4 md:top-12 md:-right-8">
                 <Target className="h-4 w-4 md:h-5 md:w-5" />
                 <span className="font-semibold">Audience Ciblée</span>
               </div>
               
               {/* Hint 2 - Bottom right */}
               <div className="absolute bg-white text-green-600 px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base bottom-24 right-4 md:bottom-40 md:-right-12">
                 <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                 <span className="font-semibold">Analytics Détaillées</span>
               </div>
              
              {/* Hint 3 - Bottom left */}
              <div className="absolute text-white px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base bottom-4 left-4 md:bottom-12 md:-left-4" 
                   style={{ backgroundColor: 'rgb(50 50 58)' }}>
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-semibold">ROI Optimisé</span>
              </div>
            </div>
          </div>
         </div>
       </section>

       {/* Scroll Indicator */}
       <div className="flex justify-center py-8">
         <div className="animate-bounce">
           <Mouse className="h-8 w-8 text-green-600" />
         </div>
       </div>

       {/* Section Avantage Concurrentiel */}
      <section className="py-12 md:py-16 px-4 md:px-6">
         <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(50 50 58)' }}>
               Pourquoi choisir <span className="text-green-600">location-vacance.tn</span> ?
             </h2>
            <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
               Comparez et découvrez pourquoi nos partenaires nous font confiance
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
             {/* Autres plateformes */}
             <Card className="border border-gray-200 bg-white">
               <CardHeader>
                 <CardTitle className="text-red-800">
                   Autres plateformes
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center text-red-600">
                   <span className="text-2xl md:text-4xl font-bold">Audience</span>
                   <span className="ml-2">générale</span>
                 </div>
                 <ul className="space-y-2 text-gray-600">
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Ciblage imprécis
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Coûts élevés par clic
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Audience dispersée et non qualifiée
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Support générique
                   </li>
                 </ul>
               </CardContent>
             </Card>

             {/* Location Vacance */}
             <Card className="border border-gray-200 bg-white">
               <CardHeader>
                 <CardTitle className="text-green-800">
                   location-vacance.tn
                 </CardTitle>
               </CardHeader>
               <CardContent className="space-y-4">
                 <div className="flex items-center text-green-600">
                   <span className="text-2xl md:text-4xl font-bold">Audience</span>
                   <span className="ml-2">ciblée</span>
                 </div>
                 <ul className="space-y-2 text-gray-600">
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Ciblage précis par localisation
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Coûts optimisés
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Audience qualifiée et ciblée
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Support dédié
                   </li>
                 </ul>
               </CardContent>
             </Card>
           </div>
         </div>
       </section>

      {/* Section Comment ça marche */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white relative overflow-hidden">
        {/* Texture géométrique en arrière-plan - Desktop */}
        <div 
          className="absolute inset-0 opacity-15 hidden md:block"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '50%'
          }}
        />
        {/* Version mobile - texture plus petite pour éviter le flou */}
        <div 
          className="absolute inset-0 opacity-20 md:hidden"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200%'
          }}
        />
        <div className="max-w-6xl mx-auto relative z-10">
           <div className="text-center mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(50 50 58)' }}>
               Comment ça marche ?
             </h2>
             <p className="text-lg md:text-xl text-gray-600">
               3 étapes vous séparent du succès publicitaire
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Créez votre campagne",
                description: "Définissez votre publicité B2B ou B2C avec images, texte et lien vers votre site, page ou adresse"
              },
              {
                step: "2", 
                title: "Ciblez votre audience",
                description: "Choisissez votre audience cible et gérez votre budget publicitaire"
              },
              {
                step: "3",
                title: "Suivez vos performances",
                description: "Analysez vos résultats avec des statistiques détaillées de visibilité et clics"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 md:p-8 text-center shadow-lg hover:shadow-xl transition-shadow">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6 text-lg md:text-xl font-bold">
                  {item.step}
                </div>
                <h3 className="text-lg md:text-xl font-bold mb-3 md:mb-4" style={{ color: 'rgb(50 50 58)' }}>
                  {item.title}
                </h3>
                <p className="text-sm md:text-base text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Types d'activités */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(50 50 58)' }}>
               Qui peut <span className="text-green-600">devenir partenaire</span> ?
             </h2>
             <p className="text-lg md:text-xl text-gray-600">
               Découvrez les types d'activités qui bénéficient de notre audience qualifiée
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* B2B - Entreprises */}
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Building className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">B2B - Entreprises</h3>
                <p className="text-sm md:text-base text-gray-600">Services professionnels pour l'industrie du tourisme</p>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Prestataires de services</h4>
                    <p className="text-xs md:text-sm text-gray-600">Nettoyage, maintenance, sécurité, conciergerie, jardinage</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Architectes & Designers</h4>
                    <p className="text-xs md:text-sm text-gray-600">Rénovation, décoration, aménagement d'espaces</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Fournisseurs d'équipements</h4>
                    <p className="text-xs md:text-sm text-gray-600">Mobilier, électroménager, décoration</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Photographes & Vidéastes</h4>
                    <p className="text-xs md:text-sm text-gray-600">Photos professionnelles, vidéos promotionnelles, drones</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Événementiel & Animation</h4>
                    <p className="text-xs md:text-sm text-gray-600">Organisation d'événements, animations, team building</p>
                  </div>
                </div>
              </div>
            </div>

            {/* B2C - Particuliers */}
            <div className="space-y-4 md:space-y-6">
              <div className="text-center mb-6 md:mb-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <Users className="h-6 w-6 md:h-8 md:w-8" />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">B2C - Particuliers</h3>
                <p className="text-sm md:text-base text-gray-600">Services et produits pour les voyageurs</p>
              </div>
              
              <div className="space-y-3 md:space-y-4">
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Restaurants & Cafés</h4>
                    <p className="text-xs md:text-sm text-gray-600">Cuisine locale, spécialités régionales</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Activités & Loisirs</h4>
                    <p className="text-xs md:text-sm text-gray-600">Sports, culture, divertissement</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Transport & Mobilité</h4>
                    <p className="text-xs md:text-sm text-gray-600">Location de voitures, transferts, taxis</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Boutiques & Artisanat</h4>
                    <p className="text-xs md:text-sm text-gray-600">Souvenirs, produits locaux, artisanat</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <Check className="h-4 w-4 md:h-5 md:w-5 text-green-600 mt-1 flex-shrink-0" />
                  <div>
                    <h4 className="text-sm md:text-base font-semibold text-gray-900">Services de bien-être</h4>
                    <p className="text-xs md:text-sm text-gray-600">Spas, massages, soins esthétiques</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-8 md:mt-12">
            <p className="text-base md:text-lg text-gray-600">
              <strong>Et bien d'autres activités</strong> qui souhaitent toucher une audience intéressée par le tourisme et la location de vacances !
            </p>
          </div>
        </div>
      </section>

      {/* Avantages de la plateforme */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des outils professionnels pour <span className="text-green-600">maximiser votre ROI</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Tout ce dont vous avez besoin pour réussir vos campagnes publicitaires
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Liste 1 - Gestion & Création */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Megaphone className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Bannières B2B et B2C</h3>
                  <p className="text-sm md:text-base text-gray-600">Créez des publicités adaptées à votre cible : entreprises ou particuliers</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Target className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Ciblage géographique précis</h3>
                  <p className="text-sm md:text-base text-gray-600">Atteignez votre audience locale avec un ciblage par région tunisienne</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <BarChart3 className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Tableau de bord analytics</h3>
                  <p className="text-sm md:text-base text-gray-600">Suivez vos performances avec des statistiques détaillées en temps réel</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Eye className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Statistiques de visibilité</h3>
                  <p className="text-sm md:text-base text-gray-600">Mesurez l'impact de vos campagnes avec des métriques de vues et d'engagement</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MousePointer className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Suivi des clics</h3>
                  <p className="text-sm md:text-base text-gray-600">Analysez le comportement de votre audience avec des données de clics détaillées</p>
                </div>
              </div>
            </div>

            {/* Liste 2 - Marketing & Support */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Globe className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Placement stratégique</h3>
                  <p className="text-sm md:text-base text-gray-600">Vos publicités apparaissent sur les pages les plus consultées de la plateforme</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Audience qualifiée</h3>
                  <p className="text-sm md:text-base text-gray-600">Touchez des utilisateurs déjà intéressés par le tourisme et la location</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Gestion des campagnes</h3>
                  <p className="text-sm md:text-base text-gray-600">Créez, modifiez et gérez vos campagnes publicitaires facilement</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Support dédié</h3>
                  <p className="text-sm md:text-base text-gray-600">Une équipe spécialisée vous accompagne dans vos campagnes publicitaires</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Plans d'abonnement */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choisissez le <span className="text-green-600">plan</span> qui vous correspond
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Des solutions adaptées à chaque étape de votre stratégie publicitaire
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-gray-600">Chargement des plans...</div>
                  </div>
          ) : (
            <div className={`grid grid-cols-1 md:grid-cols-2 ${plans.length > 2 ? 'lg:grid-cols-3' : 'lg:grid-cols-2'} gap-6 md:gap-8`}>
              {plans.map((plan, index) => (
                <Card key={plan.id} className={`relative hover:shadow-lg transition-shadow flex flex-col h-full ${plan.badge === 'populaire' ? 'ring-2 ring-green-500' : ''}`}>
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-green-600 text-white">
                      {plan.badge}
                  </div>
                  )}
                  <CardContent className="p-6 text-center flex flex-col h-full">
                    <div className="flex-grow">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                      <p className="text-sm text-gray-600 mb-4">{plan.subtitle || ''}</p>
                      
                      <div className="mb-6">
                        <div className="flex items-center justify-center space-x-2">
                          <span className="text-3xl font-bold text-gray-900">{plan.price} TND</span>
                          {plan.price_promo && plan.price_promo !== plan.price && (
                            <span className="text-lg text-gray-500 line-through">{plan.price_promo} TND</span>
                          )}
          </div>
                        <p className="text-sm text-gray-500">/ an</p>
        </div>
                      
                      <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                        {plan.description || ''}
                      </p>
                      
                      {/* Features du plan */}
                      {plan.features && plan.features.length > 0 && (
                        <div className="mb-6">
                          <ul className="space-y-2 text-sm text-gray-600">
                            {plan.features
                              .sort((a, b) => a.sort_order - b.sort_order)
                              .map((feature, featureIndex) => (
                              <li key={featureIndex} className="flex items-center">
                                <Check className="mr-2 h-4 w-4 text-green-600 flex-shrink-0" />
                                <span>{feature.feature_text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
          </div>

                    <Button 
                      className={`w-full ${plan.badge === 'populaire' ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 hover:bg-gray-700'} text-white`}
                      asChild
                    >
                      <Link to={ROUTES.SIGNUP}>
                        {plan.price === 0 ? 'Commencer gratuitement' : 'Choisir ce plan'}
                      </Link>
                    </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          )}
        </div>
      </section>


      {/* CTA Final */}
      <section className="py-16 md:py-20 px-4 md:px-6 bg-white relative overflow-hidden">
        {/* Texture géométrique en arrière-plan - Desktop */}
        <div 
          className="absolute inset-0 opacity-15 hidden md:block"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '50%'
          }}
        />
        {/* Version mobile - texture plus petite pour éviter le flou */}
        <div 
          className="absolute inset-0 opacity-20 md:hidden"
          style={{
            backgroundImage: 'url(/texture.png)',
            backgroundRepeat: 'repeat',
            backgroundSize: '200%'
          }}
        />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Prêt à lancer votre campagne ?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            Rejoignez les professionnels qui ont choisi l'efficacité ciblée
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg w-full sm:w-auto"
              asChild
            >
              <Link to={ROUTES.SIGNUP}>
                Créer mon compte
              </Link>
            </Button>
            <Button 
              size="lg" 
              className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 md:px-8 md:py-4 text-base md:text-lg w-full sm:w-auto"
              asChild
            >
              <Link to={ROUTES.CONTACT}>
                Nous contacter
              </Link>
            </Button>
          </div>

          <div className="mt-6 md:mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-gray-600">
            <div className="flex items-center">
              <Target className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Audience ciblée</span>
            </div>
            <div className="flex items-center">
              <BarChart3 className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Analytics détaillées</span>
            </div>
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">ROI optimisé</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomePartner;

