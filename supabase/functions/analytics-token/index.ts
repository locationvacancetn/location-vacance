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
    const privateKey = Deno.env.get('GOOGLE_ANALYTICS_PRIVATE_KEY')
    const clientEmail = Deno.env.get('GOOGLE_ANALYTICS_CLIENT_EMAIL')
    
    if (!privateKey || !clientEmail) {
      console.error('Missing environment variables:', { 
        hasPrivateKey: !!privateKey, 
        hasClientEmail: !!clientEmail 
      })
      return new Response(
        JSON.stringify({ 
          access_token: 'test_token_missing_env_vars', 
          expires_in: 3600, 
          token_type: 'Bearer' 
        }),
        { headers: { ...getCorsHeaders(origin), 'Content-Type': 'application/json' }, status: 200 }
      )
    }

    // Utiliser google-auth-library pour simplifier
    const { GoogleAuth } = await import('npm:google-auth-library@8.7.0')
    
    const auth = new GoogleAuth({
      credentials: {
        client_email: clientEmail,
        private_key: privateKey.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/analytics.readonly'],
    })

    const client = await auth.getClient()
    const accessToken = (await client.getAccessToken()).token

    if (!accessToken) {
      throw new Error('Failed to obtain access token from Google')
    }

    console.log('✅ Real Google Analytics token obtained successfully!')
    
    return new Response(
      JSON.stringify({
        access_token: accessToken,
        expires_in: 3600,
        token_type: 'Bearer',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('❌ Error in analytics-token:', error.message)
    return new Response(
      JSON.stringify({ 
        access_token: 'test_token_crypto_error', 
        expires_in: 3600, 
        token_type: 'Bearer',
        error: error.message 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  }
})
