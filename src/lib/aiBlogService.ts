/**
 * aiBlogService.ts
 * 
 * Service pour la génération de contenu de blog avec l'API Gemini de Google.
 * Permet de générer des extraits, contenus, et autres éléments de blog
 * de manière automatisée et intelligente.
 */

import { GoogleGenerativeAI } from '@google/generative-ai';

// Configuration de l'API Gemini
const genAI = new GoogleGenerativeAI('AIzaSyAAslKH8nkA_CCDZkR-B7ijzpXveozn-AE');
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

// Interface pour les réponses de génération
export interface AIGenerationResponse {
  success: boolean;
  content: string;
  error?: string;
}

// Interface pour les paramètres de génération
export interface GenerationParams {
  title?: string;
  excerpt?: string;
  content?: string;
  category?: string;
  keywords?: string;
}

/**
 * Service pour la génération de contenu de blog avec IA
 */
export class AIBlogService {
  
  /**
   * Génère un extrait accrocheur basé sur un titre
   */
  static async generateExcerpt(params: GenerationParams): Promise<AIGenerationResponse> {
    try {
      if (!params.title) {
        return {
          success: false,
          content: '',
          error: 'Le titre est requis pour générer un extrait'
        };
      }

      const prompt = `
Génère un extrait accrocheur de 150-160 caractères maximum pour un article de blog intitulé "${params.title}" 
sur un site de location de vacances en Tunisie.

Contexte :
- Site spécialisé dans la location de vacances en Tunisie
- Public cible : voyageurs, touristes, familles
- Ton : professionnel, engageant et informatif

L'extrait doit :
- Accrocher l'attention du lecteur
- Résumer les points clés de l'article
- Inclure un appel à l'action subtil
- Être optimisé pour le SEO (150-160 caractères max)
- Être écrit en français
- Être concis et percutant

IMPORTANT : Respecte strictement la limite de 150-160 caractères. Compte les caractères avant de répondre.

Réponds uniquement avec l'extrait généré, sans introduction ni conclusion.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text.trim()
      };

    } catch (error) {
      console.error('Erreur lors de la génération de l\'extrait:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      };
    }
  }

  /**
   * Génère un contenu principal basé sur un extrait
   */
  static async generateContent(params: GenerationParams): Promise<AIGenerationResponse> {
    try {
      if (!params.excerpt) {
        return {
          success: false,
          content: '',
          error: 'L\'extrait est requis pour générer le contenu'
        };
      }

      const prompt = `
Développe l'extrait suivant en un article complet de 1200-1500 mots :

"${params.excerpt}"

Contexte :
- Site de location de vacances en Tunisie
- Public cible : voyageurs, touristes, familles
- Ton : professionnel, informatif et engageant

Structure requise :
1. Introduction accrocheuse (200-250 mots)
2. 3-4 sections principales avec sous-titres H2 (250-300 mots chacune)
3. Conclusion avec appel à l'action (150-200 mots)

Le contenu doit :
- Être structuré avec des titres H2
- Inclure des conseils pratiques
- Mentionner des lieux spécifiques en Tunisie
- Être optimisé pour le SEO
- Être écrit en français

Réponds uniquement avec le contenu HTML généré, incluant les balises H2 pour les sous-titres.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text.trim()
      };

    } catch (error) {
      console.error('Erreur lors de la génération du contenu:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      };
    }
  }

  /**
   * Génère des mots-clés basés sur le contenu
   */
  static async generateKeywords(params: GenerationParams): Promise<AIGenerationResponse> {
    try {
      const content = params.content || params.excerpt || params.title;
      
      if (!content) {
        return {
          success: false,
          content: '',
          error: 'Le contenu est requis pour générer les mots-clés'
        };
      }

      const prompt = `
Extrais les mots-clés principaux du contenu suivant pour un site de location de vacances en Tunisie :

"${content}"

Génère 8-12 mots-clés pertinents :
- Mots-clés principaux liés au tourisme en Tunisie
- Mots-clés de longue traîne
- Mots-clés géographiques
- Mots-clés d'intention

Format de réponse : mots-clés séparés par des virgules
Exemple : location vacances Tunisie, hôtel Sousse, plage Hammamet, séjour famille

Réponds uniquement avec les mots-clés séparés par des virgules.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text.trim()
      };

    } catch (error) {
      console.error('Erreur lors de la génération des mots-clés:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      };
    }
  }

  /**
   * Génère des FAQs basées sur le contenu
   */
  static async generateFAQs(params: GenerationParams): Promise<AIGenerationResponse> {
    try {
      const content = params.content || params.excerpt;
      
      if (!content) {
        return {
          success: false,
          content: '',
          error: 'Le contenu est requis pour générer les FAQs'
        };
      }

      const prompt = `
Génère 5 questions fréquentes pertinentes basées sur ce contenu pour un site de location de vacances en Tunisie :

"${content}"

Format de réponse : JSON avec la structure suivante :
[
  {
    "question": "Question courte et claire",
    "reponse": "Réponse détaillée de 100-150 mots"
  }
]

Les FAQs doivent :
- Être pertinentes au contenu
- Répondre aux préoccupations des voyageurs
- Inclure des informations pratiques sur la Tunisie
- Être écrites en français

Réponds uniquement avec le JSON, sans introduction ni conclusion.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text.trim()
      };

    } catch (error) {
      console.error('Erreur lors de la génération des FAQs:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de la génération'
      };
    }
  }

  /**
   * Teste la connexion à l'API Gemini
   */
  static async testConnection(): Promise<AIGenerationResponse> {
    try {
      const prompt = "Réponds simplement 'Connexion réussie' en français.";
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        content: text.trim()
      };

    } catch (error) {
      console.error('Erreur lors du test de connexion:', error);
      return {
        success: false,
        content: '',
        error: error instanceof Error ? error.message : 'Erreur de connexion à l\'API'
      };
    }
  }
}

export default AIBlogService;
