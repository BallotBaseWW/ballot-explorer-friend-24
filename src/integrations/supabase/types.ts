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
      bronx: {
        Row: {
          application_date: string | null
          application_source: string | null
          aptunit_type: string | null
          assembly_district: string | null
          congressional_district: string | null
          county_code: string | null
          county_voter_no: string | null
          date_of_birth: string | null
          election_district: string | null
          enrolled_party: string | null
          first_name: string | null
          gender: string | null
          house: string | null
          house_suffix: string | null
          id_met_flag: string | null
          id_required: string | null
          inactive_date: string | null
          last_county_voted: string | null
          last_date_voted: string | null
          last_name: string | null
          last_registered_address: string | null
          last_registered_name: string | null
          last_year_voted: string | null
          legislative_district: string | null
          mailing_address_four: string | null
          mailing_address_one: string | null
          mailing_address_three: string | null
          mailing_address_two: string | null
          middle: string | null
          other_party: string | null
          post_st_direction: string | null
          pre_st_direction: string | null
          purge_date: string | null
          reason: string | null
          res_add_not_stated: string | null
          residence_city: string | null
          state_senate_district: string | null
          state_voter_id: string
          street_name: string | null
          suffix: string | null
          town_city: string | null
          unit_no: string | null
          voter_history: string | null
          voter_status: string | null
          ward: string | null
          zip_code: string | null
          zip_four: string | null
        }
        Insert: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Update: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id?: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Relationships: []
      }
      brooklyn: {
        Row: {
          application_date: string | null
          application_source: string | null
          aptunit_type: string | null
          assembly_district: string | null
          congressional_district: string | null
          county_code: string | null
          county_voter_no: string | null
          date_of_birth: string | null
          election_district: string | null
          enrolled_party: string | null
          first_name: string | null
          gender: string | null
          house: string | null
          house_suffix: string | null
          id_met_flag: string | null
          id_required: string | null
          inactive_date: string | null
          last_county_voted: string | null
          last_date_voted: string | null
          last_name: string | null
          last_registered_address: string | null
          last_registered_name: string | null
          last_year_voted: string | null
          legislative_district: string | null
          mailing_address_four: string | null
          mailing_address_one: string | null
          mailing_address_three: string | null
          mailing_address_two: string | null
          middle: string | null
          other_party: string | null
          post_st_direction: string | null
          pre_st_direction: string | null
          purge_date: string | null
          reason: string | null
          res_add_not_stated: string | null
          residence_city: string | null
          state_senate_district: string | null
          state_voter_id: string
          street_name: string | null
          suffix: string | null
          town_city: string | null
          unit_no: string | null
          voter_history: string | null
          voter_status: string | null
          ward: string | null
          zip_code: string | null
          zip_four: string | null
        }
        Insert: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Update: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id?: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Relationships: []
      }
      manhattan: {
        Row: {
          application_date: string | null
          application_source: string | null
          aptunit_type: string | null
          assembly_district: string | null
          congressional_district: string | null
          county_code: string | null
          county_voter_no: string | null
          date_of_birth: string | null
          election_district: string | null
          enrolled_party: string | null
          first_name: string | null
          gender: string | null
          house: string | null
          house_suffix: string | null
          id_met_flag: string | null
          id_required: string | null
          inactive_date: string | null
          last_county_voted: string | null
          last_date_voted: string | null
          last_name: string | null
          last_registered_address: string | null
          last_registered_name: string | null
          last_year_voted: string | null
          legislative_district: string | null
          mailing_address_four: string | null
          mailing_address_one: string | null
          mailing_address_three: string | null
          mailing_address_two: string | null
          middle: string | null
          other_party: string | null
          post_st_direction: string | null
          pre_st_direction: string | null
          purge_date: string | null
          reason: string | null
          res_add_not_stated: string | null
          residence_city: string | null
          state_senate_district: string | null
          state_voter_id: string
          street_name: string | null
          suffix: string | null
          town_city: string | null
          unit_no: string | null
          voter_history: string | null
          voter_status: string | null
          ward: string | null
          zip_code: string | null
          zip_four: string | null
        }
        Insert: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Update: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id?: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          approved: boolean | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          approved?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          approved?: boolean | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      queens: {
        Row: {
          application_date: string | null
          application_source: string | null
          aptunit_type: string | null
          assembly_district: string | null
          congressional_district: string | null
          county_code: string | null
          county_voter_no: string | null
          date_of_birth: string | null
          election_district: string | null
          enrolled_party: string | null
          first_name: string | null
          gender: string | null
          house: string | null
          house_suffix: string | null
          id_met_flag: string | null
          id_required: string | null
          inactive_date: string | null
          last_county_voted: string | null
          last_date_voted: string | null
          last_name: string | null
          last_registered_address: string | null
          last_registered_name: string | null
          last_year_voted: string | null
          legislative_district: string | null
          mailing_address_four: string | null
          mailing_address_one: string | null
          mailing_address_three: string | null
          mailing_address_two: string | null
          middle: string | null
          other_party: string | null
          post_st_direction: string | null
          pre_st_direction: string | null
          purge_date: string | null
          reason: string | null
          res_add_not_stated: string | null
          residence_city: string | null
          state_senate_district: string | null
          state_voter_id: string
          street_name: string | null
          suffix: string | null
          town_city: string | null
          unit_no: string | null
          voter_history: string | null
          voter_status: string | null
          ward: string | null
          zip_code: string | null
          zip_four: string | null
        }
        Insert: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Update: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id?: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Relationships: []
      }
      statenisland: {
        Row: {
          application_date: string | null
          application_source: string | null
          aptunit_type: string | null
          assembly_district: string | null
          congressional_district: string | null
          county_code: string | null
          county_voter_no: string | null
          date_of_birth: string | null
          election_district: string | null
          enrolled_party: string | null
          first_name: string | null
          gender: string | null
          house: string | null
          house_suffix: string | null
          id_met_flag: string | null
          id_required: string | null
          inactive_date: string | null
          last_county_voted: string | null
          last_date_voted: string | null
          last_name: string | null
          last_registered_address: string | null
          last_registered_name: string | null
          last_year_voted: string | null
          legislative_district: string | null
          mailing_address_four: string | null
          mailing_address_one: string | null
          mailing_address_three: string | null
          mailing_address_two: string | null
          middle: string | null
          other_party: string | null
          post_st_direction: string | null
          pre_st_direction: string | null
          purge_date: string | null
          reason: string | null
          res_add_not_stated: string | null
          residence_city: string | null
          state_senate_district: string | null
          state_voter_id: string
          street_name: string | null
          suffix: string | null
          town_city: string | null
          unit_no: string | null
          voter_history: string | null
          voter_status: string | null
          ward: string | null
          zip_code: string | null
          zip_four: string | null
        }
        Insert: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Update: {
          application_date?: string | null
          application_source?: string | null
          aptunit_type?: string | null
          assembly_district?: string | null
          congressional_district?: string | null
          county_code?: string | null
          county_voter_no?: string | null
          date_of_birth?: string | null
          election_district?: string | null
          enrolled_party?: string | null
          first_name?: string | null
          gender?: string | null
          house?: string | null
          house_suffix?: string | null
          id_met_flag?: string | null
          id_required?: string | null
          inactive_date?: string | null
          last_county_voted?: string | null
          last_date_voted?: string | null
          last_name?: string | null
          last_registered_address?: string | null
          last_registered_name?: string | null
          last_year_voted?: string | null
          legislative_district?: string | null
          mailing_address_four?: string | null
          mailing_address_one?: string | null
          mailing_address_three?: string | null
          mailing_address_two?: string | null
          middle?: string | null
          other_party?: string | null
          post_st_direction?: string | null
          pre_st_direction?: string | null
          purge_date?: string | null
          reason?: string | null
          res_add_not_stated?: string | null
          residence_city?: string | null
          state_senate_district?: string | null
          state_voter_id?: string
          street_name?: string | null
          suffix?: string | null
          town_city?: string | null
          unit_no?: string | null
          voter_history?: string | null
          voter_status?: string | null
          ward?: string | null
          zip_code?: string | null
          zip_four?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      gtrgm_compress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_in: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      gtrgm_options: {
        Args: {
          "": unknown
        }
        Returns: undefined
      }
      gtrgm_out: {
        Args: {
          "": unknown
        }
        Returns: unknown
      }
      set_limit: {
        Args: {
          "": number
        }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: {
          "": string
        }
        Returns: string[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      gender_type: "M" | "F" | "X" | "U"
      voter_status_type: "ACTIVE" | "INACTIVE" | "PURGED" | "OTHER"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
