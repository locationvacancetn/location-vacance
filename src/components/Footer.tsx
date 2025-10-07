import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronRight } from 'lucide-react';
import { FaFacebookF, FaTiktok } from 'react-icons/fa';
import { GrInstagram } from 'react-icons/gr';
import { RiMessengerFill } from 'react-icons/ri';
import { NavigationLink, SocialLink, Language, Currency, FooterProps } from '@/types/footer';

/**
 * Composant Footer réutilisable pour l'application Location Vacance
 * 
 * @description
 * Footer complet avec navigation, informations légales, réseaux sociaux
 * et sélecteurs de langue/devise. Suit les bonnes pratiques de développement.
 * 
 * @example
 * ```tsx
 * <Footer />
 * ```
 */
const Footer: React.FC<FooterProps> = ({ className }) => {
  // États locaux pour la langue et la devise
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("français");
  const [selectedCurrency, setSelectedCurrency] = useState<Currency>("TND");

  /**
   * Fonction utilitaire pour afficher la devise avec son symbole
   * @param currency - Code de la devise (TND, USD, EUR)
   * @returns String formatée avec symbole
   */
  const getCurrencyDisplay = (currency: string): string => {
    switch (currency) {
      case "USD": return "$ USD";
      case "EUR": return "€ EUR";
      case "TND": 
      default: return "TND";
    }
  };

  /**
   * Configuration des liens de navigation
   */
  const navigationLinks: NavigationLink[] = [
    { to: "/", label: "Accueil" },
    { to: "/blog", label: "Blog" },
    { to: "/faq", label: "FAQ" },
    { to: "/contact", label: "Contact" }
  ];

  const informationLinks: NavigationLink[] = [
    { to: "/terms", label: "Conditions générales" },
    { to: "/cancellation", label: "Politique d'annulation" },
    { to: "/privacy", label: "Confidentialité" }
  ];

  const hostLinks: NavigationLink[] = [
    { to: "/host", label: "Proposer mon bien" }
  ];

  const partnerLinks: NavigationLink[] = [
    { to: "/advertiser", label: "Publier mon annonce" }
  ];

  /**
   * Configuration des réseaux sociaux
   */
  const socialLinks: SocialLink[] = [
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
    }
  ];

  /**
   * Composant réutilisable pour les liens de navigation
   */
  const NavigationLink: React.FC<NavigationLink> = ({ to, label }) => (
    <li>
      <Link 
        to={to} 
        className="text-gray-600 hover:font-bold text-sm transition-all duration-200 flex items-center md:justify-center justify-start group"
        onMouseEnter={(e) => e.currentTarget.style.color = 'rgb(30, 174, 90)'}
        onMouseLeave={(e) => e.currentTarget.style.color = 'rgb(107, 114, 128)'}
      >
        <ChevronRight className="w-3 h-3 mr-2" />
        {label}
      </Link>
    </li>
  );

  /**
   * Composant pour les boutons de réseaux sociaux
   */
  const SocialButton: React.FC<SocialLink> = ({ icon: Icon, url, label }) => (
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
    <footer className={`mt-16 py-12 px-4 md:px-6 bg-white ${className || ''}`}>
      <div className="max-w-6xl mx-auto">
        {/* Section principale du footer */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          {/* Section 1 - Logo et description */}
          <div>
            <div className="mb-4">
              <img 
                src="/icons/logo.svg" 
                alt="Location Vacance Logo" 
                className="h-10 w-auto md:h-16"
              />
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Découvrez des propriétés exceptionnelles pour vos vacances de rêve. 
              Des séjours inoubliables vous attendent.
            </p>
            <div className="flex items-center gap-3">
              <Button 
                size="sm" 
                className="text-white border-white hover:text-white" 
                style={{ backgroundColor: '#1EAE5A' }} 
                variant="outline"
              >
                Nous contacter
              </Button>
            </div>
          </div>

          {/* Section 2 - Navigation */}
          <div className="md:text-center text-left">
            <h3 className="text-gray-900 font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              {navigationLinks.map((link) => (
                <NavigationLink key={link.to} to={link.to} label={link.label} />
              ))}
            </ul>
          </div>

          {/* Section 3 - Informations */}
          <div className="md:text-center text-left">
            <h3 className="text-gray-900 font-semibold mb-4">Informations</h3>
            <ul className="space-y-2">
              {informationLinks.map((link) => (
                <NavigationLink key={link.to} to={link.to} label={link.label} />
              ))}
            </ul>
            {/* Logo 2ClicToPay en noir et blanc */}
            <div className="mt-6 flex md:justify-center justify-start">
              <img 
                src="/2ClicToPay_logo.webp" 
                alt="2ClicToPay Logo" 
                className="h-10 w-auto md:h-12 filter grayscale"
              />
            </div>
          </div>

          {/* Section 4 - Devenir Hôte et Partenaire */}
          <div className="md:text-center text-left">
            <div className="mb-6">
              <h3 className="text-gray-900 font-semibold mb-2">Devenir Hôte</h3>
              <ul className="space-y-2">
                {hostLinks.map((link) => (
                  <NavigationLink key={link.to} to={link.to} label={link.label} />
                ))}
              </ul>
            </div>
            <div className="mb-6">
              <h3 className="text-gray-900 font-semibold mb-2">Devenir Partenaire</h3>
              <ul className="space-y-2">
                {partnerLinks.map((link) => (
                  <NavigationLink key={link.to} to={link.to} label={link.label} />
                ))}
              </ul>
            </div>
            
            {/* Réseaux sociaux */}
            <div className="mt-6 flex justify-center">
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
          </div>
        </div>

        {/* Séparateur */}
        <div className="border-t border-gray-300 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            
            {/* Copyright */}
            <div className="text-gray-500 text-sm">
              Location-vacance.tn | Tous droits réservés.
            </div>

            {/* Sélecteurs de langue et devise */}
            <div className="flex items-center gap-6">                
              <div className="flex items-center gap-4 text-sm">
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="w-24 bg-transparent text-gray-500 hover:text-gray-900 h-auto px-2 py-1 text-sm [&>svg]:ml-2 rounded" style={{ border: '1px solid hsl(214.3 31.8% 91.4%)' }}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="français">Français</SelectItem>
                    <SelectItem value="anglais">Anglais</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="w-24 bg-transparent text-gray-500 hover:text-gray-900 h-auto px-2 py-1 text-sm [&>svg]:ml-2 rounded" style={{ border: '1px solid hsl(214.3 31.8% 91.4%)' }}>
                    <span>{getCurrencyDisplay(selectedCurrency)}</span>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TND">TND</SelectItem>
                    <SelectItem value="USD">$ USD</SelectItem>
                    <SelectItem value="EUR">€ EUR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
