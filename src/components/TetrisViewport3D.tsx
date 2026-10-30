import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import {
  BOARD_WIDTH,
  BOARD_HEIGHT,
  TETROMINO_SPECS,
  TETROMINO_TYPES,
  TetrominoType,
  TetrisState,
  getPieceCells,
  getGhostY,
} from '../game/tetrisEngine';

export type CameraPreset = 'angled' | 'front' | 'isometric' | 'topTilt';

interface TetrisViewport3DProps {
  gameState: TetrisState;
  fallProgress: number; // 0..1 sub-cell smooth interpolation
  showGhost: boolean;
  cameraPreset: CameraPreset;
  cameraOrbitOffset: { yaw: number; pitch: number };
  onCameraOrbitChange: (offset: { yaw: number; pitch: number }) => void;
}

// Detect software WebGL (SwiftShader / llvmpipe) once at module load
const isSoftwareGl = (() => {
  if (typeof document === 'undefined') return true;
  const gl = document.createElement('canvas').getContext('webgl2');
  if (!gl) return true;
  const ext = gl.getExtension('WEBGL_debug_renderer_info');
  const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
  const gpu = String(gl.getParameter(param));
  gl.getExtension('WEBGL_lose_context')?.loseContext();
  return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
})();

// Pre-allocated math helpers outside animation loop (zero GC)
const _dummy = new THREE.Object3D();
const _vec3A = new THREE.Vector3();
const _vec3B = new THREE.Vector3();
const _color = new THREE.Color();

// Showcase monument pattern shown on Title Screen
const TITLE_DEMO_BLOCKS: Array<{ x: number; y: number; type: TetrominoType }> = [
  { x: 0, y: 19, type: 'J' }, { x: 1, y: 19, type: 'J' }, { x: 2, y: 19, type: 'J' }, { x: 0, y: 18, type: 'J' },
  { x: 3, y: 19, type: 'O' }, { x: 4, y: 19, type: 'O' }, { x: 3, y: 18, type: 'O' }, { x: 4, y: 18, type: 'O' },
  { x: 5, y: 19, type: 'T' }, { x: 6, y: 19, type: 'T' }, { x: 7, y: 19, type: 'T' }, { x: 6, y: 18, type: 'T' },
  { x: 8, y: 19, type: 'L' }, { x: 9, y: 19, type: 'L' }, { x: 9, y: 18, type: 'L' }, { x: 9, y: 17, type: 'L' },
  { x: 1, y: 18, type: 'S' }, { x: 2, y: 18, type: 'S' }, { x: 2, y: 17, type: 'S' }, { x: 3, y: 17, type: 'S' },
  { x: 4, y: 17, type: 'I' }, { x: 5, y: 17, type: 'I' }, { x: 6, y: 17, type: 'I' }, { x: 7, y: 17, type: 'I' },
  { x: 7, y: 18, type: 'Z' }, { x: 8, y: 18, type: 'Z' }, { x: 8, y: 17, type: 'Z' }, { x: 7, y: 16, type: 'Z' },
  // Floating falling hero T-piece mid-well on Title screen
  { x: 4, y: 8, type: 'T' }, { x: 3, y: 9, type: 'T' }, { x: 4, y: 9, type: 'T' }, { x: 5, y: 9, type: 'T' },
];

interface Particle {
  active: boolean;
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  life: number;
  maxLife: number;
  colorHex: string;
}

/**
 * Creates a custom beveled 3D block geometry using ExtrudeGeometry
 * so every cube has smooth rounded bevel edges and distinct specular faces.
 */
function createBeveledBlockGeometry(): THREE.BufferGeometry {
  const size = 0.78;
  const half = size / 2;
  const r = 0.08;

  const shape = new THREE.Shape();
  shape.moveTo(-half + r, -half);
  shape.lineTo(half - r, -half);
  shape.quadraticCurveTo(half, -half, half, -half + r);
  shape.lineTo(half, half - r);
  shape.quadraticCurveTo(half, half, half - r, half);
  shape.lineTo(-half + r, half);
  shape.quadraticCurveTo(-half, half, -half, half - r);
  shape.lineTo(-half, -half + r);
  shape.quadraticCurveTo(-half, -half, -half + r, -half);

  const extrudeSettings: THREE.ExtrudeGeometryOptions = {
    steps: 1,
    depth: size - 0.14,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelOffset: 0,
    bevelSegments: isSoftwareGl ? 2 : 3,
  };

  const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
  geo.center();
  geo.computeVertexNormals();
  return geo;
}

/**
 * Converts board grid coordinates (col 0..9, row 0..19 where 0 is top, 19 is bottom)
 * into 3D world coordinates centered around X=0, with Y=0.5 at row 19 (floor at Y=0).
 */
function boardToWorldX(col: number): number {
  return col - BOARD_WIDTH / 2 + 0.5;
}

function boardToWorldY(row: number): number {
  return BOARD_HEIGHT - 1 - row + 0.5;
}

export const TetrisViewport3D: React.FC<TetrisViewport3DProps> = ({
  gameState,
  fallProgress,
  showGhost,
  cameraPreset,
  cameraOrbitOffset,
  onCameraOrbitChange,
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);

  // Store latest props in refs so the 60fps loop never tears down the WebGL context
  const stateRef = useRef(gameState);
  stateRef.current = gameState;

  const fallProgressRef = useRef(fallProgress);
  fallProgressRef.current = fallProgress;

  const showGhostRef = useRef(showGhost);
  showGhostRef.current = showGhost;

  const cameraPresetRef = useRef(cameraPreset);
  cameraPresetRef.current = cameraPreset;

  const orbitOffsetRef = useRef(cameraOrbitOffset);
  orbitOffsetRef.current = cameraOrbitOffset;

  const onOrbitChangeRef = useRef(onCameraOrbitChange);
  onOrbitChangeRef.current = onCameraOrbitChange;

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Renderer setup with Software-WebGL guard & ACES Filmic tone mapping
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
      preserveDrawingBuffer: true,
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.12;
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    const initialW = container.clientWidth || window.innerWidth;
    const initialH = container.clientHeight || window.innerHeight;
    renderer.setSize(initialW, initialH);
    container.appendChild(renderer.domElement);

    // 2. Scene, Fog & Studio Environment Map
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#07090e');
    scene.fog = new THREE.FogExp2('#07090e', 0.016);

    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 3. Perspective 3D Camera
    const camera = new THREE.PerspectiveCamera(40, initialW / initialH, 0.1, 160);
    if (stateRef.current.status === 'title') {
      camera.position.set(-1.2, 12.0, 32.0);
      camera.lookAt(-4.2, 10.2, 0);
    } else {
      camera.position.set(3.8, 12.2, 34.5);
      camera.lookAt(0, 9.8, 0);
    }

    // 4. 3-Point Warm/Cool Studio Lighting Rig
    const hemiLight = new THREE.HemisphereLight(0xbae6fd, 0x0f172a, 0.95);
    hemiLight.position.set(0, 30, 0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfffbeb, 1.85);
    keyLight.position.set(12, 26, 22);
    if (!isSoftwareGl) {
      keyLight.castShadow = true;
      keyLight.shadow.mapSize.width = 1024;
      keyLight.shadow.mapSize.height = 1024;
      keyLight.shadow.camera.near = 2;
      keyLight.shadow.camera.far = 55;
      const d = 14;
      keyLight.shadow.camera.left = -d;
      keyLight.shadow.camera.right = d;
      keyLight.shadow.camera.top = d;
      keyLight.shadow.camera.bottom = -d;
      keyLight.shadow.bias = -0.0005;
      keyLight.shadow.normalBias = 0.02;
    }
    scene.add(keyLight);

    const rimLight = new THREE.DirectionalLight(0x38bdf8, 1.25);
    rimLight.position.set(-14, 15, -12);
    scene.add(rimLight);

    const fillPoint = new THREE.PointLight(0x818cf8, 1.5, 38, 1.5);
    fillPoint.position.set(-8, 10, 14);
    scene.add(fillPoint);

    // 5. Build the 3D Playfield Architecture (Composite Multi-Part Structure)
    const wellGroup = new THREE.Group();
    scene.add(wellGroup);

    // Ground pedestal platform + contact shadow
    const basePlatformGeo = new THREE.BoxGeometry(12.6, 0.55, 3.2);
    const basePlatformMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.35,
      metalness: 0.75,
    });
    const basePlatform = new THREE.Mesh(basePlatformGeo, basePlatformMat);
    basePlatform.position.set(0, -0.32, 0);
    basePlatform.receiveShadow = !isSoftwareGl;
    wellGroup.add(basePlatform);

    // Metallic bevel trim on base
    const baseTrimGeo = new THREE.BoxGeometry(10.8, 0.14, 1.45);
    const baseTrimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.2,
      metalness: 0.8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.55,
    });
    const baseTrim = new THREE.Mesh(baseTrimGeo, baseTrimMat);
    baseTrim.position.set(0, -0.02, 0);
    wellGroup.add(baseTrim);

    // Contact shadow disc under well
    const shadowDiscGeo = new THREE.CircleGeometry(8.5, 32);
    const shadowDiscMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.45,
      depthWrite: false,
    });
    const shadowDisc = new THREE.Mesh(shadowDiscGeo, shadowDiscMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.set(0, -0.62, 0);
    wellGroup.add(shadowDisc);

    // Left and Right Structural Pillars (Multi-part: main column + inner glowing rail + cap)
    const pillarGeo = new THREE.BoxGeometry(0.42, BOARD_HEIGHT + 0.5, 1.32);
    const pillarMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.32,
      metalness: 0.75,
    });

    const leftPillar = new THREE.Mesh(pillarGeo, pillarMat);
    leftPillar.position.set(-BOARD_WIDTH / 2 - 0.24, BOARD_HEIGHT / 2, 0);
    wellGroup.add(leftPillar);

    const rightPillar = new THREE.Mesh(pillarGeo, pillarMat);
    rightPillar.position.set(BOARD_WIDTH / 2 + 0.24, BOARD_HEIGHT / 2, 0);
    wellGroup.add(rightPillar);

    // Glowing inner border rails along left, right, and bottom of the 10x20 well
    const railGeo = new THREE.BoxGeometry(0.08, BOARD_HEIGHT, 1.12);
    const railMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0ea5e9,
      emissiveIntensity: 0.85,
      roughness: 0.2,
    });

    const leftRail = new THREE.Mesh(railGeo, railMat);
    leftRail.position.set(-BOARD_WIDTH / 2 - 0.02, BOARD_HEIGHT / 2, 0);
    wellGroup.add(leftRail);

    const rightRail = new THREE.Mesh(railGeo, railMat);
    rightRail.position.set(BOARD_WIDTH / 2 + 0.02, BOARD_HEIGHT / 2, 0);
    wellGroup.add(rightRail);

    // Top crown beam
    const topBeamGeo = new THREE.BoxGeometry(BOARD_WIDTH + 0.9, 0.28, 1.32);
    const topBeam = new THREE.Mesh(topBeamGeo, pillarMat);
    topBeam.position.set(0, BOARD_HEIGHT + 0.14, 0);
    wellGroup.add(topBeam);

    // Semi-transparent side walls & backplate
    const sideWallGeo = new THREE.PlaneGeometry(1.1, BOARD_HEIGHT);
    const sideWallMat = new THREE.MeshPhysicalMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.14,
      roughness: 0.15,
      metalness: 0.1,
      side: THREE.DoubleSide,
      depthWrite: false,
    });

    const leftGlassWall = new THREE.Mesh(sideWallGeo, sideWallMat);
    leftGlassWall.rotation.y = Math.PI / 2;
    leftGlassWall.position.set(-BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 0);
    wellGroup.add(leftGlassWall);

    const rightGlassWall = new THREE.Mesh(sideWallGeo, sideWallMat);
    rightGlassWall.rotation.y = Math.PI / 2;
    rightGlassWall.position.set(BOARD_WIDTH / 2, BOARD_HEIGHT / 2, 0);
    wellGroup.add(rightGlassWall);

    // Back structural plate behind grid
    const backWallGeo = new THREE.BoxGeometry(BOARD_WIDTH + 0.1, BOARD_HEIGHT + 0.1, 0.12);
    const backWallMat = new THREE.MeshStandardMaterial({
      color: 0x080c14,
      roughness: 0.7,
      metalness: 0.3,
    });
    const backWall = new THREE.Mesh(backWallGeo, backWallMat);
    backWall.position.set(0, BOARD_HEIGHT / 2, -0.62);
    backWall.receiveShadow = !isSoftwareGl;
    wellGroup.add(backWall);

    // Grid Lines on Back Wall and Side Walls (10 x 20 cells)
    const gridPoints: THREE.Vector3[] = [];
    const zBack = -0.54;
    const zFront = 0.54;
    for (let x = 0; x <= BOARD_WIDTH; x++) {
      const wx = x - BOARD_WIDTH / 2;
      gridPoints.push(new THREE.Vector3(wx, 0, zBack));
      gridPoints.push(new THREE.Vector3(wx, BOARD_HEIGHT, zBack));
    }
    for (let y = 0; y <= BOARD_HEIGHT; y++) {
      gridPoints.push(new THREE.Vector3(-BOARD_WIDTH / 2, y, zBack));
      gridPoints.push(new THREE.Vector3(BOARD_WIDTH / 2, y, zBack));
      // Side wall depth ticks
      gridPoints.push(new THREE.Vector3(-BOARD_WIDTH / 2, y, zBack));
      gridPoints.push(new THREE.Vector3(-BOARD_WIDTH / 2, y, zFront));
      gridPoints.push(new THREE.Vector3(BOARD_WIDTH / 2, y, zBack));
      gridPoints.push(new THREE.Vector3(BOARD_WIDTH / 2, y, zFront));
    }
    const gridLineGeo = new THREE.BufferGeometry().setFromPoints(gridPoints);
    const gridLineMat = new THREE.LineBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
    });
    const gridLines = new THREE.LineSegments(gridLineGeo, gridLineMat);
    wellGroup.add(gridLines);

    // Visual Cell Socket Matrix (200 Instanced tiles on the back wall that visually distinguish free vs occupied cells!)
    const socketGeo = new THREE.PlaneGeometry(0.82, 0.82);
    const socketMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.35,
      polygonOffset: true,
      polygonOffsetFactor: -1,
      polygonOffsetUnits: -1,
    });
    const cellSocketInstanced = new THREE.InstancedMesh(
      socketGeo,
      socketMat,
      BOARD_WIDTH * BOARD_HEIGHT
    );
    cellSocketInstanced.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(BOARD_WIDTH * BOARD_HEIGHT * 3),
      3
    );
    for (let row = 0; row < BOARD_HEIGHT; row++) {
      for (let col = 0; col < BOARD_WIDTH; col++) {
        const idx = row * BOARD_WIDTH + col;
        _dummy.position.set(boardToWorldX(col), boardToWorldY(row), -0.53);
        _dummy.rotation.set(0, 0, 0);
        _dummy.scale.set(1, 1, 1);
        _dummy.updateMatrix();
        cellSocketInstanced.setMatrixAt(idx, _dummy.matrix);
        cellSocketInstanced.setColorAt(idx, _color.setHex(0x111827));
      }
    }
    cellSocketInstanced.instanceMatrix.needsUpdate = true;
    cellSocketInstanced.instanceColor.needsUpdate = true;
    wellGroup.add(cellSocketInstanced);

    // 6. Composite 3D Block Pool (200 board cells + 4 active piece + 4 ghost piece)
    const sharedBlockGeo = createBeveledBlockGeometry();
    const sharedEdgesGeo = new THREE.EdgesGeometry(sharedBlockGeo, 24);
    const coreStudGeo = new THREE.BoxGeometry(0.46, 0.46, 0.82);

    // Pre-build vibrant, saturated PBR materials for each TetrominoType + Ghost material + Flash material
    const blockMaterials: Record<TetrominoType, THREE.MeshPhysicalMaterial> = {} as Record<
      TetrominoType,
      THREE.MeshPhysicalMaterial
    >;
    const edgeMaterials: Record<TetrominoType, THREE.LineBasicMaterial> = {} as Record<
      TetrominoType,
      THREE.LineBasicMaterial
    >;
    const coreMaterials: Record<TetrominoType, THREE.MeshStandardMaterial> = {} as Record<
      TetrominoType,
      THREE.MeshStandardMaterial
    >;

    for (const type of TETROMINO_TYPES) {
      const spec = TETROMINO_SPECS[type];
      blockMaterials[type] = new THREE.MeshPhysicalMaterial({
        color: new THREE.Color(spec.colorHex),
        emissive: new THREE.Color(spec.emissiveHex),
        emissiveIntensity: 0.32,
        roughness: 0.26,
        metalness: 0.12,
        clearcoat: 0.65,
        clearcoatRoughness: 0.18,
      });
      edgeMaterials[type] = new THREE.LineBasicMaterial({
        color: new THREE.Color(spec.borderHex),
        transparent: true,
        opacity: 0.85,
      });
      coreMaterials[type] = new THREE.MeshStandardMaterial({
        color: new THREE.Color(spec.emissiveHex),
        emissive: new THREE.Color(spec.colorHex),
        emissiveIntensity: 0.45,
        roughness: 0.15,
        metalness: 0.35,
      });
    }

    const flashBlockMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0xe0f2fe,
      emissiveIntensity: 1.4,
      roughness: 0.1,
    });

    interface BlockVisualNode {
      group: THREE.Group;
      bodyMesh: THREE.Mesh;
      coreMesh: THREE.Mesh;
      edgeLines: THREE.LineSegments;
      currentType: TetrominoType;
      isFlashing: boolean;
    }

    const createBlockNode = (initialType: TetrominoType = 'I'): BlockVisualNode => {
      const group = new THREE.Group();
      group.visible = false;

      const bodyMesh = new THREE.Mesh(sharedBlockGeo, blockMaterials[initialType]);
      bodyMesh.castShadow = !isSoftwareGl;
      bodyMesh.receiveShadow = !isSoftwareGl;
      group.add(bodyMesh);

      const coreMesh = new THREE.Mesh(coreStudGeo, coreMaterials[initialType]);
      group.add(coreMesh);

      const edgeLines = new THREE.LineSegments(sharedEdgesGeo, edgeMaterials[initialType]);
      group.add(edgeLines);

      wellGroup.add(group);
      return {
        group,
        bodyMesh,
        coreMesh,
        edgeLines,
        currentType: initialType,
        isFlashing: false,
      };
    };

    const setBlockNodeAppearance = (
      node: BlockVisualNode,
      type: TetrominoType,
      flashing: boolean
    ) => {
      if (node.currentType !== type || node.isFlashing !== flashing) {
        node.currentType = type;
        node.isFlashing = flashing;
        node.bodyMesh.material = flashing ? flashBlockMat : blockMaterials[type];
        node.coreMesh.material = coreMaterials[type];
        node.edgeLines.material = edgeMaterials[type];
      }
    };

    // Create 200 board block nodes (1 per grid cell)
    const boardNodes: BlockVisualNode[][] = Array.from({ length: BOARD_HEIGHT }, () =>
      Array.from({ length: BOARD_WIDTH }, () => createBlockNode('I'))
    );

    // Create 4 active piece block nodes
    const activeNodes: BlockVisualNode[] = Array.from({ length: 4 }, () => createBlockNode('T'));

    // Create 4 Ghost piece block nodes (translucent wireframe + holographic core)
    const ghostMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
    });
    const ghostEdgeMat = new THREE.LineBasicMaterial({
      color: 0x7dd3fc,
      transparent: true,
      opacity: 0.85,
    });
    const ghostNodes: THREE.Group[] = Array.from({ length: 4 }, () => {
      const g = new THREE.Group();
      g.visible = false;
      const m = new THREE.Mesh(sharedBlockGeo, ghostMat);
      const e = new THREE.LineSegments(sharedEdgesGeo, ghostEdgeMat);
      g.add(m);
      g.add(e);
      wellGroup.add(g);
      return g;
    });

    // Vertical drop guide lasers from active piece to ghost piece
    const guideGeo = new THREE.BoxGeometry(0.035, 1, 0.035);
    const guideMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
    });
    const guideBeams = Array.from({ length: 4 }, () => {
      const beam = new THREE.Mesh(guideGeo, guideMat);
      beam.visible = false;
      wellGroup.add(beam);
      return beam;
    });

    // 7. Zero-GC Pooled 3D Particle Ring Buffer (for line clear shatter & hard drop bursts)
    const PARTICLE_CAP = 180;
    const particleGeo = new THREE.BoxGeometry(0.24, 0.24, 0.24);
    const particleMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x38bdf8,
      emissiveIntensity: 0.65,
      roughness: 0.2,
    });
    const particleMesh = new THREE.InstancedMesh(particleGeo, particleMat, PARTICLE_CAP);
    particleMesh.instanceColor = new THREE.InstancedBufferAttribute(
      new Float32Array(PARTICLE_CAP * 3),
      3
    );
    particleMesh.frustumCulled = false;
    wellGroup.add(particleMesh);

    const particles: Particle[] = Array.from({ length: PARTICLE_CAP }, () => ({
      active: false,
      x: 0,
      y: 0,
      z: 0,
      vx: 0,
      vy: 0,
      vz: 0,
      rx: 0,
      ry: 0,
      rz: 0,
      vrx: 0,
      vry: 0,
      life: 0,
      maxLife: 1,
      colorHex: '#38bdf8',
    }));
    let particleCursor = 0;

    const spawnParticleBurst = (
      wx: number,
      wy: number,
      wz: number,
      colorHex: string,
      count: number,
      speedScale = 1
    ) => {
      for (let i = 0; i < count; i++) {
        const p = particles[particleCursor];
        particleCursor = (particleCursor + 1) % PARTICLE_CAP;
        p.active = true;
        p.x = wx + (Math.random() - 0.5) * 0.6;
        p.y = wy + (Math.random() - 0.5) * 0.6;
        p.z = wz + (Math.random() - 0.5) * 0.6;
        p.vx = (Math.random() - 0.5) * 7.5 * speedScale;
        p.vy = (Math.random() * 5.5 + 1.5) * speedScale;
        p.vz = (Math.random() - 0.2) * 7.0 * speedScale;
        p.rx = Math.random() * Math.PI;
        p.ry = Math.random() * Math.PI;
        p.rz = Math.random() * Math.PI;
        p.vrx = (Math.random() - 0.5) * 12;
        p.vry = (Math.random() - 0.5) * 12;
        p.maxLife = 0.45 + Math.random() * 0.35;
        p.life = p.maxLife;
        p.colorHex = colorHex;
      }
    };

    // 8. Ambient background floating dust / stars (InstancedMesh)
    const starCount = 70;
    const starGeo = new THREE.OctahedronGeometry(0.08, 0);
    const starMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const starField = new THREE.InstancedMesh(starGeo, starMat, starCount);
    const starPositions = Array.from({ length: starCount }, () => ({
      x: (Math.random() - 0.5) * 42,
      y: Math.random() * 28 - 2,
      z: -4 - Math.random() * 20,
      speed: 0.3 + Math.random() * 0.6,
    }));
    scene.add(starField);

    // 9. Animation & Physics state trackers
    // Per-cell lock flash timer (seconds) and vertical bounce offset
    const cellFlashTimers: number[][] = Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill(0)
    );
    const cellBounceTimers: number[][] = Array.from({ length: BOARD_HEIGHT }, () =>
      Array(BOARD_WIDTH).fill(0)
    );
    const rowDropOffsets: number[] = Array(BOARD_HEIGHT).fill(0);

    let lastProcessedLockId = stateRef.current.lastLockEvent?.id ?? 0;
    let lastStatus = stateRef.current.status;
    let cameraTrauma = 0;
    let wellBounceVy = 0;
    let wellBounceY = 0;

    // Smooth active piece visual interpolation
    let smoothPieceX = 3;
    let smoothPieceY = 0;
    let lastActivePieceType: TetrominoType | null = null;

    // Pre-warm shaders on hardware GPUs
    if (!isSoftwareGl) {
      renderer.compile(scene, camera);
    }

    // 10. Pointer drag camera orbit interaction (without changing game logic)
    let isDraggingCamera = false;
    let dragStartX = 0;
    let dragStartY = 0;

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0) return;
      isDraggingCamera = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!isDraggingCamera) return;
      const dx = (e.clientX - dragStartX) / Math.max(300, window.innerWidth);
      const dy = (e.clientY - dragStartY) / Math.max(300, window.innerHeight);
      dragStartX = e.clientX;
      dragStartY = e.clientY;

      const nextYaw = THREE.MathUtils.clamp(orbitOffsetRef.current.yaw + dx * 1.6, -0.55, 0.55);
      const nextPitch = THREE.MathUtils.clamp(orbitOffsetRef.current.pitch + dy * 1.2, -0.35, 0.45);
      onOrbitChangeRef.current({ yaw: nextYaw, pitch: nextPitch });
    };

    const onPointerUp = () => {
      isDraggingCamera = false;
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);

    // 11. ResizeObserver for responsive viewport
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || window.innerHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
      renderer.render(scene, camera);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    window.addEventListener('resize', handleResize);

    // 12. Software-WebGL safe frame scheduler (`afterDraw` pattern from threejs skill)
    let frameId = 0;
    let unmounted = false;

    function afterDraw(cb: () => void) {
      const gl = renderer.getContext() as WebGL2RenderingContext;
      const sync = gl.fenceSync ? gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0) : null;
      gl.flush();
      const poll = () => {
        if (unmounted) return;
        const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
        if (state === gl.UNSIGNALED) {
          frameId = window.setTimeout(poll, 5);
        } else {
          if (sync) gl.deleteSync(sync);
          frameId = window.setTimeout(cb, 80);
        }
      };
      frameId = window.setTimeout(poll, 5);
    }

    let lastTime = performance.now();

    function tick() {
      if (unmounted) return;
      const now = performance.now();
      const rawDt = (now - lastTime) / 1000;
      lastTime = now;
      const dt = Math.min(rawDt, 0.05); // Clamped delta time

      const st = stateRef.current;

      // Check for new Lock / Line Clear event
      if (st.lastLockEvent && st.lastLockEvent.id !== lastProcessedLockId) {
        lastProcessedLockId = st.lastLockEvent.id;
        const ev = st.lastLockEvent;

        // Trigger well spring bounce on landing/hardDrop
        wellBounceVy = ev.hardDrop ? -3.2 : -1.4;
        if (ev.hardDrop) {
          cameraTrauma = Math.min(1, cameraTrauma + 0.25);
        }

        // Highlight & squash-bounce newly locked cells
        const spec = TETROMINO_SPECS[ev.pieceType];
        for (const c of ev.lockedCells) {
          if (c.y >= 0 && c.y < BOARD_HEIGHT && c.x >= 0 && c.x < BOARD_WIDTH) {
            cellFlashTimers[c.y][c.x] = 0.26;
            cellBounceTimers[c.y][c.x] = 0.32;
            if (ev.hardDrop) {
              spawnParticleBurst(
                boardToWorldX(c.x),
                boardToWorldY(c.y),
                0.4,
                spec.borderHex,
                4,
                0.85
              );
            }
          }
        }

        // If lines were cleared, trigger 3D block shatter particles & upper row cascade drop!
        if (ev.clearedRows.length > 0) {
          const isTetris = ev.clearedRows.length >= 4;
          cameraTrauma = Math.min(1, cameraTrauma + (isTetris ? 0.65 : 0.38));

          for (const cb of ev.clearedBlocks) {
            const bSpec = TETROMINO_SPECS[cb.type];
            spawnParticleBurst(
              boardToWorldX(cb.x),
              boardToWorldY(cb.y),
              0.2,
              bSpec.colorHex,
              isTetris ? 7 : 5,
              isTetris ? 1.35 : 1.0
            );
          }

          // Animate upper rows dropping down smoothly
          const maxClearedRow = Math.max(...ev.clearedRows);
          for (let r = 0; r <= maxClearedRow; r++) {
            rowDropOffsets[r] = ev.clearedRows.length * 1.0;
          }
        }
      }

      // Check for Game Over transition -> dramatic burst
      if (st.status === 'gameover' && lastStatus !== 'gameover') {
        cameraTrauma = 0.75;
        for (let r = 0; r < BOARD_HEIGHT; r += 2) {
          for (let c = 0; c < BOARD_WIDTH; c += 2) {
            const t = st.board[r][c];
            if (t) {
              spawnParticleBurst(
                boardToWorldX(c),
                boardToWorldY(r),
                0.3,
                TETROMINO_SPECS[t].colorHex,
                3,
                1.2
              );
            }
          }
        }
      }
      lastStatus = st.status;

      // Update well vertical spring physics (landing squash/rebound)
      const springK = 140;
      const springDamp = 14;
      const accel = -springK * wellBounceY - springDamp * wellBounceVy;
      wellBounceVy += accel * dt;
      wellBounceY += wellBounceVy * dt;
      // Shift well up slightly (+1.1) so the entire pedestal sits cleanly above the bottom dock
      wellGroup.position.y = 1.1 + wellBounceY;

      // Camera Choreography with exponential damping
      const preset = cameraPresetRef.current;
      let baseCamX = 3.6;
      let baseCamY = 11.4;
      let baseCamZ = 34.5;
      let lookX = 0;
      let lookY = 9.8;

      if (st.status === 'title') {
        // Frame well on the right half so left 40% is calm negative space for Title UI
        const t = now * 0.0006;
        baseCamX = -1.2 + Math.sin(t) * 1.4;
        baseCamY = 12.0 + Math.cos(t * 0.7) * 0.6;
        baseCamZ = 32.0;
        lookX = -4.2;
        lookY = 10.2;
      } else {
        if (preset === 'front') {
          baseCamX = 0;
          baseCamY = 10.6;
          baseCamZ = 34.0;
        } else if (preset === 'isometric') {
          baseCamX = 8.8;
          baseCamY = 14.2;
          baseCamZ = 33.0;
        } else if (preset === 'topTilt') {
          baseCamX = 2.5;
          baseCamY = 18.0;
          baseCamZ = 32.5;
        } else {
          // 'angled' default: slight angle from top and side per prompt spec, full well visible
          baseCamX = 3.8;
          baseCamY = 12.2;
          baseCamZ = 34.5;
        }

        // Apply user camera orbit offset
        baseCamX += orbitOffsetRef.current.yaw * 14;
        baseCamY += orbitOffsetRef.current.pitch * 10;
      }

      // Decaying trauma camera shake
      cameraTrauma = Math.max(0, cameraTrauma - dt * 1.8);
      const shakeAmt = cameraTrauma * cameraTrauma * 0.45;
      const shakeX = (Math.random() - 0.5) * shakeAmt;
      const shakeY = (Math.random() - 0.5) * shakeAmt;

      const dampFactor = 1 - Math.exp(-7.5 * dt);
      _vec3A.set(baseCamX + shakeX, baseCamY + shakeY, baseCamZ);
      camera.position.lerp(_vec3A, dampFactor);
      _vec3B.set(lookX, lookY, 0);
      camera.lookAt(_vec3B);

      // Update Board Locked Blocks & Backplate Socket Matrix
      const isTitle = st.status === 'title';

      // Build lookup for title demo blocks if in title mode
      const activeCellsList =
        !isTitle && st.activePiece ? getPieceCells(st.activePiece) : [];

      for (let row = 0; row < BOARD_HEIGHT; row++) {
        // Decay row drop cascade offset
        if (rowDropOffsets[row] > 0.001) {
          rowDropOffsets[row] = THREE.MathUtils.damp(rowDropOffsets[row], 0, 14, dt);
        } else {
          rowDropOffsets[row] = 0;
        }

        for (let col = 0; col < BOARD_WIDTH; col++) {
          const node = boardNodes[row][col];
          let cellType: TetrominoType | null = st.board[row][col];

          if (isTitle) {
            const demo = TITLE_DEMO_BLOCKS.find((b) => b.x === col && b.y === row);
            cellType = demo ? demo.type : null;
          }

          // Update timers
          if (cellFlashTimers[row][col] > 0) {
            cellFlashTimers[row][col] = Math.max(0, cellFlashTimers[row][col] - dt);
          }
          if (cellBounceTimers[row][col] > 0) {
            cellBounceTimers[row][col] = Math.max(0, cellBounceTimers[row][col] - dt);
          }

          const socketIdx = row * BOARD_WIDTH + col;

          if (cellType !== null) {
            node.group.visible = true;
            const isFlashing = cellFlashTimers[row][col] > 0;
            setBlockNodeAppearance(node, cellType, isFlashing);

            const wx = boardToWorldX(col);
            const wy = boardToWorldY(row) + rowDropOffsets[row];
            node.group.position.set(wx, wy, 0);

            // Squash & stretch animation on newly locked cells
            const bt = cellBounceTimers[row][col];
            if (bt > 0) {
              const phase = (bt / 0.32) * Math.PI;
              const squash = Math.sin(phase) * 0.22;
              node.group.scale.set(1 + squash * 0.65, 1 - squash, 1 + squash * 0.65);
            } else {
              node.group.scale.set(1, 1, 1);
            }

            // Highlight occupied socket on backplate
            cellSocketInstanced.setColorAt(
              socketIdx,
              _color.set(TETROMINO_SPECS[cellType].colorHex)
            );
          } else {
            node.group.visible = false;
            // Check if active piece is currently over this cell
            const isUnderActive = activeCellsList.some((c) => c.x === col && c.y === row);
            cellSocketInstanced.setColorAt(
              socketIdx,
              _color.setHex(isUnderActive ? 0x1e293b : 0x0b1120)
            );
          }
        }
      }
      cellSocketInstanced.instanceColor!.needsUpdate = true;

      // Update Active Falling Piece & Ghost Piece
      if (!isTitle && st.activePiece && st.status !== 'gameover') {
        const piece = st.activePiece;
        if (lastActivePieceType !== piece.type) {
          lastActivePieceType = piece.type;
          smoothPieceX = piece.x;
          smoothPieceY = piece.y;
        } else {
          smoothPieceX = THREE.MathUtils.damp(smoothPieceX, piece.x, 26, dt);
          // Smoothly glide Y between gravity steps unless blocked by a cell directly below
          const canGlideDown = getGhostY(st) > piece.y;
          const targetVisualY = piece.y + (canGlideDown ? fallProgressRef.current * 0.85 : 0);
          if (Math.abs(targetVisualY - smoothPieceY) > 2.5) {
            smoothPieceY = targetVisualY;
          } else {
            smoothPieceY = THREE.MathUtils.damp(smoothPieceY, targetVisualY, 24, dt);
          }
        }

        const localCells = TETROMINO_SPECS[piece.type].rotations[piece.rotation];
        const ghostY = getGhostY(st);
        const showGhostNow = showGhostRef.current && ghostY > piece.y;

        const spec = TETROMINO_SPECS[piece.type];
        ghostMat.color.set(spec.colorHex);
        ghostEdgeMat.color.set(spec.borderHex);
        guideMat.color.set(spec.borderHex);

        for (let i = 0; i < 4; i++) {
          const lc = localCells[i];
          const activeNode = activeNodes[i];
          activeNode.group.visible = true;
          setBlockNodeAppearance(activeNode, piece.type, false);

          const vx = boardToWorldX(smoothPieceX + lc.x);
          const vy = boardToWorldY(smoothPieceY + lc.y);
          activeNode.group.position.set(vx, vy, 0);
          activeNode.group.scale.set(1, 1, 1);

          // Ghost piece block
          const ghostGroup = ghostNodes[i];
          const beam = guideBeams[i];
          if (showGhostNow) {
            ghostGroup.visible = true;
            const gx = boardToWorldX(piece.x + lc.x);
            const gy = boardToWorldY(ghostY + lc.y);
            ghostGroup.position.set(gx, gy, 0);

            // Vertical guide laser between piece and ghost
            const dist = Math.max(0, vy - gy);
            if (dist > 0.8) {
              beam.visible = true;
              beam.position.set(gx, gy + dist / 2, 0);
              beam.scale.set(1, dist, 1);
            } else {
              beam.visible = false;
            }
          } else {
            ghostGroup.visible = false;
            beam.visible = false;
          }
        }
      } else {
        lastActivePieceType = null;
        for (let i = 0; i < 4; i++) {
          activeNodes[i].group.visible = false;
          ghostNodes[i].visible = false;
          guideBeams[i].visible = false;
        }
      }

      // Update Pooled 3D Particles
      for (let i = 0; i < PARTICLE_CAP; i++) {
        const p = particles[i];
        if (p.active) {
          p.life -= dt;
          if (p.life <= 0) {
            p.active = false;
            _dummy.scale.set(0, 0, 0);
            _dummy.updateMatrix();
            particleMesh.setMatrixAt(i, _dummy.matrix);
          } else {
            p.vy -= 18.5 * dt; // Gravity
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.z += p.vz * dt;
            p.rx += p.vrx * dt;
            p.ry += p.vry * dt;

            const scale = Math.max(0.01, (p.life / p.maxLife) * 1.15);
            _dummy.position.set(p.x, p.y, p.z);
            _dummy.rotation.set(p.rx, p.ry, p.rz);
            _dummy.scale.setScalar(scale);
            _dummy.updateMatrix();
            particleMesh.setMatrixAt(i, _dummy.matrix);
            particleMesh.setColorAt(i, _color.set(p.colorHex));
          }
        } else {
          _dummy.scale.set(0, 0, 0);
          _dummy.updateMatrix();
          particleMesh.setMatrixAt(i, _dummy.matrix);
        }
      }
      particleMesh.instanceMatrix.needsUpdate = true;
      if (particleMesh.instanceColor) {
        particleMesh.instanceColor.needsUpdate = true;
      }

      // Update ambient background floating crystals
      for (let i = 0; i < starCount; i++) {
        const sp = starPositions[i];
        sp.y += sp.speed * dt;
        if (sp.y > 26) sp.y = -2;
        _dummy.position.set(sp.x, sp.y, sp.z);
        _dummy.rotation.set(now * 0.0005 + i, now * 0.0008 + i, 0);
        _dummy.scale.setScalar(1);
        _dummy.updateMatrix();
        starField.setMatrixAt(i, _dummy.matrix);
      }
      starField.instanceMatrix.needsUpdate = true;

      renderer.render(scene, camera);

      if (isSoftwareGl) {
        afterDraw(tick);
      } else {
        frameId = requestAnimationFrame(tick);
      }
    }

    // Render first frame immediately so initial paint is never blank
    tick();

    return () => {
      unmounted = true;
      cancelAnimationFrame(frameId);
      clearTimeout(frameId);
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      domElem.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);

      sharedBlockGeo.dispose();
      sharedEdgesGeo.dispose();
      coreStudGeo.dispose();
      basePlatformGeo.dispose();
      basePlatformMat.dispose();
      renderer.dispose();
      if (domElem.parentNode) {
        domElem.parentNode.removeChild(domElem);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      data-testid="tetris-3d-viewport"
      className="fixed inset-0 w-full h-full overflow-hidden cursor-grab active:cursor-grabbing"
    />
  );
};
