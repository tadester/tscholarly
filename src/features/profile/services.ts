import { supabase } from '../../integration/supabase';
import { Profile } from './types';

export const getProfile = async (userId: string) => {
  return supabase.from('profiles').select('*').eq('id', userId).single();
};

export const updateProfile = async (userId: string, updates: Partial<Profile>) => {
  return supabase.from('profiles').update(updates).eq('id', userId);
};
