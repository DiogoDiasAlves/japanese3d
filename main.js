import * as THREE from 'three';
import {
    createScene, createCamera, createRenderer,
    setupLighting, loadHDRI, buildComposer, onResize
} from './src/scene.js';
import { setupControls }      from './src/controls.js';
import { loadMainEnvironment } from './src/loader.js';
import { initInteractions }   from './src/interactions.js';
import { buildEnvironment }    from './src/environment.js';

// ── Core setup ───────────────────────────────────────────────────────────────
const canvas   = document.getElementById('three-canvas');
const renderer = createRenderer(canvas);
const scene    = createScene();
const camera   = createCamera();
const controls = setupControls(camera, canvas);
const { composer, bloom } = buildComposer(renderer, scene, camera);

setupLighting(scene);
loadHDRI(scene);
buildEnvironment(scene);     // synchronous — instant

// ── State ────────────────────────────────────────────────────────────────────
const clock  = new THREE.Clock();
let   mixer  = null;
let   model  = null;
let   tick   = () => {};    // per-frame interaction updater (assigned after load)

// ── Load ─────────────────────────────────────────────────────────────────────
async function init() {
    const loaderEl   = document.getElementById('loader-overlay');
    const loaderText = document.getElementById('loader-text');

    try {
        // Progress callback updates the loader text
        const gltf = await loadMainEnvironment((p) => {
            if (p.total > 0) {
                const pct = Math.min(99, Math.round(p.loaded / p.total * 100));
                loaderText.textContent = `Loading… ${pct}%`;
            }
        });

        model = gltf.scene;

        // ── Auto-fit and Align to Ground (y=0) ──────────────────────────
        // 1. Initial scale calculation
        const initialBox = new THREE.Box3().setFromObject(model);
        const size = initialBox.getSize(new THREE.Vector3());
        const sc = 10 / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(sc);

        // 2. Force matrices update so Box3 reads the true scaled world positions
        model.updateMatrixWorld(true);

        // 3. Recalculate exact bounds in world space
        const scaledBox = new THREE.Box3().setFromObject(model);
        const center = scaledBox.getCenter(new THREE.Vector3());

        // 4. Align lowest point strictly to y=0, center X/Z
        const baseY = model.position.y - scaledBox.min.y;
        model.position.x += -center.x;
        model.position.z += -center.z;
        model.position.y = baseY;

        // Save true calculated Y for animation
        model.userData.baseY = baseY;

        // ── Shadows ──
        model.traverse((node) => {
            if (node.isMesh) {
                node.castShadow    = true;
                node.receiveShadow = true;
            }
        });

        scene.add(model);

        // ── GLTF animations ────────────────────────────────────────────────
        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            gltf.animations.forEach(clip => mixer.clipAction(clip).play());
        }

        // ── Raycasting (per-frame updater) ─────────────────────────────────
        tick = initInteractions(camera, model);

        // ── Reveal ─────────────────────────────────────────────────────────
        loaderEl.classList.add('fade-out');
        loaderEl.addEventListener('transitionend', () => {
            loaderEl.style.display = 'none';
        }, { once: true });

    } catch (err) {
        console.error('Scene load failed:', err);
        loaderText.textContent = 'Failed to load scene.';
    }
}

// ── Animate ──────────────────────────────────────────────────────────────────
function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    const t     = clock.elapsedTime;

    if (mixer) mixer.update(delta);

    // Gentle idle float — only floats UP from the base surface, preventing floor clipping
    if (model) {
        // Math.abs ensures it never dips below the floor (baseY)
        model.position.y = model.userData.baseY + Math.abs(Math.sin(t * 0.5)) * 0.08;
    }

    tick();          // hover raycasting
    controls.update();
    composer.render();
}

// ── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => onResize(camera, renderer, composer, bloom));

// ── Go ───────────────────────────────────────────────────────────────────────
init();
animate();
