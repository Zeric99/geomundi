import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService, UserProfile } from '../services/authService';
import { cloudSyncService } from '../services/cloudSyncService';

import { DuelMode } from '../types/multiplayer';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  /** Actualiza el ELO del perfil en memoria al instante (sin esperar a Supabase) */
  updateProfileElo: (newElo: number, wins?: number, losses?: number, modeElos?: Partial<Record<DuelMode, number>>) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isConfigured: false,
  signInWithGoogle: async () => {},
  signOut: async () => {},
  refreshProfile: async () => {},
  updateProfileElo: () => {}
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const isConfigured = authService.isConfigured();

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch (e) {
      console.error('Error cargando perfil:', e);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  /** Actualiza el ELO (y opcionalmente wins/losses y ELOs por modalidad) en el perfil local al instante */
  const updateProfileElo = useCallback((newElo: number, wins?: number, losses?: number, modeElos?: Partial<Record<DuelMode, number>>) => {
    setProfile(prev => {
      if (!prev) return prev;
      const modeEloUpdates: Record<string, number> = {};
      if (modeElos) {
        if (modeElos.pinpoint !== undefined) modeEloUpdates.elo_pinpoint = modeElos.pinpoint;
        if (modeElos.countries !== undefined) modeEloUpdates.elo_countries = modeElos.countries;
        if (modeElos.capitals !== undefined) modeEloUpdates.elo_capitals = modeElos.capitals;
        if (modeElos.flags !== undefined) modeEloUpdates.elo_flags = modeElos.flags;
      }
      return {
        ...prev,
        elo: newElo,
        ...(wins !== undefined ? { wins } : {}),
        ...(losses !== undefined ? { losses } : {}),
        ...modeEloUpdates
      };
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Comprobar sesión actual
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        cloudSyncService.migrateLocalDataToCloud(currentUser.id).catch(console.error);
      }
      setLoading(false);
    });

    // Suscribirse a cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        cloudSyncService.migrateLocalDataToCloud(currentUser.id).catch(console.error);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOut();
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isConfigured,
        signInWithGoogle,
        signOut,
        refreshProfile,
        updateProfileElo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
