import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authService, UserProfile } from '../services/authService';
import { cloudSyncService, clearAllUserSessionData } from '../services/cloudSyncService';

import { DuelMode } from '../types/multiplayer';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  ensureUserSession: () => Promise<User | null>;
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
  ensureUserSession: async () => null,
  updateProfileElo: () => {}
});

const CACHED_USER_KEY = 'GEOMUNDI_CACHED_USER_V1';
const CACHED_PROFILE_KEY = 'GEOMUNDI_CACHED_PROFILE_V1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem(CACHED_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CACHED_PROFILE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [loading, setLoading] = useState<boolean>(() => {
    try {
      return !localStorage.getItem(CACHED_USER_KEY);
    } catch (e) {
      return true;
    }
  });

  const isConfigured = authService.isConfigured();

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
    try {
      if (u) {
        localStorage.setItem(CACHED_USER_KEY, JSON.stringify(u));
      } else {
        localStorage.removeItem(CACHED_USER_KEY);
      }
    } catch (e) {}
  }, []);

  const setProfile = useCallback((p: UserProfile | null) => {
    setProfileState(p);
    try {
      if (p) {
        localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(p));
      } else {
        localStorage.removeItem(CACHED_PROFILE_KEY);
      }
    } catch (e) {}
  }, []);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const p = await authService.getProfile(userId);
      setProfile(p);
    } catch (e) {
      console.error('Error cargando perfil:', e);
    }
  }, [setProfile]);

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  /**
   * Garantiza que el usuario tenga una sesión activa en Supabase cuando completa su primera partida.
   * Si no ha iniciado sesión con Google, crea una cuenta anónima perezosa (Lazy Anonymous Sign-In)
   * solo en ese instante para no guardar basura de usuarios que abandonan en 2 segundos.
   */
  const ensureUserSession = useCallback(async (): Promise<User | null> => {
    if (user) return user;
    if (!isConfigured) return null;

    try {
      const { user: anonUser } = await authService.signInAnonymously();
      if (anonUser) {
        setUser(anonUser);
        await fetchProfile(anonUser.id);
        await cloudSyncService.migrateLocalDataToCloud(anonUser.id).catch(console.error);
        return anonUser;
      }
    } catch (e) {
      console.warn('Error iniciando sesión anónima perezosa:', e);
    }
    return null;
  }, [user, isConfigured, fetchProfile, setUser]);

  /** Actualiza el ELO (y opcionalmente wins/losses y ELOs por modalidad) en el perfil local al instante */
  const updateProfileElo = useCallback((newElo: number, wins?: number, losses?: number, modeElos?: Partial<Record<DuelMode, number>>) => {
    setProfileState(prev => {
      if (!prev) return prev;
      const modeEloUpdates: Record<string, number> = {};
      if (modeElos) {
        if (modeElos.pinpoint !== undefined) modeEloUpdates.elo_pinpoint = modeElos.pinpoint;
        if (modeElos.countries !== undefined) modeEloUpdates.elo_countries = modeElos.countries;
        if (modeElos.capitals !== undefined) modeEloUpdates.elo_capitals = modeElos.capitals;
        if (modeElos.flags !== undefined) modeEloUpdates.elo_flags = modeElos.flags;
      }
      const updatedProfile = {
        ...prev,
        elo: newElo,
        ...(wins !== undefined ? { wins } : {}),
        ...(losses !== undefined ? { losses } : {}),
        ...modeEloUpdates
      };
      try {
        localStorage.setItem(CACHED_PROFILE_KEY, JSON.stringify(updatedProfile));
      } catch (e) {}
      return updatedProfile;
    });
  }, []);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    // Comprobar sesión existente (sin forzar creación de anónimo de entrada para evitar registros basura)
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        // 1. Migrar datos de invitado local si existen a Supabase
        await cloudSyncService.migrateLocalDataToCloud(currentUser.id).catch(console.error);
        // 2. Hidratar datos de la nube a la sesión local
        await cloudSyncService.hydrateUserDataFromCloud(currentUser.id).catch(console.error);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // Suscribirse a cambios de sesión (login, logout, refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        await fetchProfile(currentUser.id);
        await cloudSyncService.migrateLocalDataToCloud(currentUser.id).catch(console.error);
        await cloudSyncService.hydrateUserDataFromCloud(currentUser.id).catch(console.error);
      } else {
        setProfile(null);
        if (event === 'SIGNED_OUT') {
          clearAllUserSessionData();
          try {
            localStorage.removeItem(CACHED_USER_KEY);
            localStorage.removeItem(CACHED_PROFILE_KEY);
          } catch (e) {}
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile, setUser, setProfile]);

  const signInWithGoogle = async () => {
    await authService.signInWithGoogle();
  };

  const signOut = async () => {
    await authService.signOut();
    clearAllUserSessionData();
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
        ensureUserSession,
        updateProfileElo
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
