import React from 'react';

interface TitleScreenOverlayProps {
  bestScore: number;
  onStartGame: () => void;
  onOpenSettings: () => void;
  onOpenHowToPlay: () => void;
}

export const TitleScreenOverlay: React.FC<TitleScreenOverlayProps> = ({
  bestScore,
  onStartGame,
  onOpenSettings,
  onOpenHowToPlay,
}) => {
  return (
    <div className="fixed inset-0 z-20 pointer-events-none flex flex-col justify-between p-6 md:p-12">
      {/* Main Left Negative-Space Hero Column */}
      <div className="my-auto max-w-md w-full pointer-events-auto bg-[#090d16]/92 border border-slate-800/90 rounded-2xl p-7 md:p-9 shadow-2xl">
        {/* Bespoke Inline SVG 3D Isometric TETRIS Emblem Lockup */}
        <div className="mb-6">
          <svg
            viewBox="0 0 360 112"
            className="w-full max-w-[330px] h-auto overflow-visible"
            role="img"
            aria-label="TETRIS 3D"
          >
            <defs>
              <linearGradient id="t3d-cyan" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#67e8f9" />
                <stop offset="100%" stopColor="#0891b2" />
              </linearGradient>
              <linearGradient id="t3d-purple" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#d8b4fe" />
                <stop offset="100%" stopColor="#7e22ce" />
              </linearGradient>
              <linearGradient id="t3d-amber" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde047" />
                <stop offset="100%" stopColor="#ea580c" />
              </linearGradient>
            </defs>

            {/* Isometric 3D T-Tetromino Crest on Left */}
            <g transform="translate(4, 10)">
              {/* Top row of T: 3 beveled cubes */}
              {[0, 22, 44].map((x, idx) => (
                <g key={idx} transform={`translate(${x}, 0)`}>
                  <rect
                    x="0"
                    y="0"
                    width="20"
                    height="20"
                    rx="3"
                    fill="url(#t3d-purple)"
                    stroke="#e9d5ff"
                    strokeWidth="1.2"
                  />
                  <rect
                    x="3.5"
                    y="3.5"
                    width="13"
                    height="13"
                    rx="1.5"
                    fill="#9333ea"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="0.7"
                  />
                </g>
              ))}
              {/* Stem cube of T */}
              <g transform="translate(22, 22)">
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  rx="3"
                  fill="url(#t3d-purple)"
                  stroke="#e9d5ff"
                  strokeWidth="1.2"
                />
                <rect
                  x="3.5"
                  y="3.5"
                  width="13"
                  height="13"
                  rx="1.5"
                  fill="#9333ea"
                  stroke="rgba(255,255,255,0.35)"
                  strokeWidth="0.7"
                />
              </g>
              {/* Accent Cyan Cube below */}
              <g transform="translate(0, 44)">
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  rx="3"
                  fill="url(#t3d-cyan)"
                  stroke="#a5f3fc"
                  strokeWidth="1.2"
                />
                <rect x="3.5" y="3.5" width="13" height="13" rx="1.5" fill="#06b6d4" />
              </g>
              <g transform="translate(44, 44)">
                <rect
                  x="0"
                  y="0"
                  width="20"
                  height="20"
                  rx="3"
                  fill="url(#t3d-amber)"
                  stroke="#fef08a"
                  strokeWidth="1.2"
                />
                <rect x="3.5" y="3.5" width="13" height="13" rx="1.5" fill="#f59e0b" />
              </g>
            </g>

            {/* Custom Architectural Wordmark "TETRIS" */}
            <g transform="translate(82, 6)">
              {/* Shadow extrusion layer */}
              <text
                x="3"
                y="54"
                fill="#0f172a"
                fontFamily="Outfit, sans-serif"
                fontWeight="800"
                fontSize="56"
                letterSpacing="4"
              >
                TETRIS
              </text>
              {/* Main crisp metallic face */}
              <text
                x="0"
                y="51"
                fill="#f8fafc"
                stroke="#38bdf8"
                strokeWidth="1"
                fontFamily="Outfit, sans-serif"
                fontWeight="800"
                fontSize="56"
                letterSpacing="4"
              >
                TETRIS
              </text>
              {/* Subtitle architectural line */}
              <text
                x="2"
                y="78"
                fill="#38bdf8"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="600"
                fontSize="13"
                letterSpacing="3.2"
              >
                3D SPATIAL EDITION
              </text>
            </g>
          </svg>

          <p className="text-sm text-slate-300 leading-relaxed mt-1">
            Классическая механика Тетриса в объёмном трёхмерном пространстве с физикой упругих кубов, системой SRS Wall Kick и процедурным синтезатором.
          </p>
        </div>

        {/* Best Score Readout */}
        <div className="mb-6 py-3.5 px-4 rounded-xl bg-[#0f172a] border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
              ЛУЧШИЙ РЕЗУЛЬТАТ · BEST SCORE
            </div>
            <div
              data-testid="title-best-score"
              className="text-2xl font-bold font-mono-tabular text-amber-400 mt-0.5"
            >
              {Math.round(bestScore)}
            </div>
          </div>
          <svg className="w-7 h-7 text-amber-400 shrink-0" viewBox="0 0 24 24" fill="none">
            <path
              d="M6 4H18V7C18 10.3137 15.3137 13 12 13C8.68629 13 6 10.3137 6 7V4Z"
              fill="rgba(251,191,36,0.2)"
              stroke="currentColor"
              strokeWidth="1.8"
            />
            <path
              d="M6 6H3V8C3 9.65685 4.34315 11 6 11M18 6H21V8C21 9.65685 19.6569 11 18 11M12 13V17M8 20H16"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Menu Actions (START GAME, SETTINGS, HOW TO PLAY) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            data-start="true"
            onClick={(e) => {
              e.currentTarget.blur();
              onStartGame();
            }}
            className="w-full py-3.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 active:bg-cyan-600 text-slate-950 font-display font-bold text-base tracking-wide transition-transform duration-150 cursor-pointer flex items-center justify-center gap-2.5 shadow-lg shadow-cyan-950/50 whitespace-nowrap"
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <polygon points="6,4 20,12 6,20" />
            </svg>
            <span>START GAME</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenSettings();
              }}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-semibold text-sm transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span>SETTINGS</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.currentTarget.blur();
                onOpenHowToPlay();
              }}
              className="py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-slate-100 font-semibold text-sm transition-colors duration-150 cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap"
            >
              <svg className="w-4 h-4 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" strokeLinecap="round" />
                <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
              </svg>
              <span>HOW TO PLAY</span>
            </button>
          </div>
        </div>
      </div>

      {/* Single flat borderless inline control hint line in bottom safe margin */}
      <div className="text-xs text-slate-400 font-mono-tabular tracking-wide">
        ←/→/A/D Движение · ↑/W/Z Поворот · ↓/S Ускорение · Space Мгновенный сброс · C/Shift Запас (Hold) · Esc Пауза
      </div>
    </div>
  );
};
