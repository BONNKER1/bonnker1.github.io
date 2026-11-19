import * as THREE from 'three';
import { GLTFLoader, type GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

export interface CarApi {
  setTint: (value: number) => void;
  dispose: () => void;
}

export interface CarOptions {
  /** Степень затемнения, которую нужно применить сразу после загрузки модели. */
  vlt?: number;
  /** Вызывается, когда модель загрузилась и отрисовалась. */
  onLoaded?: () => void;
  /** Вызывается, если модель загрузить не удалось. */
  onError?: () => void;
}

const MODEL_URL = '/models/porsche911.glb';

const TINT: Record<number, { opacity: number; color: number }> = {
  5: { opacity: 0.72, color: 0x050505 }, // самая тёмная
  15: { opacity: 0.52, color: 0x121212 },
  35: { opacity: 0.32, color: 0x404040 },
  50: { opacity: 0.21, color: 0x747474 }, // самая светлая
};

function glassMeshes(root: THREE.Object3D): THREE.Mesh[] {
  const found = new Set<THREE.Mesh>();
  const include = /glass|window|windshield|windscreen/i;
  const exclude = /light|lamp|head|fog|tail|indicator|signal|reflector|bulb|lens/i;
  const walk = (object: THREE.Object3D): void => {
    if (object instanceof THREE.Mesh) {
      const name = object.name || '';
      if (include.test(name) && !exclude.test(name)) found.add(object);
    }
    for (const child of object.children) walk(child);
  };
  walk(root);
  return [...found];
}

function applyTint(scene: THREE.Scene, value: number): void {
  const vlt = Number.isFinite(value) ? Math.round(value) : 15;
  const key = Object.keys(TINT).includes(String(vlt)) ? vlt : 15;
  const { opacity, color } = TINT[key];
  for (const mesh of glassMeshes(scene)) {
    const data = mesh.userData as { __tintedMaterials?: THREE.Material[] };
    if (!data.__tintedMaterials) {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      data.__tintedMaterials = materials.map((material) => {
        const mat = material.clone() as THREE.MeshPhysicalMaterial | THREE.MeshStandardMaterial;
        mat.transparent = true;
        if ('roughness' in mat) mat.roughness = 0.08;
        mat.depthWrite = false;
        mat.needsUpdate = true;
        return mat;
      });
      mesh.material = Array.isArray(mesh.material) ? data.__tintedMaterials : data.__tintedMaterials[0];
    }
    for (const material of data.__tintedMaterials) {
      material.opacity = opacity;
      (material as THREE.MeshPhysicalMaterial).color.setHex(color);
      material.needsUpdate = true;
    }
  }
}

/**
 * Создаёт 3D-сцену с моделью автомобиля в указанном контейнере.
 *
 * Вызывается из `ThreeCar.astro` лениво — отдельным `import()`, чтобы
 * three.js (~600 КБ) и сама модель (~15 МБ) не попадали в первичную загрузку.
 */
export function initCar(container: HTMLElement, options: CarOptions = {}): CarApi {
  const { vlt = 15, onLoaded, onError } = options;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setClearColor(0x02060a);
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x02060a);

  const camera = new THREE.PerspectiveCamera(
    42,
    container.clientWidth / Math.max(1, container.clientHeight),
    0.05,
    200,
  );
  camera.position.set(4.5, 2.6, 6.5);

  scene.add(new THREE.AmbientLight(0xffffff, 0.55));
  const directional = new THREE.DirectionalLight(0xffffff, 1.6);
  directional.position.set(4, 6, 4);
  scene.add(directional);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x22303c, 0.5));
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.minDistance = 1.5;
  controls.maxDistance = 25;
  controls.maxPolarAngle = Math.PI * 0.48;
  controls.target.set(0, 1.2, 0);
  controls.enablePan = false;
  // На телефоне вертикальный свайп листает страницу, горизонтальный — вращает модель.
  renderer.domElement.style.touchAction = 'pan-y';

  // Перерисовываем сцену только при изменениях: экономит батарею и не греет телефон.
  let needsRender = true;
  const requestRender = (): void => {
    needsRender = true;
  };
  controls.addEventListener('change', requestRender);

  const loader = new GLTFLoader();
  // Модель сжата Draco — декодер лежит в public/draco/.
  const draco = new DRACOLoader();
  draco.setDecoderPath('/draco/');
  loader.setDRACOLoader(draco);
  let disposed = false;
  loader.load(
    MODEL_URL,
    (gltf: GLTF) => {
      if (disposed) return;
      const model = gltf.scene;
      scene.add(model);

      // Центрируем и масштабируем модель, чтобы она хорошо помещалась в кадр.
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);

      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const targetSize = 4; // целевой размер модели в сцене
      const scale = (targetSize / maxDim) * 30; // заметно увеличить модель
      model.scale.setScalar(scale);

      // Пересчитываем границы после масштаба и центрирования.
      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());
      const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
      const scaledMax = Math.max(scaledSize.x, scaledSize.y, scaledSize.z) || 1;

      camera.position.copy(scaledCenter).add(
        new THREE.Vector3(0.9, 0.55, 1).normalize().multiplyScalar(scaledMax * 1.6),
      );
      camera.near = 0.01;
      camera.far = Math.max(2000, scaledMax * 50);
      camera.updateProjectionMatrix();
      controls.target.copy(scaledCenter);
      controls.minDistance = Math.max(0.5, scaledMax * 0.4);
      controls.maxDistance = scaledMax * 8;
      controls.update();

      scene.fog = new THREE.Fog(0x02060a, scaledMax * 2.5, scaledMax * 12);

      // Tron-style grid floor
      const gridSize = Math.max(120, scaledMax * 12);
      const gridDiv = 80;
      const grid = new THREE.GridHelper(gridSize, gridDiv, 0x00eaff, 0x004b66);
      const gridMaterials = Array.isArray(grid.material) ? grid.material : [grid.material];
      for (const m of gridMaterials) {
        m.transparent = true;
        m.opacity = 0.55;
      }
      grid.position.y = scaledBox.min.y - 0.02;
      scene.add(grid);

      // Светящаяся плоскость под сеткой для "неонового" эффекта
      const glowGeo = new THREE.PlaneGeometry(gridSize, gridSize);
      const glowMat = new THREE.MeshBasicMaterial({
        color: 0x001018,
        transparent: true,
        opacity: 0.65,
        side: THREE.DoubleSide,
      });
      const glowPlane = new THREE.Mesh(glowGeo, glowMat);
      glowPlane.rotation.x = -Math.PI / 2;
      glowPlane.position.y = grid.position.y - 0.01;
      scene.add(glowPlane);

      applyTint(scene, vlt);
      requestRender();
      onLoaded?.();
    },
    undefined,
    (error: unknown) => {
      console.error('[ThreeCar] Не удалось загрузить 3D модель Porsche 911:', error);
      onError?.();
    },
  );

  let rafId = 0;
  const tick = (): void => {
    if (disposed) return;
    rafId = requestAnimationFrame(tick);
    if (!needsRender) return;
    needsRender = false;
    controls.update();
    renderer.render(scene, camera);
  };
  tick();

  const resize = (): void => {
    const width = container.clientWidth || 1;
    const height = Math.max(1, container.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    requestRender();
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);

  const dispose = (): void => {
    disposed = true;
    cancelAnimationFrame(rafId);
    resizeObserver.disconnect();
    controls.dispose();
    draco.dispose();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        object.geometry.dispose();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        for (const material of materials) material.dispose();
      }
    });
    renderer.dispose();
    if (renderer.domElement.parentNode === container) {
      container.removeChild(renderer.domElement);
    }
  };

  const setTint = (value: number): void => {
    applyTint(scene, value);
    requestRender();
  };

  return { setTint, dispose };
}
