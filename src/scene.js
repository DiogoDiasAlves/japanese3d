import * as THREE from 'three';
import { RGBELoader } from 'three/examples/jsm/loaders/RGBELoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

export function createScene() {
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a12);
    // Tight fog to frame the small diorama
    scene.fog = new THREE.FogExp2(0x0a0a12, 0.022);
    return scene;
}

export function createCamera() {
    const cam = new THREE.PerspectiveCamera(
        42,
        window.innerWidth / window.innerHeight,
        0.1,
        200
    );
    cam.position.set(14, 12, 14);
    return cam;
}

export function createRenderer(canvas) {
    const renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,         // Composer handles AA via FXAA-like pass
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    return renderer;
}

export function setupLighting(scene) {
    // 1 – Soft sky fill (hemisphere, zero shadow cost)
    const hemi = new THREE.HemisphereLight(0xffe8cc, 0x223344, 0.55);
    scene.add(hemi);

    // 2 – Single warm sun (the ONLY shadow caster)
    const sun = new THREE.DirectionalLight(0xffddaa, 2.2);
    sun.position.set(6, 15, 8);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);   // reduced from 2048/4096
    sun.shadow.camera.left   = -14;
    sun.shadow.camera.right  =  14;
    sun.shadow.camera.top    =  14;
    sun.shadow.camera.bottom = -14;
    sun.shadow.camera.far    =  40;
    sun.shadow.bias = -0.001;
    scene.add(sun);

    // 3 – Very subtle cool fill from opposite side (no shadows)
    const fill = new THREE.DirectionalLight(0x88aaff, 0.3);
    fill.position.set(-6, 5, -8);
    scene.add(fill);

    return { sun };
}

export function loadHDRI(scene) {
    const loader = new RGBELoader();
    loader.load(
        'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr',
        (tex) => {
            tex.mapping = THREE.EquirectangularReflectionMapping;
            scene.environment = tex;    // PBR material reflections only
        }
    );
}

export function buildComposer(renderer, scene, camera) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    // Gentle bloom – just enough for the lantern glows
    const bloom = new UnrealBloomPass(
        new THREE.Vector2(w, h),
        0.3,   // strength
        0.4,   // radius
        0.9    // threshold – high so only true emissives bloom
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    return { composer, bloom };
}

export function onResize(camera, renderer, composer, bloom) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    composer.setSize(w, h);
    bloom.setSize(w, h);
}
