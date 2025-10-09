import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Page des Conditions Générales d'Utilisation
 * 
 * @description
 * Page légale présentant les conditions générales d'utilisation de la plateforme
 * Location-vacance.tn. Design minimaliste suivant le thème visuel de l'application.
 * 
 * @example
 * ```tsx
 * <TermsOfService />
 * ```
 */
const TermsOfService: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Conditions Générales d'Utilisation
            </h1>
            <p className="text-muted-foreground text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Contenu principal */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Bienvenue sur Location-vacance.tn
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Ces conditions générales d'utilisation régissent l'utilisation de notre plateforme 
                de location de vacances. En accédant à notre site, vous acceptez ces conditions.
              </p>

              <Separator />

              {/* Section 1 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  1. Définitions
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    <strong className="text-foreground">Plateforme :</strong> Le site web location-vacance.tn 
                    et tous ses services associés.
                  </p>
                  <p>
                    <strong className="text-foreground">Utilisateur :</strong> Toute personne accédant 
                    à la plateforme.
                  </p>
                  <p>
                    <strong className="text-foreground">Propriétaire :</strong> Personne proposant 
                    un bien à la location.
                  </p>
                  <p>
                    <strong className="text-foreground">Locataire :</strong> Personne recherchant 
                    un bien à louer.
                  </p>
                  <p>
                    <strong className="text-foreground">Publicitaire :</strong> Personne ou entreprise 
                    proposant des services publicitaires sur la plateforme.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  2. Acceptation des Conditions
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    En utilisant notre plateforme, vous confirmez que vous avez lu, compris et accepté 
                    ces conditions générales d'utilisation.
                  </p>
                  <p>
                    Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser notre service.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  3. Utilisation de la Plateforme
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <h3 className="text-lg font-medium text-foreground">3.1 Utilisation autorisée</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Rechercher et consulter des propriétés disponibles</li>
                    <li>Contacter les propriétaires pour des réservations</li>
                    <li>Publier des annonces de propriétés (propriétaires)</li>
                    <li>Publier des publicités et promotions (publicitaires)</li>
                    <li>Partager des avis et commentaires constructifs</li>
                  </ul>

                  <h3 className="text-lg font-medium text-foreground mt-4">3.2 Utilisation interdite</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Publier des informations fausses ou trompeuses</li>
                    <li>Utiliser la plateforme à des fins illégales</li>
                    <li>Contourner les mesures de sécurité</li>
                    <li>Harceler ou menacer d'autres utilisateurs</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  4. Comptes Utilisateurs
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Pour utiliser certaines fonctionnalités, vous devez créer un compte. 
                    Vous êtes responsable de maintenir la confidentialité de vos identifiants.
                  </p>
                  <p>
                    Vous devez fournir des informations exactes et à jour lors de l'inscription.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 5 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  5. Responsabilité
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Location-vacance.tn agit comme intermédiaire entre propriétaires et locataires. 
                    Nous ne sommes pas responsables des dommages causés par les propriétés ou leurs propriétaires.
                  </p>
                  <p>
                    Les utilisateurs utilisent la plateforme à leurs propres risques.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  6. Propriété Intellectuelle
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Tous les contenus de la plateforme (textes, images, logos) sont protégés 
                    par les droits de propriété intellectuelle.
                  </p>
                  <p>
                    Vous ne pouvez pas reproduire ou distribuer nos contenus sans autorisation écrite.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  7. Modification des Conditions
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nous nous réservons le droit de modifier ces conditions à tout moment. 
                    Les modifications prendront effet dès leur publication sur la plateforme.
                  </p>
                  <p>
                    Il est de votre responsabilité de consulter régulièrement ces conditions.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  8. Contact
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Pour toute question concernant ces conditions générales, vous pouvez nous contacter :
                  </p>
                  <div className="bg-muted p-4 rounded-lg">
                    <p><strong className="text-foreground">Email :</strong> contact@location-vacance.tn</p>
                    <p><strong className="text-foreground">Site web :</strong> www.location-vacance.tn</p>
                  </div>
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default TermsOfService;
