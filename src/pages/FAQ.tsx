import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ChevronDown, 
  ChevronUp, 
  Users, 
  Home, 
  Megaphone, 
  Search,
  Heart,
  MessageCircle,
  Calendar,
  Settings,
  Camera,
  DollarSign,
  MapPin,
  Star,
  Phone,
  Mail
} from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Interface pour les questions/réponses
 */
interface FAQItem {
  question: string;
  answer: string;
  icon?: React.ReactNode;
}

/**
 * Interface pour les sections FAQ
 */
interface FAQSection {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  items: FAQItem[];
}

/**
 * Page FAQ
 * 
 * @description
 * Page de questions fréquemment posées organisée par sections (Locataires, Propriétaires, Publicitaires).
 * Design minimaliste suivant le thème visuel de l'application.
 * 
 * @example
 * ```tsx
 * <FAQ />
 * ```
 */
const FAQ: React.FC = () => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  /**
   * Toggle l'état d'expansion d'un item FAQ
   */
  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  /**
   * Configuration des sections FAQ
   */
  const faqSections: FAQSection[] = [
    {
      title: "Locataires",
      description: "Questions pour ceux qui cherchent à louer une propriété",
      icon: <Users className="w-6 h-6" />,
      color: "bg-blue-500",
      items: [
        {
          question: "Comment puis-je réserver une propriété sur location-vacance.tn ?",
          answer: "Parcourez nos propriétés disponibles, sélectionnez vos dates de séjour, puis contactez directement le propriétaire via notre plateforme. Vous pouvez également ajouter des propriétés à vos favoris pour les consulter plus tard.",
          icon: <Search className="w-4 h-4" />
        },
        {
          question: "Comment fonctionne le système de favoris ?",
          answer: "Vous pouvez sauvegarder vos propriétés préférées en cliquant sur l'icône cœur. Ces favoris sont accessibles depuis votre dashboard locataire pour faciliter vos futures réservations.",
          icon: <Heart className="w-4 h-4" />
        },
        {
          question: "Puis-je annuler ma réservation ?",
          answer: "Les conditions d'annulation dépendent de chaque propriétaire. Contactez directement le propriétaire pour connaître sa politique d'annulation spécifique.",
          icon: <Calendar className="w-4 h-4" />
        },
        {
          question: "Comment puis-je contacter un propriétaire ?",
          answer: "Une fois connecté à votre compte locataire, vous pouvez contacter les propriétaires directement via le bouton WhatsApp/téléphone disponible sur chaque annonce de propriété.",
          icon: <Phone className="w-4 h-4" />
        },
        {
          question: "Comment gérer mon profil de locataire ?",
          answer: "Accédez à votre dashboard, puis à la section \"Profil\" pour modifier vos informations personnelles, votre photo de profil et vos préférences de contact.",
          icon: <Settings className="w-4 h-4" />
        }
      ]
    },
    {
      title: "Propriétaires",
      description: "Questions pour ceux qui proposent leurs propriétés à la location",
      icon: <Home className="w-6 h-6" />,
      color: "bg-green-500",
      items: [
        {
          question: "Comment publier ma première propriété ?",
          answer: "Connectez-vous à votre dashboard propriétaire, cliquez sur \"Ajouter une propriété\" et suivez l'assistant en 6 étapes : informations de base, localisation, type et capacité, photos, tarification et équipements.",
          icon: <Home className="w-4 h-4" />
        },
        {
          question: "Quels sont les types de propriétés acceptés ?",
          answer: "Nous acceptons tous types de propriétés : villas, appartements, studios, maisons, etc. Chaque propriété doit avoir au minimum 5 photos de qualité et une description détaillée.",
          icon: <Camera className="w-4 h-4" />
        },
        {
          question: "Comment gérer le calendrier de disponibilités de mes propriétés ?",
          answer: "Dans votre dashboard propriétaire, accédez à la section \"Calendrier\" pour bloquer des dates indisponibles, définir vos périodes de maintenance et gérer vos créneaux de réservation en temps réel.",
          icon: <Calendar className="w-4 h-4" />
        },
        {
          question: "Puis-je modifier mes propriétés après publication ?",
          answer: "Oui, accédez à \"Mes Propriétés\" dans votre dashboard pour modifier les informations, photos, tarifs et équipements de vos propriétés à tout moment.",
          icon: <Settings className="w-4 h-4" />
        },
        {
          question: "Comment optimiser la visibilité de mes annonces ?",
          answer: "Utilisez des photos de qualité, rédigez des descriptions attractives, maintenez des tarifs compétitifs et répondez rapidement aux demandes de réservation pour améliorer votre classement.",
          icon: <Star className="w-4 h-4" />
        }
      ]
    },
    {
      title: "Publicitaires",
      description: "Questions pour ceux qui souhaitent promouvoir leurs services",
      icon: <Megaphone className="w-6 h-6" />,
      color: "bg-purple-500",
      items: [
        {
          question: "Comment créer ma première campagne publicitaire ?",
          answer: "Connectez-vous à votre dashboard publicitaire, cliquez sur \"Créer une publicité\" et remplissez le formulaire avec titre, description, type (B2C ou B2B), image et lien vers votre site.",
          icon: <Megaphone className="w-4 h-4" />
        },
        {
          question: "Quelle est la différence entre B2C et B2B ?",
          answer: "B2C : publicités destinées aux vacanciers consultant le site. B2B : publicités destinées aux propriétaires de maisons de vacances pour des services professionnels.",
          icon: <Users className="w-4 h-4" />
        },
        {
          question: "Comment gérer mes campagnes publicitaires ?",
          answer: "Dans votre dashboard, section \"Mes Publicités\", vous pouvez voir toutes vos campagnes, modifier leur statut, éditer leur contenu et suivre leurs performances.",
          icon: <Settings className="w-4 h-4" />
        },
        {
          question: "Quels formats d'images sont acceptés ?",
          answer: "Vous pouvez uploader une image depuis votre ordinateur ou utiliser une URL d'image externe. L'image doit être de bonne qualité et respecter nos guidelines publicitaires.",
          icon: <Camera className="w-4 h-4" />
        },
        {
          question: "Comment contacter l'équipe pour des questions publicitaires ?",
          answer: "Utilisez le formulaire de contact de notre site en précisant votre statut de publicitaire, ou contactez-nous directement à contact@location-vacance.tn pour discuter de vos besoins publicitaires.",
          icon: <Mail className="w-4 h-4" />
        }
      ]
    }
  ];

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Questions Fréquemment Posées
            </h1>
            <p className="text-muted-foreground text-lg max-w-3xl mx-auto">
              Trouvez rapidement les réponses à vos questions concernant l'utilisation de notre plateforme 
              de location de vacances. Organisées par type d'utilisateur pour faciliter votre navigation.
            </p>
          </div>

          {/* Sections FAQ */}
          <div className="space-y-8">
            {faqSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="md:shadow-sm md:border md:border-border md:rounded-lg">
                <div className="md:p-6 p-0">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 rounded-lg text-white" style={{ backgroundColor: 'rgb(50, 50, 58)' }}>
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg md:text-xl text-foreground font-semibold truncate">{section.title}</h2>
                      <p className="text-xs md:text-sm text-muted-foreground font-normal line-clamp-2">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    {section.items.map((item, itemIndex) => {
                      const itemId = `${sectionIndex}-${itemIndex}`;
                      const isExpanded = expandedItems.has(itemId);
                      
                      return (
                        <div key={itemIndex} className="border border-border rounded-lg">
                          <Button
                            variant="ghost"
                            className="w-full justify-between p-4 h-auto text-left hover:bg-transparent group flex items-start"
                            onClick={() => toggleExpanded(itemId)}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {item.icon && (
                                <div className={`flex-shrink-0 ${isExpanded ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`}>
                                  {item.icon}
                                </div>
                              )}
                              <span className={`font-medium flex-1 min-w-0 overflow-hidden text-ellipsis whitespace-nowrap ${isExpanded ? 'text-primary' : 'text-foreground group-hover:text-primary'}`}>
                                {item.question}
                              </span>
                            </div>
                            <div className="flex-shrink-0 ml-2">
                              {isExpanded ? (
                                <ChevronUp className="w-4 h-4 text-primary" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                              )}
                            </div>
                          </Button>
                          
                          {isExpanded && (
                            <>
                              <Separator />
                              <div className="p-4 pt-0">
                                <p className="text-muted-foreground leading-relaxed">
                                  {item.answer}
                                </p>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Section Contact */}
          <div className="mt-16">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-foreground text-center">
                  Vous ne trouvez pas votre réponse ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <p className="text-muted-foreground">
                    Notre équipe est là pour vous aider ! Contactez-nous directement.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild>
                      <a href="/contact">
                        <MessageCircle className="w-4 h-4 mr-2" />
                        Nous contacter
                      </a>
                    </Button>
                    <Button variant="outline" asChild>
                      <a href="mailto:contact@location-vacance.tn">
                        <Mail className="w-4 h-4 mr-2" />
                        Envoyer un email
                      </a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default FAQ;
