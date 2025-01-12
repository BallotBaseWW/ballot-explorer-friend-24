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
      access_requests: {
        Row: {
          address: string
          city: string
          created_at: string
          email: string
          full_name: string
          id: string
          organization: string
          password_hash: string
          state: string
          status: string | null
          updated_at: string
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          organization: string
          password_hash: string
          state: string
          status?: string | null
          updated_at?: string
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization?: string
          password_hash?: string
          state?: string
          status?: string | null
          updated_at?: string
          zip?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_featured: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_featured?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      data_currency: {
        Row: {
          as_of_date: string
          id: string
          updated_at: string
          updated_by: string
        }
        Insert: {
          as_of_date: string
          id?: string
          updated_at?: string
          updated_by: string
        }
        Update: {
          as_of_date?: string
          id?: string
          updated_at?: string
          updated_by?: string
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
      resources: {
        Row: {
          category_id: string | null
          created_at: string
          created_by: string
          description: string | null
          file_path: string | null
          id: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          file_path?: string | null
          id?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          file_path?: string | null
          id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "resources_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resources_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_updates: {
        Row: {
          content: string
          created_at: string
          created_by: string
          id: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by: string
          id?: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string
          id?: string
          updated_at?: string
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
      survey_assignments: {
        Row: {
          assigned_by: string
          assigned_to: string
          created_at: string
          id: string
          survey_id: string
        }
        Insert: {
          assigned_by: string
          assigned_to: string
          created_at?: string
          id?: string
          survey_id: string
        }
        Update: {
          assigned_by?: string
          assigned_to?: string
          created_at?: string
          id?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_assignments_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_questions: {
        Row: {
          created_at: string
          id: string
          options: Json | null
          order_index: number
          question: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index: number
          question: string
          question_type: Database["public"]["Enums"]["survey_question_type"]
          survey_id: string
        }
        Update: {
          created_at?: string
          id?: string
          options?: Json | null
          order_index?: number
          question?: string
          question_type?: Database["public"]["Enums"]["survey_question_type"]
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_questions_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          county: string
          created_at: string
          created_by: string
          id: string
          question_id: string
          response: string
          state_voter_id: string
          survey_id: string
        }
        Insert: {
          county: string
          created_at?: string
          created_by: string
          id?: string
          question_id: string
          response: string
          state_voter_id: string
          survey_id: string
        }
        Update: {
          county?: string
          created_at?: string
          created_by?: string
          id?: string
          question_id?: string
          response?: string
          state_voter_id?: string
          survey_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "survey_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          assigned_list_id: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_list_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_list_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "surveys_assigned_list_id_fkey"
            columns: ["assigned_list_id"]
            isOneToOne: false
            referencedRelation: "voter_lists"
            referencedColumns: ["id"]
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: "user_roles_profile_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_search_limits: {
        Row: {
          created_at: string
          daily_limit: number | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          daily_limit?: number | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          daily_limit?: number | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_searches: {
        Row: {
          id: string
          search_count: number
          search_date: string
          user_id: string
        }
        Insert: {
          id?: string
          search_count?: number
          search_date?: string
          user_id: string
        }
        Update: {
          id?: string
          search_count?: number
          search_date?: string
          user_id?: string
        }
        Relationships: []
      }
      voter_list_items: {
        Row: {
          added_at: string
          county: string
          id: string
          list_id: string
          state_voter_id: string
          survey_status: string | null
        }
        Insert: {
          added_at?: string
          county: string
          id?: string
          list_id: string
          state_voter_id: string
          survey_status?: string | null
        }
        Update: {
          added_at?: string
          county?: string
          id?: string
          list_id?: string
          state_voter_id?: string
          survey_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voter_list_items_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "voter_lists"
            referencedColumns: ["id"]
          },
        ]
      }
      voter_lists: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      survey_analytics: {
        Row: {
          completion_rate: number | null
          survey_id: string | null
          survey_title: string | null
          total_responses: number | null
          total_voters: number | null
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_access_request: {
        Args: {
          request_id: string
        }
        Returns: undefined
      }
      calculate_age: {
        Args: {
          dob_str: string
        }
        Returns: number
      }
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
      interaction_type: "call" | "email" | "meeting" | "door_knock" | "other"
      survey_question_type: "multiple_choice" | "open_ended" | "poll" | "rating"
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
