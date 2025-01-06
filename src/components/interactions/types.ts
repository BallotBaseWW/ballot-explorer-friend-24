import { County } from "../search/list-utils/types";

export interface VoterInfo {
  state_voter_id: string;
  first_name: string;
  last_name: string;
  county: County;
}

export type InteractionType = "call" | "email" | "meeting" | "door_knock" | "other";