import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface DeleteUserRequest {
  userId: string;
  adminUserId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Parse request body
    const { userId, adminUserId }: DeleteUserRequest = await req.json()

    // Validate required fields
    if (!userId || !adminUserId) {
      return new Response(
        JSON.stringify({ 
          error: 'Les champs userId et adminUserId sont requis' 
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Vérifier que l'admin a les permissions
    const { data: adminProfile, error: adminError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('user_id', adminUserId)
      .single()

    if (adminError || !adminProfile) {
      return new Response(
        JSON.stringify({ 
          error: 'Admin non trouvé' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (adminProfile.role !== 'admin' || !adminProfile.is_active) {
      return new Response(
        JSON.stringify({ 
          error: 'Permissions insuffisantes' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Vérifier que l'utilisateur à supprimer existe et n'est pas un admin
    const { data: userProfile, error: userError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('user_id', userId)
      .single()

    if (userError || !userProfile) {
      return new Response(
        JSON.stringify({ 
          error: 'Utilisateur non trouvé' 
        }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (userProfile.role === 'admin') {
      return new Response(
        JSON.stringify({ 
          error: 'Impossible de supprimer un administrateur' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Vérifier qu'il reste au moins un admin actif après suppression
    const { data: adminCount, error: countError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('role', 'admin')
      .eq('is_active', true)
      .neq('user_id', userId)

    if (countError || !adminCount || adminCount.length < 1) {
      return new Response(
        JSON.stringify({ 
          error: 'Impossible de supprimer le dernier administrateur actif' 
        }),
        { 
          status: 403, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Supprimer le profil de la base de données
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId)

    if (profileError) {
      throw profileError
    }

    // Supprimer l'utilisateur de l'authentification Supabase
    const { error: authError } = await supabase.auth.admin.deleteUser(userId)

    if (authError) {
      console.warn('Erreur lors de la suppression de l\'utilisateur auth:', authError)
      // On continue même si la suppression auth échoue, le profil est déjà supprimé
    }

    // Log success
    console.log(`Utilisateur supprimé avec succès: ${userId}`, {
      adminUserId,
      timestamp: new Date().toISOString(),
      authDeleted: !authError
    })

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Utilisateur supprimé avec succès',
        userId,
        authDeleted: !authError
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    // Log error
    console.error('Erreur lors de la suppression de l\'utilisateur:', error)

    return new Response(
      JSON.stringify({ 
        error: error.message || 'Erreur lors de la suppression de l\'utilisateur',
        details: error.toString()
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
