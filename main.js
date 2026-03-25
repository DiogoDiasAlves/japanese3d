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

        // ── Auto-fit to the 8-unit stone platform ──────────────────────────
        const box    = new THREE.Box3().setFromObject(model);
        const size   = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const sc     = 10 / Math.max(size.x, size.y, size.z);

        model.scale.setScalar(sc);
        // Sit the model ON the stone platform (y ≈ 0.35)
        model.position.set(
            -center.x * sc,
            0.35 - (box.min.y * sc),
            -center.z * sc
        );

        // Enable shadows on all meshes
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

    // Gentle idle float — just 4 cm travel
    if (model) model.position.y = 0.35 + Math.sin(t * 0.5) * 0.04;

    tick();          // hover raycasting
    controls.update();
    composer.render();
}

// ── Resize ───────────────────────────────────────────────────────────────────
window.addEventListener('resize', () => onResize(camera, renderer, composer, bloom));

// ── Go ───────────────────────────────────────────────────────────────────────
init();
animate();
