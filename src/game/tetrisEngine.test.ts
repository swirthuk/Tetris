import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_TYPES,
  generateBag,
  createInitialGameState,
  moveActivePiece,
  rotateActivePiece,
  getGhostY,
  hardDropActivePiece,
  softDropStep,
  holdActivePiece,
  calculateLineClearScore,
  lockActivePiece,
  getPieceCells,
} from './tetrisEngine';

test('7-bag generator contains all 7 classic tetrominoes exactly once', () => {
  const bag = generateBag();
  assert.equal(bag.length, 7);
  for (const type of TETROMINO_TYPES) {
    assert.equal(bag.includes(type), true, `Bag missing ${type}`);
  }
});

test('classic scoring table scales accurately by level', () => {
  assert.equal(calculateLineClearScore(1, 1), 100);
  assert.equal(calculateLineClearScore(2, 1), 300);
  assert.equal(calculateLineClearScore(3, 1), 500);
  assert.equal(calculateLineClearScore(4, 1), 800);

  assert.equal(calculateLineClearScore(1, 3), 300);
  assert.equal(calculateLineClearScore(4, 5), 4000);
});

test('horizontal movement respects board left and right boundaries', () => {
  let state = createInitialGameState(0, 'playing');
  state = {
    ...state,
    activePiece: { type: 'O', x: 0, y: 0, rotation: 0 },
  };

  // O piece in rotation 0 occupies x+1 and x+2, so x = -1 puts left edge at col 0
  const leftStep1 = moveActivePiece(state, -1, 0);
  assert.equal(leftStep1.moved, true);
  assert.equal(leftStep1.state.activePiece?.x, -1);

  // Moving left again would put x+1 at -1 (out of bounds)
  const leftStep2 = moveActivePiece(leftStep1.state, -1, 0);
  assert.equal(leftStep2.moved, false);
  assert.equal(leftStep2.state.activePiece?.x, -1);
});

test('SRS Wall Kick compensates when rotating I-piece against left/right walls', () => {
  let state = createInitialGameState(0, 'playing');
  // Place vertical I-piece (rotation 3, cells at x+1) flush against left wall (x = -1 -> col 0)
  state = {
    ...state,
    activePiece: { type: 'I', x: -1, y: 2, rotation: 3 },
  };

  const rotated = rotateActivePiece(state, 1); // 3 -> 0 (horizontal)
  assert.equal(rotated.rotated, true, 'Wall kick should allow rotation near left wall');
  const cells = getPieceCells(rotated.state.activePiece!);
  for (const c of cells) {
    assert.equal(c.x >= 0 && c.x < BOARD_WIDTH, true, `Cell x=${c.x} out of bounds`);
  }
});

test('Ghost piece and Hard Drop place piece on bottom floor and award 2 pts per cell', () => {
  let state = createInitialGameState(0, 'playing');
  state = {
    ...state,
    activePiece: { type: 'O', x: 3, y: 0, rotation: 0 },
  };

  // O piece has cells at y+0 and y+1, so max y is BOARD_HEIGHT - 2 = 18
  const ghostY = getGhostY(state);
  assert.equal(ghostY, BOARD_HEIGHT - 2);

  const afterDrop = hardDropActivePiece(state);
  assert.equal(afterDrop.score, (BOARD_HEIGHT - 2) * 2);
  assert.equal(afterDrop.board[BOARD_HEIGHT - 1][4], 'O');
  assert.equal(afterDrop.board[BOARD_HEIGHT - 1][5], 'O');
  assert.equal(afterDrop.board[BOARD_HEIGHT - 2][4], 'O');
  assert.equal(afterDrop.board[BOARD_HEIGHT - 2][5], 'O');
});

test('Hold piece stores and swaps once per turn, resetting after lock', () => {
  const state = createInitialGameState(0, 'playing');
  const firstType = state.activePiece!.type;
  const secondType = state.nextQueue[0];

  const held1 = holdActivePiece(state);
  assert.equal(held1.swapped, true);
  assert.equal(held1.state.holdPiece, firstType);
  assert.equal(held1.state.activePiece?.type, secondType);
  assert.equal(held1.state.canHold, false);

  // Second immediate hold is blocked
  const held2 = holdActivePiece(held1.state);
  assert.equal(held2.swapped, false);

  // After hard drop lock, canHold is true again
  const afterDrop = hardDropActivePiece(held1.state);
  assert.equal(afterDrop.canHold, true);
});

test('Full horizontal line clears, shifts upper blocks down, and increments level every 10 lines', () => {
  let state = createInitialGameState(0, 'playing');
  const board = state.board.map((r) => [...r]);

  // Fill row 19 except cols 0..3 (for horizontal I-piece)
  for (let x = 4; x < BOARD_WIDTH; x++) {
    board[19][x] = 'T';
  }
  // Put a marker block at row 18, col 5 to verify it shifts down to row 19
  board[18][5] = 'J';

  state = {
    ...state,
    board,
    lines: 9,
    level: 1,
    // I piece rotation 0 has cells at y+1, x: 0..3 -> set y = 18 so cells land on row 19
    activePiece: { type: 'I', x: 0, y: 18, rotation: 0 },
  };

  const afterLock = lockActivePiece(state, 0, false);
  assert.equal(afterLock.lines, 10);
  assert.equal(afterLock.level, 2, 'Level should increment from 1 to 2 at 10 cleared lines');
  assert.equal(afterLock.lastLockEvent?.clearedRows.length, 1);
  assert.equal(afterLock.board[19][5], 'J', 'Block from row 18 should shift down to row 19');
});

test('Soft drop awards 1 point per cell moved down', () => {
  const state = createInitialGameState(0, 'playing');
  const step = softDropStep(state);
  assert.equal(step.moved, true);
  assert.equal(step.state.score, 1);
});

test('Game ends when newly spawned piece collides with filled top rows', () => {
  let state = createInitialGameState(0, 'playing');
  const board = state.board.map((r) => [...r]);
  // Block spawn zone at rows 0 and 1
  for (let x = 0; x < BOARD_WIDTH; x++) {
    board[0][x] = 'Z';
    board[1][x] = 'Z';
  }
  // Leave a single empty spot so row isn't cleared
  board[0][0] = null;
  board[1][0] = null;

  state = {
    ...state,
    board,
    activePiece: { type: 'O', x: 0, y: 10, rotation: 0 },
  };

  const afterLock = lockActivePiece(state, 0, false);
  assert.equal(afterLock.status, 'gameover');
});
