import { supabase } from "@/integrations/supabase/client";

export const performVoterSearch = async (
  firstName: string,
  lastName: string,
  page: number,
  itemsPerPage: number
) => {
  if (firstName.length < 3 || lastName.length < 3) {
    return { data: [], count: 0 };
  }

  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage - 1;

  const { data, count, error } = await supabase
    .from('voters')
    .select('*', { count: 'exact' })
    .ilike('first_name', `${firstName}%`)
    .ilike('last_name', `${lastName}%`)
    .range(start, end)
    .order('last_name', { ascending: true });

  if (error) {
    console.error('Search error:', error);
    throw error;
  }

  return { data: data || [], count: count || 0 };
};