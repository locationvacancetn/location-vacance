/**
 * BlogSEO.tsx
 * 
 * Composant SEO spécialisé pour les articles de blog.
 * Génère automatiquement les métadonnées SEO optimisées
 * pour les moteurs de recherche et les réseaux sociaux.
 */

import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Blog } from '@/services/blogService';

interface BlogSEOProps {
  blog: Blog;
  siteUrl?: string;
  siteName?: string;
  authorTwitter?: string;
  siteTwitter?: string;
}

const BlogSEO: React.FC<BlogSEOProps> = ({
  blog,
  siteUrl = 'https://location-vacance.tn',
  siteName = 'Location Vacance Tunisie',
  authorTwitter = '@locationvacance',
  siteTwitter = '@locationvacance'
}) => {
  // Nettoyer et optimiser les données
  const title = blog.meta_titre || blog.titre;
  const description = blog.meta_description || blog.extrait || '';
  const canonicalUrl = blog.url_canonique || `${siteUrl}/blog/${blog.slug}`;
  const imageUrl = blog.image_principale || `${siteUrl}/cover-location-vacance-tn.png`;
  const imageAlt = blog.image_alt || blog.titre;
  
  // Métadonnées Open Graph
  const ogTitle = blog.og_titre || title;
  const ogDescription = blog.og_description || description;
  const ogImage = blog.og_image || imageUrl;
  
  // Métadonnées Twitter
  const twitterTitle = blog.twitter_titre || title;
  const twitterDescription = blog.twitter_description || description;
  const twitterImage = blog.twitter_image || imageUrl;
  
  // Date de publication formatée
  const publishedTime = blog.date_publication ? new Date(blog.date_publication).toISOString() : undefined;
  const modifiedTime = blog.date_mise_a_jour ? new Date(blog.date_mise_a_jour).toISOString() : undefined;
  
  // Mots-clés
  const keywords = blog.mots_cles ? blog.mots_cles.split(',').map(k => k.trim()).join(', ') : '';
  
  // Schema.org JSON-LD pour Article
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": imageUrl,
    "author": {
      "@type": "Person",
      "name": blog.auteur || siteName
    },
    "publisher": {
      "@type": "Organization",
      "name": siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/icons/logo.svg`
      }
    },
    "datePublished": publishedTime,
    "dateModified": modifiedTime,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": canonicalUrl
    },
    "url": canonicalUrl,
    "wordCount": blog.contenu ? blog.contenu.split(' ').length : 0,
    "timeRequired": blog.temps_lecture ? `PT${blog.temps_lecture}M` : undefined,
    "keywords": keywords,
    "articleSection": blog.blog_categories?.nom,
    "inLanguage": "fr-TN"
  };
  
  // Schema.org JSON-LD pour FAQ si disponible
  const faqSchema = blog.blog_faqs && blog.blog_faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": blog.blog_faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.reponse
      }
    }))
  } : null;
  
  // Schema.org JSON-LD pour BreadcrumbList
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Accueil",
        "item": siteUrl
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Blog",
        "item": `${siteUrl}/blog`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": canonicalUrl
      }
    ]
  };

  return (
    <Helmet>
      {/* Métadonnées de base */}
      <title>{title}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Métadonnées Open Graph */}
      <meta property="og:type" content="article" />
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:alt" content={imageAlt} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="fr_TN" />
      {publishedTime && <meta property="article:published_time" content={publishedTime} />}
      {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
      {blog.auteur && <meta property="article:author" content={blog.auteur} />}
      {blog.blog_categories && <meta property="article:section" content={blog.blog_categories.nom} />}
      {blog.blog_tags && blog.blog_tags.map(tag => (
        <meta key={tag.id} property="article:tag" content={tag.nom} />
      ))}
      
      {/* Métadonnées Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={siteTwitter} />
      <meta name="twitter:creator" content={authorTwitter} />
      <meta name="twitter:title" content={twitterTitle} />
      <meta name="twitter:description" content={twitterDescription} />
      <meta name="twitter:image" content={twitterImage} />
      <meta name="twitter:image:alt" content={imageAlt} />
      
      {/* Métadonnées techniques */}
      <meta name="robots" content="index, follow" />
      <meta name="googlebot" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta httpEquiv="Content-Language" content="fr" />
      
      {/* Métadonnées pour les réseaux sociaux */}
      <meta name="theme-color" content="#173B56" />
      <meta name="msapplication-TileColor" content="#173B56" />
      
      {/* Schema.org JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify(articleSchema)}
      </script>
      
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
      
      <script type="application/ld+json">
        {JSON.stringify(breadcrumbSchema)}
      </script>
    </Helmet>
  );
};

export default BlogSEO;
