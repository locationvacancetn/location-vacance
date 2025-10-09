import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, FileText, Users, CreditCard, Lock, Eye, Database, Cookie, Globe, Baby, Clock, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import ScrollToTop from '@/components/ScrollToTop';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

/**
 * Page de la Politique de Confidentialité
 * 
 * @description
 * Page légale présentant la politique de confidentialité de la plateforme
 * Location-vacance.tn. Design minimaliste suivant le thème visuel de l'application.
 * 
 * @example
 * ```tsx
 * <PrivacyPolicy />
 * ```
 */
const PrivacyPolicy: React.FC = () => {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Politique de Confidentialité
            </h1>
            <p className="text-muted-foreground text-lg">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>

          {/* Contenu principal */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl text-foreground">
                Protection de vos Données Personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Chez Location-vacance.tn, accessible depuis https://location-vacance.tn, l'une de nos priorités principales 
                est la confidentialité de nos visiteurs. Ce document de politique de confidentialité contient les types 
                d'informations qui sont collectées et enregistrées par Location-vacance.tn, ainsi que la manière dont nous les utilisons.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Si vous avez des questions supplémentaires ou si vous avez besoin de plus d'informations concernant notre 
                politique de confidentialité, n'hésitez pas à nous contacter.
              </p>

              <Separator />

              {/* Section 1 - RGPD */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  1. Règlement Général sur la Protection des Données (RGPD)
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nous sommes responsables du traitement de vos informations personnelles.
                  </p>
                  <p>
                    La base légale sur laquelle Location-vacance.tn collecte et utilise les informations personnelles 
                    décrites dans cette politique de confidentialité dépend des informations personnelles que nous 
                    collectons et du contexte spécifique dans lequel nous les recueillons :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Location-vacance.tn a besoin de réaliser un contrat avec vous</li>
                    <li>Vous avez donné la permission à Location-vacance.tn de le faire</li>
                    <li>Le traitement de vos informations personnelles est dans les intérêts légitimes de Location-vacance.tn</li>
                    <li>Location-vacance.tn a besoin de se conformer à la loi</li>
                  </ul>
                  <p>
                    Location-vacance.tn conservera vos informations personnelles uniquement le temps nécessaire aux fins 
                    énoncées dans cette politique de confidentialité. Nous conserverons et utiliserons vos informations 
                    dans la mesure nécessaire pour respecter nos obligations légales, résoudre des litiges, et appliquer nos politiques.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 2 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  2. Données Collectées
                </h2>
                <div className="space-y-4">
                  <div className="border border-border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                      <FileText className="w-5 h-5 mr-2" />
                      Informations d'Identification
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Nom complet et prénom</li>
                      <li>Adresse email</li>
                      <li>Numéro de téléphone</li>
                      <li>Date de naissance (si nécessaire)</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                      <Users className="w-5 h-5 mr-2" />
                      Informations de Réservation
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Dates de séjour</li>
                      <li>Nombre de voyageurs</li>
                      <li>Préférences de logement</li>
                      <li>Historique des réservations</li>
                    </ul>
                  </div>

                  <div className="border border-border rounded-lg p-4">
                    <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                      <CreditCard className="w-5 h-5 mr-2" />
                      Informations de Paiement
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                      <li>Informations de facturation</li>
                      <li>Méthodes de paiement (sécurisées)</li>
                      <li>Historique des transactions</li>
                    </ul>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 3 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  3. Utilisation des Données
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <h3 className="text-lg font-medium text-foreground">Nous utilisons vos données pour :</h3>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Traiter vos réservations et paiements</li>
                    <li>Vous fournir un service client de qualité</li>
                    <li>Personnaliser votre expérience utilisateur</li>
                    <li>Envoyer des confirmations et mises à jour</li>
                    <li>Améliorer nos services et fonctionnalités</li>
                    <li>Respecter nos obligations légales</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Section 4 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  4. Partage des Données
                </h2>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-green-900 mb-2 flex items-center">
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Partage Autorisé
                    </h3>
                    <ul className="list-disc list-inside space-y-1 text-green-800 ml-4">
                      <li>Avec les propriétaires pour faciliter les réservations</li>
                      <li>Avec nos partenaires de paiement (2ClicToPay)</li>
                      <li>Avec les services de support technique</li>
                      <li>En cas d'obligation légale</li>
                    </ul>
                  </div>

                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h3 className="text-lg font-medium text-red-900 mb-2 flex items-center">
                      <XCircle className="w-5 h-5 mr-2" />
                      Nous ne vendons JAMAIS vos données
                    </h3>
                    <p className="text-red-800">
                      Vos données personnelles ne sont jamais vendues à des tiers à des fins commerciales.
                    </p>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 5 - Fichiers journaux */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  5. Fichiers Journaux (Log Files)
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Location-vacance.tn suit une procédure standard d'utilisation des fichiers journaux. 
                    Ces fichiers enregistrent les visiteurs lorsqu'ils visitent des sites web. Tous les services 
                    d'hébergement font cela dans le cadre de l'analyse des services d'hébergement.
                  </p>
                  <p>
                    Les informations collectées par les fichiers journaux incluent :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Les adresses de protocole Internet (IP)</li>
                    <li>Le type de navigateur</li>
                    <li>Le fournisseur de services Internet (ISP)</li>
                    <li>L'horodatage</li>
                    <li>Les pages de référence/de sortie</li>
                    <li>Éventuellement le nombre de clics</li>
                  </ul>
                  <p>
                    Ces informations ne sont pas liées à des informations personnellement identifiables. 
                    L'objectif de ces informations est d'analyser les tendances, d'administrer le site, 
                    de suivre les mouvements des utilisateurs sur le site, et de recueillir des informations démographiques.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 6 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  6. Sécurité des Données
                </h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="border border-border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                        <Lock className="w-5 h-5 mr-2" />
                        Chiffrement SSL
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Toutes les communications sont chiffrées avec SSL/TLS
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                        <Shield className="w-5 h-5 mr-2" />
                        Accès Restreint
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Accès aux données limité au personnel autorisé
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                        <Database className="w-5 h-5 mr-2" />
                        Stockage Sécurisé
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Données stockées sur des serveurs sécurisés
                      </p>
                    </div>

                    <div className="border border-border rounded-lg p-4">
                      <h3 className="text-lg font-medium text-foreground mb-2 flex items-center">
                        <Eye className="w-5 h-5 mr-2" />
                        Surveillance Continue
                      </h3>
                      <p className="text-muted-foreground text-sm">
                        Surveillance 24/7 des systèmes de sécurité
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 7 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  7. Vos Droits
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <h3 className="text-lg font-medium text-foreground">Conformément au RGPD, vous avez le droit de :</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Droit d'accès</Badge>
                      </div>
                      <p className="text-sm">Consulter vos données personnelles</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Droit de rectification</Badge>
                      </div>
                      <p className="text-sm">Corriger des informations inexactes</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Droit à l'effacement</Badge>
                      </div>
                      <p className="text-sm">Supprimer vos données</p>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="text-xs">Droit à la portabilité</Badge>
                      </div>
                      <p className="text-sm">Récupérer vos données</p>
                    </div>
                  </div>
                </div>
              </section>

              <Separator />

              {/* Section 8 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  8. Cookies et Technologies Similaires
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Comme tout autre site web, Location-vacance.tn utilise des « cookies ». Ces cookies sont utilisés 
                    pour stocker des informations, y compris les préférences des visiteurs et les pages du site web 
                    que le visiteur a consultées ou visitées. Ces informations sont utilisées pour optimiser l'expérience 
                    des utilisateurs en personnalisant le contenu de notre page web en fonction du type de navigateur 
                    des visiteurs et/ou d'autres informations.
                  </p>
                  <p>
                    Nous utilisons différents types de cookies :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Cookies essentiels :</strong> Nécessaires au fonctionnement du site</li>
                    <li><strong>Cookies de performance :</strong> Pour analyser l'utilisation du site</li>
                    <li><strong>Cookies de fonctionnalité :</strong> Pour mémoriser vos préférences</li>
                    <li><strong>Cookies publicitaires :</strong> Pour personnaliser les publicités</li>
                  </ul>
                  <p className="mt-4">
                    Vous pouvez choisir de désactiver les cookies via les options de votre navigateur. 
                    Pour obtenir plus d'informations détaillées sur la gestion des cookies avec des navigateurs 
                    spécifiques, vous pouvez consulter les sites web respectifs de ces navigateurs.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 9 - Politiques de confidentialité des tiers */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  9. Politiques de Confidentialité des Tiers
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    La politique de confidentialité de Location-vacance.tn ne s'applique pas aux autres annonceurs ou sites web. 
                    Nous vous conseillons donc de consulter les politiques de confidentialité respectives de ces serveurs 
                    publicitaires tiers pour obtenir plus d'informations détaillées.
                  </p>
                  <p>
                    Les serveurs publicitaires ou réseaux publicitaires tiers utilisent des technologies comme les cookies, 
                    JavaScript, ou balises web qui sont utilisées dans leurs publicités respectives et les liens qui apparaissent 
                    sur Location-vacance.tn, envoyés directement au navigateur des utilisateurs. Ils reçoivent automatiquement 
                    votre adresse IP lorsque cela se produit.
                  </p>
                  <p>
                    Notez que Location-vacance.tn n'a aucun accès ni contrôle sur ces cookies utilisés par des annonceurs tiers.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 10 - Informations pour les enfants */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  10. Informations pour les Enfants
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Une autre partie de notre priorité est d'ajouter une protection pour les enfants lors de l'utilisation d'Internet. 
                    Nous encourageons les parents et les tuteurs à observer, à participer et/ou à surveiller et guider leur activité en ligne.
                  </p>
                  <p>
                    Location-vacance.tn ne collecte pas sciemment d'informations personnelles identifiables d'enfants de moins de 13 ans. 
                    Si vous pensez que votre enfant a fourni ce type d'informations sur notre site web, nous vous encourageons fortement 
                    à nous contacter immédiatement et nous ferons de notre mieux pour supprimer rapidement ces informations de nos dossiers.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 11 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  11. Conservation des Données
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nous conservons vos données personnelles uniquement le temps nécessaire aux finalités 
                    pour lesquelles elles ont été collectées :
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li><strong>Comptes actifs :</strong> Pendant la durée de votre compte</li>
                    <li><strong>Réservations :</strong> 3 ans après la dernière transaction</li>
                    <li><strong>Données de facturation :</strong> 10 ans (obligation légale)</li>
                  </ul>
                </div>
              </section>

              <Separator />

              {/* Section 12 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  12. Politique de Confidentialité en Ligne Uniquement
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Notre politique de confidentialité s'applique uniquement à nos activités en ligne et est valable 
                    pour les visiteurs de notre site web en ce qui concerne les informations qu'ils partagent et/ou 
                    collectent sur Location-vacance.tn. Cette politique ne s'applique pas aux informations collectées 
                    hors ligne ou via des canaux autres que ce site web.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 13 */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  13. Modifications de cette Politique
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    Nous pouvons modifier cette politique de confidentialité pour refléter les changements 
                    dans nos pratiques ou pour d'autres raisons opérationnelles, légales ou réglementaires.
                  </p>
                  <p>
                    Nous vous informerons de tout changement significatif par email ou via notre site web.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Section 14 - Consentement */}
              <section>
                <h2 className="text-xl font-semibold text-foreground mb-4">
                  14. Consentement
                </h2>
                <div className="space-y-3 text-muted-foreground">
                  <p>
                    En utilisant notre site web, vous consentez par la présente à notre politique de confidentialité 
                    et acceptez ses termes.
                  </p>
                </div>
              </section>

              <Separator />

              {/* Note importante */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="text-lg font-medium text-blue-900 mb-2 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2" />
                  Information Importante
                </h3>
                <p className="text-blue-800">
                  Cette politique de confidentialité est conforme au Règlement Général sur la Protection 
                  des Données (RGPD) et aux lois tunisiennes sur la protection des données personnelles.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default PrivacyPolicy;
