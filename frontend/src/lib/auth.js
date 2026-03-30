import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function useAuth() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== 'undefined' && localStorage.getItem('adminToken');
    if (!token) {
      navigate('/admin/login', { replace: true });
    } else {
      setLoading(false);
    }
  }, [navigate]);

  return { loading };
}
