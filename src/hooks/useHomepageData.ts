import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// This hook provides a unified way to fetch homepage data from Supabase,
// falling back to provided mock data if Supabase is not configured or fails.
export function useHomepageData<T>(tableName: string, mockData: T): T {
  const [data, setData] = useState<T>(mockData);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!isSupabaseConfigured || !supabase) {
        setLoading(false);
        return;
      }

      try {
        const { data: fetchedData, error } = await supabase
          .from(tableName)
          .select('*')
          .order('id', { ascending: true });

        if (error) throw error;
        
        if (fetchedData && fetchedData.length > 0) {
          // Attempt to map database rows to expected frontend structure
          // This assumes the DB structure roughly matches the mockData array structure
          setData(fetchedData as unknown as T);
        }
      } catch (err) {
        console.debug(`Failed to fetch ${tableName} from Supabase, using mock data.`, err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [tableName]);

  return data;
}
