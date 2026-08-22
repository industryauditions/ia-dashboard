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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      annual_partners: {
        Row: {
          canonical_name: string
          created_at: string
          id: string
          is_active: boolean
          logo_url: string | null
          package_total: number
          remaining: number | null
          renewal_date: string | null
          status_note: string | null
          updated_at: string
          used: number
        }
        Insert: {
          canonical_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          package_total?: number
          remaining?: number | null
          renewal_date?: string | null
          status_note?: string | null
          updated_at?: string
          used?: number
        }
        Update: {
          canonical_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          logo_url?: string | null
          package_total?: number
          remaining?: number | null
          renewal_date?: string | null
          status_note?: string | null
          updated_at?: string
          used?: number
        }
        Relationships: []
      }
      partner_packages: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          notes: string | null
          package_number: number
          partner_id: string
          start_date: string | null
          total_auditions: number
          updated_at: string
          used_auditions: number
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          package_number?: number
          partner_id: string
          start_date?: string | null
          total_auditions?: number
          updated_at?: string
          used_auditions?: number
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          package_number?: number
          partner_id?: string
          start_date?: string | null
          total_auditions?: number
          updated_at?: string
          used_auditions?: number
        }
        Relationships: [
          {
            foreignKeyName: "partner_packages_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "annual_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      event_sessions: {
        Row: {
          attendee_org: string | null
          confirmed: boolean | null
          event_id: string
          id: string
          time_slot: string | null
        }
        Insert: {
          attendee_org?: string | null
          confirmed?: boolean | null
          event_id: string
          id?: string
          time_slot?: string | null
        }
        Update: {
          attendee_org?: string | null
          confirmed?: boolean | null
          event_id?: string
          id?: string
          time_slot?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_sessions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          booking_notes: string | null
          confirmed: boolean
          created_at: string
          date_text: string
          end_date: string | null
          id: string
          notes: string | null
          start_date: string | null
          ticket_price: string | null
          tickets_on_sale_text: string | null
          title: string
          venue: string | null
        }
        Insert: {
          booking_notes?: string | null
          confirmed?: boolean
          created_at?: string
          date_text: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          ticket_price?: string | null
          tickets_on_sale_text?: string | null
          title: string
          venue?: string | null
        }
        Update: {
          booking_notes?: string | null
          confirmed?: boolean
          created_at?: string
          date_text?: string
          end_date?: string | null
          id?: string
          notes?: string | null
          start_date?: string | null
          ticket_price?: string | null
          tickets_on_sale_text?: string | null
          title?: string
          venue?: string | null
        }
        Relationships: []
      }
      featured_talent: {
        Row: {
          asked_to_create_content: boolean
          bio: string | null
          created_at: string
          employer_text: string | null
          featured_on_instagram: boolean
          follower_count: number | null
          id: string
          instagram_handle: string | null
          instagram_url: string | null
          location: string | null
          name: string
          profile_photo_url: string | null
          screenshot_url: string | null
          status: string
          updated_at: string
        }
        Insert: {
          asked_to_create_content?: boolean
          bio?: string | null
          created_at?: string
          employer_text?: string | null
          featured_on_instagram?: boolean
          follower_count?: number | null
          id?: string
          instagram_handle?: string | null
          instagram_url?: string | null
          location?: string | null
          name: string
          profile_photo_url?: string | null
          screenshot_url?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          asked_to_create_content?: boolean
          bio?: string | null
          created_at?: string
          employer_text?: string | null
          featured_on_instagram?: boolean
          follower_count?: number | null
          id?: string
          instagram_handle?: string | null
          instagram_url?: string | null
          location?: string | null
          name?: string
          profile_photo_url?: string | null
          screenshot_url?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      featured_talent_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          note: string
          talent_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          note: string
          talent_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string
          talent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "featured_talent_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "featured_talent_notes_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "featured_talent"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_snapshots: {
        Row: {
          currency: string
          fetched_at: string
          id: string
          net_profit: number | null
          period_end: string
          period_start: string
          period_type: string
          source: string
          total_expenses: number | null
          total_income: number
        }
        Insert: {
          currency?: string
          fetched_at?: string
          id?: string
          net_profit?: number | null
          period_end: string
          period_start: string
          period_type?: string
          source?: string
          total_expenses?: number | null
          total_income: number
        }
        Update: {
          currency?: string
          fetched_at?: string
          id?: string
          net_profit?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          source?: string
          total_expenses?: number | null
          total_income?: number
        }
        Relationships: []
      }
      industry_partners: {
        Row: {
          agency_name: string
          already_using_count: number | null
          already_using_note: string | null
          contact_name: string | null
          created_at: string
          date_sent: string | null
          discount_code: string | null
          email: string | null
          emailed: boolean
          id: string
          redemptions: number | null
        }
        Insert: {
          agency_name: string
          already_using_count?: number | null
          already_using_note?: string | null
          contact_name?: string | null
          created_at?: string
          date_sent?: string | null
          discount_code?: string | null
          email?: string | null
          emailed?: boolean
          id?: string
          redemptions?: number | null
        }
        Update: {
          agency_name?: string
          already_using_count?: number | null
          already_using_note?: string | null
          contact_name?: string | null
          created_at?: string
          date_sent?: string | null
          discount_code?: string | null
          email?: string | null
          emailed?: boolean
          id?: string
          redemptions?: number | null
        }
        Relationships: []
      }
      partner_aliases: {
        Row: {
          alias: string
          id: string
          partner_id: string
        }
        Insert: {
          alias: string
          id?: string
          partner_id: string
        }
        Update: {
          alias?: string
          id?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_aliases_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "annual_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      partner_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          note: string
          partner_id: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          note: string
          partner_id: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          note?: string
          partner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "partner_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "partner_notes_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "annual_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      post_schedule: {
        Row: {
          audition_date_text: string | null
          country: string | null
          created_at: string
          email_prepped: boolean | null
          email_scheduled_text: string | null
          grid_prepped: boolean | null
          id: string
          is_posted: boolean
          legacy_color: string | null
          notes: string | null
          package_id: string | null
          partner_id: string | null
          post_live_at: string | null
          posting_time_text: string | null
          raw_company_text: string | null
          schema_era: string
          sort_order: number | null
          story_prepped: boolean | null
        }
        Insert: {
          audition_date_text?: string | null
          country?: string | null
          created_at?: string
          email_prepped?: boolean | null
          email_scheduled_text?: string | null
          grid_prepped?: boolean | null
          id?: string
          is_posted?: boolean
          legacy_color?: string | null
          notes?: string | null
          package_id?: string | null
          partner_id?: string | null
          post_live_at?: string | null
          posting_time_text?: string | null
          raw_company_text?: string | null
          schema_era?: string
          sort_order?: number | null
          story_prepped?: boolean | null
        }
        Update: {
          audition_date_text?: string | null
          country?: string | null
          created_at?: string
          email_prepped?: boolean | null
          email_scheduled_text?: string | null
          grid_prepped?: boolean | null
          id?: string
          is_posted?: boolean
          legacy_color?: string | null
          notes?: string | null
          package_id?: string | null
          partner_id?: string | null
          post_live_at?: string | null
          posting_time_text?: string | null
          raw_company_text?: string | null
          schema_era?: string
          sort_order?: number | null
          story_prepped?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "post_schedule_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "annual_partners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_schedule_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "partner_packages"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string
          id: string
          role: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email: string
          id: string
          role?: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string
          id?: string
          role?: string
        }
        Relationships: []
      }
      subscriber_snapshots: {
        Row: {
          active_subscriptions: number
          currency: string
          fetched_at: string
          id: string
          mrr: number
          revenue_28d: number | null
          revenuecat_active_subscriptions: number | null
          source: string
          stripe_active_subscriptions: number | null
        }
        Insert: {
          active_subscriptions: number
          currency?: string
          fetched_at?: string
          id?: string
          mrr: number
          revenue_28d?: number | null
          revenuecat_active_subscriptions?: number | null
          source?: string
          stripe_active_subscriptions?: number | null
        }
        Update: {
          active_subscriptions?: number
          currency?: string
          fetched_at?: string
          id?: string
          mrr?: number
          revenue_28d?: number | null
          revenuecat_active_subscriptions?: number | null
          source?: string
          stripe_active_subscriptions?: number | null
        }
        Relationships: []
      }
      training_partners: {
        Row: {
          college_name: string
          contact_name: string | null
          created_at: string
          email: string | null
          id: string
          location: string | null
          notes: string | null
          notes_url: string | null
          status: string | null
        }
        Insert: {
          college_name: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          notes_url?: string | null
          status?: string | null
        }
        Update: {
          college_name?: string
          contact_name?: string | null
          created_at?: string
          email?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          notes_url?: string | null
          status?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
