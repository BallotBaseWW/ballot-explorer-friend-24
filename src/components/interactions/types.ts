import { County } from "../search/list-utils/types";

export interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  county: County;
}

export type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";

export interface VoterData {
  first_name?: string;
  last_name?: string;
}

export interface Interaction {
  id: string;
  type: InteractionType;
  notes?: string | null;
  interaction_date: string;
  county: County;
  created_at: string;
  updated_at: string;
  user_id: string;
  state_voter_id: string;
  bronx?: VoterData;
  brooklyn?: VoterData;
  manhattan?: VoterData;
  queens?: VoterData;
  statenisland?: VoterData;
}