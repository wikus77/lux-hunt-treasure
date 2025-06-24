export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      abuse_alerts: {
        Row: {
          alert_timestamp: string
          event_count: number
          event_type: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          alert_timestamp?: string
          event_count: number
          event_type: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          alert_timestamp?: string
          event_count?: number
          event_type?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      abuse_logs: {
        Row: {
          event_type: string
          id: string
          timestamp: string
          user_id: string
        }
        Insert: {
          event_type: string
          id?: string
          timestamp?: string
          user_id: string
        }
        Update: {
          event_type?: string
          id?: string
          timestamp?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_logs: {
        Row: {
          context: string | null
          created_at: string
          device: string | null
          event_type: string
          id: string
          note: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          context?: string | null
          created_at?: string
          device?: string | null
          event_type: string
          id?: string
          note?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          context?: string | null
          created_at?: string
          device?: string | null
          event_type?: string
          id?: string
          note?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: []
      }
      admin_prizes: {
        Row: {
          address: string
          city: string
          created_at: string | null
          created_by: string
          description: string
          id: string
          is_active: boolean | null
          type: string
          week: number
        }
        Insert: {
          address: string
          city: string
          created_at?: string | null
          created_by: string
          description: string
          id?: string
          is_active?: boolean | null
          type: string
          week: number
        }
        Update: {
          address?: string
          city?: string
          created_at?: string | null
          created_by?: string
          description?: string
          id?: string
          is_active?: boolean | null
          type?: string
          week?: number
        }
        Relationships: []
      }
      app_messages: {
        Row: {
          content: string
          created_at: string | null
          expiry_date: string | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          message_type: string
          target_users: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type?: string
          target_users?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          message_type?: string
          target_users?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      backup_logs: {
        Row: {
          backup_date: string
          backup_type: string
          created_at: string
          duration_seconds: number | null
          error_message: string | null
          file_size: number | null
          id: string
          status: string
          storage_path: string | null
        }
        Insert: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_size?: number | null
          id?: string
          status?: string
          storage_path?: string | null
        }
        Update: {
          backup_date?: string
          backup_type?: string
          created_at?: string
          duration_seconds?: number | null
          error_message?: string | null
          file_size?: number | null
          id?: string
          status?: string
          storage_path?: string | null
        }
        Relationships: []
      }
      buzz_generation_logs: {
        Row: {
          buzz_count_generated: number
          clues_generated: number
          created_at: string
          id: string
          subscription_tier: string
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          buzz_count_generated: number
          clues_generated: number
          created_at?: string
          id?: string
          subscription_tier: string
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          buzz_count_generated?: number
          clues_generated?: number
          created_at?: string
          id?: string
          subscription_tier?: string
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
      buzz_logs: {
        Row: {
          action: string | null
          created_at: string | null
          details: Json | null
          id: string
          step: string
          user_id: string
        }
        Insert: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          step: string
          user_id: string
        }
        Update: {
          action?: string | null
          created_at?: string | null
          details?: Json | null
          id?: string
          step?: string
          user_id?: string
        }
        Relationships: []
      }
      buzz_map_actions: {
        Row: {
          clue_count: number
          cost_eur: number
          created_at: string
          id: string
          radius_generated: number
          user_id: string
        }
        Insert: {
          clue_count: number
          cost_eur: number
          created_at?: string
          id?: string
          radius_generated: number
          user_id: string
        }
        Update: {
          clue_count?: number
          cost_eur?: number
          created_at?: string
          id?: string
          radius_generated?: number
          user_id?: string
        }
        Relationships: []
      }
      clues: {
        Row: {
          created_at: string
          date: string
          description: string
          id: string
          image_url: string | null
          is_locked: boolean
          is_premium: boolean
          parent_id: string | null
          premium_type: string | null
          title: string
        }
        Insert: {
          created_at?: string
          date?: string
          description: string
          id?: string
          image_url?: string | null
          is_locked?: boolean
          is_premium?: boolean
          parent_id?: string | null
          premium_type?: string | null
          title: string
        }
        Update: {
          created_at?: string
          date?: string
          description?: string
          id?: string
          image_url?: string | null
          is_locked?: boolean
          is_premium?: boolean
          parent_id?: string | null
          premium_type?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "clues_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "clues"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          subject?: string | null
        }
        Relationships: []
      }
      device_tokens: {
        Row: {
          created_at: string
          device_type: string
          id: string
          last_used: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_type: string
          id?: string
          last_used?: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_type?: string
          id?: string
          last_used?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      live_activity_state: {
        Row: {
          created_at: string
          id: string
          mission: string
          progress: number
          route: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mission: string
          progress?: number
          route?: string | null
          status: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mission?: string
          progress?: number
          route?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      live_events: {
        Row: {
          created_at: string | null
          id: string
          message: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
        }
        Relationships: []
      }
      map_click_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lat: number
          lng: number
          user_id: string
          zoom: number
        }
        Insert: {
          created_at?: string
          event_type?: string
          id?: string
          lat: number
          lng: number
          user_id: string
          zoom?: number
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lat?: number
          lng?: number
          user_id?: string
          zoom?: number
        }
        Relationships: []
      }
      map_points: {
        Row: {
          created_at: string
          id: string
          latitude: number
          longitude: number
          note: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          note?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          note?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      missions: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          publication_date: string | null
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          publication_date?: string | null
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          publication_date?: string | null
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          campaign: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          referrer: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          campaign?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          campaign?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          referrer?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          description: string | null
          id: string
          provider: string
          provider_transaction_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          provider?: string
          provider_transaction_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      pre_registrations: {
        Row: {
          confirmed: boolean
          created_at: string
          created_by: string | null
          credits: number
          email: string
          id: string
          name: string
          referral_code: string | null
          referrer: string | null
          user_id: string | null
        }
        Insert: {
          confirmed?: boolean
          created_at?: string
          created_by?: string | null
          credits?: number
          email: string
          id?: string
          name: string
          referral_code?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Update: {
          confirmed?: boolean
          created_at?: string
          created_by?: string | null
          credits?: number
          email?: string
          id?: string
          name?: string
          referral_code?: string | null
          referrer?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      prize_clues: {
        Row: {
          clue_type: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_it: string
          id: string
          prize_id: string
          title_en: string | null
          title_fr: string | null
          title_it: string
          week: number
        }
        Insert: {
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it: string
          id?: string
          prize_id: string
          title_en?: string | null
          title_fr?: string | null
          title_it: string
          week: number
        }
        Update: {
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it?: string
          id?: string
          prize_id?: string
          title_en?: string | null
          title_fr?: string | null
          title_it?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "prize_clues_prize_id_fkey"
            columns: ["prize_id"]
            isOneToOne: false
            referencedRelation: "prizes"
            referencedColumns: ["id"]
          },
        ]
      }
      prizes: {
        Row: {
          acceleration: string | null
          area_radius_m: number | null
          created_at: string
          description: string | null
          end_date: string | null
          engine: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          lat: number | null
          lng: number | null
          location_address: string | null
          name: string | null
          power: string | null
          start_date: string | null
          title: string | null
          traction: string | null
        }
        Insert: {
          acceleration?: string | null
          area_radius_m?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          engine?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          name?: string | null
          power?: string | null
          start_date?: string | null
          title?: string | null
          traction?: string | null
        }
        Update: {
          acceleration?: string | null
          area_radius_m?: number | null
          created_at?: string
          description?: string | null
          end_date?: string | null
          engine?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          lat?: number | null
          lng?: number | null
          location_address?: string | null
          name?: string | null
          power?: string | null
          start_date?: string | null
          title?: string | null
          traction?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          agent_code: string | null
          agent_title: string | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          country: string | null
          created_at: string
          credits: number | null
          email: string | null
          first_name: string | null
          full_name: string | null
          id: string
          investigative_style: string | null
          last_name: string | null
          phone: string | null
          postal_code: string | null
          preferred_language: string | null
          role: string
          stripe_customer_id: string | null
          subscription_end: string | null
          subscription_start: string | null
          subscription_tier: string
          tier: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id: string
          investigative_style?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          agent_code?: string | null
          agent_title?: string | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          credits?: number | null
          email?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string
          investigative_style?: string | null
          last_name?: string | null
          phone?: string | null
          postal_code?: string | null
          preferred_language?: string | null
          role?: string
          stripe_customer_id?: string | null
          subscription_end?: string | null
          subscription_start?: string | null
          subscription_tier?: string
          tier?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      search_areas: {
        Row: {
          created_at: string
          id: string
          label: string | null
          lat: number
          lng: number
          radius: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          label?: string | null
          lat: number
          lng: number
          radius: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          label?: string | null
          lat?: number
          lng?: number
          radius?: number
          user_id?: string
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          buzz_days: string[]
          created_at: string
          id: string
          max_weekly_buzz: number
          name: string
          price_monthly: number
          stripe_price_id: string | null
        }
        Insert: {
          buzz_days?: string[]
          created_at?: string
          id?: string
          max_weekly_buzz?: number
          name: string
          price_monthly: number
          stripe_price_id?: string | null
        }
        Update: {
          buzz_days?: string[]
          created_at?: string
          id?: string
          max_weekly_buzz?: number
          name?: string
          price_monthly?: number
          stripe_price_id?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          provider: string
          provider_subscription_id: string | null
          start_date: string
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          provider?: string
          provider_subscription_id?: string | null
          start_date?: string
          status?: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          provider?: string
          provider_subscription_id?: string | null
          start_date?: string
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_buzz_bonuses: {
        Row: {
          awarded_at: string
          bonus_type: string
          created_at: string
          game_reference: string
          id: string
          used: boolean
          user_id: string
        }
        Insert: {
          awarded_at?: string
          bonus_type: string
          created_at?: string
          game_reference: string
          id?: string
          used?: boolean
          user_id: string
        }
        Update: {
          awarded_at?: string
          bonus_type?: string
          created_at?: string
          game_reference?: string
          id?: string
          used?: boolean
          user_id?: string
        }
        Relationships: []
      }
      user_buzz_counter: {
        Row: {
          buzz_count: number
          date: string
          id: string
          user_id: string
          week_map_generations: number[] | null
        }
        Insert: {
          buzz_count?: number
          date?: string
          id?: string
          user_id: string
          week_map_generations?: number[] | null
        }
        Update: {
          buzz_count?: number
          date?: string
          id?: string
          user_id?: string
          week_map_generations?: number[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_buzz_counter_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_buzz_map: {
        Row: {
          generated_at: string | null
          id: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Insert: {
          generated_at?: string | null
          id?: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Update: {
          generated_at?: string | null
          id?: string
          lat?: number
          lng?: number
          radius_km?: number
          user_id?: string
          week?: number
        }
        Relationships: [
          {
            foreignKeyName: "user_buzz_map_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_buzz_map_counter: {
        Row: {
          buzz_map_count: number
          created_at: string
          date: string
          id: string
          user_id: string
          week_map_counts: number[] | null
        }
        Insert: {
          buzz_map_count?: number
          created_at?: string
          date?: string
          id?: string
          user_id: string
          week_map_counts?: number[] | null
        }
        Update: {
          buzz_map_count?: number
          created_at?: string
          date?: string
          id?: string
          user_id?: string
          week_map_counts?: number[] | null
        }
        Relationships: []
      }
      user_clues: {
        Row: {
          buzz_cost: number
          clue_id: string
          clue_type: string
          created_at: string
          description_en: string | null
          description_fr: string | null
          description_it: string
          title_en: string | null
          title_fr: string | null
          title_it: string
          user_id: string
        }
        Insert: {
          buzz_cost: number
          clue_id?: string
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it: string
          title_en?: string | null
          title_fr?: string | null
          title_it: string
          user_id: string
        }
        Update: {
          buzz_cost?: number
          clue_id?: string
          clue_type?: string
          created_at?: string
          description_en?: string | null
          description_fr?: string | null
          description_it?: string
          title_en?: string | null
          title_fr?: string | null
          title_it?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_clues_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_map_areas: {
        Row: {
          clue_id: string | null
          created_at: string
          id: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Insert: {
          clue_id?: string | null
          created_at?: string
          id?: string
          lat: number
          lng: number
          radius_km: number
          user_id: string
          week: number
        }
        Update: {
          clue_id?: string | null
          created_at?: string
          id?: string
          lat?: number
          lng?: number
          radius_km?: number
          user_id?: string
          week?: number
        }
        Relationships: []
      }
      user_minigames_progress: {
        Row: {
          completed: boolean
          created_at: string
          game_key: string
          id: string
          last_played: string
          score: number
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          game_key: string
          id?: string
          last_played?: string
          score?: number
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          game_key?: string
          id?: string
          last_played?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      user_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_deleted: boolean | null
          is_read: boolean | null
          is_read_bool: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          is_read_bool?: boolean | null
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_read?: boolean | null
          is_read_bool?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          brand: string
          created_at: string
          exp_month: number
          exp_year: number
          id: string
          is_default: boolean
          last4: string
          stripe_pm_id: string
          user_id: string
        }
        Insert: {
          brand: string
          created_at?: string
          exp_month: number
          exp_year: number
          id?: string
          is_default?: boolean
          last4: string
          stripe_pm_id: string
          user_id: string
        }
        Update: {
          brand?: string
          created_at?: string
          exp_month?: number
          exp_year?: number
          id?: string
          is_default?: boolean
          last4?: string
          stripe_pm_id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      weekly_buzz_allowances: {
        Row: {
          created_at: string
          id: string
          max_buzz_count: number
          used_buzz_count: number
          user_id: string
          week_number: number
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          max_buzz_count: number
          used_buzz_count?: number
          user_id: string
          week_number: number
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          max_buzz_count?: number
          used_buzz_count?: number
          user_id?: string
          week_number?: number
          year?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_referral_credits: {
        Args: { user_email: string; credits_to_add: number }
        Returns: undefined
      }
      calculate_buzz_price: {
        Args: { daily_count: number }
        Returns: number
      }
      can_user_use_buzz: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      check_abuse_limit: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_abuse_logs: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      consume_buzz_usage: {
        Args: { p_user_id: string }
        Returns: boolean
      }
      execute_sql: {
        Args: { sql: string }
        Returns: undefined
      }
      get_current_mission_week: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_current_week_and_year: {
        Args: Record<PropertyKey, never>
        Returns: {
          week_num: number
          year_num: number
        }[]
      }
      get_map_radius_km: {
        Args: { p_week: number; p_generation_count: number }
        Returns: number
      }
      get_max_map_generations: {
        Args: { p_week: number }
        Returns: number
      }
      get_my_agent_code: {
        Args: Record<PropertyKey, never>
        Returns: {
          agent_code: string
        }[]
      }
      get_user_by_email: {
        Args: { email_param: string }
        Returns: unknown[]
      }
      get_user_roles: {
        Args: { user_id: string }
        Returns: {
          role: string
        }[]
      }
      handle_new_user: {
        Args: { new_user_id: string; user_email: string }
        Returns: undefined
      }
      has_role: {
        Args: { user_id: string; role_name: string }
        Returns: boolean
      }
      increment_buzz_counter: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_buzz_map_counter: {
        Args: { p_user_id: string }
        Returns: number
      }
      increment_map_generation_counter: {
        Args: { p_user_id: string; p_week: number }
        Returns: number
      }
      log_potential_abuse: {
        Args: { p_event_type: string; p_user_id: string }
        Returns: boolean
      }
      update_user_subscription_tier: {
        Args: { target_user_id: string; new_tier: string }
        Returns: undefined
      }
      validate_buzz_user_id: {
        Args: { p_user_id: string }
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
