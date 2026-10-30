import { useEffect, useRef, useState, useCallback } from 'react';
import {
  TetrisState,
  createInitialGameState,
  moveActivePiece,
  rotateActivePiece,
  softDropStep,
  hardDropActivePiece,
  holdActivePiece,
  stepGravity,
  getFallIntervalMs,
} from './game/tetrisEngine';
import { soundEngine } from './game/soundEngine';
import { TetrisViewport3D, CameraPreset } from './components/TetrisViewport3D';
import { TitleScreenOverlay } from './components/TitleScreenOverlay';
import { PlayingHud } from './components/PlayingHud';
import {
  PauseModal,
  GameOverModal,
  SettingsModal,
  HowToPlayModal,
  GameSettings,
} from './components/GameModals';

const STORAGE_BEST_KEY = 'tetris3d_best_score_v1';
const STORAGE_SETTINGS_KEY = 'tetris3d_settings_v1';

function loadBestScore(): number {
  try {
    const raw = localStorage.getItem(STORAGE_BEST_KEY);
    const parsed = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

function loadSettings(): GameSettings {
  const defaults: GameSettings = {
    musicVolume: 0.35,
    sfxVolume: 0.65,
    muted: false,
    dasMs: 150,
    arrMs: 40,
    showGhost: true,
    cameraPreset: 'angled',
  };
  try {
    const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
    if (!raw) return defaults;
    return { ...defaults, ...JSON.parse(raw) };
  } catch {
    return defaults;
  }
}

export default function App() {
  const initialAutostart =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('autostart') === '1';

  const [settings, setSettings] = useState<GameSettings>(loadSettings);
  const [gameState, setGameState] = useState<TetrisState>(() =>
    createInitialGameState(loadBestScore(), initialAutostart ? 'playing' : 'title')
  );
  const [fallProgress, setFallProgress] = useState(0);
  const [cameraOrbitOffset, setCameraOrbitOffset] = useState({ yaw: 0, pitch: 0 });
  const [activeModal, setActiveModal] = useState<'none' | 'settings' | 'howtoplay'>('none');
  const [actionBanner, setActionBanner] = useState<{
    text: string;
    subtext?: string;
    id: number;
  } | null>(null);

  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const settingsRef = useRef(settings);
  settingsRef.current = settings;

  const activeModalRef = useRef(activeModal);
  activeModalRef.current = activeModal;

  // Sync document.body.dataset.state for testability & Game Shell compliance
  useEffect(() => {
    document.body.dataset.state = gameState.status;
  }, [gameState.status]);

  // Persist Best Score
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_BEST_KEY, String(Math.round(gameState.bestScore)));
    } catch {
      // ignore storage errors
    }
  }, [gameState.bestScore]);

  // Sync audio volumes & level tempo
  useEffect(() => {
    soundEngine.setVolumes(settings.musicVolume, settings.sfxVolume, settings.muted);
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  useEffect(() => {
    soundEngine.setLevel(gameState.level);
  }, [gameState.level]);

  // React to lock events for SFX & action banners
  const lastHandledLockId = useRef(0);
  useEffect(() => {
    const ev = gameState.lastLockEvent;
    if (!ev || ev.id === lastHandledLockId.current) return;
    lastHandledLockId.current = ev.id;

    soundEngine.playLand(ev.hardDrop);

    if (ev.clearedRows.length > 0) {
      soundEngine.playLineClear(ev.clearedRows.length);
      const labels: Record<number, string> = {
        1: 'SINGLE! · 1 ЛИНИЯ',
        2: 'DOUBLE! · 2 ЛИНИИ',
        3: 'TRIPLE! · 3 ЛИНИИ',
        4: 'TETRIS! · 4 ЛИНИИ',
      };
      setActionBanner({
        id: ev.id,
        text: labels[ev.clearedRows.length] || 'ЛИНИЯ ОЧИЩЕНА!',
        subtext: `+${ev.scoreGain} ОЧКОВ`,
      });
    }

    if (gameState.status === 'gameover') {
      soundEngine.stopMusic();
      soundEngine.playGameOver();
    }
  }, [gameState.lastLockEvent, gameState.status]);

  // Game actions
  const startGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveModal('none');
    setActionBanner(null);
    const best = Math.max(stateRef.current.bestScore, loadBestScore());
    const fresh = createInitialGameState(best, 'playing');
    lastHandledLockId.current = 0;
    document.body.dataset.state = 'playing';
    setGameState(fresh);
    setFallProgress(0);
    soundEngine.startMusic();
  }, []);

  const pauseGame = useCallback(() => {
    setGameState((prev) => {
      if (prev.status !== 'playing') return prev;
      soundEngine.stopMusic();
      return { ...prev, status: 'paused' };
    });
  }, []);

  const resumeGame = useCallback(() => {
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    setActiveModal('none');
    setGameState((prev) => {
      if (prev.status !== 'paused') return prev;
      soundEngine.startMusic();
      return { ...prev, status: 'playing' };
    });
  }, []);

  const goToMainMenu = useCallback(() => {
    soundEngine.stopMusic();
    setActiveModal('none');
    setActionBanner(null);
    setCameraOrbitOffset({ yaw: 0, pitch: 0 });
    const best = Math.max(stateRef.current.bestScore, loadBestScore());
    setGameState(createInitialGameState(best, 'title'));
  }, []);

  const updateSettings = useCallback((partial: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  }, []);

  // Discrete player control callbacks
  const handleMove = useCallback((dx: number) => {
    setGameState((prev) => {
      const res = moveActivePiece(prev, dx, 0);
      if (res.moved) {
        soundEngine.playMove();
      }
      return res.state;
    });
  }, []);

  const handleRotate = useCallback((dir: 1 | -1) => {
    setGameState((prev) => {
      const res = rotateActivePiece(prev, dir);
      if (res.rotated) {
        soundEngine.playRotate();
      }
      return res.state;
    });
  }, []);

  const handleSoftDrop = useCallback(() => {
    setFallProgress(0);
    setGameState((prev) => {
      const res = softDropStep(prev);
      if (res.moved) {
        soundEngine.playSoftDrop();
      }
      return res.state;
    });
  }, []);

  const handleHardDrop = useCallback(() => {
    setFallProgress(0);
    setGameState((prev) => hardDropActivePiece(prev));
  }, []);

  const handleHold = useCallback(() => {
    setFallProgress(0);
    setGameState((prev) => {
      const res = holdActivePiece(prev);
      if (res.swapped) {
        soundEngine.playHold();
      }
      return res.state;
    });
  }, []);

  // Unified Gravity & DAS/ARR Input Loop
  useEffect(() => {
    const heldDirs = {
      left: false,
      right: false,
      down: false,
    };
    let lastHorizontalDir: -1 | 1 | 0 = 0;
    let dasElapsed = 0;
    let arrElapsed = 0;
    let softDropElapsed = 0;
    let gravityElapsed = 0;

    const clearHeldInputs = () => {
      heldDirs.left = false;
      heldDirs.right = false;
      heldDirs.down = false;
      lastHorizontalDir = 0;
      dasElapsed = 0;
      arrElapsed = 0;
      softDropElapsed = 0;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      // Allow Enter/Space on Title or GameOver screen to start/restart when no sub-modal is open
      if (activeModalRef.current !== 'none') {
        if (e.code === 'Escape') {
          e.preventDefault();
          setActiveModal('none');
        }
        return;
      }

      const status = stateRef.current.status;

      if (status === 'title') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (status === 'gameover') {
        if (e.code === 'Enter' || e.code === 'Space') {
          e.preventDefault();
          startGame();
        }
        return;
      }

      if (e.code === 'Escape' || e.code === 'KeyP') {
        e.preventDefault();
        if (status === 'playing') {
          clearHeldInputs();
          pauseGame();
        } else if (status === 'paused') {
          resumeGame();
        }
        return;
      }

      if (e.code === 'KeyM') {
        e.preventDefault();
        updateSettings({ muted: !settingsRef.current.muted });
        return;
      }

      if (status !== 'playing') return;

      // Ignore browser auto-repeat events; we drive DAS/ARR deterministically in our loop
      if (e.repeat) {
        if (
          e.code === 'ArrowLeft' ||
          e.code === 'ArrowRight' ||
          e.code === 'ArrowDown' ||
          e.code === 'ArrowUp' ||
          e.code === 'Space'
        ) {
          e.preventDefault();
        }
        return;
      }

      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          e.preventDefault();
          heldDirs.left = true;
          lastHorizontalDir = -1;
          dasElapsed = 0;
          arrElapsed = 0;
          handleMove(-1);
          break;

        case 'ArrowRight':
        case 'KeyD':
          e.preventDefault();
          heldDirs.right = true;
          lastHorizontalDir = 1;
          dasElapsed = 0;
          arrElapsed = 0;
          handleMove(1);
          break;

        case 'ArrowDown':
        case 'KeyS':
          e.preventDefault();
          heldDirs.down = true;
          softDropElapsed = 0;
          gravityElapsed = 0;
          handleSoftDrop();
          break;

        case 'ArrowUp':
        case 'KeyW':
          e.preventDefault();
          handleRotate(1);
          break;

        case 'KeyZ':
          e.preventDefault();
          handleRotate(-1);
          break;

        case 'Space':
          e.preventDefault();
          gravityElapsed = 0;
          handleHardDrop();
          break;

        case 'KeyC':
        case 'ShiftLeft':
        case 'ShiftRight':
          e.preventDefault();
          gravityElapsed = 0;
          handleHold();
          break;

        case 'KeyR':
          e.preventDefault();
          startGame();
          break;
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'ArrowLeft':
        case 'KeyA':
          heldDirs.left = false;
          if (heldDirs.right) {
            lastHorizontalDir = 1;
            dasElapsed = 0;
            arrElapsed = 0;
          } else {
            lastHorizontalDir = 0;
          }
          break;

        case 'ArrowRight':
        case 'KeyD':
          heldDirs.right = false;
          if (heldDirs.left) {
            lastHorizontalDir = -1;
            dasElapsed = 0;
            arrElapsed = 0;
          } else {
            lastHorizontalDir = 0;
          }
          break;

        case 'ArrowDown':
        case 'KeyS':
          heldDirs.down = false;
          softDropElapsed = 0;
          break;
      }
    };

    const onBlur = () => {
      clearHeldInputs();
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    window.addEventListener('blur', onBlur);

    let lastTick = performance.now();
    const timer = window.setInterval(() => {
      const now = performance.now();
      const dtMs = Math.min(50, now - lastTick);
      lastTick = now;

      if (stateRef.current.status !== 'playing' || activeModalRef.current !== 'none') {
        return;
      }

      // 1. Horizontal DAS / ARR handling
      if (lastHorizontalDir !== 0) {
        dasElapsed += dtMs;
        if (dasElapsed >= settingsRef.current.dasMs) {
          arrElapsed += dtMs;
          while (arrElapsed >= settingsRef.current.arrMs) {
            arrElapsed -= settingsRef.current.arrMs;
            handleMove(lastHorizontalDir);
          }
        }
      }

      // 2. Soft Drop vs Normal Gravity
      const fallInterval = getFallIntervalMs(stateRef.current.level);
      if (heldDirs.down) {
        const softDropInterval = Math.min(48, Math.max(22, fallInterval * 0.08));
        softDropElapsed += dtMs;
        if (softDropElapsed >= softDropInterval) {
          softDropElapsed %= softDropInterval;
          gravityElapsed = 0;
          handleSoftDrop();
        }
        setFallProgress(Math.min(1, softDropElapsed / softDropInterval));
      } else {
        gravityElapsed += dtMs;
        if (gravityElapsed >= fallInterval) {
          gravityElapsed %= fallInterval;
          setGameState((prev) => stepGravity(prev).state);
        }
        setFallProgress(Math.min(1, gravityElapsed / fallInterval));
      }
    }, 16);

    return () => {
      window.clearInterval(timer);
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
    };
  }, [
    startGame,
    pauseGame,
    resumeGame,
    handleMove,
    handleRotate,
    handleSoftDrop,
    handleHardDrop,
    handleHold,
    updateSettings,
  ]);

  return (
    <main className="relative w-screen h-screen overflow-hidden bg-[#07090e] select-none">
      {/* Persistent Isolated Three.js 3D Viewport */}
      <TetrisViewport3D
        gameState={gameState}
        fallProgress={fallProgress}
        showGhost={settings.showGhost}
        cameraPreset={settings.cameraPreset}
        cameraOrbitOffset={cameraOrbitOffset}
        onCameraOrbitChange={setCameraOrbitOffset}
      />

      {/* Title Screen Overlay */}
      {gameState.status === 'title' && (
        <TitleScreenOverlay
          bestScore={gameState.bestScore}
          onStartGame={startGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenHowToPlay={() => setActiveModal('howtoplay')}
        />
      )}

      {/* Playing HUD Overlay */}
      {(gameState.status === 'playing' ||
        gameState.status === 'paused' ||
        gameState.status === 'gameover') && (
        <PlayingHud
          gameState={gameState}
          muted={settings.muted}
          cameraPreset={settings.cameraPreset}
          actionBanner={actionBanner}
          onToggleMute={() => updateSettings({ muted: !settings.muted })}
          onPause={pauseGame}
          onRestart={startGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenHowToPlay={() => setActiveModal('howtoplay')}
          onChangeCameraPreset={(preset: CameraPreset) =>
            updateSettings({ cameraPreset: preset })
          }
          onResetCameraOrbit={() => setCameraOrbitOffset({ yaw: 0, pitch: 0 })}
          onMoveLeft={() => handleMove(-1)}
          onMoveRight={() => handleMove(1)}
          onRotateCW={() => handleRotate(1)}
          onRotateCCW={() => handleRotate(-1)}
          onSoftDrop={handleSoftDrop}
          onHardDrop={handleHardDrop}
          onHold={handleHold}
        />
      )}

      {/* Pause Modal */}
      {gameState.status === 'paused' && activeModal === 'none' && (
        <PauseModal
          score={gameState.score}
          level={gameState.level}
          lines={gameState.lines}
          onResume={resumeGame}
          onRestart={startGame}
          onOpenSettings={() => setActiveModal('settings')}
          onOpenHowToPlay={() => setActiveModal('howtoplay')}
          onMainMenu={goToMainMenu}
        />
      )}

      {/* Game Over Modal */}
      {gameState.status === 'gameover' && activeModal === 'none' && (
        <GameOverModal
          score={gameState.score}
          bestScore={gameState.bestScore}
          level={gameState.level}
          lines={gameState.lines}
          onRestart={startGame}
          onMainMenu={goToMainMenu}
        />
      )}

      {/* Settings Sub-Modal */}
      {activeModal === 'settings' && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={updateSettings}
          onClose={() => setActiveModal('none')}
        />
      )}

      {/* How To Play Sub-Modal */}
      {activeModal === 'howtoplay' && (
        <HowToPlayModal onClose={() => setActiveModal('none')} />
      )}
    </main>
  );
}
