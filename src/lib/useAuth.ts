import { useState, useCallback } from 'react';
import { useGoogleLogin, type TokenResponse } from '@react-oauth/google';

const SCOPES =
  'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file';

export interface AuthState {
  token: string | null;
  login: () => void;
  logout: () => void;
}

export const useAuth = (): AuthState => {
  const [token, setToken] = useState<string | null>(null);

  const loginFunc = useGoogleLogin({
    scope: SCOPES,
    flow: 'implicit',
    onSuccess: (res: TokenResponse) => {
      setToken(res.access_token);
    },
    onError: () => {
      setToken(null);
    },
  });

  const login = useCallback(() => loginFunc({ prompt: 'consent' }), []);
  const logout = useCallback(() => setToken(null), []);

  return { token, login, logout };
};
