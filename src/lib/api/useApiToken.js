import { useEffect, useState } from 'react';
import useGetSession from './session';
import { fetchToken, clearAccessToken } from './client';

export function useApiToken() {
  const { session, isPending } = useGetSession();
  const [tokenReady, setTokenReady] = useState(false);

  useEffect(() => {
    if (isPending) return;

    if (!session?.user) {
      clearAccessToken();
      setTokenReady(false);
      return;
    }

    let cancelled = false;

    fetchToken()
      .then(() => {
        if (!cancelled) setTokenReady(true);
      })
      .catch(() => {
        if (!cancelled) setTokenReady(false);
      });

    return () => {
      cancelled = true;
    };
  }, [session, isPending]);

  return {
    session,
    isPending,
    tokenReady: !isPending && (!session?.user || tokenReady),
  };
}
