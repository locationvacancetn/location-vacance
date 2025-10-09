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
  Home, 
  Users, 
  Star, 
  Calculator,
  ArrowRight,
  Shield,
  Clock,
  Heart,
  TrendingUp,
  Zap,
  Mouse,
  X,
  Check,
  Percent
} from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { ROUTES } from '@/constants/routes';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { getAllSubscriptionPlans } from '@/lib/subscriptionService';

/**
 * Page "Devenir Hôte" - Mise en relation directe sans commission
 * 
 * @description
 * Page marketing pour attirer les propriétaires en mettant l'accent sur
 * l'absence de commission et le contact direct avec les locataires.
 * 
 * @example
 * ```tsx
 * <BecomeHost />
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

const BecomeHost: React.FC = () => {
  const [savings, setSavings] = useState<number>(1000);
  const [monthlyRevenue, setMonthlyRevenue] = useState<number>(1000);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Calcul des économies (20% de commission évitée)
  const monthlySavings = Math.round(monthlyRevenue * 0.20);
  const yearlySavings = monthlySavings * 12;

  // Récupération des plans d'abonnement actifs de type "Mise en ligne d'annonce"
  useEffect(() => {
    const loadPlans = async () => {
      try {
        const result = await getAllSubscriptionPlans();
        if (result.success && result.plans) {
          // Filtrer uniquement les plans actifs de type "Mise en ligne d'annonce" et les trier par prix
          const activePlans = result.plans
            .filter((plan: any) => 
              plan.is_active && 
              plan.product && 
              plan.product.name === "Mise en ligne d'annonce"
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
                  Devenez hôte et louez
                  <span className="text-green-600 block">sans commission</span>
                </h1>
                <p className="text-lg md:text-xl text-gray-600 leading-relaxed">
                  Publiez votre maison de vacances, recevez vos clients directement sur WhatsApp.
                </p>
              </div>

              <div className="flex justify-start order-3 lg:order-2">
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
                  src="/host (3).jpg" 
                  alt="Intérieur cosy d'une maison d'hôtes" 
                  className="w-full h-96 object-cover"
                />
              </div>
              
              {/* Hints superposés - Responsive */}
               {/* Hint 1 - Top right */}
               <div className="absolute bg-green-600 text-white px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base top-4 right-4 md:top-12 md:-right-8">
                 <CheckCircle className="h-4 w-4 md:h-5 md:w-5" />
                 <span className="font-semibold">0% Commission</span>
               </div>
               
               {/* Hint 2 - Bottom right */}
               <div className="absolute bg-white text-green-600 px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base bottom-24 right-4 md:bottom-40 md:-right-12">
                 <FaWhatsapp className="h-4 w-4 md:h-5 md:w-5" />
                 <span className="font-semibold">Contact Direct</span>
               </div>
              
              {/* Hint 3 - Bottom left */}
              <div className="absolute text-white px-3 py-2 md:px-4 rounded-full shadow-lg flex items-center space-x-2 text-sm md:text-base bottom-4 left-4 md:bottom-12 md:-left-4" 
                   style={{ backgroundColor: 'rgb(50 50 58)' }}>
                <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                <span className="font-semibold">100% Revenus</span>
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
              Comparez et découvrez pourquoi nos propriétaires nous font confiance
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
                   <span className="text-4xl font-bold">15-20%</span>
                   <span className="ml-2">de commission</span>
                 </div>
                 <ul className="space-y-2 text-gray-600">
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Commission sur chaque réservation
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Frais cachés et surprises
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Contact indirect avec locataires
                   </li>
                   <li className="flex items-center">
                     <X className="mr-2 h-4 w-4" />
                     Paiements retardés
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
                   <span className="text-4xl font-bold">0%</span>
                   <span className="ml-2">de commission</span>
                 </div>
                 <ul className="space-y-2 text-gray-600">
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Aucune commission, jamais
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Transparence totale
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Contact direct avec locataires
                   </li>
                   <li className="flex items-center">
                     <Check className="mr-2 h-4 w-4" />
                     Paiements sécurisés via 2ClicToPay
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
               3 étapes vous séparent du succès
             </p>
           </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                step: "1",
                title: "Publiez votre annonce",
                description: "En quelques étapes simples, ajoutez photos et description de votre propriété"
              },
              {
                step: "2", 
                title: "Recevez des appels",
                description: "Les locataires vous contactent directement sur WhatsApp ou par téléphone"
              },
              {
                step: "3",
                title: "Recevez vos locataires",
                description: "Assurez l'accueil et gérez vos réservations en toute liberté"
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

      {/* Calculateur d'économies */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
             <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: 'rgb(50 50 58)' }}>
               Calculez <span className="text-green-600">vos économies</span>
             </h2>
             <p className="text-lg md:text-xl text-gray-600">
               Découvrez combien vous gagnez chaque année
             </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Revenus par nuitée de votre propriété (TND)
                </label>
                <Input
                  type="number"
                  value={monthlyRevenue}
                  onChange={(e) => setMonthlyRevenue(Number(e.target.value))}
                  className="text-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
                <div className="text-center p-4 md:p-6 rounded-lg border">
                  <div className="text-xs md:text-sm mb-2"><span className="text-xl md:text-2xl font-bold">10%</span> Commission</div>
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {Math.round(monthlyRevenue * 0.10).toLocaleString()} TND
                  </div>
                  <div className="text-xs md:text-sm">Perte par nuitée</div>
                </div>
                <div className="text-center p-4 md:p-6 rounded-lg border">
                  <div className="text-xs md:text-sm mb-2"><span className="text-xl md:text-2xl font-bold">15%</span> Commission</div>
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {Math.round(monthlyRevenue * 0.15).toLocaleString()} TND
                  </div>
                  <div className="text-xs md:text-sm">Perte par nuitée</div>
                </div>
                <div className="text-center p-4 md:p-6 rounded-lg border">
                  <div className="text-xs md:text-sm mb-2"><span className="text-xl md:text-2xl font-bold">20%</span> Commission</div>
                  <div className="text-2xl md:text-3xl font-bold text-red-600">
                    {Math.round(monthlyRevenue * 0.20).toLocaleString()} TND
                  </div>
                  <div className="text-xs md:text-sm">Perte par nuitée</div>
                </div>
              </div>

               <div className="text-center">
                 <p className="text-gray-600">
                   Avec Location-vacance.tn, vous gardez <strong>100% de vos revenus</strong> !
                 </p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Avantages de la plateforme */}
      <section className="py-12 md:py-16 px-4 md:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Des outils professionnels pour <span className="text-green-600">maximiser vos revenus</span>
            </h2>
            <p className="text-lg md:text-xl text-gray-600">
              Tout ce dont vous avez besoin pour réussir dans la location saisonnière
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            {/* Liste 1 - Gestion & Présentation */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Home className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Page dédiée pour chaque annonce</h3>
                  <p className="text-sm md:text-base text-gray-600">Une page web personnalisée et professionnelle pour chaque propriété avec votre propre URL</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Users className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Gestion multi-propriétés</h3>
                  <p className="text-sm md:text-base text-gray-600">Publiez et gérez plusieurs propriétés simultanément depuis votre tableau de bord</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Star className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Photos haute qualité</h3>
                  <p className="text-sm md:text-base text-gray-600">Mettez en valeur vos propriétés avec de nombreuses photos pour attirer plus de clients</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Clock className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Calendrier de disponibilité</h3>
                  <p className="text-sm md:text-base text-gray-600">Gérez facilement vos réservations avec un calendrier interactif et à jour</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Calculator className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Statistiques détaillées</h3>
                  <p className="text-sm md:text-base text-gray-600">Suivez vos performances avec des statistiques de vues, appels et réservations</p>
                </div>
              </div>
            </div>

            {/* Liste 2 - Marketing & Communication */}
            <div className="space-y-4 md:space-y-6">
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <TrendingUp className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Sponsoring Facebook & Instagram</h3>
                  <p className="text-sm md:text-base text-gray-600">Boostez votre visibilité avec nos campagnes publicitaires sur les réseaux sociaux</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Zap className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Référencement SEO optimisé</h3>
                  <p className="text-sm md:text-base text-gray-600">Vos annonces apparaissent en premier sur Google et les moteurs de recherche</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <MessageCircle className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Bouton WhatsApp intégré</h3>
                  <p className="text-sm md:text-base text-gray-600">Contact direct et instantané avec vos futurs locataires via WhatsApp ou par téléphone</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 md:space-x-4">
                <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Shield className="h-4 w-4 md:h-5 md:w-5" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-bold text-gray-900 mb-1 md:mb-2">Assistance 24/7</h3>
                  <p className="text-sm md:text-base text-gray-600">Une équipe dédiée disponible à tout moment pour vous accompagner</p>
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
              Des solutions adaptées à chaque étape de votre activité de location
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
            Prêt à commencer ?
          </h2>
          <p className="text-lg md:text-xl text-gray-600 mb-6 md:mb-8">
            Rejoignez les propriétaires qui ont choisi la liberté financière
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
              <span className="mr-0 h-4 w-4 md:h-5 md:w-5 flex items-center justify-center text-gray-600 font-bold">0</span>
              <Percent className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">de commission</span>
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Validation rapide</span>
            </div>
            <div className="flex items-center">
              <Zap className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Résultats immédiats</span>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};

export default BecomeHost;
