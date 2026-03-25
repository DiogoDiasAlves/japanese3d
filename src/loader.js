import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';

// Shared singleton loader
const draco = new DRACOLoader();
draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
draco.preload();

const gltfLoader = new GLTFLoader();
gltfLoader.setDRACOLoader(draco);

export function loadModel(url, onProgress) {
    return new Promise((resolve, reject) => {
        gltfLoader.load(url, resolve, onProgress, reject);
    });
}

export function loadMainEnvironment(onProgress) {
    // LittlestTokyo – iconic high-quality stylized miniature scene
    return loadModel(
        'https://threejs.org/examples/models/gltf/LittlestTokyo.glb',
        onProgress
    );
}
