import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { getCorsHeaders, getPreflightHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // 🔒 SEC-006: Récupérer l'origine de la requête
  const origin = req.headers.get('origin');
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getPreflightHeaders(origin) })
  }

  try {
    const { accessToken, config } = await req.json()
    
    if (!accessToken) {
      throw new Error('Access token is required')
    }

    if (!config) {
      throw new Error('Configuration is required')
    }

    const GA_PROPERTY_ID = config.propertyId || '507427571'
    
    // Construire l'URL de l'API
    const apiUrl = `https://analyticsdata.googleapis.com/v1beta/properties/${GA_PROPERTY_ID}:runReport`
    
    // Construire le corps de la requête selon la documentation Google Analytics
    const requestBody = {
      dateRanges: config.dateRanges || [{ startDate: '7daysAgo', endDate: 'today' }],
      dimensions: config.dimensions?.map((name: string) => ({ name })) || [],
      metrics: config.metrics?.map((name: string) => ({ name })) || [],
      orderBys: config.orderBys || [],
      limit: config.limit || 10,
      // Ajouter la configuration pour éviter les doublons
      dimensionFilter: {
        filter: {
          fieldName: 'country',
          stringFilter: {
            matchType: 'EXACT',
            value: 'Tunisia'
          }
        }
      }
    }

    // Créer les headers
    const headers = new Headers()
    headers.set('Authorization', `Bearer ${accessToken}`)
    headers.set('Content-Type', 'application/json')

    // Appeler l'API Google Analytics
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody),
    })

    if (!response.ok) {
      const errorText = await response.text()  
      throw new Error(`Analytics API request failed: ${response.status} - ${errorText}`)
    }

    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Google Analytics data retrieval failed'
      }),
      {
        headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
