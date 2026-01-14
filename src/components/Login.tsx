import React, { useEffect } from 'react';

interface Props {
  onLogin: (token: string) => void;
}

export const Login: React.FC<Props> = ({ onLogin }) => {
  useEffect(() => {
    const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
      scope:
        'https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/drive.file',
      callback: (tokenResponse: any) => {
        onLogin(tokenResponse.access_token);
      },
    });
    (window as any).tokenClient = tokenClient;
  }, [onLogin]);

  const handleLogin = () => {
    (window as any).tokenClient.requestAccessToken();
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>Login with Google</h2>
      <button onClick={handleLogin}>Login</button>
    </div>
  );
};
