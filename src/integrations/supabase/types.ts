export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      advertisements: {
        Row: {
          ad_type: string
          advertiser_id: string
          created_at: string | null
          description: string
          id: string
          image_url: string | null
          link_url: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ad_type: string
          advertiser_id: string
          created_at?: string | null
          description: string
          id?: string
          image_url?: string | null
          link_url: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ad_type?: string
          advertiser_id?: string
          created_at?: string | null
          description?: string
          id?: string
          image_url?: string | null
          link_url?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      email_config: {
        Row: {
          created_at: string | null
          created_by: string | null
          from_email: string
          from_name: string | null
          id: number
          is_active: boolean | null
          is_ssl: boolean | null
          smtp_host: string
          smtp_password: string
          smtp_port: number
          smtp_user: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          from_email: string
          from_name?: string | null
          id?: number
          is_active?: boolean | null
          is_ssl?: boolean | null
          smtp_host: string
          smtp_password: string
          smtp_port?: number
          smtp_user: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          from_email?: string
          from_name?: string | null
          id?: number
          is_active?: boolean | null
          is_ssl?: boolean | null
          smtp_host?: string
          smtp_password?: string
          smtp_port?: number
          smtp_user?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      equipments: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      konnect_config: {
        Row: {
          created_at: string
          created_by: string | null
          environment: string
          id: string
          is_active: boolean
          production_api_key: string | null
          production_wallet_id: string | null
          sandbox_api_key: string | null
          sandbox_wallet_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          production_api_key?: string | null
          production_wallet_id?: string | null
          sandbox_api_key?: string | null
          sandbox_wallet_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          environment?: string
          id?: string
          is_active?: boolean
          production_api_key?: string | null
          production_wallet_id?: string | null
          sandbox_api_key?: string | null
          sandbox_wallet_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          business_email: string | null
          business_phone: string | null
          city: string | null
          company_name: string | null
          company_website: string | null
          created_at: string
          email: string
          facebook_url: string | null
          full_name: string | null
          id: string
          instagram_url: string | null
          is_active: boolean
          last_sign_in_at: string | null
          linkedin_url: string | null
          messenger_url: string | null
          phone: string | null
          postal_code: string | null
          role: string
          spoken_languages: string[] | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          user_id: string
          website_url: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          last_sign_in_at?: string | null
          linkedin_url?: string | null
          messenger_url?: string | null
          phone?: string | null
          postal_code?: string | null
          role: string
          spoken_languages?: string[] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          business_email?: string | null
          business_phone?: string | null
          city?: string | null
          company_name?: string | null
          company_website?: string | null
          created_at?: string
          email?: string
          facebook_url?: string | null
          full_name?: string | null
          id?: string
          instagram_url?: string | null
          is_active?: boolean
          last_sign_in_at?: string | null
          linkedin_url?: string | null
          messenger_url?: string | null
          phone?: string | null
          postal_code?: string | null
          role?: string
          spoken_languages?: string[] | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      properties: {
        Row: {
          amenities: string[] | null
          approved_at: string | null
          approved_by: string | null
          bathrooms: number
          bedrooms: number
          check_in_time: string | null
          check_out_time: string | null
          children_allowed: boolean | null
          city_id: string | null
          created_at: string
          description: string | null
          id: string
          images: string[] | null
          is_active: boolean
          is_public: boolean | null
          last_status_change: string | null
          latitude: string | null
          location: string
          longitude: string | null
          max_guests: number
          min_nights: number | null
          owner_id: string
          parties_allowed: boolean | null
          pets_allowed: boolean | null
          price_per_night: number
          property_type_id: string | null
          published_at: string | null
          region_id: string | null
          slug: string | null
          smoking_allowed: boolean | null
          status: string
          subscription_end_date: string | null
          subscription_id: string | null
          subscription_start_date: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amenities?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number
          bedrooms?: number
          check_in_time?: string | null
          check_out_time?: string | null
          children_allowed?: boolean | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_public?: boolean | null
          last_status_change?: string | null
          latitude?: string | null
          location: string
          longitude?: string | null
          max_guests?: number
          min_nights?: number | null
          owner_id: string
          parties_allowed?: boolean | null
          pets_allowed?: boolean | null
          price_per_night?: number
          property_type_id?: string | null
          published_at?: string | null
          region_id?: string | null
          slug?: string | null
          smoking_allowed?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_start_date?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amenities?: string[] | null
          approved_at?: string | null
          approved_by?: string | null
          bathrooms?: number
          bedrooms?: number
          check_in_time?: string | null
          check_out_time?: string | null
          children_allowed?: boolean | null
          city_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          images?: string[] | null
          is_active?: boolean
          is_public?: boolean | null
          last_status_change?: string | null
          latitude?: string | null
          location?: string
          longitude?: string | null
          max_guests?: number
          min_nights?: number | null
          owner_id?: string
          parties_allowed?: boolean | null
          pets_allowed?: boolean | null
          price_per_night?: number
          property_type_id?: string | null
          published_at?: string | null
          region_id?: string | null
          slug?: string | null
          smoking_allowed?: boolean | null
          status?: string
          subscription_end_date?: string | null
          subscription_id?: string | null
          subscription_start_date?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "properties_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "properties_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_region_id_fkey"
            columns: ["region_id"]
            isOneToOne: false
            referencedRelation: "regions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      property_availability: {
        Row: {
          created_at: string | null
          date: string
          id: string
          is_available: boolean
          property_id: string
          reason: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          is_available?: boolean
          property_id: string
          reason?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          is_available?: boolean
          property_id?: string
          reason?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_availability_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_characteristic_assignments: {
        Row: {
          characteristic_id: string
          created_at: string | null
          id: string
          property_id: string
        }
        Insert: {
          characteristic_id: string
          created_at?: string | null
          id?: string
          property_id: string
        }
        Update: {
          characteristic_id?: string
          created_at?: string | null
          id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_characteristic_assignments_characteristic_id_fkey"
            columns: ["characteristic_id"]
            isOneToOne: false
            referencedRelation: "property_characteristics"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_characteristic_assignments_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_characteristics: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      property_seo_data: {
        Row: {
          activity_keywords: string | null
          cancellation_policy: string | null
          canonical_url: string | null
          capacity: string | null
          comfort_keywords: string | null
          created_at: string | null
          detailed_description: string | null
          gallery_alt_texts: string[] | null
          geographic_keywords: string | null
          id: string
          image_descriptions: string[] | null
          image_titles: string[] | null
          included_services: string | null
          last_update_date: string | null
          local_keywords: string | null
          long_tail_keywords: string | null
          main_equipments: string | null
          main_image_alt: string | null
          meta_description: string | null
          meta_keywords: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          og_type: string | null
          primary_keywords: string | null
          priority_indexing: string | null
          property_id: string
          property_type: string | null
          redirects: string | null
          seasonal_keywords: string | null
          secondary_keywords: string | null
          spoken_languages: string | null
          title_tag: string | null
          updated_at: string | null
        }
        Insert: {
          activity_keywords?: string | null
          cancellation_policy?: string | null
          canonical_url?: string | null
          capacity?: string | null
          comfort_keywords?: string | null
          created_at?: string | null
          detailed_description?: string | null
          gallery_alt_texts?: string[] | null
          geographic_keywords?: string | null
          id?: string
          image_descriptions?: string[] | null
          image_titles?: string[] | null
          included_services?: string | null
          last_update_date?: string | null
          local_keywords?: string | null
          long_tail_keywords?: string | null
          main_equipments?: string | null
          main_image_alt?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_keywords?: string | null
          priority_indexing?: string | null
          property_id: string
          property_type?: string | null
          redirects?: string | null
          seasonal_keywords?: string | null
          secondary_keywords?: string | null
          spoken_languages?: string | null
          title_tag?: string | null
          updated_at?: string | null
        }
        Update: {
          activity_keywords?: string | null
          cancellation_policy?: string | null
          canonical_url?: string | null
          capacity?: string | null
          comfort_keywords?: string | null
          created_at?: string | null
          detailed_description?: string | null
          gallery_alt_texts?: string[] | null
          geographic_keywords?: string | null
          id?: string
          image_descriptions?: string[] | null
          image_titles?: string[] | null
          included_services?: string | null
          last_update_date?: string | null
          local_keywords?: string | null
          long_tail_keywords?: string | null
          main_equipments?: string | null
          main_image_alt?: string | null
          meta_description?: string | null
          meta_keywords?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          og_type?: string | null
          primary_keywords?: string | null
          priority_indexing?: string | null
          property_id?: string
          property_type?: string | null
          redirects?: string | null
          seasonal_keywords?: string | null
          secondary_keywords?: string | null
          spoken_languages?: string | null
          title_tag?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_seo_data_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      property_views: {
        Row: {
          created_at: string | null
          duration_seconds: number
          id: string
          property_id: string
          referrer: string | null
          user_agent: string | null
          view_date: string | null
          visitor_ip: string | null
        }
        Insert: {
          created_at?: string | null
          duration_seconds: number
          id?: string
          property_id: string
          referrer?: string | null
          user_agent?: string | null
          view_date?: string | null
          visitor_ip?: string | null
        }
        Update: {
          created_at?: string | null
          duration_seconds?: number
          id?: string
          property_id?: string
          referrer?: string | null
          user_agent?: string | null
          view_date?: string | null
          visitor_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_views_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      regions: {
        Row: {
          city_id: string
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          slug: string
          updated_at: string | null
        }
        Insert: {
          city_id: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          slug: string
          updated_at?: string | null
        }
        Update: {
          city_id?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          slug?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "regions_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          created_at: string | null
          duration_months: number
          end_date: string
          id: string
          owner_id: string
          payment_id: string | null
          payment_method: string | null
          payment_status: string | null
          plan_type: string
          price: number
          property_id: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          duration_months: number
          end_date: string
          id?: string
          owner_id: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          plan_type: string
          price: number
          property_id: string
          start_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          duration_months?: number
          end_date?: string
          id?: string
          owner_id?: string
          payment_id?: string | null
          payment_method?: string | null
          payment_status?: string | null
          plan_type?: string
          price?: number
          property_id?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "subscriptions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_city: {
        Args: { city_uuid: string }
        Returns: undefined
      }
      block_property_dates: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_reason?: string
          p_start_date: string
        }
        Returns: number
      }
      can_user_login: {
        Args: { user_uuid: string }
        Returns: boolean
      }
      create_property: {
        Args:
          | {
              p_address: string
              p_bathrooms: number
              p_bedrooms: number
              p_characteristic_ids: string[]
              p_check_in_time: string
              p_check_out_time: string
              p_children_allowed: boolean
              p_city_id: string
              p_description: string
              p_equipment_ids: string[]
              p_images: string[]
              p_latitude: string
              p_longitude: string
              p_max_guests: number
              p_min_nights: number
              p_owner_id?: string
              p_parties_allowed: boolean
              p_pets_allowed: boolean
              p_price_per_night: number
              p_property_type_id: string
              p_region_id: string
              p_smoking_allowed: boolean
              p_title: string
            }
          | {
              p_address: string
              p_bathrooms: number
              p_bedrooms: number
              p_check_in_time: string
              p_check_out_time: string
              p_children_allowed: boolean
              p_city_id: string
              p_description: string
              p_equipment_ids: string[]
              p_images: string[]
              p_latitude: string
              p_longitude: string
              p_max_guests: number
              p_min_nights: number
              p_owner_id?: string
              p_parties_allowed: boolean
              p_pets_allowed: boolean
              p_price_per_night: number
              p_property_type_id: string
              p_region_id: string
              p_smoking_allowed: boolean
              p_title: string
            }
        Returns: string
      }
      deactivate_city: {
        Args: { city_uuid: string }
        Returns: undefined
      }
      get_cities_and_regions: {
        Args: Record<PropertyKey, never>
        Returns: {
          city_name: string
          city_slug: string
          region_name: string
          region_slug: string
        }[]
      }
      get_cities_with_regions: {
        Args: Record<PropertyKey, never>
        Returns: {
          city_id: string
          city_is_active: boolean
          city_name: string
          city_slug: string
          region_id: string
          region_is_active: boolean
          region_name: string
          region_slug: string
        }[]
      }
      get_property_availability: {
        Args:
          | { p_end_date: string; p_property_id: string; p_start_date: string }
          | { p_property_id: string }
        Returns: {
          date: string
          is_available: boolean
          reason: string
        }[]
      }
      get_property_status_info: {
        Args: { property_uuid: string }
        Returns: {
          button_action: string
          button_text: string
          can_edit: boolean
          status: string
        }[]
      }
      get_public_profile: {
        Args: { profile_user_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          role: string
        }[]
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_property_visible: {
        Args: { property_uuid: string }
        Returns: boolean
      }
      toggle_property_availability: {
        Args: { p_date: string; p_property_id: string; p_reason?: string }
        Returns: Json
      }
      unblock_property_dates: {
        Args: {
          p_end_date: string
          p_property_id: string
          p_start_date: string
        }
        Returns: number
      }
      update_property: {
        Args: {
          p_address: string
          p_bathrooms: number
          p_bedrooms: number
          p_characteristic_ids: string[]
          p_check_in_time: string
          p_check_out_time: string
          p_children_allowed: boolean
          p_city_id: string
          p_description: string
          p_equipment_ids: string[]
          p_latitude: string
          p_longitude: string
          p_max_guests: number
          p_min_nights: number
          p_owner_id?: string
          p_parties_allowed: boolean
          p_pets_allowed: boolean
          p_price_per_night: number
          p_property_type_id: string
          p_region_id: string
          p_smoking_allowed: boolean
          p_title: string
          property_uuid: string
        }
        Returns: string
      }
      update_property_admin: {
        Args: {
          p_address: string
          p_bathrooms: number
          p_bedrooms: number
          p_check_in_time: string
          p_check_out_time: string
          p_children_allowed: boolean
          p_city_id: string
          p_description: string
          p_equipment_ids: string[]
          p_latitude: string
          p_longitude: string
          p_max_guests: number
          p_min_nights: number
          p_owner_id?: string
          p_parties_allowed: boolean
          p_pets_allowed: boolean
          p_price_per_night: number
          p_property_type_id: string
          p_region_id: string
          p_smoking_allowed: boolean
          p_title: string
          property_uuid: string
        }
        Returns: string
      }
      update_property_status: {
        Args: { admin_id?: string; new_status: string; property_uuid: string }
        Returns: undefined
      }
      update_property_view_duration: {
        Args: {
          p_created_at: string
          p_duration_to_add: number
          p_property_id: string
          p_view_date: string
          p_visitor_ip: string
        }
        Returns: undefined
      }
      validate_property_data: {
        Args: {
          p_bathrooms: number
          p_bedrooms: number
          p_city_id: string
          p_description: string
          p_images: string[]
          p_max_guests: number
          p_min_nights: number
          p_price_per_night: number
          p_property_type_id: string
          p_region_id: string
          p_title: string
        }
        Returns: boolean
      }
      validate_user_status: {
        Args: { user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const