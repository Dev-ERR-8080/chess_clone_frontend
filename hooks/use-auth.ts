import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { loginUser } from '@/lib/auth';

export const useAuth = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string, remember: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message === 'Failed to fetch' 
        ? "Network error: Is the Spring Boot backend running?" 
        : err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return { handleLogin, isLoading, error };
};