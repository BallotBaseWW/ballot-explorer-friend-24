export interface VoterList {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface VoterListItem {
  id: string;
  list_id: string;
  state_voter_id: string;
  county: string;
  added_at: string;
}