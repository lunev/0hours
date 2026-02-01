import { useEffect, useState } from 'react';
import { storage } from '@/lib/storage';
import { type Settings } from '@/types';
import { DEFAULT_SETTINGS, STORAGE_KEYS } from '@/config';

export const useSettings = () => {
  const [settings, setSettingsState] = useState<Settings>(DEFAULT_SETTINGS);
  const [isLoading, setLoading] = useState<boolean>(true);
  const [isError, setError] = useState('');

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await storage.get<Settings>(STORAGE_KEYS.SETTINGS);
        if (data) {
          setSettingsState(data);
        }
      } catch (error) {
        setError(
          error instanceof Error ? error.message : 'Failed to load settings',
        );
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  const updateSettings = async (newSettings: Settings) => {
    try {
      await storage.set(STORAGE_KEYS.SETTINGS, newSettings);
      setSettingsState(newSettings);
    } catch {
      setError('Failed to save settings');
    }
  };

  return {
    settings,
    setSettings: updateSettings,
    isLoading,
    isError,
  };
};
