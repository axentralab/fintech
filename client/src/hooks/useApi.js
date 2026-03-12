import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

export const useApi = (url, options = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async (params = {}) => {
    try {
      setLoading(true);
      const res = await api.get(url, { params });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching data');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { if (!options.lazy) fetch(); }, [fetch, options.lazy]);

  return { data, loading, error, refetch: fetch };
};
