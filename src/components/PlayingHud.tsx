import React, { useState } from 'react';
import { TetrisState } from '../game/tetrisEngine';
import { PiecePreviewSvg } from './PiecePreviewSvg';
import { CameraPreset } from './TetrisViewport3D';

interface PlayingHudProps {
  gameState: TetrisState;
  muted: boolean;
  cameraPreset: CameraPreset;
  actionBanner: { text: string; subtext?: string; id: number } | null;
  onToggleMute: () => void;
  onPause: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onChangeCameraPreset: (preset: CameraPreset) => void;
  onResetCameraOrbit: () => void;
  // On-screen interactive controls
  onMoveLeft: () => void;
  onMoveRight: () => void;
  onRotateCW: () => void;
  onRotateCCW: () => void;
  onSoftDrop: () => void;
  onHardDrop: () => void;
  onHold: () => void;
}

export const PlayingHud: React.FC<PlayingHudProps> = ({
  gameState,
  muted,
  cameraPreset,
  actionBanner,
  onToggleMute,
  onPause,
  onRestart,
  onOpenSettings,
  onOpenHowToPlay,
  onChangeCameraPreset,
  onResetCameraOrbit,
  onMoveLeft,
  onMoveRight,
  onRotateCW,
  onRotateCCW,
  onSoftDrop,
  onHardDrop,
  onHold,
}) => {
  const [dockCollapsed, setDockCollapsed] = useState(false);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'KeyH') {
        setDockCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex flex-col justify-between p-4 md:px-6 md:py-4">
      {/* Top Row: Left Brand + Hold/Stats Cluster | Right Next/Score + Utility Buttons */}
      <div className="flex items-start justify-between gap-4">
        {/* Left Perimeter Cluster: HOLD + LEVEL + LINES */}
        <div className="flex flex-col gap-3 pointer-events-auto">
          {/* Compact Title Badge */}
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-[#090d16]/90 border border-slate-800/90">
            <span className="font-display font-extrabold text-base tracking-wider text-slate-100">
              TETRIS <span className="text-cyan-400">3D</span>
            </span>
            <span className="text-slate-600">·</span>
            <span className="text-xs font-mono-tabular text-slate-400">10×20 SRS</span>
          </div>

          {/* HOLD Panel */}
          <div
            data-testid="hud-hold-panel"
            className="w-36 rounded-xl bg-[#090d16]/90 border border-slate-800/90 p-3 shadow-lg"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                HOLD · ЗАПАС
              </span>
              <span className="text-[10px] font-mono-tabular text-cyan-400">C / SHIFT</span>
            </div>
            <div className="flex items-center justify-center py-1 bg-slate-950/80 rounded-lg border border-slate-800/60">
              <PiecePreviewSvg
                type={gameState.holdPiece}
                size="md"
                dimmed={!gameState.canHold}
              />
            </div>
          </div>

          {/* LEVEL & LINES Readout */}
          <div className="w-36 rounded-xl bg-[#090d16]/90 border border-slate-800/90 p-3 shadow-lg space-y-2.5">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                УРОВЕНЬ · LEVEL
              </div>
              <div
                data-testid="hud-level"
                className="text-2xl font-extrabold font-mono-tabular text-cyan-400 leading-tight"
              >
                {gameState.level}
              </div>
            </div>
            <div className="h-px bg-slate-800/80" />
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                ЛИНИИ · LINES
              </div>
              <div
                data-testid="hud-lines"
                className="text-xl font-bold font-mono-tabular text-emerald-400 leading-tight"
              >
                {gameState.lines}
              </div>
            </div>
          </div>

          {/* Live Line-Clear / TETRIS Callout Banner */}
          {actionBanner && (
            <div
              key={actionBanner.id}
              className="w-36 rounded-xl bg-cyan-950/90 border border-cyan-500/50 p-2.5 shadow-lg"
            >
              <div className="text-xs font-display font-extrabold text-cyan-300 tracking-wide">
                {actionBanner.text}
              </div>
              {actionBanner.subtext && (
                <div className="text-[11px] font-mono-tabular text-amber-300 mt-0.5">
                  {actionBanner.subtext}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Perimeter Cluster: Utility Controls + SCORE/BEST + NEXT Queue */}
        <div className="flex flex-col items-end gap-3 pointer-events-auto">
          {/* Top-Right Square Utility Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              tabIndex={-1}
              aria-label={muted ? 'Включить звук' : 'Выключить звук'}
              onClick={(e) => {
                e.currentTarget.blur();
                onToggleMute();
              }}
              className="w-10 h-10 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
              title="Звук [M]"
            >
              {muted ? (
                <svg className="w-5 h-5 text-rose-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <line x1="23" y1="9" x2="17" y2="15" />
                  <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 5L6 9H2v6h4l5 4V5z" />
                  <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
              )}
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Правила игры"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenHowToPlay();
              }}
              className="w-10 h-10 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
              title="Правила [?]"
            >
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
              </svg>
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Настройки"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenSettings();
              }}
              className="w-10 h-10 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
              title="Настройки"
            >
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Перезапустить партию"
              onClick={(e) => {
                e.currentTarget.blur();
                onRestart();
              }}
              className="w-10 h-10 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 border border-slate-800 flex items-center justify-center text-slate-200 cursor-pointer transition-colors"
              title="Перезапуск [R]"
            >
              <svg className="w-5 h-5 text-slate-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>

            <button
              type="button"
              tabIndex={-1}
              aria-label="Пауза"
              onClick={(e) => {
                e.currentTarget.blur();
                onPause();
              }}
              className="h-10 px-3.5 rounded-xl bg-[#090d16]/90 hover:bg-slate-800 border border-slate-800 flex items-center gap-1.5 text-slate-100 font-semibold text-xs cursor-pointer transition-colors whitespace-nowrap"
              title="Пауза [Esc]"
            >
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1" />
                <rect x="14" y="4" width="4" height="16" rx="1" />
              </svg>
              <span>ПАУЗА</span>
            </button>
          </div>

          {/* SCORE & BEST SCORE Panel */}
          <div className="w-44 rounded-xl bg-[#090d16]/90 border border-slate-800/90 p-3.5 shadow-lg space-y-2.5">
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                СЧЁТ · SCORE
              </div>
              <div
                data-testid="hud-score"
                className="text-2xl font-extrabold font-mono-tabular text-slate-50 leading-tight mt-0.5"
              >
                {Math.round(gameState.score)}
              </div>
            </div>
            <div className="h-px bg-slate-800/80" />
            <div>
              <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                РЕКОРД · BEST
              </div>
              <div
                data-testid="hud-best-score"
                className="text-lg font-bold font-mono-tabular text-amber-400 leading-tight mt-0.5"
              >
                {Math.round(gameState.bestScore)}
              </div>
            </div>
          </div>

          {/* NEXT Piece Panel */}
          <div
            data-testid="hud-next-panel"
            className="w-44 rounded-xl bg-[#090d16]/90 border border-slate-800/90 p-3.5 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
                NEXT · ДАЛЕЕ
              </span>
              <span className="text-[10px] font-mono-tabular text-slate-500">ОЧЕРЕДЬ</span>
            </div>

            {/* Primary Next Piece */}
            <div className="flex items-center justify-center py-2 bg-slate-950/90 rounded-lg border border-slate-800/80 mb-2">
              <PiecePreviewSvg type={gameState.nextQueue[0] ?? null} size="md" />
            </div>

            {/* Upcoming 2 Pieces */}
            <div className="grid grid-cols-2 gap-1.5">
              {[1, 2].map((idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center py-1 bg-slate-950/50 rounded-md border border-slate-800/50"
                >
                  <PiecePreviewSvg type={gameState.nextQueue[idx] ?? null} size="sm" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Collapsible Unified Single-Row Bottom Control & Camera Dock (Three.js skill §5) */}
      <div className="mx-auto w-full max-w-[920px] pointer-events-auto flex flex-col items-center">
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.currentTarget.blur();
            setDockCollapsed((prev) => !prev);
          }}
          className="px-3 py-0.5 rounded-t-lg bg-[#090d16]/90 border border-b-0 border-slate-800 text-[10px] font-mono-tabular text-slate-400 hover:text-slate-200 cursor-pointer transition-colors"
        >
          {dockCollapsed ? '▴ Развернуть панель [H]' : '▾ Скрыть панель [H]'}
        </button>

        {!dockCollapsed && (
          <div className="w-full rounded-xl bg-[#090d16]/92 border border-slate-800/90 px-3 py-1.5 shadow-2xl flex items-center justify-between gap-2 overflow-x-auto">
            {/* Tactile Action Controls (single-line) */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                tabIndex={-1}
                aria-label="Влево"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onMoveLeft();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
              >
                ← Влево
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Вправо"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onMoveRight();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
              >
                Вправо →
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Поворот против часовой"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRotateCCW();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                title="Поворот против часовой [Z]"
              >
                ↺ Z
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Поворот по часовой"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onRotateCW();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-cyan-300 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                title="Поворот по часовой [↑/W]"
              >
                ↻ Поворот
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Ускорить падение"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onSoftDrop();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-200 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                title="Мягкий сброс [↓/S]"
              >
                ↓ Шаг
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Мгновенный сброс"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onHardDrop();
                }}
                className="h-8 px-3 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 text-cyan-300 font-mono-tabular text-xs font-bold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                title="Мгновенное падение [Space]"
              >
                ⤓ СБРОС
              </button>
              <button
                type="button"
                tabIndex={-1}
                aria-label="Сохранить фигуру в запас"
                onClick={(e) => {
                  e.currentTarget.blur();
                  onHold();
                }}
                className="h-8 px-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-amber-300 font-mono-tabular text-xs font-semibold cursor-pointer active:scale-95 transition-transform whitespace-nowrap"
                title="Запас [C / Shift]"
              >
                ⇄ HOLD
              </button>
            </div>

            {/* 3D Camera Preset Switcher */}
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 shrink-0">
              {(
                [
                  { id: 'angled', label: '3D Ракурс' },
                  { id: 'front', label: 'Фронт' },
                  { id: 'isometric', label: 'Изометрия' },
                  { id: 'topTilt', label: 'Сверху' },
                ] as const
              ).map((cam) => (
                <button
                  key={cam.id}
                  type="button"
                  tabIndex={-1}
                  onClick={(e) => {
                    e.currentTarget.blur();
                    onChangeCameraPreset(cam.id);
                    onResetCameraOrbit();
                  }}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium cursor-pointer transition-colors whitespace-nowrap ${
                    cameraPreset === cam.id
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {cam.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
