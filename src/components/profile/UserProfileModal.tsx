import React, { useState, useEffect, useRef } from 'react';
import { X, Trophy, Swords, Flame, Award, Globe, Edit2, Check, Sparkles, User, ShieldCheck, Clock, ArrowUpRight, Medal, Crown, Maximize2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { personalRecordsService, PersonalRecord } from '../../services/personalRecordsService';
import { authService } from '../../services/authService';
import { cloudSyncService } from '../../services/cloudSyncService';
import { multiplayerService, MODE_ELO_CONFIGS } from '../../services/multiplayerService';
import { DuelMode } from '../../types/multiplayer';
import { empireStorageService } from '../../features/empires/services/empireStorageService';
import { UserEmpire } from '../../features/empires/types';
import { geoGridService, GRID_COLS, GRID_ROWS } from '../../features/empires/services/geoGridService';
import { EmpireShowcaseModal } from './EmpireShowcaseModal';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLeaderboard?: () => void;
}

/** Mini-mapamundi interactivo con las posesiones coloniales iluminadas */
const EmpireMiniPreview: React.FC<{ empire: UserEmpire; onOpenShowcase: () => void }> = ({ empire, onOpenShowcase }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      await geoGridService.initializeGrid();
      if (cancelled) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      // Fondo oceánico profundo
      ctx.fillStyle = '#080d19';
      ctx.fillRect(0, 0, w, h);

      const baseCanvas = geoGridService.getBaseWorldCanvas();
      if (baseCanvas) {
        ctx.drawImage(baseCanvas, 0, 0, w, h);
      } else {
        const landTiles = geoGridService.getAllLandTiles();
        ctx.fillStyle = '#182438';
        const tw = w / GRID_COLS;
        const th = h / GRID_ROWS;
        for (const t of landTiles) {
          ctx.fillRect(t.x * tw, t.y * th, tw + 0.2, th + 0.2);
        }
      }

      const tw = w / GRID_COLS;
      const th = h / GRID_ROWS;

      // Casillas colonizadas por el imperio
      for (const tileId of Object.keys(empire.colonizedTiles || {})) {
        const [xs, ys] = tileId.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        if (isNaN(x) || isNaN(y)) continue;
        ctx.fillStyle = '#10b981';
        ctx.fillRect(x * tw, y * th, Math.max(1.6, tw), Math.max(1.6, th));
      }

      // Ciudades / Capital
      for (const s of Object.values(empire.colonizedTiles || {})) {
        if (!s || !s.id || (s.role !== 'settlement' && s.id !== empire.capitalTileId)) continue;
        const [xs, ys] = s.id.split(',');
        const x = parseInt(xs, 10);
        const y = parseInt(ys, 10);
        if (isNaN(x) || isNaN(y)) continue;
        const isCapital = s.id === empire.capitalTileId;
        ctx.beginPath();
        ctx.arc((x + 0.5) * tw, (y + 0.5) * th, isCapital ? 3.5 : 2.5, 0, Math.PI * 2);
        ctx.fillStyle = isCapital ? '#fbbf24' : '#60a5fa';
        ctx.fill();
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    };

    render();
    return () => {
      cancelled = true;
    };
  }, [empire]);

  return (
    <div
      onClick={onOpenShowcase}
      className="relative w-full h-36 sm:h-44 rounded-2xl overflow-hidden border border-zinc-800 bg-black cursor-pointer group transition-all hover:border-amber-500/50 hover:shadow-[0_0_20px_rgba(245,158,11,0.15)]"
      title="Clic para explorar el imperio en pantalla completa"
    >
      <canvas ref={canvasRef} width={640} height={280} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent group-hover:from-black/70 transition-all flex items-end justify-between p-3">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
            {empire.empireName || 'Imperio Soberano'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold backdrop-blur-md group-hover:scale-105 transition-transform">
          <Maximize2 className="w-3.5 h-3.5" />
          <span>Ver mapa en grande</span>
        </div>
      </div>
    </div>
  );
};

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  onOpenLeaderboard
}) => {
  const { user, profile, refreshProfile } = useAuth();
  const [isEditingNick, setIsEditingNick] = useState(false);
  const [newNick, setNewNick] = useState('');
  const [records, setRecords] = useState<Record<string, PersonalRecord>>({});
  const [savingNick, setSavingNick] = useState(false);
  const [empire, setEmpire] = useState<UserEmpire>(() => empireStorageService.getEmpire());
  const [isShowcaseOpen, setIsShowcaseOpen] = useState(false);
  const [rankPositions, setRankPositions] = useState<Record<DuelMode | 'all', number>>({
    pinpoint: 1,
    countries: 1,
    capitals: 1,
    flags: 1,
    all: 1
  });

  useEffect(() => {
    if (isOpen) {
      setEmpire(empireStorageService.getEmpire());
      if (profile?.nickname) {
        setNewNick(profile.nickname);
      }
      if (user?.id) {
        personalRecordsService.syncFromSupabase(user.id).then(setRecords);
        cloudSyncService.getUserRankPositions(user.id).then(setRankPositions);
      } else {
        setRecords(personalRecordsService.getAllRecords());
      }
    }
  }, [isOpen, user, profile]);

  if (!isOpen) return null;

  const handleSaveNickname = async () => {
    if (!user?.id || !newNick.trim()) return;
    setSavingNick(true);
    const ok = await authService.updateNickname(user.id, newNick.trim());
    if (ok) {
      await refreshProfile();
      setIsEditingNick(false);
    }
    setSavingNick(false);
  };

  const winRate = profile && profile.total_duels > 0
    ? Math.round((profile.wins / profile.total_duels) * 100)
    : 0;

  const continentsList = [
    { id: 'World', label: 'Mundo Entero', emoji: '🌍' },
    { id: 'Europe', label: 'Europa', emoji: '🏰' },
    { id: 'Americas', label: 'América', emoji: '🌎' },
    { id: 'Africa', label: 'África', emoji: '🦁' },
    { id: 'Asia', label: 'Asia', emoji: '🏯' },
    { id: 'Oceania', label: 'Oceanía', emoji: '🏝️' },
  ];

  const getRankBadge = (elo: number) => {
    if (elo >= 2200) return { label: 'Gran Maestro', color: 'from-amber-400 to-rose-500', text: 'text-rose-300' };
    if (elo >= 1900) return { label: 'Maestro', color: 'from-purple-500 to-indigo-500', text: 'text-purple-300' };
    if (elo >= 1600) return { label: 'Diamante', color: 'from-cyan-400 to-blue-500', text: 'text-cyan-300' };
    if (elo >= 1400) return { label: 'Platino', color: 'from-teal-400 to-emerald-500', text: 'text-teal-300' };
    if (elo >= 1200) return { label: 'Oro', color: 'from-yellow-400 to-amber-500', text: 'text-amber-300' };
    if (elo >= 1000) return { label: 'Plata', color: 'from-slate-300 to-slate-400', text: 'text-slate-200' };
    return { label: 'Bronce', color: 'from-orange-600 to-amber-700', text: 'text-amber-400' };
  };

  const rankBadge = getRankBadge(profile?.elo || 1200);
  const colonizedCount = Object.keys(empire.colonizedTiles || {}).length;
  const planetConquestPct = ((colonizedCount / 20000) * 100).toFixed(2);

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
        <div className="bg-[#121620] border border-zinc-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
          {/* CABECERA CON AVATAR DE GOOGLE Y APODO */}
          <div className="relative p-6 sm:p-8 bg-gradient-to-br from-indigo-950/40 via-zinc-900/60 to-[#121620] border-b border-zinc-800">
            <button
              onClick={onClose}
              className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white hover:bg-zinc-800/80 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 sm:gap-6 flex-wrap">
              {/* Foto de perfil */}
              <div className="relative">
                {profile?.avatar_url ? (
                  <img
                    src={profile.avatar_url}
                    alt={profile.nickname}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.3)]"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center text-zinc-400 text-2xl font-bold">
                    {profile?.nickname?.charAt(0).toUpperCase() || 'U'}
                  </div>
                )}
                <span className="absolute -bottom-1 -right-1 p-1 bg-emerald-500 rounded-full border-2 border-[#121620]" title="Cuenta Verificada con Google">
                  <ShieldCheck className="w-3.5 h-3.5 text-white" />
                </span>
              </div>

              {/* Nombre y correo */}
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {isEditingNick ? (
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={newNick}
                        onChange={(e) => setNewNick(e.target.value)}
                        maxLength={24}
                        className="bg-zinc-800 border border-cyan-500 text-white px-2.5 py-1 rounded-lg text-sm font-bold focus:outline-none"
                      />
                      <button
                        onClick={handleSaveNickname}
                        disabled={savingNick}
                        className="p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setIsEditingNick(false)}
                        className="p-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-400 rounded-lg transition-colors"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <h2 className="font-serif font-bold text-xl sm:text-2xl text-white truncate">
                        {profile?.nickname || 'GeoStriker'}
                      </h2>
                      <button
                        onClick={() => setIsEditingNick(true)}
                        className="p-1 text-zinc-400 hover:text-cyan-300 hover:bg-zinc-800/80 rounded-lg transition-colors"
                        title="Editar nombre de usuario"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r ${rankBadge.color} text-zinc-950`}>
                    {rankBadge.label}
                  </span>
                </div>

                <p className="text-xs text-zinc-400 flex items-center gap-1">
                  <span>{user?.email || 'geostrikeapp@gmail.com'}</span>
                  <span className="text-zinc-600">·</span>
                  <span className="text-cyan-400 font-mono font-bold">{profile?.elo || 1200} Elo</span>
                </p>
              </div>
            </div>
          </div>

          {/* CONTENIDO SCROLLABLE */}
          <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
            {/* 🏛️ VITRINA DEL IMPERIO COLONIAL */}
            <div className="p-4 rounded-3xl bg-gradient-to-br from-amber-950/30 via-zinc-900/60 to-zinc-900/80 border border-amber-500/20 space-y-4 shadow-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
                    <Crown className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                      Vitrina Imperial · {empire.empireName || 'Imperio'}
                    </h3>
                    <p className="text-[11px] text-zinc-400">Expansión colonial y soberanía territorial</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsShowcaseOpen(true)}
                  className="text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-xl flex items-center gap-1 transition-all hover:bg-amber-500/20"
                >
                  <span>Explorar Mapa</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Estadísticas Clave del Imperio */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase">Tierras Colonizadas</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-amber-300">1 Planeta</span>
                  <span className="text-[10px] text-zinc-500 block truncate">Tierra Colonial #01</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase">Planeta Conquistado</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-emerald-400">{planetConquestPct}%</span>
                  <span className="text-[10px] text-zinc-500 block">{colonizedCount} casillas</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase">Población Total</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-cyan-300">
                    {empire.totalPopulation.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">ciudadanos</span>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-zinc-500 block uppercase">Países Conquistados</span>
                  <span className="font-mono font-bold text-base sm:text-lg text-indigo-300">
                    {(empire.annexedCountries || []).length}
                  </span>
                  <span className="text-[10px] text-zinc-500 block">soberanía total</span>
                </div>
              </div>

              {/* Mapamundi en Miniatura Clickeable */}
              <div>
                <EmpireMiniPreview empire={empire} onOpenShowcase={() => setIsShowcaseOpen(true)} />
                <p className="text-[11px] text-zinc-400 text-center mt-1.5 flex items-center justify-center gap-1">
                  <span>💡 Haz clic sobre el mapa para inspeccionar las provincias y asentamientos en pantalla completa</span>
                </p>
              </div>
            </div>

            {/* 1. MIS 4 CALIFICACIONES ELO POR MINIJUEGO */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Medal className="w-4 h-4 text-amber-400" />
                  <span>Mis 4 Calificaciones ELO por Minijuego</span>
                </h3>
                {onOpenLeaderboard && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLeaderboard();
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Ver Rankings ELO</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(['pinpoint', 'countries', 'capitals', 'flags'] as DuelMode[]).map(m => {
                  const cfg = MODE_ELO_CONFIGS[m];
                  const modeElo = (profile as any)?.[`elo_${m}`] ?? 1200;
                  const modeDuels = (profile as any)?.[`duels_${m}`] ?? 0;
                  const modeWins = (profile as any)?.[`wins_${m}`] ?? 0;
                  const modeLosses = Math.max(0, modeDuels - modeWins);
                  const rankPos = rankPositions[m] || 1;
                  const modeRankInfo = multiplayerService.getRankInfo(modeElo);

                  return (
                    <div
                      key={m}
                      className={`p-4 rounded-2xl border ${cfg.borderClass} ${cfg.bgClass} flex flex-col justify-between space-y-3 transition-all hover:scale-[1.01]`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span className="text-2xl">{cfg.icon}</span>
                          <div>
                            <h4 className="font-bold text-sm text-zinc-100">{cfg.name}</h4>
                            <p className="text-[11px] text-zinc-400">{cfg.subtitle}</p>
                          </div>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
                          #{rankPos} en el Mundo
                        </span>
                      </div>

                      <div className="flex items-end justify-between pt-2 border-t border-zinc-800/80">
                        <div>
                          <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Calificación</span>
                          <div className="flex items-baseline gap-2">
                            <span className={`text-2xl font-mono font-black ${cfg.textClass}`}>
                              {modeElo}
                            </span>
                            <span className="text-xs text-zinc-400 font-mono">Elo</span>
                            <span className="text-xs text-zinc-400">({modeRankInfo.label})</span>
                          </div>
                        </div>

                        <div className="text-right text-xs font-mono">
                          <span className="text-zinc-400 block text-[10px]">Historial</span>
                          <span className="text-emerald-400 font-bold">{modeWins}V</span>
                          <span className="text-zinc-500 mx-1">/</span>
                          <span className="text-rose-400 font-bold">{modeLosses}D</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. RESUMEN COMPETITIVO GENERAL (DUELOS 1V1) */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 mb-3 flex items-center gap-1.5">
                <Swords className="w-4 h-4 text-cyan-400" />
                <span>Resumen Global de Duelos 1v1</span>
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[11px] text-zinc-500 block">Duelos Totales</span>
                  <span className="font-mono font-bold text-lg text-zinc-100">{profile?.total_duels || 0}</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[11px] text-zinc-500 block">Victorias / Derrotas</span>
                  <span className="font-mono font-bold text-lg text-emerald-400">{profile?.wins || 0}V <span className="text-zinc-500 font-sans text-xs">/</span> {profile?.losses || 0}D</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[11px] text-zinc-500 block">Ratio Victoria</span>
                  <span className="font-mono font-bold text-lg text-cyan-400">{winRate}%</span>
                </div>
                <div className="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl text-center">
                  <span className="text-[11px] text-zinc-500 block">Racha Actual</span>
                  <span className="font-mono font-bold text-lg text-amber-400">{profile?.win_streak || 0} 🔥</span>
                </div>
              </div>
            </div>

            {/* 3. CUADRO DE HONOR: MEJORES INTENTOS EN MARATONES / MAPAS COMPLETOS */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Trophy className="w-4 h-4 text-amber-400" />
                  <span>Mejores Intentos por Mapa (Récords Personales)</span>
                </h3>
                {onOpenLeaderboard && (
                  <button
                    onClick={() => {
                      onClose();
                      onOpenLeaderboard();
                    }}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-semibold"
                  >
                    <span>Ver Clasificación Mundial</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {continentsList.map((c) => {
                  const continentRecords = Object.values(records).filter(r => r.continent === c.id);
                  const bestRecord = continentRecords.sort((a, b) => b.accuracyPct - a.accuracyPct)[0];

                  return (
                    <div
                      key={c.id}
                      className="p-3.5 bg-zinc-900/40 border border-zinc-800/80 rounded-2xl flex items-center justify-between hover:border-zinc-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{c.emoji}</span>
                        <div>
                          <p className="font-bold text-zinc-200 text-sm">{c.label}</p>
                          {bestRecord ? (
                            <p className="text-xs text-zinc-400 font-mono">
                              <span className="text-emerald-400 font-bold">{bestRecord.correctCount}/{bestRecord.totalQuestions}</span> países ({bestRecord.accuracyPct}%)
                            </p>
                          ) : (
                            <p className="text-[11px] text-zinc-500 italic">Sin récord completado</p>
                          )}
                        </div>
                      </div>

                      {bestRecord && (
                        <div className="text-right">
                          <span className="text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-800/50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>{bestRecord.timeSeconds}s</span>
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Vitrina Imperial a Gran Escala */}
      <EmpireShowcaseModal
        isOpen={isShowcaseOpen}
        onClose={() => setIsShowcaseOpen(false)}
        empire={empire}
      />
    </>
  );
};
