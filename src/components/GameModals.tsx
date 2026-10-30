import React from 'react';
import { TETROMINO_SPECS, TETROMINO_TYPES } from '../game/tetrisEngine';
import { PiecePreviewSvg } from './PiecePreviewSvg';
import { CameraPreset } from './TetrisViewport3D';

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  muted: boolean;
  dasMs: number;
  arrMs: number;
  showGhost: boolean;
  cameraPreset: CameraPreset;
}

interface PauseModalProps {
  score: number;
  level: number;
  lines: number;
  onResume: () => void;
  onRestart: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
  onMainMenu: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  score,
  level,
  lines,
  onResume,
  onRestart,
  onOpenSettings,
  onOpenHowToPlay,
  onMainMenu,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Пауза"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/75 pointer-events-auto"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#090d16] border border-slate-800 p-7 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-display font-bold text-slate-100 tracking-wide">
            ПАУЗА · PAUSED
          </h2>
          <span className="text-xs font-mono-tabular text-cyan-400">ESC / P</span>
        </div>

        {/* Current Run Telemetry Snapshot */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">СЧЁТ</div>
            <div className="text-xl font-bold font-mono-tabular text-slate-100 mt-0.5">
              {Math.round(score)}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">УРОВЕНЬ</div>
            <div className="text-xl font-bold font-mono-tabular text-cyan-400 mt-0.5">
              {level}
            </div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">ЛИНИИ</div>
            <div className="text-xl font-bold font-mono-tabular text-emerald-400 mt-0.5">
              {lines}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="w-full py-3 px-5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm tracking-wide cursor-pointer transition-colors"
          >
            ПРОДОЛЖИТЬ · RESUME
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="w-full py-3 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-sm cursor-pointer transition-colors"
          >
            RESTART · НАЧАТЬ ЗАНОВО
          </button>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onOpenSettings}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs cursor-pointer transition-colors"
            >
              SETTINGS
            </button>
            <button
              type="button"
              onClick={onOpenHowToPlay}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 font-medium text-xs cursor-pointer transition-colors"
            >
              HOW TO PLAY
            </button>
          </div>
          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-2.5 px-5 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800/80 text-slate-400 hover:text-slate-200 font-medium text-xs cursor-pointer transition-colors mt-1"
          >
            MAIN MENU · ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

interface GameOverModalProps {
  score: number;
  bestScore: number;
  level: number;
  lines: number;
  onRestart: () => void;
  onMainMenu: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  score,
  bestScore,
  level,
  lines,
  onRestart,
  onMainMenu,
}) => {
  const isNewRecord = score > 0 && score >= bestScore;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Игра окончена"
      className="fixed inset-0 z-30 flex items-center justify-center p-4 bg-black/80 pointer-events-auto"
    >
      <div className="w-full max-w-md rounded-2xl bg-[#090d16] border border-slate-800 p-7 shadow-2xl">
        <div className="mb-5">
          <div className="text-xs font-mono-tabular text-rose-400 uppercase tracking-wider">
            ПОЛЕ ЗАПОЛНЕНО · ИГРА ОКОНЧЕНА
          </div>
          <h2 className="text-3xl font-display font-extrabold text-slate-100 mt-1">
            GAME OVER
          </h2>
          {isNewRecord && (
            <p className="text-xs font-semibold text-amber-400 mt-1">
              НОВЫЙ РЕКОРД СЕССИИ!
            </p>
          )}
        </div>

        {/* Final Score & Best Score */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">ФИНАЛЬНЫЙ СЧЁТ</div>
            <div
              data-testid="gameover-final-score"
              className="text-2xl font-bold font-mono-tabular text-cyan-400 mt-1"
            >
              {Math.round(score)}
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800">
            <div className="text-[11px] text-slate-400 uppercase">ЛУЧШИЙ РЕЗУЛЬТАТ</div>
            <div
              data-testid="gameover-best-score"
              className="text-2xl font-bold font-mono-tabular text-amber-400 mt-1"
            >
              {Math.round(bestScore)}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">УРОВЕНЬ</span>
            <span className="text-base font-bold font-mono-tabular text-slate-200">
              {level}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
            <span className="text-xs text-slate-400">ЛИНИИ</span>
            <span className="text-base font-bold font-mono-tabular text-emerald-400">
              {lines}
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-start="true"
            onClick={onRestart}
            className="w-full py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-display font-bold text-sm tracking-wide cursor-pointer transition-colors"
          >
            RESTART · СЫГРАТЬ ЕЩЁ РАЗ
          </button>
          <button
            type="button"
            onClick={onMainMenu}
            className="w-full py-3 px-6 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm cursor-pointer transition-colors"
          >
            MAIN MENU · ГЛАВНОЕ МЕНЮ
          </button>
        </div>
      </div>
    </div>
  );
};

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (partial: Partial<GameSettings>) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose,
}) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Настройки"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto"
    >
      <div className="w-full max-w-lg rounded-2xl bg-[#090d16] border border-slate-800 p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-100">
              SETTINGS · НАСТРОЙКИ ИГРЫ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Настройка звука, отзывчивости клавиш (DAS/ARR) и 3D-камеры
            </p>
          </div>
          <button
            type="button"
            aria-label="Закрыть настройки"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="space-y-5">
          {/* Audio Controls */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-200">Звуковое сопровождение</span>
              <button
                type="button"
                onClick={() => onUpdateSettings({ muted: !settings.muted })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  settings.muted
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {settings.muted ? 'ЗВУК ВЫКЛЮЧЕН' : 'ЗВУК АКТИВЕН'}
              </button>
            </div>

            <div>
              <label
                htmlFor="music-volume-slider"
                className="flex justify-between text-xs text-slate-300 mb-1.5"
              >
                <span>Громкость электронной музыки</span>
                <span className="font-mono-tabular text-cyan-400">
                  {Math.round(settings.musicVolume * 100)}%
                </span>
              </label>
              <input
                id="music-volume-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.musicVolume * 100)}
                onChange={(e) =>
                  onUpdateSettings({ musicVolume: Number(e.target.value) / 100 })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="sfx-volume-slider"
                className="flex justify-between text-xs text-slate-300 mb-1.5"
              >
                <span>Громкость звуковых эффектов (SFX)</span>
                <span className="font-mono-tabular text-cyan-400">
                  {Math.round(settings.sfxVolume * 100)}%
                </span>
              </label>
              <input
                id="sfx-volume-slider"
                type="range"
                min={0}
                max={100}
                value={Math.round(settings.sfxVolume * 100)}
                onChange={(e) =>
                  onUpdateSettings({ sfxVolume: Number(e.target.value) / 100 })
                }
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Keyboard Repeat (DAS / ARR) */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="text-sm font-semibold text-slate-200">
              Чувствительность удержания клавиш (DAS / ARR)
            </div>

            <div>
              <label
                htmlFor="das-slider"
                className="flex justify-between text-xs text-slate-300 mb-1.5"
              >
                <span>Задержка перед авто-повтором (DAS)</span>
                <span className="font-mono-tabular text-cyan-400">{settings.dasMs} мс</span>
              </label>
              <input
                id="das-slider"
                type="range"
                min={80}
                max={280}
                step={10}
                value={settings.dasMs}
                onChange={(e) => onUpdateSettings({ dasMs: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <label
                htmlFor="arr-slider"
                className="flex justify-between text-xs text-slate-300 mb-1.5"
              >
                <span>Интервал авто-сдвига при удержании (ARR)</span>
                <span className="font-mono-tabular text-cyan-400">{settings.arrMs} мс</span>
              </label>
              <input
                id="arr-slider"
                type="range"
                min={20}
                max={110}
                step={5}
                value={settings.arrMs}
                onChange={(e) => onUpdateSettings({ arrMs: Number(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* 3D Visuals & Ghost Piece */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold text-slate-200">
                  Тень падения (Ghost Piece)
                </div>
                <div className="text-xs text-slate-400">
                  Отображать полупрозрачный проекционный контур приземления
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateSettings({ showGhost: !settings.showGhost })}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                  settings.showGhost
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-400'
                }`}
              >
                {settings.showGhost ? 'ВКЛ' : 'ВЫКЛ'}
              </button>
            </div>

            <div>
              <div className="text-xs text-slate-300 mb-2">Ракурс 3D-камеры</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(
                  [
                    { id: 'angled', label: '3D Угол' },
                    { id: 'front', label: 'Фронтально' },
                    { id: 'isometric', label: 'Изометрия' },
                    { id: 'topTilt', label: 'Сверху' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onUpdateSettings({ cameraPreset: item.id })}
                    className={`py-2 px-3 rounded-lg text-xs font-medium cursor-pointer transition-colors whitespace-nowrap ${
                      settings.cameraPreset === item.id
                        ? 'bg-cyan-500 text-slate-950 font-semibold'
                        : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
          >
            ГОТОВО
          </button>
        </div>
      </div>
    </div>
  );
};

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Как играть"
      className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/75 pointer-events-auto"
    >
      <div className="w-full max-w-2xl rounded-2xl bg-[#090d16] border border-slate-800 p-7 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-display font-bold text-slate-100">
              HOW TO PLAY · ПРАВИЛА И УПРАВЛЕНИЕ
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Классический Тетрис на поле 10 × 20 в трёхмерном исполнении
            </p>
          </div>
          <button
            type="button"
            aria-label="Закрыть правила"
            onClick={onClose}
            className="w-9 h-9 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 cursor-pointer"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          {/* Controls Table */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
            <h3 className="text-sm font-semibold text-cyan-400 mb-3">
              Управление с клавиатуры
            </h3>
            <div className="space-y-2 text-xs">
              {[
                { keys: '← / A', action: 'Сдвиг фигуры влево' },
                { keys: '→ / D', action: 'Сдвиг фигуры вправо' },
                { keys: '↓ / S', action: 'Ускоренное падение (Soft Drop)' },
                { keys: '↑ / W', action: 'Вращение на 90° по часовой' },
                { keys: 'Z', action: 'Вращение против часовой' },
                { keys: 'Space', action: 'Мгновенное падение (Hard Drop)' },
                { keys: 'C / Shift', action: 'Сохранить фигуру (Hold)' },
                { keys: 'Esc', action: 'Пауза / Продолжить' },
                { keys: 'Мышь (Зажать)', action: 'Плавный осмотр 3D-камеры' },
              ].map((row) => (
                <div
                  key={row.keys}
                  className="flex items-center justify-between py-1 border-b border-slate-800/70 last:border-0"
                >
                  <span className="text-slate-300">{row.action}</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-950 border border-slate-700 font-mono-tabular text-cyan-300">
                    {row.keys}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* Scoring System */}
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-semibold text-amber-400 mb-3">
                Система очков и уровней
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800/70">
                  <span className="text-slate-300">1 линия (Single)</span>
                  <span className="font-mono-tabular font-semibold text-slate-100">
                    100 × Уровень
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70">
                  <span className="text-slate-300">2 линии (Double)</span>
                  <span className="font-mono-tabular font-semibold text-slate-100">
                    300 × Уровень
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70">
                  <span className="text-slate-300">3 линии (Triple)</span>
                  <span className="font-mono-tabular font-semibold text-slate-100">
                    500 × Уровень
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70">
                  <span className="text-cyan-300 font-semibold">4 линии (TETRIS!)</span>
                  <span className="font-mono-tabular font-bold text-cyan-300">
                    800 × Уровень
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/70">
                  <span className="text-slate-300">Soft Drop / Hard Drop</span>
                  <span className="font-mono-tabular text-slate-200">+1 / +2 за клетку</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed mt-3">
              Каждые <strong className="text-slate-200">10 очищенных линий</strong> уровень повышается, а скорость гравитации возрастает. Система <strong className="text-slate-200">SRS Wall Kick</strong> автоматически компенсирует смещение при вращении у стен.
            </p>
          </div>
        </div>

        {/* All 7 Classic Tetrominoes Showcase */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
            Классические 3D-фигуры (Тетрамино)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
            {TETROMINO_TYPES.map((t) => (
              <div
                key={t}
                className="p-2 rounded-lg bg-slate-950 border border-slate-800/90 flex flex-col items-center justify-center"
              >
                <PiecePreviewSvg type={t} size="sm" />
                <span
                  className="text-[11px] font-bold font-mono-tabular mt-1"
                  style={{ color: TETROMINO_SPECS[t].borderHex }}
                >
                  {t}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm cursor-pointer transition-colors"
          >
            ПОНЯТНО
          </button>
        </div>
      </div>
    </div>
  );
};
