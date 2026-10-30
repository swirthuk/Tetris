export type TetrominoType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';

export type RotationState = 0 | 1 | 2 | 3; // 0: North, 1: East, 2: South, 3: West

export interface CellCoord {
  x: number;
  y: number;
}

export interface TetrominoSpec {
  type: TetrominoType;
  nameRu: string;
  colorHex: string;
  emissiveHex: string;
  borderHex: string;
  /** Shapes for rotation states 0, 1, 2, 3 inside a local bounding box */
  rotations: ReadonlyArray<ReadonlyArray<CellCoord>>;
}

export const BOARD_WIDTH = 10;
export const BOARD_HEIGHT = 20;

export const TETROMINO_TYPES: readonly TetrominoType[] = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

export const TETROMINO_SPECS: Record<TetrominoType, TetrominoSpec> = {
  I: {
    type: 'I',
    nameRu: 'I-Блок (Линия)',
    colorHex: '#06b6d4', // Cyan
    emissiveHex: '#0891b2',
    borderHex: '#67e8f9',
    rotations: [
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 3, y: 1 }],
      [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }, { x: 2, y: 3 }],
      [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }],
    ],
  },
  O: {
    type: 'O',
    nameRu: 'O-Блок (Куб)',
    colorHex: '#eab308', // Golden Yellow
    emissiveHex: '#ca8a04',
    borderHex: '#fde047',
    rotations: [
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
    ],
  },
  T: {
    type: 'T',
    nameRu: 'T-Блок (Т-образный)',
    colorHex: '#a855f7', // Vibrant Violet
    emissiveHex: '#7e22ce',
    borderHex: '#d8b4fe',
    rotations: [
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    ],
  },
  S: {
    type: 'S',
    nameRu: 'S-Блок (Змейка)',
    colorHex: '#10b981', // Emerald Green
    emissiveHex: '#059669',
    borderHex: '#6ee7b7',
    rotations: [
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      [{ x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
      [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    ],
  },
  Z: {
    type: 'Z',
    nameRu: 'Z-Блок (Зигзаг)',
    colorHex: '#f43f5e', // Crimson Rose
    emissiveHex: '#e11d48',
    borderHex: '#fda4af',
    rotations: [
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 1, y: 2 }],
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
      [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 0, y: 2 }],
    ],
  },
  J: {
    type: 'J',
    nameRu: 'J-Блок (Угол влево)',
    colorHex: '#3b82f6', // Royal Blue
    emissiveHex: '#2563eb',
    borderHex: '#93c5fd',
    rotations: [
      [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 2, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
    ],
  },
  L: {
    type: 'L',
    nameRu: 'L-Блок (Угол вправо)',
    colorHex: '#f97316', // Amber Orange
    emissiveHex: '#ea580c',
    borderHex: '#fdba74',
    rotations: [
      [{ x: 2, y: 0 }, { x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
      [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
      [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }, { x: 0, y: 2 }],
      [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
    ],
  },
};

/**
 * Super Rotation System (SRS) Wall Kick offset tables.
 * Note: In our board coordinates, +X is right, +Y is down.
 * Standard SRS tables use +Y up, so we invert the Y offset to match +Y down.
 */
const JLSTZ_KICKS: Record<string, ReadonlyArray<CellCoord>> = {
  '0->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '1->2': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: -2 }, { x: 1, y: -2 }],
  '2->1': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: 2 }, { x: -1, y: 2 }],
  '2->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: -1, y: 1 }, { x: 0, y: -2 }, { x: -1, y: -2 }],
  '0->3': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 1, y: -1 }, { x: 0, y: 2 }, { x: 1, y: 2 }],
};

const I_KICKS: Record<string, ReadonlyArray<CellCoord>> = {
  '0->1': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '1->0': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '1->2': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
  '2->1': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '2->3': [{ x: 0, y: 0 }, { x: 2, y: 0 }, { x: -1, y: 0 }, { x: 2, y: -1 }, { x: -1, y: 2 }],
  '3->2': [{ x: 0, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 1 }, { x: 1, y: -2 }],
  '3->0': [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: -2, y: 0 }, { x: 1, y: 2 }, { x: -2, y: -1 }],
  '0->3': [{ x: 0, y: 0 }, { x: -1, y: 0 }, { x: 2, y: 0 }, { x: -1, y: -2 }, { x: 2, y: 1 }],
};

export interface ActivePiece {
  type: TetrominoType;
  x: number;
  y: number;
  rotation: RotationState;
}

export interface ClearedBlockInfo {
  x: number;
  y: number;
  type: TetrominoType;
}

export interface LockEventInfo {
  id: number;
  pieceType: TetrominoType;
  lockedCells: CellCoord[];
  clearedRows: number[];
  clearedBlocks: ClearedBlockInfo[];
  dropDistance: number;
  hardDrop: boolean;
  scoreGain: number;
  leveledUp: boolean;
}

export type GameStatus = 'title' | 'playing' | 'paused' | 'gameover';

export interface TetrisState {
  board: (TetrominoType | null)[][];
  activePiece: ActivePiece | null;
  nextQueue: TetrominoType[];
  bag: TetrominoType[];
  holdPiece: TetrominoType | null;
  canHold: boolean;
  score: number;
  bestScore: number;
  lines: number;
  level: number;
  combo: number;
  status: GameStatus;
  lastLockEvent: LockEventInfo | null;
  lockEventCounter: number;
}

/**
 * Creates an empty 20x10 board filled with null.
 */
export function createEmptyBoard(): (TetrominoType | null)[][] {
  return Array.from({ length: BOARD_HEIGHT }, () =>
    Array<TetrominoType | null>(BOARD_WIDTH).fill(null)
  );
}

/**
 * Generates a shuffled 7-bag of Tetrominoes.
 */
export function generateBag(rng: () => number = Math.random): TetrominoType[] {
  const bag: TetrominoType[] = [...TETROMINO_TYPES];
  for (let i = bag.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const tmp = bag[i];
    bag[i] = bag[j];
    bag[j] = tmp;
  }
  return bag;
}

/**
 * Returns the world board coordinates occupied by a given piece state.
 */
export function getPieceCells(piece: ActivePiece): CellCoord[] {
  const localCells = TETROMINO_SPECS[piece.type].rotations[piece.rotation];
  return localCells.map((cell) => ({
    x: piece.x + cell.x,
    y: piece.y + cell.y,
  }));
}

/**
 * Checks whether a piece at the given position and rotation is valid (within bounds and not overlapping locked cells).
 */
export function isValidPosition(
  board: (TetrominoType | null)[][],
  piece: ActivePiece
): boolean {
  const cells = getPieceCells(piece);
  for (const cell of cells) {
    if (cell.x < 0 || cell.x >= BOARD_WIDTH) {
      return false;
    }
    if (cell.y >= BOARD_HEIGHT) {
      return false;
    }
    if (cell.y >= 0 && board[cell.y][cell.x] !== null) {
      return false;
    }
  }
  return true;
}

/**
 * Computes classic line-clear score based on lines cleared (1..4) and current level.
 */
export function calculateLineClearScore(linesCleared: number, level: number): number {
  switch (linesCleared) {
    case 1:
      return 100 * level;
    case 2:
      return 300 * level;
    case 3:
      return 500 * level;
    case 4:
      return 800 * level;
    default:
      return 0;
  }
}

/**
 * Computes gravity fall interval (in ms) for a given level.
 * Starts at 850ms on Level 1 and smoothly accelerates per level.
 */
export function getFallIntervalMs(level: number): number {
  const clampedLevel = Math.max(1, Math.min(level, 25));
  return Math.max(75, Math.round(850 * Math.pow(0.86, clampedLevel - 1)));
}

/**
 * Pulls the next piece from nextQueue and replenishes from bag.
 */
function pullNextFromQueue(
  nextQueue: TetrominoType[],
  bag: TetrominoType[],
  rng: () => number = Math.random
): { nextType: TetrominoType; nextQueue: TetrominoType[]; bag: TetrominoType[] } {
  const updatedQueue = [...nextQueue];
  let updatedBag = [...bag];

  while (updatedQueue.length < 5) {
    if (updatedBag.length === 0) {
      updatedBag = generateBag(rng);
    }
    updatedQueue.push(updatedBag.shift()!);
  }

  const nextType = updatedQueue.shift()!;
  if (updatedBag.length === 0) {
    updatedBag = generateBag(rng);
  }
  updatedQueue.push(updatedBag.shift()!);

  return {
    nextType,
    nextQueue: updatedQueue,
    bag: updatedBag,
  };
}

/**
 * Creates a spawn ActivePiece for a given TetrominoType.
 */
export function createSpawnPiece(type: TetrominoType): ActivePiece {
  return {
    type,
    x: 3,
    y: 0,
    rotation: 0,
  };
}

/**
 * Initializes a new Tetris game state.
 */
export function createInitialGameState(
  bestScore = 0,
  status: GameStatus = 'title',
  rng: () => number = Math.random
): TetrisState {
  const firstBag = generateBag(rng);
  const secondBag = generateBag(rng);
  const combined = [...firstBag, ...secondBag];

  const firstType = combined.shift()!;
  const nextQueue = combined.splice(0, 4);

  return {
    board: createEmptyBoard(),
    activePiece: status === 'playing' ? createSpawnPiece(firstType) : createSpawnPiece(firstType),
    nextQueue,
    bag: combined,
    holdPiece: null,
    canHold: true,
    score: 0,
    bestScore,
    lines: 0,
    level: 1,
    combo: -1,
    status,
    lastLockEvent: null,
    lockEventCounter: 0,
  };
}

/**
 * Computes the Y coordinate where the active piece would land if dropped straight down (Ghost Piece).
 */
export function getGhostY(state: TetrisState): number {
  if (!state.activePiece) return 0;
  let testY = state.activePiece.y;
  while (
    isValidPosition(state.board, {
      ...state.activePiece,
      y: testY + 1,
    })
  ) {
    testY++;
  }
  return testY;
}

/**
 * Attempts to move the active piece by (dx, dy).
 * Returns { state, moved: boolean }.
 */
export function moveActivePiece(
  state: TetrisState,
  dx: number,
  dy: number
): { state: TetrisState; moved: boolean } {
  if (state.status !== 'playing' || !state.activePiece) {
    return { state, moved: false };
  }

  const candidate: ActivePiece = {
    ...state.activePiece,
    x: state.activePiece.x + dx,
    y: state.activePiece.y + dy,
  };

  if (isValidPosition(state.board, candidate)) {
    return {
      state: {
        ...state,
        activePiece: candidate,
      },
      moved: true,
    };
  }

  return { state, moved: false };
}

/**
 * Attempts to rotate the active piece by 90 degrees clockwise (dir = 1) or counter-clockwise (dir = -1),
 * applying SRS Wall Kick offsets if the base rotation collides with walls or blocks.
 */
export function rotateActivePiece(
  state: TetrisState,
  dir: 1 | -1
): { state: TetrisState; rotated: boolean } {
  if (state.status !== 'playing' || !state.activePiece) {
    return { state, rotated: false };
  }

  const piece = state.activePiece;
  const oldRot = piece.rotation;
  const newRot = (((oldRot + dir) % 4 + 4) % 4) as RotationState;

  if (piece.type === 'O') {
    return {
      state: {
        ...state,
        activePiece: { ...piece, rotation: newRot },
      },
      rotated: true,
    };
  }

  const key = `${oldRot}->${newRot}`;
  const kickTable = piece.type === 'I' ? I_KICKS[key] : JLSTZ_KICKS[key];
  const kicks = kickTable || [{ x: 0, y: 0 }];

  for (const offset of kicks) {
    const candidate: ActivePiece = {
      type: piece.type,
      x: piece.x + offset.x,
      y: piece.y + offset.y,
      rotation: newRot,
    };
    if (isValidPosition(state.board, candidate)) {
      return {
        state: {
          ...state,
          activePiece: candidate,
        },
        rotated: true,
      };
    }
  }

  return { state, rotated: false };
}

/**
 * Locks the current active piece into the board, clears any completed horizontal lines,
 * shifts upper blocks down, updates score/lines/level, and spawns the next piece (or ends the game).
 */
export function lockActivePiece(
  state: TetrisState,
  dropDistance = 0,
  hardDrop = false,
  rng: () => number = Math.random
): TetrisState {
  if (!state.activePiece) return state;

  const newBoard = state.board.map((row) => [...row]);
  const lockedCells = getPieceCells(state.activePiece);

  for (const cell of lockedCells) {
    if (cell.y >= 0 && cell.y < BOARD_HEIGHT && cell.x >= 0 && cell.x < BOARD_WIDTH) {
      newBoard[cell.y][cell.x] = state.activePiece.type;
    }
  }

  // Detect full horizontal lines
  const clearedRows: number[] = [];
  const clearedBlocks: ClearedBlockInfo[] = [];

  for (let y = 0; y < BOARD_HEIGHT; y++) {
    const isFull = newBoard[y].every((cell) => cell !== null);
    if (isFull) {
      clearedRows.push(y);
      for (let x = 0; x < BOARD_WIDTH; x++) {
        clearedBlocks.push({
          x,
          y,
          type: newBoard[y][x]!,
        });
      }
    }
  }

  // Remove full lines and shift upper blocks down
  let finalBoard = newBoard;
  if (clearedRows.length > 0) {
    const remainingRows = newBoard.filter((_, rowIndex) => !clearedRows.includes(rowIndex));
    const emptyTopRows = Array.from({ length: clearedRows.length }, () =>
      Array<TetrominoType | null>(BOARD_WIDTH).fill(null)
    );
    finalBoard = [...emptyTopRows, ...remainingRows];
  }

  const linesCleared = clearedRows.length;
  const newLines = state.lines + linesCleared;
  const newLevel = Math.floor(newLines / 10) + 1;
  const leveledUp = newLevel > state.level;

  const newCombo = linesCleared > 0 ? state.combo + 1 : -1;
  const baseLineScore = calculateLineClearScore(linesCleared, state.level);
  const comboBonus = newCombo > 0 ? 50 * newCombo * state.level : 0;
  const dropPoints = hardDrop ? dropDistance * 2 : dropDistance;
  const totalScoreGain = baseLineScore + comboBonus + dropPoints;

  const newScore = state.score + totalScoreGain;
  const newBestScore = Math.max(state.bestScore, newScore);

  // Pull next piece
  const pulled = pullNextFromQueue(state.nextQueue, state.bag, rng);
  const nextSpawn = createSpawnPiece(pulled.nextType);

  // Check if next piece can spawn without collision
  const canSpawn = isValidPosition(finalBoard, nextSpawn);

  const lockEvent: LockEventInfo = {
    id: state.lockEventCounter + 1,
    pieceType: state.activePiece.type,
    lockedCells,
    clearedRows,
    clearedBlocks,
    dropDistance,
    hardDrop,
    scoreGain: totalScoreGain,
    leveledUp,
  };

  return {
    ...state,
    board: finalBoard,
    activePiece: canSpawn ? nextSpawn : null,
    nextQueue: pulled.nextQueue,
    bag: pulled.bag,
    canHold: true,
    score: newScore,
    bestScore: newBestScore,
    lines: newLines,
    level: newLevel,
    combo: newCombo,
    status: canSpawn ? 'playing' : 'gameover',
    lastLockEvent: lockEvent,
    lockEventCounter: state.lockEventCounter + 1,
  };
}

/**
 * Performs a single gravity step downward. If the piece cannot move down, locks it in place.
 */
export function stepGravity(
  state: TetrisState,
  rng: () => number = Math.random
): { state: TetrisState; locked: boolean } {
  if (state.status !== 'playing' || !state.activePiece) {
    return { state, locked: false };
  }

  const moved = moveActivePiece(state, 0, 1);
  if (moved.moved) {
    return { state: moved.state, locked: false };
  }

  return {
    state: lockActivePiece(state, 0, false, rng),
    locked: true,
  };
}

/**
 * Soft drop: moves piece down 1 cell and awards +1 point if moved.
 */
export function softDropStep(
  state: TetrisState,
  rng: () => number = Math.random
): { state: TetrisState; moved: boolean; locked: boolean } {
  if (state.status !== 'playing' || !state.activePiece) {
    return { state, moved: false, locked: false };
  }

  const moved = moveActivePiece(state, 0, 1);
  if (moved.moved) {
    const newScore = moved.state.score + 1;
    return {
      state: {
        ...moved.state,
        score: newScore,
        bestScore: Math.max(moved.state.bestScore, newScore),
      },
      moved: true,
      locked: false,
    };
  }

  return {
    state: lockActivePiece(state, 0, false, rng),
    moved: false,
    locked: true,
  };
}

/**
 * Hard drop: instantly moves piece to ghost Y, awards 2 points per cell dropped, and locks immediately.
 */
export function hardDropActivePiece(
  state: TetrisState,
  rng: () => number = Math.random
): TetrisState {
  if (state.status !== 'playing' || !state.activePiece) {
    return state;
  }

  const ghostY = getGhostY(state);
  const dropDistance = Math.max(0, ghostY - state.activePiece.y);

  const droppedState: TetrisState = {
    ...state,
    activePiece: {
      ...state.activePiece,
      y: ghostY,
    },
  };

  return lockActivePiece(droppedState, dropDistance, true, rng);
}

/**
 * Hold Piece: saves current piece into Hold or swaps with existing Hold piece.
 * Allowed at most once per piece drop (controlled by state.canHold).
 */
export function holdActivePiece(
  state: TetrisState,
  rng: () => number = Math.random
): { state: TetrisState; swapped: boolean } {
  if (state.status !== 'playing' || !state.activePiece || !state.canHold) {
    return { state, swapped: false };
  }

  const currentType = state.activePiece.type;

  if (state.holdPiece === null) {
    const pulled = pullNextFromQueue(state.nextQueue, state.bag, rng);
    const nextSpawn = createSpawnPiece(pulled.nextType);
    const canSpawn = isValidPosition(state.board, nextSpawn);

    return {
      state: {
        ...state,
        activePiece: canSpawn ? nextSpawn : null,
        nextQueue: pulled.nextQueue,
        bag: pulled.bag,
        holdPiece: currentType,
        canHold: false,
        status: canSpawn ? 'playing' : 'gameover',
      },
      swapped: true,
    };
  } else {
    const swapInType = state.holdPiece;
    const nextSpawn = createSpawnPiece(swapInType);
    const canSpawn = isValidPosition(state.board, nextSpawn);

    return {
      state: {
        ...state,
        activePiece: canSpawn ? nextSpawn : null,
        holdPiece: currentType,
        canHold: false,
        status: canSpawn ? 'playing' : 'gameover',
      },
      swapped: true,
    };
  }
}
