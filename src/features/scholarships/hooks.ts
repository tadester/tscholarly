import { useEffect, useState } from 'react';
import { supabase } from '../../integration/supabase';
import { Scholarship } from './types';

export const useScholarships = (userId: string | undefined, activeTab: 'all' | 'recommended') => {
  const [data, setData] = useState<Scholarship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;

      setLoading(true);

      if (activeTab === 'all') {
        const { data } = await supabase
          .from('scholarships')
          .select('*')
          .eq('is_active', true)
          .gte('deadline', new Date().toISOString())
          .order('deadline', { ascending: true });

        setData(data || []);
      }

      if (activeTab === 'recommended') {
        const { data } = await supabase.rpc('get_recommended_scholarships', { p_user_id: userId });

        setData(data || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [userId, activeTab]);

  return { data, loading };
};
