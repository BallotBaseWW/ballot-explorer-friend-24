import { supabase } from "@/integrations/supabase/client";
import { ListOperationsProps } from "./types";
import { fetchVoterIds } from "./fetchVoterIds";

export const addVotersToList = async ({ 
  county, 
  searchQuery, 
  listId, 
  onSuccess, 
  onError 
}: ListOperationsProps) => {
  try {
    // Fetch all voter IDs from search results
    const voterIds = await fetchVoterIds(county, searchQuery);

    // Prepare batch insert data
    const batchData = voterIds.map(voterId => ({
      list_id: listId,
      state_voter_id: voterId,
      county: county.toUpperCase(),
    }));

    // Insert all voters into the list
    const { error } = await supabase
      .from("voter_list_items")
      .insert(batchData);

    if (error) throw error;
    onSuccess();
  } catch (error) {
    onError(error as Error);
  }
};

export const createNewList = async ({
  county,
  searchQuery,
  listName,
  description,
  onSuccess,
  onError
}: ListOperationsProps & { 
  listName: string;
  description?: string;
}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");

    // Create new list
    const { data: list, error: listError } = await supabase
      .from("voter_lists")
      .insert({
        name: listName,
        description: description || null,
        user_id: user.id,
      })
      .select()
      .single();

    if (listError) throw listError;

    // Add voters to the new list
    await addVotersToList({
      county,
      searchQuery,
      listId: list.id,
      onSuccess,
      onError
    });
  } catch (error) {
    onError(error as Error);
  }
};