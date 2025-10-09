import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { MapPin, Mail, MessageCircle, Send, Loader2 } from 'lucide-react';
import { FaFacebookF, FaTiktok } from 'react-icons/fa';
import { GrInstagram } from 'react-icons/gr';
import { RiMessengerFill, RiWhatsappFill } from 'react-icons/ri';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { EmailServiceSecure } from '@/lib/email-service-secure';
import { supabase } from '@/integrations/supabase/client';
import { showSuccess } from '@/lib/appToast';

/**
 * Schéma de validation pour le formulaire de contact
 */
const contactSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  email: z.string()
    .email('Adresse email invalide')
    .min(1, 'L\'email est requis'),
  subject: z.string()
    .min(5, 'Le sujet doit contenir au moins 5 caractères')
    .max(200, 'Le sujet ne peut pas dépasser 200 caractères'),
  message: z.string()
    .min(10, 'Le message doit contenir au moins 10 caractères')
    .max(2000, 'Le message ne peut pas dépasser 2000 caractères'),
});

type ContactFormData = z.infer<typeof contactSchema>;

/**
 * Page de Contact
 * 
 * @description
 * Page de contact avec formulaire d'envoi d'email et informations de contact.
 * Intègre le système d'envoi d'emails sécurisé existant.
 * 
 * @example
 * ```tsx
 * <Contact />
 * ```
 */
const Contact: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      subject: '',
      message: '',
    },
  });

  /**
   * Gestion de la soumission du formulaire
   */
  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    
    try {
      // Vérifier l'authentification avant d'envoyer
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Vous devez être connecté pour envoyer un message de contact.');
      }
      // Préparer le message formaté
      const formattedMessage = `
Nouveau message de contact reçu :

Nom: ${data.name}
Email: ${data.email}
Sujet: ${data.subject}

Message:
${data.message}

---
Envoyé depuis le formulaire de contact de location-vacance.tn
      `.trim();

      // Envoyer l'email via le service sécurisé
      const result = await EmailServiceSecure.sendEmail({
        to: 'contact@location-vacance.tn',
        subject: `[Contact] ${data.subject}`,
        message: formattedMessage,
        isTest: false,
      });

      if (result.success) {
        showSuccess({
          title: "Message envoyé avec succès !",
          description: "Nous vous répondrons dans les plus brefs délais.",
        });
        
        // Réinitialiser le formulaire
        form.reset();
      } else {
        throw new Error(result.error || 'Erreur lors de l\'envoi du message');
      }
    } catch (error) {
      console.error('Erreur envoi contact:', error);
      
      // Gestion des erreurs spécifiques
      let errorTitle = "Impossible d'envoyer le message";
      let errorDescription = "Une erreur est survenue lors de l'envoi du message.";
      
      if (error instanceof Error) {
        if (error.message.includes('non authentifié') || error.message.includes('authentification')) {
          errorTitle = "Connexion requise";
          errorDescription = "Veuillez vous connecter à votre compte pour envoyer un message.";
        } else if (error.message.includes('réseau') || error.message.includes('network')) {
          errorTitle = "Problème de connexion";
          errorDescription = "Vérifiez votre connexion internet et réessayez.";
        } else if (error.message.includes('serveur') || error.message.includes('server')) {
          errorTitle = "Service temporairement indisponible";
          errorDescription = "Notre service d'envoi d'emails est temporairement indisponible. Réessayez plus tard.";
        } else {
          errorDescription = error.message;
        }
      }
      
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Configuration des réseaux sociaux (même style que Footer)
   */
  const socialLinks = [
    {
      icon: FaFacebookF,
      url: 'https://www.facebook.com/LocationVacanceTunise/',
      label: 'Facebook'
    },
    {
      icon: GrInstagram,
      url: 'https://www.instagram.com/locationvacancetunisie/',
      label: 'Instagram'
    },
    {
      icon: FaTiktok,
      url: 'https://www.tiktok.com/@locationvacancetunisie',
      label: 'TikTok'
    },
    {
      icon: RiMessengerFill,
      url: 'https://m.me/698040153403768',
      label: 'Messenger'
    },
    {
      icon: RiWhatsappFill,
      url: 'https://wa.me/21698771239',
      label: 'WhatsApp'
    }
  ];

  /**
   * Composant pour les boutons de réseaux sociaux (même style que Footer)
   */
  const SocialButton: React.FC<{ icon: any; url: string; label: string }> = ({ icon: Icon, url, label }) => (
    <Button 
      size="icon" 
      variant="ghost" 
      className="text-white h-8 w-8" 
      style={{ backgroundColor: '#32323a' }}
      onClick={() => window.open(url, '_blank')}
      aria-label={label}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-6xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Contactez-nous
            </h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Nous sommes là pour vous aider ! N'hésitez pas à nous contacter pour toute question 
              concernant nos services de location de vacances.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Formulaire de contact */}
            <div className="md:shadow-sm md:border md:border-border md:rounded-lg">
              <div className="md:p-6 p-0">
                <div className="flex items-center mb-6">
                  <MessageCircle className="w-6 h-6 mr-2 text-foreground" />
                  <h2 className="text-xl text-foreground font-semibold">Envoyez-nous un message</h2>
                </div>
                <div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Votre nom complet" 
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="votre@email.com" 
                                {...field}
                                disabled={isSubmitting}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sujet *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Sujet de votre message" 
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Décrivez votre demande en détail..."
                              className="min-h-[150px]"
                              {...field}
                              disabled={isSubmitting}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                    
                    <p className="text-xs text-muted-foreground text-center mt-2">
                      Vous devez être connecté à votre compte pour envoyer un message de contact.
                    </p>
                  </form>
                </Form>
                </div>
              </div>
            </div>

            {/* Informations de contact */}
            <div className="space-y-6">
              {/* Adresse */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <MapPin className="w-6 h-6 mr-2" />
                    Notre adresse
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-muted-foreground">
                    <p className="font-medium text-foreground">Location-vacance.tn</p>
                    <p>Avenue Kheireddine Pacha</p>
                    <p>Rue Omar Kaddeh</p>
                    <p>Immeuble le Montplaisir</p>
                    <p>Tunis 1073, Tunisie</p>
                  </div>
                </CardContent>
              </Card>

              {/* Email */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <Mail className="w-6 h-6 mr-2" />
                    Email
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-muted-foreground">
                      Pour toute question ou demande :
                    </p>
                    <a 
                      href="mailto:contact@location-vacance.tn"
                      className="text-primary hover:underline font-medium"
                    >
                      contact@location-vacance.tn
                    </a>
                  </div>
                </CardContent>
              </Card>

              {/* Réseaux sociaux */}
              <Card className="shadow-sm">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground">
                    Suivez-nous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-center">
                    <div className="flex items-center gap-4">
                      {socialLinks.map((social) => (
                        <SocialButton 
                          key={social.label}
                          icon={social.icon} 
                          url={social.url} 
                          label={social.label} 
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Section FAQ rapide */}
          <div className="mt-16">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl text-foreground text-center">
                  Questions fréquentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Comment réserver une propriété ?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Parcourez nos propriétés, sélectionnez vos dates et contactez directement le propriétaire.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Comment devenir propriétaire ?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Créez un compte propriétaire et publiez votre annonce en quelques clics.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Comment publier une publicité ?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Contactez-nous pour discuter de nos options publicitaires et tarifs.
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Temps de réponse ?
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Nous répondons généralement dans les 24 heures ouvrées.
                    </p>
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

export default Contact;
