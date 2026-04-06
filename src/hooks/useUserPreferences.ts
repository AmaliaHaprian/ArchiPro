// React hook for monitoring user activity and preferences using cookies
import { useEffect } from 'react';

export function useUserPreferences(preferences: Record<string, string>, onLoad: (prefs: Record<string, string>) => void) {
  // Save preferences to cookies
  useEffect(() => {
    Object.entries(preferences).forEach(([key, value]) => {
      document.cookie = `${key}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
    });
  }, [preferences]);

  // Load preferences from cookies on mount
  useEffect(() => {
    const cookies = document.cookie.split(';').reduce((acc: Record<string, string>, c) => {
      const [k, v] = c.trim().split('=');
      if (k && v) acc[k] = decodeURIComponent(v);
      return acc;
    }, {});
    onLoad(cookies);
    // eslint-disable-next-line
  }, []);
}

// Usage in a component:
// const [prefs, setPrefs] = useState({ theme: 'light', filter: 'all' });
// useUserPreferences(prefs, loaded => setPrefs({ ...prefs, ...loaded }));
