import { supabase } from '../../integration/supabase';

export const getRecommendedScholarships = async (userId: string) => {
  return supabase.rpc('get_recommended_scholarships', {
    p_user_id: userId,
  });
};
